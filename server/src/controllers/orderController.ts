import { Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JG-2026-${rand}`;
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  const db = await getDb();
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      district,
      area,
      full_address,
      notes,
      payment_method, // 'cod' | 'bkash' | 'nagad'
      coupon_code,
      bkash_transaction_id,
      nagad_transaction_id,
      items, // array of { product_id, variant_id, quantity }
    } = req.body;

    // 1. Validate required fields
    if (!customer_name || !customer_phone || !district || !area || !full_address) {
      res.status(400).json({ error: 'Please provide full name, phone number, district, area, and delivery address.' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Your cart is empty. Please select shoes to purchase.' });
      return;
    }

    // 2. Validate Bangladeshi phone number
    const cleanPhone = customer_phone.trim().replace(/^(\+880|880)/, '0');
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      res.status(400).json({ error: 'Please provide a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).' });
      return;
    }

    // 3. Validate payment method
    if (!['cod', 'bkash', 'nagad'].includes(payment_method)) {
      res.status(400).json({ error: 'Invalid payment method selected. Please choose Cash on Delivery, bKash, or Nagad.' });
      return;
    }

    if (payment_method === 'bkash' && !bkash_transaction_id) {
      res.status(400).json({ error: 'Please enter your bKash Transaction ID (TrxID).' });
      return;
    }

    if (payment_method === 'nagad' && !nagad_transaction_id) {
      res.status(400).json({ error: 'Please enter your Nagad Transaction ID.' });
      return;
    }

    // 4. Begin Transaction for atomic stock validation & order creation
    await db.run('BEGIN TRANSACTION');

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      if (!item.variant_id || !item.quantity || item.quantity <= 0) {
        await db.run('ROLLBACK');
        res.status(400).json({ error: 'Invalid item or quantity in order.' });
        return;
      }

      // Fetch variant with product details
      const variant = await db.get(
        `SELECT 
          pv.id as variant_id,
          pv.size,
          pv.color,
          pv.stock_quantity,
          pv.additional_price,
          p.id as product_id,
          p.name as product_name,
          p.sale_price,
          p.is_active,
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        WHERE pv.id = ?`,
        [item.variant_id]
      );

      if (!variant) {
        await db.run('ROLLBACK');
        res.status(404).json({ error: `Selected shoe variant does not exist.` });
        return;
      }

      if (!variant.is_active) {
        await db.run('ROLLBACK');
        res.status(400).json({ error: `The shoe "${variant.product_name}" is currently unavailable.` });
        return;
      }

      // Prevent overselling: check inventory!
      if (variant.stock_quantity < item.quantity) {
        await db.run('ROLLBACK');
        res.status(400).json({
          error: `Insufficient stock for ${variant.product_name} (Size: ${variant.size}, Color: ${variant.color}). Only ${variant.stock_quantity} pairs remaining in inventory.`,
        });
        return;
      }

      const unitPrice = variant.sale_price + (variant.additional_price || 0);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        variant_id: variant.variant_id,
        product_id: variant.product_id,
        product_name: variant.product_name,
        product_image: variant.primary_image || '',
        size: variant.size,
        color: variant.color,
        price: unitPrice,
        quantity: item.quantity,
        total: lineTotal,
      });
    }

    // 5. Calculate Delivery Fee based on District
    const deliverySettings = await db.get('SELECT * FROM delivery_settings WHERE id = 1');
    const isDhaka = district.trim().toLowerCase().includes('dhaka');
    let delivery_fee = isDhaka
      ? (deliverySettings?.inside_dhaka_fee ?? 80)
      : (deliverySettings?.outside_dhaka_fee ?? 150);

    // Free delivery check
    if (deliverySettings?.free_delivery_threshold && subtotal >= deliverySettings.free_delivery_threshold) {
      delivery_fee = 0;
    }

    // 6. Calculate Coupon Discount on server
    let discount = 0;
    let validCouponCode: string | null = null;

    if (coupon_code) {
      const coupon = await db.get(
        `SELECT * FROM coupons 
         WHERE code = ? AND is_active = 1
         AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
         AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [coupon_code.trim().toUpperCase()]
      );

      if (coupon) {
        if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
              discount = coupon.max_discount_amount;
            }
          } else {
            discount = coupon.discount_value;
          }
          discount = Math.min(discount, subtotal);
          validCouponCode = coupon.code;

          // Increment coupon used count
          await db.run('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
        }
      }
    }

    const total_amount = Math.max(0, subtotal + delivery_fee - discount);
    const order_number = generateOrderNumber();
    const customer_id = req.user ? req.user.id : null;

    // 7. Insert Order
    const orderResult = await db.run(
      `INSERT INTO orders (
        order_number, customer_id, customer_name, customer_phone, customer_email,
        district, area, full_address, notes, payment_method, payment_status,
        order_status, subtotal, delivery_fee, discount, coupon_code, total_amount,
        bkash_transaction_id, nagad_transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        customer_id,
        customer_name.trim(),
        cleanPhone,
        customer_email ? customer_email.trim() : null,
        district.trim(),
        area.trim(),
        full_address.trim(),
        notes ? notes.trim() : null,
        payment_method,
        payment_method === 'cod' ? 'unpaid' : 'paid',
        subtotal,
        delivery_fee,
        discount,
        validCouponCode,
        total_amount,
        bkash_transaction_id ? bkash_transaction_id.trim() : null,
        nagad_transaction_id ? nagad_transaction_id.trim() : null,
      ]
    );

    const orderId = orderResult.lastID as number;

    // 8. Insert Order Items and Atomically Decrement Inventory
    for (const it of validatedItems) {
      await db.run(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, product_name, product_image,
          size, color, price, quantity, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.product_id,
          it.variant_id,
          it.product_name,
          it.product_image,
          it.size,
          it.color,
          it.price,
          it.quantity,
          it.total,
        ]
      );

      // Decrement inventory safely
      await db.run(
        `UPDATE product_variants 
         SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [it.quantity, it.variant_id]
      );
    }

    await db.run('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number,
        total_amount,
        subtotal,
        delivery_fee,
        discount,
        payment_method,
        order_status: 'pending',
        customer_name,
        customer_phone: cleanPhone,
        district,
        area,
        full_address,
        items: validatedItems,
      },
    });
  } catch (err: any) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
}

export async function getOrderDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { identifier } = req.params; // Can be order_number (e.g. JG-2026-XXXXX) or id
    const { phone } = req.query; // Optional phone check for tracking
    const db = await getDb();

    let query = `
      SELECT o.*
      FROM orders o
      WHERE (o.order_number = ? OR o.id = ?)
    `;
    const params: any[] = [identifier, identifier];

    if (phone) {
      query += ` AND o.customer_phone LIKE ?`;
      params.push(`%${String(phone).slice(-8)}%`);
    }

    const order = await db.get(query, params);

    if (!order) {
      res.status(404).json({ error: 'Order not found. Please verify the order number and mobile number.' });
      return;
    }

    // Attach items
    order.items = await db.all(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order.id]
    );

    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch order details' });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = await getDb();
    const orders = await db.all(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT product_image FROM order_items WHERE order_id = o.id LIMIT 1) as thumbnail
       FROM orders o
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      order.items = await db.all(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [order.id]
      );
    }

    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch customer orders' });
  }
}

export async function getAllOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const {
      status,
      payment_status,
      search,
      page = 1,
      limit = 15,
    } = req.query;

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (status && status !== 'all') {
      whereClauses.push('o.order_status = ?');
      params.push(status);
    }

    if (payment_status && payment_status !== 'all') {
      whereClauses.push('o.payment_status = ?');
      params.push(payment_status);
    }

    if (search) {
      whereClauses.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countResult = await db.get(`SELECT COUNT(*) as total FROM orders o ${whereSql}`, params);
    const total = countResult ? countResult.total : 0;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const orders = await db.all(
      `SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       ${whereSql}
       ORDER BY o.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    for (const order of orders) {
      order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch all orders' });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  const db = await getDb();
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (order_status && !validStatuses.includes(order_status)) {
      res.status(400).json({ error: 'Invalid order status value.' });
      return;
    }

    const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await db.run('BEGIN TRANSACTION');

    // If order is changing to 'cancelled' or 'returned' from an active status, restore variant inventory!
    const wasActive = !['cancelled', 'returned'].includes(order.order_status);
    const nowInactive = ['cancelled', 'returned'].includes(order_status);

    if (wasActive && nowInactive) {
      const items = await db.all('SELECT variant_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        if (item.variant_id) {
          await db.run(
            `UPDATE product_variants 
             SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [item.quantity, item.variant_id]
          );
        }
      }
    }

    // If order was cancelled/returned and admin reactivates it, re-decrement stock!
    const wasInactive = ['cancelled', 'returned'].includes(order.order_status);
    const nowActive = order_status && !['cancelled', 'returned'].includes(order_status);

    if (wasInactive && nowActive) {
      const items = await db.all('SELECT variant_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        if (item.variant_id) {
          await db.run(
            `UPDATE product_variants 
             SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [item.quantity, item.variant_id]
          );
        }
      }
    }

    await db.run(
      `UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [order_status || null, payment_status || null, id]
    );

    await db.run('COMMIT');

    res.json({ message: 'Order status updated successfully!' });
  } catch (err: any) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
}

import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Please enter a coupon code.' });
      return;
    }

    const db = await getDb();
    const coupon = await db.get(
      `SELECT * FROM coupons 
       WHERE code = ? AND is_active = 1
       AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
       AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)`,
      [code.trim().toUpperCase()]
    );

    if (!coupon) {
      res.status(404).json({ error: 'Invalid or expired coupon code.' });
      return;
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      res.status(400).json({ error: 'This coupon has reached its maximum usage limit.' });
      return;
    }

    const subtotalNum = Number(subtotal);
    if (coupon.min_order_amount && subtotalNum < coupon.min_order_amount) {
      res.status(400).json({
        error: `Minimum order amount of ৳${coupon.min_order_amount} required to use coupon ${coupon.code}.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotalNum * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }
    discount = Math.min(discount, subtotalNum);

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      calculated_discount: discount,
      message: `Coupon "${coupon.code}" applied! You saved ৳${discount}.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to validate coupon' });
  }
}

export async function getCoupons(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const coupons = await db.all('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ coupons });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch coupons' });
  }
}

export async function createCoupon(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount = 0,
      max_discount_amount,
      valid_from,
      valid_until,
      usage_limit = 1000,
      is_active = 1,
    } = req.body;

    if (!code || !discount_type || discount_value === undefined) {
      res.status(400).json({ error: 'Code, discount type, and discount value are required.' });
      return;
    }

    const db = await getDb();
    const cleanCode = code.trim().toUpperCase();

    const existing = await db.get('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing) {
      res.status(409).json({ error: 'A coupon with this code already exists.' });
      return;
    }

    const result = await db.run(
      `INSERT INTO coupons (
        code, discount_type, discount_value, min_order_amount,
        max_discount_amount, valid_from, valid_until, usage_limit, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        discount_type,
        Number(discount_value),
        Number(min_order_amount),
        max_discount_amount ? Number(max_discount_amount) : null,
        valid_from || null,
        valid_until || null,
        Number(usage_limit),
        is_active ? 1 : 0,
      ]
    );

    res.status(201).json({
      message: 'Coupon created successfully!',
      coupon: { id: result.lastID, code: cleanCode },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create coupon' });
  }
}

export async function updateCoupon(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      valid_from,
      valid_until,
      usage_limit,
      is_active,
    } = req.body;

    const db = await getDb();
    await db.run(
      `UPDATE coupons SET
        discount_type = COALESCE(?, discount_type),
        discount_value = COALESCE(?, discount_value),
        min_order_amount = COALESCE(?, min_order_amount),
        max_discount_amount = ?,
        valid_from = ?,
        valid_until = ?,
        usage_limit = COALESCE(?, usage_limit),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        discount_type || null,
        discount_value !== undefined ? Number(discount_value) : null,
        min_order_amount !== undefined ? Number(min_order_amount) : null,
        max_discount_amount ? Number(max_discount_amount) : null,
        valid_from || null,
        valid_until || null,
        usage_limit !== undefined ? Number(usage_limit) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    res.json({ message: 'Coupon updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update coupon' });
  }
}

export async function deleteCoupon(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ message: 'Coupon deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete coupon' });
  }
}

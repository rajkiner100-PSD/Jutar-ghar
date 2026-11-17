import { Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();

    // 1. Total Orders & Revenue
    const orderStats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN order_status NOT IN ('cancelled', 'returned') THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END), 0) as pending_orders,
        COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered_orders
      FROM orders
    `);

    // 2. Total Products & Active Products
    const productStats = await db.get(`
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) as active_products
      FROM products
    `);

    // 3. Total Customers
    const customerStats = await db.get(`
      SELECT COUNT(*) as total_customers 
      FROM users 
      WHERE role = 'customer'
    `);

    // 4. Low stock variants (< 5 units)
    const lowStockVariants = await db.all(`
      SELECT 
        pv.id,
        pv.product_id,
        pv.size,
        pv.color,
        pv.sku,
        pv.stock_quantity,
        p.name as product_name,
        p.slug as product_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as product_image
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.stock_quantity <= 5 AND p.is_active = 1
      ORDER BY pv.stock_quantity ASC
      LIMIT 10
    `);

    const lowStockCountResult = await db.get(`
      SELECT COUNT(*) as count 
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.stock_quantity <= 5 AND p.is_active = 1
    `);

    // 5. Recent 6 Orders
    const recentOrders = await db.all(`
      SELECT 
        id, order_number, customer_name, customer_phone, district, 
        payment_method, payment_status, order_status, total_amount, created_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id) as items_count
      FROM orders
      ORDER BY id DESC
      LIMIT 6
    `);

    // 6. Orders by Status
    const ordersByStatus = await db.all(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `);

    // 7. Sales by Category
    const categorySales = await db.all(`
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT oi.order_id) as order_count,
        COALESCE(SUM(oi.total), 0) as total_sales
      FROM categories c
      JOIN products p ON p.category_id = c.id
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status NOT IN ('cancelled', 'returned')
      GROUP BY c.id
      ORDER BY total_sales DESC
      LIMIT 5
    `);

    res.json({
      metrics: {
        total_orders: orderStats?.total_orders || 0,
        total_revenue: orderStats?.total_revenue || 0,
        pending_orders: orderStats?.pending_orders || 0,
        delivered_orders: orderStats?.delivered_orders || 0,
        total_products: productStats?.total_products || 0,
        active_products: productStats?.active_products || 0,
        total_customers: customerStats?.total_customers || 0,
        low_stock_count: lowStockCountResult?.count || 0,
      },
      low_stock_variants: lowStockVariants,
      recent_orders: recentOrders,
      orders_by_status: ordersByStatus,
      category_sales: categorySales,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin dashboard statistics' });
  }
}

export async function getCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const customers = await db.all(`
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.created_at,
        COUNT(o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled', 'returned') THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON o.customer_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY total_spent DESC, u.created_at DESC
    `);
    res.json({ customers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch customers list' });
  }
}

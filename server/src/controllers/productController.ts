import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const {
      category,
      brand,
      gender,
      search,
      minPrice,
      maxPrice,
      size,
      color,
      is_featured,
      is_trending,
      is_new_arrival,
      sort,
      page = 1,
      limit = 12,
      includeInactive = false,
    } = req.query;

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (includeInactive !== 'true') {
      whereClauses.push('p.is_active = 1');
    }

    if (category) {
      whereClauses.push('(c.slug = ? OR c.id = ?)');
      params.push(category, category);
    }

    if (brand) {
      whereClauses.push('(b.slug = ? OR b.id = ?)');
      params.push(brand, brand);
    }

    if (gender) {
      whereClauses.push('p.gender = ?');
      params.push(gender);
    }

    if (is_featured === 'true' || is_featured === '1') {
      whereClauses.push('p.is_featured = 1');
    }

    if (is_trending === 'true' || is_trending === '1') {
      whereClauses.push('p.is_trending = 1');
    }

    if (is_new_arrival === 'true' || is_new_arrival === '1') {
      whereClauses.push('p.is_new_arrival = 1');
    }

    if (minPrice) {
      whereClauses.push('p.sale_price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      whereClauses.push('p.sale_price <= ?');
      params.push(Number(maxPrice));
    }

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR b.name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (size) {
      whereClauses.push('EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = ? AND pv.stock_quantity > 0)');
      params.push(size);
    }

    if (color) {
      whereClauses.push('EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND LOWER(pv.color) LIKE ?)');
      params.push(`%${String(color).toLowerCase()}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total products matching criteria
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereSql}
    `;
    const countResult = await db.get(countQuery, params);
    const total = countResult ? countResult.total : 0;

    // Sorting
    let orderSql = 'ORDER BY p.id DESC';
    switch (sort) {
      case 'price_asc':
        orderSql = 'ORDER BY p.sale_price ASC';
        break;
      case 'price_desc':
        orderSql = 'ORDER BY p.sale_price DESC';
        break;
      case 'newest':
        orderSql = 'ORDER BY p.created_at DESC';
        break;
      case 'name_asc':
        orderSql = 'ORDER BY p.name ASC';
        break;
      case 'popular':
      default:
        orderSql = 'ORDER BY p.is_featured DESC, p.is_trending DESC, p.id DESC';
        break;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const productsQuery = `
      SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image,
        (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const products = await db.all(productsQuery, [...params, limitNum, offset]);

    // Attach available sizes & images for rich cards
    for (const prod of products) {
      prod.discount_percentage = prod.regular_price > prod.sale_price
        ? Math.round(((prod.regular_price - prod.sale_price) / prod.regular_price) * 100)
        : 0;

      prod.variants = await db.all(
        `SELECT id, product_id, size, color, color_hex, sku, stock_quantity, additional_price 
         FROM product_variants WHERE product_id = ? ORDER BY size ASC, color ASC`,
        [prod.id]
      );
      prod.available_sizes = Array.from(new Set(prod.variants.filter((v: any) => v.stock_quantity > 0).map((v: any) => v.size)));
      prod.available_colors = Array.from(new Set(prod.variants.map((v: any) => v.color)));
    }

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const db = await getDb();

    const product = await db.get(
      `SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        b.logo_url as brand_logo,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ? OR p.id = ?`,
      [slug, slug]
    );

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    product.discount_percentage = product.regular_price > product.sale_price
      ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
      : 0;

    // Fetch Images
    product.images = await db.all(
      `SELECT id, image_url, is_primary, display_order 
       FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC`,
      [product.id]
    );

    // Fetch Variants (Size & Color combinations with stock)
    product.variants = await db.all(
      `SELECT id, size, color, color_hex, sku, stock_quantity, additional_price
       FROM product_variants WHERE product_id = ? ORDER BY size ASC, color ASC`,
      [product.id]
    );

    // Fetch Approved Reviews
    product.reviews = await db.all(
      `SELECT id, user_name, rating, comment, created_at
       FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC`,
      [product.id]
    );

    // Fetch Related Products (same category or brand)
    product.related_products = await db.all(
      `SELECT 
        p.id, p.name, p.slug, p.regular_price, p.sale_price,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE (p.category_id = ? OR p.brand_id = ?) AND p.id != ? AND p.is_active = 1
       LIMIT 4`,
      [product.category_id, product.brand_id, product.id]
    );

    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product details' });
  }
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      sku,
      brand_id,
      category_id,
      regular_price,
      sale_price,
      description,
      short_description,
      gender = 'Unisex',
      is_featured = 0,
      is_trending = 0,
      is_new_arrival = 0,
      is_active = 1,
      images = [],
      variants = [],
    } = req.body;

    if (!name || regular_price === undefined || sale_price === undefined || !description) {
      res.status(400).json({ error: 'Name, regular price, sale price, and description are required.' });
      return;
    }

    const db = await getDb();
    let slug = generateSlug(name);

    // Ensure unique slug
    const existingSlug = await db.get('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    await db.run('BEGIN TRANSACTION');

    const result = await db.run(
      `INSERT INTO products (
        name, slug, sku, brand_id, category_id, regular_price, sale_price,
        description, short_description, gender, is_featured, is_trending,
        is_new_arrival, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        slug,
        sku ? sku.trim() : null,
        brand_id || null,
        category_id || null,
        Number(regular_price),
        Number(sale_price),
        description.trim(),
        short_description ? short_description.trim() : null,
        gender,
        is_featured ? 1 : 0,
        is_trending ? 1 : 0,
        is_new_arrival ? 1 : 0,
        is_active ? 1 : 0,
      ]
    );

    const productId = result.lastID as number;

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = typeof images[i] === 'string' ? { image_url: images[i] } : images[i];
        if (img.image_url) {
          await db.run(
            `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
             VALUES (?, ?, ?, ?)`,
            [productId, img.image_url, i === 0 ? 1 : (img.is_primary ? 1 : 0), i]
          );
        }
      }
    }

    // Insert Variants (Sizes & Colors with Stock)
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (v.size && v.color) {
          const varSku = v.sku || `${sku || slug}-${v.size}-${v.color.replace(/\s+/g, '')}`.toUpperCase();
          await db.run(
            `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, additional_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              String(v.size).trim(),
              String(v.color).trim(),
              v.color_hex || '#000000',
              varSku,
              Number(v.stock_quantity || 0),
              Number(v.additional_price || 0),
            ]
          );
        }
      }
    } else {
      // Default variant if none supplied
      await db.run(
        `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, additional_price)
         VALUES (?, '42', 'Standard', '#000000', ?, 10, 0)`,
        [productId, `${slug}-42-STD`.toUpperCase()]
      );
    }

    await db.run('COMMIT');

    res.status(201).json({
      message: 'Product created successfully!',
      product_id: productId,
      slug,
    });
  } catch (err: any) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      brand_id,
      category_id,
      regular_price,
      sale_price,
      description,
      short_description,
      gender,
      is_featured,
      is_trending,
      is_new_arrival,
      is_active,
      images,
      variants,
    } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT id, slug FROM products WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await db.run('BEGIN TRANSACTION');

    await db.run(
      `UPDATE products SET
        name = COALESCE(?, name),
        sku = COALESCE(?, sku),
        brand_id = ?,
        category_id = ?,
        regular_price = COALESCE(?, regular_price),
        sale_price = COALESCE(?, sale_price),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        gender = COALESCE(?, gender),
        is_featured = COALESCE(?, is_featured),
        is_trending = COALESCE(?, is_trending),
        is_new_arrival = COALESCE(?, is_new_arrival),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        sku ? sku.trim() : null,
        brand_id !== undefined ? brand_id : null,
        category_id !== undefined ? category_id : null,
        regular_price !== undefined ? Number(regular_price) : null,
        sale_price !== undefined ? Number(sale_price) : null,
        description !== undefined ? description.trim() : null,
        short_description !== undefined ? short_description.trim() : null,
        gender || null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_trending !== undefined ? (is_trending ? 1 : 0) : null,
        is_new_arrival !== undefined ? (is_new_arrival ? 1 : 0) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    // Update images if provided
    if (Array.isArray(images)) {
      await db.run('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const img = typeof images[i] === 'string' ? { image_url: images[i] } : images[i];
        if (img.image_url) {
          await db.run(
            `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
             VALUES (?, ?, ?, ?)`,
            [id, img.image_url, i === 0 ? 1 : (img.is_primary ? 1 : 0), i]
          );
        }
      }
    }

    // Update variants if provided
    if (Array.isArray(variants)) {
      await db.run('DELETE FROM product_variants WHERE product_id = ?', [id]);
      for (const v of variants) {
        if (v.size && v.color) {
          await db.run(
            `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, additional_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              String(v.size).trim(),
              String(v.color).trim(),
              v.color_hex || '#000000',
              v.sku || `${existing.slug}-${v.size}-${v.color.replace(/\s+/g, '')}`.toUpperCase(),
              Number(v.stock_quantity || 0),
              Number(v.additional_price || 0),
            ]
          );
        }
      }
    }

    await db.run('COMMIT');

    res.json({ message: 'Product updated successfully!' });
  } catch (err: any) {
    const db = await getDb();
    await db.run('ROLLBACK');
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
}

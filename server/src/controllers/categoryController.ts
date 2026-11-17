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

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const categories = await db.all(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count
       FROM categories c
       ORDER BY c.display_order ASC, c.name ASC`
    );
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
}

export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, image_url, display_order = 0 } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const db = await getDb();
    let slug = generateSlug(name);
    const existing = await db.get('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const result = await db.run(
      `INSERT INTO categories (name, slug, description, image_url, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), slug, description || null, image_url || null, display_order]
    );

    res.status(201).json({
      message: 'Category created successfully!',
      category: { id: result.lastID, name, slug, description, image_url, display_order },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
}

export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, image_url, display_order } = req.body;

    const db = await getDb();
    await db.run(
      `UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [name ? name.trim() : null, description, image_url, display_order, id]
    );

    res.json({ message: 'Category updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update category' });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
}

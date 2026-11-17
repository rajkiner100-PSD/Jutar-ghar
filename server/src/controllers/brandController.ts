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

export async function getBrands(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const brands = await db.all(
      `SELECT b.*, 
        (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND is_active = 1) as product_count
       FROM brands b
       ORDER BY b.name ASC`
    );
    res.json({ brands });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch brands' });
  }
}

export async function createBrand(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, logo_url, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Brand name is required' });
      return;
    }

    const db = await getDb();
    let slug = generateSlug(name);
    const existing = await db.get('SELECT id FROM brands WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const result = await db.run(
      `INSERT INTO brands (name, slug, logo_url, description)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), slug, logo_url || null, description || null]
    );

    res.status(201).json({
      message: 'Brand created successfully!',
      brand: { id: result.lastID, name, slug, logo_url, description },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create brand' });
  }
}

export async function updateBrand(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, logo_url, description } = req.body;

    const db = await getDb();
    await db.run(
      `UPDATE brands SET
        name = COALESCE(?, name),
        logo_url = COALESCE(?, logo_url),
        description = COALESCE(?, description)
       WHERE id = ?`,
      [name ? name.trim() : null, logo_url, description, id]
    );

    res.json({ message: 'Brand updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update brand' });
  }
}

export async function deleteBrand(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM brands WHERE id = ?', [id]);
    res.json({ message: 'Brand deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete brand' });
  }
}

import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export async function getBanners(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const { all } = req.query;
    const where = all === 'true' ? '' : 'WHERE is_active = 1';
    const banners = await db.all(`SELECT * FROM banners ${where} ORDER BY display_order ASC, id DESC`);
    res.json({ banners });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch banners' });
  }
}

export async function createBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, subtitle, badge, image_url, link_url = '/shop', button_text = 'Shop Now', display_order = 0 } = req.body;
    if (!title || !image_url) {
      res.status(400).json({ error: 'Title and image URL are required.' });
      return;
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO banners (title, subtitle, badge, image_url, link_url, button_text, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [title.trim(), subtitle || null, badge || null, image_url.trim(), link_url, button_text, display_order]
    );

    res.status(201).json({
      message: 'Banner created successfully!',
      banner: { id: result.lastID, title, image_url },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create banner' });
  }
}

export async function updateBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, subtitle, badge, image_url, link_url, button_text, display_order, is_active } = req.body;

    const db = await getDb();
    await db.run(
      `UPDATE banners SET
        title = COALESCE(?, title),
        subtitle = COALESCE(?, subtitle),
        badge = COALESCE(?, badge),
        image_url = COALESCE(?, image_url),
        link_url = COALESCE(?, link_url),
        button_text = COALESCE(?, button_text),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        title || null,
        subtitle !== undefined ? subtitle : null,
        badge !== undefined ? badge : null,
        image_url || null,
        link_url || null,
        button_text || null,
        display_order !== undefined ? Number(display_order) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    res.json({ message: 'Banner updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update banner' });
  }
}

export async function deleteBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ message: 'Banner deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete banner' });
  }
}

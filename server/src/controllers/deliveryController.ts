import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export async function getDeliverySettings(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();
    let settings = await db.get('SELECT * FROM delivery_settings WHERE id = 1');
    if (!settings) {
      await db.run(
        `INSERT INTO delivery_settings (id, inside_dhaka_fee, outside_dhaka_fee, free_delivery_threshold)
         VALUES (1, 80, 150, 4000)`
      );
      settings = await db.get('SELECT * FROM delivery_settings WHERE id = 1');
    }
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch delivery settings' });
  }
}

export async function updateDeliverySettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      inside_dhaka_fee,
      outside_dhaka_fee,
      free_delivery_threshold,
      estimated_days_inside_dhaka,
      estimated_days_outside_dhaka,
    } = req.body;

    const db = await getDb();
    await db.run(
      `UPDATE delivery_settings SET
        inside_dhaka_fee = COALESCE(?, inside_dhaka_fee),
        outside_dhaka_fee = COALESCE(?, outside_dhaka_fee),
        free_delivery_threshold = COALESCE(?, free_delivery_threshold),
        estimated_days_inside_dhaka = COALESCE(?, estimated_days_inside_dhaka),
        estimated_days_outside_dhaka = COALESCE(?, estimated_days_outside_dhaka),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        inside_dhaka_fee !== undefined ? Number(inside_dhaka_fee) : null,
        outside_dhaka_fee !== undefined ? Number(outside_dhaka_fee) : null,
        free_delivery_threshold !== undefined ? Number(free_delivery_threshold) : null,
        estimated_days_inside_dhaka || null,
        estimated_days_outside_dhaka || null,
      ]
    );

    res.json({ message: 'Delivery settings updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update delivery settings' });
  }
}

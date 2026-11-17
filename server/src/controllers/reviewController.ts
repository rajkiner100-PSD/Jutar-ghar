import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export async function addReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { product_id, rating, comment, user_name } = req.body;
    if (!product_id || !rating || !comment) {
      res.status(400).json({ error: 'Product ID, rating (1-5), and comment are required.' });
      return;
    }

    const ratingNum = Math.min(5, Math.max(1, Number(rating)));
    const reviewerName = req.user ? req.user.full_name : (user_name ? user_name.trim() : 'Verified Customer');
    const userId = req.user ? req.user.id : null;

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment, is_approved)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [product_id, userId, reviewerName, ratingNum, comment.trim()]
    );

    res.status(201).json({
      message: 'Thank you! Your review has been submitted.',
      review: {
        id: result.lastID,
        product_id,
        user_name: reviewerName,
        rating: ratingNum,
        comment: comment.trim(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit review' });
  }
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const { product_id } = req.params;
    const db = await getDb();
    const reviews = await db.all(
      `SELECT * FROM reviews 
       WHERE product_id = ? AND is_approved = 1 
       ORDER BY created_at DESC`,
      [product_id]
    );
    res.json({ reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
}

export async function getAllReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const reviews = await db.all(
      `SELECT r.*, p.name as product_name
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.id DESC`
    );
    res.json({ reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch all reviews' });
  }
}

export async function toggleReviewApproval(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;
    const db = await getDb();
    await db.run('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, id]);
    res.json({ message: 'Review approval status updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update review status' });
  }
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete review' });
  }
}

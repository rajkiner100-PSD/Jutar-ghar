import { Router } from 'express';
import {
  addReview,
  getReviews,
  getAllReviews,
  toggleReviewApproval,
  deleteReview,
} from '../controllers/reviewController';
import { authenticateToken, optionalToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/', optionalToken, addReview);
router.get('/product/:product_id', getReviews);

// Admin review moderation
router.get('/', authenticateToken, requireAdmin, getAllReviews);
router.put('/:id/approval', authenticateToken, requireAdmin, toggleReviewApproval);
router.delete('/:id', authenticateToken, requireAdmin, deleteReview);

export default router;

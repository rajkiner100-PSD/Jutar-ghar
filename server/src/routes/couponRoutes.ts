import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public coupon verification for cart/checkout
router.post('/validate', validateCoupon);

// Admin coupon management
router.get('/', authenticateToken, requireAdmin, getCoupons);
router.post('/', authenticateToken, requireAdmin, createCoupon);
router.put('/:id', authenticateToken, requireAdmin, updateCoupon);
router.delete('/:id', authenticateToken, requireAdmin, deleteCoupon);

export default router;

import { Router } from 'express';
import {
  createOrder,
  getOrderDetails,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticateToken, optionalToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Order creation (supports logged-in users and guest checkout)
router.post('/', optionalToken, createOrder);

// Order tracking / confirmation details
router.get('/track/:identifier', getOrderDetails);

// Customer my-orders list
router.get('/my-orders', authenticateToken, getMyOrders);

// Admin order routes
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router;

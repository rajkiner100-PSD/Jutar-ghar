import { Router } from 'express';
import {
  getDeliverySettings,
  updateDeliverySettings,
} from '../controllers/deliveryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getDeliverySettings);
router.put('/', authenticateToken, requireAdmin, updateDeliverySettings);

export default router;

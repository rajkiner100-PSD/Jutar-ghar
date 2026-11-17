import { Router } from 'express';
import { getDashboardStats, getCustomers } from '../controllers/adminController';
import { handleUpload, upload } from '../controllers/uploadController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/customers', getCustomers);
router.post('/upload', upload.single('image'), handleUpload);

export default router;

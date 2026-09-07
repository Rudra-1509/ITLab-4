import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../../../../shared/auth/jwt.js';

const router = Router();

router.use(authenticateToken);
router.get('/', NotificationController.getUserNotifications);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;

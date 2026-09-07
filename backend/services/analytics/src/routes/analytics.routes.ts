import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticateToken, requireRole } from '../../../../shared/auth/jwt.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ORGANIZER', 'ADMIN']));

router.get('/overview', AnalyticsController.getOverview);
router.get('/events', AnalyticsController.getEventAnalytics);
router.get('/revenue', AnalyticsController.getRevenueAnalytics);

export default router;

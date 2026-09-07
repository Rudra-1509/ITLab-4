import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller.js';

const router = Router();

router.get('/:eventId', PricingController.getEventPrice);

export default router;

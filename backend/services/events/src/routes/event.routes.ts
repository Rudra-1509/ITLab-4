import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authenticateToken, requireRole } from '../../../../shared/auth/jwt.js';

const router = Router();

router.get('/', EventController.getEvents);
router.get('/:eventId', EventController.getEventById);
router.get('/:eventId/seats', EventController.getEventSeats);

router.post('/', authenticateToken, requireRole(['ORGANIZER', 'ADMIN']), EventController.createEvent);
router.put('/:eventId', authenticateToken, requireRole(['ORGANIZER', 'ADMIN']), EventController.updateEvent);
router.delete('/:eventId', authenticateToken, requireRole(['ORGANIZER', 'ADMIN']), EventController.deleteEvent);

export default router;

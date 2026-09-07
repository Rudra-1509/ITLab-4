import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../../../../shared/auth/jwt.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.getMe);
router.get('/sessions', authenticateToken, AuthController.getSessions);
router.delete('/sessions/:sessionId', authenticateToken, AuthController.revokeSession);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/logout-all', authenticateToken, AuthController.logoutAll);

export default router;

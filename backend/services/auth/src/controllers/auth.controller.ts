import { Request, Response, NextFunction } from 'express';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema.js';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../../../../shared/auth/jwt.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RegisterSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const result = await AuthService.register(validated, userAgent);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const result = await AuthService.login(validated, userAgent);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getMe(req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await AuthService.getSessions(req.user!.userId, req.user!.sessionId);
      res.status(200).json({ sessions });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const result = await AuthService.revokeSession(req.user!.userId, sessionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.revokeSession(req.user!.userId, req.user!.sessionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.revokeAllSessions(req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, Role } from '../types/index.js';
import { UnauthorizedError, ForbiddenError } from '../errors/custom-error.js';
import { prisma } from '../prisma/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN');
  }
};

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify session state in DB
    const session = await prisma.userSession.findUnique({
      where: { id: decoded.sessionId }
    });

    if (!session || session.revoked) {
      throw new UnauthorizedError('Session has been revoked or expired', 'SESSION_REVOKED');
    }

    // Touch lastActive timestamp asynchronously without blocking
    prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    }).catch(() => {});

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated', 'UNAUTHENTICATED'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action', 'PERMISSION_DENIED'));
    }
    next();
  };
};

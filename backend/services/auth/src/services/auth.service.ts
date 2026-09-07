import bcrypt from 'bcryptjs';
import { prisma } from '../../../../shared/prisma/client.js';
import { signToken } from '../../../../shared/auth/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../../../shared/errors/custom-error.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { publishEvent } from '../../../../shared/events/stream.js';

export class AuthService {
  static async register(input: RegisterInput, userAgent?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existing) {
      throw new ConflictError('User with this email already exists', 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role
      }
    });

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        userAgent: userAgent || 'Unknown Browser',
        deviceName: this.extractDeviceName(userAgent)
      }
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id
    });

    // Publish event
    await publishEvent('USER_REGISTERED', 'auth-service', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  static async login(input: LoginInput, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Create new session for multi-device login without invalidating prior sessions
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        userAgent: userAgent || 'Unknown Browser',
        deviceName: this.extractDeviceName(userAgent)
      }
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id
    });

    return {
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return { user };
  }

  static async getSessions(userId: string, currentSessionId: string) {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' }
    });

    return sessions.map((s: any) => ({
      id: s.id,
      deviceName: s.deviceName,
      userAgent: s.userAgent,
      loginTime: s.loginTime,
      lastActive: s.lastActive,
      revoked: s.revoked,
      isCurrent: s.id === currentSessionId
    }));
  }

  static async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new NotFoundError('Session not found', 'SESSION_NOT_FOUND');
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { revoked: true }
    });

    return { message: 'Session revoked successfully' };
  }

  static async revokeAllSessions(userId: string) {
    await prisma.userSession.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true }
    });

    return { message: 'All sessions revoked successfully' };
  }

  private static extractDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Desktop Application';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile Device';
    }
    if (userAgent.includes('Chrome')) return 'Chrome Web Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Web Browser';
    if (userAgent.includes('Safari')) return 'Safari Web Browser';
    return 'Desktop Computer';
  }
}

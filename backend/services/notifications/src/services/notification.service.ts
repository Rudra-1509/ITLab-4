import { prisma } from '../../../../shared/prisma/client.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/errors/custom-error.js';

export class NotificationService {
  static async getUserNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return { notifications, unreadCount };
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError('You do not own this notification', 'UNAUTHORIZED_NOTIFICATION');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return { notification: updated };
  }
}

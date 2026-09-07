import { redis } from '../../../../shared/redis/client.js';
import {
  STREAM_NAME,
  setupConsumerGroup,
  isEventProcessed,
  markEventProcessed
} from '../../../../shared/events/stream.js';
import { prisma } from '../../../../shared/prisma/client.js';

const CONSUMER_GROUP = 'notification-group';
const CONSUMER_NAME = 'notification-worker-1';

export class NotificationConsumer {
  private static isRunning = false;

  static async startConsumer() {
    if (this.isRunning) return;
    this.isRunning = true;

    await setupConsumerGroup(CONSUMER_GROUP);
    this.consumeLoop();
  }

  private static async consumeLoop() {
    while (this.isRunning) {
      try {
        const response = await (redis as any).xreadgroup(
          'GROUP', CONSUMER_GROUP, CONSUMER_NAME,
          'BLOCK', '2000',
          'COUNT', '10',
          'STREAMS', STREAM_NAME, '>'
        );

        if (!response || !response.length) {
          continue;
        }

        const [stream, messages] = response[0];
        for (const message of messages) {
          const messageId = message[0];
          const fields = message[1];

          const eventData: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            eventData[fields[i]] = fields[i + 1];
          }

          const { event_id, event_type, payload: payloadStr } = eventData;
          const payload = payloadStr ? JSON.parse(payloadStr) : {};

          // Check Idempotency
          const alreadyProcessed = await isEventProcessed(event_id, 'notification-service');
          if (alreadyProcessed) {
            await redis.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
            continue;
          }

          // Generate Notification
          await this.createNotificationFromEvent(event_type, payload);

          // Mark processed & ACK
          await markEventProcessed(event_id, 'notification-service');
          await redis.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
        }
      } catch (error) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  private static async createNotificationFromEvent(eventType: string, payload: Record<string, any>) {
    if (!payload.userId) return;

    let title = '';
    let message = '';

    if (eventType === 'BOOKING_CONFIRMED') {
      title = 'Booking Confirmed';
      message = `Your ticket booking for "${payload.eventTitle || 'Event'}" has been confirmed! Total paid: ₹${payload.totalAmount || 0}.`;
    } else if (eventType === 'BOOKING_CANCELLED') {
      title = 'Booking Cancelled';
      message = `Your booking for event ID ${payload.eventId || ''} has been cancelled.`;
    } else if (eventType === 'TICKET_GENERATED') {
      title = 'Ticket Generated';
      message = `Your official ticket (Code: ${payload.ticketCode}) is now available in your account.`;
    } else {
      return;
    }

    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title,
        message,
        type: eventType,
        read: false
      }
    });
  }

  static stop() {
    this.isRunning = false;
  }
}

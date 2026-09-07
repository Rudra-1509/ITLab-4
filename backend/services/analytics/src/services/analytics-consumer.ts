import { redis } from '../../../../shared/redis/client.js';
import {
  STREAM_NAME,
  setupConsumerGroup,
  isEventProcessed,
  markEventProcessed
} from '../../../../shared/events/stream.js';
import { prisma } from '../../../../shared/prisma/client.js';

const CONSUMER_GROUP = 'analytics-group';
const CONSUMER_NAME = 'analytics-worker-1';

export class AnalyticsConsumer {
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

          // Parse field key-value pairs
          const eventData: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            eventData[fields[i]] = fields[i + 1];
          }

          const { event_id, event_type, payload: payloadStr } = eventData;
          const payload = payloadStr ? JSON.parse(payloadStr) : {};

          // Check Idempotency
          const alreadyProcessed = await isEventProcessed(event_id, 'analytics-service');
          if (alreadyProcessed) {
            await redis.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
            continue;
          }

          // Process Analytics Event
          await this.processEvent(event_id, event_type, payload);

          // Mark processed & ACK
          await markEventProcessed(event_id, 'analytics-service');
          await redis.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
        }
      } catch (error) {
        // Log & sleep briefly to avoid spin loop on error
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  private static async processEvent(eventId: string, eventType: string, payload: Record<string, any>) {
    if (['BOOKING_CREATED', 'PAYMENT_SUCCEEDED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED'].includes(eventType)) {
      await prisma.analyticsEvent.create({
        data: {
          eventId: payload.eventId || null,
          userId: payload.userId || null,
          eventType,
          amount: payload.totalAmount || payload.amount || 0,
          metadata: payload
        }
      });
    }
  }

  static stop() {
    this.isRunning = false;
  }
}

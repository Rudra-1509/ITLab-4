import { redis } from '../redis/client.js';
import { StreamEvent, EventType } from '../types/index.js';
import { prisma } from '../prisma/client.js';
import { randomUUID } from 'crypto';

export const STREAM_NAME = 'ticketing.events';

export const publishEvent = async (
  eventType: EventType,
  producer: string,
  payload: Record<string, any>
): Promise<string> => {
  const event: StreamEvent = {
    event_id: randomUUID(),
    event_type: eventType,
    timestamp: new Date().toISOString(),
    producer,
    payload
  };

  try {
    const messageId = await redis.xadd(
      STREAM_NAME,
      '*',
      'event_id', event.event_id,
      'event_type', event.event_type,
      'timestamp', event.timestamp,
      'producer', event.producer,
      'payload', JSON.stringify(event.payload)
    );
    return messageId || '';
  } catch (error) {
    console.error(`Failed to publish event ${eventType} to Redis Stream:`, error);
    return '';
  }
};

export const setupConsumerGroup = async (groupName: string) => {
  try {
    await redis.xgroup('CREATE', STREAM_NAME, groupName, '0', 'MKSTREAM');
  } catch (error: any) {
    if (!error.message.includes('BUSYGROUP')) {
      console.error(`Error creating consumer group ${groupName}:`, error);
    }
  }
};

export const isEventProcessed = async (eventId: string, consumer: string): Promise<boolean> => {
  const existing = await prisma.processedEvent.findUnique({
    where: {
      eventId_consumer: {
        eventId,
        consumer
      }
    }
  });
  return !!existing;
};

export const markEventProcessed = async (eventId: string, consumer: string): Promise<void> => {
  await prisma.processedEvent.create({
    data: {
      eventId,
      consumer
    }
  });
};

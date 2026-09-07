import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisClient = () => {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 2000);
      return delay;
    },
    lazyConnect: true
  });
  client.on('error', () => {
    // Silent log or graceful handle for local dev / tests
  });
  return client;
};

let internalClient = createRedisClient();

export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop) {
    if (prop === 'quit' || prop === 'disconnect') {
      return (...args: any[]) => (internalClient as any)[prop](...args);
    }
    if (internalClient.status === 'end') {
      internalClient = createRedisClient();
    }
    const val = (internalClient as any)[prop];
    return typeof val === 'function' ? val.bind(internalClient) : val;
  }
});

export const disconnectRedis = async (): Promise<void> => {
  if (internalClient.status !== 'end') {
    await internalClient.quit().catch(() => internalClient.disconnect());
  }
};

export const getSeatLockKey = (eventId: string, seatId: string): string => {
  return `seat_lock:${eventId}:${seatId}`;
};


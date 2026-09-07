import request from 'supertest';
import pricingApp from '../services/pricing/src/index.js';
import gatewayApp from '../gateway/src/index.js';
import { disconnectRedis } from '../shared/redis/client.js';
import { prisma } from '../shared/prisma/client.js';
import { Server } from 'http';

describe('PRICING ALGORITHM & SYSTEM HEALTH TESTS', () => {
  let server: Server;

  beforeAll((done) => {
    server = gatewayApp.listen(0, done);
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectRedis();
    await prisma.$disconnect();
  });

  it('should respond to GET /health on pricing service', async () => {
    const res = await request(pricingApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: 'pricing-service', status: 'healthy' });
  });

  it('should respond to GET /api/health on gateway', async () => {
    const res = await request(server).get('/api/health').set('Connection', 'close');
    expect(res.status).toBe(200);
    expect(res.body.gateway).toBe('healthy');
    expect(res.body.services).toBeDefined();
  });
});


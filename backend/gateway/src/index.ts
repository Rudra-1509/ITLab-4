import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import { swaggerDocument } from './swagger.js';
import { createProxyHandler, serviceTargets } from './routes.js';
import { redis } from '../../shared/redis/client.js';
import { prisma } from '../../shared/prisma/client.js';
import { errorHandler } from '../../shared/errors/custom-error.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (!req.path.startsWith('/docs')) {
    console.log(`[GATEWAY] ${req.method} ${req.path}`);
  }
  next();
});

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint verifying all microservices, Redis, and Postgres
app.get('/api/health', async (req, res) => {
  const serviceStatuses: Record<string, string> = {
    auth: 'unhealthy',
    events: 'unhealthy',
    booking: 'unhealthy',
    pricing: 'unhealthy',
    analytics: 'unhealthy',
    notifications: 'unhealthy',
    redis: 'unhealthy',
    postgres: 'unhealthy'
  };

  // Helper to ping microservices
  const checkService = async (key: string, url: string) => {
    try {
      const resp = await axios.get(`${url}/health`, {
        timeout: 1000,
        headers: { Connection: 'close' }
      });
      if (resp.status === 200 && resp.data?.status === 'healthy') {
        serviceStatuses[key] = 'healthy';
      }
    } catch (err) {
      serviceStatuses[key] = 'unhealthy';
    }
  };

  await Promise.all([
    checkService('auth', serviceTargets.auth),
    checkService('events', serviceTargets.events),
    checkService('booking', serviceTargets.bookings),
    checkService('pricing', serviceTargets.pricing),
    checkService('analytics', serviceTargets.analytics),
    checkService('notifications', serviceTargets.notifications),
    (async () => {
      try {
        await redis.ping();
        serviceStatuses.redis = 'healthy';
      } catch {
        serviceStatuses.redis = 'unhealthy';
      }
    })(),
    (async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        serviceStatuses.postgres = 'healthy';
      } catch {
        serviceStatuses.postgres = 'unhealthy';
      }
    })()
  ]);

  res.status(200).json({
    gateway: 'healthy',
    services: serviceStatuses
  });
});

// Route proxy definitions
app.use('/api/auth', createProxyHandler(serviceTargets.auth));
app.use('/api/events', createProxyHandler(serviceTargets.events));
app.use('/api/bookings', createProxyHandler(serviceTargets.bookings));
app.use('/api/payments', createProxyHandler(serviceTargets.bookings));
app.use('/api/pricing', createProxyHandler(serviceTargets.pricing));
app.use('/api/tickets', createProxyHandler(serviceTargets.bookings));
app.use('/api/analytics', createProxyHandler(serviceTargets.analytics));
app.use('/api/notifications', createProxyHandler(serviceTargets.notifications));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/docs`);
  });
}

export default app;

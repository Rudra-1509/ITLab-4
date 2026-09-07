import express from 'express';
import cors from 'cors';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from '../../../shared/errors/custom-error.js';
import { AnalyticsConsumer } from './services/analytics-consumer.js';

const app = express();
const PORT = process.env.ANALYTICS_SERVICE_PORT || 8005;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'analytics-service', status: 'healthy' });
});

app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Analytics Service running on port ${PORT}`);
    // Start background Redis Stream consumer loop
    AnalyticsConsumer.startConsumer().catch((err) => {
      console.error('Failed to start Analytics consumer loop:', err);
    });
  });
}

export default app;

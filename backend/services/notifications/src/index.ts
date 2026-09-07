import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from '../../../shared/errors/custom-error.js';
import { NotificationConsumer } from './services/notification-consumer.js';

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 8006;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'notification-service', status: 'healthy' });
});

app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
    NotificationConsumer.startConsumer().catch((err) => {
      console.error('Failed to start Notification consumer loop:', err);
    });
  });
}

export default app;

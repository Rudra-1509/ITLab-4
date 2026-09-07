import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes';
import { errorHandler } from '../../../shared/errors/custom-error.js';

const app = express();
const PORT = process.env.EVENT_SERVICE_PORT || 8002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'event-service', status: 'healthy' });
});

app.use('/api/events', eventRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Event Service running on port ${PORT}`);
  });
}

export default app;

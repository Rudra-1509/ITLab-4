import express from 'express';
import cors from 'cors';
import pricingRoutes from './routes/pricing.routes';
import { errorHandler } from '../../../shared/errors/custom-error.js';

const app = express();
const PORT = process.env.PRICING_SERVICE_PORT || 8004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'pricing-service', status: 'healthy' });
});

app.use('/api/pricing', pricingRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Pricing Service running on port ${PORT}`);
  });
}

export default app;

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { errorHandler } from '../../../shared/errors/custom-error.js';

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 8001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'auth-service', status: 'healthy' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
  });
}

export default app;

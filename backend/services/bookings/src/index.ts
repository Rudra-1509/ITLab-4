import express from 'express';
import cors from 'cors';
import { bookingRouter, paymentRouter, ticketRouter } from './routes/booking.routes';
import { errorHandler } from '../../../shared/errors/custom-error.js';

const app = express();
const PORT = process.env.BOOKING_SERVICE_PORT || 8003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ service: 'booking-service', status: 'healthy' });
});

app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/tickets', ticketRouter);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Booking Service running on port ${PORT}`);
  });
}

export default app;

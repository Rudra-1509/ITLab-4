import { z } from 'zod';

export const LockSeatSchema = z.object({
  eventId: z.string().uuid('Invalid eventId UUID'),
  seatId: z.string().uuid('Invalid seatId UUID'),
});

export const CreateBookingSchema = z.object({
  eventId: z.string().uuid('Invalid eventId UUID'),
  seatIds: z.array(z.string().uuid('Invalid seatId UUID')).min(1, 'At least one seat is required'),
});

export const SimulatePaymentSchema = z.object({
  success: z.boolean(),
});

export type LockSeatInput = z.infer<typeof LockSeatSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type SimulatePaymentInput = z.infer<typeof SimulatePaymentSchema>;

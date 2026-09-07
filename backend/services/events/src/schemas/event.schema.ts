import { z } from 'zod';

export const CreateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['CONCERT', 'THEATER', 'SPORTS']),
  venue: z.string().min(2, 'Venue is required'),
  city: z.string().min(2, 'City is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  totalCapacity: z.number().int().positive().optional().default(50),
  basePrice: z.number().positive('Base price must be positive'),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

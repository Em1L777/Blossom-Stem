// backend/src/utils/orderSchemas.ts
import { z } from 'zod';
import { PaymentMethod, OrderStatus } from '@prisma/client';

export const createOrderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(5, 'Recipient phone is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  aptSuite: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  deliveryNotes: z.string().optional(),
  deliveryDate: z.string().datetime({ message: 'Invalid delivery date format' }),
  timeSlot: z.string().min(1, 'Time slot is required'),
  cardMessage: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
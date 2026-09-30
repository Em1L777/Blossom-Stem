// backend/src/utils/supplySchemas.ts
import { z } from 'zod';

export const createSupplyItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  wholesaleUnitPrice: z.number().positive('Wholesale price must be greater than 0'),
});

export const createSupplyOrderSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  items: z.array(createSupplyItemSchema).min(1, 'Supply order must contain at least one item'),
});

export type CreateSupplyOrderInput = z.infer<typeof createSupplyOrderSchema>;
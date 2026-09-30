// backend/src/utils/catalogSchemas.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  title: z.string().min(2, 'Product title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  wholesalePrice: z.number().positive('Wholesale price must be greater than 0'),
  stockQuantity: z.number().int().nonnegative('Stock quantity cannot be negative'),
  isAddon: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  composition: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL format'),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  isAddon: z.string().transform((val) => val === 'true').optional(),
  search: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
});
// backend/src/services/productsService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export interface ProductQueryParams {
  categoryId?: string;
  isAddon?: boolean;
  search?: string;
  isActive?: boolean;
}

export class ProductsService {
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async getAll(params: ProductQueryParams) {
    const where: Prisma.ProductWhereInput = {};

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.isAddon !== undefined) {
      where.isAddon = params.isAddon;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    } else {
      where.isActive = true; // По умолчанию только активные товары
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { composition: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return product;
  }

  static async create(data: any) {
    const slug = this.slugify(data.title);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw AppError.conflict('Product with this title already exists');
    }

    return prisma.product.create({
      data: {
        ...data,
        slug,
      },
      include: { category: true },
    });
  }

  static async update(id: string, data: any) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    let slug = product.slug;
    if (data.title && data.title !== product.title) {
      slug = this.slugify(data.title);
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: { category: true },
    });
  }

  static async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    // Мягкое удаление (деактивация), чтобы не ломать связь с прошлыми заказами
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
// backend/src/services/productsService.ts
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export class ProductsService {
  static async getAllProducts(query: { categoryId?: string; isAddon?: boolean; search?: string }) {
    const where: any = { isActive: true };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.isAddon !== undefined) {
      where.isAddon = query.isAddon;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { composition: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Поиск по красивому URL (Slug) для страницы товара
  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      throw AppError.notFound(`Product with slug '${slug}' was not found in catalog.`);
    }

    return product;
  }

  // Поиск по UUID для закупщика, корзины или заказов
  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      throw AppError.notFound(`Product with ID '${id}' was not found.`);
    }

    return product;
  }

  static async createProduct(data: any) {
    return prisma.product.create({ data });
  }

  static async updateProduct(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  static async deleteProduct(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
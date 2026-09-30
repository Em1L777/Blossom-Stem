// backend/src/services/categoriesService.ts
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export class CategoriesService {
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async getAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  static async create(data: { name: string; description?: string }) {
    const slug = this.slugify(data.name);

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });

    if (existing) {
      throw AppError.conflict('Category with this name or slug already exists');
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
  }

  static async update(id: string, data: { name?: string; description?: string }) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    let slug = category.slug;
    if (data.name && data.name !== category.name) {
      slug = this.slugify(data.name);
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
  }

  static async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (category._count.products > 0) {
      throw AppError.conflict('Cannot delete category that contains products');
    }

    return prisma.category.delete({ where: { id } });
  }
}
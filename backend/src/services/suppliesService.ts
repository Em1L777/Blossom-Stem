// backend/src/services/suppliesService.ts
import { SupplyStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { CreateSupplyOrderInput } from '../utils/supplySchemas.js';

const LOW_STOCK_THRESHOLD = 5; // Порог критического остатка

export class SuppliesService {
  static async getLowStockProducts() {
    return prisma.product.findMany({
      where: {
        stockQuantity: { lte: LOW_STOCK_THRESHOLD },
        isActive: true,
      },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  static async getSuppliers() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async createSupplyOrder(data: CreateSupplyOrderInput, createdById: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Проверяем существование поставщика
      const supplier = await tx.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) throw AppError.notFound('Supplier not found');

      let totalCost = 0;
      const supplyItemsToCreate: { productId: string; quantity: number; wholesaleUnitPrice: number }[] = [];

      // 2. Обрабатываем позицию закупки и увеличиваем остатки на складе
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw AppError.notFound(`Product with ID ${item.productId} not found`);
        }

        const itemTotal = item.wholesaleUnitPrice * item.quantity;
        totalCost += itemTotal;

        supplyItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          wholesaleUnitPrice: item.wholesaleUnitPrice,
        });

        // Пополняем склад и обновляем закупную оптовую цену в карточке товара
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            wholesalePrice: item.wholesaleUnitPrice,
          },
        });
      }

      // 3. Создаем документ поставки
      const supplyOrder = await tx.supplyOrder.create({
        data: {
          supplierId: data.supplierId,
          createdById,
          totalCost,
          status: SupplyStatus.RECEIVED,
          receivedAt: new Date(),
          items: {
            create: supplyItemsToCreate,
          },
        },
        include: {
          supplier: { select: { name: true, contactPerson: true } },
          createdBy: { select: { firstName: true, lastName: true, role: true } },
          items: {
            include: {
              product: { select: { title: true, imageUrl: true } },
            },
          },
        },
      });

      return supplyOrder;
    });
  }

  static async getAllSupplies() {
    return prisma.supplyOrder.findMany({
      include: {
        supplier: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
// backend/src/services/analyticsService.ts
import { OrderStatus, SupplyStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export class AnalyticsService {
  static async getDashboardMetrics() {
    // 1. Общая выручка со всех активных/завершенных заказов
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = Number(revenueResult._sum.totalAmount || 0);
    const totalOrdersCount = revenueResult._count.id;

    // 2. Общие затраты на оптовые закупки (поставки)
    const supplyCostResult = await prisma.supplyOrder.aggregate({
      where: {
        status: SupplyStatus.RECEIVED,
      },
      _sum: {
        totalCost: true,
      },
    });

    const totalWholesaleCosts = Number(supplyCostResult._sum.totalCost || 0);

    // 3. Чистая прибыль (Gross Profit)
    const grossProfit = totalRevenue - totalWholesaleCosts;

    // 4. Популярные товары (Топ-5 по проданному количеству)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Обогащаем топ-товары названиями
    const topProductsDetailed = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { title: true, imageUrl: true, price: true },
        });
        return {
          productId: item.productId,
          title: product?.title || 'Unknown Product',
          imageUrl: product?.imageUrl || '',
          totalQuantitySold: item._sum.quantity || 0,
        };
      })
    );

    return {
      financials: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalWholesaleCosts: Number(totalWholesaleCosts.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        currency: 'EUR',
      },
      overview: {
        totalOrdersCount,
      },
      topSellingProducts: topProductsDetailed,
    };
  }
}
// backend/src/services/ordersService.ts
import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { CreateOrderInput } from '../utils/orderSchemas.js';

const FIRST_ORDER_DISCOUNT_PERCENT = 10; // 10% скидка на первый заказ

export class OrdersService {
  private static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${year}-${randomHex}`;
  }

  static async createOrder(data: CreateOrderInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate: { productId: string; quantity: number; unitPrice: number }[] = [];

      // 1. Проверяем товары, их наличие и рассчитываем subtotal
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw AppError.notFound(`Product with ID ${item.productId} is not available`);
        }

        if (product.stockQuantity < item.quantity) {
          throw AppError.badRequest(
            `Insufficient stock for product '${product.title}'. Requested: ${item.quantity}, Available: ${product.stockQuantity}`
          );
        }

        const unitPrice = Number(product.price);
        subtotal += unitPrice * item.quantity;

        orderItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
        });

        // Списываем со склада
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // 2. Расчет скидки на первый заказ (для авторизованных клиентов)
      let discountAmount = 0;
      if (userId) {
        const previousOrders = await tx.order.count({
          where: {
            userId,
            status: { not: OrderStatus.CANCELLED },
          },
        });

        if (previousOrders === 0) {
          discountAmount = (subtotal * FIRST_ORDER_DISCOUNT_PERCENT) / 100;
        }
      }

      const totalAmount = subtotal - discountAmount;
      const orderNumber = this.generateOrderNumber();

      // Наглядная симуляция статуса оплаты
      const initialStatus =
        data.paymentMethod === 'ONLINE_MOCK'
          ? OrderStatus.PAID
          : OrderStatus.PENDING;

      // 3. Создаем заказ
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          status: initialStatus,
          paymentMethod: data.paymentMethod,
          isPaid: data.paymentMethod === 'ONLINE_MOCK',
          subtotal,
          discountAmount,
          totalAmount,
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          streetAddress: data.streetAddress,
          aptSuite: data.aptSuite,
          city: data.city,
          postalCode: data.postalCode,
          deliveryNotes: data.deliveryNotes,
          deliveryDate: new Date(data.deliveryDate),
          timeSlot: data.timeSlot,
          cardMessage: data.cardMessage,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true, imageUrl: true, slug: true },
              },
            },
          },
        },
      });

      return order;
    });
  }

  static async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, imageUrl: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getByOrderNumber(orderNumber: string, currentUserId?: string, userRole?: Role) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, imageUrl: true, slug: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw AppError.notFound('Order not found');
    }

    // Если заказ привязан к пользователю, проверяем права доступа (Ownership check)
const staffRoles: Role[] = [Role.ADMIN, Role.OWNER, Role.FLORIST, Role.COURIER];

if (
  order.userId &&
  currentUserId !== order.userId &&
  (!userRole || !staffRoles.includes(userRole))
) {
  throw AppError.forbidden('You do not have permission to view this order');
}

    return order;
  }

  // Florist Workspace: Заказы, требующие сборки
  static async getFloristWorkspaceOrders() {
    return prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.PENDING] },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, composition: true, imageUrl: true } },
          },
        },
      },
      orderBy: { deliveryDate: 'asc' },
    });
  }

  static async assembleOrder(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw AppError.notFound('Order not found');

    return prisma.order.update({
      where: { id },
      data: { status: OrderStatus.ASSEMBLED },
    });
  }

  // Courier Workspace: Заказы, готовые к доставке или в пути
  static async getCourierWorkspaceOrders() {
    return prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.ASSEMBLED, OrderStatus.IN_TRANSIT] },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, imageUrl: true } },
          },
        },
      },
      orderBy: { deliveryDate: 'asc' },
    });
  }

static async updateDeliveryStatus(id: string, status: OrderStatus) {
  const allowedStatuses: OrderStatus[] = [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED];

  if (!allowedStatuses.includes(status)) {
    throw AppError.badRequest('Invalid status update for courier workspace');
  }

  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

  // Admin / Owner: Список всех заказов
  static async getAllOrders() {
    return prisma.order.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, title: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatusByAdmin(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
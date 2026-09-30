// frontend/src/types/index.ts

export type Role = 'CLIENT' | 'FLORIST' | 'COURIER' | 'ADMIN' | 'OWNER';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'READY_FOR_ASSEMBLY'
  | 'ASSEMBLED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'ONLINE_MOCK' | 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string | number;
  wholesalePrice?: string | number;
  stockQuantity: number;
  isAddon: boolean;
  isActive: boolean;
  composition?: string;
  imageUrl: string;
  categoryId: string;
  category?: Category;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  subtotal: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  postalCode: string;
  deliveryNotes?: string;
  deliveryDate: string;
  timeSlot: string;
  cardMessage?: string;
  createdAt: string;
  items: OrderItem[];
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
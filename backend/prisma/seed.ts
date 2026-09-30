// backend/prisma/seed.ts
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Очистка старых данных (для перезапуска сида)
  await prisma.supplyOrderItem.deleteMany();
  await prisma.supplyOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Хэширование дефолтного пароля для пользователей
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 3. Создание пользователей с разными ролями
  const owner = await prisma.user.create({
    data: {
      email: 'owner@blossom.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '+34600000001',
      role: Role.OWNER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@blossom.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Alex',
      lastName: 'Admin',
      phone: '+34600000002',
      role: Role.ADMIN,
    },
  });

  const florist = await prisma.user.create({
    data: {
      email: 'florist@blossom.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Sofia',
      lastName: 'Florist',
      phone: '+34600000003',
      role: Role.FLORIST,
    },
  });

  const courier = await prisma.user.create({
    data: {
      email: 'courier@blossom.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Marco',
      lastName: 'Courier',
      phone: '+34600000004',
      role: Role.COURIER,
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@example.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Lucas',
      lastName: 'Gomez',
      phone: '+34600000005',
      role: Role.CLIENT,
    },
  });

  console.log('✅ Users created successfully:');
  console.log('   - Owner: owner@blossom.com / Password123!');
  console.log('   - Admin: admin@blossom.com / Password123!');
  console.log('   - Florist: florist@blossom.com / Password123!');
  console.log('   - Courier: courier@blossom.com / Password123!');
  console.log('   - Client: client@example.com / Password123!');

  // 4. Создание категорий
  const bouquetsCat = await prisma.category.create({
    data: {
      name: 'Bouquets',
      slug: 'bouquets',
      description: 'Handcrafted fresh flower bouquets for all occasions.',
    },
  });

  const plantsCat = await prisma.category.create({
    data: {
      name: 'Indoor Plants',
      slug: 'indoor-plants',
      description: 'Beautiful potted plants to refresh your home space.',
    },
  });

  const giftsCat = await prisma.category.create({
    data: {
      name: 'Gifts & Add-ons',
      slug: 'gifts-and-addons',
      description: 'Cards, vases, and sweet additions for your bouquet.',
    },
  });

  console.log('✅ Categories created.');

  // 5. Создание товаров
  await prisma.product.createMany({
    data: [
      {
        title: 'Crimson Romance Bouquet',
        slug: 'crimson-romance-bouquet',
        description: 'A classic collection of 15 premium red roses intertwined with eucalyptus leaves.',
        price: 55.00,
        wholesalePrice: 22.00,
        stockQuantity: 20,
        isAddon: false,
        isActive: true,
        composition: '15 Red Roses, Eucalyptus, Satin Ribbon',
        imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        categoryId: bouquetsCat.id,
      },
      {
        title: 'Spring Sunrise Peonies',
        slug: 'spring-sunrise-peonies',
        description: 'Soft pink peonies paired with white lisianthus for a delicate morning touch.',
        price: 68.00,
        wholesalePrice: 28.00,
        stockQuantity: 12,
        isAddon: false,
        isActive: true,
        composition: '9 Pink Peonies, 5 White Lisianthus, Greenery',
        imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        categoryId: bouquetsCat.id,
      },
      {
        title: 'Monstera Deliciosa',
        slug: 'monstera-deliciosa',
        description: 'Tropical indoor plant in a minimalist ceramic pot.',
        price: 35.00,
        wholesalePrice: 14.00,
        stockQuantity: 8,
        isAddon: false,
        isActive: true,
        composition: 'Monstera plant in 17cm ceramic pot',
        imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
        categoryId: plantsCat.id,
      },
      {
        title: 'Personalized Greeting Card',
        slug: 'personalized-greeting-card',
        description: 'A custom printed card with your personal note written by hand.',
        price: 4.50,
        wholesalePrice: 0.50,
        stockQuantity: 200,
        isAddon: true, // Флаг доп. товара для добавления в корзину при чекауте
        isActive: true,
        composition: 'Premium 300gsm textured cardstock',
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        categoryId: giftsCat.id,
      },
    ],
  });

  console.log('✅ Products created.');

  // 6. Создание поставщика
  await prisma.supplier.create({
    data: {
      name: 'Dutch Flower Wholesalers BV',
      contactPerson: 'Jan van Der Berg',
      phone: '+31201234567',
      email: 'orders@dutchflowers.nl',
    },
  });

  console.log('✅ Supplier created.');
  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
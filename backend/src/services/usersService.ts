// backend/src/services/usersService.ts
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export interface CreateAdminUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export class UsersService {
  // Получение всех пользователей (без вывода хэша пароля)
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Ручное создание пользователя/сотрудника админом
  static async createUserByAdmin(data: CreateAdminUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw AppError.badRequest(`User with email '${data.email}' already exists.`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: data.role || Role.FLORIST,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  // Смена роли пользователя
  static async updateUserRole(targetUserId: string, newRole: Role, currentUserId: string) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw AppError.notFound('User not found.');
    }

    // Защита: Нельзя менять роль Системного Владельца (OWNER)
    if (targetUser.role === Role.OWNER) {
      throw AppError.forbidden('Cannot modify permissions of the System Owner.');
    }

    // Защита: Админ не может снять роль с самого себя
    if (targetUserId === currentUserId && newRole !== targetUser.role) {
      throw AppError.badRequest('You cannot change your own admin role.');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });
  }
}
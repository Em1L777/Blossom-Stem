// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('Authorization header with Bearer token is required');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  req.user = payload;
  next();
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized('User context is missing');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden(`Role '${req.user.role}' is not allowed to access this resource`);
    }

    next();
  };
};
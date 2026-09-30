// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from './appError.js';

export interface JwtPayload {
  userId: string;
  role: Role;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid or tampered token', 'INVALID_TOKEN');
  }
};
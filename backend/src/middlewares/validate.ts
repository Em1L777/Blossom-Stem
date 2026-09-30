// backend/src/middlewares/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError.js';

interface ValidationTarget {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationTarget) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        // Безопасная мутация свойств объекта query без перезаписи самого геттера
        Object.keys(req.query).forEach((key) => delete (req.query as Record<string, any>)[key]);
        Object.assign(req.query, parsedQuery);
      }

      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        // Безопасная мутация свойств объекта params без перезаписи самого геттера
        Object.keys(req.params).forEach((key) => delete (req.params as Record<string, any>)[key]);
        Object.assign(req.params, parsedParams);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedDetails = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        next(
          AppError.badRequest(
            'Validation failed',
            'INVALID_INPUT',
            formattedDetails
          )
        );
        return;
      }
      next(error);
    }
  };
};
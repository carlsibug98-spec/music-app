/**
 * Zod body validation — parse or throw the 422 problem.
 */
import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { validationFailed } from './errors.js';

export const validate = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(validationFailed(result.error));
  req.body = result.data;
  next();
};

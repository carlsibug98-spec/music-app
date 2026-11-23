/** Query-string validation — parse or throw the 422 problem. */
import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { validationFailed } from './errors.js';

export const validateQuery = (schema: ZodTypeAny): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) return next(validationFailed(result.error));
  req.query = result.data as typeof req.query;
  next();
};

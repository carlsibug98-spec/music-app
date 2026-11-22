import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../lib/validate.js';
import type { DeviceStore } from '../stores/deviceStore.js';

const registrationSchema = z.object({
  display_name: z
    .string({ required_error: 'display_name is required' })
    .trim()
    .min(1, 'display_name must not be empty')
    .max(32, 'display_name must be 32 characters or fewer'),
  platform: z.enum(['ios', 'android'], {
    errorMap: () => ({ message: 'platform must be "ios" or "android"' }),
  }),
});

export function devicesRouter(store: DeviceStore): Router {
  const router = Router();

  /**
   * POST /v1/devices — silent registration (D-002: no login).
   * Returns the device key exactly once; clients persist it.
   */
  router.post('/', validate(registrationSchema), async (req, res, next) => {
    try {
      const device = await store.register(req.body);
      res.status(201).json(device);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

/** X-Device-Key auth middleware (no login — D-002). */
import type { RequestHandler, Response } from 'express';
import { unauthorized } from '../lib/errors.js';
import type { DeviceRecord, DeviceStore } from '../stores/deviceStore.js';

export function requireDevice(store: DeviceStore): RequestHandler {
  return (req, res, next) => {
    const key = req.header('x-device-key')?.trim();
    if (!key) return next(unauthorized('X-Device-Key header is missing.'));

    store
      .findByKey(key)
      .then((device) => {
        if (!device) return next(unauthorized('The device key is not recognized.'));
        res.locals.device = device;
        next();
      })
      .catch(next);
  };
}

export function currentDevice(res: Response): DeviceRecord {
  return res.locals.device as DeviceRecord;
}

/**
 * App factory — wire routes here; server.ts owns Prisma and listening.
 */
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import type { CatalogService } from './catalog/catalogService.js';
import { requireDevice } from './auth/requireDevice.js';
import { problemHandler } from './lib/errors.js';
import { mountLocalMedia } from './media.js';
import { catalogRouter } from './routes/catalog.js';
import { devicesRouter } from './routes/devices.js';
import { healthzRouter } from './routes/healthz.js';
import type { DeviceStore } from './stores/deviceStore.js';

export interface AppDeps {
  deviceStore: DeviceStore;
  catalog: CatalogService;
}

export function createApp(deps: AppDeps) {
  const app = express();
  app.disable('x-powered-by');

  // Trace id per request (surfaced in problem responses).
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.traceId = crypto.randomUUID();
    next();
  });

  app.use(helmet());
  app.use(express.json({ limit: '256kb' }));

  // Routes
  app.use(healthzRouter);
  app.use('/v1/devices', devicesRouter(deps.deviceStore));
  app.use('/v1', requireDevice(deps.deviceStore), catalogRouter(deps.catalog));

  mountLocalMedia(app);

  // 404 (RFC 7807)
  app.use((_req: Request, res: Response) => {
    res
      .status(404)
      .type('application/problem+json')
      .json({
        type: 'https://resona.dev/problems/not-found',
        title: 'Not found',
        status: 404,
        detail: 'The requested resource does not exist.',
        trace_id: res.locals.traceId,
      });
  });

  app.use(problemHandler);

  return app;
}

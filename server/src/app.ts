/**
 * App factory — wire routes here; server.ts only listens.
 */
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import { problemHandler } from './lib/errors.js';
import { healthzRouter } from './routes/healthz.js';
import { devicesRouter } from './routes/devices.js';
import { InMemoryDeviceStore } from './stores/deviceStore.js';

export function createApp() {
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
  app.use('/v1/devices', devicesRouter(new InMemoryDeviceStore()));

  // 404 (RFC 7807)
  app.use((_req: Request, res: Response) => {
    res
      .status(404)
      .type('application/problem+json')
      .json({
        type: 'https://resona.dev/problems/not-found',
        title: 'Not found',
        status: 404,
        trace_id: res.locals.traceId,
      });
  });

  // Error envelope — must be last.
  app.use(problemHandler);

  return app;
}

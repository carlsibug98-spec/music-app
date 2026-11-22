import { Router } from 'express';

export const healthzRouter = Router();

const startedAt = Date.now();

healthzRouter.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version ?? '0.1.0',
    uptime_s: Math.round((Date.now() - startedAt) / 1000),
  });
});

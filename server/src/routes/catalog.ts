/**
 * /v1 catalog, search, browse, home and signal routes (M1).
 * Mounted behind requireDevice — every route reads currentDevice(res).
 */
import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { currentDevice } from '../auth/requireDevice.js';
import type { CatalogService } from '../catalog/catalogService.js';
import { validate } from '../lib/validate.js';
import { validateQuery } from '../lib/validateQuery.js';

const suggestQuerySchema = z.object({
  q: z.string().trim().min(1, 'q is required').max(100),
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'q is required').max(100),
  type: z.enum(['song', 'album', 'artist', 'playlist']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const listenSchema = z.object({
  events: z
    .array(
      z.object({
        track_id: z.string().uuid(),
        played_at: z.string().datetime({ offset: true }).optional(),
        ms_played: z.number().int().min(0).max(86_400_000),
        completed: z.boolean(),
      }),
    )
    .min(1)
    .max(100),
});

const asyncRoute =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export function catalogRouter(service: CatalogService): Router {
  const router = Router();

  router.get(
    '/home',
    asyncRoute(async (_req, res) => {
      const device = currentDevice(res);
      res.json(await service.home(device.id, device.displayName));
    }),
  );

  router.get(
    '/search/suggest',
    validateQuery(suggestQuerySchema),
    asyncRoute(async (req, res) => {
      res.json(await service.suggest(String(req.query.q)));
    }),
  );

  router.get(
    '/search',
    validateQuery(searchQuerySchema),
    asyncRoute(async (req, res) => {
      const q = req.query as unknown as z.infer<typeof searchQuerySchema>;
      res.json(
        await service.search({
          q: q.q,
          type: q.type ?? 'all',
          limit: q.limit,
          offset: q.offset,
        }),
      );
    }),
  );

  router.get(
    '/browse/genres',
    asyncRoute(async (_req, res) => {
      res.json(await service.genres());
    }),
  );

  router.get(
    '/browse/genres/:id',
    asyncRoute(async (req, res) => {
      res.json(await service.genre(String(req.params.id)));
    }),
  );

  router.get(
    '/stations/:seed',
    asyncRoute(async (req, res) => {
      res.json(await service.station(String(req.params.seed)));
    }),
  );

  router.get(
    '/tracks/:id',
    asyncRoute(async (req, res) => {
      res.json(await service.track(String(req.params.id)));
    }),
  );

  router.get(
    '/artists/:id',
    asyncRoute(async (req, res) => {
      res.json(await service.artist(String(req.params.id)));
    }),
  );

  router.get(
    '/albums/:id',
    asyncRoute(async (req, res) => {
      res.json(await service.album(String(req.params.id)));
    }),
  );

  router.post(
    '/events/listen',
    validate(listenSchema),
    asyncRoute(async (req, res) => {
      const body = req.body as z.infer<typeof listenSchema>;
      const accepted = await service.recordListen(currentDevice(res).id, body.events);
      res.status(202).json({ accepted });
    }),
  );

  router.get(
    '/recents',
    asyncRoute(async (_req, res) => {
      res.json(await service.recents(currentDevice(res).id));
    }),
  );

  return router;
}

/**
 * Local media static host (development only).
 * Production own-catalog files live in object storage (doc 02 §4).
 */
import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const defaultDir = fileURLToPath(new URL('../../local-media/', import.meta.url));

export function mountLocalMedia(app: Express): void {
  const enabled =
    process.env.NODE_ENV !== 'production' || process.env.SERVE_LOCAL_MEDIA === '1';
  if (!enabled) return;

  const dir = process.env.LOCAL_MEDIA_DIR ?? defaultDir;
  if (!existsSync(dir)) return;

  app.use(
    '/media',
    express.static(dir, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, path) => {
        if (path.endsWith('.mp3')) res.setHeader('Accept-Ranges', 'bytes');
      },
    }),
  );
}

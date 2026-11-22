/**
 * Entry point — wire Prisma, the catalog service, and listen.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { HttpYtmProvider } from './adapters/ytmProvider.js';
import { createApp } from './app.js';
import { CatalogService } from './catalog/catalogService.js';
import { PrismaCatalogRepository } from './catalog/prismaCatalogRepository.js';
import { PrismaDeviceStore } from './stores/prismaDeviceStore.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const prisma = new PrismaClient();
const deviceStore = new PrismaDeviceStore(prisma);
const repository = new PrismaCatalogRepository(prisma);
const ytm = new HttpYtmProvider({
  enabled: process.env.CATALOG_YTM_ENABLED === 'true',
  resolverUrl: process.env.YTM_RESOLVER_URL,
  ttlMs: process.env.CATALOG_YTM_TTL_MS
    ? Number(process.env.CATALOG_YTM_TTL_MS)
    : undefined,
});

const app = createApp({
  deviceStore,
  catalog: new CatalogService({ repository, ytm }),
});

const server = app.listen(port, host, () => {
  console.log(`[resona] API listening on ${host}:${port}`);
  if (ytm.isAvailable()) console.log('[resona] YTM adapter enabled');
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[resona] ${signal} received, shutting down`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

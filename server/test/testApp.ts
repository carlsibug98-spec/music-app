/** Test app: in-memory stores, no Postgres, no network. */
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';
import { CatalogService } from '../src/catalog/catalogService.js';
import { InMemoryCatalogRepository } from '../src/catalog/inMemoryCatalogRepository.js';
import { InMemoryDeviceStore } from '../src/stores/deviceStore.js';
import type { YtmProvider } from '../src/adapters/ytmProvider.js';

export interface TestApp {
  app: Express;
  devices: InMemoryDeviceStore;
  catalog: CatalogService;
  repository: InMemoryCatalogRepository;
}

export function makeTestApp(ytm?: YtmProvider): TestApp {
  const devices = new InMemoryDeviceStore();
  const repository = new InMemoryCatalogRepository();
  const catalog = new CatalogService({ repository, ytm });
  const app = createApp({ deviceStore: devices, catalog });
  return { app, devices, catalog, repository };
}

export async function registerDevice(
  app: Express,
  displayName = 'Test Device',
): Promise<string> {
  const res = await request(app)
    .post('/v1/devices')
    .send({ display_name: displayName, platform: 'android' });
  if (res.status !== 201) throw new Error(`registration failed: ${res.status}`);
  return res.body.device_key as string;
}

export function withDevice(req: request.Test, key: string): request.Test {
  return req.set('X-Device-Key', key);
}

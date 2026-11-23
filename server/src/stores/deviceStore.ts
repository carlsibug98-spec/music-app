/**
 * DeviceStore — registration + device-key lookup.
 *
 * M1 ships the Prisma implementation; the in-memory one keeps the API tests
 * hermetic (no Postgres in CI).
 */
import { randomBytes } from 'node:crypto';
import type {
  DeviceRegistrationRequest,
  DeviceRegistrationResponse,
  Platform,
} from '@resona/api-types';
import { hashDeviceKey } from '../lib/deviceKey.js';

export interface DeviceRecord {
  id: string;
  displayName: string;
  platform: Platform;
  createdAt: Date;
}

export interface DeviceStore {
  register(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse>;
  findByKey(key: string): Promise<DeviceRecord | null>;
}

interface InMemoryRow {
  id: string;
  displayName: string;
  platform: Platform;
  createdAt: Date;
  keyHash: string;
}

export class InMemoryDeviceStore implements DeviceStore {
  #rows = new Map<string, InMemoryRow>();
  #byHash = new Map<string, InMemoryRow>();

  async register(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    const id = crypto.randomUUID();
    const deviceKey = randomBytes(32).toString('base64url');
    const createdAt = new Date();
    const row: InMemoryRow = {
      id,
      displayName: req.display_name,
      platform: req.platform,
      createdAt,
      keyHash: hashDeviceKey(deviceKey),
    };
    this.#rows.set(id, row);
    this.#byHash.set(row.keyHash, row);
    return {
      device_id: id,
      device_key: deviceKey,
      display_name: row.displayName,
      platform: row.platform,
      created_at: createdAt.toISOString(),
    };
  }

  async findByKey(key: string): Promise<DeviceRecord | null> {
    const row = this.#byHash.get(hashDeviceKey(key));
    if (!row) return null;
    return {
      id: row.id,
      displayName: row.displayName,
      platform: row.platform,
      createdAt: row.createdAt,
    };
  }

  get size(): number {
    return this.#rows.size;
  }
}

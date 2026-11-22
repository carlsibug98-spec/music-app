/**
 * DeviceStore — M0 in-memory stub.
 *
 * The interface is the contract: M1 swaps this for a PrismaStore
 * (prisma.device.create) without touching the route. The stub keeps a
 * sha256 of the key like the real store will, so the shape is honest.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { DeviceRegistrationRequest, DeviceRegistrationResponse } from '@resona/api-types';

export interface DeviceStore {
  register(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse>;
}

export class InMemoryDeviceStore implements DeviceStore {
  #rows = new Map<string, { keyHash: string; createdAt: Date }>();

  async register(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    const deviceId = crypto.randomUUID();
    const deviceKey = randomBytes(32).toString('base64url'); // 43-char URL-safe key
    const createdAt = new Date();
    this.#rows.set(deviceId, {
      keyHash: createHash('sha256').update(deviceKey).digest('hex'),
      createdAt,
    });
    return {
      device_id: deviceId,
      device_key: deviceKey,
      display_name: req.display_name,
      platform: req.platform,
      created_at: createdAt.toISOString(),
    };
  }

  get size(): number {
    return this.#rows.size;
  }
}

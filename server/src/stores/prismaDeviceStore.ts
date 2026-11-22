/** Prisma-backed DeviceStore (M1). */
import { randomBytes } from 'node:crypto';
import type { DeviceRegistrationRequest, DeviceRegistrationResponse } from '@resona/api-types';
import type { PrismaClient } from '@prisma/client';
import { hashDeviceKey } from '../lib/deviceKey.js';
import type { DeviceRecord, DeviceStore } from './deviceStore.js';

export class PrismaDeviceStore implements DeviceStore {
  constructor(private readonly prisma: PrismaClient) {}

  async register(req: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    const deviceKey = randomBytes(32).toString('base64url');
    const row = await this.prisma.device.create({
      data: {
        displayName: req.display_name,
        platform: req.platform,
        apiKeyHash: hashDeviceKey(deviceKey),
      },
    });
    return {
      device_id: row.id,
      device_key: deviceKey,
      display_name: row.displayName,
      platform: row.platform,
      created_at: row.createdAt.toISOString(),
    };
  }

  async findByKey(key: string): Promise<DeviceRecord | null> {
    const row = await this.prisma.device.findUnique({
      where: { apiKeyHash: hashDeviceKey(key) },
    });
    if (!row) return null;
    // Touch last_seen without blocking the request on a write failure.
    void this.prisma.device
      .update({ where: { id: row.id }, data: { lastSeenAt: new Date() } })
      .catch(() => undefined);
    return {
      id: row.id,
      displayName: row.displayName,
      platform: row.platform,
      createdAt: row.createdAt,
    };
  }
}

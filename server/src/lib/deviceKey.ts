/** Device key hashing shared by every store. */
import { createHash } from 'node:crypto';

export function hashDeviceKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

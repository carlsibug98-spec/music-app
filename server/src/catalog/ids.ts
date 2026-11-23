/** Deterministic UUIDv5-style ids for external catalog rows. */
import { createHash } from 'node:crypto';

const NAMESPACE = 'b7f6b9d2-3c1a-4e8a-9f0d-2d5f7a1c6e33';

export function stableId(namespace: string, name: string): string {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const hash = createHash('sha1')
    .update(Buffer.concat([ns, Buffer.from(`${namespace}:${name}`)]))
    .digest();
  hash[6] = ((hash[6] ?? 0) & 0x0f) | 0x50;
  hash[8] = ((hash[8] ?? 0) & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a canonical UUID; Prisma rejects anything else on a uuid column. */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * @resona/api-types — shared DTOs for the Resona API (v1).
 * Mirrors server/openapi.yaml. Update both together.
 */

/* ---------- Primitives ---------- */

export type Platform = 'ios' | 'android';

export type ISODateString = string; // e.g. "2026-11-22T09:30:00.000Z"

export type UUID = string;

/* ---------- RFC 7807 error envelope ---------- */

export interface Problem {
  /** URI identifying the error class, e.g. "https://resona.dev/problems/validation" */
  type: string;
  /** Short, human-readable summary. */
  title: string;
  /** HTTP status code. */
  status: number;
  /** Human-readable explanation for this occurrence. */
  detail?: string;
  /** Field-level validation failures (422 responses). */
  errors?: ProblemField[];
  /** Request correlation id. */
  trace_id?: string;
}

export interface ProblemField {
  /** JSON path of the offending field, e.g. "display_name". */
  path: string;
  message: string;
}

/* ---------- Health ---------- */

export interface Health {
  status: 'ok';
  version: string;
  uptime_s: number;
}

/* ---------- Devices (auth: X-Device-Key) ---------- */

export interface DeviceRegistrationRequest {
  /** 1–32 chars, trimmed; no email, no password (P1). */
  display_name: string;
  platform: Platform;
}

export interface DeviceRegistrationResponse {
  device_id: UUID;
  /** Plaintext device key — returned exactly once; clients store it in Keychain / EncryptedSharedPreferences. */
  device_key: string;
  display_name: string;
  platform: Platform;
  created_at: ISODateString;
}

/* ---------- Catalog (M1+ — shapes agreed now) ---------- */

export interface TrackSummary {
  id: UUID;
  title: string;
  artist_id: UUID;
  artist_name: string;
  album_id?: UUID | null;
  duration_ms: number;
  has_lyrics: boolean;
  explicit: boolean;
  art_url?: string | null;
}

export interface AlbumSummary {
  id: UUID;
  title: string;
  artist_id: UUID;
  artist_name: string;
  type: 'album' | 'single' | 'ep';
  release_date?: string | null;
  art_url?: string | null;
}

export interface ArtistSummary {
  id: UUID;
  name: string;
  art_url?: string | null;
  is_verified: boolean;
}

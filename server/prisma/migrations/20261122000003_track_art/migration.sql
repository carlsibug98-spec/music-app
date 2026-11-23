-- M1 follow-up: per-track art override (falls back to album/artist art).
ALTER TABLE "tracks" ADD COLUMN "art_url" TEXT;

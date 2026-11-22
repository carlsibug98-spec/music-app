-- M1: catalog & search
-- Adds genre tags, album track order, and YTM row identity without new tables.

ALTER TABLE "albums" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "source" "CatalogSource" NOT NULL DEFAULT 'own';

ALTER TABLE "artists" ADD COLUMN     "genres" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "tracks" ADD COLUMN     "genres" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "track_number" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "albums_source_external_id_key" ON "albums"("source", "external_id");

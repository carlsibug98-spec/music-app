-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ios', 'android');

-- CreateEnum
CREATE TYPE "CatalogSource" AS ENUM ('own', 'ytm');

-- CreateEnum
CREATE TYPE "ReleaseType" AS ENUM ('album', 'single', 'ep');

-- CreateEnum
CREATE TYPE "LibraryItemType" AS ENUM ('artist', 'album', 'playlist');

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "api_key_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "art_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "source" "CatalogSource" NOT NULL,
    "external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "artist_id" UUID NOT NULL,
    "type" "ReleaseType" NOT NULL DEFAULT 'album',
    "release_date" DATE,
    "art_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "artist_id" UUID NOT NULL,
    "album_id" UUID,
    "duration_ms" INTEGER NOT NULL,
    "has_lyrics" BOOLEAN NOT NULL DEFAULT false,
    "play_count" INTEGER NOT NULL DEFAULT 0,
    "source" "CatalogSource" NOT NULL,
    "external_id" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lyrics" (
    "track_id" UUID NOT NULL,
    "lrc_text" TEXT,
    "plain_text" TEXT,
    "offset_ms" INTEGER NOT NULL DEFAULT -500,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'unknown',

    CONSTRAINT "lyrics_pkey" PRIMARY KEY ("track_id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" TEXT NOT NULL DEFAULT 'recent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_tracks" (
    "playlist_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "track_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY ("playlist_id","position")
);

-- CreateTable
CREATE TABLE "likes" (
    "device_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("device_id","track_id")
);

-- CreateTable
CREATE TABLE "library_items" (
    "device_id" UUID NOT NULL,
    "item_type" "LibraryItemType" NOT NULL,
    "item_id" UUID NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_items_pkey" PRIMARY KEY ("device_id","item_type","item_id")
);

-- CreateTable
CREATE TABLE "listen_events" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ms_played" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listen_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_searches" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result_type" TEXT,

    CONSTRAINT "recent_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_api_key_hash_key" ON "devices"("api_key_hash");

-- CreateIndex
CREATE INDEX "artists_name_idx" ON "artists"("name");

-- CreateIndex
CREATE UNIQUE INDEX "artists_source_external_id_key" ON "artists"("source", "external_id");

-- CreateIndex
CREATE INDEX "albums_artist_id_idx" ON "albums"("artist_id");

-- CreateIndex
CREATE INDEX "tracks_artist_id_idx" ON "tracks"("artist_id");

-- CreateIndex
CREATE INDEX "tracks_album_id_idx" ON "tracks"("album_id");

-- CreateIndex
CREATE INDEX "tracks_play_count_idx" ON "tracks"("play_count");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_source_external_id_key" ON "tracks"("source", "external_id");

-- CreateIndex
CREATE INDEX "playlists_device_id_idx" ON "playlists"("device_id");

-- CreateIndex
CREATE INDEX "playlist_tracks_track_id_idx" ON "playlist_tracks"("track_id");

-- CreateIndex
CREATE INDEX "listen_events_device_id_played_at_idx" ON "listen_events"("device_id", "played_at");

-- CreateIndex
CREATE INDEX "listen_events_track_id_played_at_idx" ON "listen_events"("track_id", "played_at");

-- CreateIndex
CREATE INDEX "recent_searches_device_id_submitted_at_idx" ON "recent_searches"("device_id", "submitted_at");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lyrics" ADD CONSTRAINT "lyrics_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listen_events" ADD CONSTRAINT "listen_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listen_events" ADD CONSTRAINT "listen_events_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_searches" ADD CONSTRAINT "recent_searches_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;


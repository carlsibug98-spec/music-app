/** Domain rows shared by the in-memory and Prisma catalog repositories. */

export type ReleaseKind = 'album' | 'single' | 'ep';

export interface ArtistRow {
  id: string;
  name: string;
  bio: string | null;
  artUrl: string | null;
  genres: string[];
  isVerified: boolean;
}

export interface AlbumRow {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  type: ReleaseKind;
  releaseDate: string | null;
  artUrl: string | null;
  trackCount: number;
}

export interface TrackRow {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string | null;
  albumTitle: string | null;
  durationMs: number;
  trackNumber: number;
  hasLyrics: boolean;
  explicit: boolean;
  artUrl: string | null;
  playCount: number;
  genres: string[];
}

export interface GenreRow {
  id: string;
  name: string;
  featured: boolean;
  trackCount: number;
  artUrl: string | null;
}

export interface RecentListenRow {
  id: string;
  trackId: string;
  playedAt: Date;
  msPlayed: number;
  completed: boolean;
}

export interface ListenEventRecord extends RecentListenRow {
  track: TrackRow;
}

export interface NewListenEvent {
  trackId: string;
  playedAt: Date;
  msPlayed: number;
  completed: boolean;
}

/* ---------- External (YTM adapter) ---------- */

export interface ExternalArtist {
  externalId: string;
  name: string;
  artUrl?: string | null;
  genres?: string[];
}

export interface ExternalAlbum {
  externalId: string;
  title: string;
  artistExternalId: string;
  type: ReleaseKind;
  releaseDate?: string | null;
  artUrl?: string | null;
}

export interface ExternalTrack {
  externalId: string;
  title: string;
  artistExternalId: string;
  albumExternalId?: string | null;
  durationMs: number;
  artUrl?: string | null;
  genres?: string[];
}

export interface ExternalCatalog {
  artists: ExternalArtist[];
  albums: ExternalAlbum[];
  tracks: ExternalTrack[];
}

export interface SavedExternalCatalog {
  artists: ArtistRow[];
  albums: AlbumRow[];
  tracks: TrackRow[];
}

export interface CatalogRepository {
  searchArtists(q: string, limit: number): Promise<ArtistRow[]>;
  countArtists(q: string): Promise<number>;
  searchAlbums(q: string, limit: number): Promise<AlbumRow[]>;
  countAlbums(q: string): Promise<number>;
  searchTracks(q: string, limit: number): Promise<TrackRow[]>;
  countTracks(q: string): Promise<number>;

  getArtist(id: string): Promise<ArtistRow | null>;
  getArtistTopTracks(artistId: string, limit: number): Promise<TrackRow[]>;
  getArtistReleases(artistId: string): Promise<AlbumRow[]>;
  getArtistListenerCount(artistId: string, since: Date): Promise<number>;

  getAlbum(id: string): Promise<AlbumRow | null>;
  getAlbumTracks(albumId: string): Promise<TrackRow[]>;
  getAlbumsByArtist(artistId: string, limit: number): Promise<AlbumRow[]>;

  getTrack(id: string): Promise<TrackRow | null>;
  getTopTracks(limit: number): Promise<TrackRow[]>;
  getNewAlbums(limit: number): Promise<AlbumRow[]>;
  getArtists(limit: number): Promise<ArtistRow[]>;
  getTracksByGenres(genres: string[], limit: number, excludeTrackId?: string): Promise<TrackRow[]>;

  listGenres(): Promise<GenreRow[]>;
  getGenreTracks(genreId: string, limit: number): Promise<TrackRow[]>;

  getRecentTracks(deviceId: string, limit: number): Promise<TrackRow[]>;
  addListenEvents(deviceId: string, events: NewListenEvent[]): Promise<number>;
  getListenEvents(deviceId: string, since: Date): Promise<ListenEventRecord[]>;

  saveExternalCatalog(input: ExternalCatalog, source: 'ytm'): Promise<SavedExternalCatalog>;
}

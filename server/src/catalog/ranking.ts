/**
 * Search ranking shared by every catalog source.
 *
 * Exact > prefix > word-prefix > contains, with play count as the
 * tie-breaker. Diacritics are stripped so "tahan" still finds "Tahán".
 */

export function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function textScore(query: string, field: string | null | undefined): number {
  if (!field) return 0;
  const q = normalize(query);
  const f = normalize(field);
  if (!q || !f) return 0;
  if (f === q) return 100;
  if (f.startsWith(q)) return 80;
  if (f.split(/[^\p{Letter}\p{Number}]+/u).some((word) => word.startsWith(q))) return 60;
  if (f.includes(q)) return 40;
  return 0;
}

export interface Rankable {
  title: string;
  artistName?: string;
  albumTitle?: string | null;
  playCount?: number;
}

export function rankScore(query: string, item: Rankable): number {
  const title = textScore(query, item.title);
  const artist = item.artistName ? textScore(query, item.artistName) : 0;
  const album = item.albumTitle ? textScore(query, item.albumTitle) : 0;
  const base = Math.max(title * 2, artist * 1.5, album);
  // Popularity only separates items with the same text relevance.
  return base + Math.min(item.playCount ?? 0, 5000) / 100_000;
}

export function rankByQuery<T extends Rankable>(query: string, items: T[]): T[] {
  return [...items].sort((a, b) => {
    const diff = rankScore(query, b) - rankScore(query, a);
    if (Math.abs(diff) > 0.0001) return diff;
    return (b.playCount ?? 0) - (a.playCount ?? 0);
  });
}

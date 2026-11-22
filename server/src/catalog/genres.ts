import { normalize } from './ranking.js';

/** Five promotable categories, shown first in the browse grid (PRD FR-17). */
export const FEATURED_GENRES = ['OPM', 'Hugot', 'Chill', 'Indie', 'Late Night'];

export function genreSlug(name: string): string {
  return normalize(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isFeaturedGenre(name: string): boolean {
  const n = normalize(name);
  return FEATURED_GENRES.some((g) => normalize(g) === n);
}

import type { Hospital } from '../types';
import { pageWindow, hasClinicCoordinates } from './clinic-utils.ts';
import { calculateDistance } from './utils.ts';
import { RESULT_PAGE_SIZE } from './search-state.ts';

export type SearchPage = {
  version: string; total: number; scopeCount: number; reviewedCount: number;
  page: number; pages: number; start: number; end: number; items: Hospital[];
};
type Locations = Pick<SearchPage, 'version' | 'total' | 'scopeCount' | 'reviewedCount'> & { locations: Array<[number, number, number]> };
class VersionChanged extends Error {}
const FILTERS = ['prefecture', 'q', 'dept', 'lang', 'open', 'engtoday', 'card', 'insurance', 'nightweekend', 'walkin', 'verified', 'reviewed', 'selfpay', 'uninsuredUnknown', 'page'];

export function searchQuery(query: string) {
  const original = new URLSearchParams(query), result = new URLSearchParams();
  for (const key of FILTERS) { const value = original.get(key); if (value) result.set(key, value); }
  return result.toString();
}

async function request(params: URLSearchParams, signal?: AbortSignal) {
  signal?.throwIfAborted();
  const response = await fetch(`/api/clinics/search?${params}`, { signal, cache: 'no-store' });
  if (response.status === 409) throw new VersionChanged();
  if (!response.ok) throw new Error('Clinic search request failed');
  const data = await response.json();
  signal?.throwIfAborted();
  if (!data || typeof data.version !== 'string') throw new Error('Invalid clinic search');
  return data;
}
function validItems(items: unknown): items is Hospital[] {
  return Array.isArray(items) && items.length <= RESULT_PAGE_SIZE && items.every(item => item && typeof item.id === 'string'
    && item.name && item.address && Array.isArray(item.departments) && Array.isArray(item.supportedLanguages));
}
export async function fetchSearchPage(query: string, signal?: AbortSignal): Promise<SearchPage> {
  const data = await request(new URLSearchParams(searchQuery(query)), signal);
  if (!validItems(data.items) || !Number.isSafeInteger(data.total) || data.total < 0
    || !Number.isInteger(data.page) || data.page < 1 || !Number.isInteger(data.pages) || data.pages < 1
    || !Number.isInteger(data.start) || !Number.isInteger(data.end)) throw new Error('Invalid clinic search');
  return data;
}

// Only lightweight public facility coordinates are retained, for at most two
// filter combinations. The user's origin never enters a URL, body or cache key
// on the server. Page selections contain public record numbers only.
const locationCache = new Map<string, Locations>();
export async function fetchNearestPage(query: string, origin: { lat: number; lng: number }, radius: number | null, signal?: AbortSignal): Promise<SearchPage> {
  const filters = new URLSearchParams(searchQuery(query));
  const rawPage = filters.get('page'); filters.delete('page'); filters.set('view', 'locations');
  const key = filters.toString() + (filters.get('open') === 'true' ? `:${Math.floor(Date.now() / 60_000)}` : '');
  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    let data = locationCache.get(key);
    if (!data) {
      const result = await request(filters, signal);
      if (!Array.isArray(result.locations) || !Number.isInteger(result.total) || result.total !== result.locations.length
        || result.locations.some((row: unknown) => !Array.isArray(row) || row.length !== 3 || !row.every(Number.isFinite))) throw new Error('Invalid facility locations');
      data = result as Locations;
      if (locationCache.size >= 2) locationCache.delete(locationCache.keys().next().value!);
      locationCache.set(key, data);
    }
    const sorted = data.locations.map(([id, lat, lng]) => ({ id, distance: hasClinicCoordinates(lat, lng)
      && hasClinicCoordinates(origin.lat, origin.lng) ? calculateDistance(origin.lat, origin.lng, lat, lng) : Infinity }))
      .filter(point => radius === null || point.distance <= radius).sort((a, b) => a.distance - b.distance);
    const pagination = pageWindow(sorted.length, rawPage, RESULT_PAGE_SIZE);
    const selected = sorted.slice(pagination.start, pagination.end);
    if (!selected.length) return { version: data.version, scopeCount: data.scopeCount, reviewedCount: data.reviewedCount,
      ...pagination, total: sorted.length, items: [] };
    const params = new URLSearchParams({ view: 'cards', version: data.version, ids: selected.map(point => point.id).join(',') });
    try {
      const cards = await request(params, signal);
      if (!validItems(cards.items) || cards.items.length !== selected.length) throw new Error('Invalid search cards');
      return { version: data.version, scopeCount: data.scopeCount, reviewedCount: data.reviewedCount,
        total: sorted.length, ...pagination, items: cards.items };
    } catch (error) {
      if (!(error instanceof VersionChanged) || attempt > 0) throw error;
      locationCache.delete(key);
    }
  }
  throw new Error('Clinic search unavailable');
}

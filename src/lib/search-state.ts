import type { Hospital } from '../types';
import { prefectureByCode } from '../../data/prefectures.mjs';

export const RESULT_PAGE_SIZE = 20;
// Switching prefectures clears the old origin and radius, but preserves medical
// filters. Selecting a prefecture must not silently mean "near Tokyo".
export function prefectureSearchChanges(code: string): Record<string, string | null> {
  return { prefecture: prefectureByCode(code)?.code || null, area: null, location: null, dist: null };
}
export type SearchRadius = number | null | 'off';

export function searchRadius(value: string | null, hasOrigin: boolean): SearchRadius {
  if (!hasOrigin) return 'off';
  if (value === 'near') return null;
  return value && ['1', '3', '5', '10'].includes(value) ? Number(value) : 'off';
}

// All changes to a filter reset pagination. Only public area IDs go in the URL;
// the user's actual coordinates must never be included.
export function updateSearch(query: string, changes: Record<string, string | null>): string {
  const params = new URLSearchParams(query);
  params.delete('page');
  for (const [key, value] of Object.entries(changes)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return `/hospitals${params.size ? `?${params}` : ''}`;
}

export function safeSearchReturn(value: string | null): string {
  if (!value || !/^\/hospitals(?:\?|$)/.test(value) || /[\\\r\n]/.test(value)) return '/hospitals';
  return value;
}

export function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

export function matchesKeyword(hospital: Pick<Hospital, 'name' | 'address'>, keyword: string): boolean {
  const words = normalizeSearchText(keyword).split(' ').filter(Boolean);
  if (!words.length) return true;
  const text = normalizeSearchText([...Object.values(hospital.name), ...Object.values(hospital.address)].join(' '));
  return words.every(word => text.includes(word));
}

const LOCATION_KEY = 'mn_nearCoords';
const MAX_LOCATION_AGE = 30 * 60 * 1000;
export type SearchCoordinates = { lat: number; lng: number };

export function parseSearchLocation(raw: string | null, now = Date.now()): SearchCoordinates | null {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || !Number.isFinite(value.lat) || !Number.isFinite(value.lng)
      || Math.abs(value.lat) > 90 || Math.abs(value.lng) > 180
      || !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt > MAX_LOCATION_AGE) return null;
    return { lat: value.lat, lng: value.lng };
  } catch { return null; }
}

export function readSearchLocation(): SearchCoordinates | null {
  try { return parseSearchLocation(sessionStorage.getItem(LOCATION_KEY)); }
  catch { return null; }
}

export function saveSearchLocation(coords: SearchCoordinates | null): boolean {
  try {
    if (coords) sessionStorage.setItem(LOCATION_KEY, JSON.stringify({ ...coords, savedAt: Date.now() }));
    else sessionStorage.removeItem(LOCATION_KEY);
    window.dispatchEvent(new Event('medinavi-location'));
    return true;
  } catch { return false; }
}

export function searchLocationSnapshot(): string | null {
  try { return sessionStorage.getItem(LOCATION_KEY); } catch { return null; }
}

// Legacy imports used false for unknown capabilities. Do not turn such defaults
// into confirmed negatives. Weekend opening can instead be checked from slots.
export function weekendStatus(hospital: Pick<Hospital, 'closedDays' | 'openingHours' | 'careGuide'>): boolean | undefined {
  if (hospital.careGuide?.scheduleNeedsConfirmation) return undefined;
  const days = ['sat', 'sun'];
  if (days.some(day => hospital.closedDays?.[day] !== true && hospital.openingHours?.[day]?.some(slot =>
    /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.end) && slot.start < slot.end
  ))) return true;
  if (days.every(day => hospital.closedDays?.[day] === true)) return false;
  return undefined;
}

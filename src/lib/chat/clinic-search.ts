import type { Hospital, Language } from '../../types';
import { AREA_PRESETS, haversineKm } from '../areas.ts';
import { hasClinicCoordinates, isCosmeticFocused, scheduledOpenStatus } from '../clinic-utils.ts';

export type SearchRecord = Pick<Hospital, 'id' | 'latitude' | 'longitude' | 'departments' | 'supportedLanguages' | 'openingHours' | 'closedDays' | 'careGuide' | 'phone'> & {
  name: { ja: string; en: string };
  address: string;
};

export type ClinicSearchArgs = {
  department?: string;
  area?: string;
  language?: string;
  open_now?: boolean;
};

export type ClinicCard = {
  id: string;
  name: { ja: string; en: string };
  address: string;
  phone: string;
  departments: string[];
  languages: string[];
  openNow: boolean | null;
  distanceKm: number | null;
};

export const DEPARTMENT_IDS = ['internal', 'surgery', 'pediatrics', 'orthopedics', 'dermatology', 'ophthalmology', 'ent', 'obgyn', 'psychiatry', 'urology'];
export const AREA_IDS = AREA_PRESETS.map(area => area.name);
const LANGUAGE_IDS: Language[] = ['ja', 'en', 'zh', 'ko', 'es'];

/** Up to `limit` clinics from our own data. Cosmetic-focused clinics are excluded. */
export function searchClinics(records: SearchRecord[], args: ClinicSearchArgs, now: Date, limit = 5): ClinicCard[] {
  const department = args.department && DEPARTMENT_IDS.includes(args.department) ? args.department : null;
  const area = AREA_PRESETS.find(item => item.name === args.area) ?? null;
  const language = args.language && (LANGUAGE_IDS as string[]).includes(args.language) ? args.language as Language : null;

  const matches = records.flatMap(record => {
    if (isCosmeticFocused({ name: { ...record.name, zh: record.name.en, ko: record.name.en, es: record.name.en } })) return [];
    if (department && !record.departments.includes(department)) return [];
    if (language && language !== 'ja' && !record.supportedLanguages.includes(language)) return [];
    const openNow = scheduledOpenStatus(record, now);
    if (args.open_now && openNow !== true) return [];
    let distanceKm: number | null = null;
    if (area) {
      if (!hasClinicCoordinates(record.latitude, record.longitude)) return [];
      distanceKm = haversineKm(area.lat, area.lng, record.latitude, record.longitude);
      if (distanceKm > 3) return [];
    }
    return [{ record, openNow, distanceKm }];
  });

  matches.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)
    || Number(b.openNow === true) - Number(a.openNow === true));

  return matches.slice(0, limit).map(({ record, openNow, distanceKm }) => ({
    id: record.id,
    name: record.name,
    address: record.address,
    phone: record.phone,
    departments: record.departments,
    languages: record.supportedLanguages,
    openNow,
    distanceKm: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
  }));
}

/** Short text for the model: it may describe results but must not repeat contact details. */
export function describeForModel(cards: ClinicCard[]): string {
  if (!cards.length) return JSON.stringify({ found: 0 });
  return JSON.stringify({
    found: cards.length,
    note: 'The app shows these clinics to the user as cards with name, address, phone and map. Do not repeat phone numbers or addresses.',
    clinics: cards.map(card => ({ name: card.name.en || card.name.ja, departments: card.departments, open_now: card.openNow, distance_km: card.distanceKm })),
  });
}

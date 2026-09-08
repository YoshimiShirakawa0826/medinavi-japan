import type { Hospital } from '@/types';

// Cabinet Office calendar, checked 2026-09-08. Renew before 2028.
// https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html
const holidays: Record<number, string[]> = {
  2026: ['01-01', '01-12', '02-11', '02-23', '03-20', '04-29', '05-03', '05-04', '05-05', '05-06', '07-20', '08-11', '09-21', '09-22', '09-23', '10-12', '11-03', '11-23'],
  2027: ['01-01', '01-11', '02-11', '02-23', '03-21', '03-22', '04-29', '05-03', '05-04', '05-05', '07-19', '08-11', '09-20', '09-23', '10-11', '11-03', '11-23'],
};

export function hasClinicCoordinates(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    && !(lat === 0 && lng === 0);
}

export function clinicMapUrl(hospital: Pick<Hospital, 'latitude' | 'longitude' | 'name' | 'address'>): string {
  const query = hasClinicCoordinates(hospital.latitude, hospital.longitude)
    ? `${hospital.latitude},${hospital.longitude}`
    : `${hospital.name.ja} ${hospital.address.ja}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const tokyoClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function timeMinutes(time: unknown): number | null {
  if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(':').map(Number);
  return h <= 24 && m < 60 && (h < 24 || m === 0) ? h * 60 + m : null;
}

/** Published regular hours only; null means no reliable schedule for this date. */
export function scheduledOpenStatus(hospital: Pick<Hospital, 'closedDays' | 'openingHours'>, now: Date): boolean | null {
  if (!Number.isFinite(now.getTime())) return null;
  const parts = Object.fromEntries(tokyoClock.formatToParts(now).map(p => [p.type, p.value]));
  const year = Number(parts.year);
  // Weekly hours and hasHolidayService do not supply a dated holiday schedule.
  if (!holidays[year] || holidays[year].includes(`${parts.month}-${parts.day}`)) return null;
  const date = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getUTCDay()];
  if (hospital.closedDays?.[day] === true) return false;
  const slots = hospital.openingHours?.[day];
  if (!Array.isArray(slots) || !slots.length) return null;
  const intervals = slots.map(slot => [timeMinutes(slot?.start), timeMinutes(slot?.end)]);
  // Ambiguous overnight or malformed entries need confirmation, not an open badge.
  if (intervals.some(([start, end]) => start === null || end === null || end <= start)) return null;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return intervals.some(([start, end]) => minutes >= start! && minutes < end!);
}

export function matchesDepartment(hospital: Pick<Hospital, 'departments'>, department: string | null): boolean {
  return !department || hospital.departments.includes(department);
}

export function pageWindow(total: number, rawPage: string | null, size = 100) {
  const pages = Math.max(1, Math.ceil(total / size));
  const requested = Number(rawPage);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  return { page, pages, start: (page - 1) * size, end: Math.min(page * size, total) };
}

export async function loadClinics(signal?: AbortSignal): Promise<Hospital[]> {
  const response = await fetch('/data/clinics.json', { signal });
  if (!response.ok) throw new Error('Clinic data request failed');
  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.some(h => !h || typeof h.id !== 'string'
    || !h.name || !h.address || !Array.isArray(h.departments) || !Array.isArray(h.supportedLanguages))) {
    throw new Error('Invalid clinic data');
  }
  return data as Hospital[];
}

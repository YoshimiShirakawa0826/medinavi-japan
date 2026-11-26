// Server only: imported by route segments, never by client components (≈1 MB).
import index from '@/generated/clinic-index.json';

import type { ClinicSummary } from '@/types';
export type { ClinicSummary };

const clinics = index as Record<string, ClinicSummary>;

export function clinicSummary(id: string): ClinicSummary | null {
  return Object.prototype.hasOwnProperty.call(clinics, id) ? clinics[id] : null;
}

export function clinicIds(): string[] {
  return Object.keys(clinics);
}

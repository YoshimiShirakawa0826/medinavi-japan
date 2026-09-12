import type { AccessField, Hospital } from '../types';

/** Only evidenced positives match. In particular, reimbursement documents do
 * not imply a clinic can bill an overseas insurer directly. */
export function matchesAccess(hospital: Pick<Hospital, 'accessEvidence'>, field: AccessField): boolean {
  const evidence = hospital.accessEvidence?.[field];
  if (!evidence || !['yes', 'conditional'].includes(evidence.status)) return false;
  return field !== 'overseasInsuranceAccepted' || evidence.billing === 'direct_billing';
}

export function hasWebsiteReview(hospital: Pick<Hospital, 'accessEvidence'>): boolean {
  return !!hospital.accessEvidence && Object.keys(hospital.accessEvidence).length > 0;
}

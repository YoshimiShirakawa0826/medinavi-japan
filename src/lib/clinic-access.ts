import type { AccessField, Hospital } from '../types';

const reportedSpecialties: Record<string, string[]> = {
  internal: ['内科', '一般内科', '総合内科', '消化器内科', '循環器内科', '呼吸器内科', '糖尿病内科', '内分泌内科', '腎臓内科', '血液内科', '感染症内科', '漢方内科', '老年内科', '脳神経内科', '神経内科'],
  surgery: ['外科', '一般外科', '消化器外科', '乳腺外科', '肛門外科', '呼吸器外科', '心臓血管外科'],
  pediatrics: ['小児科', '小児内科'], orthopedics: ['整形外科'],
  dermatology: ['皮膚科', '一般皮膚科'], ophthalmology: ['眼科'],
  ent: ['耳鼻科', '耳鼻咽喉科', '耳鼻いんこう科', '耳鼻咽喉頭頸部外科'],
  obgyn: ['産婦人科', '産科', '婦人科'], psychiatry: ['精神科', '心療内科'], urology: ['泌尿器科'],
};
const reportedLanguages: Record<string, string[]> = {
  en: ['英語'], zh: ['中国語', '北京語', '広東語', '台湾語'],
  ko: ['韓国語', '朝鮮語', '韓国・朝鮮語'], es: ['スペイン語'],
};

/** Only evidenced positives match. In particular, reimbursement documents do
 * not imply a clinic can bill an overseas insurer directly. */
export function matchesAccess(hospital: Pick<Hospital, 'accessEvidence'>, field: AccessField, department?: string | null, language?: string | null): boolean {
  const evidence = hospital.accessEvidence?.[field];
  if (!evidence || !['yes', 'conditional'].includes(evidence.status)) return false;
  if (field === 'walkInAvailable' && language && language !== 'ja'
    && evidence.languageReservations?.some(l => reportedLanguages[language]?.includes(l.name) && l.reservation === '要予約')) return false;
  if (field === 'walkInAvailable' && department && evidence.departments) {
    // A positive in another department must not satisfy the selected specialty.
    return evidence.departments.some(d => d.status === 'yes' && reportedDepartmentMatches(d.name, department));
  }
  return field !== 'overseasInsuranceAccepted' || evidence.billing === 'direct_billing';
}

export function reportedDepartmentMatches(rawName: string, department: string): boolean {
  const name = rawName.normalize('NFKC').replace(/\s/g, '');
  // Do not equate cosmetic dermatology with general dermatology, etc.
  return reportedSpecialties[department]?.includes(name) ?? false;
}

export function hasWebsiteReview(hospital: Pick<Hospital, 'accessEvidence'>): boolean {
  return !!hospital.accessEvidence && Object.keys(hospital.accessEvidence).length > 0;
}

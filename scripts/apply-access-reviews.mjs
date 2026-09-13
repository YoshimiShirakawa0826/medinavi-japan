const fields = new Set(['creditCardAccepted', 'japaneseHealthInsurance', 'overseasInsuranceAccepted', 'walkInAvailable']);
const statuses = new Set(['yes', 'conditional', 'no', 'information']);
const languages = ['ja', 'en', 'zh', 'ko', 'es'];
function officialUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
    && value <= new Date().toISOString().slice(0, 10);
}

function validSource(source, clinicId) {
  if (!officialUrl(source.url) || !validDate(source.checkedAt)
    || (source.sourceUpdatedAt && (!validDate(source.sourceUpdatedAt) || source.sourceUpdatedAt > source.checkedAt))) return false;
  if (source.kind === 'official_website') return true;
  if (source.kind !== 'nabii_report') return false;
  const id = /^clinic-(\d{2})(2)(\d{10})$/.exec(clinicId);
  const url = new URL(source.url);
  return !!id && url.origin === 'https://www.iryou.teikyouseido.mhlw.go.jp'
    && url.pathname === '/znk-web/juminkanja/S2430/initialize'
    && url.searchParams.get('prefCd') === id[1] && url.searchParams.get('kikanKbn') === id[2]
    && url.searchParams.get('kikanCd') === id[3];
}

/** Fail the build on a bad match or incomplete evidence; never guess another clinic. */
export function applyAccessReviews(clinics, reviews) {
  const byId = new Map(clinics.map(clinic => [clinic.id, clinic]));
  const seen = new Set();
  for (const review of reviews) {
    const clinic = byId.get(review.clinicId);
    if (!clinic || seen.has(review.clinicId) || clinic.name.ja !== review.clinicName
      || clinic.phone !== review.matchedPhone || !officialUrl(review.identitySource)) {
      throw new Error(`Access review identity mismatch: ${review.clinicId}`);
    }
    seen.add(review.clinicId);
    if (!review.fields || !Object.keys(review.fields).length) throw new Error('Empty access review');
    for (const [field, value] of Object.entries(review.fields)) {
      if (!fields.has(field) || !statuses.has(value.status)
        || languages.some(lang => typeof value.notes?.[lang] !== 'string' || !value.notes[lang].trim())
        || !Array.isArray(value.sources) || !value.sources.length
        || value.sources.some(source => !validSource(source, review.clinicId))
        || (value.departments && (field !== 'walkInAvailable' || !Array.isArray(value.departments)
          || value.departments.some(d => typeof d.name !== 'string' || !d.name.trim() || !['yes', 'no', 'unknown'].includes(d.status))))
        || (value.languageReservations && (field !== 'walkInAvailable' || !Array.isArray(value.languageReservations)
          || value.languageReservations.some(l => typeof l.name !== 'string' || !l.name.trim()
            || !['要予約', '予約不要'].includes(l.reservation) || typeof l.note !== 'string')))) {
        throw new Error(`Incomplete access evidence: ${review.clinicId}/${field}`);
      }
      if (field === 'overseasInsuranceAccepted'
        && (!['direct_billing', 'pay_first', 'confirm'].includes(value.billing)
          || (['yes', 'conditional'].includes(value.status) && value.billing !== 'direct_billing'))) {
        throw new Error(`Travel insurance billing must be explicit: ${review.clinicId}`);
      }
    }
  }
  const reviewMap = new Map(reviews.map(review => [review.clinicId, review]));
  return clinics.map(clinic => {
    const review = reviewMap.get(clinic.id);
    if (!review) return clinic;
    // Keep base open-data dates, phone sources and direct verification unchanged.
    // Field evidence is authoritative; legacy placeholder booleans are not confirmations.
    return { ...clinic, accessEvidence: { ...clinic.accessEvidence, ...structuredClone(review.fields) } };
  });
}

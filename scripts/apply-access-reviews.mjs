const fields = new Set(['creditCardAccepted', 'japaneseHealthInsurance', 'overseasInsuranceAccepted', 'walkInAvailable']);
const statuses = new Set(['yes', 'conditional', 'no', 'information']);
const languages = ['ja', 'en', 'zh', 'ko', 'es'];
function officialUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
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
        || value.sources.some(source => source.kind !== 'official_website' || !officialUrl(source.url)
          || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)
          || new Date(`${source.checkedAt}T00:00:00Z`).toISOString().slice(0, 10) !== source.checkedAt
          || source.checkedAt > new Date().toISOString().slice(0, 10))) {
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
    return { ...clinic, accessEvidence: structuredClone(review.fields) };
  });
}

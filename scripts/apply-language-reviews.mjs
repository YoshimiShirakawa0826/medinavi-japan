const appLanguages = ['ja', 'en', 'zh', 'ko', 'es'];
const modes = new Set(['doctor', 'staff', 'in_person_interpreter', 'telephone_interpreter', 'video_interpreter',
  'interpretation_support', 'clinical_support', 'patient_arranged_interpreter', 'contact_only', 'machine_translation', 'onsite_interpreter_unavailable', 'service_suspended']);
const reservations = new Set(['required', 'advance_contact', 'not_required', 'unknown']);
const nonClinical = new Set(['patient_arranged_interpreter', 'contact_only', 'machine_translation', 'onsite_interpreter_unavailable', 'service_suspended']);

function webUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !!url.hostname;
  } catch { return false; }
}
const httpsUrl = value => webUrl(value) && new URL(value).protocol === 'https:';
const normalizedUrl = value => { const url = new URL(value); url.protocol = 'https:'; url.hash = ''; return url.href; };
function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
    && value <= new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

// A website review belongs to an exact facility, not every member of a group.
// The official-directory website and the fetched redirect target are recorded
// separately, so an old HTTP URL never needs TLS verification disabled.
export function applyLanguageReviews(clinics, reviews) {
  const byId = new Map(clinics.map(clinic => [clinic.id, clinic]));
  const seen = new Set();
  for (const review of reviews) {
    const clinic = byId.get(review.clinicId);
    if (!clinic || seen.has(review.clinicId) || clinic.name.ja !== review.clinicName
      || clinic.address.ja !== review.clinicAddress || clinic.website !== review.clinicWebsite
      || !webUrl(clinic.website) || !httpsUrl(review.identitySource?.url)
      || !webUrl(review.identitySource?.requestedUrl)
      || normalizedUrl(review.identitySource.requestedUrl) !== normalizedUrl(clinic.website)
      || !/^[a-f0-9]{64}$/.test(review.identitySource.contentSha256 || '')) {
      throw new Error(`Language review identity mismatch: ${review.clinicId}`);
    }
    seen.add(review.clinicId);
    if (!Array.isArray(review.entries) || !review.entries.length) throw new Error('Empty language review');
    for (const entry of review.entries) {
      if (!modes.has(entry.mode) || !reservations.has(entry.reservation)
        || !Array.isArray(entry.languages) || (!entry.languages.length && ['doctor', 'staff', 'clinical_support'].includes(entry.mode))
        || new Set(entry.languages).size !== entry.languages.length
        || entry.languages.some(code => !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(code))
        || appLanguages.some(language => typeof entry.notes?.[language] !== 'string' || !entry.notes[language].trim())
        || !Array.isArray(entry.sources) || !entry.sources.length
        || entry.sources.some(source => !httpsUrl(source.url) || !validDate(source.checkedAt)
          || new URL(source.url).hostname !== new URL(review.identitySource.url).hostname
          || typeof source.quote !== 'string' || source.quote.trim().length < 15
          || !/^[a-f0-9]{64}$/.test(source.contentSha256 || ''))) {
        throw new Error(`Incomplete language evidence: ${review.clinicId}`);
      }
    }
  }
  const mapped = new Map(reviews.map(review => [review.clinicId, review.entries]));
  return clinics.map(clinic => {
    const entries = mapped.get(clinic.id);
    if (!entries) return clinic;
    // Contact-only English, website translation and an interpreter brought by
    // the patient never become clinical language support in the search index.
    const supported = entries.filter(entry => !nonClinical.has(entry.mode)).flatMap(entry => entry.languages)
      .filter(language => appLanguages.includes(language));
    return { ...clinic, supportedLanguages: [...new Set([...clinic.supportedLanguages, ...supported])],
      languageSupport: structuredClone(entries) };
  });
}

export function applyWebsiteHolds(clinics, holds) {
  const byId = new Map(clinics.map(clinic => [clinic.id, clinic]));
  const held = new Set();
  for (const hold of holds) {
    const clinic = byId.get(hold.clinicId);
    if (!clinic || held.has(hold.clinicId) || clinic.name.ja !== hold.clinicName
      || clinic.address.ja !== hold.clinicAddress || clinic.website !== hold.clinicWebsite
      || !httpsUrl(hold.observedUrl) || !validDate(hold.checkedAt)
      || !/^[a-f0-9]{64}$/.test(hold.contentSha256 || '') || !hold.reason?.trim()) {
      throw new Error(`Website hold identity mismatch: ${hold.clinicId}`);
    }
    held.add(hold.clinicId);
  }
  return clinics.map(clinic => {
    if (!held.has(clinic.id)) return clinic;
    const { website, ...result } = clinic;
    void website;
    return result;
  });
}

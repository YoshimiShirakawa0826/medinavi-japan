// Search cards and filters need only a subset of the detail record. Never
// discard the full evidence: it remains in the server's compressed shards.
export function searchRecord(clinic) {
  const result = { ...clinic };
  if (clinic.languageSupport?.length) result.languageSupportReviewed = true;
  for (const field of ['name', 'address']) {
    const original = clinic[field];
    result[field] = Object.fromEntries(Object.entries(original).filter(([key, value]) => key === 'ja' || value !== original.ja));
  }
  for (const field of ['phoneSource', 'source', 'dataSource', 'updatedAt', 'hasHolidayService', 'walkInAllowed', 'website', 'languageSupport']) delete result[field];
  if (clinic.accessEvidence) result.accessEvidence = Object.fromEntries(Object.entries(clinic.accessEvidence).map(([field, evidence]) => {
    const { notes, sources, ...scope } = evidence;
    void notes; void sources;
    return [field, scope];
  }));
  return result;
}

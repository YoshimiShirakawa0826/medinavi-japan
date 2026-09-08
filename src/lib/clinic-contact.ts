/** Only a single, unambiguous Japanese phone number becomes a call link. */
export function telephoneHref(phone: unknown): string | null {
  if (typeof phone !== 'string') return null;
  const text = phone.normalize('NFKC').trim();
  if (!/^[0-9()\s\-−‐―ー]+$/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  return /^0[1-9]\d{8,9}$/.test(digits) ? `tel:${digits}` : null;
}

/** The source ID consists of prefecture, institution type and Nabii facility ID. */
export function nabiiClinicUrl(id: string): string | null {
  const match = /^clinic-(\d{2})(2)(\d{10})$/.exec(id);
  if (!match) return null;
  return `https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2430/initialize?kikanCd=${match[3]}&kikanKbn=${match[2]}&prefCd=${match[1]}`;
}

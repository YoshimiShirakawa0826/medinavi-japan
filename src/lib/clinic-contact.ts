/**
 * Only a single, unambiguous Japanese phone number becomes a call link.
 * Links use the international form (+81) so that foreign SIM cards and
 * roaming phones can place the call. Toll-free numbers (0120 / 0800) cannot
 * be reached in international form, so they keep the domestic form.
 */
export function telephoneHref(phone: unknown): string | null {
  const digits = domesticDigits(phone);
  if (!digits) return null;
  if (/^(0120|0800)/.test(digits)) return `tel:${digits}`;
  return `tel:+81${digits.slice(1)}`;
}

/** Display form for visitors: +81 3-6457-7600 style, falling back to the original text. */
export function internationalPhone(phone: unknown): string | null {
  const digits = domesticDigits(phone);
  if (!digits || /^(0120|0800)/.test(digits)) return null;
  const text = String(phone).normalize('NFKC').trim().replace(/[()\s−‐―ー]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const grouped = /^0\d+(-\d+)+$/.test(text) ? text.slice(1) : digits.slice(1);
  return `+81 ${grouped}`;
}

function domesticDigits(phone: unknown): string | null {
  if (typeof phone !== 'string') return null;
  const text = phone.normalize('NFKC').trim();
  if (!/^[0-9()\s\-−‐―ー]+$/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  return /^0[1-9]\d{8,9}$/.test(digits) ? digits : null;
}

/** The source ID consists of prefecture, institution type and Nabii facility ID. */
export function nabiiClinicUrl(id: string): string | null {
  const match = /^clinic-(\d{2})(2)(\d{10})$/.exec(id);
  if (!match) return null;
  return `https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2430/initialize?kikanCd=${match[3]}&kikanKbn=${match[2]}&prefCd=${match[1]}`;
}

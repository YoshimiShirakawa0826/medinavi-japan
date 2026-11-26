import type { Language } from '../types';

// Official contacts, checked 2026-11-26.
// - #7119 is Japanese only; 03-3212-2323 reaches the same Tokyo service from phones
//   that cannot dial #7119.
//   https://www.hokeniryo.metro.tokyo.lg.jp/documents/d/hokeniryo/shiryo4-3
//   https://www.city.meguro.tokyo.jp/seikatsueisei/kenkoufukushi/iryou/annaikensaku.html
// - HIMAWARI foreign-language line: EN/ZH/KO/TH/ES, daily 9:00-20:00.
//   https://www.hokeniryo.metro.tokyo.lg.jp/iryo/iryo_hoken/medical_info/himawari
// - JNTO Japan Visitor Hotline: EN/ZH/KO, 24 hours. https://www.japan.travel/en/plan/hotline/
// Call links use +81 so foreign SIM cards and roaming phones can connect.
export const EMERGENCY_CONTACTS = {
  tokyo7119Alt: { display: '03-3212-2323', href: 'tel:+81332122323' },
  himawari: { display: '03-5285-8181', href: 'tel:+81352858181' },
  jntoHotline: { display: '050-3816-2787', href: 'tel:+815038162787' },
} as const;

export const NABII_URL = 'https://www.iryou.teikyouseido.mhlw.go.jp/';

export function jntoMedicalSearchUrl(language: Language): string {
  const section = language === 'zh' ? 'chc' : language === 'ko' ? 'kor' : 'eng';
  return `https://www.jnto.go.jp/emergency/${section}/mi_guide.html`;
}

export function tokyoForeignMedicalInfoUrl(language: Language): string {
  return language === 'ja'
    ? 'https://www.hokeniryo.metro.tokyo.lg.jp/iryo/iryo_hoken/medical_info/himawari'
    : 'https://www.hokeniryo.metro.tokyo.lg.jp/iryo/iryo_hoken/medical_info_eng';
}

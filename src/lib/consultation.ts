// Operator confirmed WhatsApp reception for this business number on 2026-10-05.
// Environment scoping controls which deployments expose the enquiry link.
export function whatsAppLinkFromConfig(enabled: string | undefined): string | null {
  return enabled === 'true' ? 'https://wa.me/817090369655' : null;
}

export type EnquiryLanguage = 'ja' | 'en' | 'es';

export function whatsAppEnquiryLink(base: string | null, language: EnquiryLanguage): string | null {
  if (base !== 'https://wa.me/817090369655') return null;
  const copy = {
    ja: 'MediNavi JAPANを見て連絡しました。希望言語は、やさしい日本語です。\nオンライン診療を希望しています。利用方法や予約のサポートをお願いします。',
    en: 'Hello, I found you through MediNavi JAPAN.\nI would like an online medical consultation. Please help me with access and booking.\nPreferred language: [please enter]',
    es: 'Hola, les contacto desde MediNavi JAPAN. Mi idioma preferido es el español.\nQuisiera una consulta médica en línea. Necesito ayuda para acceder al servicio y reservar.',
  };
  const url = new URL(base);
  url.searchParams.set('text', copy[language]);
  return url.href;
}

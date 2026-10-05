// Operator confirmed WhatsApp reception for this business number on 2026-10-05.
// Environment scoping controls which deployments expose the enquiry link.
export function whatsAppLinkFromConfig(enabled: string | undefined): string | null {
  return enabled === 'true' ? 'https://wa.me/817090369655' : null;
}

export type EnquiryLanguage = 'ja' | 'en' | 'es';
export type EnquiryTopic = 'clinic' | 'online' | 'preparation' | 'documents';
export const ENQUIRY_TOPICS: EnquiryTopic[] = ['clinic', 'online', 'preparation', 'documents'];

export function whatsAppEnquiryLink(base: string | null, language: EnquiryLanguage, topic: EnquiryTopic): string | null {
  if (base !== 'https://wa.me/817090369655') return null;
  const copy = {
    ja: { greeting: 'MediNavi JAPANを見て連絡しました。希望言語は、やさしい日本語です。', clinic: '受診先の探し方を相談したいです。', online: 'オンライン診療について相談したいです。', preparation: '受診の準備について相談したいです。', documents: '保険用の書類について相談したいです。' },
    en: { greeting: 'Hello, I found you through MediNavi JAPAN. My preferred language is English.', clinic: 'I would like help finding a clinic.', online: 'I would like to ask about online medical care.', preparation: 'I would like help preparing for a clinic visit.', documents: 'I would like to ask about documents for my insurance.' },
    es: { greeting: 'Hola, les contacto desde MediNavi JAPAN. Mi idioma preferido es el español.', clinic: 'Quisiera orientación para encontrar una clínica.', online: 'Quisiera consultar sobre atención médica en línea.', preparation: 'Quisiera orientación para preparar una visita médica.', documents: 'Quisiera consultar sobre documentos para mi seguro.' },
  };
  const content = copy[language];
  const url = new URL(base);
  url.searchParams.set('text', `${content.greeting}\n${content[topic]}`);
  return url.href;
}

"use client";

import { useLanguage } from '@/components/LanguageProvider';

export type LegalSection = { heading: string; body: string[] };
export type LegalText = { title: string; intro: string; sections: LegalSection[] };

/** Shows the Japanese original to Japanese readers and the English translation to everyone else. */
export function LegalDocument({ ja, en, effectiveDate }: { ja: LegalText; en: LegalText; effectiveDate: string }) {
  const { language, t } = useLanguage();
  const doc = language === 'ja' ? ja : en;
  return (
    <article lang={language === 'ja' ? 'ja' : 'en'} className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{doc.title}</h1>
        <p className="text-sm text-slate-500">{t('legal.lastUpdated')}: {effectiveDate}</p>
        {language !== 'ja' && <p className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">{t('legal.japanesePrevails')}</p>}
      </header>
      <p className="text-sm leading-relaxed text-slate-700">{doc.intro}</p>
      {doc.sections.map((section, index) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">{index + 1}. {section.heading}</h2>
          {section.body.map((paragraph, i) => <p key={i} className="text-sm leading-relaxed text-slate-700">{paragraph}</p>)}
        </section>
      ))}
    </article>
  );
}

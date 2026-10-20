'use client';

import { useLanguage } from './LanguageProvider';

export function NationalCoverage({ counts, selected }: { counts?: Record<string, number>; selected?: string }) {
  const { t } = useLanguage();
  const covered = counts && Object.values(counts).filter(count => count > 0).length;
  const missing = selected && counts && counts[selected] === 0;
  return <aside className="space-y-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-slate-700">
    {covered !== undefined && <p className="font-bold">{t('nation.coverage')}: {covered} / 47</p>}
    <p>{t(missing ? 'nation.noData' : covered === 47 ? 'nation.officialData' : 'nation.partial')}</p>
    <a href="https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2300/initialize" target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 font-bold text-brand-700 underline underline-offset-4">{t('nation.official')} ↗</a>
    <p className="text-xs text-slate-500">{t('nation.officialHint')}</p>
  </aside>;
}

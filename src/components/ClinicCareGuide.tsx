'use client';
import { useState } from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import type { Hospital } from '@/types';

export function ClinicCareGuide({ hospital }: { hospital: Hospital }) {
  const { language, t } = useLanguage();
  const guide = hospital.careGuide;
  return <section className="mx-6 mt-6 sm:mx-8 rounded-2xl border border-brand-200 bg-brand-50/40 p-5 space-y-4">
    <h2 className="text-lg font-bold text-slate-900">{t('care.title')}</h2>
    {guide ? <>
      <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-slate-700">{guide.notes[language].map(note => <li key={note}>{note}</li>)}</ul>
      <p className="text-xs text-slate-500">{t('home.badgeVerified')}</p>
      <div className="flex flex-wrap gap-3">
        {guide.bookingUrl && <a href={guide.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white">{t('care.book')}<ExternalLink className="w-4 h-4 shrink-0" /></a>}
        {guide.onlineInfoUrl && <a href={guide.onlineInfoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-300 px-4 py-3 text-sm font-bold text-brand-700">{t('care.online')}<ExternalLink className="w-4 h-4 shrink-0" /></a>}
      </div>
      <details className="text-xs text-slate-600"><summary className="cursor-pointer py-2">{t('care.source')} · {t('care.checked')}: {guide.sources[0]?.checkedAt}</summary><ul className="mt-2 space-y-2">{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="break-all underline">{source.url}</a> · {source.checkedAt}</li>)}</ul></details>
    </> : <p className="text-sm leading-relaxed text-slate-600">{t('care.unknown')}</p>}
  </section>;
}

export function JapaneseAddress({ hospital }: { hospital: Hospital }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'copied' | 'copyFailed'>('idle');
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${hospital.name.ja}\n${hospital.address.ja}`); setStatus('copied'); }
    catch { setStatus('copyFailed'); }
  };
  return <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
    <p className="text-xs text-slate-500">{t('care.japaneseAddress')}</p>
    <p lang="ja" className="select-text text-sm font-medium text-slate-800">{hospital.address.ja}</p>
    <button onClick={copy} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-brand-700"><Copy className="w-4 h-4" />{t('care.copyAddress')}</button>
    {status !== 'idle' && <p role="status" className="text-xs text-slate-600">{t(`care.${status}`)}</p>}
  </div>;
}

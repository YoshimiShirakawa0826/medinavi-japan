"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { AlertCircle, Phone, Info, MapPin, Languages, ChevronDown, ChevronUp, Copy, Check, ExternalLink, Hospital, Briefcase, Wallet, Headphones } from 'lucide-react';
import { useState } from 'react';
import { useGeolocation, isGeoFailureStatus } from '@/lib/geo';
import { EMERGENCY_CONTACTS, jntoMedicalSearchUrl, tokyoForeignMedicalInfoUrl, NABII_URL } from '@/lib/emergency-contacts';

export function EmergencyGuide() {
  const { language, t } = useLanguage();
  const geo = useGeolocation();
  const [showPhrases, setShowPhrases] = useState(true);
  const [copied, setCopied] = useState(false);

  // #7119 はリンク発信が保証できないため、番号をクリップボードにコピーできるようにする。
  const copy7119 = async () => {
    try {
      await navigator.clipboard.writeText('#7119');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const phrases = [
    { ja: '救急車をお願いします。', pron: 'Kyūkyūsha o onegai shimasu.', meaning: t('em.phrase1.meaning') },
    { ja: '場所は［現在地の住所・建物名］です。', pron: 'Basho wa [address / building name] desu.', meaning: t('em.phrase2.meaning') },
    { ja: t('em.phrase3.ja'), pron: t('em.phrase3.pron'), meaning: t('em.phrase3.meaning') },
    { ja: '旅行者です。日本の健康保険はありません。', pron: 'Ryokōsha desu. Nihon no kenkō hoken wa arimasen.', meaning: t('em.phrase4.meaning') },
  ];

  const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-emergency-700 text-xs px-3 py-1 rounded-full font-bold border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden /> {t('em.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t('em.title')}</h1>
        <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">{t('em.lead')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 119 */}
        <section aria-labelledby="em-119" className="relative overflow-hidden bg-gradient-to-br from-emergency-600 to-rose-700 text-white p-7 rounded-3xl shadow-xl shadow-rose-900/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="bg-white/15 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider">{t('em.119.badge')}</span>
              <span className="text-[11px] font-bold text-rose-100">{t('common.hours24')}</span>
            </div>
            <h2 id="em-119" className="text-2xl font-black">{t('em.119.title')}</h2>
            <p className="text-sm text-rose-50 font-semibold leading-relaxed">{t('em.119.desc')}</p>
            <p className="bg-white/10 border border-white/10 rounded-2xl p-4 text-xs font-semibold leading-relaxed">{t('em.119.interp')}</p>
          </div>
          <a href="tel:119" className="mt-6 w-full inline-flex items-center justify-center px-6 py-4 text-lg font-bold rounded-2xl bg-white text-emergency-600 hover:bg-rose-50 transition-all shadow-md">
            <Phone className="w-5 h-5 mr-2" aria-hidden /> {t('common.call119')}
          </a>
        </section>

        {/* #7119 — Japanese only */}
        <section aria-labelledby="em-7119" className="bg-white border border-slate-200 p-7 rounded-3xl shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-extrabold">#7119</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-[11px] font-extrabold">{t('common.japaneseOnly')}</span>
            </div>
            <h2 id="em-7119" className="text-xl font-black text-slate-900">{t('em.7119.title')}</h2>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">{t('em.7119.desc')}</p>
            <p className="text-xs text-brand-700 font-bold leading-relaxed">{t('em.7119.inYourLanguage')}</p>
          </div>
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-5 py-3">
              <span className="text-2xl font-black text-brand-700 tabular-nums">#7119</span>
              <div className="flex gap-2">
                <button onClick={copy7119} aria-live="polite" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-700 bg-white border border-brand-200 hover:bg-brand-100">
                  {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                  {copied ? t('emergency.copied') : t('emergency.copyNumber')}
                </button>
                <a href="tel:%237119" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700">
                  <Phone className="w-4 h-4" aria-hidden /> {t('common.call')}
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">{t('em.7119.alt')}</p>
            <a href={EMERGENCY_CONTACTS.tokyo7119Alt.href} className="w-full inline-flex items-center justify-center px-4 py-3 rounded-2xl text-sm font-bold text-brand-700 bg-white border border-brand-300 hover:bg-brand-50">
              <Phone className="w-4 h-4 mr-2" aria-hidden /> {t('em.7119.callAlt')}
            </a>
          </div>
        </section>
      </div>

      {/* Help in your language */}
      <section aria-labelledby="em-ml" className="rounded-3xl border border-brand-200 bg-brand-50/40 p-6 sm:p-8 space-y-4">
        <h2 id="em-ml" className="flex items-center gap-2 text-xl font-black text-slate-900"><Headphones className="w-5 h-5 text-brand-600" aria-hidden />{t('em.ml.title')}</h2>
        <p className="text-sm text-slate-600">{t('em.ml.lead')}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: 'em.himawari.name', desc: 'em.himawari.desc', contact: EMERGENCY_CONTACTS.himawari },
            { name: 'em.jnto.name', desc: 'em.jnto.desc', contact: EMERGENCY_CONTACTS.jntoHotline },
          ].map(({ name, desc, contact }) => (
            <div key={name} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">{t(name)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t(desc)}</p>
                <p className="text-lg font-black tabular-nums text-slate-900">{contact.display}</p>
              </div>
              <a href={contact.href} className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700">
                <Phone className="w-4 h-4 mr-2" aria-hidden /> {t('common.call')}
              </a>
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-slate-700">{t('em.police')}</p>
      </section>

      {/* Hospitals / ER */}
      <section aria-labelledby="em-hosp" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <h2 id="em-hosp" className="flex items-center gap-2 text-xl font-black text-slate-900"><Hospital className="w-5 h-5 text-brand-600" aria-hidden />{t('em.hosp.title')}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{t('em.hosp.desc')}</p>
        <ul className="space-y-2">
          {[
            { href: jntoMedicalSearchUrl(language), label: 'em.hosp.jnto' },
            { href: tokyoForeignMedicalInfoUrl(language), label: 'em.hosp.tokyo' },
            { href: NABII_URL, label: 'em.hosp.nabii' },
          ].map(link => (
            <li key={link.label}>
              <a href={link.href} {...external} aria-label={`${t(link.label)} (${t('common.opensExternal')})`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
                {t(link.label)} <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* What to bring + costs */}
      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="em-prep" className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3">
          <h2 id="em-prep" className="flex items-center gap-2 text-lg font-black text-slate-900"><Briefcase className="w-5 h-5 text-brand-600" aria-hidden />{t('em.prep.title')}</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>{t('em.prep.passport')}</li>
            <li>{t('em.prep.insurance')}</li>
            <li>{t('em.prep.meds')}</li>
            <li>{t('em.prep.pay')}</li>
          </ul>
        </section>
        <section aria-labelledby="em-cost" className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3">
          <h2 id="em-cost" className="flex items-center gap-2 text-lg font-black text-slate-900"><Wallet className="w-5 h-5 text-brand-600" aria-hidden />{t('em.cost.title')}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{t('em.cost.desc')}</p>
        </section>
      </div>

      {/* Location */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-800"><MapPin className="w-5 h-5 text-brand-600" aria-hidden />{t('emergency.locationTitle')}</h2>
        <p className="text-sm text-slate-600">{t('emergency.locationPrompt')}</p>
        <button onClick={() => geo.request()} disabled={geo.status === 'prompting'} className="rounded-xl bg-brand-600 px-5 py-3 font-bold text-white disabled:opacity-50">
          {t(geo.status === 'prompting' ? 'btn.locating' : 'distance.useLocation')}
        </button>
        {isGeoFailureStatus(geo.status) && <p role="alert" className="text-sm text-amber-800">{t(`location.${geo.status}`)}</p>}
        {geo.coords && <div className="rounded-2xl border bg-white p-4 space-y-3">
          <p className="font-bold">{t('emergency.coordinates')}: {geo.coords.lat.toFixed(5)}, {geo.coords.lng.toFixed(5)}</p>
          <p className="text-sm text-slate-600">{t('emergency.locationHelp')}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${geo.coords.lat},${geo.coords.lng}`} {...external} className="inline-block text-sm font-bold text-brand-600">{t('btn.openMap')}</a>
        </div>}
      </section>

      {/* Phrases */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <button onClick={() => setShowPhrases(!showPhrases)} aria-expanded={showPhrases} className="w-full flex items-center justify-between font-bold text-slate-800">
          <span className="flex items-center gap-2"><Languages className="w-5 h-5 text-brand-600" aria-hidden />{t('em.phrases.title')}</span>
          {showPhrases ? <ChevronUp className="w-5 h-5" aria-hidden /> : <ChevronDown className="w-5 h-5" aria-hidden />}
        </button>
        {showPhrases && (
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <p className="text-xs text-slate-500 font-bold">{t('emergency.sayThis')}</p>
            {phrases.map((phrase, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-start gap-4">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded-md">{index + 1}</span>
                <div>
                  <p lang="ja" className="text-base font-bold text-slate-800">「{phrase.ja}」</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">{t('em.phrases.pron')}: {phrase.pron}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">{t('em.phrases.meaning')}: {phrase.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500 text-center">{t('em.offline')}</p>

      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-amber-800">{t('em.disclaimer.title')}</h2>
          <p className="text-amber-800 text-xs leading-relaxed font-semibold">{t('em.disclaimer.body')}</p>
        </div>
      </div>
    </div>
  );
}

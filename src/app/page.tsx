'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Stethoscope, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { departments } from '@/types';
import { AREA_PRESETS, getGeoFailureStatus, isGeoFailureStatus, type GeoStatus } from '@/lib/geo';
import { saveSearchLocation } from '@/lib/search-state';

export default function Home() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [area, setArea] = useState('');
  const [careLanguage, setCareLanguage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [department, setDepartment] = useState('');
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [locationStatus, setLocationStatus] = useState<GeoStatus>('idle');
  const params = () => {
    const p = new URLSearchParams();
    if (area) { p.set('area', area); p.set('location', 'manual'); p.set('dist', 'near'); }
    if (careLanguage) p.set('lang', careLanguage);
    if (keyword.trim()) p.set('q', keyword.trim());
    if (department) p.set('dept', department);
    Object.entries(filters).forEach(([key, value]) => { if (value) p.set(key, 'true'); });
    return p;
  };
  const findNearby = () => {
    if (!navigator.geolocation) { setLocationStatus('unsupported'); return; }
    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (!saveSearchLocation(coords)) { setLocationStatus('error'); return; }
      const p = params();
      p.delete('area'); p.set('location', 'device'); p.set('dist', 'near');
      router.push(`/hospitals?${p}`);
    }, error => setLocationStatus(getGeoFailureStatus(error)), { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  };
  const inputClass = 'w-full min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900';

  return <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
    <Link href="/emergency" className="block rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{t('home.emergencyShort')} <ArrowRight className="inline w-4 h-4" /></Link>
    <div className="space-y-3 text-center sm:py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-700">MediNavi JAPAN · Tokyo</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{t('home.subtitle')}</h1>
      <p className="text-sm text-slate-600">{t('home.badgeVerified')}</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { href: '#clinic-search', title: 'home.inPerson', note: 'home.inPersonNote', Icon: MapPin },
        { href: `/symptoms?${params()}`, title: 'home.symptomEntry', note: 'home.symptomNote', Icon: Stethoscope },
        { href: '/consultation', title: 'home.onlineEntry', note: 'home.onlineNote', Icon: MessageCircle },
      ].map(({ href, title, note, Icon }) => <Link key={title} href={href} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-400 hover:shadow-md transition-all">
        <Icon className="h-6 w-6 shrink-0 text-brand-600" aria-hidden />
        <div><h2 className="text-sm font-bold text-slate-900">{t(title)}</h2><p className="text-xs text-slate-500 mt-1">{t(note)}</p></div>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </Link>)}
    </div>
    <section id="clinic-search" className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-900">{t('search.title')}</h2>
      <form role="search" onSubmit={event => { event.preventDefault(); router.push(`/hospitals?${params()}`); }} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-bold text-slate-700"><span>{t('home.areaLabel')}</span>
            <select value={area} onChange={event => setArea(event.target.value)} className={inputClass}><option value="">{t('home.allAreas')}</option>{AREA_PRESETS.map(item => <option key={item.name} value={item.name}>{t(`area.${item.name}`)}</option>)}</select>
          </label>
          <label className="space-y-2 text-sm font-bold text-slate-700"><span>{t('search.language')}</span>
            <select value={careLanguage} onChange={event => setCareLanguage(event.target.value)} className={inputClass}><option value="">{t('home.anyLanguage')}</option><option value="en">English</option><option value="ja">日本語</option><option value="zh">中文</option><option value="ko">한국어</option><option value="es">Español</option></select>
          </label>
        </div>
        <label className="block space-y-2 text-sm font-bold text-slate-700"><span>{t('search.keyword')}</span><input type="search" maxLength={120} value={keyword} onChange={event => setKeyword(event.target.value)} placeholder={t('search.placeholder')} className={inputClass} /></label>
        <details className="rounded-xl border border-slate-200 px-4 py-3">
          <summary className="cursor-pointer min-h-8 text-sm font-bold text-slate-700">{t('ux.filterDetails')}</summary>
          <div className="pt-3 space-y-4">
            <label className="block space-y-2 text-sm font-bold text-slate-700"><span>{t('search.department')}</span><select value={department} onChange={event => setDepartment(event.target.value)} className={inputClass}><option value="">{t('home.anyDepartment')}</option>{departments.map(item => <option key={item.id} value={item.id}>{item.name[language]}</option>)}</select></label>
            <div className="grid gap-2 sm:grid-cols-2">{[
              ['open', 'filter.openNow'], ['walkin', 'filter.walkIn'], ['selfpay', 'filter.selfPay'], ['card', 'filter.creditCard'], ['insurance', 'filter.insurance'], ['nightweekend', 'filter.nightWeekend'],
            ].map(([key, label]) => <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><input type="checkbox" checked={!!filters[key]} onChange={event => setFilters(current => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-indigo-600" />{t(label)}</label>)}</div>
          </div>
        </details>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="submit" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-700"><Search className="h-5 w-5" />{t('search.button')}</button>
          <button type="button" onClick={findNearby} disabled={locationStatus === 'prompting'} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-300 px-5 py-3 font-bold text-brand-700 disabled:opacity-50"><MapPin className="h-5 w-5" />{t(locationStatus === 'prompting' ? 'btn.locating' : 'distance.useLocation')}</button>
        </div>
        {isGeoFailureStatus(locationStatus) && <p role="alert" className="text-sm text-amber-800">{t(`${locationStatus === 'denied' || locationStatus === 'unsupported' ? 'distance' : 'location'}.${locationStatus}`)}</p>}
        <p className="text-xs leading-relaxed text-slate-500">{t('distance.consent')}</p>
      </form>
    </section>
    <p className="px-2 text-xs leading-relaxed text-slate-500">{t('trust.banner')}</p>
  </div>;
}

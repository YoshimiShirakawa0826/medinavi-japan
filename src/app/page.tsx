'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, LocateFixed, Search, ArrowRight, Stethoscope, ChevronDown, Languages, ShieldCheck, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { patientText } from '@/components/patient-messages';
import { EmergencyStrip, PatientSteps } from '@/components/PatientUI';
import { departments } from '@/types';
import { AREA_PRESETS, getGeoFailureStatus, isGeoFailureStatus, type GeoStatus } from '@/lib/geo';
import { readSearchLocation, saveSearchLocation } from '@/lib/search-state';

function SearchHome() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const p = (key: Parameters<typeof patientText>[1]) => patientText(language, key);
  const [area, setArea] = useState(params.get('area') || '');
  const [visitLanguage, setVisitLanguage] = useState(params.get('lang') || '');
  const [department, setDepartment] = useState(params.get('dept') || '');
  const [keyword, setKeyword] = useState(params.get('q') || '');
  const [radius, setRadius] = useState(params.get('dist') || '3');
  const [purpose, setPurpose] = useState(params.get('purpose') || '');
  const [filters, setFilters] = useState<Record<string, boolean>>(() => Object.fromEntries(['open', 'card', 'walkin', 'insurance', 'nightweekend', 'selfpay'].map(key => [key, params.get(key) === 'true'])));
  const [locationStatus, setLocationStatus] = useState<GeoStatus>('idle');
  const [useDevice, setUseDevice] = useState(false);
  const [navigating, setNavigating] = useState(false);
  function findLocation() {
    if (!navigator.geolocation) { setLocationStatus('unsupported'); return; }
    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(position => {
      saveSearchLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      if (!readSearchLocation()) { setLocationStatus('error'); return; }
      setArea(''); setUseDevice(true); setLocationStatus('granted');
    }, error => { setUseDevice(false); setLocationStatus(getGeoFailureStatus(error)); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }
  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (area) { next.set('area', area); next.set('location', 'manual'); next.set('dist', radius); }
    if (useDevice) { next.set('location', 'device'); next.set('dist', radius); }
    if (visitLanguage) next.set('lang', visitLanguage);
    if (department) next.set('dept', department);
    if (keyword.trim()) next.set('q', keyword.trim());
    if (purpose) next.set('purpose', purpose);
    Object.entries(filters).forEach(([key, active]) => { if (active) next.set(key, 'true'); });
    setNavigating(true);
    router.push(`/hospitals${next.size ? `?${next}` : ''}`);
  }
  return <div className="patient-container home-container">
    <EmergencyStrip />
    <div className="home-intro"><PatientSteps /><h1>{p('title')}</h1><p>{p('intro')}</p></div>
    <div className="home-grid">
      <form role="search" onSubmit={search} className="patient-panel search-panel">
        <section className="search-section">
          <h2><span className="field-number">1</span>{p('where')}</h2>
          <div className="location-grid">
            <button type="button" className={`patient-secondary location-button ${useDevice ? 'selected' : ''}`} disabled={locationStatus === 'prompting'} onClick={findLocation} aria-pressed={useDevice}><LocateFixed size={19} />{t(locationStatus === 'prompting' ? 'btn.locating' : 'distance.useLocation')}</button>
            <label className="field-label"><span>{p('area')}</span><select value={area} onChange={event => { setArea(event.target.value); setUseDevice(false); setLocationStatus('idle'); }}><option value="">{p('allTokyo')}</option>{AREA_PRESETS.map(a => <option key={a.name} value={a.name}>{t(`area.${a.name}`)}</option>)}</select></label>
          </div>
          <p className="muted" role="status">{useDevice ? p('locationSelected') : isGeoFailureStatus(locationStatus) ? t(`location.${locationStatus}`) : p('locationOptional')}</p>
          {(area || useDevice) && <div className="radius-row"><span>{p('range')}</span><select aria-label={p('range')} value={radius} onChange={event => setRadius(event.target.value)}>{[1, 3, 5, 10].map(km => <option key={km} value={km}>{km} km</option>)}<option value="near">{p('noLimit')}</option></select></div>}
          <details className="privacy-detail"><summary>{p('locationPrivacy')}</summary><p>{t('distance.consent')}</p></details>
        </section>
        <section className="search-section">
          <h2><span className="field-number">2</span>{p('language')}</h2>
          <div className="language-options">{[{code:'',name:p('anyLanguage')},{code:'ja',name:'日本語'},{code:'en',name:'English'},{code:'zh',name:'中文'},{code:'ko',name:'한국어'},{code:'es',name:'Español'}].map(item => <button key={item.code} type="button" aria-pressed={visitLanguage === item.code} className={visitLanguage === item.code ? 'selected' : ''} onClick={() => setVisitLanguage(item.code)}>{item.name}</button>)}</div>
          <p className="muted">{p('languageHint')}</p>
        </section>
        <section className="search-section">
          <h2><span className="field-number">3</span>{p('department')}</h2>
          <label className="sr-only" htmlFor="home-department">{p('department')}</label>
          <select id="home-department" value={department} onChange={event => setDepartment(event.target.value)}><option value="">{p('unsure')}</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name[language]}</option>)}</select>
          <Link className="patient-text-link" href="/symptoms"><Stethoscope size={17} />{p('symptoms')}<ArrowRight size={16} /></Link>
        </section>
        <details className="additional-filters">
          <summary><span>{p('additional')} <small>{p('optional')}{Object.values(filters).filter(Boolean).length > 0 ? ` · ${Object.values(filters).filter(Boolean).length}` : ''}</small></span><ChevronDown size={18} /></summary>
          <div className="filter-checks">{[{key:'open',label:'filter.openNow'},{key:'walkin',label:'filter.walkIn'},{key:'card',label:'filter.creditCard'},{key:'insurance',label:'filter.insurance'},{key:'nightweekend',label:'filter.nightWeekend'},{key:'selfpay',label:'filter.selfPay'}].map(f => <label key={f.key}><input type="checkbox" checked={filters[f.key]} onChange={event => setFilters(current => ({...current,[f.key]:event.target.checked}))} /><span>{t(f.label)}</span></label>)}</div>
          <p className="muted">{t('access.partial')}</p>
          <label className="field-label"><span>{p('purpose')}</span><select value={purpose} onChange={event => setPurpose(event.target.value)}><option value="">{p('any')}</option><option value="general">{p('generalPurpose')}</option><option value="cosmetic">{p('cosmeticPurpose')}</option></select></label><p className="muted">{p('purposeHint')}</p>
        </details>
        <details className="keyword-disclosure" open={keyword ? true : undefined}><summary><Search size={15} />{t('search.keyword')}</summary><label className="sr-only" htmlFor="home-keyword">{t('search.keyword')}</label><input id="home-keyword" type="search" value={keyword} maxLength={120} placeholder={t('search.placeholder')} onChange={event => setKeyword(event.target.value)} /></details>
        <button type="submit" className="patient-primary home-submit" disabled={navigating || locationStatus === 'prompting'}><Search size={20} />{navigating ? t('clinic.loading') : p('search')}<ArrowRight size={19} /></button>
        <p className="search-footnote">{t('home.badgeVerified')}</p>
      </form>
      <aside className="home-aside">
        <section className="care-guide"><span className="guide-icon"><Languages size={26} /></span><h2>{p('firstVisit')}</h2><p>{p('firstHint')}</p><ol><li><span>01</span>{p('find')}</li><li><span>02</span>{p('check')}</li><li><span>03</span>{p('contact')}</li></ol></section>
        <section className="aside-note"><ShieldCheck size={21} /><div><h2>{p('freeSearch')}</h2><p>{p('noLogin')}</p></div></section>
        <section className="aside-note"><MapPin size={21} /><div><h2>{t('home.badgeData')}</h2><p>{t('access.partial')}</p></div></section>
        <Link href="/consultation" className="help-card"><MessageCircle size={21} /><div><h2>{p('needHelp')}</h2><p>{t('nav.online')} · {t('common.paid')}</p><span>{p('paidHint')} <ArrowRight size={14} /></span></div></Link>
      </aside>
    </div>
  </div>;
}

export default function Home() { return <Suspense fallback={<div className="patient-container">MediNavi JAPAN</div>}><SearchHome /></Suspense>; }

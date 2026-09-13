"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { hasWebsiteReview, matchesAccess } from '@/lib/clinic-access';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Hospital, Language, departments } from '@/types';
import { MapPin, Phone, ArrowLeft, ArrowRight, ExternalLink, LocateFixed, X, SlidersHorizontal } from 'lucide-react';
import { patientText } from '@/components/patient-messages';
import { EmergencyStrip, PatientSteps, VisitSummary } from '@/components/PatientUI';
import { matchesPurpose } from '@/lib/clinic-access';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Suspense } from 'react';
import { clinicMapUrl, hasClinicCoordinates, loadClinics, matchesDepartment, pageWindow, scheduledOpenStatus } from '@/lib/clinic-utils';
import { telephoneHref, nabiiClinicUrl } from '@/lib/clinic-contact';
import { matchesKeyword, searchRadius, updateSearch, readSearchLocation, saveSearchLocation, RESULT_PAGE_SIZE, weekendStatus } from '@/lib/search-state';
import {
  useGeolocation, distanceKm, formatDistance, DISTANCE_OPTIONS, AREA_PRESETS,
} from '@/lib/geo';

// スマホでも操作しやすい20件単位。全件をページ切替で閲覧できる。
const RESULT_CAP = RESULT_PAGE_SIZE;

function HospitalsContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const p = (key: Parameters<typeof patientText>[1]) => patientText(language, key);
  const purposeFilter = searchParams.get('purpose');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // 取得後30分以内の座標だけ端末内で引き継ぐ。URLには含めない。
  const [seededCoords, setSeededCoords] = useState<{ lat: number; lng: number } | null>(null);
  const distParam = searchParams.get('dist'); // '1'|'3'|'5'|'10'|'near'

  useEffect(() => {
    const controller = new AbortController();
    loadClinics(controller.signal)
      .then((data: Hospital[]) => {
        if (controller.signal.aborted) return;
        const now = new Date();
        const updated = data.map(h => ({ ...h, isOpenNow: scheduledOpenStatus(h, now) }));
        setHospitals(updated);
        setLoading(false);
        // Keep the location on this device for 30 minutes, including a detail/list round trip.
        setSeededCoords(readSearchLocation());
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoadError(true);
        setLoading(false);
      });
    const timer = setInterval(() => {
      const now = new Date();
      setHospitals(current => current.map(h => ({ ...h, isOpenNow: scheduledOpenStatus(h, now) })));
    }, 60_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);

  // Filter params
  const deptFilter = searchParams.get('dept');
  const langFilter = searchParams.get('lang');
  const openNowFilter = searchParams.get('open') === 'true';
  const engTodayFilter = searchParams.get('engtoday') === 'true';
  const cardFilter = searchParams.get('card') === 'true';
  const insuranceFilter = searchParams.get('insurance') === 'true';
  const nightWeekendFilter = searchParams.get('nightweekend') === 'true';
  const walkInFilter = searchParams.get('walkin') === 'true';
  const verifiedFilter = searchParams.get('verified') === 'true';
  const reviewedFilter = searchParams.get('reviewed') === 'true';
  const selfPayFilter = searchParams.get('selfpay') === 'true';
  const keyword = searchParams.get('q') || '';

  // 距離検索には、現在地取得または明示的な駅選択が必要。
  const geo = useGeolocation();

  // 現在地の利用有無にかかわらず、エリア・駅を選べる。
  const manualPoint = AREA_PRESETS.find(a => a.name === searchParams.get('area')) ?? null;

  // 実際の現在地（一覧のボタン取得 or ホームからの受け渡し）。
  const wantsDevice = searchParams.get('location') === 'device' || (distParam === 'near' && !manualPoint && searchParams.get('location') !== 'manual');
  const realCoords = wantsDevice && !manualPoint ? geo.coords ?? seededCoords : null;

  // 選択されていない場所を現在地や検索の基準点として使わない。
  const refPoint = realCoords ?? manualPoint;
  const usingRealLocation = !!realCoords;
  const activeRadius = searchRadius(distParam, !!refPoint);
  const needsAreaSelection = !refPoint;
  const showDistance = !!refPoint;
  const changeSearch = (changes: Record<string, string | null>) => {
    // Filtering uses data already loaded on this page. Next.js synchronizes
    // native history updates with useSearchParams without a server navigation.
    window.history.replaceState(null, '', updateSearch(searchParams.toString(), changes));
    resultsRef.current?.scrollTo({ top: 0 });
  };

  // 駅を選んだときも近い順にする。距離計算は端末内で行う。
  const selectArea = (a: { name: string; lat: number; lng: number }) => {
    geo.clear();
    setSeededCoords(null);
    saveSearchLocation(null);
    setMapTarget(null);
    changeSearch({ area: a.name, location: 'manual', dist: typeof activeRadius === 'number' ? String(activeRadius) : '3' });
  };

  const requestLocation = () => {
    setSeededCoords(null);
    saveSearchLocation(null);
    setMapVisible(false);
    setMapTarget(null);
    changeSearch({ area: null, location: 'device', dist: '3' });
    geo.request(coords => { setSeededCoords(coords); saveSearchLocation(coords); });
  };

  const clearFilters = () => {
    geo.clear();
    setSeededCoords(null);
    saveSearchLocation(null);
    setMapTarget(null);
    setMapVisible(false);
    window.history.replaceState(null, '', '/hospitals');
  };

  // 地図表示（要件3: 初期はリストのみ。ユーザーが「地図を表示」を押したときだけ OSM を読み込む）。
  // OpenStreetMap 埋め込みはキー不要・無料で、Google Maps API 課金は一切発生しない。
  const [mapVisible, setMapVisible] = useState(false);
  const [mapSupported, setMapSupported] = useState(false);
  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number; name: string; url: string } | null>(null);
  const mapCenter = mapTarget ?? (refPoint ? { ...refPoint, name: manualPoint ? t(`area.${manualPoint.name}`) : t('distance.useLocation') } : null);
  const openMap = () => {
    // OSM's embedded map needs WebGL. Check only after an explicit map action.
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      setMapSupported(!!context);
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setMapSupported(false);
    }
    setMapVisible(true);
  };
  const osmSrc = (lat: number, lng: number) => {
    const d = 0.012; // 約1km四方
    const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  };
  const showClinicOnMap = (hospital: Hospital) => {
    setMapTarget({ lat: hospital.latitude, lng: hospital.longitude, name: hospital.name[language] || hospital.name.en || hospital.name.ja, url: clinicMapUrl(hospital) });
    openMap();
    mapRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  useEffect(() => {
    if (mapVisible && mapTarget) mapRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [mapVisible, mapTarget]);

  // フィルタ→Haversine距離付与→（距離モード時）半径絞り込み＆近い順ソート。
  // 無関係な状態変化（地図の開閉・コピー等）での再計算を避けるため useMemo でメモ化する。
  const processed = useMemo(() => {
    const filtered = hospitals.filter(h => {
      if (!matchesDepartment(h, deptFilter)) return false;
      if (!matchesPurpose(h, purposeFilter)) return false;
      if (!matchesKeyword(h, keyword)) return false;
      if (langFilter && !h.supportedLanguages.includes(langFilter as Language)) return false;
      if (openNowFilter && !h.isOpenNow) return false;
      if (engTodayFilter && !h.supportedLanguages.includes('en')) return false;
      if (cardFilter && !matchesAccess(h, 'creditCardAccepted')) return false;
      if (insuranceFilter && !matchesAccess(h, 'overseasInsuranceAccepted')) return false;
      if (nightWeekendFilter && !h.accessInfo?.nightOpen && weekendStatus(h) !== true) return false;
      if (walkInFilter && !matchesAccess(h, 'walkInAvailable', deptFilter, langFilter)) return false;
      if (reviewedFilter && !hasWebsiteReview(h)) return false;
      if (verifiedFilter && h.verification?.status !== 'verified') return false;
      if (selfPayFilter && !h.accessInfo?.selfPayAvailable) return false;
      return true;
    });
    let arr = filtered.map(h => ({ h, dist: refPoint ? distanceKm(refPoint, h.latitude, h.longitude) : Infinity }));
    if (activeRadius !== 'off') {
      if (typeof activeRadius === 'number') arr = arr.filter(x => x.dist <= activeRadius);
      arr = arr.sort((a, b) => a.dist - b.dist);
    }
    return arr;
  }, [
    hospitals, refPoint, activeRadius, keyword, purposeFilter,
    deptFilter, langFilter, openNowFilter, engTodayFilter, cardFilter,
    insuranceFilter, nightWeekendFilter, walkInFilter, verifiedFilter, reviewedFilter, selfPayFilter,
  ]);

  const pagination = pageWindow(processed.length, searchParams.get('page'), RESULT_CAP);
  const visible = processed.slice(pagination.start, pagination.end);
  const goToPage = (page: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(page));
    window.history.replaceState(null, '', `/hospitals?${p}`);
    resultsRef.current?.scrollTo({ top: 0 });
    resultsRef.current?.scrollIntoView({ block: 'start' });
  };

  const getDeptNames = (deptIds: string[]) => {
    return deptIds.map(id => {
      const d = departments.find(d => d.id === id);
      return d ? (d.name[language as keyof typeof d.name] || d.name.en) : id;
    }).join(', ');
  };

  // D: 適用中フィルタのチップ表示。× で該当パラメータを URL から除去（distance は専用UIのため対象外）。
  const langName = (code: string) =>
    code === 'en' ? 'English' : code === 'zh' ? '中文' : code === 'ko' ? '한국어' : code === 'es' ? 'Español' : '日本語';
  const removeFilter = (key: string) => {
    changeSearch({ [key]: null });
  };
  const activeFilters: Array<{ key: string; label: string }> = [];
  if (purposeFilter) activeFilters.push({key: 'purpose', label: p(purposeFilter === 'general' ? 'generalPurpose' : 'cosmeticPurpose')});
  if (keyword) activeFilters.push({ key: 'q', label: keyword });
  if (deptFilter)        activeFilters.push({ key: 'dept',         label: getDeptNames([deptFilter]) });
  if (langFilter)        activeFilters.push({ key: 'lang',         label: langName(langFilter) });
  if (openNowFilter)     activeFilters.push({ key: 'open',         label: t('filter.openNow') });
  if (engTodayFilter)    activeFilters.push({ key: 'engtoday',     label: t('filter.englishToday') });
  if (cardFilter)        activeFilters.push({ key: 'card',         label: t('filter.creditCard') });
  if (insuranceFilter)   activeFilters.push({ key: 'insurance',    label: t('filter.insurance') });
  if (nightWeekendFilter) activeFilters.push({ key: 'nightweekend', label: t('filter.nightWeekend') });
  if (walkInFilter)      activeFilters.push({ key: 'walkin',       label: t('filter.walkIn') });
  if (verifiedFilter)    activeFilters.push({ key: 'verified',     label: t('filter.verified') });
  if (reviewedFilter) activeFilters.push({ key: 'reviewed', label: t('filter.websiteReviewed') });
  if (selfPayFilter)     activeFilters.push({ key: 'selfpay',      label: t('filter.selfPay') });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">
        {t('clinic.loading')}
      </div>
    );
  }

  if (loadError) {
    return <div role="alert" className="max-w-xl mx-auto p-8 space-y-4 text-center">
      <p>{t('clinic.fetchError')}</p>
      <button onClick={() => window.location.reload()} className="rounded-xl bg-brand-600 px-5 py-3 font-bold text-white">{t('clinic.retry')}</button>
    </div>;
  }

  return <div className="patient-container results-container">
    <EmergencyStrip />
    <div className="results-topline"><Link href={`/?${searchParams}`} className="patient-text-link"><ArrowLeft size={16} />{p('choices')}</Link><PatientSteps /></div>
    <div className="results-heading"><div><p className="eyebrow">{manualPoint ? t(`area.${manualPoint.name}`) : usingRealLocation ? t('distance.useLocation') : p('allTokyo')}{typeof activeRadius === 'number' ? ` · ${activeRadius} km` : refPoint ? ` · ${p('noLimit')}` : ''}</p>
      <h1 aria-live="polite">{processed.length.toLocaleString()} <span>{t('list.found')}</span></h1><p className="muted">{p('compareHint')}</p></div>
      <p className="results-source">{hospitals.length.toLocaleString()} · {t('data.mhlwOpenData')}</p>
    </div>
    <div className="patient-panel results-controls">
      <div className="results-location">
        <label className="field-label"><span>{p('area')}</span><select value={manualPoint?.name || ''} onChange={event => { const area = AREA_PRESETS.find(a => a.name === event.target.value); if (area) selectArea(area); else { geo.clear(); setSeededCoords(null); saveSearchLocation(null); changeSearch({area:null,location:null,dist:null}); } }}><option value="">{usingRealLocation ? t('distance.useLocation') : p('allTokyo')}</option>{AREA_PRESETS.map(a => <option key={a.name} value={a.name}>{t(`area.${a.name}`)}</option>)}</select></label>
        <label className="field-label"><span>{p('range')}</span><select value={typeof activeRadius === 'number' ? String(activeRadius) : 'near'} disabled={needsAreaSelection} onChange={event => changeSearch({dist:event.target.value})}>{DISTANCE_OPTIONS.map(opt => <option key={String(opt.value)} value={opt.value === null ? 'near' : String(opt.value)}>{opt.value === null ? p('noLimit') : `${opt.value} km`}</option>)}</select></label>
        <button type="button" onClick={requestLocation} disabled={geo.status === 'prompting'} className="patient-secondary"><LocateFixed size={17} />{t(geo.status === 'prompting' ? 'btn.locating' : 'distance.useLocation')}</button>
      </div>
      <p className="muted location-context">{refPoint ? `${p('from')}: ${manualPoint ? t(`area.${manualPoint.name}`) : t('distance.useLocation')} · ${p('directDistance')}` : geo.status !== 'idle' ? t(`location.${geo.status}`) : p('locationOptional')}</p>
      <details className="results-refine">
        <summary><SlidersHorizontal size={17} />{p('choices')}<span>{activeFilters.length ? `${activeFilters.length}` : ''}</span></summary>
        <div className="refine-grid">
          <label className="field-label"><span>{p('department')}</span><select value={deptFilter || ''} onChange={event => changeSearch({dept:event.target.value || null})}><option value="">{p('unsure')}</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name[language]}</option>)}</select></label>
          <label className="field-label"><span>{p('language')}</span><select value={langFilter || ''} onChange={event => changeSearch({lang:event.target.value || null})}><option value="">{p('anyLanguage')}</option>{['ja','en','zh','ko','es'].map(code => <option key={code} value={code}>{langName(code)}</option>)}</select></label>
          <label className="field-label"><span>{p('purpose')}</span><select value={purposeFilter || ''} onChange={event => changeSearch({purpose:event.target.value || null})}><option value="">{p('any')}</option><option value="general">{p('generalPurpose')}</option><option value="cosmetic">{p('cosmeticPurpose')}</option></select></label>
        </div>
        {purposeFilter && <p className="muted">{p('purposeHint')}</p>}
        <div className="filter-checks inline-checks">{[{key:'open',label:'filter.openNow',active:openNowFilter},{key:'card',label:'filter.creditCard',active:cardFilter},{key:'walkin',label:'filter.walkIn',active:walkInFilter},{key:'insurance',label:'filter.insurance',active:insuranceFilter},{key:'nightweekend',label:'filter.nightWeekend',active:nightWeekendFilter},{key:'selfpay',label:'filter.selfPay',active:selfPayFilter}].map(f => <label key={f.key}><input type="checkbox" checked={f.active} onChange={event => changeSearch({[f.key]:event.target.checked ? 'true' : null})} /><span>{t(f.label)}</span></label>)}</div>
        <form key={keyword} role="search" onSubmit={event => { event.preventDefault(); changeSearch({q:String(new FormData(event.currentTarget).get('q') || '').trim() || null}); }} className="result-keyword"><label className="field-label"><span>{t('search.keyword')}</span><input name="q" type="search" defaultValue={keyword} maxLength={120} placeholder={t('search.placeholder')} /></label><button className="patient-secondary" type="submit">{t('search.button')}</button></form>
        <p className="muted">{t('distance.consent')}</p>
      </details>
      {(activeFilters.length > 0 || refPoint || distParam) && <div className="active-filters">{activeFilters.map(f => <button key={f.key} onClick={() => removeFilter(f.key)} aria-label={`${t('filter.remove')}: ${f.label}`}>{f.label}<X size={14} /></button>)}<button onClick={clearFilters} className="clear-filters">{t('filter.clearAll')}</button></div>}
    </div>
    <p className="results-notice">{t('data.notice')} {t('access.partial')}</p>
    {mapVisible && mapCenter && <section ref={mapRef} className="patient-panel result-map-panel">
      <div className="section-title"><MapPin size={18} /><h2>{mapCenter.name}</h2><button className="patient-secondary" onClick={() => setMapVisible(false)}>{t('map.hide')}</button></div>
      {mapSupported ? <iframe title="OpenStreetMap" className="result-map-frame" loading="lazy" src={osmSrc(mapCenter.lat,mapCenter.lng)} onError={() => setMapSupported(false)} /> : <p role="status" className="muted">{t('map.unavailable')}</p>}
      <a className="patient-text-link" href={mapTarget?.url ?? `https://www.google.com/maps/search/?api=1&query=${mapCenter.lat},${mapCenter.lng}`} target="_blank" rel="noopener noreferrer">{t('btn.openMap')}<ExternalLink size={15} /></a><p className="muted">© OpenStreetMap</p>
    </section>}
    <div ref={resultsRef} className="clinic-results">
      {processed.length === 0 ? <div className="patient-panel empty-results"><SearchPlaceholder /><h2>{t('list.empty')}</h2><p className="muted">{p('emptyHelp')}</p>{refPoint && activeRadius !== null && <button className="patient-secondary" onClick={() => changeSearch({dist:'near'})}>{p('noLimit')}</button>}<Link className="patient-text-link" href={`/?${searchParams}`}>{p('choices')}<ArrowRight size={16} /></Link></div>
      : visible.map(({h:hospital,dist}) => <article className="patient-panel clinic-card" key={hospital.id}>
        <div className="clinic-card-top"><span>{t('data.open')}</span>{showDistance && Number.isFinite(dist) && <strong><MapPin size={14} />{formatDistance(dist)} · {manualPoint ? t(`area.${manualPoint.name}`) : t('distance.useLocation')}</strong>}</div>
        <Link className="clinic-name-link" prefetch={false} href={`/hospitals/${hospital.id}?returnTo=${encodeURIComponent(`/hospitals${searchParams.size ? `?${searchParams}` : ''}`)}`}><h2>{hospital.name[language] || hospital.name.en || hospital.name.ja}</h2></Link>
        {language !== 'ja' && <p lang="ja" className="clinic-original-name">{hospital.name.ja}</p>}
        <p className="clinic-departments">{hospital.departments.length ? getDeptNames(hospital.departments) : t('detail.deptUnknown')}</p>
        <p className="clinic-address">{hospital.address[language] || hospital.address.ja}</p>
        <VisitSummary hospital={hospital} department={deptFilter} visitLanguage={langFilter} compact />
        <div className="clinic-actions"><Link className="patient-primary" prefetch={false} href={`/hospitals/${hospital.id}?returnTo=${encodeURIComponent(`/hospitals${searchParams.size ? `?${searchParams}` : ''}`)}`}>{p('details')}<ArrowRight size={16} /></Link>
          <div>{telephoneHref(hospital.phone) ? <a className="patient-secondary" href={telephoneHref(hospital.phone)!} aria-label={`${p('callConfirm')}: ${hospital.name[language] || hospital.name.ja}, ${hospital.phone}`}><Phone size={16} />{t('btn.callNow')}</a> : <a className="patient-secondary" href={nabiiClinicUrl(hospital.id) || 'https://www.iryou.teikyouseido.mhlw.go.jp/'} target="_blank" rel="noopener noreferrer">{t('phone.nabii')}</a>}
          <a className="patient-secondary" href={clinicMapUrl(hospital)} target="_blank" rel="noopener noreferrer"><MapPin size={16} />{t('btn.openMap')}</a>
          <button type="button" className="patient-secondary map-preview-button" onClick={() => showClinicOnMap(hospital)} disabled={!hasClinicCoordinates(hospital.latitude,hospital.longitude)} aria-label={`${t('map.show')}: ${hospital.name[language] || hospital.name.ja}`}><ExternalLink size={15} /></button></div>
        </div>
      </article>)}
    </div>
    {pagination.pages > 1 && <nav aria-label={t('list.page')} className="result-pagination"><button className="patient-secondary" disabled={pagination.page === 1} onClick={() => goToPage(pagination.page - 1)}>{t('list.previous')}</button><span>{pagination.start + 1}–{pagination.end} / {processed.length.toLocaleString()}</span><button className="patient-secondary" disabled={pagination.page === pagination.pages} onClick={() => goToPage(pagination.page + 1)}>{t('list.next')}</button></nav>}
    <details className="results-evidence"><summary>{p('sources')}</summary><p className="muted">{t('access.coverage')}: {hospitals.filter(hasWebsiteReview).length.toLocaleString()} / {hospitals.length.toLocaleString()}</p><p className="muted">{t('status.notice')}</p></details>
  </div>;
}

function SearchPlaceholder() { return <MapPin size={30} className="empty-icon" />; }

export default function Hospitals() {
  return (
    <Suspense fallback={<ListLoading />}>
      <HospitalsContent />
    </Suspense>
  );
}

function ListLoading() {
  const { t } = useLanguage();
  return <p className="p-8 text-center text-slate-500 font-semibold">{t('clinic.loading')}</p>;
}

"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hospital, Language, departments } from '@/types';
import { MapPin, Phone, AlertTriangle, ArrowLeft, CheckCircle, CreditCard, Shield, Sparkles, Navigation, ExternalLink, Wallet, LocateFixed, Info, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Suspense } from 'react';
import { clinicMapUrl, hasClinicCoordinates, loadClinics, matchesDepartment, pageWindow, scheduledOpenStatus } from '@/lib/clinic-utils';
import { telephoneHref, nabiiClinicUrl } from '@/lib/clinic-contact';
import {
  useGeolocation, distanceKm, formatDistance, DISTANCE_OPTIONS, SHINJUKU_CENTER, AREA_PRESETS,
  isGeoFailureStatus, type GeoStatus,
} from '@/lib/geo';

// 100件ずつページを切り替えて全件を閲覧できる。
const RESULT_CAP = 100;

function HospitalsContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  // ホームの「近くの病院を探す」で取得した座標（sessionStorage 経由・端末内のみ・一度きり）。
  const [seededCoords, setSeededCoords] = useState<{ lat: number; lng: number } | null>(null);
  const distParam = searchParams.get('dist'); // '1'|'3'|'5'|'10'|'near'
  const manualLocationRequested = searchParams.get('location') === 'manual';
  // 現在地の受け渡しを確認できるまでは「近い順」にしない。固定座標への誤フォールバックを防ぐ。
  const [activeRadius, setActiveRadius] = useState<number | null | 'off'>(
    distParam && ['1', '3', '5', '10'].includes(distParam) ? Number(distParam) : 'off'
  );

  useEffect(() => {
    const controller = new AbortController();
    loadClinics(controller.signal)
      .then((data: Hospital[]) => {
        if (controller.signal.aborted) return;
        const now = new Date();
        const updated = data.map(h => ({ ...h, isOpenNow: scheduledOpenStatus(h, now) }));
        setHospitals(updated);
        setLoading(false);
        // ホームからの現在地の受け渡しを取り込む（非同期コールバック内で初期化タイミングも安全）。
        try {
          const raw = sessionStorage.getItem('mn_nearCoords');
          if (raw) {
            const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown };
            if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number'
              && hasClinicCoordinates(parsed.lat, parsed.lng)) {
              setSeededCoords({ lat: parsed.lat, lng: parsed.lng });
              setActiveRadius(null);
            }
            sessionStorage.removeItem('mn_nearCoords');
          }
        } catch { /* 取得不可時は距離ソートを有効にしない */ }
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
  const selfPayFilter = searchParams.get('selfpay') === 'true';

  // 距離フィルタ（要件2）。位置情報は任意。未許可でも新宿中心からの目安で動作する。
  const geo = useGeolocation();

  // フォールバック: 位置情報が使えない場合にユーザーが選ぶエリア/駅（任意）。
  const [manualPoint, setManualPoint] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // 実際の現在地（一覧のボタン取得 or ホームからの受け渡し）。
  const realCoords = geo.coords ?? seededCoords;

  // 基準点の優先順位: 実際の現在地 → 手動選択エリア → 新宿中心（既定の目安）。
  const refPoint = useMemo(() => realCoords ?? (manualPoint ? { lat: manualPoint.lat, lng: manualPoint.lng } : SHINJUKU_CENTER), [realCoords, manualPoint]);
  const usingRealLocation = !!realCoords;

  // 位置取得に成功したら、既定で「近い順」に並べ替える（要件: 取得成功時に距離順ソート）。
  // effect 内 setState（cascading render）を避け、React 推奨の「前回値比較でレンダー時に更新」で実装。
  const [handledGeoStatus, setHandledGeoStatus] = useState<GeoStatus>('idle');
  if (geo.status !== handledGeoStatus) {
    setHandledGeoStatus(geo.status);
    if (geo.status === 'granted' && activeRadius === 'off') {
      setActiveRadius(null);
    } else if (isGeoFailureStatus(geo.status) && !manualPoint && !seededCoords) {
      setActiveRadius('off');
    }
  }

  const showAreaChoices = !usingRealLocation && (
    manualLocationRequested || distParam === 'near' || isGeoFailureStatus(geo.status)
  );
  const needsAreaSelection = showAreaChoices && !manualPoint;
  const showDistance = !needsAreaSelection;

  // フォールバックのエリアを選んだときも近い順にする。位置情報は端末内のみで使用（サーバー送信なし）。
  const selectArea = (a: { name: string; lat: number; lng: number }) => {
    setManualPoint(a);
    setActiveRadius(r => (r === 'off' ? null : r));
  };

  // 地図表示（要件3: 初期はリストのみ。ユーザーが「地図を表示」を押したときだけ OSM を読み込む）。
  // OpenStreetMap 埋め込みはキー不要・無料で、Google Maps API 課金は一切発生しない。
  const [mapVisible, setMapVisible] = useState(false);
  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const mapCenter = mapTarget ?? { lat: refPoint.lat, lng: refPoint.lng, name: '' };
  const osmSrc = (lat: number, lng: number) => {
    const d = 0.012; // 約1km四方
    const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  };
  const showClinicOnMap = (lat: number, lng: number, name: string) => {
    setMapTarget({ lat, lng, name });
    setMapVisible(true);
  };

  // フィルタ→Haversine距離付与→（距離モード時）半径絞り込み＆近い順ソート。
  // 無関係な状態変化（地図の開閉・コピー等）での再計算を避けるため useMemo でメモ化する。
  const processed = useMemo(() => {
    const filtered = hospitals.filter(h => {
      if (!matchesDepartment(h, deptFilter)) return false;
      if (langFilter && !h.supportedLanguages.includes(langFilter as Language)) return false;
      if (openNowFilter && !h.isOpenNow) return false;
      if (engTodayFilter && !h.supportedLanguages.includes('en')) return false;
      if (cardFilter && !h.accessInfo?.creditCardAccepted) return false;
      if (insuranceFilter && !h.accessInfo?.overseasInsuranceAccepted) return false;
      if (nightWeekendFilter && !h.accessInfo?.nightOpen && !h.accessInfo?.weekendOpen) return false;
      if (walkInFilter && !h.accessInfo?.walkInAvailable) return false;
      if (verifiedFilter && h.verification?.status !== 'verified') return false;
      if (selfPayFilter && !h.accessInfo?.selfPayAvailable) return false;
      return true;
    });
    let arr = filtered.map(h => ({ h, dist: distanceKm(refPoint, h.latitude, h.longitude) }));
    if (activeRadius !== 'off') {
      if (typeof activeRadius === 'number') arr = arr.filter(x => x.dist <= activeRadius);
      arr = arr.sort((a, b) => a.dist - b.dist);
    }
    return arr;
  }, [
    hospitals, refPoint, activeRadius,
    deptFilter, langFilter, openNowFilter, engTodayFilter, cardFilter,
    insuranceFilter, nightWeekendFilter, walkInFilter, verifiedFilter, selfPayFilter,
  ]);

  const pagination = pageWindow(processed.length, searchParams.get('page'), RESULT_CAP);
  const visible = processed.slice(pagination.start, pagination.end);
  const goToPage = (page: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(page));
    router.replace(`/hospitals?${p}`, { scroll: false });
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
    const p = new URLSearchParams(Array.from(searchParams.entries()));
    p.delete(key);
    p.delete('page');
    const qs = p.toString();
    router.replace(qs ? `/hospitals?${qs}` : '/hospitals');
  };
  const activeFilters: Array<{ key: string; label: string }> = [];
  if (deptFilter)        activeFilters.push({ key: 'dept',         label: getDeptNames([deptFilter]) });
  if (langFilter)        activeFilters.push({ key: 'lang',         label: langName(langFilter) });
  if (openNowFilter)     activeFilters.push({ key: 'open',         label: t('filter.openNow') });
  if (engTodayFilter)    activeFilters.push({ key: 'engtoday',     label: t('filter.englishToday') });
  if (cardFilter)        activeFilters.push({ key: 'card',         label: t('filter.creditCard') });
  if (insuranceFilter)   activeFilters.push({ key: 'insurance',    label: t('filter.insurance') });
  if (nightWeekendFilter) activeFilters.push({ key: 'nightweekend', label: t('filter.nightWeekend') });
  if (walkInFilter)      activeFilters.push({ key: 'walkin',       label: t('filter.walkIn') });
  if (verifiedFilter)    activeFilters.push({ key: 'verified',     label: t('filter.verified') });
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Navigation & Data Source Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('list.backSearch')}
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">Tokyo Foreign-Language Clinics:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-brand-600">{hospitals.length.toLocaleString()} clinics · {t('data.mhlwOpenData')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Hospital List */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {processed.length.toLocaleString()} <span className="text-slate-500 font-medium text-lg">{t('list.found')}</span>
            </h1>
            {processed.length > RESULT_CAP && (
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {t('list.showing')} {pagination.start + 1}–{pagination.end} / {processed.length.toLocaleString()}
              </p>
            )}
          </div>

          <p className="text-xs leading-relaxed text-slate-500">{t('data.notice')} {t('status.notice')}</p>

          {/* ── D: 適用中フィルタのチップ（× で解除・全解除可能） ── */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => removeFilter(f.key)}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-bold bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  {f.label}
                  <X className="w-3.5 h-3.5 text-brand-400" />
                </button>
              ))}
              <button
                onClick={() => router.replace('/hospitals')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 underline underline-offset-2 px-1"
              >
                {t('filter.clearAll')}
              </button>
            </div>
          )}

          {/* ── 距離フィルタ（要件2）: 位置情報は任意。未許可でも新宿中心からの目安で動作 ── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-2.5 shadow-xs">
            {/* 事前説明（許可を求める前に表示。位置情報は端末内のみで使用しサーバー送信しない旨を明記） */}
            {!usingRealLocation && (
              <p className="flex items-start gap-1.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-400" />
                {t('distance.consent')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => geo.request()}
                disabled={geo.status === 'prompting'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  usingRealLocation ? 'bg-accent-50 border-accent-300 text-accent-700' : 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100'
                } disabled:cursor-wait disabled:opacity-70`}
              >
                <LocateFixed className={`w-3.5 h-3.5 ${geo.status === 'prompting' ? 'animate-pulse' : ''}`} />
                {geo.status === 'prompting' ? t('btn.locating') : t('distance.useLocation')}
              </button>
              {DISTANCE_OPTIONS.map(opt => {
                const selected = activeRadius !== 'off' && activeRadius === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => setActiveRadius(sel => (sel === opt.value ? 'off' : opt.value))}
                    disabled={needsAreaSelection}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                      selected ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
            {/* 基準点の説明（現在地 / 選択エリア / 新宿中心の目安） */}
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              {usingRealLocation ? `📍 ${t('distance.useLocation')}`
                : manualPoint ? `📍 ${manualPoint.name}`
                : geo.status === 'prompting' ? t('btn.locating')
                : geo.status === 'timeout' ? t('location.timeout')
                : geo.status === 'unavailable' ? t('location.unavailable')
                : geo.status === 'denied' ? t('distance.denied')
                : geo.status === 'unsupported' ? t('distance.unsupported')
                : geo.status === 'error' ? t('location.error')
                : needsAreaSelection ? t('distance.chooseArea')
                : t('distance.approx')}
            </p>
            {/* フォールバック: 取得できない/拒否時にエリア・駅を選んで基準点にする */}
            {showAreaChoices && (
              <div className="pt-2 space-y-1.5 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500">{t('distance.chooseArea')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {AREA_PRESETS.map(a => (
                    <button
                      key={a.name}
                      onClick={() => selectArea(a)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${
                        manualPoint?.name === a.name ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div ref={resultsRef} className="scroll-mt-24 lg:overflow-y-auto lg:max-h-[750px] lg:pr-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
            {processed.length === 0 ? (
              <div className="bg-white/50 border border-slate-200 rounded-3xl p-8 text-center text-slate-500 font-medium">
                {t('list.empty')}
              </div>
            ) : (
              visible.map(({ h: hospital, dist }) => (
                <div key={hospital.id} className={`hover-lift bg-white rounded-3xl border p-6 transition-all ${hospital.verification?.status === 'verified' ? 'border-brand-200 bg-brand-50/5' : 'border-slate-200/80 shadow-xs'}`}>

                  {/* Upper Verification & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    {hospital.verification?.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 text-xs px-2.5 py-1 rounded-full font-bold border border-accent-200">
                        <CheckCircle className="w-3.5 h-3.5 text-accent-600" /> Verified Data
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 text-xs px-2.5 py-1 rounded-full font-semibold border border-slate-200">
                        {t('data.open')}
                      </span>
                    )}

                    {showDistance && Number.isFinite(dist) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                        <Navigation className="w-3 h-3" />
                        {formatDistance(dist)}{usingRealLocation ? ` ${t('distance.fromMe')}` : '*'}
                      </span>
                    )}
                  </div>

                  {!Number.isFinite(dist) && <p className="mb-3 text-xs text-slate-500">{t('list.coordinatesMissing')}</p>}
                  <Link href={`/hospitals/${hospital.id}`} className="block group">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h2 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors">
                        {hospital.name[language] || hospital.name.en || hospital.name.ja}
                      </h2>
                      {hospital.emergencyAccepted && (
                        <span className="inline-flex items-center gap-1 bg-emergency-50 text-emergency-700 text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap border border-emergency-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Emergency
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-600 mb-4 space-y-2">
                      <p className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{hospital.address[language] || hospital.address.ja}</span>
                      </p>
                    </div>

                    {/* Language & status badges */}
                    <div className="flex flex-wrap gap-2">
                      {hospital.supportedLanguages.includes('en') && (
                        <span className="bg-brand-50 text-brand-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-brand-100 uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> EN
                        </span>
                      )}
                      {hospital.supportedLanguages.includes('zh') && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200">ZH</span>
                      )}
                      {hospital.supportedLanguages.includes('ko') && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200">KO</span>
                      )}
                      {hospital.supportedLanguages.includes('es') && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200">ES</span>
                      )}
                      {/* 優先順位順: 言語 → 今開いている → 予約不要 → カード → 自費 → 海外保険 → 週末(優先外は末尾) */}
                      {hospital.isOpenNow === true && (
                        <span className="bg-accent-50 text-accent-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-accent-100">{t('status.open')}</span>
                      )}
                      {hospital.walkInAllowed && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200">Walk-in</span>
                      )}
                      {hospital.accessInfo?.creditCardAccepted && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Card
                        </span>
                      )}
                      {hospital.accessInfo?.selfPayAvailable && (
                        <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-amber-200 flex items-center gap-1">
                          <Wallet className="w-3 h-3" /> {t('filter.selfPay')}
                        </span>
                      )}
                      {hospital.accessInfo?.overseasInsuranceAccepted && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Insurance
                        </span>
                      )}
                      {hospital.accessInfo?.weekendOpen && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-slate-200">Weekend</span>
                      )}
                    </div>
                  </Link>

                  {/* アクション: 電話 / 地図（Maps URL スキーム＝課金なし, 要件3）。Link の外に置き anchor ネストを回避 */}
                  <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100">
                    {telephoneHref(hospital.phone) ? (
                      <a
                        href={telephoneHref(hospital.phone)!}
                        aria-label={`${t('btn.callNow')}: ${hospital.name[language] || hospital.name.ja}, ${hospital.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> {t('btn.callNow')}
                      </a>
                    ) : (
                      <a
                        href={nabiiClinicUrl(hospital.id) || 'https://www.iryou.teikyouseido.mhlw.go.jp/'}
                        target="_blank" rel="noopener noreferrer"
                        aria-label={`${hospital.name[language] || hospital.name.ja}: ${t('phone.nabii')}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" /> {t('phone.nabii')}
                      </a>
                    )}
                    <a
                      href={clinicMapUrl(hospital)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {t('btn.openMap')}
                    </a>
                    {/* この施設を右の OSM 地図パネルに表示（内部プレビュー・無料） */}
                    <button
                      onClick={() => showClinicOnMap(hospital.latitude, hospital.longitude, hospital.name[language] || hospital.name.en || hospital.name.ja)}
                      disabled={!hasClinicCoordinates(hospital.latitude, hospital.longitude)}
                      aria-label={t('map.show')}
                      title={t(hasClinicCoordinates(hospital.latitude, hospital.longitude) ? 'map.show' : 'list.coordinatesMissing')}
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-brand-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {pagination.pages > 1 && <nav aria-label={t('list.page')} className="flex flex-wrap items-center justify-between gap-3">
            <button disabled={pagination.page === 1} onClick={() => goToPage(pagination.page - 1)} className="rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-40">{t('list.previous')}</button>
            <span aria-live="polite" className="text-sm text-slate-500">{t('list.page')} {pagination.page} / {pagination.pages}</span>
            <button disabled={pagination.page === pagination.pages} onClick={() => goToPage(pagination.page + 1)} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{t('list.next')}</button>
          </nav>}
        </div>

        {/* Map Area — OpenStreetMap（要件3: ユーザーが押したときだけ読込。Google Maps API 不使用・課金ゼロ） */}
        <div className="w-full lg:w-1/2 h-[450px] lg:h-[750px] relative overflow-hidden rounded-3xl border border-slate-200 shadow-lg lg:sticky lg:top-20">
          {!mapVisible ? (
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]"></div>
              <div className="absolute w-96 h-96 rounded-full bg-brand-500/10 blur-3xl -top-20 -right-20"></div>
              <div className="absolute w-96 h-96 rounded-full bg-accent-500/5 blur-3xl -bottom-20 -left-20"></div>

              <div className="text-center p-8 relative z-10 max-w-sm space-y-5">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-brand-600 to-indigo-500 text-white rounded-3xl shadow-xl shadow-brand-500/20">
                  <MapPin className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white">Map</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{t('map.hint')}</p>
                </div>
                <button
                  onClick={() => setMapVisible(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  <MapPin className="w-4 h-4" /> {t('map.show')}
                </button>
                <p className="text-[11px] text-slate-500">© OpenStreetMap · {t('map.free')}</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-white">
              <iframe
                title="OpenStreetMap"
                className="w-full h-full border-0"
                loading="lazy"
                src={osmSrc(mapCenter.lat, mapCenter.lng)}
              />
              {/* 上部オーバーレイ: 対象名 + 閉じる */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <span className="pointer-events-auto max-w-[65%] truncate bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                  {mapCenter.name || (usingRealLocation ? t('distance.useLocation') : t('distance.approx'))}
                </span>
                <button
                  onClick={() => setMapVisible(false)}
                  className="pointer-events-auto bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 shadow-sm transition-colors"
                >
                  {t('map.hide')}
                </button>
              </div>
              {/* 対象への経路案内は Google Maps（外部リンク・URLスキーム・無料）で */}
              {mapTarget && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapTarget.lat},${mapTarget.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-md hover:bg-brand-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> {t('btn.openMap')}
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function Hospitals() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading hospitals...</div>}>
      <HospitalsContent />
    </Suspense>
  );
}

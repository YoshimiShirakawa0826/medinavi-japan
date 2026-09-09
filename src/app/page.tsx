"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { departments } from '@/types';
import { getGeoFailureStatus, isGeoFailureStatus, type GeoStatus } from '@/lib/geo';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, Search, Clock, Stethoscope, Languages,
  Shield, CreditCard, CheckCircle, ArrowRight, ChevronRight,
  MapPin, Zap, ExternalLink, MessageCircle, Info,
} from 'lucide-react';

// 有料の看護師相談。サービス説明から外部窓口・設定済み決済へ案内する。
const ONLINE_CONSULT_URL = '/consultation';

const DEPT_ICONS: Record<string, string> = {
  internal:      '🩺',
  surgery:       '🔬',
  pediatrics:    '👶',
  orthopedics:   '🦴',
  dermatology:   '🌿',
  ophthalmology: '👁️',
  ent:           '👂',
  obgyn:         '🤱',
  psychiatry:    '🧠',
  urology:       '💊',
};

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文',    flag: '🇨🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const ADVANTAGES = [
  { icon: '📋', title: 'home.advSource', description: 'home.advSourceDesc' },
  { icon: '🌐', title: 'home.advLang', description: 'home.advLangDesc' },
  { icon: '🕐', title: 'home.advHours', description: 'home.advHoursDesc' },
  { icon: '🗺️', title: 'home.advArea', description: 'home.advAreaDesc' },
];

export default function Home() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [openNow,      setOpenNow]      = useState(false);
  const [englishToday, setEnglishToday] = useState(false);
  const [creditCard,   setCreditCard]   = useState(false);
  const [insurance,    setInsurance]    = useState(false);
  const [nightWeekend, setNightWeekend] = useState(false);
  const [walkIn,       setWalkIn]       = useState(false);
  const [verified,     setVerified]     = useState(false);
  const [selfPay,      setSelfPay]      = useState(false);
  const [showMore,     setShowMore]     = useState(false);
  const [locationStatus, setLocationStatus] = useState<GeoStatus>('idle');
  const locating = locationStatus === 'prompting';

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (selectedDept)  p.set('dept',         selectedDept);
    if (selectedLang)  p.set('lang',         selectedLang);
    if (openNow)       p.set('open',         'true');
    if (englishToday)  p.set('engtoday',     'true');
    if (creditCard)    p.set('card',         'true');
    if (insurance)     p.set('insurance',    'true');
    if (nightWeekend)  p.set('nightweekend', 'true');
    if (walkIn)        p.set('walkin',       'true');
    if (verified)      p.set('verified',     'true');
    if (selfPay)       p.set('selfpay',      'true');
    router.push(`/hospitals?${p}`);
  };

  const quickSearch = (params: Record<string, string>) =>
    router.push(`/hospitals?${new URLSearchParams(params)}`);

  // 「近くの病院を探す」: ここで位置情報を取得してから一覧へ遷移する（タップ=ジェスチャを保持し
  // iOS Safari でも許可ダイアログが確実に出る）。取得座標は sessionStorage で端末内のみ受け渡し、
  // URL やサーバーには載せない。拒否・非対応・失敗時は理由と代替手段をこの画面で明示する。
  const findNearby = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          sessionStorage.setItem('mn_nearCoords', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, savedAt: Date.now() }));
        } catch {
          setLocationStatus('error');
          return;
        }
        setLocationStatus('granted');
        quickSearch({ dist: 'near', location: 'device' });
      },
      (error) => setLocationStatus(getGeoFailureStatus(error)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const toggleDept = (id: string)   => setSelectedDept(v => v === id   ? '' : id);
  const toggleLang = (code: string) => setSelectedLang(v => v === code ? '' : code);

  const deptLabel = (d: typeof departments[0]) =>
    (d.name[language as keyof typeof d.name] as string) || d.name.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-10">

      {/* ── 1. TITLE ── */}
      <div className="text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200/80 rounded-full px-3.5 py-1 text-xs font-bold text-brand-700 shadow-xs">
            {t('home.badgeData')}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1 text-xs font-bold text-slate-600 shadow-xs">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            {t('home.badgeVerified')}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          MediNavi <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">JAPAN</span>
        </h1>
        <p className="text-base text-slate-500 font-semibold">
          {t('home.subtitle')}
        </p>
      </div>

      {/* ── 2. 医療機関を探す ── */}
      <div className="glass-panel rounded-3xl shadow-xl shadow-indigo-100/40 border border-slate-200/40 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-5 sm:px-8 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl text-white">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">{t('search.title')}</h2>
        </div>

        <div className="p-6 sm:p-8 space-y-7">

          {/* ── 最優先アクション（3タップ以内で医療機関へ, 要件4）── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => quickSearch({ open: 'true' })}
              className="flex items-center gap-3 bg-gradient-to-r from-emergency-600 to-rose-600 text-white rounded-2xl px-5 py-4 shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
            >
              <Zap className="w-6 h-6 flex-shrink-0" />
              <span className="text-base font-extrabold text-left leading-tight">{t('btn.needCareNow')}</span>
            </button>
            <button
              onClick={findNearby}
              disabled={locating}
              className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl px-5 py-4 shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait"
            >
              <MapPin className={`w-6 h-6 flex-shrink-0 ${locating ? 'animate-pulse' : ''}`} />
              <span className="text-base font-extrabold text-left leading-tight">{locating ? t('btn.locating') : t('btn.findNearby')}</span>
            </button>
          </div>

          {/* 位置情報の事前説明（許可を求める前に常時表示。端末内のみ・サーバー送信なし） */}
          <p className="flex items-start gap-1.5 text-[11px] text-slate-400 font-semibold leading-relaxed -mt-4">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand-400" />
            {t('distance.consent')}
          </p>

          {isGeoFailureStatus(locationStatus) && (
            <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-extrabold">{t('location.errorTitle')}</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-800">
                      {t(`location.${locationStatus}`)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={findNearby}
                      className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-700 active:scale-95"
                    >
                      {t('location.retry')}
                    </button>
                    <Link
                      href="/hospitals?location=manual"
                      className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 active:scale-95"
                    >
                      {t('location.chooseArea')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 症状から探す（診断ではなく科の案内, 要件4） */}
          <Link
            href="/symptoms"
            className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-brand-300 hover:bg-brand-50/30 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-2.5">
              <Stethoscope className="w-5 h-5 text-brand-500 flex-shrink-0" />
              <span className="text-sm font-bold text-slate-700">{t('symptom.title')}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>

          {/* divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-100" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('home.orRefine')}</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* Open Now toggle */}
          <button
            onClick={() => setOpenNow(v => !v)}
            aria-pressed={openNow}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
              openNow ? 'bg-accent-50 border-accent-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${openNow ? 'bg-accent-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ${openNow ? 'left-[22px]' : 'left-[3px]'}`} />
            </div>
            <Clock className={`w-4 h-4 ${openNow ? 'text-accent-600' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${openNow ? 'text-accent-700' : 'text-slate-600'}`}>{t('filter.openNow')}</span>
          </button>

          {/* Department tiles */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-brand-500" />
              {t('search.department')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {departments.map(d => (
                <button
                  key={d.id}
                  onClick={() => toggleDept(d.id)}
                  aria-pressed={selectedDept === d.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                    selectedDept === d.id
                      ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-sm'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <span className="text-lg leading-none flex-shrink-0">{DEPT_ICONS[d.id]}</span>
                  <span className="text-xs font-bold truncate">{deptLabel(d)}</span>
                  {selectedDept === d.id && (
                    <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-brand-500" />
                  )}
                </button>
              ))}

              {/* 自費診療対応: 診療科タイルの最後に配置（診療科ではなく支払い条件だが導線として並べる） */}
              <button
                onClick={() => setSelfPay(v => !v)}
                aria-pressed={selfPay}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                  selfPay
                    ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <span className="text-lg leading-none flex-shrink-0">💴</span>
                <span className="text-xs font-bold truncate">{t('filter.selfPay')}</span>
                {selfPay && (
                  <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-amber-500" />
                )}
              </button>
            </div>
          </div>

          {/* Language pills */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-brand-500" />
              {t('search.language')}
            </p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => toggleLang(l.code)}
                  aria-pressed={selectedLang === l.code}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    selectedLang === l.code
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters: 価値の高い条件は常時表示、残りは折りたたみ（中間案） */}
          <div className="space-y-3">
            {/* 常時表示: 夜間・休日 / 予約不要 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { state: nightWeekend, set: setNightWeekend, icon: <Clock       className="w-4 h-4 flex-shrink-0" />, label: t('filter.nightWeekend') },
                { state: walkIn,       set: setWalkIn,       icon: <Stethoscope className="w-4 h-4 flex-shrink-0" />, label: t('filter.walkIn')       },
              ].map(({ state, set, icon, label }, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border cursor-pointer transition-all select-none ${
                    state
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white/40'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={state} onChange={e => set(e.target.checked)} />
                  <span className={state ? 'text-brand-600' : 'text-slate-400'}>{icon}</span>
                  <span className="text-xs font-bold truncate">{label}</span>
                </label>
              ))}
            </div>

            {/* 折りたたみ: その他の条件 (4) */}
            <div>
              <button
                onClick={() => setShowMore(v => !v)}
                aria-expanded={showMore}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
              >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showMore ? 'rotate-90' : ''}`} />
                {showMore ? t('home.closeFilters') : t('home.moreFilters')}
              </button>

              {showMore && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {[
                    { state: verified,     set: setVerified,     icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />, label: t('filter.verified')     },
                    { state: englishToday, set: setEnglishToday, icon: <Languages   className="w-4 h-4 flex-shrink-0" />, label: t('filter.englishToday') },
                    { state: creditCard,   set: setCreditCard,   icon: <CreditCard  className="w-4 h-4 flex-shrink-0" />, label: t('filter.creditCard')   },
                    { state: insurance,    set: setInsurance,    icon: <Shield      className="w-4 h-4 flex-shrink-0" />, label: t('filter.insurance')    },
                  ].map(({ state, set, icon, label }, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border cursor-pointer transition-all select-none ${
                        state
                          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-indigo-100'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white/40'
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={state} onChange={e => set(e.target.checked)} />
                      <span className={state ? 'text-brand-600' : 'text-slate-400'}>{icon}</span>
                      <span className="text-xs font-bold truncate">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-100 text-lg font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all outline-none cursor-pointer"
          >
            <Search className="w-5 h-5" />
            {t('btn.search')}
          </button>
        </div>
      </div>

      {/* ── 3. 緊急ですか？ ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-emergency-600" />
          <h2 className="text-xl font-extrabold text-slate-900">
            {t('home.emergencyQ')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 119 — Ambulance */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emergency-600 to-rose-700 text-white p-6 rounded-3xl shadow-lg border border-emergency-500/20 hover:shadow-xl transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Ambulance / Fire</span>
                <AlertCircle className="w-5 h-5 opacity-80" />
              </div>
              <h3 className="text-xl font-bold">{t('emergency.title')}</h3>
              <p className="text-xs text-rose-100 font-medium leading-relaxed">
                {t('emergency.desc')}
              </p>
            </div>
            <div className="pt-5 flex gap-3">
              <a href="tel:119" className="flex-grow inline-flex items-center justify-center py-2.5 px-4 text-sm font-extrabold rounded-2xl bg-white text-emergency-600 hover:bg-rose-50 transition-all shadow-md shadow-rose-900/10">
                Call 119
              </a>
              <Link href="/emergency" aria-label={t('nav.emergency')} className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/10 text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* #7119 — Consultation */}
          <div className="relative overflow-hidden bg-white border border-slate-200 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">{t('home.consultBadge')}</span>
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t('emergency.consultation')}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t('emergency.consultationDesc')}
              </p>
            </div>
            <div className="pt-5 flex gap-3">
              <a href="tel:%237119" className="flex-grow inline-flex items-center justify-center py-2.5 px-4 text-sm font-extrabold rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md shadow-amber-100">
                Call #7119
              </a>
              <Link href="/emergency" aria-label={t('nav.emergency')} className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/50 transition-all">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── オンライン診療（有料・外部サービス）── */}
      <Link
        href={ONLINE_CONSULT_URL}
        className="group flex items-center gap-4 bg-white border border-brand-200 rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-lg hover:border-brand-300 active:scale-[0.99] transition-all"
      >
        <div className="bg-gradient-to-tr from-brand-600 to-indigo-500 p-3 rounded-2xl text-white shadow-md shadow-indigo-100 flex-shrink-0">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-slate-900">{t('nav.online')}</h3>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 leading-none">{t('common.paid')}</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{t('online.desc')}</p>
        </div>
        <ExternalLink className="w-5 h-5 text-brand-400 group-hover:text-brand-600 flex-shrink-0 transition-colors" />
      </Link>

      {/* ── 4. CORE ADVANTAGE ── */}
      <div className="space-y-5">
        <div className="text-center">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-brand-400">
            Core Advantage
          </span>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-slate-700/30">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl" />
          <p className="text-sm font-semibold text-slate-200 leading-relaxed relative z-10 mb-4">
            {t('trust.banner')}
          </p>
          <div className="flex flex-wrap gap-2 relative z-10">
            <span className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300">{t('trust.stats')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ADVANTAGES.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
              <span className="text-2xl leading-none">{item.icon}</span>
              <p className="text-sm font-extrabold text-slate-800">
                {t(item.title)}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t(item.description)}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

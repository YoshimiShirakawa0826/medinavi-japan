"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { AlertCircle, Phone, Info, MapPin, Sparkles, Languages, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useGeolocation, isGeoFailureStatus } from '@/lib/geo';

export default function EmergencyGuide() {
  const { t } = useLanguage();
  const geo = useGeolocation();
  const [showPhrases, setShowPhrases] = useState(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-emergency-700 text-xs px-3 py-1 rounded-full font-bold border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" /> Emergency Support Info
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">What to Do in a Medical Emergency</h1>
        <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">
          Japan&apos;s emergency numbers and consultation advice. Choose the appropriate action based on severity.
        </p>
      </div>

      {/* Emergency Split Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 119: Severe / Ambulance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emergency-600 to-rose-700 text-white p-8 rounded-3xl shadow-xl shadow-rose-900/10 flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Dial 119</span>
              <AlertCircle className="w-5 h-5 opacity-80" />
            </div>
            <h2 className="text-2xl font-black">Ambulance & Fire Emergency</h2>
            <p className="text-sm text-rose-100 font-semibold leading-relaxed">
              Call immediately if the patient has severe, life-threatening symptoms (e.g., loss of consciousness, severe chest pain, major bleeding, sudden paralysis).
            </p>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-xs font-semibold leading-relaxed">
              💡 <strong>Multilingual interpretation</strong> is available in 119 centers in major cities. Stay on the line - an interpreter will join.
            </div>
          </div>
          
          <div className="pt-6">
            <a 
              href="tel:119"
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-2xl bg-white text-emergency-600 hover:bg-rose-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-rose-950/20"
            >
              <Phone className="w-5 h-5 mr-2 animate-bounce" /> Call 119 (Ambulance)
            </a>
          </div>
        </div>

        {/* #7119: Advice / Consultation */}
        <div className="relative overflow-hidden bg-white border border-slate-200 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Dial #7119</span>
              <Sparkles className="w-5 h-5 text-brand-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Emergency Advice Line</h2>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Not sure if you need an ambulance? Dial #7119. A team of doctors, nurses, and emergency specialists will assess your symptoms and advise you.
            </p>
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs font-semibold text-slate-600 leading-relaxed">
              📞 In Tokyo, they will guide you to the nearest open clinic or tell you if an ambulance is necessary.
            </div>
          </div>
          
          <div className="pt-6 space-y-3">
            {/* 番号を大きく表示＋コピー（リンク発信に依存しないため） */}
            <div className="flex items-center justify-between gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4">
              <span className="text-3xl font-black text-brand-700 tracking-tight tabular-nums">#7119</span>
              <button
                onClick={copy7119}
                aria-live="polite"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-700 bg-white border border-brand-200 hover:bg-brand-100 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('emergency.copied') : t('emergency.copyNumber')}
              </button>
            </div>

            {/* 補助リンク（OS/キャリアにより発信できない場合あり） */}
            <a
              href="tel:%237119"
              className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-2xl bg-brand-600 text-white hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-indigo-100"
            >
              <Phone className="w-5 h-5 mr-2" /> {t('emergency.tryCall')}
            </a>

            {/* 手動ダイヤルの注意（選択言語） */}
            <p className="flex items-start gap-2 text-xs text-amber-700 font-semibold leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              {t('emergency.dialManual')}
            </p>

            {/* 地域限定の注記（選択言語） */}
            <p className="flex items-start gap-2 text-xs text-slate-500 font-semibold leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
              {t('emergency.regionNote')}
            </p>
          </div>
        </div>
      </div>

      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-800"><MapPin className="w-5 h-5 text-brand-600" />{t('emergency.locationTitle')}</h2>
        <p className="text-sm text-slate-600">{t('emergency.locationPrompt')}</p>
        <button onClick={geo.request} disabled={geo.status === 'prompting'} className="rounded-xl bg-brand-600 px-5 py-3 font-bold text-white disabled:opacity-50">
          {t(geo.status === 'prompting' ? 'btn.locating' : 'distance.useLocation')}
        </button>
        {isGeoFailureStatus(geo.status) && <p role="alert" className="text-sm text-amber-800">{t(`location.${geo.status}`)}</p>}
        {geo.coords && <div className="rounded-2xl border bg-white p-4 space-y-3">
          <p className="font-bold">{t('emergency.coordinates')}: {geo.coords.lat.toFixed(5)}, {geo.coords.lng.toFixed(5)}</p>
          <p className="text-sm text-slate-600">{t('emergency.locationHelp')}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${geo.coords.lat},${geo.coords.lng}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold text-brand-600">{t('btn.openMap')}</a>
        </div>}
      </section>

      {/* Interactive Tool: What to say phrases */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <button 
          onClick={() => setShowPhrases(!showPhrases)}
          className="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-600" />
            <span>What to say in Japanese during emergency</span>
          </div>
          {showPhrases ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showPhrases && (
          <div className="pt-4 border-t border-slate-200/60 space-y-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('emergency.sayThis')}</p>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-start gap-4">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded-md">1</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">「救急車をお願いします。」</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Pronunciation: Kyūkyūsha o onegai shimasu.</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Meaning: Please send an ambulance.</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-start gap-4">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded-md">2</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">「場所は［現在地の住所・建物名］です。」</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Pronunciation: Basho wa [address / building name] desu.</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Meaning: The location is [your current address / building name].</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-start gap-4">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded-md">3</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">「英語が話せる人はいますか？」</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Pronunciation: Eigo ga hanaseru hito wa imasu ka?</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Meaning: Is there anyone who speaks English?</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
        <Info className="w-5.5 h-5.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-800">Medical Decision Disclaimer</h4>
          <p className="text-amber-700 text-xs leading-relaxed font-semibold">
            This guide is intended for informational and referral purposes only. If you display signs of serious danger (loss of consciousness, heavy breathing, severe bleeding, chest pain), dial 119 immediately. Do not delay seeking professional emergency care.
          </p>
        </div>
      </div>
    </div>
  );
}

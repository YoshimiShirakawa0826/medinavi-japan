"use client";

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { Language } from '@/types';
import { Globe, HeartPulse, ExternalLink } from 'lucide-react';

// 有料の看護師相談。サービス説明から外部窓口・設定済み決済へ案内する。
const ONLINE_CONSULT_URL = '/consultation';

export function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/40 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-rose-500 to-brand-600 p-2 rounded-xl text-white shadow-md shadow-indigo-100/50 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              {t('app.name')}
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 mr-4">
              <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/hospitals" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                {t('nav.hospitals')}
              </Link>
              <Link href="/emergency" className="text-sm font-bold text-emergency-600 hover:text-emergency-700 transition-colors flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emergency-500 animate-pulse"></span>
                {t('nav.emergency')}
              </Link>
              <Link
                href={ONLINE_CONSULT_URL}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1.5"
              >
                {t('nav.online')}
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 leading-none">{t('common.paid')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </nav>
            
            <div className="relative flex items-center gap-2 border border-slate-200/60 rounded-xl px-3 py-1.5 bg-white/60 shadow-xs focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
              <Globe className="w-4 h-4 text-slate-400" />
              <select 
                aria-label="Language / 言語"
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="ko">한국어</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

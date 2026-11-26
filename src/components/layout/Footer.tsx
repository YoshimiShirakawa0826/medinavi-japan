"use client";

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emergency-700/10 border border-emergency-600/20 rounded-2xl p-5 mb-8">
          <p className="text-xs text-emergency-500 text-center leading-relaxed font-semibold">
            {t('footer.disclaimer')}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs border-t border-slate-800/50 pt-8">
          <p className="font-medium">&copy; {new Date().getFullYear()} {t('app.name')}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="font-medium hover:text-white underline-offset-4 hover:underline">{t('footer.terms')}</Link>
            <Link href="/privacy" className="font-medium hover:text-white underline-offset-4 hover:underline">{t('footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

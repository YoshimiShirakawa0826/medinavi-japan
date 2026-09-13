'use client';

import Link from 'next/link';
import { ArrowRight, Check, Copy, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { patientText } from './patient-messages';
import type { Hospital } from '@/types';
import { bookingSummary } from '@/lib/clinic-access';

export function PreviewNotice() {
  const { language } = useLanguage();
  return <div className="preview-notice">{patientText(language, 'preview')}</div>;
}

export function PatientSteps({ current = 1 }: { current?: number }) {
  const { language } = useLanguage();
  return <ol className="patient-steps" aria-label="Steps">
    {(['find', 'check', 'contact'] as const).map((key, i) => <li key={key} aria-current={current === i + 1 ? 'step' : undefined}>
      <span className="step-number">{current > i + 1 ? <Check size={13} /> : i + 1}</span>{patientText(language, key)}{i < 2 && <ArrowRight size={13} className="step-arrow" />}
    </li>)}
  </ol>;
}

export function EmergencyStrip() {
  const { language, t } = useLanguage();
  return <div className="emergency-strip"><span><Phone size={15} aria-hidden="true" />{patientText(language, 'emergency')}</span><Link href="/emergency">{t('nav.emergency')} <ArrowRight size={14} /></Link></div>;
}

export function VisitSummary({ hospital, department, visitLanguage, compact = false }: { hospital: Hospital; department?: string | null; visitLanguage?: string | null; compact?: boolean }) {
  const { language, t } = useLanguage();
  const p = (key: Parameters<typeof patientText>[1]) => patientText(language, key);
  const card = hospital.accessEvidence?.creditCardAccepted;
  const booking = bookingSummary(hospital, department, visitLanguage);
  return <dl className={`visit-summary ${compact ? 'visit-summary-compact' : ''}`}>
    <div><dt>{t('detail.today')}</dt><dd>{t(hospital.isOpenNow === true ? 'status.open' : hospital.isOpenNow === false ? 'status.closed' : 'status.unknown')}</dd></div>
    <div><dt>{p('languageListed')}</dt><dd>{hospital.supportedLanguages.map(code => ({ ja: '日本語', en: 'English', zh: '中文', ko: '한국어', es: 'Español' })[code]).join(' · ') || p('confirm')}</dd></div>
    <div><dt>{p('booking')}</dt><dd className={booking === 'languageBooking' || booking === 'bookingNeeded' ? 'condition-important' : ''}>{p(booking)}</dd></div>
    <div><dt>{p('card')}</dt><dd>{p(!card || card.status === 'information' ? 'confirm' : card.status === 'no' ? 'notListed' : 'cardListed')}</dd></div>
  </dl>;
}

export function ReceptionCard({ hospital }: { hospital: Hospital }) {
  const { language } = useLanguage();
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'error'>('idle');
  const p = (key: Parameters<typeof patientText>[1]) => patientText(language, key);
  async function copy() {
    try { await navigator.clipboard.writeText(`${hospital.name.ja}\n${hospital.address.ja}\n${hospital.phone}`); setCopyState('done'); }
    catch { setCopyState('error'); }
  }
  return <section className="patient-panel reception-card" id="reception">
    <div className="section-title"><ShieldCheck size={20} /><h2>{p('reception')}</h2></div>
    <p className="muted">{p('receptionHint')}</p>
    <div className="address-copy" lang="ja"><strong>{hospital.name.ja}</strong><p>{hospital.address.ja}</p></div>
    <button type="button" className="patient-secondary" onClick={copy}><Copy size={16} />{p(copyState === 'done' ? 'copied' : 'copyAddress')}</button>
    <p className="muted" role="status">{copyState === 'error' ? p('copyFailed') : copyState === 'done' ? p('copied') : ''}</p>
    <details><summary>{language === 'ja' ? '受付に確認する日英の例文' : 'Questions in Japanese / English'}</summary>
      <div className="reception-phrases">
        <p><span lang="ja">今日、診察を受けられますか？予約は必要ですか？</span><span lang="en">Can I see a doctor today? Do I need an appointment?</span></p>
        <p><span lang="ja">英語で対応していただけますか？通訳や予約は必要ですか？</span><span lang="en">Is English support available? Do I need an interpreter or a booking?</span></p>
        <p><span lang="ja">クレジットカードで支払えますか？</span><span lang="en">Can I pay by credit card?</span></p>
        <p><span lang="ja">海外旅行保険で、窓口で支払わずに受診できますか？</span><span lang="en">Can you bill my travel insurer directly, or do I need to pay first?</span></p>
      </div>
    </details>
  </section>;
}

'use client';

import type { AccessField, Hospital } from '@/types';
import { useLanguage } from './LanguageProvider';

const rows: Array<[AccessField, string]> = [
  ['creditCardAccepted', 'selfpay.creditCard'],
  ['japaneseHealthInsurance', 'access.japaneseInsurance'],
  ['overseasInsuranceAccepted', 'selfpay.overseasInsurance'],
  ['walkInAvailable', 'access.walkIn'],
];

export function ClinicAccessPanel({ hospital }: { hospital: Hospital }) {
  const { language, t } = useLanguage();
  return <section className="space-y-4 pt-4 border-t border-slate-100">
    <h2 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">{t('access.title')}</h2>
    <p className="text-xs leading-relaxed text-slate-600">{t('access.notice')}</p>
    <dl className="space-y-3">
      {rows.map(([field, label]) => {
        const evidence = hospital.accessEvidence?.[field];
        const statusKey = !evidence ? 'access.unknown'
          : field === 'walkInAvailable' && evidence.status === 'no' && !evidence.departments ? 'access.bookingRequired'
          : evidence.billing === 'pay_first' ? 'access.payFirst'
          : `access.${evidence.status}`;
        return <div key={field} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <dt className="text-sm font-bold text-slate-700">{t(label)}</dt>
          <dd className="space-y-2">
            <p className={`text-sm font-bold ${evidence?.status === 'yes' ? 'text-accent-700' : 'text-slate-700'}`}>{t(statusKey)}</p>
            {evidence && <>
              <p className="text-sm leading-relaxed text-slate-600">{evidence.notes[language]}</p>
              {evidence.departments && <details className="text-sm text-slate-700">
                <summary className="cursor-pointer font-semibold py-1">{t('access.departmentDetails')}</summary>
                <p className="text-xs text-slate-500 py-1">{t('access.originalNames')}</p>
                <ul className="space-y-1 mt-1">
                  {evidence.departments.map(d => <li key={d.name} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-slate-200 py-1">
                    <span lang="ja">{d.name}</span><span>{t(`access.department.${d.status}`)}</span>
                  </li>)}
                </ul>
              </details>}
              {!!evidence.languageReservations?.length && <details className="text-sm text-slate-700">
                <summary className="cursor-pointer font-semibold py-1">{t('access.languageReservations')}</summary>
                <p className="text-xs text-slate-500 py-1">{t('access.originalNames')}</p>
                <ul className="space-y-2 mt-1">
                  {evidence.languageReservations.map((l, i) => <li key={`${l.name}-${i}`}>
                    <span lang="ja">{l.name}</span>{' · '}{t(l.reservation === '要予約' ? 'access.reservationRequired' : 'access.reservationOptional')}
                    {l.note && l.note !== '-' && <p lang="ja" className="text-xs leading-relaxed text-slate-500">{l.note}</p>}
                  </li>)}
                </ul>
              </details>}
              <ul className="text-xs text-slate-500 space-y-1">
                {evidence.sources.map(source => <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-brand-700">{t(source.kind === 'nabii_report' ? 'access.nabiiSource' : 'access.officialSource')}</a>
                  {' · '}{t('access.checked')}: <time dateTime={source.checkedAt}>{source.checkedAt}</time>
                  {source.sourceUpdatedAt && <span className="block mt-1">{t('access.sourceUpdated')}: <time dateTime={source.sourceUpdatedAt}>{source.sourceUpdatedAt}</time></span>}
                </li>)}
              </ul>
            </>}
          </dd>
        </div>;
      })}
    </dl>
  </section>;
}

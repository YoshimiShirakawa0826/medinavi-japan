'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { MapPin, Phone, Clock, ArrowLeft, Info, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { patientText } from '@/components/patient-messages';
import { EmergencyStrip, PatientSteps, ReceptionCard, VisitSummary } from '@/components/PatientUI';
import { ClinicAccessPanel } from '@/components/ClinicAccessPanel';
import { useClinics } from '@/lib/use-clinics';
import { clinicMapUrl } from '@/lib/clinic-utils';
import { telephoneHref, nabiiClinicUrl } from '@/lib/clinic-contact';
import { safeSearchReturn } from '@/lib/search-state';
import { departments } from '@/types';

function HospitalDetailContent() {
  const { language, t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const returnTo = safeSearchReturn(searchParams.get('returnTo'));
  const context = new URLSearchParams(returnTo.split('?')[1] || '');
  const { hospitals, loading, error } = useClinics();
  const hospital = hospitals.find(h => h.id === params.id);
  const p = (key: Parameters<typeof patientText>[1]) => patientText(language, key);
  if (loading) return <div className="patient-container" role="status">{t('clinic.loading')}</div>;
  if (error) return <div className="patient-container" role="alert"><p>{t('clinic.fetchError')}</p><button className="patient-secondary" onClick={() => window.location.reload()}>{t('clinic.retry')}</button></div>;
  if (!hospital) return <div className="patient-container"><h1>{t('clinic.notFound')}</h1><Link className="patient-text-link" href={returnTo}>{t('list.back')}</Link></div>;
  const callHref = telephoneHref(hospital.phone);
  const mapUrl = clinicMapUrl(hospital);
  const nabiiUrl = nabiiClinicUrl(hospital.id);
  const today = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', weekday: 'short' }).format(new Date()).toLowerCase();
  const slots = hospital.openingHours?.[today];
  const capability = (value?: boolean) => value === true ? t('detail.listed') : value === false && hospital.verification.status === 'verified' ? t('selfpay.notAvailable') : t('selfpay.needConfirm');
  return <div className="patient-container patient-detail">
    <EmergencyStrip />
    <div className="results-topline"><Link className="patient-text-link" href={returnTo}><ArrowLeft size={16} />{t('list.back')}</Link><PatientSteps current={2} /></div>
    <header className="detail-heading"><p className="eyebrow">{t('data.open')}</p><h1>{hospital.name[language] || hospital.name.en || hospital.name.ja}</h1>
      {language !== 'ja' && <p lang="ja" className="clinic-original-name">{hospital.name.ja}</p>}
      <p className="clinic-departments">{hospital.departments.length ? hospital.departments.map(id => departments.find(d => d.id === id)?.name[language] || id).join(' · ') : t('detail.deptUnknown')}</p>
      <p className="detail-address"><MapPin size={17} />{hospital.address[language] || hospital.address.ja}</p>
    </header>
    <section className="patient-panel detail-overview"><div className="section-title"><Info size={19} /><h2>{p('summary')}</h2></div>
      <VisitSummary hospital={hospital} department={context.get('dept')} visitLanguage={context.get('lang')} />
      <p className="muted overview-notice">{t('data.notice')}</p>
      <div className="detail-actions">
        {callHref ? <a className="patient-primary" href={callHref}><Phone size={17} />{p('callConfirm')}</a> : <a className="patient-secondary" href={nabiiUrl || 'https://www.iryou.teikyouseido.mhlw.go.jp/'} target="_blank" rel="noopener noreferrer">{t('phone.nabii')}</a>}
        <a className="patient-secondary" href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={17} />{t('btn.openMap')}</a>
        {hospital.website && <a className="patient-secondary" href={hospital.website} target="_blank" rel="noopener noreferrer"><Globe size={17} />{t('detail.website')}<ExternalLink size={14} /></a>}
      </div>
    </section>
    <div className="detail-grid">
      <div className="detail-main">
        <div className="patient-panel"><ClinicAccessPanel hospital={hospital} department={context.get('dept')} visitLanguage={context.get('lang')} /></div>
        <ReceptionCard hospital={hospital} />
      </div>
      <aside className="detail-sidebar">
        <section className="patient-panel"><div className="section-title"><Clock size={19} /><h2>{t('detail.today')}</h2></div>
          <p className="today-hours">{hospital.closedDays?.[today] ? t('detail.closed') : slots?.length ? slots.map(slot => `${slot.start}–${slot.end}`).join(' / ') : t('selfpay.needConfirm')}</p>
          <p className="muted">{t('status.notice')}</p>
          <details className="weekly-hours"><summary>{t('detail.hours')}</summary><dl>{['mon','tue','wed','thu','fri','sat','sun'].map(day => <div key={day}><dt>{t(`day.${day}`)}</dt><dd>{hospital.closedDays?.[day] ? t('detail.closed') : hospital.openingHours?.[day]?.length ? hospital.openingHours[day]!.map(slot => `${slot.start}–${slot.end}`).join(' / ') : t('selfpay.needConfirm')}</dd></div>)}</dl></details>
        </section>
        <section className="patient-panel contact-note"><h2>{t('detail.contacts')}</h2><p className="contact-number">{hospital.phone || t('phone.missing')}</p><p lang="ja" className="muted">{hospital.address.ja}</p><a className="patient-text-link" href="#reception">{p('reception')}</a></section>
        <section className="patient-panel"><h2>{t('detail.checklist')}</h2><ul className="visit-checklist"><li>{t('detail.bringID')}</li><li>{t('detail.bringInsurance')}</li><li>{t('detail.prepareSymptoms')}</li></ul></section>
        <details className="patient-panel detail-disclosure"><summary>{t('selfpay.title')}</summary><p className="muted">{t('selfpay.subtitle')}</p><dl className="selfpay-summary">{[
          {label:'selfpay.selfPayOk',value:hospital.accessInfo?.selfPayAvailable},
          {label:'selfpay.noInsuranceOk',value:hospital.accessInfo?.noInsuranceAccepted},
          {label:'selfpay.certJa',value:hospital.accessInfo?.medicalCertificateJa},
          {label:'selfpay.certEn',value:hospital.accessInfo?.medicalCertificateEn},
        ].map(row => <div key={row.label}><dt>{t(row.label)}</dt><dd>{capability(row.value)}</dd></div>)}<div><dt>{t('selfpay.estCost')}</dt><dd>{hospital.accessInfo?.estimatedCostNote || t('selfpay.needConfirm')}</dd></div></dl>{hospital.accessInfo?.selfPayNote && <p className="muted">{hospital.accessInfo.selfPayNote}</p>}<p className="muted">{t('selfpay.caution')}</p></details>
        <details className="patient-panel detail-disclosure"><summary>{p('sources')}</summary><dl className="selfpay-summary"><div><dt>{t('detail.updated')}</dt><dd>{hospital.updatedAt}</dd></div><div><dt>{t('detail.source')}</dt><dd>{hospital.dataSource}</dd></div></dl>
          {hospital.phoneSource && <div className="muted"><p>{t('phone.source')}: <a href={hospital.phoneSource.kind === 'mhlw_directory' ? 'https://kouseikyoku.mhlw.go.jp/kantoshinetsu/chousa/shitei.html' : nabiiUrl || 'https://www.iryou.teikyouseido.mhlw.go.jp/'} target="_blank" rel="noopener noreferrer" className="underline">{t(hospital.phoneSource.kind === 'mhlw_directory' ? 'phone.directory' : 'phone.nabiiSource')}</a></p>{hospital.phoneSource.asOf && <p>{t('phone.asOf')}: {hospital.phoneSource.asOf}</p>}<p>{t('phone.retrieved')}: {hospital.phoneSource.retrievedAt}</p></div>}
        </details>
      </aside>
    </div>
    <div className="mobile-contact-bar">{callHref && <a className="patient-primary" href={callHref}><Phone size={17} />{p('callConfirm')}</a>}<a className="patient-secondary" href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={17} />{t('btn.openMap')}</a></div>
  </div>;
}
function DetailLoading() { const { t } = useLanguage(); return <p className="patient-container">{t('clinic.loading')}</p>; }
export default function HospitalDetail() { return <Suspense fallback={<DetailLoading />}><HospitalDetailContent /></Suspense>; }

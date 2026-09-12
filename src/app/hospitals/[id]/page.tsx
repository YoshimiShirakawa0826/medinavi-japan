"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { departments } from '@/types';
import { MapPin, Phone, Clock, AlertTriangle, ArrowLeft, Info, ExternalLink, CheckCircle, Shield, Globe, Wallet, Receipt, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { clinicMapUrl } from '@/lib/clinic-utils';
import { useClinics } from '@/lib/use-clinics';
import { ClinicAccessPanel } from '@/components/ClinicAccessPanel';
import { telephoneHref, nabiiClinicUrl } from '@/lib/clinic-contact';
import { safeSearchReturn, weekendStatus } from '@/lib/search-state';

function HospitalDetailContent() {
  const { language, t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const returnTo = safeSearchReturn(searchParams.get('returnTo'));
  const { hospitals, loading, error } = useClinics();
  const hospital = hospitals.find(h => h.id === params.id);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500 font-semibold">{t('clinic.loading')}</div>;
  }

  if (error) {
    return <div role="alert" className="max-w-xl mx-auto p-8 space-y-4 text-center">
      <p>{t('clinic.fetchError')}</p>
      <button onClick={() => window.location.reload()} className="rounded-xl bg-brand-600 px-5 py-3 font-bold text-white">{t('clinic.retry')}</button>
    </div>;
  }

  if (!hospital) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('clinic.notFound')}</h1>
        <Link href={returnTo} className="text-brand-600 hover:underline">
          {t('list.back')}
        </Link>
      </div>
    );
  }

  const getDeptNames = (deptIds: string[]) => {
    return deptIds.length > 0
      ? deptIds.map(id => {
          const d = departments.find(d => d.id === id);
          return d ? (d.name[language as keyof typeof d.name] || d.name.en) : id;
        }).join(', ')
      : t('detail.deptUnknown');
  };

  const getVerificationMethodLabel = (method?: string) => {
    switch(method) {
      case 'phone': return t('detail.methodPhone');
      case 'ai_interview': return t('detail.methodAI');
      case 'manual_visit': return t('detail.methodVisit');
      case 'official_website': return t('detail.website');
      default: return t('data.mhlwOpenData');
    }
  };

  const mapUrl = clinicMapUrl(hospital);
  const callHref = telephoneHref(hospital.phone);
  const nabiiUrl = nabiiClinicUrl(hospital.id);
  const weekend = weekendStatus(hospital);
  const capability = (value?: boolean) => value === true ? t('detail.listed')
    : value === false && hospital.verification.status === 'verified' ? t('selfpay.notAvailable') : t('selfpay.needConfirm');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={returnTo} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('list.back')}
      </Link>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200/60 overflow-hidden">

        {/* Banner header */}
        <div className={`px-6 py-8 sm:px-8 border-b ${hospital.verification.status === 'verified' ? 'bg-gradient-to-r from-brand-50/20 to-indigo-50/10 border-brand-100/50' : 'bg-gradient-to-r from-slate-50 to-slate-100/30 border-slate-200/60'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hospital.verification.status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 text-xs px-2.5 py-1 rounded-full font-bold border border-accent-200">
                    <CheckCircle className="w-3.5 h-3.5 text-accent-600" /> {t('filter.verified')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 text-xs px-2.5 py-1 rounded-full font-semibold border border-slate-200">
                    {t('data.open')}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {hospital.name[language] || hospital.name.en || hospital.name.ja}
              </h1>
              {language !== 'ja' && (hospital.name[language] || hospital.name.en) !== hospital.name.ja && (
                <p className="text-sm text-slate-500 mt-1">{hospital.name.ja}</p>
              )}
            </div>

            {hospital.emergencyAccepted && (
              <span className="inline-flex items-center gap-1.5 bg-emergency-100/80 text-emergency-800 px-4 py-2 rounded-2xl font-extrabold text-sm border border-emergency-200">
                <AlertTriangle className="w-4 h-4 text-emergency-600 animate-pulse" /> {t('detail.emergency')}
              </span>
            )}
          </div>
        </div>

        {/* Content details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column */}
          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">{t('detail.contacts')}</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-slate-700 font-semibold text-sm leading-relaxed">{hospital.address[language] || hospital.address.ja}</p>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      {t('btn.openMap')} <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>

                {callHref ? (
                  <div className="flex items-start pt-3 border-t border-slate-50">
                    <Phone className="w-5 h-5 text-slate-400 mt-1.5 mr-3 flex-shrink-0" />
                    <div className="flex-grow space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-slate-800 font-bold text-base">{hospital.phone}</p>
                        <a
                          href={callHref}
                          aria-label={`${t('btn.callNow')}: ${hospital.phone}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl shadow-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 transition-colors"
                        >
                          {t('btn.callNow')}
                        </a>
                      </div>
                      {hospital.phoneSource && (
                        <div className="text-xs text-slate-500 space-y-1 leading-relaxed">
                          <p>{t('phone.source')}: <a
                            href={hospital.phoneSource.kind === 'mhlw_directory'
                              ? 'https://kouseikyoku.mhlw.go.jp/kantoshinetsu/chousa/shitei.html'
                              : nabiiUrl || 'https://www.iryou.teikyouseido.mhlw.go.jp/'}
                            target="_blank" rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-brand-700"
                          >{t(hospital.phoneSource.kind === 'mhlw_directory' ? 'phone.directory' : 'phone.nabiiSource')}</a></p>
                          {hospital.phoneSource.asOf && <p>{t('phone.asOf')}: {hospital.phoneSource.asOf}</p>}
                          <p>{t('phone.retrieved')}: {hospital.phoneSource.retrievedAt}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-50 space-y-2">
                    <p className="text-sm text-slate-500">{t('phone.missing')}</p>
                    {nabiiUrl && <a href={nabiiUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                      {t('phone.nabii')} <ExternalLink className="w-3.5 h-3.5" />
                    </a>}
                  </div>
                )}

                {hospital.website && (
                  <div className="pt-3 border-t border-slate-50">
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      <Globe className="w-4 h-4" /> {t('detail.website')} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Medical Department & Status */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">{t('detail.services')}</h2>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('detail.departments')}</p>
                  <p className="text-slate-800 font-semibold text-sm">{getDeptNames(hospital.departments)}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 space-y-3">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('detail.today')}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {hospital.isOpenNow === true ? (
                          <span className="text-accent-700 font-bold text-xs bg-accent-50 px-2.5 py-0.5 rounded border border-accent-100">{t('status.open')}</span>
                        ) : (
                          <span className="text-slate-500 font-semibold text-xs bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">{t(hospital.isOpenNow === false ? 'status.closed' : 'status.unknown')}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('detail.weekend')}</p>
                      <span className="text-slate-700 font-semibold text-xs">{t(weekend === true ? 'detail.weekendListed' : weekend === false ? 'detail.weekendClosed' : 'selfpay.needConfirm')}</span>
                    </div>
                  </div>
                  {/* 診療時間表 */}
                  {hospital.openingHours && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('detail.hours')}</p>
                      <div className="space-y-1 text-xs">
                        {(['mon','tue','wed','thu','fri','sat','sun'] as const).map((day) => {
                          const slots = hospital.openingHours?.[day];
                          const closed = hospital.closedDays?.[day];
                          return (
                            <div key={day} className={`flex justify-between gap-3 p-2 rounded ${closed ? 'bg-slate-100 text-slate-500' : 'bg-white border border-slate-200'}`}>
                              <p className="font-bold text-slate-600">{t(`day.${day}`)}</p>
                              {closed ? (
                                <p>{t('detail.closed')}</p>
                              ) : slots && slots.length > 0 ? (
                                <div className="space-y-0.5">
                                  {slots.map((slot, si) => (
                                    <p key={si} className="text-slate-700">{slot.start}–{slot.end}</p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-500">{t('selfpay.needConfirm')}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Supported Languages */}
            <p className="text-xs leading-relaxed text-slate-500">{t('status.notice')}</p>
            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">{t('detail.languages')}</h2>
              <div className="flex flex-wrap gap-2">
                {hospital.supportedLanguages.map(lang => (
                  <span key={lang} className="bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-lg font-bold border border-brand-100 uppercase">
                    {lang === 'en' ? 'English' : lang === 'zh' ? '中文' : lang === 'ko' ? '한국어' : lang === 'es' ? 'Español' : '日本語'}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Verification Report */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">{t('detail.provenance')}</h2>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-brand-300">{t('detail.method')}</span>
                  <span className="text-xs font-bold text-slate-200">{getVerificationMethodLabel(hospital.verification.confirmedBy)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-brand-300">{t('detail.updated')}</span>
                  <span className="text-xs font-bold text-slate-200">{hospital.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-300">{t('detail.source')}</span>
                  <span className="text-xs font-bold text-slate-200">{hospital.verification.confirmedBy === 'open_data' ? t('phone.nabiiSource') : hospital.dataSource}</span>
                </div>
              </div>
            </section>

            <ClinicAccessPanel hospital={hospital} />

            {/* Insurance / Self-pay ── 自費診療タブ（要件1）── */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-brand-500" /> {t('selfpay.title')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">{t('selfpay.subtitle')}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('selfpay.selfPayOk'),         val: hospital.accessInfo?.selfPayAvailable,          icon: <Receipt className="w-4 h-4" /> },
                  { label: t('selfpay.noInsuranceOk'),     val: hospital.accessInfo?.noInsuranceAccepted,       icon: <Shield className="w-4 h-4" /> },
                  { label: t('selfpay.certJa'),            val: hospital.accessInfo?.medicalCertificateJa,      icon: <FileText className="w-4 h-4" /> },
                  { label: t('selfpay.certEn'),            val: hospital.accessInfo?.medicalCertificateEn,      icon: <FileText className="w-4 h-4" /> },
                ].map((row, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2">
                    <span className={row.val === true ? 'text-accent-600' : row.val === false ? 'text-slate-300' : 'text-amber-500'}>{row.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold leading-tight">{row.label}</p>
                      <p className={`text-xs font-extrabold ${row.val === true ? 'text-accent-700' : row.val === false ? 'text-slate-400' : 'text-amber-600'}`}>
                        {capability(row.val)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 概算費用: 医療機関が提供・許可した文言がある場合のみ表示。無ければ「要事前確認」（費用は捏造しない） */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t('selfpay.estCost')}</p>
                <p className="text-sm font-bold text-slate-800">
                  {hospital.accessInfo?.estimatedCostNote || t('selfpay.needConfirm')}
                </p>
              </div>

              {hospital.accessInfo?.selfPayNote && (
                <p className="text-xs text-slate-500 leading-relaxed">{hospital.accessInfo.selfPayNote}</p>
              )}

              {/* 注意文（要件1: 費用は医療機関により異なるため必ず事前確認） */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-semibold leading-relaxed">{t('selfpay.caution')}</p>
              </div>
            </section>

            {/* 安全表示（要件5: 情報は変更されうる／受診前に電話確認） */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">{t('safety.infoMayChange')}</p>
            </div>

            {/* Document Notices */}
            <div className="bg-brand-50/50 border border-brand-100 p-5 rounded-2xl space-y-3">
              <h3 className="flex items-center gap-2 text-brand-800 font-bold text-xs uppercase tracking-wider">
                <Info className="w-4 h-4 text-brand-600" /> {t('detail.checklist')}
              </h3>
              <ul className="text-xs text-brand-900/80 leading-relaxed font-semibold list-disc pl-4 space-y-1">
                <li>{t('detail.bringID')}</li>
                <li>{t('detail.bringInsurance')}</li>
                <li>{t('detail.prepareSymptoms')}</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailLoading() {
  const { t } = useLanguage();
  return <p className="p-8 text-center">{t('clinic.loading')}</p>;
}

export default function HospitalDetail() {
  return <Suspense fallback={<DetailLoading />}><HospitalDetailContent /></Suspense>;
}

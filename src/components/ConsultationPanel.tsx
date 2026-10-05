'use client';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { whatsAppEnquiryLink } from '@/lib/consultation';

const copy = {
  ja: {
    title: 'オンライン診療について、まずは相談',
    lead: 'オンライン診療を希望する方のためのサポート窓口です。利用方法や予約の進め方を、WhatsAppでご案内します。',
    action: 'WhatsAppでオンライン診療を相談',
    pending: 'WhatsApp窓口は準備中です。受付を開始次第、この画面からご案内します。',
    draftNote: 'オンライン診療を希望するメッセージの下書きが開きます。内容を確認して送信してください。',
    steps: ['WhatsAppを開き、オンライン診療を希望することと希望言語を伝えます。', '担当者からの返信を待ち、利用条件や予約方法を確認します。', '案内に沿って、オンライン診療の予約・受診準備を進めます。'],
    privacy: '外部のWhatsAppが開きます。最初のメッセージには、パスポート・保険証の画像や詳しい病歴などの機微情報を送らないでください。',
    note: 'オンライン診療の利用をサポートする窓口です。この画面で診察・診断・処方は行いません。即時の返信やオンライン診療の利用を保証するものではありません。',
  },
  en: {
    title: 'Questions about online medical care?',
    lead: 'Support for people who want an online medical consultation. Get guidance on access and booking through WhatsApp.',
    action: 'Ask about online care on WhatsApp',
    pending: 'Our WhatsApp contact is being prepared. The link will appear here when the service opens.',
    draftNote: 'Opens a draft requesting support for an online medical consultation. Review it and send it yourself.',
    steps: ['Open WhatsApp and tell us you would like an online consultation and your preferred language.', 'Wait for a reply and confirm the conditions and booking process.', 'Follow the guidance to book and prepare for your online consultation.'],
    privacy: 'Opens the external WhatsApp service. Do not include passport or insurance-card images, detailed medical history or other sensitive information in your first message.',
    note: 'This service helps you access online medical care. No medical examination, diagnosis or prescription takes place on this page. Immediate replies and access to online medical care are not guaranteed.',
  },
  zh: {
    title: '关于在线诊疗，先来咨询',
    lead: '为希望使用在线诊疗的人士提供支持。通过WhatsApp了解使用方法和预约流程。',
    action: '通过WhatsApp咨询在线诊疗',
    pending: 'WhatsApp窗口正在准备中，开始服务后将在此显示入口。',
    draftNote: '将打开申请在线诊疗支持的英文消息草稿。请核对内容、填写希望使用的语言后自行发送。',
    steps: ['打开WhatsApp，告知您希望使用在线诊疗及希望使用的语言。', '等待回复，确认使用条件及预约方法。', '根据指引预约在线诊疗并做好就诊准备。'],
    privacy: '将打开外部WhatsApp服务。请勿在首次消息中发送护照、保险证图片或详细病史等敏感信息。',
    note: '本窗口提供在线诊疗的使用支持，不在此进行诊察、诊断或开具处方。不保证即时回复或一定可以使用在线诊疗。',
  },
  ko: {
    title: '온라인 진료, 먼저 문의하세요',
    lead: '온라인 진료를 희망하는 분을 위한 지원 창구입니다. WhatsApp으로 이용 방법과 예약 절차를 안내합니다.',
    action: 'WhatsApp으로 온라인 진료 문의',
    pending: 'WhatsApp 창구를 준비 중입니다. 접수를 시작하면 여기에 링크를 안내합니다.',
    draftNote: '온라인 진료 지원을 요청하는 영어 초안이 열립니다. 내용을 확인하고 희망 언어를 적은 후 직접 전송하세요.',
    steps: ['WhatsApp을 열고 온라인 진료를 희망한다는 내용과 희망 언어를 알려주세요.', '답변을 기다린 후 이용 조건과 예약 방법을 확인하세요.', '안내에 따라 온라인 진료 예약과 진료 준비를 진행하세요.'],
    privacy: '외부 WhatsApp 서비스가 열립니다. 첫 메시지에는 여권·보험증 사진이나 상세 병력 등 민감한 정보를 보내지 마세요.',
    note: '온라인 진료 이용을 지원하는 창구이며 이 화면에서 진찰·진단·처방을 하지 않습니다. 즉시 답변이나 온라인 진료 이용을 보장하지 않습니다.',
  },
  es: {
    title: '¿Preguntas sobre atención médica en línea?',
    lead: 'Apoyo para quienes desean una consulta médica en línea. Le orientamos por WhatsApp sobre cómo acceder al servicio y reservar.',
    action: 'Consultar por WhatsApp sobre atención en línea',
    pending: 'Estamos preparando el contacto por WhatsApp. El enlace aparecerá cuando se abra el servicio.',
    draftNote: 'Se abre un borrador para solicitar apoyo con una consulta médica en línea. Revíselo y envíelo usted mismo.',
    steps: ['Abra WhatsApp e indique que desea una consulta en línea y su idioma preferido.', 'Espere una respuesta y confirme las condiciones y el proceso de reserva.', 'Siga las indicaciones para reservar y prepararse para su consulta en línea.'],
    privacy: 'Se abre el servicio externo WhatsApp. No envíe imágenes del pasaporte o seguro, historial médico detallado ni otros datos sensibles en su primer mensaje.',
    note: 'Este servicio le ayuda a acceder a atención médica en línea. En esta página no se realizan exámenes médicos, diagnósticos ni prescripciones. No se garantizan respuestas inmediatas ni acceso a atención médica en línea.',
  },
};

export function ConsultationPanel({ whatsAppLink }: { whatsAppLink: string | null }) {
  const { language, t } = useLanguage();
  const content = copy[language];
  const enquiryLanguage = language === 'ja' || language === 'es' ? language : 'en';
  const enquiryLink = whatsAppEnquiryLink(whatsAppLink, enquiryLanguage);

  return <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
    <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-brand-700"><ArrowLeft className="w-4 h-4" />{t('nav.home')}</Link>
    <Link href="/emergency" className="block rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{t('home.emergencyShort')}</Link>
    <section className="rounded-3xl border border-brand-100 bg-white p-6 sm:p-9 shadow-sm space-y-6">
      <MessageCircle className="w-10 h-10 text-brand-600" aria-hidden />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{content.title}</h1>
      <p className="text-slate-600 leading-relaxed">{content.lead}</p>
      {enquiryLink ? <div className="space-y-3">
        <a href={enquiryLink} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white hover:bg-emerald-800"><MessageCircle className="w-5 h-5 shrink-0" /><span>{content.action}</span><ExternalLink className="w-4 h-4 shrink-0" /></a>
        <p className="text-xs leading-relaxed text-slate-600">{content.draftNote}</p>
        <p className="text-center text-xs text-slate-500">WhatsApp · +81 70-9036-9655</p>
      </div> : <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700">{content.pending}</p>}
      <p className="text-sm leading-relaxed text-slate-500">{content.privacy}</p>
      <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed text-slate-700">{content.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{content.note}</p>
      <Link href="/hospitals" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">{t('home.inPerson')}</Link>
    </section>
  </div>;
}

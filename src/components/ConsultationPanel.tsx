'use client';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

const copy = {
  ja: {
    title: 'オンライン診療について、まずは相談', lead: 'オンライン診療の利用方法や受診先について、WhatsAppからお問い合わせいただける窓口です。',
    action: 'WhatsAppで相談する', pending: 'WhatsApp窓口は準備中です。受信確認ができ次第、この画面からご案内します。',
    steps: ['WhatsAppを開き、希望言語と相談の目的を伝えます。', '担当者からの返信を待ち、対応できる内容や利用条件を確認します。', '案内に沿って受診先・予約方法を確認します。'],
    privacy: '外部のWhatsAppが開きます。最初のメッセージには、パスポート・保険証の画像や詳しい病歴などの機微情報を送らないでください。',
    note: 'お問い合わせ用の窓口です。この画面で診察・診断・処方は行いません。即時の返信やオンライン診療の利用を保証するものではありません。',
  },
  en: {
    title: 'Questions about online medical care?', lead: 'Enquire on WhatsApp about accessing online consultations or finding a care provider.',
    action: 'Enquire on WhatsApp', pending: 'Our WhatsApp contact is being prepared. The link will appear here once reception has been confirmed.',
    steps: ['Open WhatsApp and share your preferred language and what help you need.', 'Wait for a reply and confirm available support and conditions.', 'Follow the guidance to check care providers and booking options.'],
    privacy: 'Opens the external WhatsApp service. Do not include passport or insurance-card images, detailed medical history or other sensitive information in your first message.',
    note: 'This is an enquiry point, not a medical examination, diagnosis or prescription service. Immediate replies and access to online medical care are not guaranteed.',
  },
  zh: {
    title: '关于在线诊疗，先来咨询', lead: '通过WhatsApp询问在线诊疗的使用方法或寻找医疗机构。',
    action: '通过WhatsApp咨询', pending: 'WhatsApp窗口正在准备中，确认可以接收消息后将在此显示入口。',
    steps: ['打开WhatsApp，告知希望使用的语言及咨询目的。', '等待回复，确认可提供的支持和使用条件。', '根据指引确认医疗机构及预约方法。'],
    privacy: '将打开外部WhatsApp服务。请勿在首次消息中发送护照、保险证图片或详细病史等敏感信息。',
    note: '本窗口仅供咨询，不在此进行诊察、诊断或开具处方。不保证即时回复或一定可以使用在线诊疗。',
  },
  ko: {
    title: '온라인 진료, 먼저 문의하세요', lead: 'WhatsApp으로 온라인 진료 이용 방법이나 의료기관 찾기에 대해 문의할 수 있는 창구입니다.',
    action: 'WhatsApp으로 문의', pending: 'WhatsApp 창구를 준비 중입니다. 수신 확인이 완료되면 여기에 링크를 안내합니다.',
    steps: ['WhatsApp을 열고 희망 언어와 문의 목적을 알려주세요.', '답변을 기다린 후 가능한 지원과 이용 조건을 확인하세요.', '안내에 따라 의료기관과 예약 방법을 확인하세요.'],
    privacy: '외부 WhatsApp 서비스가 열립니다. 첫 메시지에는 여권·보험증 사진이나 상세 병력 등 민감한 정보를 보내지 마세요.',
    note: '문의 창구이며 이 화면에서 진찰·진단·처방을 하지 않습니다. 즉시 답변이나 온라인 진료 이용을 보장하지 않습니다.',
  },
  es: {
    title: '¿Preguntas sobre atención médica en línea?', lead: 'Consulte por WhatsApp cómo acceder a consultas en línea o encontrar un centro médico.',
    action: 'Consultar por WhatsApp', pending: 'Estamos preparando el contacto por WhatsApp. El enlace aparecerá cuando se confirme la recepción de mensajes.',
    steps: ['Abra WhatsApp e indique su idioma y la ayuda que necesita.', 'Espere una respuesta y confirme el apoyo disponible y sus condiciones.', 'Siga las indicaciones para consultar centros y opciones de reserva.'],
    privacy: 'Se abre el servicio externo WhatsApp. No envíe imágenes del pasaporte o seguro, historial médico detallado ni otros datos sensibles en su primer mensaje.',
    note: 'Es un punto de información, no un servicio de examen médico, diagnóstico ni prescripción. No se garantizan respuestas inmediatas ni acceso a atención médica en línea.',
  },
};

export function ConsultationPanel({ whatsAppLink }: { whatsAppLink: string | null }) {
  const { language, t } = useLanguage();
  const content = copy[language];
  return <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
    <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-brand-700"><ArrowLeft className="w-4 h-4" />{t('nav.home')}</Link>
    <Link href="/emergency" className="block rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{t('home.emergencyShort')}</Link>
    <section className="rounded-3xl border border-brand-100 bg-white p-6 sm:p-9 shadow-sm space-y-6">
      <MessageCircle className="w-10 h-10 text-brand-600" aria-hidden />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{content.title}</h1>
      <p className="text-slate-600 leading-relaxed">{content.lead}</p>
      {whatsAppLink ? <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white hover:bg-emerald-800"><MessageCircle className="w-5 h-5" />{content.action}<ExternalLink className="w-4 h-4" /></a>
        : <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700">{content.pending}</p>}
      <p className="text-sm leading-relaxed text-slate-500">{content.privacy}</p>
      <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed text-slate-700">{content.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{content.note}</p>
      <Link href="/hospitals" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">{t('home.inPerson')}</Link>
    </section>
  </div>;
}

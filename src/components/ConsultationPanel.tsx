'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { CONSULTATION_INFO_URL, CONSULTATION_PHONE, CONSULTATION_PHONE_INTERNATIONAL, CONSULTATION_PHONE_HREF } from '@/lib/consultation';

const copy = {
  ja: {
    title: '看護師による受診サポート',
    lead: 'Nurse Guide Japanの有料相談サービスです。受診先探しや受診準備をサポートします。',
    steps: ['まずサービス窓口で対応できる内容を確認します。', '料金・対応言語・提供日時・キャンセル条件を確認してから申し込みます。', '支払いの案内を受けたら決済し、サポートを受けます。'],
    info: 'サービス内容・料金・連絡先を見る', pay: '案内された料金を支払う',
    call: '相談の受付に電話する', contact: '有料相談の受付',
    phoneNote: '通話料がかかる場合があります。相談内容・料金・対応日時は事前にご確認ください。',
    paymentTitle: 'お支払い', paymentPending: 'オンライン決済の案内は準備中です。お支払い方法は受付窓口でご確認ください。',
    note: '医師による診察・処方とは別のサービスです。診療費・薬代などの扱いは申し込み先で確認してください。緊急時は119へ。',
    payment: '受付窓口から支払いの案内を受けた方のみ進んでください。決済画面の金額・通貨・商品名を確認し、支払い完了の記録を保管してください。サービスの開始は受付窓口で確認します。',
  },
  en: {
    title: 'Nurse support for finding care',
    lead: 'Paid support from Nurse Guide Japan for finding a clinic and preparing for a visit.',
    steps: ['Contact the service to check what support is available.', 'Confirm the fee, language, timing and cancellation terms before booking.', 'Pay when instructed by the service, then receive support.'],
    info: 'View services, fees and contact details', pay: 'Pay the agreed fee',
    call: 'Call about nurse support', contact: 'Paid support enquiries',
    phoneNote: 'Call charges may apply. Confirm the support, fee and available times before booking.',
    paymentTitle: 'Payment', paymentPending: 'Online payment instructions are being prepared. Contact the service about payment options.',
    note: 'This is separate from a doctor’s examination or prescription. Confirm how medical and medication costs are handled. In an emergency, call 119.',
    payment: 'Continue only after receiving payment instructions. Check the amount, currency and service name at checkout, and keep your payment record. Confirm the start of support with the service.',
  },
  zh: {
    title: '护士就医支持', lead: 'Nurse Guide Japan提供付费咨询，协助寻找医疗机构和准备就诊。',
    steps: ['先联系服务窗口确认可提供的支持。', '预约前确认费用、服务语言、时间及取消条件。', '收到付款通知后支付费用并接受支持。'],
    info: '查看服务、费用和联系方式', pay: '支付约定费用',
    call: '致电咨询服务', contact: '付费咨询受理',
    phoneNote: '可能产生通话费用。预约前请确认服务内容、费用及可提供服务的时间。',
    paymentTitle: '付款', paymentPending: '在线付款指引正在准备中。请向服务窗口确认付款方式。',
    note: '本服务与医生诊察、处方不同。请确认诊疗费及药费的处理方式。紧急情况请拨119。',
    payment: '仅在收到付款通知后继续。请核对付款页面的金额、币种及服务名称，保存付款记录，并向服务窗口确认开始时间。',
  },
  ko: {
    title: '간호사의 진료 안내', lead: 'Nurse Guide Japan의 유료 상담으로 의료기관 찾기와 진료 준비를 돕습니다.',
    steps: ['서비스 창구에 가능한 지원을 먼저 확인하세요.', '신청 전 요금, 언어, 일정 및 취소 조건을 확인하세요.', '결제 안내를 받은 후 결제하고 지원을 받으세요.'],
    info: '서비스·요금·연락처 확인', pay: '안내받은 요금 결제',
    call: '상담 접수처에 전화', contact: '유료 상담 접수',
    phoneNote: '통화료가 발생할 수 있습니다. 예약 전 지원 내용, 요금 및 가능 시간을 확인하세요.',
    paymentTitle: '결제', paymentPending: '온라인 결제 안내를 준비 중입니다. 결제 방법은 서비스 창구에 확인하세요.',
    note: '의사의 진찰 및 처방과 별개인 서비스입니다. 진료비와 약값 처리 방식은 서비스 창구에 확인하세요. 응급 시 119에 전화하세요.',
    payment: '결제 안내를 받은 경우에만 진행하세요. 결제 화면의 금액, 통화, 서비스명을 확인하고 결제 기록을 보관하세요. 지원 시작은 서비스 창구에 확인하세요.',
  },
  es: {
    title: 'Apoyo de enfermería para buscar atención', lead: 'Servicio de pago de Nurse Guide Japan para encontrar una clínica y preparar la visita.',
    steps: ['Contacte con el servicio para confirmar el apoyo disponible.', 'Confirme el precio, idioma, horario y condiciones de cancelación antes de reservar.', 'Pague cuando se lo indiquen y reciba el apoyo.'],
    info: 'Ver servicios, precios y contacto', pay: 'Pagar el importe acordado',
    call: 'Llamar para consultar', contact: 'Consultas sobre el servicio de pago',
    phoneNote: 'Pueden aplicarse cargos por la llamada. Confirme el servicio, precio y horario antes de reservar.',
    paymentTitle: 'Pago', paymentPending: 'Estamos preparando las instrucciones de pago en línea. Consulte las opciones con el servicio.',
    note: 'Es un servicio distinto de la consulta o prescripción médica. Confirme cómo se gestionan los gastos médicos y medicamentos. En emergencias, llame al 119.',
    payment: 'Continúe solo después de recibir instrucciones de pago. Compruebe el importe, la moneda y el servicio, y guarde el comprobante. Confirme el inicio del apoyo con el servicio.',
  },
};

const chatCopy = {
  ja: { title: 'テキストでのご相談', action: 'WhatsAppで問い合わせる', note: '外部のWhatsAppが開きます。最初は希望言語と相談の目的をお知らせください。返信時間は受付窓口でご確認ください。', pending: 'テキスト相談の窓口は準備中です。現在は電話でお問い合わせいただけます。' },
  en: { title: 'Text enquiries', action: 'Enquire on WhatsApp', note: 'Opens WhatsApp. Start with your preferred language and the help you need. Confirm response times with the service.', pending: 'Text enquiries are being prepared. Please contact us by phone for now.' },
  zh: { title: '文字咨询', action: '通过WhatsApp咨询', note: '将打开WhatsApp。请先告知希望语言及咨询目的，回复时间请向服务窗口确认。', pending: '文字咨询正在准备中，目前请通过电话联系。' },
  ko: { title: '문자 상담 문의', action: 'WhatsApp으로 문의', note: 'WhatsApp이 열립니다. 희망 언어와 문의 목적부터 알려주세요. 답변 시간은 서비스 창구에 확인하세요.', pending: '문자 상담 창구를 준비 중입니다. 현재는 전화로 문의하실 수 있습니다.' },
  es: { title: 'Consultas por texto', action: 'Consultar por WhatsApp', note: 'Se abre WhatsApp. Indique primero su idioma y la ayuda que necesita. Confirme los tiempos de respuesta con el servicio.', pending: 'Estamos preparando las consultas por texto. Por ahora, contacte por teléfono.' },
};

export function ConsultationPanel({ paymentLink, whatsAppLink }: { paymentLink: string | null; whatsAppLink: string | null }) {
  const { language, t } = useLanguage();
  const content = copy[language];
  const chat = chatCopy[language];
  return <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-600"><ArrowLeft className="w-4 h-4" />{t('nav.home')}</Link>
    <section className="rounded-3xl border border-brand-100 bg-white p-6 sm:p-9 shadow-sm space-y-6">
      <MessageCircle className="w-10 h-10 text-brand-600" />
      <h1 className="text-3xl font-extrabold text-slate-900">{content.title}</h1>
      <p className="text-slate-600 leading-relaxed">{content.lead}</p>
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5 space-y-3">
        <h2 className="font-bold text-slate-800">{content.contact}</h2>
        <p className="text-xl font-bold tracking-wide text-slate-900">{language === 'ja' ? CONSULTATION_PHONE : CONSULTATION_PHONE_INTERNATIONAL}</p>
        {language === 'ja' && <p className="text-sm text-slate-600">{CONSULTATION_PHONE_INTERNATIONAL}</p>}
        <a href={CONSULTATION_PHONE_HREF} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-3 font-bold hover:bg-brand-700"><Phone className="w-4 h-4" />{content.call}</a>
        <p className="text-sm leading-relaxed text-slate-600">{content.phoneNote}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="font-bold text-slate-800">{chat.title}</h2>
        <p className="text-sm leading-relaxed text-slate-600">{whatsAppLink ? chat.note : chat.pending}</p>
        {whatsAppLink && <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-600 px-5 py-3 font-bold text-brand-700"><MessageCircle className="w-4 h-4" />{chat.action}<ExternalLink className="w-4 h-4" /></a>}
      </div>
      <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed text-slate-700">{content.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <a href={CONSULTATION_INFO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-brand-200 text-brand-700 px-5 py-3 font-bold">{content.info}<ExternalLink className="w-4 h-4" /></a>
      <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{content.note}</p>
      <div className="border-t pt-6 space-y-4">
        <h2 className="font-bold text-slate-800">{content.paymentTitle}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{paymentLink ? content.payment : content.paymentPending}</p>
        {paymentLink && <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-5 py-3 font-bold text-brand-700">{content.pay}<ExternalLink className="w-4 h-4" /></a>}
      </div>
    </section>
  </div>;
}

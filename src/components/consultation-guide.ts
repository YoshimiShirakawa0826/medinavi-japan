import type { Language } from '@/types';

// Adapted from the operator's Nurse Guide Japan service page (2026-10-05).
// Enquiry topics describe what visitors can ask about, not guaranteed services.
export const consultationGuide = {
  ja: {
    badge: 'Nurse Guide Japan · 看護師による受診サポート',
    title: '旅先での受診、ひとりで迷わず相談を',
    lead: '病院探しやオンライン診療の利用方法を、まずはWhatsAppでご相談ください。',
    topicsTitle: 'こんなことをご相談いただけます',
    topics: [
      ['受診先を探したい', '診療科や近くの医療機関の探し方。'],
      ['オンライン診療を相談したい', '利用できる医療機関や予約方法の確認。'],
      ['受診の準備をしたい', '持ち物や、症状を日本語で伝えるための準備。'],
      ['保険用の書類を相談したい', '診断書・領収書を医療機関へ依頼する方法。'],
    ],
    languageTitle: '相談の対応言語', languageNote: '英語・スペイン語・やさしい日本語でご案内しています。ご希望の言語と対応可能な日時を窓口でご確認ください。',
    chooseLanguage: '希望する相談言語', chooseTopic: '相談したいこと',
    draftNote: '選んだ言語と相談内容を入れたメッセージが開きます。WhatsAppで内容を確認して、ご自身で送信してください。',
    stepsTitle: 'ご相談の流れ', faqTitle: 'よくある質問',
    faq: [
      ['看護師に診断や処方をお願いできますか？', '看護師の窓口では診断・処方は行いません。診察・処方は医師が担当し、オンライン診療の可否も医師が判断します。'],
      ['オンライン診療はどのように受けますか？', '窓口で利用可能な内容と予約方法を確認し、医療機関の案内に沿って進みます。このサイト上で予約が確定することはありません。'],
      ['旅行保険用の診断書は発行してもらえますか？', '発行可否・言語・費用・所要日数は、診察を受ける医療機関へ確認してください。保険金の支払い条件は保険会社が判断します。'],
      ['すぐに返信はありますか？', '返信までお時間をいただく場合があります。対応可能な日時は窓口でご確認ください。緊急の場合は返信を待たず119へ連絡してください。'],
    ],
  },
  en: {
    badge: 'Nurse Guide Japan · Nurse-led care navigation',
    title: 'Help finding care while you travel',
    lead: 'Start on WhatsApp for questions about finding a clinic or accessing online medical care.',
    topicsTitle: 'What you can ask about',
    topics: [
      ['Finding a clinic', 'How to find the right specialty and nearby care.'],
      ['Online medical care', 'Available providers and how to book.'],
      ['Preparing for a visit', 'What to bring and how to prepare a symptom summary in Japanese.'],
      ['Insurance documents', 'How to request medical certificates and receipts from a clinic.'],
    ],
    languageTitle: 'Languages for enquiries', languageNote: 'Support is offered in English, Spanish and easy Japanese. Confirm your preferred language and available times with the service.',
    chooseLanguage: 'Preferred enquiry language', chooseTopic: 'What would you like help with?',
    draftNote: 'Opens a draft with your chosen language and topic. Review it in WhatsApp and send it yourself.',
    stepsTitle: 'How it works', faqTitle: 'Common questions',
    faq: [
      ['Can the nurse diagnose or prescribe?', 'Nurses do not diagnose or prescribe. A doctor provides medical consultations and prescriptions and decides whether online care is appropriate.'],
      ['How do I access an online consultation?', 'Ask about available options and booking, then follow the medical provider’s instructions. This site does not confirm appointments.'],
      ['Can I get documents for travel insurance?', 'Ask the examining clinic about availability, languages, costs and processing time for certificates and receipts. Your insurer determines claim eligibility.'],
      ['Will I get an immediate reply?', 'Replies may take time. Check availability with the service. In an emergency, call 119 without waiting for a reply.'],
    ],
  },
  zh: {
    badge: 'Nurse Guide Japan · 护士就医指引',
    title: '旅途中需要就医，先来咨询', lead: '通过WhatsApp询问如何寻找医疗机构或使用在线诊疗。',
    topicsTitle: '您可以咨询的内容',
    topics: [['寻找医疗机构', '了解适合的科室及附近医疗机构的查找方法。'], ['在线诊疗', '确认可用的医疗机构及预约方法。'], ['就诊准备', '需要携带的物品及日文症状说明的准备方法。'], ['保险用文件', '如何向医疗机构申请诊断书或收据。']],
    languageTitle: '咨询服务语言', languageNote: '咨询服务提供英语、西班牙语和简单日语。请向窗口确认希望语言及可提供服务的时间。',
    chooseLanguage: '希望使用的咨询语言', chooseTopic: '您想咨询什么？', draftNote: '将打开包含所选语言和咨询主题的消息草稿。请在WhatsApp中核对后自行发送。',
    stepsTitle: '咨询流程', faqTitle: '常见问题',
    faq: [
      ['护士可以诊断或开处方吗？', '护士窗口不进行诊断或开具处方。诊察及处方由医生负责，能否在线诊疗也由医生判断。'],
      ['如何使用在线诊疗？', '请向窗口确认可用服务及预约方法，然后按医疗机构的指引操作。本网站不确认预约。'],
      ['可以开旅行保险所需的文件吗？', '请向就诊机构确认文件能否出具、语言、费用和所需时间。理赔条件由保险公司判断。'],
      ['会立即回复吗？', '回复可能需要时间，请向窗口确认服务时间。紧急情况请勿等待回复，立即拨打119。'],
    ],
  },
  ko: {
    badge: 'Nurse Guide Japan · 간호사의 진료 안내',
    title: '여행 중 진료가 필요할 때 문의하세요', lead: '의료기관 찾기나 온라인 진료 이용 방법을 WhatsApp으로 문의하세요.',
    topicsTitle: '이런 내용을 문의할 수 있어요',
    topics: [['의료기관 찾기', '적절한 진료과와 가까운 의료기관을 찾는 방법.'], ['온라인 진료', '이용 가능한 의료기관과 예약 방법 확인.'], ['진료 준비', '준비물과 일본어 증상 설명을 준비하는 방법.'], ['보험 관련 서류', '의료기관에 진단서·영수증을 요청하는 방법.']],
    languageTitle: '상담 지원 언어', languageNote: '영어·스페인어·쉬운 일본어로 안내합니다. 희망 언어와 대응 가능한 시간을 창구에 확인하세요.',
    chooseLanguage: '희망 상담 언어', chooseTopic: '어떤 도움이 필요한가요?', draftNote: '선택한 언어와 주제가 포함된 초안이 열립니다. WhatsApp에서 확인 후 직접 전송하세요.',
    stepsTitle: '상담 절차', faqTitle: '자주 묻는 질문',
    faq: [
      ['간호사가 진단이나 처방을 해주나요?', '간호사 창구에서는 진단·처방을 하지 않습니다. 의사가 진찰·처방을 담당하고 온라인 진료 가능 여부도 판단합니다.'],
      ['온라인 진료는 어떻게 이용하나요?', '창구에서 가능한 서비스와 예약 방법을 확인한 후 의료기관의 안내에 따라 진행합니다. 이 사이트에서 예약이 확정되지는 않습니다.'],
      ['여행보험용 서류를 발급받을 수 있나요?', '발급 가능 여부, 언어, 비용, 소요 시간은 진료받는 기관에 확인하세요. 보험금 지급 조건은 보험사가 판단합니다.'],
      ['즉시 답변을 받을 수 있나요?', '답변까지 시간이 걸릴 수 있습니다. 대응 가능한 시간은 창구에 확인하세요. 응급 시 답변을 기다리지 말고 119에 연락하세요.'],
    ],
  },
  es: {
    badge: 'Nurse Guide Japan · Orientación de enfermería',
    title: 'Ayuda para encontrar atención durante su viaje', lead: 'Consulte por WhatsApp cómo encontrar una clínica o acceder a atención médica en línea.',
    topicsTitle: 'En qué podemos orientarle',
    topics: [['Buscar una clínica', 'Cómo encontrar la especialidad adecuada y centros cercanos.'], ['Atención médica en línea', 'Consultar centros disponibles y cómo reservar.'], ['Preparar la visita', 'Qué llevar y cómo preparar un resumen de síntomas en japonés.'], ['Documentos para el seguro', 'Cómo solicitar certificados médicos y recibos a una clínica.']],
    languageTitle: 'Idiomas de atención', languageNote: 'Se ofrece orientación en inglés, español y japonés sencillo. Confirme el idioma y los horarios disponibles con el servicio.',
    chooseLanguage: 'Idioma preferido de atención', chooseTopic: '¿Sobre qué necesita orientación?', draftNote: 'Se abre un borrador con el idioma y el tema elegidos. Revíselo en WhatsApp y envíelo usted mismo.',
    stepsTitle: 'Cómo funciona', faqTitle: 'Preguntas frecuentes',
    faq: [
      ['¿El personal de enfermería diagnostica o receta?', 'El personal de enfermería no diagnostica ni receta. Un médico realiza la consulta, prescribe y determina si la atención en línea es adecuada.'],
      ['¿Cómo accedo a una consulta en línea?', 'Pregunte por las opciones y reservas y siga las instrucciones del centro médico. Este sitio no confirma citas.'],
      ['¿Puedo obtener documentos para mi seguro de viaje?', 'Consulte al centro que le atienda sobre disponibilidad, idioma, coste y plazo de emisión. Su aseguradora determina las condiciones de reembolso.'],
      ['¿Recibiré una respuesta inmediata?', 'La respuesta puede tardar. Consulte la disponibilidad con el servicio. En una emergencia, llame al 119 sin esperar una respuesta.'],
    ],
  },
} satisfies Record<Language, {
  badge: string; title: string; lead: string; topicsTitle: string; topics: string[][];
  languageTitle: string; languageNote: string; chooseLanguage: string; chooseTopic: string;
  draftNote: string; stepsTitle: string; faqTitle: string; faq: string[][];
}>;

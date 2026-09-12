// Editorial review of official clinic pages, 2026-09-12.
// Match by clinic ID + exact imported name + public telephone number.
// These are field-level website checks, not telephone or same-day verification.
const checkedAt = '2026-09-12';
const languages = ['ja', 'en', 'zh', 'ko', 'es'];
const note = (...values) => Object.fromEntries(languages.map((lang, i) => [lang, values[i]]));
const evidence = (status, url, notes, billing) => ({
  status, notes, sources: [{ kind: 'official_website', url, checkedAt }],
  ...(billing ? { billing } : {}),
});
const cardNote = note('クレジットカードの取扱いを掲載しています。', 'Credit card payments are listed.', '官网列明可用信用卡付款。', '신용카드 결제를 안내하고 있습니다.', 'Se indica el pago con tarjeta.');
const bookingNote = note('受付時間内は予約なしで受診可。予約患者が優先です。', 'Walk-ins during reception hours; appointments take priority.', '接诊时间内可无预约就诊；预约者优先。', '접수시간 내 예약 없이 방문 가능하며 예약자가 우선입니다.', 'Sin cita durante la recepción; las citas tienen prioridad.');
const publicInsuranceNote = note('日本の健康保険診療を掲載。保険資格と対象の診療内容を確認してください。', 'Japanese health insurance is listed; confirm eligibility and covered services.', '列明日本医保诊疗；请确认资格及适用项目。', '일본 건강보험 진료 안내가 있습니다. 자격과 적용 항목을 확인하세요.', 'Se indica seguro médico japonés; confirme su derecho y los servicios cubiertos.');
const tbcFaq = 'https://www.businessclinic.tokyo/en/faqs';
const tbcFields = {
  creditCardAccepted: evidence('yes', tbcFaq, cardNote),
  walkInAvailable: evidence('conditional', tbcFaq, bookingNote),
};

export const clinicAccessReviews = [
  {
    clinicId: 'clinic-1322136400126', clinicName: '東京ビジネスクリニック　八重洲北口', matchedPhone: '03-6268-0079',
    identitySource: 'https://www.businessclinic.tokyo/yaesu-kitaguchi', fields: tbcFields,
  },
  {
    clinicId: 'clinic-1322136400213', clinicName: '東京ビジネスクリニック　グランスタ丸の内', matchedPhone: '03-6259-1605',
    identitySource: 'https://www.businessclinic.tokyo/gransta-marunouchi', fields: tbcFields,
  },
  {
    clinicId: 'clinic-1325139900180', clinicName: '東京ビジネスクリニック　エキュート上野', matchedPhone: '03-6802-8792',
    identitySource: 'https://www.businessclinic.tokyo/ueno', fields: tbcFields,
  },
  {
    clinicId: 'clinic-1321310137240', clinicName: 'Ｔｏｋｙｏ　Ｓｔａｔｉｏｎ　Ｉｎｔｅｒｎａｔｉｏｎａｌ　Ｃｌｉｎｉｃ', matchedPhone: '03-6206-3070',
    identitySource: 'https://www.international-clinic.tokyo/',
    fields: {
      creditCardAccepted: evidence('yes', 'https://www.international-clinic.tokyo/faq/', cardNote),
      walkInAvailable: evidence('conditional', 'https://www.international-clinic.tokyo/faq/', bookingNote),
      overseasInsuranceAccepted: evidence('conditional', 'https://www.international-clinic.tokyo/medical-expense/', note(
        '受診前に保険会社へ連絡。施設が支払保証を受領した場合のみ直接請求でき、未受領の場合は本人払いです。',
        'Contact your insurer first. Direct billing requires a payment guarantee received before your visit; otherwise you pay.',
        '先联系保险公司。院方须在就诊前收到付款保证，否则需自行支付。',
        '보험사에 먼저 연락하세요. 방문 전 지급보증을 받아야 직접 청구가 가능하며, 없으면 본인이 지불합니다.',
        'Contacte primero a su aseguradora. La facturación directa exige garantía previa; sin ella, usted paga.'), 'direct_billing'),
    },
  },
  {
    clinicId: 'clinic-1322136000349', clinicName: '西麻布インターナショナルクリニック', matchedPhone: '03-6447-5966',
    identitySource: 'https://nic-med.com/english/',
    fields: {
      creditCardAccepted: evidence('yes', 'https://nic-med.com/english/', cardNote),
      japaneseHealthInsurance: evidence('yes', 'https://nic-med.com/', publicInsuranceNote),
      walkInAvailable: evidence('conditional', 'https://nic-med.com/', note(
        '初診・再診は予約なし可。健診・予防接種は予約が必要です。',
        'Walk-ins for consultations; checkups and vaccinations require appointments.',
        '初诊及复诊可无预约；体检与疫苗需预约。',
        '초진·재진은 예약 없이 가능하며 검진·예방접종은 예약이 필요합니다.',
        'Consultas sin cita; los chequeos y vacunas requieren reserva.')),
      overseasInsuranceAccepted: evidence('conditional', 'https://nic-med.com/english/', note(
        '提携保険会社のみ。保険会社からの事前連絡と支払保証が必要です。非提携の場合は全額立替払いです。',
        'Partner insurers only, with prior contact and payment guarantee. Non-partner policies require full upfront payment.',
        '仅限合作保险公司，需提前联系及付款保证；非合作保险须先全额支付。',
        '제휴 보험사만 가능하며 사전 연락과 지급보증이 필요합니다. 비제휴 보험은 전액 선결제합니다.',
        'Solo aseguradoras asociadas, con contacto y garantía previos. Las demás requieren pago completo por adelantado.'), 'direct_billing'),
    },
  },
  {
    clinicId: 'clinic-1322136200484', clinicName: 'イーヘルスクリニック新宿院', matchedPhone: '03-5315-0514',
    identitySource: 'https://ehealthclinic.jp/',
    fields: {
      creditCardAccepted: evidence('yes', 'https://ehealthclinic.jp/lang/en/faq/', note('VISA・Mastercard・American Express・JCBを掲載。', 'VISA, Mastercard, American Express and JCB are listed.', '列明VISA、Mastercard、American Express及JCB。', 'VISA·Mastercard·American Express·JCB를 안내합니다.', 'Se indican VISA, Mastercard, American Express y JCB.')),
      japaneseHealthInsurance: evidence('yes', 'https://ehealthclinic.jp/', publicInsuranceNote),
      walkInAvailable: evidence('no', 'https://ehealthclinic.jp/lang/en/faq/', note(
        '予約制。日本の保険資格・希望言語によって予約窓口が異なり、追加料金の案内があります。',
        'Appointment required. Booking channels depend on insurance and language; additional fees are listed.',
        '需预约。预约渠道依医保及语言而异，官网另有附加费用说明。',
        '예약 필수. 보험·언어에 따라 예약 창구가 다르며 추가 요금 안내가 있습니다.',
        'Requiere cita. La vía depende del seguro y del idioma; se indican cargos adicionales.')),
    },
  },
  {
    clinicId: 'clinic-1322136000366', clinicName: '医療法人社団インターナショナルヘルスケアクリニック', matchedPhone: '03-3501-1330',
    identitySource: 'https://www.ihc-clinic.jp/',
    fields: {
      creditCardAccepted: evidence('conditional', 'https://www.ihc-clinic.jp/hotel', note(
        '日本の健康保険を持たない旅行者の自費診療はカード可。保険診療の支払いとカードブランドは事前確認。',
        'Cards accepted for self-paying visitors without Japanese insurance. Confirm brands and payment for insured care.',
        '无日本医保的游客自费就诊可用卡；医保诊疗付款及卡种请先确认。',
        '일본 보험 없는 여행자의 자비 진료는 카드 가능. 보험 진료 결제와 카드 종류는 확인하세요.',
        'Tarjetas para visitantes que pagan sin seguro japonés. Confirme marcas y pago de atención asegurada.')),
      japaneseHealthInsurance: evidence('yes', 'https://www.ihc-clinic.jp/hotel', publicInsuranceNote),
      overseasInsuranceAccepted: evidence('information', 'https://www.ihc-clinic.jp/hotel', note(
        '立替後の保険請求用に英文領収書・明細書を発行。保険会社への直接請求は未確認です。',
        'English receipts and itemized bills for reimbursement claims. Direct billing has not been confirmed.',
        '提供英文收据及明细供垫付后理赔；未确认保险直接结算。',
        '선결제 후 보험 청구용 영문 영수증·명세서를 제공합니다. 직접 청구는 미확인입니다.',
        'Recibos y facturas en inglés para solicitar reembolso. La facturación directa no está confirmada.'), 'pay_first'),
      walkInAvailable: evidence('no', 'https://www.ihc-clinic.jp/internal', note(
        '全診療が予約制。当日の急な症状でも、連絡してから来院してください。',
        'Appointments required. Contact the clinic before visiting, including for same-day illness.',
        '所有诊疗需预约；当日突发不适也请先联系再就诊。',
        '모든 진료는 예약제입니다. 당일 증상도 먼저 연락 후 방문하세요.',
        'Requiere cita. Contacte antes de acudir, incluso si enferma ese mismo día.')),
    },
  },
  {
    clinicId: 'clinic-1322136600080', clinicName: '小石川インターナショナルクリニック', matchedPhone: '03-6757-2060',
    identitySource: 'https://www.kic.clinic/',
    fields: {
      creditCardAccepted: evidence('yes', 'https://www.kic.clinic/services/', note('VISA・Mastercard・JCB・AMEX・Diners・Discover・銀聯を掲載。', 'VISA, Mastercard, JCB, AMEX, Diners, Discover and UnionPay are listed.', '列明VISA、Mastercard、JCB、AMEX、Diners、Discover及银联。', 'VISA·Mastercard·JCB·AMEX·Diners·Discover·UnionPay를 안내합니다.', 'Se indican VISA, Mastercard, JCB, AMEX, Diners, Discover y UnionPay.')),
      japaneseHealthInsurance: evidence('yes', 'https://www.kic.clinic/services/', publicInsuranceNote),
      overseasInsuranceAccepted: evidence('information', 'https://www.kic.clinic/services/', note(
        '海外旅行保険への対応を掲載。ただし提携保険・支払保証・立替払いの条件は要確認です。',
        'Travel insurance is listed; confirm insurer eligibility, payment guarantees and upfront payment requirements.',
        '列明支持旅行保险；合作保险、付款保证及垫付条件请确认。',
        '여행보험 대응 안내가 있습니다. 대상 보험·지급보증·선결제 조건은 확인하세요.',
        'Se indica seguro de viaje; confirme aseguradoras, garantías y requisitos de pago anticipado.'), 'confirm'),
      walkInAvailable: evidence('no', 'https://www.kic.clinic/services/', note('完全予約制と案内されています。', 'The clinic states that all visits require appointments.', '官网注明完全预约制。', '완전 예약제로 안내되어 있습니다.', 'La clínica indica que todas las visitas requieren cita.')),
    },
  },
  {
    clinicId: 'clinic-1322136049670', clinicName: '医療法人社団ミッドタウンクリニック　東京ミッドタウンクリニック', matchedPhone: '03-5413-0080',
    identitySource: 'https://www.tokyomidtown-mc.jp/en/',
    fields: {
      japaneseHealthInsurance: evidence('conditional', 'https://www.tokyomidtown-mc.jp/outpatient/faq/', note('健康保険診療あり。診療科によって適用できない場合があるため確認が必要です。', 'Health insurance care is listed; some departments may be excluded. Confirm first.', '支持医保诊疗，但部分科室可能不适用，请先确认。', '건강보험 진료가 있으나 일부 진료과는 적용되지 않을 수 있습니다.', 'Se ofrece atención con seguro japonés; algunos departamentos pueden estar excluidos.')),
      walkInAvailable: evidence('no', 'https://www.tokyomidtown-mc.jp/outpatient/faq/', note(
        '外来は事前予約を案内。予約なしでは待ち時間が長くなる、または他院紹介となる場合があります。',
        'Book before visiting. Without a booking, waits may be long or you may be referred elsewhere.',
        '请提前预约；无预约可能久候或被转介其他机构。',
        '방문 전 예약을 안내합니다. 무예약 시 오래 기다리거나 다른 병원으로 안내될 수 있습니다.',
        'Reserve antes de acudir. Sin cita, puede haber mucha espera o derivación a otra clínica.')),
    },
  },
  {
    clinicId: 'clinic-1322133100087', clinicName: '医療法人社団コスモ　千駄ヶ谷インターナショナルクリニック', matchedPhone: '03-3478-4747',
    identitySource: 'https://www.sendagaya-ic.com/',
    fields: {
      japaneseHealthInsurance: evidence('yes', 'https://www.sendagaya-ic.com/services', publicInsuranceNote),
      walkInAvailable: evidence('information', 'https://www.sendagaya-ic.com/', note(
        '予約優先と案内。予約なしの受入可否は明確でないため、来院前に確認してください。',
        'Appointments have priority. Walk-in acceptance is unclear; contact the clinic before visiting.',
        '预约者优先；无预约接诊情况不明确，请先确认。',
        '예약자 우선 안내입니다. 무예약 접수 여부는 방문 전 확인하세요.',
        'Las citas tienen prioridad. La atención sin cita no está clara; consulte antes de acudir.')),
    },
  },
];

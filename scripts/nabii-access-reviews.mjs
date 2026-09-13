const note = (...values) => Object.fromEntries(['ja', 'en', 'zh', 'ko', 'es'].map((lang, i) => [lang, values[i]]));
const notes = {
  cardYes: note('医療情報ネットにカード決済「可能」と掲載。利用できるブランド・対象診療は施設にご確認ください。', 'Nabii lists credit cards as available. Confirm brands and eligible services.', '医疗信息网列明可用信用卡。请确认卡种及适用诊疗。', '의료정보넷에 카드 결제 가능으로 게재되어 있습니다. 카드 종류와 대상 진료를 확인하세요.', 'Nabii indica pago con tarjeta. Confirme marcas y servicios admitidos.'),
  cardNo: note('医療情報ネットにクレジットカード決済「不可」と掲載。最新の支払い方法は施設にご確認ください。', 'Nabii lists credit cards as unavailable. Confirm current payment methods.', '医疗信息网列明不可使用信用卡。请向机构确认最新付款方式。', '의료정보넷에 신용카드 결제 불가로 게재되어 있습니다. 최신 결제 방법을 확인하세요.', 'Nabii indica que no admite tarjetas. Confirme los medios de pago actuales.'),
  electronicNo: note('医療情報ネットに電子決済サービス「不可」と掲載。カード決済の個別記載はなく、詳細は施設にご確認ください。', 'Nabii lists electronic payments as unavailable; there is no separate card answer. Ask the clinic.', '医疗信息网列明电子支付不可用，未单独列明信用卡。请向机构确认。', '의료정보넷에 전자결제 불가로 게재되어 있으며 카드 개별 답변은 없습니다. 기관에 확인하세요.', 'Nabii indica que no acepta pagos electrónicos; no hay respuesta específica sobre tarjetas. Consulte a la clínica.'),
  insurance: note('医療情報ネットに「保険医療機関」と掲載。日本の保険資格・対象診療を確認してください。海外旅行保険の直接請求とは別です。', 'Nabii lists a Japanese insurance-designated clinic. Confirm eligibility and covered care; this does not establish travel-insurance direct billing.', '医疗信息网列为日本医保定点机构。请确认医保资格及诊疗范围；不代表旅行保险可直接结算。', '의료정보넷에 일본 보험의료기관으로 게재되어 있습니다. 자격과 적용 진료를 확인하세요. 여행보험 직접 청구와는 별개입니다.', 'Nabii indica una clínica designada para seguro japonés. Confirme requisitos y cobertura; no implica facturación directa a seguros de viaje.'),
  walk: note('医療情報ネットの診療科別の予約外診察情報です。下記の科目・条件を確認し、受診前に施設へご連絡ください。外国語対応には別途予約が必要な場合があります。', 'Nabii reports walk-in availability by specialty below. Contact the clinic before visiting; foreign-language care may require a separate appointment.', '以下为医疗信息网按诊疗科列明的无预约接诊信息。请先联系机构；外语服务可能另需预约。', '아래는 의료정보넷의 진료과별 무예약 진료 정보입니다. 방문 전 연락하세요. 외국어 진료는 별도 예약이 필요할 수 있습니다.', 'Nabii informa sobre consultas sin cita por especialidad. Contacte antes de acudir; la atención en otro idioma puede requerir reserva.'),
};

/** Materialize only explicit labelled answers. Unknown is never converted to no. */
export function nabiiAccessReviews(clinics, reports) {
  const byId = new Map(clinics.map(c => [c.id, c]));
  const seen = new Set();
  return reports.flatMap(report => {
    const clinic = byId.get(report.clinicId);
    const id = /^clinic-(\d{2})(2)(\d{10})$/.exec(report.clinicId);
    const url = new URL(report.url);
    if (!clinic || seen.has(report.clinicId) || !id || clinic.name.ja !== report.clinicName
      || clinic.phone !== report.matchedPhone || clinic.address.ja !== report.matchedAddress
      || url.origin !== 'https://www.iryou.teikyouseido.mhlw.go.jp'
      || url.pathname !== '/znk-web/juminkanja/S2430/initialize'
      || url.searchParams.get('prefCd') !== id[1] || url.searchParams.get('kikanKbn') !== id[2]
      || url.searchParams.get('kikanCd') !== id[3] || !/^[a-f0-9]{64}$/.test(report.sha256)) {
      throw new Error(`Nabii report identity mismatch: ${report.clinicId}`);
    }
    seen.add(report.clinicId);
    if (!Array.isArray(report.departments) || report.departments.some(d => typeof d.name !== 'string'
      || !d.name.trim() || !['yes', 'no', 'unknown'].includes(d.status))
      || !Array.isArray(report.languageReservations ?? [])
      || (report.languageReservations ?? []).some(l => typeof l.name !== 'string' || !l.name.trim()
        || !['要予約', '予約不要'].includes(l.reservation) || typeof l.note !== 'string')) {
      throw new Error(`Malformed Nabii access scope: ${report.clinicId}`);
    }
    const source = { kind: 'nabii_report', url: report.url, checkedAt: report.checkedAt,
      ...(report.sourceUpdatedAt ? { sourceUpdatedAt: report.sourceUpdatedAt } : {}) };
    const evidence = (status, text) => ({ status, notes: text, sources: [source] });
    const fields = {};
    if (report.creditCard === '可能') fields.creditCardAccepted = evidence('yes', notes.cardYes);
    else if (report.creditCard === '不可') fields.creditCardAccepted = evidence('no', notes.cardNo);
    else if (report.electronicPayment === '不可') fields.creditCardAccepted = evidence('information', notes.electronicNo);
    if (report.japaneseInsuranceDesignation === true) fields.japaneseHealthInsurance = evidence('yes', notes.insurance);
    const departments = report.departments ?? [];
    if (departments.some(d => ['yes', 'no'].includes(d.status)) || report.languageReservations?.length) {
      const status = departments.some(d => d.status === 'yes') ? 'conditional'
        : departments.length > 0 && departments.every(d => d.status === 'no') ? 'no' : 'information';
      fields.walkInAvailable = { ...evidence(status, notes.walk), departments,
        languageReservations: report.languageReservations ?? [] };
    }
    return Object.keys(fields).length ? [{ clinicId: clinic.id, clinicName: clinic.name.ja,
      matchedPhone: clinic.phone, identitySource: report.url, fields }] : [];
  });
}

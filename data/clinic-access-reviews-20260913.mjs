// Additional clinic-website checks, 2026-09-13. Exact base IDs/names/phones.
// These pages clarify limitations beyond the structured Nabii report.
const note = (...values) => Object.fromEntries(['ja', 'en', 'zh', 'ko', 'es'].map((lang, i) => [lang, values[i]]));
const evidence = (status, url, notes) => ({ status, notes, sources: [{ kind: 'official_website', url, checkedAt: '2026-09-13' }] });

export const additionalAccessReviews = [
  {
    clinicId: 'clinic-1322136055952', clinicName: '医療法人社団フローイースト　フローイーストクリニック', matchedPhone: '03-6277-3555',
    identitySource: 'https://floweast-clinic.com/access.html',
    fields: {
      creditCardAccepted: evidence('no', 'https://floweast-clinic.com/firsttime.html', note(
        '施設公式サイトでは現金のみ、クレジットカードは利用不可と案内しています。',
        'The clinic website states cash only; credit cards are unavailable.',
        '机构官网注明仅收现金，不接受信用卡。',
        '기관 공식 사이트에 현금만 가능하며 신용카드는 불가하다고 안내합니다.',
        'La web de la clínica indica solo efectivo, sin tarjetas.')),
      walkInAvailable: evidence('conditional', 'https://floweast-clinic.com/firsttime.html', note(
        '予約なしでも受診可ですが、予約優先で待ち時間が長くなる場合があります。来院前の予約を推奨しています。',
        'Walk-ins are accepted, with appointments taking priority. Waiting may be longer; advance booking is encouraged.',
        '可无预约就诊，但预约优先，可能需较长等候；建议事先预约。',
        '무예약 진료가 가능하지만 예약자가 우선이며 대기가 길어질 수 있습니다. 사전 예약을 권장합니다.',
        'Acepta visitas sin cita; las reservas tienen prioridad. Puede haber más espera y se recomienda reservar.')),
    },
  },
  {
    clinicId: 'clinic-1322136055947', clinicName: 'ガーデンクリニック広尾', matchedPhone: '03-6427-9198',
    identitySource: 'https://gardenclinic-hiroo.com/',
    fields: {
      walkInAvailable: evidence('conditional', 'https://gardenclinic-hiroo.com/services-en/', note(
        '一般皮膚科・男性向け診療・予防接種は通常予約不要。全身の皮膚がん検診は予約が必要です。受診目的を伝えて確認してください。',
        'General dermatology, men’s health and vaccinations usually allow walk-ins. Comprehensive skin-cancer screening requires booking. Confirm your visit purpose.',
        '普通皮肤科、男性健康及疫苗通常无需预约；全面皮肤癌筛查需预约。请说明就诊目的并确认。',
        '일반 피부과·남성 진료·예방접종은 보통 예약 불필요. 전신 피부암 검진은 예약이 필요합니다. 방문 목적을 알려 확인하세요.',
        'Dermatología general, salud masculina y vacunas suelen admitir visitas sin cita. El cribado completo de cáncer de piel requiere reserva. Confirme el motivo.')),
    },
  },
  {
    clinicId: 'clinic-1322133700167', clinicName: '平和国際医院', matchedPhone: '03-5904-8608',
    identitySource: 'https://www.heiwaic.com/',
    fields: {
      walkInAvailable: evidence('no', 'https://www.heiwaic.com/', note(
        '公式サイトのお知らせで予約制・診療時間内の電話予約を案内しています。',
        'The clinic’s notice asks patients to book by phone during clinic hours.',
        '官网公告注明预约制，请在诊疗时间内电话预约。',
        '공식 사이트 공지에서 예약제 및 진료시간 내 전화 예약을 안내합니다.',
        'El aviso de la clínica solicita reservar por teléfono durante su horario.')),
    },
  },
  {
    clinicId: 'clinic-1322139200123', clinicName: 'あおぞらインターナショナルクリニック', matchedPhone: '070-4419-7787',
    identitySource: 'https://aic119.com/ja/',
    fields: {
      creditCardAccepted: evidence('conditional', 'https://aic119.com/zh/', note(
        '往診サービスの支払いは現金またはクレジットカードと掲載。ブランド・遠隔診療の決済条件は事前に確認してください。',
        'Cash or credit cards are listed for house calls. Confirm brands and teleconsultation payment separately.',
        '到访诊疗列明可用现金或信用卡；卡种及远程诊疗付款条件请先确认。',
        '왕진 결제는 현금 또는 신용카드로 안내합니다. 카드 종류와 원격 진료 결제는 별도로 확인하세요.',
        'Se indica efectivo o tarjeta para visitas a domicilio. Confirme marcas y pagos de teleconsultas por separado.')),
      japaneseHealthInsurance: evidence('no', 'https://aic119.com/ja/', note(
        '自由診療のみで、日本の健康保険診療は取り扱わないと案内しています。旅行保険の直接請求は未確認です。',
        'Self-pay care only; Japanese health insurance is not accepted. Travel-insurance direct billing is unconfirmed.',
        '仅提供自费诊疗，不接受日本医保。旅行保险直接结算未确认。',
        '자비 진료만 제공하며 일본 건강보험 진료는 취급하지 않습니다. 여행보험 직접 청구는 미확인입니다.',
        'Solo atención privada; no acepta seguro médico japonés. No se ha confirmado facturación directa a seguros de viaje.')),
      walkInAvailable: evidence('no', 'https://aic119.com/ja/', note(
        '往診専門・完全予約制です。所在地への予約なし来院は案内していません。必ず電話でお問い合わせください。',
        'House-call service by appointment only. Do not arrive at the listed address without arranging care by phone.',
        '专门提供往诊，完全预约制。请先电话联系，不要直接前往登记地址。',
        '왕진 전문·완전 예약제입니다. 등록 주소로 바로 방문하지 말고 반드시 전화로 문의하세요.',
        'Servicio a domicilio con reserva obligatoria. Llame antes; no acuda sin cita a la dirección registrada.')),
    },
  },
];

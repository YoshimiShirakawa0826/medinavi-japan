// Additional clinic-website checks, 2026-09-13. Exact base IDs/names/phones.
// These pages clarify limitations beyond the structured Nabii report.
const note = (...values) => Object.fromEntries(['ja', 'en', 'zh', 'ko', 'es'].map((lang, i) => [lang, values[i]]));
const evidence = (status, url, notes) => ({ status, notes, sources: [{ kind: 'official_website', url, checkedAt: '2026-09-13' }] });
const nabii = (code, sourceUpdatedAt) => ({ kind: 'nabii_report', url: `https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2430/initialize?kikanCd=${code}&kikanKbn=2&prefCd=13`, checkedAt: '2026-09-13', sourceUpdatedAt });

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
      walkInAvailable: {
        ...evidence('conditional', 'https://floweast-clinic.com/firsttime.html', note(
          '公式サイトは予約優先で無予約も受入と案内していますが、医療情報ネットでは診療科・英語対応の予約条件が異なります。下記を確認し、事前に施設へお問い合わせください。',
          'The website allows walk-ins with appointment priority, but Nabii lists specialty and English booking restrictions. Check the details below and call first.',
          '官网允许无预约就诊但预约优先；医疗信息网另有诊疗科及英语预约限制。请查看下方条件并先联系。',
          '공식 사이트는 예약 우선·무예약 가능으로 안내하지만 의료정보넷에는 진료과·영어 예약 제한이 있습니다. 아래 조건을 확인하고 먼저 연락하세요.',
          'La web admite visitas sin cita con prioridad a reservas; Nabii añade restricciones por especialidad e inglés. Consulte los detalles y llame antes.')),
        departments: [{ name: 'アレルギー疾患内科', status: 'no' }, { name: 'アレルギー科', status: 'no' }, { name: '小児科', status: 'yes' }],
        languageReservations: [{ name: '英語', reservation: '要予約', note: '-' }],
        sources: [{ kind: 'official_website', url: 'https://floweast-clinic.com/firsttime.html', checkedAt: '2026-09-13' }, nabii('2136055952', '2026-03-23')],
      },
    },
  },
  {
    clinicId: 'clinic-1322136055947', clinicName: 'ガーデンクリニック広尾', matchedPhone: '03-6427-9198',
    identitySource: 'https://gardenclinic-hiroo.com/',
    fields: {
      walkInAvailable: {
        ...evidence('conditional', 'https://gardenclinic-hiroo.com/services-en/', note(
        '一般皮膚科・男性向け診療・予防接種は通常予約不要。全身の皮膚がん検診は予約が必要です。受診目的を伝えて確認してください。',
        'General dermatology, men’s health and vaccinations usually allow walk-ins. Comprehensive skin-cancer screening requires booking. Confirm your visit purpose.',
        '普通皮肤科、男性健康及疫苗通常无需预约；全面皮肤癌筛查需预约。请说明就诊目的并确认。',
        '일반 피부과·남성 진료·예방접종은 보통 예약 불필요. 전신 피부암 검진은 예약이 필요합니다. 방문 목적을 알려 확인하세요.',
        'Dermatología general, salud masculina y vacunas suelen admitir visitas sin cita. El cribado completo de cáncer de piel requiere reserva. Confirme el motivo.')),
        departments: [{ name: 'アレルギー科', status: 'yes' }, { name: '皮膚科', status: 'yes' }],
        languageReservations: [{ name: '英語', reservation: '予約不要', note: '-' }, { name: '広東語', reservation: '予約不要', note: '-' }, { name: '北京語', reservation: '要予約', note: '-' }],
        sources: [{ kind: 'official_website', url: 'https://gardenclinic-hiroo.com/services-en/', checkedAt: '2026-09-13' }, nabii('2136055947', '2026-01-21')],
      },
      overseasInsuranceAccepted: {
        status: 'information', billing: 'confirm',
        notes: note(
          '医療情報ネットに旅行保険・海外健康保険への対応記載があります。保険会社・直接請求・立替払いの条件は未確認のため、受診前に施設と保険会社へ確認してください。',
          'Nabii mentions travel and overseas health insurance. Insurers, direct billing and reimbursement conditions are unconfirmed; ask the clinic and insurer before care.',
          '医疗信息网提及旅行及海外健康保险。保险公司、直接结算及垫付条件未确认；就诊前请咨询机构与保险公司。',
          '의료정보넷에 여행·해외 건강보험 대응이 기재되어 있습니다. 보험사·직접 청구·선결제 조건은 미확인으로, 진료 전 기관과 보험사에 확인하세요.',
          'Nabii menciona seguros de viaje y médicos extranjeros. Aseguradoras y condiciones de pago o reembolso no están confirmadas; consulte antes.'),
        sources: [nabii('2136055947', '2026-01-21')],
      },
    },
  },
  {
    clinicId: 'clinic-1322133700167', clinicName: '平和国際医院', matchedPhone: '03-5904-8608',
    identitySource: 'https://www.heiwaic.com/',
    fields: {
      walkInAvailable: {
        ...evidence('information', 'https://www.heiwaic.com/', note(
          '医療情報ネットでは予約外診察が可能と掲載されていますが、公式サイトのお知らせでは電話予約を案内しています。予約なしで受診できるか、診療時間内に電話で確認してください。',
          'Nabii lists walk-ins as available, but the clinic’s website notice asks patients to book by phone. Call during clinic hours to confirm before visiting without an appointment.',
          '医疗信息网记载可无预约就诊，但官网公告要求电话预约。请在诊疗时间内电话确认后再前往。',
          '의료정보넷에는 무예약 진료 가능으로 기재되어 있으나 공식 사이트 공지는 전화 예약을 안내합니다. 예약 없이 방문하기 전 진료시간 내 전화로 확인하세요.',
          'Nabii indica visitas sin cita, pero el aviso de la clínica pide reservar por teléfono. Llame durante su horario para confirmar antes de acudir sin cita.')),
        sources: [
          { kind: 'official_website', url: 'https://www.heiwaic.com/', checkedAt: '2026-09-13' },
          nabii('2133700167', '2025-07-08'),
        ],
      },
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

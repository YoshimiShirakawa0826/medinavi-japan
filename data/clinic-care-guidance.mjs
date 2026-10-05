// Editorial supplements checked against official clinic pages on 2026-10-05.
// Unknown is deliberately omitted; a missing field is not a negative answer.
const notes = (ja, en, zh, ko, es) => ({ ja, en, zh, ko, es });
const sources = (...urls) => urls.map(url => ({ url, checkedAt: '2026-10-05' }));
const everyDay = hours => Object.fromEntries(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => [day, hours]));

export const clinicCareGuidance = [
  {
    id: 'clinic-1321310137240', phone: '03-6206-3070', addLanguages: ['zh'],
    guide: {
      bookingUrl: 'https://ckreserve.com/tsic/',
      onlineInfoUrl: 'https://www.international-clinic.tokyo/online-consultation/',
      receptionHours: everyDay([{ start: '09:00', end: '20:30' }]),
      notes: notes(
        ['受付は20:30まで（診療は9:00〜21:00）。予約優先・予約なしでも相談可能。来院前に当日の受付を確認してください。', '英語・中国語対応の案内あり。その他の言語は事前相談が必要です。', '一般診療が中心です。X線検査・傷の縫合は行いません。オンライン診療は公式案内から対象・予約方法を確認できます。'],
        ['Reception ends at 20:30 (consultations 09:00–21:00). Appointments take priority; walk-ins may enquire. Confirm same-day availability before visiting.', 'English and Chinese are listed. Contact the clinic in advance for other languages.', 'General practice; no X-rays or wound suturing. See the official online-care page for eligibility and booking.'],
        ['接待截止20:30（诊疗9:00–21:00）。预约优先，也可咨询无预约就诊；来院前请确认当日接诊情况。', '提供英语、中文服务，其他语言需提前联系。', '以全科诊疗为主，不提供X光检查或伤口缝合。在线诊疗条件及预约方法请查看官方说明。'],
        ['접수는 20:30까지(진료 09:00–21:00)입니다. 예약 우선이며 예약 없이도 문의할 수 있습니다. 방문 전 당일 접수 여부를 확인하세요.', '영어·중국어 안내가 있습니다. 다른 언어는 사전에 문의하세요.', '일반 진료 중심이며 X선 검사와 상처 봉합은 하지 않습니다. 온라인 진료 대상과 예약 방법은 공식 안내를 확인하세요.'],
        ['Recepción hasta las 20:30 (consulta 09:00–21:00). Las citas tienen prioridad; puede consultar sin cita. Confirme la disponibilidad antes de acudir.', 'Se anuncian inglés y chino. Consulte antes para otros idiomas.', 'Medicina general; sin radiografías ni suturas. Consulte la página oficial para requisitos y reservas de atención en línea.'],
      ),
      sources: sources('https://www.international-clinic.tokyo/faq/', 'https://www.international-clinic.tokyo/online-consultation/'),
    },
  },
  {
    id: 'clinic-1322136200484', phone: '03-5315-0514', addLanguages: ['en', 'zh'],
    guide: {
      uninsuredAccepted: true,
      bookingUrl: 'https://patient.ambii.com/zhCn/appointment/clinic/jUyJGTFqqLKTrF9ukwKs',
      scheduleNeedsConfirmation: true,
      notes: notes(
        ['日本の健康保険がない方は専用予約窓口（Ambii）へ。原則予約制です。', '内科は16歳以上が対象です。18歳未満は保護者同伴が必要です。', '医師の英語・中国語対応の案内あり。オンライン診療の可否は医師が判断します。', '公式ページ間で診療時間に相違があるため、受付時間を予約時に確認してください。予約手数料・診療費・薬代の総額も事前確認が必要です。救急処置には対応しません。'],
        ['Without Japanese health insurance, use the dedicated Ambii booking service. Appointments are generally required.', 'Internal medicine is for ages 16 and over. Patients under 18 need a guardian present.', 'English- and Chinese-speaking doctors are listed. A doctor determines eligibility for online care.', 'Official pages show different hours; confirm reception times when booking. Confirm the total booking, consultation and medication costs in advance. Emergency treatment is not provided.'],
        ['无日本健康保险者请通过专用Ambii窗口预约，原则上需预约。', '内科面向16岁及以上患者，未满18岁需监护人陪同。', '有英语及中文医生。能否在线诊疗由医生判断。', '官方页面的营业时间不一致，请在预约时确认接待时间及预约费、诊疗费和药费总额。不提供急救处置。'],
        ['일본 건강보험이 없으면 전용 Ambii 창구로 예약하세요. 원칙적으로 예약이 필요합니다.', '내과 진료는 만 16세 이상이며, 만 18세 미만은 보호자 동반이 필요합니다.', '영어·중국어 진료 안내가 있습니다. 온라인 진료 가능 여부는 의사가 판단합니다.', '공식 페이지의 시간이 서로 달라 예약 시 접수 시간을 확인하세요. 예약료·진료비·약값 총액도 미리 확인하세요. 응급 처치는 제공하지 않습니다.'],
        ['Sin seguro de salud japonés, reserve mediante el servicio Ambii dedicado. Generalmente se requiere cita.', 'Medicina interna para pacientes de 16 años o más. Los menores de 18 deben acudir con un tutor.', 'Se anuncian médicos que hablan inglés y chino. El médico decide si la atención en línea es adecuada.', 'Las páginas oficiales difieren en horarios: confirme la recepción al reservar y el coste total de reserva, consulta y medicamentos. No ofrece tratamiento de emergencia.'],
      ),
      sources: sources('https://ehealthclinic.jp/lang/en/faq/', 'https://ehealthclinic.jp/faq/'),
    },
  },
  {
    id: 'clinic-1322136000349', phone: '03-6447-5966', addLanguages: [],
    guide: {
      uninsuredAccepted: true,
      bookingUrl: 'https://line.me/R/ti/p/%40edg6516c',
      receptionHours: {
        ...everyDay([{ start: '08:00', end: '12:00' }, { start: '14:00', end: '17:30' }]),
        sat: [{ start: '09:00', end: '12:30' }], sun: [{ start: '09:00', end: '12:30' }],
      },
      notes: notes(
        ['日本の健康保険なしでも受診可能。6歳以上の診察料は初診8,300円・再診3,080円、6歳未満は初診15,140円・再診9,140円。検査・薬代等は別途です。', '受付は平日12:00／17:30まで、土日12:30まで。祝日は休診。予約なしでも受診可能で、LINE予約・当日順番受付もあります。', '中国語の医師は毎日勤務しているとは限りません。1歳未満は受診可否を事前確認してください。'],
        ['Patients without Japanese health insurance are accepted. Consultation only: age 6+ ¥8,300 first / ¥3,080 follow-up; under 6 ¥15,140 first / ¥9,140 follow-up. Tests and medicines cost extra.', 'Reception ends at 12:00 / 17:30 on weekdays and 12:30 on weekends; closed on public holidays. Walk-ins, LINE appointments and same-day queue registration are available.', 'A Chinese-speaking doctor is not available every day. Confirm acceptance of infants under 1 before visiting.'],
        ['接受无日本健康保险患者。仅诊察费：6岁及以上初诊8,300日元、复诊3,080日元；未满6岁初诊15,140日元、复诊9,140日元。检查及药费另计。', '工作日接待截止12:00／17:30，周末12:30；节假日休诊。可无预约就诊，也可通过LINE预约或当天取号。', '中文医生并非每天在岗；未满1岁婴儿请事先确认能否接诊。'],
        ['일본 건강보험 없이도 진료 가능합니다. 진찰료만: 만 6세 이상 초진 8,300엔 / 재진 3,080엔, 6세 미만 초진 15,140엔 / 재진 9,140엔. 검사·약값은 별도입니다.', '평일 접수 마감 12:00 / 17:30, 주말 12:30. 공휴일 휴진. 예약 없이 방문하거나 LINE 예약·당일 순번 접수를 이용할 수 있습니다.', '중국어 의사가 매일 근무하지는 않습니다. 만 1세 미만은 방문 전 진료 가능 여부를 확인하세요.'],
        ['Acepta pacientes sin seguro de salud japonés. Solo consulta: desde 6 años, primera ¥8.300 / seguimiento ¥3.080; menores de 6, primera ¥15.140 / seguimiento ¥9.140. Pruebas y medicamentos aparte.', 'Recepción hasta 12:00 / 17:30 entre semana y 12:30 los fines de semana; cerrado en festivos. Admite visitas sin cita, reservas por LINE y turnos del día.', 'No siempre hay médico de habla china. Confirme antes la atención a menores de 1 año.'],
      ),
      sources: sources('https://nic-med.com/english/'),
    },
  },
];

export function applyCareGuidance(clinics) {
  const byId = new Map(clinicCareGuidance.map(review => [review.id, review]));
  for (const review of clinicCareGuidance) {
    const clinic = clinics.find(item => item.id === review.id);
    if (!clinic || clinic.phone.replace(/\D/g, '') !== review.phone.replace(/\D/g, '')) {
      throw new Error(`Care guidance identity mismatch: ${review.id}`);
    }
  }
  return clinics.map(clinic => {
    const review = byId.get(clinic.id);
    return review ? { ...clinic, careGuide: review.guide, supportedLanguages: [...new Set([...clinic.supportedLanguages, ...review.addLanguages])] } : clinic;
  });
}

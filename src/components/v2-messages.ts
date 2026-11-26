import type { Language } from '@/types';

// 2026-11 safety / UX / SEO update. These keys take priority over older message tables.
const message = (ja: string, en: string, zh: string, ko: string, es: string): Record<Language, string> => ({ ja, en, zh, ko, es });

export const v2Messages: Record<string, Record<Language, string>> = {
  // Navigation: the data set is clinics (診療所), not hospitals.
  'nav.hospitals': message('クリニック一覧', 'Clinics', '诊所列表', '클리닉 목록', 'Clínicas'),
  'footer.terms': message('利用規約', 'Terms of service', '服务条款', '이용약관', 'Condiciones de uso'),
  'footer.privacy': message('プライバシーポリシー', 'Privacy policy', '隐私政策', '개인정보 처리방침', 'Política de privacidad'),
  'common.call': message('電話する', 'Call', '拨打', '전화하기', 'Llamar'),
  'common.call119': message('119に電話', 'Call 119', '拨打 119', '119에 전화', 'Llamar al 119'),
  'common.japaneseOnly': message('日本語のみ', 'Japanese only', '仅日语', '일본어만', 'Solo japonés'),
  'common.hours24': message('24時間・年中無休', '24 hours, every day', '24小时・全年无休', '24시간・연중무휴', '24 horas, todos los días'),
  'common.opensExternal': message('外部サイトが開きます', 'Opens an external site', '将打开外部网站', '외부 사이트가 열립니다', 'Abre un sitio externo'),

  // Emergency page
  'em.badge': message('緊急時の情報', 'Emergency information', '紧急信息', '응급 정보', 'Información de emergencia'),
  'em.title': message('急な病気・けがのときにすること', 'What to do in a medical emergency', '突发疾病或受伤时怎么办', '갑자기 아프거나 다쳤을 때', 'Qué hacer en una emergencia médica'),
  'em.lead': message('症状の重さに合わせて、連絡先を選んでください。', 'Choose who to call based on how serious it is.', '请根据症状的严重程度选择联系方式。', '증상의 심각도에 따라 연락처를 선택하세요.', 'Elija a quién llamar según la gravedad.'),
  'em.119.badge': message('119番', 'Dial 119', '拨打 119', '119번', 'Marque 119'),
  'em.119.title': message('救急車・消防', 'Ambulance & fire', '救护车・消防', '구급차・소방', 'Ambulancia y bomberos'),
  'em.119.desc': message('意識がない、強い胸の痛み、大量の出血、急な手足のまひ、呼吸が苦しいなど、命に関わる症状があればすぐに電話してください。通話料・救急車の利用は無料です。', 'Call right away for life-threatening symptoms: unconsciousness, severe chest pain, heavy bleeding, sudden weakness of an arm or leg, or difficulty breathing. The call and the ambulance are free.', '如出现昏迷、剧烈胸痛、大量出血、手脚突然麻痹、呼吸困难等危及生命的症状，请立即拨打。通话和救护车均免费。', '의식이 없음, 심한 가슴 통증, 대량 출혈, 갑작스러운 팔다리 마비, 호흡 곤란 등 생명이 위험한 증상이 있으면 즉시 전화하세요. 통화와 구급차는 무료입니다.', 'Llame de inmediato ante síntomas graves: pérdida de conciencia, dolor fuerte en el pecho, hemorragia abundante, debilidad súbita de un brazo o pierna o dificultad para respirar. La llamada y la ambulancia son gratuitas.'),
  'em.119.interp': message('東京消防庁では英語・中国語・韓国語などの通訳を介した対応を行っています。通訳につながるまで電話を切らずにお待ちください。最初に「Emergency（救急です）」と伝えてください。', 'Tokyo Fire Department can connect an interpreter (English, Chinese, Korean and more). Stay on the line until the interpreter joins. Start by saying "Emergency" (Kyūkyū desu).', '东京消防厅可通过口译提供英语、中文、韩语等服务。请不要挂断，等待口译员接入。先说“Emergency（救急です）”。', '도쿄소방청은 영어・중국어・한국어 등 통역을 연결해 드립니다. 통역이 연결될 때까지 전화를 끊지 마세요. 먼저 "Emergency(규큐데스)"라고 말하세요.', 'El Departamento de Bomberos de Tokio puede conectar un intérprete (inglés, chino, coreano y otros). No cuelgue hasta que se una. Empiece diciendo "Emergency" (Kyūkyū desu).'),
  'em.7119.title': message('救急車を呼ぶか迷うとき（#7119）', 'Not sure if you need an ambulance? (#7119)', '不确定是否需要救护车？(#7119)', '구급차를 불러야 할지 모를 때 (#7119)', '¿No sabe si necesita ambulancia? (#7119)'),
  'em.7119.desc': message('東京消防庁救急相談センター。看護師などが救急車が必要か、どこを受診すればよいかを案内します。対応は日本語のみです。日本語を話せる同行者やホテルのスタッフに電話してもらってください。', 'Tokyo Fire Department Emergency Consultation Center. Nurses advise whether you need an ambulance and where to go. It answers in Japanese only, so ask a Japanese-speaking companion or hotel staff to call for you.', '东京消防厅急救咨询中心。护士等会告诉您是否需要救护车以及该去哪里就诊。仅提供日语服务，请让会说日语的同伴或酒店工作人员代为拨打。', '도쿄소방청 구급상담센터. 간호사 등이 구급차가 필요한지, 어디서 진료받아야 하는지 안내합니다. 일본어로만 응대하므로 일본어를 하는 동행자나 호텔 직원에게 대신 전화를 부탁하세요.', 'Centro de Consulta de Emergencias de Bomberos de Tokio. Personal de enfermería le indica si necesita ambulancia y adónde ir. Atiende solo en japonés: pida a un acompañante que hable japonés o al personal del hotel que llame por usted.'),
  'em.7119.inYourLanguage': message('自分の言語で相談したい場合は、下の「あなたの言語で相談」の窓口を使ってください。', 'To get advice in your own language, use the lines under "Help in your language" below.', '如需用您的语言咨询，请使用下方“用您的语言咨询”中的窗口。', '본인의 언어로 상담하려면 아래 "모국어로 상담"의 창구를 이용하세요.', 'Para recibir orientación en su idioma, use las líneas de "Ayuda en su idioma" más abajo.'),
  'em.7119.alt': message('#7119につながらない電話（海外の携帯など）からは 03-3212-2323（同じ窓口・24時間）へ。', 'If your phone cannot dial #7119 (e.g. a foreign mobile), call 03-3212-2323 (same service, 24 hours).', '如果您的电话无法拨打 #7119（如外国手机），请拨打 03-3212-2323（同一窗口，24小时）。', '#7119로 걸리지 않는 전화(해외 휴대폰 등)는 03-3212-2323(같은 창구・24시간)으로 거세요.', 'Si su teléfono no puede marcar #7119 (p. ej., un móvil extranjero), llame al 03-3212-2323 (mismo servicio, 24 horas).'),
  'em.7119.callAlt': message('03-3212-2323 に電話', 'Call 03-3212-2323', '拨打 03-3212-2323', '03-3212-2323에 전화', 'Llamar al 03-3212-2323'),

  'em.ml.title': message('あなたの言語で相談', 'Help in your language', '用您的语言咨询', '모국어로 상담', 'Ayuda en su idioma'),
  'em.ml.lead': message('どこを受診すればよいか、自分の言語で電話相談できます。相談は無料（通話料は利用者負担）です。', 'Get phone advice on where to go for care, in your own language. Advice is free; call charges apply.', '可用您的语言电话咨询该去哪里就诊。咨询免费（通话费自理）。', '어디서 진료받아야 할지 모국어로 전화 상담할 수 있습니다. 상담은 무료(통화료는 본인 부담)입니다.', 'Reciba orientación telefónica en su idioma sobre dónde atenderse. Es gratuita; se cobra la llamada.'),
  'em.himawari.name': message('東京都 外国人患者向け医療情報サービス（ひまわり）', 'Tokyo Medical Information Service for foreign patients (HIMAWARI)', '东京都外国患者医疗信息服务（HIMAWARI）', '도쿄도 외국인 환자 의료정보 서비스 (히마와리)', 'Servicio de Información Médica de Tokio para pacientes extranjeros (HIMAWARI)'),
  'em.himawari.desc': message('外国語で受診できる医療機関の案内、日本の医療制度の説明。英語・中国語・韓国語・タイ語・スペイン語。毎日 9:00〜20:00。', 'Finds clinics that can see you in your language and explains Japan\'s medical system. English, Chinese, Korean, Thai, Spanish. Daily 9:00–20:00.', '介绍可用外语就诊的医疗机构，说明日本医疗制度。英语・中文・韩语・泰语・西班牙语。每天 9:00–20:00。', '외국어로 진료받을 수 있는 의료기관 안내, 일본 의료제도 설명. 영어・중국어・한국어・태국어・스페인어. 매일 9:00~20:00.', 'Le indica clínicas que atienden en su idioma y explica el sistema médico japonés. Inglés, chino, coreano, tailandés y español. Todos los días de 9:00 a 20:00.'),
  'em.jnto.name': message('日本政府観光局（JNTO）Japan Visitor Hotline', 'Japan Visitor Hotline (JNTO)', '日本国家旅游局（JNTO）旅客咨询热线', '일본정부관광국(JNTO) 일본 방문자 핫라인', 'Japan Visitor Hotline (JNTO)'),
  'em.jnto.desc': message('病気・事故・災害など困ったときの相談。英語・中国語・韓国語。24時間・年中無休。', 'Help with illness, accidents, disasters and other trouble. English, Chinese, Korean. 24 hours, every day.', '生病、事故、灾害等遇到困难时的咨询。英语・中文・韩语。24小时・全年无休。', '질병・사고・재해 등 곤란할 때 상담. 영어・중국어・한국어. 24시간・연중무휴.', 'Ayuda en caso de enfermedad, accidentes, desastres y otros problemas. Inglés, chino y coreano. 24 horas, todos los días.'),
  'em.police': message('事件・交通事故は 110（警察）', 'Crime or traffic accident: 110 (police)', '案件・交通事故请拨 110（警察）', '사건・교통사고는 110(경찰)', 'Delitos o accidentes de tráfico: 110 (policía)'),

  'em.hosp.title': message('病院・救急外来を探す', 'Finding hospitals and emergency departments', '查找医院・急诊', '병원・응급실 찾기', 'Buscar hospitales y urgencias'),
  'em.hosp.desc': message('このアプリが掲載しているのは厚生労働省オープンデータの「診療所（クリニック）」です。入院設備や救急外来のある病院、外国人患者を受け入れる医療機関は、次の公的サイトで探せます。', 'This app lists clinics from Japan\'s Ministry of Health open data. Hospitals with inpatient wards or emergency departments, and facilities that accept foreign patients, can be found on these official sites.', '本应用收录的是日本厚生劳动省开放数据中的“诊所”。有住院设施或急诊的医院、接收外国患者的医疗机构，可在以下官方网站查找。', '이 앱에 실린 곳은 후생노동성 오픈데이터의 "진료소(클리닉)"입니다. 입원 시설이나 응급실이 있는 병원, 외국인 환자를 받는 의료기관은 아래 공식 사이트에서 찾을 수 있습니다.', 'Esta app muestra clínicas de los datos abiertos del Ministerio de Salud de Japón. Los hospitales con hospitalización o urgencias y los centros que aceptan pacientes extranjeros se pueden buscar en estos sitios oficiales.'),
  'em.hosp.jnto': message('JNTO：外国人旅行者を受け入れる医療機関の検索', 'JNTO: medical institutions that accept foreign visitors', 'JNTO：接收外国游客的医疗机构搜索', 'JNTO: 외국인 여행자를 받는 의료기관 검색', 'JNTO: centros médicos que aceptan a visitantes extranjeros'),
  'em.hosp.tokyo': message('東京都：外国人向け医療情報サイト', 'Tokyo Metropolitan Government: medical information for foreign visitors', '东京都：面向外国人的医疗信息网站', '도쿄도: 외국인을 위한 의료정보 사이트', 'Gobierno de Tokio: información médica para extranjeros'),
  'em.hosp.nabii': message('医療情報ネット（ナビイ）：夜間・休日も含めて全国の医療機関・薬局を検索', 'Medical Information Net (Nabii): search hospitals and pharmacies nationwide, including nights and holidays', '医疗信息网（Nabii）：搜索全国医疗机构・药店（含夜间・节假日）', '의료정보넷(나비이): 야간・휴일을 포함해 전국 의료기관・약국 검색', 'Medical Information Net (Nabii): busque hospitales y farmacias de todo Japón, también de noche y en festivos'),

  'em.prep.title': message('受診するときに持っていくもの', 'What to bring', '就诊时需携带', '진료받을 때 가져갈 것', 'Qué llevar'),
  'em.prep.passport': message('パスポート', 'Passport', '护照', '여권', 'Pasaporte'),
  'em.prep.insurance': message('海外旅行保険の証券・カード。先に保険会社のアシスタンス窓口へ連絡すると、病院の紹介やキャッシュレス受診の手配をしてもらえる場合があります。', 'Travel insurance policy or card. Call your insurer\'s assistance line first — they may find a hospital and arrange cashless treatment.', '海外旅行保险的保单或保险卡。先联系保险公司的援助窗口，可能会帮您介绍医院或安排免现金就诊。', '해외여행보험 증권・카드. 먼저 보험사 어시스턴스 창구에 연락하면 병원 소개나 캐시리스 진료를 준비해 줄 수 있습니다.', 'Póliza o tarjeta del seguro de viaje. Llame primero a la línea de asistencia de su aseguradora: puede buscarle un hospital y organizar la atención sin pago directo.'),
  'em.prep.meds': message('飲んでいる薬・アレルギーのメモ', 'A note of your current medicines and allergies', '正在服用的药物和过敏情况的记录', '복용 중인 약・알레르기 메모', 'Una nota con sus medicamentos y alergias'),
  'em.prep.pay': message('現金またはクレジットカード（カードが使えない医療機関もあります）', 'Cash or a credit card (not every clinic accepts cards)', '现金或信用卡（部分医疗机构不能刷卡）', '현금 또는 신용카드(카드를 쓸 수 없는 의료기관도 있습니다)', 'Efectivo o tarjeta de crédito (no todas las clínicas aceptan tarjeta)'),
  'em.cost.title': message('医療費について', 'About medical costs', '关于医疗费', '의료비에 대해', 'Sobre los costos médicos'),
  'em.cost.desc': message('日本の公的医療保険がない場合、医療費は全額自己負担で、金額は医療機関によって異なります。電話のときに目安を確認し、保険請求のために領収書と診断書などの書類を受け取ってください。医療費を支払わないと、今後の日本への入国に影響する場合があります。', 'Without Japanese public health insurance you pay the full cost, and fees differ between clinics. Ask for an estimate when you call, and keep receipts and medical documents for your insurance claim. Unpaid medical bills may affect future entry to Japan.', '没有日本公共医疗保险时，医疗费需全额自付，金额因医疗机构而异。请在电话中确认大概费用，并保留收据和诊断书等文件以便保险理赔。未支付医疗费可能影响今后入境日本。', '일본 공적 의료보험이 없으면 의료비는 전액 본인 부담이며 금액은 의료기관마다 다릅니다. 전화할 때 대략적인 금액을 확인하고, 보험 청구를 위해 영수증과 진단서 등 서류를 받아 두세요. 의료비를 내지 않으면 향후 일본 입국에 영향을 줄 수 있습니다.', 'Sin seguro médico público japonés, usted paga el costo total, que varía según la clínica. Pida un presupuesto al llamar y guarde los recibos y documentos médicos para reclamar al seguro. Las facturas médicas impagadas pueden afectar a futuras entradas a Japón.'),

  'em.phrases.title': message('救急時に使える日本語', 'Japanese phrases for emergencies', '紧急时可用的日语', '응급 시 쓸 수 있는 일본어', 'Frases en japonés para emergencias'),
  'em.phrases.pron': message('読み方', 'Pronunciation', '读音', '발음', 'Pronunciación'),
  'em.phrases.meaning': message('意味', 'Meaning', '意思', '뜻', 'Significado'),
  'em.phrase1.meaning': message('救急車をお願いします。', 'Please send an ambulance.', '请派救护车。', '구급차를 보내 주세요.', 'Envíen una ambulancia, por favor.'),
  'em.phrase2.meaning': message('場所は［現在地の住所・建物名］です。', 'The location is [your address / building name].', '地点是［当前地址・建筑名称］。', '장소는 [현재 위치 주소・건물명]입니다.', 'El lugar es [su dirección / nombre del edificio].'),
  'em.phrase3.ja': message('英語が話せる人はいますか？', '英語が話せる人はいますか？', '中国語が話せる人はいますか？', '韓国語が話せる人はいますか？', 'スペイン語が話せる人はいますか？'),
  'em.phrase3.pron': message('Eigo ga hanaseru hito wa imasu ka?', 'Eigo ga hanaseru hito wa imasu ka?', 'Chūgokugo ga hanaseru hito wa imasu ka?', 'Kankokugo ga hanaseru hito wa imasu ka?', 'Supeingo ga hanaseru hito wa imasu ka?'),
  'em.phrase3.meaning': message('英語を話せる人はいますか？', 'Is there anyone who speaks English?', '有会说中文的人吗？', '한국어를 할 수 있는 사람이 있나요?', '¿Hay alguien que hable español?'),
  'em.phrase4.meaning': message('旅行者です。日本の健康保険はありません。', 'I am a tourist. I do not have Japanese health insurance.', '我是游客。没有日本的健康保险。', '여행자입니다. 일본 건강보험은 없습니다.', 'Soy turista. No tengo seguro médico japonés.'),
  'em.disclaimer.title': message('ご注意', 'Important', '注意', '주의', 'Importante'),
  'em.disclaimer.body': message('このページは情報提供と案内のためのもので、医学的な判断を行うものではありません。意識がない、呼吸が苦しい、大量の出血、胸の痛みなど危険な症状があるときは、迷わず119に電話してください。', 'This page gives information and directions only; it does not make medical judgements. For danger signs such as unconsciousness, difficulty breathing, heavy bleeding or chest pain, call 119 without delay.', '本页面仅用于提供信息和指引，不做医学判断。如有昏迷、呼吸困难、大量出血、胸痛等危险症状，请毫不犹豫拨打119。', '이 페이지는 정보 제공과 안내를 위한 것이며 의학적 판단을 하지 않습니다. 의식이 없음, 호흡 곤란, 대량 출혈, 가슴 통증 등 위험한 증상이 있으면 망설이지 말고 119에 전화하세요.', 'Esta página solo ofrece información y orientación; no realiza juicios médicos. Ante signos de peligro como pérdida de conciencia, dificultad para respirar, hemorragia abundante o dolor en el pecho, llame al 119 sin demora.'),
  'em.offline': message('このページは一度開くと、電波がないときにも表示できます。', 'Once opened, this page is available even without a connection.', '本页面打开一次后，即使没有网络也能显示。', '이 페이지는 한 번 열면 인터넷이 없어도 볼 수 있습니다.', 'Una vez abierta, esta página está disponible incluso sin conexión.'),

  // Symptoms page
  'symptom.disclaimer': message('※これは診断ではなく、受診する科の「目安」です。迷うときは、ひまわり（03-5285-8181・外国語）や #7119（日本語のみ）に相談してください。緊急時は 119 へ。', '* This is not a diagnosis, only a guide to which department to visit. If unsure, call HIMAWARI (03-5285-8181, in your language) or #7119 (Japanese only). In an emergency, call 119.', '※这不是诊断，仅为就诊科室的参考。不确定时可致电HIMAWARI（03-5285-8181，外语）或 #7119（仅日语）。紧急情况请拨打 119。', '※ 진단이 아니라 방문할 진료과의 참고입니다. 판단이 어려우면 히마와리(03-5285-8181, 외국어)나 #7119(일본어만)에 상담하세요. 응급 시에는 119.', '* No es un diagnóstico, solo una guía de qué especialidad visitar. Si tiene dudas, llame a HIMAWARI (03-5285-8181, en su idioma) o al #7119 (solo japonés). En una emergencia, llame al 119.'),
  'symptom.redFlag': message('こんなときは 119', 'Call 119 if', '出现以下情况请拨 119', '이럴 때는 119', 'Llame al 119 si'),
  'symptom.seeToday': message('当日中に受診を', 'See a doctor today if', '出现以下情况请当天就诊', '당일 진료를 받으세요', 'Acuda al médico hoy si'),
  'symptom.notListed': message('このアプリでは探せません', 'Not listed in this app', '本应用无法搜索', '이 앱에서는 찾을 수 없습니다', 'No aparece en esta app'),
  'symptom.dentalNote': message('このアプリは歯科医院を掲載していません。JNTOの医療機関検索（診療科「歯科」）で探すか、ひまわり（03-5285-8181、毎日9:00〜20:00）に電話で相談してください。', 'This app does not list dentists. Search for "Dentistry" on JNTO\'s medical institution search, or call HIMAWARI (03-5285-8181, daily 9:00–20:00).', '本应用未收录牙科诊所。请在JNTO医疗机构搜索中选择“牙科”，或致电HIMAWARI（03-5285-8181，每天9:00–20:00）咨询。', '이 앱에는 치과가 실려 있지 않습니다. JNTO 의료기관 검색에서 "치과"로 찾거나, 히마와리(03-5285-8181, 매일 9:00~20:00)에 전화로 상담하세요.', 'Esta app no incluye dentistas. Busque "Odontología" en el buscador de centros médicos de JNTO o llame a HIMAWARI (03-5285-8181, todos los días de 9:00 a 20:00).'),
  'symptom.dentalSearch': message('JNTOで歯科を探す', 'Find a dentist on JNTO', '在JNTO查找牙科', 'JNTO에서 치과 찾기', 'Buscar dentista en JNTO'),
  'symptom.pharmacyTitle': message('軽い症状なら薬局へ', 'Mild symptoms? Try a pharmacy', '症状轻微可去药店', '가벼운 증상이라면 약국으로', '¿Síntomas leves? Pruebe una farmacia'),
  'symptom.pharmacyDesc': message('軽い風邪、軽い胃腸の不調、小さな切り傷などは、薬局・ドラッグストア（薬局 / ドラッグストア）の薬剤師に相談できます。一部の薬は薬剤師がいる時間しか買えません。症状が重い、長引く、悪化するときは受診してください。', 'For a mild cold, a slightly upset stomach or a small cut, a pharmacist at a pharmacy or drugstore (薬局 / ドラッグストア) can recommend medicine. Some medicines can only be sold while a pharmacist is on duty. See a doctor if symptoms are severe, last long or get worse.', '轻微感冒、轻微肠胃不适、小伤口等，可向药店・药妆店（薬局 / ドラッグストア）的药剂师咨询。部分药品只能在药剂师在岗时购买。如症状严重、持续或加重，请就医。', '가벼운 감기, 가벼운 위장 장애, 작은 상처 등은 약국・드럭스토어(薬局 / ドラッグストア)의 약사에게 상담할 수 있습니다. 일부 약은 약사가 있는 시간에만 살 수 있습니다. 증상이 심하거나 오래가거나 악화되면 진료를 받으세요.', 'Para un resfriado leve, un malestar estomacal leve o un corte pequeño, el farmacéutico de una farmacia o droguería (薬局 / ドラッグストア) puede recomendarle un medicamento. Algunos solo se venden cuando hay farmacéutico. Vaya al médico si los síntomas son graves, duran o empeoran.'),

  // List page
  'list.cosmeticHidden': message('美容目的のクリニック（美容外科・脱毛・AGAなど）{n}件を非表示にしています。', '{n} cosmetic clinics (beauty surgery, hair removal, AGA, etc.) are hidden.', '已隐藏 {n} 家美容类诊所（美容外科・脱毛・AGA等）。', '미용 목적 클리닉(미용외과・제모・AGA 등) {n}곳을 숨겼습니다.', 'Se ocultan {n} clínicas estéticas (cirugía estética, depilación, AGA, etc.).'),
  'list.showCosmetic': message('表示する', 'Show them', '显示', '표시하기', 'Mostrarlas'),
  'list.hideCosmetic': message('美容クリニックを隠す', 'Hide cosmetic clinics', '隐藏美容诊所', '미용 클리닉 숨기기', 'Ocultar clínicas estéticas'),
  'list.cosmeticShown': message('美容クリニックを含む', 'Including cosmetic clinics', '包括美容诊所', '미용 클리닉 포함', 'Incluye clínicas estéticas'),
  'list.radiusEmpty': message('この距離の範囲には見つかりませんでした。', 'No clinics found within this distance.', '在此距离范围内未找到诊所。', '이 거리 안에서 찾지 못했습니다.', 'No se encontraron clínicas a esta distancia.'),
  'list.widen': message('距離の制限なしで近い順に表示', 'Show nearest with no distance limit', '不限距离，按由近到远显示', '거리 제한 없이 가까운 순으로 보기', 'Mostrar las más cercanas sin límite de distancia'),
  'list.japaneseName': message('日本語表記', 'In Japanese', '日文名称', '일본어 표기', 'En japonés'),

  // Detail page fallback while full data loads
  'detail.loadingMore': message('詳しい情報を読み込んでいます…', 'Loading full details…', '正在加载详细信息…', '자세한 정보를 불러오는 중…', 'Cargando todos los detalles…'),

  // Legal pages
  'legal.japanesePrevails': message('', 'This English text is a translation for convenience. If it differs from the Japanese text, the Japanese text prevails.', '以下为英文译本，仅供参考。如与日文版本不一致，以日文版本为准。', '아래는 참고용 영어 번역입니다. 일본어 원문과 다를 경우 일본어 원문이 우선합니다.', 'El siguiente texto en inglés es una traducción de referencia. En caso de discrepancia, prevalece el texto en japonés.'),
  'legal.lastUpdated': message('制定日', 'Effective date', '生效日期', '제정일', 'Fecha de entrada en vigor'),
};

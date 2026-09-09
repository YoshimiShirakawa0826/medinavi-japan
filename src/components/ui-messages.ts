import type { Language } from '@/types';
import { auditMessages } from './audit-messages';

export const uiMessages: Record<string, Record<Language, string>> = {
  'phone.missing': {
    ja: '電話番号未掲載', en: 'Phone not listed', zh: '未刊登电话号码',
    ko: '전화번호 미등록', es: 'Teléfono no publicado',
  },
  'phone.nabii': {
    ja: 'ナビイで連絡先を確認', en: 'Check contact details on Nabii', zh: '在Nabii确认联系方式',
    ko: '나비이에서 연락처 확인', es: 'Consultar contacto en Nabii',
  },
  'phone.source': {
    ja: '電話番号の出典', en: 'Phone source', zh: '电话号码来源',
    ko: '전화번호 출처', es: 'Fuente del teléfono',
  },
  'phone.directory': {
    ja: '厚労省・保険医療機関一覧', en: 'MHLW medical institution directory', zh: '厚生劳动省医疗机构名录',
    ko: '후생노동성 의료기관 목록', es: 'Directorio de centros médicos del MHLW',
  },
  'phone.nabiiSource': {
    ja: '医療情報ネット（ナビイ）', en: 'Medical Information Net (Nabii)', zh: '医疗信息网（Nabii）',
    ko: '의료정보넷 (나비이)', es: 'Medical Information Net (Nabii)',
  },
  'phone.asOf': {
    ja: '資料の基準日', en: 'Source dated', zh: '资料基准日',
    ko: '자료 기준일', es: 'Fecha de la fuente',
  },
  'phone.retrieved': {
    ja: '掲載情報の取得日', en: 'Retrieved', zh: '获取日期',
    ko: '조회일', es: 'Fecha de consulta',
  },
  "filter.openNow": {
    "ja": "診療時間内（目安）",
    "en": "Within listed hours",
    "zh": "登记营业时间内",
    "ko": "등록 진료시간 내",
    "es": "Dentro del horario publicado"
  },
  "filter.englishToday": {
    "ja": "英語対応（登録情報）",
    "en": "English listed",
    "zh": "登记支持英语",
    "ko": "영어 지원 등록",
    "es": "Inglés registrado"
  },
  "nav.online": {
    "ja": "看護師に相談",
    "en": "Nurse support",
    "zh": "护士咨询",
    "ko": "간호사 상담",
    "es": "Consulta de enfermería"
  },
  "online.desc": {
    "ja": "看護師による受診先案内・相談（有料、外部サービス）",
    "en": "Paid nurse support and help finding care (external service).",
    "zh": "护士咨询与就医指引（付费外部服务）。",
    "ko": "진료기관 안내 및 간호사 상담 (유료 외부 서비스).",
    "es": "Orientación y apoyo de enfermería (servicio externo de pago)."
  },
  "home.badgeVerified": {
    "ja": "受診前に施設へご確認ください",
    "en": "Confirm with the clinic before visiting",
    "zh": "就诊前请联系医疗机构确认",
    "ko": "방문 전 의료기관에 확인하세요",
    "es": "Confirme con la clínica antes de acudir"
  },
  "trust.banner": {
    "ja": "厚生労働省の公開情報を掲載しています。受診可否や当日の対応は医療機関へご確認ください。",
    "en": "Based on MHLW open data. Confirm availability directly with the clinic.",
    "zh": "信息来自厚生劳动省开放数据。请向医疗机构确认当日接诊情况。",
    "ko": "후생노동성 공개 데이터입니다. 당일 진료 가능 여부는 의료기관에 확인하세요.",
    "es": "Datos públicos del MHLW. Confirme la disponibilidad con la clínica."
  },
  "trust.stats": {
    "ja": "確認済み施設はまだ登録されていません",
    "en": "No directly verified clinics registered yet",
    "zh": "尚无直接确认的医疗机构",
    "ko": "직접 확인된 의료기관이 아직 없습니다",
    "es": "Todavía no hay clínicas verificadas directamente"
  },
  "map.free": {
    "ja": "地図は外部サービスで表示します",
    "en": "Maps use an external service",
    "zh": "地图由外部服务提供",
    "ko": "지도는 외부 서비스를 이용합니다",
    "es": "Mapas de un servicio externo"
  },
  "distance.consent": {
    "ja": "位置情報は端末内で距離検索に使います。地図を開くと、表示地点が外部の地図サービスに送られます。",
    "en": "Location is used on your device for distance search. Opening a map sends the displayed point to the map provider.",
    "zh": "位置信息用于设备内的距离搜索。打开地图会将显示位置发送给地图服务。",
    "ko": "위치는 기기 내 거리 검색에 사용합니다. 지도를 열면 표시 위치가 지도 서비스에 전송됩니다.",
    "es": "La ubicación se usa en su dispositivo. Al abrir el mapa, el punto mostrado se envía al proveedor del mapa."
  },
  "distance.denied": {
    "ja": "位置情報が許可されていません。エリア・駅を選んで検索できます。",
    "en": "Location permission was denied. Choose an area or station.",
    "zh": "未获位置权限。请选择地区或车站。",
    "ko": "위치 권한이 거부되었습니다. 지역이나 역을 선택하세요.",
    "es": "Ubicación no autorizada. Elija una zona o estación."
  },
  "distance.unsupported": {
    "ja": "この環境では位置情報を利用できません。エリア・駅を選んでください。",
    "en": "Location is unavailable here. Choose an area or station.",
    "zh": "此环境无法获取位置。请选择地区或车站。",
    "ko": "위치를 사용할 수 없습니다. 지역이나 역을 선택하세요.",
    "es": "No se puede usar la ubicación. Elija una zona o estación."
  },
  "clinic.loading": {
    "ja": "医療機関を読み込み中…",
    "en": "Loading clinics…",
    "zh": "正在加载医疗机构…",
    "ko": "의료기관 불러오는 중…",
    "es": "Cargando clínicas…"
  },
  "clinic.fetchError": {
    "ja": "医療機関データを読み込めませんでした。通信を確認して再試行してください。",
    "en": "Clinic data could not be loaded. Check your connection and try again.",
    "zh": "无法加载医疗机构数据。请检查网络后重试。",
    "ko": "의료기관 데이터를 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.",
    "es": "No se pudieron cargar los datos. Revise la conexión e inténtelo de nuevo."
  },
  "clinic.retry": {
    "ja": "再読み込み",
    "en": "Try again",
    "zh": "重新加载",
    "ko": "다시 시도",
    "es": "Reintentar"
  },
  "clinic.notFound": {
    "ja": "医療機関が見つかりません",
    "en": "Clinic not found",
    "zh": "未找到医疗机构",
    "ko": "의료기관을 찾을 수 없습니다",
    "es": "Clínica no encontrada"
  },
  "list.backSearch": {
    "ja": "検索に戻る",
    "en": "Back to search",
    "zh": "返回搜索",
    "ko": "검색으로 돌아가기",
    "es": "Volver a la búsqueda"
  },
  "list.back": {
    "ja": "一覧に戻る",
    "en": "Back to list",
    "zh": "返回列表",
    "ko": "목록으로 돌아가기",
    "es": "Volver a la lista"
  },
  "list.found": {
    "ja": "件の医療機関",
    "en": "clinics found",
    "zh": "家医疗机构",
    "ko": "개 의료기관",
    "es": "clínicas encontradas"
  },
  "list.empty": {
    "ja": "条件に合う登録情報がありません。未取得・未確認の項目もあるため、実際に対応施設がないとは限りません。",
    "en": "No matching records. Some fields are missing or unverified; this does not mean no clinics offer the service.",
    "zh": "暂无匹配记录。部分数据缺失或未经确认，不代表没有提供服务的机构。",
    "ko": "일치하는 등록 정보가 없습니다. 미수집·미확인 항목이 있어 실제로 해당 기관이 없다는 뜻은 아닙니다.",
    "es": "No hay registros coincidentes. Faltan datos o verificaciones; esto no significa que ninguna clínica ofrezca el servicio."
  },
  "list.previous": {
    "ja": "前の100件",
    "en": "Previous 100",
    "zh": "上100条",
    "ko": "이전 100개",
    "es": "100 anteriores"
  },
  "list.next": {
    "ja": "次の100件",
    "en": "Next 100",
    "zh": "下100条",
    "ko": "다음 100개",
    "es": "100 siguientes"
  },
  "list.page": {
    "ja": "ページ",
    "en": "Page",
    "zh": "页",
    "ko": "페이지",
    "es": "Página"
  },
  "list.coordinatesMissing": {
    "ja": "位置情報未取得：距離は表示できません",
    "en": "Coordinates missing; distance unavailable",
    "zh": "缺少坐标，无法显示距离",
    "ko": "좌표 미수집: 거리 표시 불가",
    "es": "Sin coordenadas; distancia no disponible"
  },
  "data.open": {
    "ja": "公開データ",
    "en": "Open data",
    "zh": "开放数据",
    "ko": "공개 데이터",
    "es": "Datos abiertos"
  },
  "data.notice": {
    "ja": "登録データに基づく表示です。当日の受入状況・臨時休診は医療機関へご確認ください。",
    "en": "Based on published records. Confirm same-day availability and temporary closures with the clinic.",
    "zh": "根据登记数据展示。请向医疗机构确认当日接诊和临时休诊情况。",
    "ko": "등록 정보 기준입니다. 당일 접수와 임시 휴진은 의료기관에 확인하세요.",
    "es": "Información registrada. Confirme disponibilidad y cierres temporales con la clínica."
  },
  "status.open": {
    "ja": "診療時間内（目安）",
    "en": "Within listed hours",
    "zh": "登记营业时间内",
    "ko": "등록 진료시간 내",
    "es": "Dentro del horario publicado"
  },
  "status.closed": {
    "ja": "診療時間外（目安）",
    "en": "Outside listed hours",
    "zh": "登记营业时间外",
    "ko": "등록 진료시간 외",
    "es": "Fuera del horario publicado"
  },
  "status.unknown": {
    "ja": "診療状況は要確認",
    "en": "Confirm opening status",
    "zh": "请确认接诊情况",
    "ko": "진료 여부 확인 필요",
    "es": "Confirme el horario"
  },
  "status.notice": {
    "ja": "日本時間の通常診療時間から算出しています。祝日・時間データ不足の場合は要確認です。",
    "en": "Calculated from regular hours in Japan time. Holidays and missing schedules require confirmation.",
    "zh": "根据日本时间的常规营业时间计算。节假日或缺少时间数据时需另行确认。",
    "ko": "일본 시간의 일반 진료시간 기준입니다. 공휴일이나 시간 정보가 없으면 확인이 필요합니다.",
    "es": "Según el horario habitual de Japón. Confirme en festivos o cuando falten horarios."
  },
  "home.advSource": {
    "ja": "公開データ",
    "en": "Public records",
    "zh": "开放数据",
    "ko": "공개 데이터",
    "es": "Datos públicos"
  },
  "home.advSourceDesc": {
    "ja": "厚生労働省の登録情報",
    "en": "MHLW clinic directory",
    "zh": "厚生劳动省登记信息",
    "ko": "후생노동성 등록 정보",
    "es": "Directorio del MHLW"
  },
  "home.advLang": {
    "ja": "5言語の画面",
    "en": "Five interface languages",
    "zh": "五种界面语言",
    "ko": "5개 언어 화면",
    "es": "Interfaz en cinco idiomas"
  },
  "home.advLangDesc": {
    "ja": "日・英・中・韓・スペイン語",
    "en": "JA · EN · ZH · KO · ES",
    "zh": "日・英・中・韩・西班牙语",
    "ko": "일・영・중・한・스페인어",
    "es": "JA · EN · ZH · KO · ES"
  },
  "home.advHours": {
    "ja": "診療時間の目安",
    "en": "Listed hours",
    "zh": "登记营业时间",
    "ko": "진료시간 안내",
    "es": "Horarios publicados"
  },
  "home.advHoursDesc": {
    "ja": "日本時間で表示",
    "en": "Shown in Japan time",
    "zh": "按日本时间显示",
    "ko": "일본 시간 기준",
    "es": "Hora de Japón"
  },
  "home.advArea": {
    "ja": "東京の医療機関",
    "en": "Tokyo clinics",
    "zh": "东京医疗机构",
    "ko": "도쿄 의료기관",
    "es": "Clínicas de Tokio"
  },
  "home.advAreaDesc": {
    "ja": "4,430施設の登録情報",
    "en": "4,430 clinic records",
    "zh": "4,430家机构记录",
    "ko": "4,430개 기관 정보",
    "es": "4.430 registros"
  },
  "emergency.locationTitle": {
    "ja": "現在地を確認する",
    "en": "Check my location",
    "zh": "查看当前位置",
    "ko": "현재 위치 확인",
    "es": "Consultar mi ubicación"
  },
  "emergency.locationHelp": {
    "ja": "端末の位置情報を表示します。精度に誤差があるため、近くの建物名や標識も確認して伝えてください。",
    "en": "This is your device’s estimated position. Check nearby building names and street signs to describe where you are.",
    "zh": "显示设备估计位置。位置可能有误差，请同时确认附近建筑名称和路牌。",
    "ko": "기기의 추정 위치입니다. 오차가 있으니 주변 건물명과 표지판도 확인하여 알려주세요.",
    "es": "Ubicación estimada del dispositivo. Compruebe edificios y señales cercanas para indicar dónde está."
  },
  "emergency.coordinates": {
    "ja": "緯度・経度",
    "en": "Latitude / longitude",
    "zh": "纬度／经度",
    "ko": "위도 / 경도",
    "es": "Latitud / longitud"
  },
  "emergency.locationPrompt": {
    "ja": "ボタンを押すと位置情報の利用を求めます。住所の自動変換は行いません。",
    "en": "The button requests location permission. Coordinates are not converted into an address.",
    "zh": "点击按钮将请求位置权限。不会自动将坐标转换为地址。",
    "ko": "버튼을 누르면 위치 권한을 요청합니다. 좌표를 주소로 자동 변환하지 않습니다.",
    "es": "El botón solicita permiso de ubicación. No convierte las coordenadas en una dirección."
  },
  "selfpay.notAvailable": {
    "ja": "対応なし（確認済み）",
    "en": "Not available (confirmed)",
    "zh": "不支持（已确认）",
    "ko": "미지원 (확인됨)",
    "es": "No disponible (confirmado)"
  },
  ...auditMessages,
};

import type { Language } from '@/types';

const message = (ja: string, en: string, zh: string, ko: string, es: string): Record<Language, string> => ({ ja, en, zh, ko, es });

export const nationMessages: Record<string, Record<Language, string>> = {
  'nation.prefecture': message('都道府県から探す', 'Choose a prefecture', '选择都道府县', '도도부현 선택', 'Elegir prefectura'),
  'nation.source': message('厚労省の配布元データ', 'MHLW source dataset', '厚生劳动省原始数据', '후생노동성 원본 데이터', 'Datos de origen del MHLW'),
  'nation.languageUnknown': message('対応言語は未確認です。外国語での受診は施設に事前確認してください。', 'Language support is unconfirmed. Contact the facility before seeking care in another language.', '支持语言尚未确认，使用外语就诊前请联系机构确认。', '지원 언어는 미확인입니다. 외국어 진료는 방문 전 기관에 확인하세요.', 'Idiomas de atención sin confirmar. Consulte al centro antes de solicitar atención en otro idioma.'),
  'nation.languageCoverage': message('言語の絞り込みは対応が登録されている施設だけが対象です。全国データの多くは対応言語が未確認のため、結果が0件でも外国語で受診できる施設がないとは限りません。', 'Language filters include only facilities with recorded support. Most new national records have unconfirmed languages; zero results does not mean no facilities offer care in that language.', '语言筛选仅显示已登记支持该语言的机构。全国新增数据中多数机构的语言支持尚未确认，结果为零并不表示当地没有提供该语言诊疗的机构。', '언어 필터는 지원이 등록된 기관만 표시합니다. 전국 신규 데이터는 대부분 언어 미확인이므로 결과가 없어도 해당 언어 진료기관이 없다는 뜻은 아닙니다.', 'El filtro de idioma incluye solo centros con atención registrada. En muchos registros nacionales los idiomas no están confirmados; cero resultados no significa que no existan centros con atención en ese idioma.'),
  'nation.clearLanguage': message('対応言語の条件を外して探す', 'Search without the language filter', '取消语言条件后搜索', '언어 조건 없이 검색', 'Buscar sin filtro de idioma'),
  'nation.officialData': message('医療情報ネットの公開データと既存の出典付き情報を掲載しています。掲載は施設への直接確認を意味しません。', 'Based on Medical Information Net open data and existing sourced records. Publication does not mean direct verification with the facility.', '根据医疗信息网开放数据及已有来源信息展示，不代表已向机构直接确认。', '의료정보넷 공개 데이터와 기존 출처 정보입니다. 기관에 직접 확인했다는 의미는 아닙니다.', 'Datos abiertos de Medical Information Net e información previa con fuentes. La publicación no implica verificación directa con el centro.'),
  'nation.all': message('全国（収録済みの全施設）', 'Japan (all listed facilities)', '全国（所有已收录机构）', '전국 (등록된 모든 기관)', 'Japón (todos los centros publicados)'),
  'nation.notImported': message('データ未収録', 'Data not yet added', '尚未收录数据', '데이터 미등록', 'Datos aún no incorporados'),
  'nation.coverage': message('収録済みの都道府県', 'Prefectures with listed facilities', '已收录机构的都道府县', '기관이 등록된 도도부현', 'Prefecturas con centros publicados'),
  'nation.partial': message('全国47都道府県を選択できます。施設データは順次追加中です。未収録の地域は医療情報ネットでお探しください。', 'Choose from all 47 prefectures. Facility data is being added. For areas not yet listed, search Medical Information Net.', '可选择全部47个都道府县，机构数据正在陆续添加。未收录地区请查询医疗信息网。', '47개 도도부현을 선택할 수 있습니다. 기관 데이터는 순차 추가 중입니다. 미등록 지역은 의료정보넷에서 검색하세요.', 'Puede elegir entre las 47 prefecturas. Los datos se incorporan gradualmente. Para zonas aún no publicadas, consulte Medical Information Net.'),
  'nation.noData': message('この都道府県の施設データはまだ収録していません。医療機関が存在しないという意味ではありません。', 'We have not yet added facility data for this prefecture. This does not mean there are no medical facilities.', '尚未收录此都道府县的机构数据，并不表示当地没有医疗机构。', '이 도도부현의 기관 데이터는 아직 등록하지 않았습니다. 의료기관이 없다는 뜻은 아닙니다.', 'Todavía no hemos incorporado centros de esta prefectura. Esto no significa que no haya centros médicos.'),
  'nation.official': message('医療情報ネットで全国の医療機関を探す', 'Search Medical Information Net across Japan', '在医疗信息网查询日本全国的医疗机构', '의료정보넷에서 일본 전국 의료기관 검색', 'Buscar centros de Japón en Medical Information Net'),
  'nation.officialHint': message('移動先で都道府県と言語を選択してください。', 'Choose your prefecture and language on the official site.', '请在官方网站选择都道府县及语言。', '공식 사이트에서 도도부현과 언어를 선택하세요.', 'Elija prefectura e idioma en el sitio oficial.'),
  'nation.station': message('東京の駅からの距離で絞る（任意）', 'Distance from a Tokyo station (optional)', '按距东京车站的距离筛选（可选）', '도쿄 역 기준 거리 검색 (선택)', 'Distancia desde una estación de Tokio (opcional)'),
  'home.subtitle': message('日本全国の医療機関探しをサポート', 'Find medical care across Japan', '帮助您寻找日本全国的医疗机构', '일본 전국 의료기관 찾기', 'Encuentre atención médica en Japón'),
  'home.advArea': message('医療機関の収録データ', 'Listed medical facilities', '已收录医疗机构', '등록된 의료기관', 'Centros médicos publicados'),
  'home.advAreaDesc': message('都道府県ごとに掲載状況を確認', 'Check availability by prefecture', '按都道府县查看收录情况', '도도부현별 등록 현황 확인', 'Consulte la cobertura por prefectura'),
  'home.badgeData': message('47都道府県の地域選択', 'Choose from 47 prefectures', '选择47个都道府县', '47개 도도부현 선택', 'Elija entre 47 prefecturas'),
  'nation.region.0': message('北海道・東北', 'Hokkaido & Tohoku', '北海道・东北', '홋카이도·도호쿠', 'Hokkaido y Tohoku'),
  'nation.region.1': message('関東', 'Kanto', '关东', '간토', 'Kanto'),
  'nation.region.2': message('中部', 'Chubu', '中部', '주부', 'Chubu'),
  'nation.region.3': message('近畿', 'Kansai', '近畿', '긴키', 'Kansai'),
  'nation.region.4': message('中国', 'Chugoku', '中国地区', '주고쿠', 'Chugoku'),
  'nation.region.5': message('四国', 'Shikoku', '四国', '시코쿠', 'Shikoku'),
  'nation.region.6': message('九州・沖縄', 'Kyushu & Okinawa', '九州・冲绳', '규슈·오키나와', 'Kyushu y Okinawa'),
};

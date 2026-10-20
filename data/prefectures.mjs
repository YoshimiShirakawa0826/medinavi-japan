// JIS X 0401 prefecture codes. Keep identifiers independent of display language.
const rows = [
  ['01','北海道','Hokkaido','北海道','홋카이도',0],
  ['02','青森県','Aomori','青森县','아오모리',0],
  ['03','岩手県','Iwate','岩手县','이와테',0],
  ['04','宮城県','Miyagi','宫城县','미야기',0],
  ['05','秋田県','Akita','秋田县','아키타',0],
  ['06','山形県','Yamagata','山形县','야마가타',0],
  ['07','福島県','Fukushima','福岛县','후쿠시마',0],
  ['08','茨城県','Ibaraki','茨城县','이바라키',1],
  ['09','栃木県','Tochigi','栃木县','도치기',1],
  ['10','群馬県','Gunma','群马县','군마',1],
  ['11','埼玉県','Saitama','埼玉县','사이타마',1],
  ['12','千葉県','Chiba','千叶县','지바',1],
  ['13','東京都','Tokyo','东京都','도쿄',1],
  ['14','神奈川県','Kanagawa','神奈川县','가나가와',1],
  ['15','新潟県','Niigata','新潟县','니가타',2],
  ['16','富山県','Toyama','富山县','도야마',2],
  ['17','石川県','Ishikawa','石川县','이시카와',2],
  ['18','福井県','Fukui','福井县','후쿠이',2],
  ['19','山梨県','Yamanashi','山梨县','야마나시',2],
  ['20','長野県','Nagano','长野县','나가노',2],
  ['21','岐阜県','Gifu','岐阜县','기후',2],
  ['22','静岡県','Shizuoka','静冈县','시즈오카',2],
  ['23','愛知県','Aichi','爱知县','아이치',2],
  ['24','三重県','Mie','三重县','미에',3],
  ['25','滋賀県','Shiga','滋贺县','시가',3],
  ['26','京都府','Kyoto','京都府','교토',3],
  ['27','大阪府','Osaka','大阪府','오사카',3],
  ['28','兵庫県','Hyogo','兵库县','효고',3],
  ['29','奈良県','Nara','奈良县','나라',3],
  ['30','和歌山県','Wakayama','和歌山县','와카야마',3],
  ['31','鳥取県','Tottori','鸟取县','돗토리',4],
  ['32','島根県','Shimane','岛根县','시마네',4],
  ['33','岡山県','Okayama','冈山县','오카야마',4],
  ['34','広島県','Hiroshima','广岛县','히로시마',4],
  ['35','山口県','Yamaguchi','山口县','야마구치',4],
  ['36','徳島県','Tokushima','德岛县','도쿠시마',5],
  ['37','香川県','Kagawa','香川县','가가와',5],
  ['38','愛媛県','Ehime','爱媛县','에히메',5],
  ['39','高知県','Kochi','高知县','고치',5],
  ['40','福岡県','Fukuoka','福冈县','후쿠오카',6],
  ['41','佐賀県','Saga','佐贺县','사가',6],
  ['42','長崎県','Nagasaki','长崎县','나가사키',6],
  ['43','熊本県','Kumamoto','熊本县','구마모토',6],
  ['44','大分県','Oita','大分县','오이타',6],
  ['45','宮崎県','Miyazaki','宫崎县','미야자키',6],
  ['46','鹿児島県','Kagoshima','鹿儿岛县','가고시마',6],
  ['47','沖縄県','Okinawa','冲绳县','오키나와',6],
];

export const PREFECTURES = rows.map(([code, ja, en, zh, ko, region]) => ({
  code: String(code), region: Number(region),
  name: { ja: String(ja), en: String(en), zh: String(zh), ko: String(ko), es: String(en) },
}));

export function prefectureByCode(code) {
  return PREFECTURES.find(prefecture => prefecture.code === code) ?? null;
}

export function clinicPrefecture(clinic) {
  // Prefer a full Japanese address; never infer a prefecture from coordinates,
  // a city name, or an arbitrary occurrence of "Tokyo" in an institution name.
  const address = (clinic.address?.ja || '').normalize('NFKC').replace(/^\s*(?:〒\s*\d{3}[-ー]?\d{4}\s*)?/, '');
  const fromAddress = PREFECTURES.find(prefecture => address.startsWith(prefecture.name.ja));
  if (fromAddress) return fromAddress.code;
  if (prefectureByCode(clinic.prefectureCode)) return clinic.prefectureCode;
  const code = /^clinic-(\d{2})[12][A-Za-z0-9]{2,17}$/.exec(clinic.id || '')?.[1];
  return prefectureByCode(code)?.code ?? null;
}

export function coverageFor(clinics) {
  const counts = Object.fromEntries(PREFECTURES.map(prefecture => [prefecture.code, 0]));
  for (const clinic of clinics) {
    const code = clinicPrefecture(clinic);
    if (code) counts[code]++;
  }
  return { total: clinics.length, prefectures: counts };
}

export type Language = 'ja' | 'en' | 'zh' | 'ko' | 'es';

export type ClinicVerification = {
  status: "verified" | "in_progress" | "unverified";
  lastConfirmedAt?: string;
  confirmedBy?: "phone" | "ai_interview" | "official_website" | "open_data" | "manual_visit";
  confidenceScore?: number;
  notes?: string;
};

export type ClinicAccessInfo = {
  englishSupportToday?: boolean;
  supportedLanguages?: string[];
  creditCardAccepted?: boolean;
  cashlessAccepted?: boolean;
  overseasInsuranceAccepted?: boolean;
  walkInAvailable?: boolean;
  nightOpen?: boolean;
  weekendOpen?: boolean;
  emergencyAvailable?: boolean;

  // ── 自費診療 / Self-pay（すべて任意項目。欠損時は UI で「要事前確認」を表示する）──
  // 注意: これらは医療機関が確認・許可した情報のみ掲載する前提。費用の誇張・比較表現は禁止。
  selfPayAvailable?: boolean;      // 自費診療対応（保険なしでも受診可）
  noInsuranceAccepted?: boolean;   // 健康保険証なしでの受診可否
  estimatedCostNote?: string;      // 概算費用の説明文（数値ではなく医療機関提供の文言。例: "初診 ¥5,000〜"）
  medicalCertificateJa?: boolean;  // 診断書対応（日本語）
  medicalCertificateEn?: boolean;  // 診断書対応（英文）
  selfPayNote?: string;            // 自費診療に関する医療機関からの注意文（任意）
};

export interface Hospital {
  id: string;
  name: Record<Language, string>;
  address: Record<Language, string>;
  phone: string;
  phoneSource?: {
    kind: 'mhlw_directory' | 'nabii_detail';
    url: string;
    retrievedAt: string;
    asOf?: string;
    field: string;
    matchMethod: string;
    sourceFile?: string;
    sourceRow?: number;
    sourceCode?: string;
  };
  latitude: number;
  longitude: number;
  departments: string[];          // IDs of departments
  supportedLanguages: Language[]; // Supported languages
  isOpenNow: boolean | null;      // Regular schedule in Tokyo time; null = unknown
  hasHolidayService: boolean;
  walkInAllowed: boolean;
  emergencyAccepted: boolean;
  updatedAt: string;
  dataSource: string;
  website?: string;
  closedDays?: Record<string, boolean>;
  openingHours?: Record<string, Array<{ start: string; end: string }> | null>;

  // New verification and access status
  verification: ClinicVerification;
  accessInfo: ClinicAccessInfo;
}

export const departments = [
  { id: 'internal',      name: { ja: '内科',     en: 'Internal Medicine', zh: '内科',   ko: '내과',     es: 'Medicina Interna' } },
  { id: 'surgery',       name: { ja: '外科',     en: 'Surgery',           zh: '外科',   ko: '외과',     es: 'Cirugía' } },
  { id: 'pediatrics',    name: { ja: '小児科',   en: 'Pediatrics',        zh: '儿科',   ko: '소아과',   es: 'Pediatría' } },
  { id: 'orthopedics',   name: { ja: '整形外科', en: 'Orthopedics',       zh: '骨科',   ko: '정형외과', es: 'Traumatología' } },
  { id: 'dermatology',   name: { ja: '皮膚科',   en: 'Dermatology',       zh: '皮肤科', ko: '피부과',   es: 'Dermatología' } },
  { id: 'ophthalmology', name: { ja: '眼科',     en: 'Ophthalmology',     zh: '眼科',   ko: '안과',     es: 'Oftalmología' } },
  { id: 'ent',           name: { ja: '耳鼻科',   en: 'ENT',               zh: '耳鼻科', ko: '이비인후과', es: 'ORL' } },
  { id: 'obgyn',         name: { ja: '産婦人科', en: 'OB/GYN',            zh: '妇产科', ko: '산부인과', es: 'Ginecología' } },
  { id: 'psychiatry',    name: { ja: '心療内科・精神科', en: 'Psychiatry', zh: '精神科', ko: '정신건강의학과', es: 'Psiquiatría' } },
  { id: 'urology',       name: { ja: '泌尿器科', en: 'Urology',           zh: '泌尿科', ko: '비뇨기과', es: 'Urología' } },
];

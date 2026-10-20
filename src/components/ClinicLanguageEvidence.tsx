'use client';

import type { Hospital, Language } from '@/types';
import { useLanguage } from './LanguageProvider';

const words = {
  title: ['言語対応の公式情報', 'Official language support information', '官方语言服务信息', '공식 언어 지원 안내', 'Información oficial de idiomas'],
  doctor: ['医師による対応', 'Doctor', '医生提供服务', '의사 직접 대응', 'Médico'],
  staff: ['スタッフによる対応', 'Staff', '工作人员提供服务', '직원 대응', 'Personal'],
  in_person_interpreter: ['対面の通訳', 'In-person interpreter', '现场口译', '대면 통역', 'Intérprete presencial'],
  telephone_interpreter: ['電話による通訳', 'Telephone interpreter', '电话口译', '전화 통역', 'Interpretación telefónica'],
  video_interpreter: ['映像による通訳', 'Video interpreter', '视频口译', '영상 통역', 'Interpretación por vídeo'],
  interpretation_support: ['通訳等による対応', 'Interpretation support', '口译等协助', '통역 등 지원', 'Apoyo de interpretación'],
  clinical_support: ['診療での言語対応（方法は要確認）', 'Clinical language support (confirm method)', '诊疗语言支持（方式需确认）', '진료 언어 지원 (방법 확인 필요)', 'Atención en el idioma (confirmar modalidad)'],
  patient_arranged_interpreter: ['患者自身による通訳の手配が必要', 'Patient must arrange an interpreter', '患者需自行安排口译', '환자가 통역을 준비해야 함', 'El paciente debe organizar un intérprete'],
  contact_only: ['問い合わせ時の対応', 'Enquiries only', '仅限咨询联系', '문의 시 지원', 'Solo consultas de contacto'],
  machine_translation: ['機械翻訳による補助', 'Machine translation assistance', '机器翻译辅助', '기계 번역 보조', 'Ayuda de traducción automática'],
  onsite_interpreter_unavailable: ['院内の医療通訳なし（公式記載）', 'No on-site medical interpreter (official statement)', '院内无医疗口译（官网说明）', '병원 내 의료 통역 없음 (공식 안내)', 'Sin intérprete médico presencial (declaración oficial)'],
  required: ['予約が必要', 'Appointment required', '需预约', '예약 필요', 'Cita necesaria'],
  advance_contact: ['事前の連絡・相談が必要', 'Contact in advance', '需提前联系确认', '사전 연락 필요', 'Contactar con antelación'],
  not_required: ['予約不要の記載あり', 'Listed as no appointment required', '注明无需预约', '예약 불필요 안내 있음', 'Se indica que no se necesita cita'],
  unknown: ['予約条件は要確認', 'Confirm booking requirements', '预约条件需确认', '예약 조건 확인 필요', 'Confirmar condiciones de reserva'],
  policy: ['通訳に関する案内', 'Interpretation policy', '口译相关说明', '통역 관련 안내', 'Política de interpretación'],
  source: ['出典・確認日', 'Source and date checked', '来源与核对日期', '출처·확인일', 'Fuente y fecha de consulta'],
} satisfies Record<string, string[]>;
const languageIndex: Record<Language, number> = { ja: 0, en: 1, zh: 2, ko: 3, es: 4 };

export function ClinicLanguageEvidence({ hospital }: { hospital: Hospital }) {
  const { language } = useLanguage();
  if (!hospital.languageSupport?.length) return null;
  const text = (key: keyof typeof words) => words[key][languageIndex[language]];
  const names = new Intl.DisplayNames([language], { type: 'language' });
  return <div className="space-y-3 pt-3">
    <h3 className="text-sm font-bold text-slate-700">{text('title')}</h3>
    {hospital.languageSupport.map((entry, index) => <article key={index} className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm leading-relaxed">
      <p className="font-bold text-slate-800">{entry.languages.map(code => names.of(code) || code).join(' / ') || text('policy')}</p>
      <p className="text-xs font-semibold text-brand-700">{text(entry.mode)} · {text(entry.reservation)}</p>
      <p className="text-slate-600">{entry.notes[language]}</p>
      <details className="text-xs text-slate-500">
        <summary className="min-h-10 cursor-pointer py-2">{text('source')}</summary>
        {entry.sources.map((source, sourceIndex) => <div key={sourceIndex} className="space-y-1 border-t border-slate-100 py-2">
          <a className="break-all font-semibold text-brand-700 underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a>
          <p>{source.checkedAt}</p>
          <blockquote className="border-l-2 border-slate-200 pl-2 break-words">{source.quote}</blockquote>
        </div>)}
      </details>
    </article>)}
  </div>;
}

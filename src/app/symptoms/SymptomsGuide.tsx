"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { departments, Language } from '@/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AREA_PRESETS } from '@/lib/geo';
import { AlertCircle, ArrowLeft, ChevronRight, Info, Clock, Search, CheckCircle, ExternalLink, Phone } from 'lucide-react';
import { EMERGENCY_CONTACTS, jntoMedicalSearchUrl } from '@/lib/emergency-contacts';

const TOOTH: Record<Language, string> = { ja: '歯の痛み・歯のけが', en: 'Toothache / Dental injury', zh: '牙痛・牙齿外伤', ko: '치통・치아 부상', es: 'Dolor de muelas / Lesión dental' };

// 症状 → 目安となる診療科（deptId）。
// これは「診断」ではなく、どの科を受診すればよいかの“案内”に留める（要件4・5）。
// 歯科のデータは収録していないため、歯の痛みは公的な検索・電話窓口へ案内する。
type SymptomItem = {
  emoji: string;
  deptId: string;
  label: Record<Language, string>;
  // Danger signs shown with the suggestion. `urgency` decides the heading.
  warning: Record<Language, string>;
  urgency?: '119' | 'today';
};
const L = (ja: string, en: string, zh: string, ko: string, es: string): Record<Language, string> => ({ ja, en, zh, ko, es });

const SYMPTOMS: SymptomItem[] = [
  { emoji: '🤒', deptId: 'internal', label: L('発熱・風邪・のどの痛み', 'Fever / Cold / Sore throat', '发烧・感冒・喉咙痛', '발열・감기・인후통', 'Fiebre / Resfriado / Dolor de garganta'),
    warning: L('首が硬く曲げられない、意識がぼんやりする、けいれん、息が苦しい', 'Stiff neck, confusion or drowsiness, seizure, or difficulty breathing', '脖子僵硬无法弯曲、意识模糊、抽搐、呼吸困难', '목이 뻣뻣해 굽힐 수 없음, 의식이 흐림, 경련, 호흡 곤란', 'Rigidez de cuello, confusión o somnolencia, convulsiones o dificultad para respirar') },
  { emoji: '🤕', deptId: 'internal', label: L('頭痛・めまい', 'Headache / Dizziness', '头痛・头晕', '두통・어지럼증', 'Dolor de cabeza / Mareo'),
    warning: L('突然の激しい頭痛、片側の手足が動かない・しびれる、ろれつが回らない、顔がゆがむ', 'Sudden, severe headache; weakness or numbness on one side; slurred speech; drooping face', '突然剧烈头痛、一侧手脚无力或麻木、口齿不清、面部歪斜', '갑작스러운 극심한 두통, 한쪽 팔다리 마비・저림, 말이 어눌함, 얼굴이 비뚤어짐', 'Dolor de cabeza súbito e intenso; debilidad o entumecimiento de un lado; habla arrastrada; cara caída') },
  { emoji: '🤢', deptId: 'internal', label: L('腹痛・下痢・吐き気', 'Stomachache / Diarrhea / Nausea', '腹痛・腹泻・恶心', '복통・설사・메스꺼움', 'Dolor de estómago / Diarrea / Náuseas'),
    warning: L('血を吐く、黒い便や血便、我慢できない強い腹痛、ぐったりして水分がとれない', 'Vomiting blood, black or bloody stools, unbearable abdominal pain, or too weak to drink', '吐血、黑便或便血、无法忍受的剧烈腹痛、虚弱到无法喝水', '피를 토함, 검은 변이나 혈변, 참을 수 없는 심한 복통, 기운이 없어 물을 못 마심', 'Vómito con sangre, heces negras o con sangre, dolor abdominal insoportable o demasiada debilidad para beber') },
  { emoji: '🦴', deptId: 'orthopedics', label: L('打撲・骨折・捻挫', 'Bruise / Fracture / Sprain', '挫伤・骨折・扭伤', '타박상・골절・염좌', 'Golpe / Fractura / Esguince'),
    warning: L('骨が見えている、手足が明らかに変形している、頭・首・背中を強く打った', 'Bone visible, limb clearly deformed, or a hard blow to the head, neck or back', '能看到骨头、手脚明显变形、头部・颈部・背部受到重击', '뼈가 보임, 팔다리가 눈에 띄게 변형됨, 머리・목・등을 세게 부딪힘', 'Hueso visible, extremidad claramente deformada o golpe fuerte en la cabeza, el cuello o la espalda') },
  { emoji: '🩹', deptId: 'surgery', label: L('切り傷・やけど', 'Cut / Burn', '割伤・烧伤', '자상・화상', 'Corte / Quemadura'),
    warning: L('押さえても血が止まらない、広い範囲のやけど、顔・のど・陰部のやけど', 'Bleeding that does not stop with pressure, large burns, or burns to the face, throat or genitals', '按压也止不住血、大面积烧伤、面部・喉咙・阴部烧伤', '눌러도 피가 멈추지 않음, 넓은 범위의 화상, 얼굴・목・음부 화상', 'Sangrado que no se detiene con presión, quemaduras extensas o en la cara, la garganta o los genitales') },
  { emoji: '🌿', deptId: 'dermatology', label: L('発疹・かゆみ・湿疹', 'Rash / Itch / Eczema', '皮疹・瘙痒・湿疹', '발진・가려움・습진', 'Erupción / Picazón / Eccema'),
    warning: L('唇やまぶたが腫れる、息が苦しい、ぐったりする（アレルギーの重い反応）', 'Swollen lips or eyelids, difficulty breathing, or feeling faint (severe allergic reaction)', '嘴唇或眼皮肿胀、呼吸困难、浑身无力（严重过敏反应）', '입술이나 눈꺼풀이 부음, 호흡 곤란, 축 늘어짐(심한 알레르기 반응)', 'Labios o párpados hinchados, dificultad para respirar o sensación de desmayo (reacción alérgica grave)') },
  { emoji: '👁️', deptId: 'ophthalmology', label: L('目の痛み・充血', 'Eye pain / Red eye', '眼痛・充血', '눈 통증・충혈', 'Dolor ocular / Ojo rojo'),
    warning: L('急に見えなくなった、薬品が目に入った（すぐに流水で洗い続ける）、目に物が刺さった', 'Sudden loss of vision, chemicals in the eye (keep rinsing with running water), or something stuck in the eye', '突然看不见、化学品进入眼睛（立即用流水持续冲洗）、有异物刺入眼睛', '갑자기 안 보임, 약품이 눈에 들어감(바로 흐르는 물로 계속 씻기), 눈에 물체가 박힘', 'Pérdida súbita de visión, productos químicos en el ojo (siga enjuagando con agua corriente) o un objeto clavado en el ojo') },
  { emoji: '👂', deptId: 'ent', label: L('耳・鼻・のどの不調', 'Ear / Nose / Throat', '耳・鼻・喉不适', '귀・코・목 이상', 'Oído / Nariz / Garganta'),
    warning: L('息が苦しい、つばが飲み込めない、のどが急に腫れてきた', 'Difficulty breathing, unable to swallow saliva, or the throat swelling quickly', '呼吸困难、无法吞咽唾液、喉咙突然肿起来', '호흡 곤란, 침을 삼킬 수 없음, 목이 갑자기 부어오름', 'Dificultad para respirar, no poder tragar saliva o garganta que se hincha rápidamente') },
  { emoji: '👶', deptId: 'pediatrics', label: L('子どもの発熱・体調不良', "Child's fever / illness", '儿童发烧・不适', '아이 발열・컨디션 난조', 'Fiebre / malestar infantil'),
    warning: L('生後3か月未満の発熱、けいれん、呼びかけに反応が弱い、息が苦しそう、顔色が悪い', 'Fever in a baby under 3 months, seizure, hard to wake or unresponsive, breathing with difficulty, or pale or bluish skin', '未满3个月婴儿发烧、抽搐、叫不醒或反应弱、呼吸困难、脸色差', '생후 3개월 미만의 발열, 경련, 불러도 반응이 약함, 숨쉬기 힘들어 보임, 안색이 나쁨', 'Fiebre en un bebé de menos de 3 meses, convulsiones, cuesta despertarlo o no responde, respira con dificultad o tiene la piel pálida o azulada') },
  { emoji: '🤱', deptId: 'obgyn', label: L('女性の健康・妊娠の相談', "Women's health / Pregnancy", '女性健康・妊娠咨询', '여성 건강・임신 상담', 'Salud femenina / Embarazo'),
    warning: L('妊娠中の多量の出血、強い腹痛、破水、胎動を感じなくなった', 'During pregnancy: heavy bleeding, severe abdominal pain, waters breaking, or the baby stops moving', '怀孕期间大量出血、剧烈腹痛、破水、感觉不到胎动', '임신 중 다량 출혈, 심한 복통, 양수가 터짐, 태동이 느껴지지 않음', 'En el embarazo: sangrado abundante, dolor abdominal fuerte, rotura de aguas o el bebé deja de moverse') },
  { emoji: '💧', deptId: 'urology', urgency: 'today', label: L('排尿の悩み', 'Urinary problems', '排尿问题', '배뇨 문제', 'Problemas urinarios'),
    warning: L('尿がまったく出ない、発熱と腰・背中の痛みがある、尿に血が混じる', 'Cannot pass urine at all, fever with back or flank pain, or blood in the urine', '完全无法排尿、发烧伴腰背疼痛、尿中带血', '소변이 전혀 나오지 않음, 발열과 허리・등 통증, 소변에 피가 섞임', 'No puede orinar nada, fiebre con dolor de espalda o costado, o sangre en la orina') },
  { emoji: '🧠', deptId: 'psychiatry', label: L('不安・不眠・気分の落ち込み', 'Anxiety / Insomnia / Low mood', '焦虑・失眠・情绪低落', '불안・불면・우울', 'Ansiedad / Insomnio / Ánimo bajo'),
    warning: L('自分を傷つけたい・死にたいと感じる、または誰かを傷つけそうなとき。ひとりにならず、すぐに助けを求めてください', 'You feel like hurting yourself or ending your life, or you might hurt someone. Do not stay alone — get help right away', '想伤害自己、想死，或可能伤害他人时。不要独处，请立即求助', '자신을 해치고 싶거나 죽고 싶을 때, 또는 누군가를 해칠 것 같을 때. 혼자 있지 말고 바로 도움을 요청하세요', 'Siente ganas de hacerse daño o de quitarse la vida, o podría herir a alguien. No se quede solo: pida ayuda de inmediato') },
];

function SymptomsContent() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [careLanguage, setCareLanguage] = useState(searchParams.get('lang') || '');
  const [sel, setSel] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState(searchParams.get('open') === 'true');

  const deptName = (deptId: string) => {
    const d = departments.find(d => d.id === deptId);
    return d ? (d.name[language as keyof typeof d.name] || d.name.en) : deptId;
  };

  // 症状選択後、確認ステップを挟んでから一覧へ（即遷移しない）。
  const search = () => {
    if (sel === null) return;
    const s = SYMPTOMS[sel];
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page'); p.delete('q'); p.set('dept', s.deptId);
    if (area) { p.set('area', area); p.set('location', 'manual'); p.set('dist', '3'); }
    else { p.delete('area'); p.delete('location'); p.delete('dist'); }
    if (careLanguage) p.set('lang', careLanguage); else p.delete('lang');
    if (openNow) p.set('open', 'true');
    else p.delete('open');
    router.push(`/hospitals?${p}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 pb-40 space-y-6">
      <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('nav.home')}
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{t('symptom.title')}</h1>
        <p className="text-sm text-slate-500 font-semibold leading-relaxed">{t('symptom.lead')}</p>
      </div>

      {/* 緊急時の注意（要件5: 119誘導） */}
      <div className="bg-emergency-50 border border-emergency-200 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-emergency-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-xs text-emergency-800 font-bold leading-relaxed">{t('symptom.emergency')}</p>
          <a href="tel:119" className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-extrabold rounded-xl bg-emergency-600 text-white hover:bg-emergency-700 transition-colors">
            {t('common.call119')}
          </a>
        </div>
      </div>

      {/* 症状カード一覧（選択式。即遷移せず、選ぶと下に目安の診療科と検索導線を表示） */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">{t('home.areaLabel')}<select value={area} onChange={event => setArea(event.target.value)} className="block mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"><option value="">{t('home.allAreas')}</option>{AREA_PRESETS.map(item => <option key={item.name} value={item.name}>{t(`area.${item.name}`)}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-700">{t('search.language')}<select value={careLanguage} onChange={event => setCareLanguage(event.target.value)} className="block mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"><option value="">{t('home.anyLanguage')}</option><option value="en">English</option><option value="ja">日本語</option><option value="zh">中文</option><option value="ko">한국어</option><option value="es">Español</option></select></label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SYMPTOMS.map((s, i) => {
          const selected = sel === i;
          return (
            <button
              key={i}
              onClick={() => setSel(v => (v === i ? null : i))}
              aria-pressed={selected}
              className={`group text-left rounded-2xl p-4 flex items-center gap-3 border transition-all active:scale-[0.98] ${
                selected ? 'bg-brand-50 border-brand-400 shadow-sm' : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
              }`}
            >
              <span className="text-2xl leading-none flex-shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-tight">{s.label[language] || s.label.en}</p>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">→ {deptName(s.deptId)}</p>
              </div>
              {selected
                ? <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* 歯科・薬局: このアプリのデータにないものは公的窓口へ案内 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className="text-2xl" aria-hidden>🦷</span>{TOOTH[language]}</h2>
          <p className="text-[11px] font-bold text-slate-500">{t('symptom.notListed')}</p>
          <p className="text-xs leading-relaxed text-slate-600">{t('symptom.dentalNote')}</p>
          <div className="flex flex-wrap gap-2">
            <a href={jntoMedicalSearchUrl(language)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-brand-300 px-3 py-2 text-xs font-bold text-brand-700"><ExternalLink className="h-3.5 w-3.5" aria-hidden />{t('symptom.dentalSearch')}</a>
            <a href={EMERGENCY_CONTACTS.himawari.href} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white"><Phone className="h-3.5 w-3.5" aria-hidden />{EMERGENCY_CONTACTS.himawari.display}</a>
          </div>
        </section>
        <section className="rounded-2xl border border-accent-200 bg-accent-50/40 p-4 space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className="text-2xl" aria-hidden>💊</span>{t('symptom.pharmacyTitle')}</h2>
          <p className="text-xs leading-relaxed text-slate-600">{t('symptom.pharmacyDesc')}</p>
        </section>
      </div>

      {/* 選択後の確認パネル: 目安の診療科＋条件（現在開院中）＋検索導線 */}
      {sel !== null && (
        <div className="sticky bottom-3 z-30 bg-white/95 backdrop-blur border border-brand-200 rounded-2xl p-4 space-y-3 shadow-lg">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('symptom.suggestedDept')}</p>
            <p className="text-lg font-extrabold text-brand-700 mt-0.5">{deptName(SYMPTOMS[sel].deptId)}</p>
          </div>
          <div role="note" className={`rounded-xl border p-3 text-xs leading-relaxed ${SYMPTOMS[sel].urgency === 'today' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emergency-200 bg-emergency-50 text-emergency-800'}`}>
            <p className="font-extrabold">{t(SYMPTOMS[sel].urgency === 'today' ? 'symptom.seeToday' : 'symptom.redFlag')}:</p>
            <p className="font-semibold mt-0.5">{SYMPTOMS[sel].warning[language]}</p>
            {SYMPTOMS[sel].urgency !== 'today' && <a href="tel:119" className="mt-2 inline-flex items-center rounded-lg bg-emergency-600 px-3 py-1.5 font-extrabold text-white">{t('common.call119')}</a>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <input type="checkbox" className="sr-only" checked={openNow} onChange={e => setOpenNow(e.target.checked)} />
            <span className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${openNow ? 'bg-accent-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ${openNow ? 'left-[22px]' : 'left-[3px]'}`} />
            </span>
            <Clock className={`w-4 h-4 ${openNow ? 'text-accent-600' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${openNow ? 'text-accent-700' : 'text-slate-600'}`}>{t('filter.openNow')}</span>
          </label>
          <button
            onClick={search}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-100"
          >
            <Search className="w-4 h-4" /> {t('symptom.findClinics')}
          </button>
        </div>
      )}

      {/* ディスクレイマー（診断ではない, 要件5） */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-semibold leading-relaxed">{t('symptom.disclaimer')}</p>
      </div>
    </div>
  );
}

export function SymptomsGuide() {
  return <Suspense><SymptomsContent /></Suspense>;
}

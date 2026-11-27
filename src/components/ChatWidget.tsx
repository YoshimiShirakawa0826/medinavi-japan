"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Phone, MapPin, AlertCircle, ExternalLink, Loader2, Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { departments, type Language } from '@/types';
import { telephoneHref } from '@/lib/clinic-contact';
import { EMERGENCY_CONTACTS } from '@/lib/emergency-contacts';
import type { ClinicCard } from '@/lib/chat/clinic-search';
import { appendSpoken, recognitionConstructor, speechErrorKind, speechSynthesisAvailable, transcriptOf, SPEECH_LOCALES, type Recognition, type SpeechErrorKind } from '@/lib/chat/speech';

type Turn = { role: 'user' | 'assistant'; content: string; clinics?: ClinicCard[]; emergency?: boolean; failed?: 'busy' | 'unavailable'; detail?: string };

const MAX_TURNS = 10;
const MAX_LENGTH = 800;

const L = (ja: string, en: string, zh: string, ko: string, es: string): Record<Language, string> => ({ ja, en, zh, ko, es });
const TEXT = {
  open: L('AIに相談', 'Ask AI', '咨询AI', 'AI에 상담', 'Preguntar a la IA'),
  title: L('受診先のAI案内', 'AI care guide', 'AI就医指引', 'AI 진료 안내', 'Guía de atención con IA'),
  beta: L('試験提供', 'Beta', '测试版', '베타', 'Beta'),
  poweredBy: L('国産AI「Sarashina」を使用', 'Uses Sarashina, a Japanese AI model', '使用日本国产AI“Sarashina”', '일본 국산 AI "Sarashina" 사용', 'Usa Sarashina, un modelo de IA japonés'),
  close: L('閉じる', 'Close', '关闭', '닫기', 'Cerrar'),
  noticeTitle: L('はじめる前に', 'Before you start', '开始之前', '시작하기 전에', 'Antes de empezar'),
  notice1: L('このAIは医師ではなく、診断はしません。受診する科と窓口を案内します。', 'This AI is not a doctor and does not diagnose. It suggests which department and help line to use.', '本AI不是医生，不做诊断。仅指引就诊科室和咨询窗口。', '이 AI는 의사가 아니며 진단하지 않습니다. 진료과와 상담 창구를 안내합니다.', 'Esta IA no es un médico y no diagnostica. Le orienta sobre qué especialidad y qué línea de ayuda usar.'),
  notice2: L('入力した内容は SB Intuitions 社に送信され、AIの改善（学習）に使われる場合があります。名前・連絡先・パスポート番号などは入力しないでください。', 'Your messages are sent to SB Intuitions and may be used to improve (train) their AI. Do not enter your name, contact details or passport number.', '您输入的内容会发送给SB Intuitions公司，并可能用于改进（训练）其AI。请勿输入姓名、联系方式、护照号码等。', '입력한 내용은 SB Intuitions사로 전송되며 AI 개선(학습)에 사용될 수 있습니다. 이름・연락처・여권 번호 등은 입력하지 마세요.', 'Sus mensajes se envían a SB Intuitions y pueden usarse para mejorar (entrenar) su IA. No escriba su nombre, datos de contacto ni número de pasaporte.'),
  notice3: L('命に関わる症状があれば、チャットより先に 119 に電話してください。', 'For life-threatening symptoms, call 119 before using this chat.', '如有危及生命的症状，请先拨打119，而不是使用聊天。', '생명이 위험한 증상이 있으면 채팅보다 먼저 119에 전화하세요.', 'Ante síntomas graves, llame al 119 antes de usar este chat.'),
  notice4: L('マイクで音声入力を使う場合、音声はブラウザの提供元（Google・Appleなど）のサーバーで文字に変換されることがあります。', 'If you use the microphone, your browser provider (such as Google or Apple) may convert your voice to text on its servers.', '使用麦克风语音输入时，语音可能会在浏览器提供商（Google、Apple等）的服务器上转换为文字。', '마이크로 음성 입력을 사용하면 음성이 브라우저 제공업체(Google・Apple 등)의 서버에서 문자로 변환될 수 있습니다.', 'Si usa el micrófono, el proveedor de su navegador (como Google o Apple) puede convertir su voz en texto en sus servidores.'),
  micStart: L('音声で入力', 'Speak instead of typing', '语音输入', '음성으로 입력', 'Hablar en lugar de escribir'),
  micStop: L('音声入力を止める', 'Stop voice input', '停止语音输入', '음성 입력 중지', 'Detener la entrada de voz'),
  listening: L('聞き取り中… 話し終えたら止めるボタンを押してください。内容を確認してから送信できます。', 'Listening… Tap stop when you finish. You can check the text before sending.', '正在聆听… 说完后请点击停止。发送前可以确认文字。', '듣는 중… 말을 마치면 중지 버튼을 누르세요. 보내기 전에 내용을 확인할 수 있습니다.', 'Escuchando… Pulse detener al terminar. Podrá revisar el texto antes de enviarlo.'),
  micDenied: L('マイクの使用が許可されていません。ブラウザの設定でこのサイトのマイクを許可してください。', 'Microphone access is blocked. Allow the microphone for this site in your browser settings.', '麦克风未获授权。请在浏览器设置中允许本网站使用麦克风。', '마이크 사용이 허용되지 않았습니다. 브라우저 설정에서 이 사이트의 마이크를 허용하세요.', 'El acceso al micrófono está bloqueado. Permítalo para este sitio en la configuración del navegador.'),
  micNoSpeech: L('声が聞き取れませんでした。もう一度お試しください。', 'No speech was detected. Please try again.', '没有听到声音。请再试一次。', '음성이 감지되지 않았습니다. 다시 시도하세요.', 'No se detectó voz. Inténtelo de nuevo.'),
  micFailed: L('音声入力を使えませんでした。文字で入力してください。', 'Voice input is not available right now. Please type instead.', '暂时无法使用语音输入。请改用文字输入。', '지금은 음성 입력을 사용할 수 없습니다. 문자로 입력하세요.', 'La entrada de voz no está disponible ahora. Escriba su mensaje.'),
  speak: L('読み上げ', 'Read aloud', '朗读', '읽어 주기', 'Leer en voz alta'),
  stopSpeaking: L('読み上げを止める', 'Stop reading', '停止朗读', '읽기 중지', 'Dejar de leer'),
  agree: L('同意してはじめる', 'Agree and start', '同意并开始', '동의하고 시작', 'Aceptar y empezar'),
  placeholder: L('症状や探している医療機関を入力', 'Describe your symptoms or what you need', '请输入症状或想找的医疗机构', '증상이나 찾는 의료기관을 입력하세요', 'Describa sus síntomas o lo que necesita'),
  send: L('送信', 'Send', '发送', '보내기', 'Enviar'),
  thinking: L('考えています…（最大1分ほど）', 'Thinking… (up to a minute)', '思考中…（最多约1分钟）', '생각 중…(최대 1분 정도)', 'Pensando… (hasta un minuto)'),
  emergency: L('危険なサインの可能性があります。今すぐ 119 に電話してください。', 'This may be a danger sign. Call 119 now.', '这可能是危险信号。请立即拨打119。', '위험한 신호일 수 있습니다. 지금 바로 119에 전화하세요.', 'Puede ser un signo de peligro. Llame al 119 ahora.'),
  call119: L('119に電話', 'Call 119', '拨打 119', '119에 전화', 'Llamar al 119'),
  busy: L('混み合っています。少し待ってからもう一度送ってください。急ぐ場合は下の窓口へ。', 'The AI is busy. Please wait a moment and try again. If urgent, use the lines below.', '当前繁忙。请稍后再试。如紧急请联系下方窗口。', '현재 혼잡합니다. 잠시 후 다시 보내 주세요. 급하면 아래 창구로.', 'La IA está ocupada. Espere un momento e inténtelo de nuevo. Si es urgente, use las líneas de abajo.'),
  unavailable: L('AIにつながりませんでした。症状ページや相談窓口をお使いください。', 'Could not reach the AI. Please use the symptom guide or a help line.', '无法连接AI。请使用症状页面或咨询窗口。', 'AI에 연결하지 못했습니다. 증상 페이지나 상담 창구를 이용하세요.', 'No se pudo conectar con la IA. Use la guía de síntomas o una línea de ayuda.'),
  symptoms: L('症状から探す', 'Find by symptom', '按症状查找', '증상으로 찾기', 'Buscar por síntoma'),
  himawari: L('ひまわり（外国語）', 'HIMAWARI (your language)', 'HIMAWARI（外语）', '히마와리(외국어)', 'HIMAWARI (su idioma)'),
  limit: L('このチャットの上限に達しました。新しく相談するには、閉じてから開き直してください。', 'This chat has reached its limit. Close and reopen to start a new one.', '本次聊天已达上限。请关闭后重新打开以开始新的咨询。', '이 채팅의 한도에 도달했습니다. 닫았다가 다시 열어 새로 시작하세요.', 'Este chat llegó a su límite. Ciérrelo y vuelva a abrirlo para empezar de nuevo.'),
  details: L('詳細', 'Details', '详情', '상세', 'Detalles'),
  call: L('電話', 'Call', '拨打', '전화', 'Llamar'),
  openNow: L('通常の診療時間内', 'Within listed hours', '在登记的诊疗时间内', '등록 진료시간 내', 'En horario publicado'),
  confirm: L('受診前に必ず電話で確認してください。', 'Always call to confirm before visiting.', '就诊前请务必电话确认。', '방문 전 반드시 전화로 확인하세요.', 'Llame siempre para confirmar antes de ir.'),
  disclaimer: L('AIの回答は誤ることがあります。診断ではありません。', 'AI answers can be wrong. This is not a diagnosis.', 'AI的回答可能有误。这不是诊断。', 'AI의 답변은 틀릴 수 있습니다. 진단이 아닙니다.', 'Las respuestas de la IA pueden ser erróneas. No es un diagnóstico.'),
  examples: [
    L('熱とのどの痛みがあります。新宿で英語が通じるクリニックは？', 'I have a fever and sore throat. Any English-speaking clinic near Shinjuku?', '我发烧、喉咙痛。新宿附近有能说中文的诊所吗？', '열이 나고 목이 아파요. 신주쿠 근처에 한국어가 되는 클리닉이 있나요?', 'Tengo fiebre y dolor de garganta. ¿Hay una clínica cerca de Shinjuku que hable español?'),
    L('足首をひねって腫れています。どの科に行けばいい？', 'I twisted my ankle and it is swollen. Which department should I go to?', '我扭伤了脚踝，肿起来了。应该去哪个科？', '발목을 삐어서 부었어요. 어느 과로 가야 하나요?', 'Me torcí el tobillo y está hinchado. ¿A qué especialidad voy?'),
  ],
};

export function ChatWidget() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const tx = (entry: Record<Language, string>) => entry[language];
  const userTurns = turns.filter(turn => turn.role === 'user').length;

  // ---- Voice input (Web Speech API). Shown only where the browser supports it.
  // The panel is never server-rendered (it opens on click), so reading browser support here is safe.
  const [micSupported] = useState(() => !!recognitionConstructor());
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<SpeechErrorKind | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const typedBeforeRef = useRef('');
  // ---- Read-aloud (speech synthesis, on the device).
  const [ttsSupported] = useState(() => speechSynthesisAvailable());
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const stopListening = () => { recognitionRef.current?.stop(); };
  const stopSpeaking = () => {
    if (speechSynthesisAvailable()) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  };

  // Stop the mic and any reading when the chat closes, the language changes or the page unmounts.
  // Cancelling fires the end/error callbacks, which reset the related state.
  useEffect(() => {
    const cancelAll = () => {
      recognitionRef.current?.abort();
      if (speechSynthesisAvailable()) window.speechSynthesis.cancel();
    };
    if (!open) cancelAll();
    return cancelAll;
  }, [open, language]);

  const startListening = () => {
    const Ctor = recognitionConstructor();
    if (!Ctor || listening) return;
    stopSpeaking();
    const recognition = new Ctor();
    recognition.lang = SPEECH_LOCALES[language];
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    typedBeforeRef.current = input;
    recognition.onresult = event => {
      const spoken = transcriptOf(event.results);
      setInput(appendSpoken(typedBeforeRef.current, spoken, language).slice(0, MAX_LENGTH));
    };
    recognition.onerror = event => { setMicError(speechErrorKind(event.error)); };
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    setMicError(null);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setMicError('failed');
      recognitionRef.current = null;
    }
  };

  const toggleSpeak = (index: number, text: string) => {
    if (!speechSynthesisAvailable()) return;
    if (speakingIndex === index) { stopSpeaking(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[language];
    utterance.onend = () => setSpeakingIndex(current => (current === index ? null : current));
    utterance.onerror = () => setSpeakingIndex(current => (current === index ? null : current));
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const lastAnswerRef = useRef<HTMLDivElement>(null);
  // Show the start of a new answer (where any 119 alert is), not the end of the clinic list.
  useEffect(() => {
    const last = turns[turns.length - 1];
    if (last?.role === 'assistant') lastAnswerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    else listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, pending]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim().slice(0, MAX_LENGTH);
    if (!content || pending || userTurns >= MAX_TURNS) return;
    recognitionRef.current?.abort();
    const next: Turn[] = [...turns, { role: 'user', content }];
    setTurns(next);
    setInput('');
    setPending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, messages: next.filter(turn => turn.content && !turn.failed).slice(-12).map(({ role, content }) => ({ role, content })) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setTurns(current => [...current, { role: 'assistant', content: '', emergency: !!data.emergency, failed: data.error === 'busy' ? 'busy' : 'unavailable', detail: typeof data.detail === 'string' ? data.detail : `HTTP ${response.status}` }]);
      } else {
        setTurns(current => [...current, { role: 'assistant', content: String(data.reply || ''), clinics: Array.isArray(data.clinics) ? data.clinics : [], emergency: !!data.emergency }]);
      }
    } catch {
      setTurns(current => [...current, { role: 'assistant', content: '', failed: 'unavailable' }]);
    } finally {
      setPending(false);
    }
  };

  const deptName = (id: string) => departments.find(d => d.id === id)?.name[language] ?? id;

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 hover:bg-brand-700">
          <MessageCircle className="h-5 w-5" aria-hidden /> {tx(TEXT.open)}
        </button>
      )}
      {open && (
        <aside role="dialog" aria-modal="false" aria-labelledby="chat-title" className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-4 sm:right-4 sm:top-20 sm:w-[400px] sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 id="chat-title" className="flex items-center gap-2 font-extrabold text-slate-900">{tx(TEXT.title)} <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">{tx(TEXT.beta)}</span></h2>
              <p className="text-[11px] text-slate-500">{tx(TEXT.poweredBy)}</p>
            </div>
            <button onClick={() => { stopSpeaking(); setOpen(false); }} aria-label={tx(TEXT.close)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" aria-hidden /></button>
          </header>

          <a href="tel:119" className="flex items-center justify-center gap-2 bg-emergency-600 px-4 py-2 text-xs font-bold text-white"><Phone className="h-3.5 w-3.5" aria-hidden />{t('home.emergencyShort')}</a>

          {!agreed ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h3 className="font-bold text-slate-900">{tx(TEXT.noticeTitle)}</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                <li>{tx(TEXT.notice1)}</li>
                <li className="font-semibold text-slate-900">{tx(TEXT.notice2)}</li>
                <li>{tx(TEXT.notice3)}</li>
                {micSupported && <li>{tx(TEXT.notice4)}</li>}
              </ul>
              <button onClick={() => setAgreed(true)} className="w-full rounded-xl bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-700">{tx(TEXT.agree)}</button>
              <Link href="/privacy" className="block text-center text-xs text-slate-500 underline">{t('footer.privacy')}</Link>
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                {!turns.length && (
                  <div className="space-y-2">
                    {TEXT.examples.map(example => (
                      <button key={example.en} onClick={() => send(tx(example))} className="block w-full rounded-xl border border-brand-200 bg-brand-50/50 px-3 py-2 text-left text-sm text-brand-800 hover:bg-brand-50">{tx(example)}</button>
                    ))}
                  </div>
                )}
                {turns.map((turn, index) => turn.role === 'user' ? (
                  <p key={index} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">{turn.content}</p>
                ) : (
                  <div key={index} ref={index === turns.length - 1 ? lastAnswerRef : undefined} className="max-w-[95%] space-y-2 scroll-mt-2">
                    {turn.emergency && (
                      <div role="alert" className="rounded-2xl border border-emergency-200 bg-emergency-50 p-3 text-sm font-bold text-emergency-800 space-y-2">
                        <p className="flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />{tx(TEXT.emergency)}</p>
                        <a href="tel:119" className="inline-flex items-center gap-1 rounded-lg bg-emergency-600 px-3 py-2 text-white"><Phone className="h-3.5 w-3.5" aria-hidden />{tx(TEXT.call119)}</a>
                      </div>
                    )}
                    {turn.failed ? (
                      <div className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700 space-y-2">
                        <p>{tx(turn.failed === 'busy' ? TEXT.busy : TEXT.unavailable)}</p>
                        {turn.detail && <p className="break-all font-mono text-[10px] text-slate-500">{turn.detail}</p>}
                        <div className="flex flex-wrap gap-2">
                          <Link href="/symptoms" className="rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-bold text-brand-700">{tx(TEXT.symptoms)}</Link>
                          <a href={EMERGENCY_CONTACTS.himawari.href} className="rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-bold text-brand-700">{tx(TEXT.himawari)} {EMERGENCY_CONTACTS.himawari.display}</a>
                        </div>
                      </div>
                    ) : turn.content && (
                      <div className="space-y-1">
                        <p className="whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm leading-relaxed text-slate-800">{turn.content}</p>
                        {ttsSupported && (
                          <button type="button" onClick={() => toggleSpeak(index, turn.content)} aria-pressed={speakingIndex === index}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50">
                            {speakingIndex === index ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
                            {tx(speakingIndex === index ? TEXT.stopSpeaking : TEXT.speak)}
                          </button>
                        )}
                      </div>
                    )}
                    {!!turn.clinics?.length && (
                      <div className="space-y-2">
                        {turn.clinics.map(clinic => {
                          const callHref = telephoneHref(clinic.phone);
                          const primary = language === 'ja' || language === 'zh' ? clinic.name.ja.normalize('NFKC') : clinic.name.en || clinic.name.ja;
                          return (
                            <div key={clinic.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1">
                              <p className="font-bold text-slate-900 text-sm">{primary}</p>
                              {primary !== clinic.name.ja.normalize('NFKC') && <p lang="ja" className="text-xs text-slate-600">{clinic.name.ja.normalize('NFKC')}</p>}
                              <p className="text-xs text-brand-700 font-semibold">{clinic.departments.map(deptName).join(', ')}</p>
                              <p lang="ja" className="flex gap-1 text-xs text-slate-600"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />{clinic.address.normalize('NFKC')}{clinic.distanceKm !== null ? ` · ${clinic.distanceKm}km` : ''}</p>
                              <p className="text-[11px] text-slate-500">{clinic.languages.map(code => code.toUpperCase()).join(' · ')}{clinic.openNow === true ? ` · ${tx(TEXT.openNow)}` : ''}</p>
                              <div className="flex gap-2 pt-1">
                                {callHref && <a href={callHref} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white"><Phone className="h-3.5 w-3.5" aria-hidden />{tx(TEXT.call)}</a>}
                                <Link href={`/hospitals/${clinic.id}`} className="inline-flex items-center gap-1 rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-bold text-brand-700"><ExternalLink className="h-3.5 w-3.5" aria-hidden />{tx(TEXT.details)}</Link>
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[11px] text-slate-500">{tx(TEXT.confirm)}</p>
                      </div>
                    )}
                  </div>
                ))}
                {pending && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{tx(TEXT.thinking)}</p>}
                {userTurns >= MAX_TURNS && <p className="text-xs text-slate-500">{tx(TEXT.limit)}</p>}
              </div>
              <form onSubmit={event => { event.preventDefault(); send(input); }} className="border-t border-slate-100 p-3 space-y-1">
                <div className="flex gap-2">
                  <label htmlFor="chat-input" className="sr-only">{tx(TEXT.placeholder)}</label>
                  <textarea id="chat-input" value={input} onChange={event => setInput(event.target.value)} maxLength={MAX_LENGTH} rows={micSupported ? 3 : 2}
                    onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(input); } }}
                    placeholder={tx(TEXT.placeholder)} disabled={pending || userTurns >= MAX_TURNS}
                    className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-base sm:text-sm" />
                  <div className="flex flex-col justify-end gap-2">
                    {micSupported && (
                      <button type="button" onClick={listening ? stopListening : startListening} disabled={pending || userTurns >= MAX_TURNS}
                        aria-label={tx(listening ? TEXT.micStop : TEXT.micStart)} aria-pressed={listening} title={tx(listening ? TEXT.micStop : TEXT.micStart)}
                        className={`rounded-xl p-3 disabled:opacity-40 ${listening ? 'bg-emergency-600 text-white animate-pulse' : 'border border-brand-300 bg-white text-brand-700 hover:bg-brand-50'}`}>
                        {listening ? <Square className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
                      </button>
                    )}
                    <button type="submit" disabled={pending || !input.trim() || userTurns >= MAX_TURNS} aria-label={tx(TEXT.send)} className="rounded-xl bg-brand-600 p-3 text-white disabled:opacity-40"><Send className="h-4 w-4" aria-hidden /></button>
                  </div>
                </div>
                {listening && <p role="status" className="text-xs font-semibold text-emergency-700">{tx(TEXT.listening)}</p>}
                {micError && !listening && <p role="alert" className="text-xs text-amber-800">{tx(micError === 'denied' ? TEXT.micDenied : micError === 'nospeech' ? TEXT.micNoSpeech : TEXT.micFailed)}</p>}
                <p className="text-[10px] text-slate-400">{tx(TEXT.disclaimer)}</p>
              </form>
            </>
          )}
        </aside>
      )}
    </>
  );
}

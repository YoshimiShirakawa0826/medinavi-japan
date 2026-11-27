import type { Language } from '../../types';

// Browser speech features (Web Speech API). Recognition is offered only where the
// browser supports it (e.g. Chrome, Edge, Safari); elsewhere the mic button is hidden.
// Note: some browsers send audio to their provider's servers for recognition.

export const SPEECH_LOCALES: Record<Language, string> = {
  ja: 'ja-JP', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', es: 'es-ES',
};

// Minimal typing; the DOM lib does not ship SpeechRecognition types everywhere.
export type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
export interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: { resultIndex: number; results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

export function recognitionConstructor(scope: unknown = typeof window === 'undefined' ? undefined : window): RecognitionCtor | null {
  if (!scope || typeof scope !== 'object') return null;
  const w = scope as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Joins every result heard so far (final and interim) into one string. */
export function transcriptOf(results: RecognitionResultList): string {
  let text = '';
  for (let i = 0; i < results.length; i++) text += results[i][0]?.transcript ?? '';
  return text.trim();
}

/** Appends spoken text to what is already typed, with a space only where the language uses spaces. */
export function appendSpoken(typed: string, spoken: string, language: Language): string {
  if (!spoken) return typed;
  if (!typed.trim()) return spoken;
  const separator = language === 'ja' || language === 'zh' ? '' : ' ';
  return `${typed.replace(/\s+$/, '')}${separator}${spoken}`;
}

export type SpeechErrorKind = 'denied' | 'nospeech' | 'failed';

export function speechErrorKind(error: string): SpeechErrorKind | null {
  if (error === 'aborted') return null; // stopped on purpose
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'denied';
  if (error === 'no-speech') return 'nospeech';
  return 'failed';
}

export function speechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

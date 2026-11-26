import type { Language } from '../../types';
import { AREA_IDS, DEPARTMENT_IDS, describeForModel, searchClinics, type ClinicCard, type SearchRecord } from './clinic-search.ts';
import { sanitizeReply } from './safety.ts';

// Sarashina Chat Completions API (free beta). https://docs.sarashina.ai/api-reference/chat-completions
// sarashina3-mini ends on or after 2026-11-27; its successor is sarashina3.2-mini-thinking.
export const SARASHINA_URL = 'https://api.sarashina.ai/v1/chat/completions';
// Local testing only: point at a mock server.
const apiUrl = () => process.env.SARASHINA_API_URL || SARASHINA_URL;
export const SARASHINA_MODEL = 'sarashina3.2-mini-thinking';

const LANGUAGE_NAMES: Record<Language, string> = { ja: '日本語', en: 'English', zh: '简体中文', ko: '한국어', es: 'Español' };

export function systemPrompt(language: Language): string {
  return `あなたは「MediNavi JAPAN」の案内役です。日本（主に東京）を訪れている外国人が、病気やけがのときに適切な受診先へたどり着けるよう手伝います。

# 必ず守ること
- 返答は必ず「${LANGUAGE_NAMES[language]}」で書く。
- あなたは医師ではない。診断しない。病名や「〜の可能性が高い」などの見立てを言わない。薬の量や治療法を指示しない。
- できるのは次の案内だけ: (1) 受診する診療科の目安 (2) すぐ119番すべき危険なサイン (3) このアプリの医療機関検索 (4) 公的な相談窓口。
- 意識がない、呼吸が苦しい、強い胸の痛み、大量の出血、けいれん、急な手足のまひ、ろれつが回らない、重いアレルギー反応、自分を傷つけたい気持ちなどがあれば、最初に「すぐ119に電話してください」と伝える。
- 医療機関を探してほしいとき、または症状から受診先を案内するときは search_clinics を使う。結果はアプリが名前・住所・電話・地図つきのカードで表示するので、あなたは電話番号・住所・URLを書かない。検索結果にない医療機関の名前を出さない。
- 使ってよい電話番号は次だけ: 119（救急車）、110（警察）、#7119（救急相談・日本語のみ）、03-3212-2323（#7119と同じ窓口）、03-5285-8181（東京都ひまわり：英語・中国語・韓国語・タイ語・スペイン語、毎日9〜20時）、050-3816-2787（JNTO Japan Visitor Hotline：英語・中国語・韓国語、24時間）。
- 歯の痛みはこのアプリでは探せない。ひまわり（03-5285-8181）か、JNTOの医療機関検索を案内する。
- 軽い症状なら薬局の薬剤師に相談できることを伝えてよい。
- 受診前に必ず医療機関へ電話で確認するよう添える。日本の公的保険がない場合は全額自己負担になること、海外旅行保険の会社に先に連絡するとよいことを、必要に応じて伝える。
- 名前・パスポート番号・連絡先などの個人情報を聞かない。
- 医療や受診と関係のない依頼には、このチャットは受診の案内専用だと短く伝える。
- 返答は短く、5文程度まで。箇条書きを使ってよい。

# search_clinics の引数
- department: ${DEPARTMENT_IDS.join(', ')}（内科=internal, 外科=surgery, 小児科=pediatrics, 整形外科=orthopedics, 皮膚科=dermatology, 眼科=ophthalmology, 耳鼻科=ent, 産婦人科=obgyn, 精神科=psychiatry, 泌尿器科=urology）
- area: ${AREA_IDS.join(', ')}（利用者が言った場所に最も近いもの。分からなければ省略）
- language: 利用者が希望する診察の言語（ja, en, zh, ko, es）。
- open_now: 「今すぐ」「今開いている」と言われたら true。`;
}

export const SEARCH_TOOL = {
  type: 'function',
  function: {
    name: 'search_clinics',
    description: 'Search clinics in Tokyo from MediNavi JAPAN data (Ministry of Health open data). Results are shown to the user as cards.',
    parameters: {
      type: 'object',
      properties: {
        department: { type: 'string', enum: DEPARTMENT_IDS, description: 'Clinic department' },
        area: { type: 'string', enum: AREA_IDS, description: 'Nearest station / area in Tokyo' },
        language: { type: 'string', enum: ['ja', 'en', 'zh', 'ko', 'es'], description: 'Language the visitor wants to be seen in' },
        open_now: { type: 'boolean', description: 'Only clinics open now by listed regular hours' },
      },
    },
  },
} as const;

type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } };
type ApiMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string; reasoning?: string };

export class SarashinaError extends Error {
  status: number;
  retryAfter?: number;
  detail?: string;
  constructor(status: number, retryAfter?: number, detail?: string) {
    super(`Sarashina API error ${status}${detail ? `: ${detail}` : ''}`);
    this.status = status;
    this.retryAfter = retryAfter;
    this.detail = detail;
  }
}

async function complete(apiKey: string, messages: ApiMessage[], withTools: boolean, fetchImpl: typeof fetch): Promise<ApiMessage> {
  const response = await fetchImpl(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: SARASHINA_MODEL,
      messages,
      ...(withTools ? { tools: [SEARCH_TOOL], tool_choice: 'auto' } : { tool_choice: 'none', tools: [SEARCH_TOOL] }),
      reasoning_effort: 'low',
      temperature: 0.3,
      max_completion_tokens: 4000,
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) {
    const retry = Number(response.headers.get('retry-after'));
    const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
    throw new SarashinaError(response.status, Number.isFinite(retry) ? retry : undefined, detail);
  }
  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  if (!message || typeof message !== 'object') throw new SarashinaError(502);
  return { role: 'assistant', content: message.content ?? '', tool_calls: message.tool_calls, reasoning: message.reasoning };
}

export type AssistantResult = { reply: string; clinics: ClinicCard[] };

/** One assistant turn: at most two tool rounds, then a final answer without tools. */
export async function runAssistant(options: {
  apiKey: string;
  language: Language;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  records: SearchRecord[];
  now?: Date;
  fetchImpl?: typeof fetch;
}): Promise<AssistantResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const messages: ApiMessage[] = [{ role: 'system', content: systemPrompt(options.language) }, ...options.history];
  let clinics: ClinicCard[] = [];

  for (let round = 0; round < 3; round++) {
    const message = await complete(options.apiKey, messages, round < 2, fetchImpl);
    const calls = message.tool_calls?.filter(call => call?.function?.name === 'search_clinics') ?? [];
    if (!calls.length) return { reply: sanitizeReply(message.content ?? ''), clinics };
    messages.push({ role: 'assistant', content: message.content || '', tool_calls: message.tool_calls, ...(message.reasoning ? { reasoning: message.reasoning } : {}) });
    for (const call of calls) {
      let args = {};
      try { args = JSON.parse(call.function.arguments || '{}'); } catch { /* use defaults */ }
      const found = searchClinics(options.records, args, options.now ?? new Date());
      if (found.length) clinics = found;
      messages.push({ role: 'tool', tool_call_id: call.id, content: describeForModel(found) });
    }
  }
  return { reply: '', clinics };
}

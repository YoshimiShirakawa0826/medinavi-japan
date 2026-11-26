import records from '@/generated/clinic-search.json';
import type { Language } from '@/types';
import { runAssistant, SarashinaError } from '@/lib/chat/assistant';
import type { SearchRecord } from '@/lib/chat/clinic-search';
import { detectEmergency, redactPersonalInfo } from '@/lib/chat/safety';
import { chatEnabled } from '@/lib/chat/config';

// The model may think for a while; allow up to 60 seconds.
export const maxDuration = 60;

const LANGUAGES: Language[] = ['ja', 'en', 'zh', 'ko', 'es'];
const MAX_MESSAGES = 12;
const MAX_LENGTH = 800;

type Turn = { role: 'user' | 'assistant'; content: string };

function parseBody(body: unknown): { language: Language; history: Turn[] } | null {
  if (!body || typeof body !== 'object') return null;
  const { language, messages } = body as { language?: unknown; messages?: unknown };
  if (!LANGUAGES.includes(language as Language) || !Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES) return null;
  const history: Turn[] = [];
  for (const message of messages) {
    if (!message || typeof message !== 'object') return null;
    const { role, content } = message as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim() || content.length > MAX_LENGTH * 2) return null;
    history.push({ role, content: content.slice(0, MAX_LENGTH * 2) });
  }
  if (history[history.length - 1].role !== 'user' || history[history.length - 1].content.length > MAX_LENGTH) return null;
  return { language: language as Language, history };
}

export async function POST(request: Request) {
  if (!chatEnabled()) return Response.json({ error: 'disabled' }, { status: 404 });
  const apiKey = process.env.SARASHINA_API_KEY;
  if (!apiKey) return Response.json({ error: 'unavailable', detail: process.env.VERCEL_ENV === 'production' ? undefined : 'SARASHINA_API_KEY is empty at runtime' }, { status: 503 });

  let parsed: ReturnType<typeof parseBody> = null;
  try { parsed = parseBody(await request.json()); } catch { parsed = null; }
  if (!parsed) return Response.json({ error: 'invalid' }, { status: 400 });

  // Identifiers never leave the app, and the emergency check does not depend on the model.
  const history = parsed.history.map(turn => turn.role === 'user' ? { ...turn, content: redactPersonalInfo(turn.content) } : turn);
  const emergency = detectEmergency(parsed.history[parsed.history.length - 1].content);

  try {
    const result = await runAssistant({ apiKey, language: parsed.language, history, records: records as SearchRecord[] });
    return Response.json({ ...result, emergency }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    // Logged for Vercel function logs; the API key is never part of the message.
    console.error('[chat] Sarashina request failed:', error instanceof Error ? error.message : error);
    const status = error instanceof SarashinaError ? error.status : 502;
    // Outside production, show the cause in the chat to make setup problems visible.
    const detail = process.env.VERCEL_ENV === 'production' ? undefined
      : error instanceof SarashinaError ? `${error.status} ${error.detail ?? ''}`.trim()
      : error instanceof Error ? `${error.name}: ${error.message}` : 'unknown';
    const busy = status === 429;
    return Response.json({ error: busy ? 'busy' : 'unavailable', emergency, detail, retryAfter: error instanceof SarashinaError ? error.retryAfter : undefined },
      { status: busy ? 429 : 502, headers: { 'Cache-Control': 'no-store' } });
  }
}

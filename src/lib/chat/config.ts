// The assistant is off unless CHAT_ENABLED=true and SARASHINA_API_KEY are set for the
// deployment environment (start with Preview only).
export function chatEnabled(): boolean {
  return process.env.CHAT_ENABLED === 'true' && !!process.env.SARASHINA_API_KEY;
}

// The assistant needs SARASHINA_API_KEY. On Preview deployments the key alone turns it on;
// Production additionally needs CHAT_ENABLED=true, so it is never published by accident.
export function chatEnabled(): boolean {
  if (!process.env.SARASHINA_API_KEY) return false;
  return process.env.CHAT_ENABLED === 'true' || process.env.VERCEL_ENV === 'preview';
}

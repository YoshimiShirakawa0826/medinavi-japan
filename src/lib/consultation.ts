export const CONSULTATION_INFO_URL = 'https://ghjapan2025.github.io/nurse-guide-japan/';

/** Configured by the operator, never from request parameters. */
export function paymentLinkFromConfig(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com'
      || url.username || url.password || url.port || url.pathname === '/') return null;
    return url.href;
  } catch { return null; }
}

export const CONSULTATION_INFO_URL = 'https://ghjapan2025.github.io/nurse-guide-japan/';
export const CONSULTATION_PHONE = '070-9036-9655';
export const CONSULTATION_PHONE_INTERNATIONAL = '+81 70-9036-9655';
export const CONSULTATION_PHONE_HREF = 'tel:+817090369655';

// Enable only after the operator confirms this business number is registered
// and ready to receive WhatsApp enquiries. No paid messaging API is needed.
export function whatsAppLinkFromConfig(enabled: string | undefined): string | null {
  return enabled === 'true' ? 'https://wa.me/817090369655' : null;
}

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

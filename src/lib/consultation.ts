// Enable only after the operator confirms this business number is registered
// and ready to receive WhatsApp enquiries. No paid messaging API is needed.
export function whatsAppLinkFromConfig(enabled: string | undefined): string | null {
  return enabled === 'true' ? 'https://wa.me/817090369655' : null;
}

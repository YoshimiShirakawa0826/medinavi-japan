import type { Metadata } from 'next';
import { ConsultationPanel } from '@/components/ConsultationPanel';
import { whatsAppLinkFromConfig } from '@/lib/consultation';

export const metadata: Metadata = {
  title: 'Online consultation support',
  description: 'Help with access and booking for online medical consultations via WhatsApp. No examination or diagnosis takes place on this site.',
  alternates: { canonical: '/consultation' },
};

export default function ConsultationPage() {
  return <ConsultationPanel
    whatsAppLink={whatsAppLinkFromConfig(process.env.CONSULTATION_WHATSAPP_ENABLED)}
  />;
}

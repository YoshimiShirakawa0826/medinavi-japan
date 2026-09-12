import { ConsultationPanel } from '@/components/ConsultationPanel';
import { paymentLinkFromConfig, whatsAppLinkFromConfig } from '@/lib/consultation';

export default function ConsultationPage() {
  return <ConsultationPanel
    paymentLink={paymentLinkFromConfig(process.env.CONSULTATION_PAYMENT_LINK)}
    whatsAppLink={whatsAppLinkFromConfig(process.env.CONSULTATION_WHATSAPP_ENABLED)}
  />;
}

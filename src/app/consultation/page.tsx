import { ConsultationPanel } from '@/components/ConsultationPanel';
import { whatsAppLinkFromConfig } from '@/lib/consultation';

export default function ConsultationPage() {
  return <ConsultationPanel
    whatsAppLink={whatsAppLinkFromConfig(process.env.CONSULTATION_WHATSAPP_ENABLED)}
  />;
}

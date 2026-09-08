import { ConsultationPanel } from '@/components/ConsultationPanel';
import { paymentLinkFromConfig } from '@/lib/consultation';

export default function ConsultationPage() {
  return <ConsultationPanel paymentLink={paymentLinkFromConfig(process.env.CONSULTATION_PAYMENT_LINK)} />;
}

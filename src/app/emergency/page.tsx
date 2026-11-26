import type { Metadata } from 'next';
import { EmergencyGuide } from './EmergencyGuide';

export const metadata: Metadata = {
  title: 'Emergency guide: 119, #7119 and help in your language',
  description: 'What to do in a medical emergency in Tokyo: when to call 119, the Japanese-only #7119 line, multilingual help lines (HIMAWARI, Japan Visitor Hotline), what to bring and costs.',
  alternates: { canonical: '/emergency' },
};

export default function EmergencyPage() {
  return <EmergencyGuide />;
}

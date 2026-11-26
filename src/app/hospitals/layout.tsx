import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Clinics in Tokyo | MediNavi JAPAN', template: '%s | MediNavi JAPAN' },
  description: 'Search 4,430 clinics in Tokyo by area, language, department, hours, walk-in, cards and travel insurance. Based on Ministry of Health open data; confirm with the clinic before visiting.',
  alternates: { canonical: '/hospitals' },
};

export default function HospitalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

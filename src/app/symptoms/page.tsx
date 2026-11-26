import type { Metadata } from 'next';
import { SymptomsGuide } from './SymptomsGuide';

export const metadata: Metadata = {
  title: 'Find a department by symptom',
  description: 'Choose your symptom to see which clinic department to visit in Tokyo, with danger signs that need 119. Not a diagnosis.',
  alternates: { canonical: '/symptoms' },
};

export default function SymptomsPage() {
  return <SymptomsGuide />;
}

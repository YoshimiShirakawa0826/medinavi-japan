import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { departments } from '@/types';
import { clinicSummary } from '@/lib/clinic-index';
import { ClinicDetail } from './ClinicDetail';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const clinic = clinicSummary(id);
  if (!clinic) return { title: 'Clinic not found', robots: { index: false } };
  const name = clinic.en && clinic.en !== clinic.ja ? `${clinic.en} (${clinic.ja.normalize('NFKC')})` : clinic.ja.normalize('NFKC');
  const depts = clinic.departments.map(d => departments.find(x => x.id === d)?.name.en ?? d).join(', ');
  return {
    title: name,
    description: [depts, clinic.address.normalize('NFKC'), 'Address in Japanese, phone, listed hours and languages. Confirm with the clinic before visiting.']
      .filter(Boolean).join(' · '),
    alternates: { canonical: `/hospitals/${id}` },
  };
}

export default async function ClinicPage({ params }: Props) {
  const { id } = await params;
  const summary = clinicSummary(id);
  if (!summary) notFound();
  return <ClinicDetail summary={summary} />;
}

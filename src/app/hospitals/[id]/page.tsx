import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { departments } from '@/types';
import { clinicSummary } from '@/lib/clinic-index';
import { ClinicDetail } from './ClinicDetail';
import { SITE_URL } from '@/lib/site';

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
  // Structured data helps search engines understand the listing. Only published facts are included.
  const address = summary.address.normalize('NFKC');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: summary.ja.normalize('NFKC'),
    ...(summary.en && summary.en !== summary.ja ? { alternateName: summary.en } : {}),
    url: `${SITE_URL}/hospitals/${id}`,
    ...(summary.phone ? { telephone: summary.phone } : {}),
    address: { '@type': 'PostalAddress', addressCountry: 'JP', addressRegion: '東京都', streetAddress: address.replace(/^東京都/, '') },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <ClinicDetail summary={summary} />
  </>;
}

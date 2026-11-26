import type { Metadata } from 'next';
import { LegalDocument, type LegalText } from '@/components/LegalDocument';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'Terms of service for MediNavi JAPAN, a guide to clinics in Tokyo for foreign visitors.',
  alternates: { canonical: '/terms' },
};

const ja: LegalText = {
  title: '利用規約',
  intro: 'この利用規約（以下「本規約」）は、MediNavi JAPAN（以下「当サービス」）の利用条件を定めるものです。当サービスを利用した時点で、本規約に同意したものとみなします。',
  sections: [
    { heading: 'サービスの内容', body: [
      '当サービスは、日本を訪れる外国人などが東京都内の医療機関を探すための情報案内サービスです。掲載情報は、厚生労働省のオープンデータ（医療情報ネット等）や医療機関の公式サイトなど公開情報をもとにしています。',
      '当サービスは診察・診断・治療・処方を行うものではなく、医療行為や医学的な助言に代わるものではありません。',
    ] },
    { heading: '緊急時の対応', body: [
      '命に関わる症状、意識がない、呼吸が苦しい、大量の出血、強い胸の痛みなどがある場合は、当サービスの利用を続けず、ただちに119番に電話してください。',
    ] },
    { heading: '掲載情報の正確性', body: [
      '掲載情報は作成時点の公開資料に基づくもので、診療時間、休診日、対応言語、支払方法、保険の取り扱い、予約の要否などは予告なく変わることがあります。リアルタイムの受け入れ状況を示すものではありません。',
      '受診の前には、必ず医療機関に直接確認してください。当サービスは掲載情報の正確性、完全性、最新性を保証しません。',
    ] },
    { heading: '外部サービス', body: [
      '当サービスは、地図サービス（Google マップ、OpenStreetMap）、WhatsApp、公的機関のウェブサイトなど外部サービスへのリンクを含みます。外部サービスの利用には、それぞれの提供者の規約とプライバシーポリシーが適用されます。',
      'オンライン診療の相談窓口は、利用方法や予約の案内を行うもので、診察や処方を行うものではありません。返信や受診を保証するものでもありません。',
      'AIチャット（試験提供）は、SB Intuitions株式会社の生成AI「Sarashina」を利用した受診先の案内です。AIの回答は誤ることがあり、診断ではありません。混雑時や提供元の都合により、予告なく利用できなくなることがあります。',
    ] },
    { heading: '禁止事項', body: [
      '法令または公序良俗に反する行為、当サービスや第三者の権利を侵害する行為、当サービスの運営を妨げる行為（過度な自動アクセスを含みます）、掲載情報を誤解を招く形で再配布する行為を禁止します。',
    ] },
    { heading: '免責', body: [
      '当サービスの利用または利用できなかったことにより生じた損害について、当サービスの運営者に故意または重大な過失がある場合を除き、責任を負いません。',
    ] },
    { heading: 'サービスの変更・中断', body: [
      '当サービスは、事前の通知なく内容を変更し、または提供を中断・終了することがあります。',
    ] },
    { heading: '規約の変更', body: [
      '本規約は必要に応じて変更することがあります。変更後の規約は、このページに掲載した時点から効力を生じます。',
    ] },
    { heading: '準拠法・管轄', body: [
      '本規約は日本法に準拠します。当サービスに関して紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。',
    ] },
  ],
};

const en: LegalText = {
  title: 'Terms of Service',
  intro: 'These Terms of Service ("Terms") set out the conditions for using MediNavi JAPAN (the "Service"). By using the Service, you agree to these Terms.',
  sections: [
    { heading: 'What the Service is', body: [
      'The Service is an information guide that helps foreign visitors and others find medical institutions in Tokyo. Listings are based on public information, including open data from Japan\'s Ministry of Health, Labour and Welfare (such as Medical Information Net) and clinics\' official websites.',
      'The Service does not examine, diagnose, treat or prescribe, and it does not replace medical care or medical advice.',
    ] },
    { heading: 'Emergencies', body: [
      'If someone has life-threatening symptoms — unconsciousness, difficulty breathing, heavy bleeding, severe chest pain or similar — stop using the Service and call 119 immediately.',
    ] },
    { heading: 'Accuracy of information', body: [
      'Listings reflect public sources at the time they were prepared. Hours, closing days, languages, payment methods, insurance handling and booking rules can change without notice. The Service does not show real-time availability.',
      'Always confirm directly with the clinic before visiting. The Service does not guarantee that listings are accurate, complete or up to date.',
    ] },
    { heading: 'External services', body: [
      'The Service links to external services such as map services (Google Maps, OpenStreetMap), WhatsApp and public-sector websites. Their own terms and privacy policies apply when you use them.',
      'The online consultation support line helps with access and booking only. It does not examine or prescribe, and it does not guarantee a reply or a consultation.',
      'The AI chat (beta) uses "Sarashina", a generative AI by SB Intuitions Corp., to suggest where to seek care. AI answers can be wrong and are not a diagnosis. The chat may become unavailable without notice when busy or at the provider\'s discretion.',
    ] },
    { heading: 'Prohibited conduct', body: [
      'You must not break the law, infringe the rights of the Service or others, interfere with the Service (including excessive automated access), or redistribute listings in a misleading way.',
    ] },
    { heading: 'Limitation of liability', body: [
      'The operator of the Service is not liable for damage arising from using, or being unable to use, the Service, except in cases of intent or gross negligence on the operator\'s part.',
    ] },
    { heading: 'Changes to or suspension of the Service', body: [
      'The Service may change, suspend or end without prior notice.',
    ] },
    { heading: 'Changes to these Terms', body: [
      'These Terms may be updated when necessary. Updated Terms take effect when posted on this page.',
    ] },
    { heading: 'Governing law and jurisdiction', body: [
      'These Terms are governed by the laws of Japan. The Tokyo District Court has exclusive jurisdiction in the first instance over any dispute relating to the Service.',
    ] },
  ],
};

export default function TermsPage() {
  return <LegalDocument ja={ja} en={en} effectiveDate="2026-11-26" />;
}

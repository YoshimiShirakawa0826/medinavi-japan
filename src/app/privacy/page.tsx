import type { Metadata } from 'next';
import { LegalDocument, type LegalText } from '@/components/LegalDocument';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How MediNavi JAPAN handles location, language settings and other information.',
  alternates: { canonical: '/privacy' },
};

const ja: LegalText = {
  title: 'プライバシーポリシー',
  intro: 'MediNavi JAPAN（以下「当サービス」）は、利用者のプライバシーを尊重し、個人情報の保護に関する法律その他の法令に従って情報を取り扱います。当サービスは会員登録を必要とせず、氏名・連絡先・健康状態などを入力するフォームはありません。',
  sections: [
    { heading: '位置情報', body: [
      '「現在地を使う」を押したときに限り、端末の位置情報の利用を許可するよう求めます。許可は任意です。',
      '位置情報は端末内で医療機関までの距離を計算するためだけに使い、当サービスのサーバーには送信しません。一覧と詳細の間で条件を引き継ぐため、取得から30分以内に限り、ブラウザのセッションストレージに保存します。タブを閉じると消去されます。',
      '「地図で開く」を押した場合は、表示している地点や医療機関名が地図サービス（Google マップ）に送られます。地図パネルを開いた場合は、地図を表示するために OpenStreetMap に接続します。',
    ] },
    { heading: '端末に保存する情報', body: [
      '表示言語の設定をブラウザのローカルストレージに保存します。また、通信が不安定なときにも緊急時ガイドなどを表示できるよう、ページの一部を端末のキャッシュ（Service Worker）に保存します。これらは端末の設定から削除できます。',
      '当サービスは広告目的のクッキーやアクセス解析ツールを使用していません。',
    ] },
    { heading: 'アクセスログ', body: [
      '当サービスはVercel Inc.のホスティングを利用しています。ページの配信にあたり、IPアドレス、ブラウザの種類、アクセス日時などがホスティング事業者のログに記録される場合があります。これらはサービスの提供、障害対応、不正利用の防止のために使われます。データが日本国外のサーバーで処理される場合があります。',
    ] },
    { heading: '外部サービス', body: [
      '電話、WhatsApp、地図、公的機関のサイトなど外部サービスへ移動した後の情報の取り扱いは、各提供者のプライバシーポリシーに従います。',
      'WhatsAppでの相談では、送信されたメッセージを相談対応のために利用します。最初のメッセージには、パスポートや保険証の画像、詳しい病歴などの機微な情報を含めないでください。',
    ] },
    { heading: '第三者への提供', body: [
      '法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。',
    ] },
    { heading: '開示等の請求・お問い合わせ', body: [
      '当サービスが保有する個人情報の開示、訂正、利用停止などのご請求や、本ポリシーに関するお問い合わせは、オンライン相談ページに記載の窓口までご連絡ください。',
    ] },
    { heading: '改定', body: [
      '本ポリシーは必要に応じて改定することがあります。改定後の内容は、このページに掲載した時点から効力を生じます。',
    ] },
  ],
};

const en: LegalText = {
  title: 'Privacy Policy',
  intro: 'MediNavi JAPAN (the "Service") respects your privacy and handles information in line with Japan\'s Act on the Protection of Personal Information and other laws. The Service has no sign-up and no form that asks for your name, contact details or health information.',
  sections: [
    { heading: 'Location', body: [
      'We ask for permission to use your device\'s location only when you press "Use my location". Allowing it is optional.',
      'Your location is used only on your device to calculate distances to clinics, and it is never sent to our servers. To keep your search when moving between the list and clinic pages, it is stored in your browser\'s session storage for up to 30 minutes and is removed when you close the tab.',
      'If you press "Open in Maps", the point or clinic name shown is sent to the map service (Google Maps). If you open the map panel, your browser connects to OpenStreetMap to show the map.',
    ] },
    { heading: 'Information stored on your device', body: [
      'Your language setting is saved in your browser\'s local storage. Some pages, such as the Emergency Guide, are cached on your device (Service Worker) so they can be shown when your connection is poor. You can delete these in your browser settings.',
      'The Service does not use advertising cookies or analytics tools.',
    ] },
    { heading: 'Access logs', body: [
      'The Service is hosted by Vercel Inc. When pages are delivered, information such as IP address, browser type and access time may be recorded in the hosting provider\'s logs. It is used to provide the Service, fix problems and prevent abuse. This data may be processed on servers outside Japan.',
    ] },
    { heading: 'External services', body: [
      'Once you move to an external service — a phone call, WhatsApp, a map or a public-sector website — that provider\'s privacy policy applies.',
      'Messages you send through the WhatsApp support line are used to respond to your enquiry. Please do not include passport or insurance-card images or detailed medical history in your first message.',
    ] },
    { heading: 'Sharing with third parties', body: [
      'We do not share personal information with third parties without your consent, except where required by law.',
    ] },
    { heading: 'Requests and contact', body: [
      'To request disclosure, correction or deletion of personal information we hold, or to ask about this policy, please use the contact listed on the online consultation page.',
    ] },
    { heading: 'Changes', body: [
      'This policy may be updated when necessary. Changes take effect when posted on this page.',
    ] },
  ],
};

export default function PrivacyPage() {
  return <LegalDocument ja={ja} en={en} effectiveDate="2026-11-26" />;
}

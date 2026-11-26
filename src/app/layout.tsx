import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { SITE_URL } from "@/lib/site";
import { ChatWidget } from "@/components/ChatWidget";
import { chatEnabled } from "@/lib/chat/config";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

const description = "Find clinics in Tokyo that fit your language, symptoms and payment needs. Emergency numbers, multilingual help lines and Japanese phrases for foreign visitors.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MediNavi JAPAN — Find clinics in Tokyo in your language", template: "%s | MediNavi JAPAN" },
  description,
  applicationName: "MediNavi JAPAN",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MediNavi JAPAN",
    title: "MediNavi JAPAN — Find clinics in Tokyo in your language",
    description,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MediNavi JAPAN" }],
    locale: "en_US",
    alternateLocale: ["ja_JP", "zh_CN", "ko_KR", "es_ES"],
  },
  twitter: { card: "summary_large_image", title: "MediNavi JAPAN", description, images: ["/og.png"] },
  appleWebApp: { capable: true, title: "MediNavi", statusBarStyle: "default" },
  icons: { icon: "/favicon.ico", apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.className} min-h-screen flex flex-col antialiased`}>
        <LanguageProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          {chatEnabled() && <ChatWidget />}
        </LanguageProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

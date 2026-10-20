import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const sans = localFont({
  src: './fonts/plus-jakarta-sans-latin.woff2',
  weight: '400 800',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MediNavi JAPAN",
  description: "Find medical institutions in Japan for inbound tourists.",
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
        </LanguageProvider>
      </body>
    </html>
  );
}

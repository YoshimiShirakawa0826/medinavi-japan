import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { PreviewShell } from "@/components/layout/PreviewShell";

const sans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "MediNavi JAPAN · Design preview",
  description: "Find medical institutions in Japan for inbound tourists.",
  robots: { index: false, follow: false },
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
          <PreviewShell>{children}</PreviewShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

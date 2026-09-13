'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { PreviewNotice } from '../PatientUI';

export function PreviewShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/preview') return <>{children}</>;
  return <><PreviewNotice /><Header /><main id="main-content" className="flex-grow">{children}</main><Footer /></>;
}

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { clinicIds } from '@/lib/clinic-index';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/emergency', '/symptoms', '/hospitals', '/consultation', '/terms', '/privacy'];
  return [
    ...pages.map(path => ({ url: `${SITE_URL}${path}`, changeFrequency: 'monthly' as const, priority: path === '' || path === '/emergency' ? 1 : 0.7 })),
    ...clinicIds().map(id => ({ url: `${SITE_URL}/hospitals/${id}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediNavi JAPAN',
    short_name: 'MediNavi',
    description: 'Find clinics in Tokyo in your language. Emergency numbers and help lines work offline once opened.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Emergency guide', url: '/emergency' },
      { name: 'Find a clinic', url: '/hospitals' },
    ],
  };
}

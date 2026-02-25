import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gypsy AI',
    short_name: 'GypsyAI',
    description: 'Hermetic oracle app with tarot, astrology, gene keys, ancestry',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f19',
    theme_color: '#d8b25a',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}

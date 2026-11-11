// Keep page as client for now; JSON-LD will be added via a server child later
'use client';

import { globalData } from '@/lib/config/data';

import { JsonLd } from '@/components/layout/json-ld';

import { Hero } from '@/features/landing/hero';

export default function HomePage() {
  return (
    <>
      <JsonLd
        json={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: globalData.name,
          url: globalData.url
        }}
      />
      <Hero />
    </>
  );
}

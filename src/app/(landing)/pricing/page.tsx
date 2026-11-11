import type { Metadata } from 'next';

import { PricingClient } from './_components/pricing-client';

export default function PricingPage() {
  return <PricingClient />;
}

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  description: 'Flexible pricing plans for individuals and teams using our CourseRoad.',
  title: 'Pricing'
};

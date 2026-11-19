import type { Metadata } from 'next';

import { PricingSection } from '@/features/pricing/pricing-section';

export default function PricingPage() {
  return <PricingSection />;
}

export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
  description: 'Flexible pricing plans for individuals and teams using our CourseRoad.',
  title: 'Pricing'
};

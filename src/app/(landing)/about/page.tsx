import type { Metadata } from 'next';

import { About } from './_components/about';

export default function AboutPage() {
  return <About />;
}

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  description: 'Learn more about our CourseRoad platform and mission.',
  title: 'About'
};

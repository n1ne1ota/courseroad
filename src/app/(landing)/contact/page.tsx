import type { Metadata } from 'next';

import { ContactClient } from './_components/contact-client';

export default function ContactPage() {
  return <ContactClient />;
}

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  description: 'Contact the CourseRoad team for support, sales, or partnerships.',
  title: 'Contact'
};

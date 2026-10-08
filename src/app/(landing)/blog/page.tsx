import type { Metadata } from 'next';

export default function BlogPage() {
  return <>Blog</>;
}

export const metadata: Metadata = {
  alternates: { canonical: '/blog' },
  description: 'Articles and updates about CourseRoad and learning best practices.',
  title: 'Blog'
};

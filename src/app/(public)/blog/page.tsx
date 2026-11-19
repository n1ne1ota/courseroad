import type { Metadata } from 'next';

import { BlogIndexView } from '@/features/blog/components/blog-index-view';

export default function BlogPage() {
  return <BlogIndexView />;
}

export const metadata: Metadata = {
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/blog/rss.xml' } },
  description: 'Articles and updates about Courseroad and learning best practices.',
  title: 'Blog'
};

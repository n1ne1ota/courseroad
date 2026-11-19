import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostView } from '@/features/blog/components/post-view';
import { getPublishedPost, getPublishedPosts } from '@/features/blog/server/loaders/cached-content';

type PostPageProps = PageProps<'/blog/[slug]'>;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  return {
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: post.author }],
    description: post.description,
    openGraph: {
      description: post.description,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      publishedTime: post.publishedAt,
      tags: post.tags,
      title: post.title,
      type: 'article'
    },
    title: post.title
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return <PostView slug={slug} />;
}

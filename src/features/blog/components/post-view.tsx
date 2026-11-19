import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleHeader } from '@courseroad/iota-ui/blocks';

import { PublicPageShell } from '@/components/layout/public-page-shell';

import { formatDate } from '../schemas/shared-schemas';
import { getPublishedAdjacentPosts, getPublishedPost } from '../server/loaders/cached-content';
import { loadPostBody } from '../server/mdx';

/**
 * `/blog/<slug>`: one post. An unknown slug, a draft and a future-dated post all return 404 in production because the
 * loader never returns them. In development the loader includes them, so authors can preview.
 */
export async function PostView({ slug }: { slug: string }) {
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const [{ newer, older }, Body] = await Promise.all([getPublishedAdjacentPosts(slug), loadPostBody(slug)]);

  return (
    <PublicPageShell>
      <div className='mx-auto w-full max-w-3xl'>
        <Link
          className='mb-8 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground'
          href='/blog'
        >
          &larr; All posts
        </Link>
        <article className='flex flex-col gap-10'>
          <ArticleHeader
            author={post.author}
            description={post.description}
            publishedAt={{ dateTime: post.publishedAt, label: formatDate(post.publishedAt) }}
            tags={post.tags}
            title={post.title}
            {...(post.updatedAt ? { updatedAt: { dateTime: post.updatedAt, label: formatDate(post.updatedAt) } } : {})}
          />
          <div className='max-w-[70ch]'>
            <Body />
          </div>
        </article>

        {newer || older ? (
          <nav className='mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2' aria-label='More posts'>
            {older ? (
              <Link className='group flex flex-col gap-1' href={`/blog/${older.slug}`} rel='prev'>
                <span className='text-sm text-muted-foreground'>Older post</span>
                <span className='font-medium group-hover:underline'>{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link
                className='group flex flex-col gap-1 sm:items-end sm:text-end'
                href={`/blog/${newer.slug}`}
                rel='next'
              >
                <span className='text-sm text-muted-foreground'>Newer post</span>
                <span className='font-medium group-hover:underline'>{newer.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </PublicPageShell>
  );
}

import Link from 'next/link';

import { Card } from '@courseroad/iota-ui';
import { PostCard } from '@courseroad/iota-ui/blocks';

import { formatDate } from '../schemas/shared-schemas';
import { getPublishedPosts } from '../server/loaders/cached-content';
import { BlogShell } from './blog-shell';

/** `/blog`: every published post, newest first. */
export async function BlogIndexView() {
  const posts = await getPublishedPosts();

  return (
    <BlogShell description='Articles and updates about Courseroad and learning.' title='Blog'>
      {posts.length === 0 ? (
        <Card className='p-8 text-center' shadow='sm' variant='frosted-glass'>
          <p className='text-muted-foreground'>No posts yet. Check back soon.</p>
        </Card>
      ) : (
        <ul className='grid gap-6 md:grid-cols-2'>
          {posts.map(post => (
            <li key={post.slug} className='contents'>
              <PostCard
                author={post.author}
                date={formatDate(post.publishedAt)}
                dateTime={post.publishedAt}
                description={post.description}
                href={`/blog/${post.slug}`}
                linkComponent={Link}
                tags={post.tags}
                title={post.title}
              />
            </li>
          ))}
        </ul>
      )}
    </BlogShell>
  );
}

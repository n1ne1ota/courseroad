import type { ReactNode } from 'react';

import { PublicPageHeader, PublicPageShell } from '@/components/layout/public-page-shell';

import { BlogTabs } from './blog-tabs';

/**
 * The editorial frame shared by the blog and the changelog: sits inside `PublicPageShell` (`max-w-7xl` frosted-glass
 * card aligned with the footer), centering a `max-w-5xl` editorial column with a quiet header and section switch.
 */
export function BlogShell({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <PublicPageShell>
      <div className='mx-auto w-full max-w-5xl'>
        <div className='mb-12 flex flex-col gap-6'>
          <PublicPageHeader align='start' description={description} title={title} />
          <BlogTabs />
        </div>
        {children}
      </div>
    </PublicPageShell>
  );
}

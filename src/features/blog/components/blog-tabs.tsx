'use client';

import { usePathname, useRouter } from 'next/navigation';

import { TabsLine } from '@courseroad/iota-ui';

import { routes } from '@/lib/routes';

const SECTIONS = [
  { href: routes.blog, label: 'Articles', value: routes.blog },
  { href: routes.changelog, label: 'Changelog', value: routes.changelog }
] as const;

/** Switches between the blog and the changelog. The active tab follows the URL. */
export function BlogTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const value = pathname.startsWith(routes.changelog) ? routes.changelog : routes.blog;

  return (
    <TabsLine
      options={SECTIONS.map(({ label, value: tab }) => ({ label, value: tab }))}
      value={value}
      aria-label='Blog sections'
      onValueChange={next => {
        const section = SECTIONS.find(item => item.value === next);
        if (section) router.push(section.href);
      }}
    />
  );
}

import type { ComponentProps } from 'react';

import Link from 'next/link';

import type { MDXComponents } from 'mdx/types';

import { Prose } from '@courseroad/iota-ui';

import { Callout } from '@/features/blog/components/callout';

/** Internal links navigate on the client; everything else is a plain link that opens as written. */
function MdxLink({ children, href = '', ...props }: ComponentProps<'a'>) {
  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href as never} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} rel='noopener noreferrer' {...props}>
      {children}
    </a>
  );
}

/**
 * Required by `@next/mdx` with the App Router: the element and component mapping for every MDX file. All content is
 * wrapped in Iota `Prose`, which styles the elements, so only links and the `Callout` component need mapping.
 */
const components: MDXComponents = {
  Callout,
  a: MdxLink,
  wrapper: ({ children }) => <Prose>{children}</Prose>
};

export function useMDXComponents(): MDXComponents {
  return components;
}

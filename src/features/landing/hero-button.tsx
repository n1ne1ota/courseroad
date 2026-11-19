'use client';

import type { ComponentProps, ReactNode } from 'react';

import Link from 'next/link';

import { Button } from '@courseroad/iota-ui';

import { ArrowRight } from 'lucide-react';

interface ButtonHeroProps {
  children: ReactNode;
  href: ComponentProps<typeof Link>['href'];
}

export function HeroButton({ children, href }: ButtonHeroProps) {
  return (
    <Button
      className='w-full font-medium shadow-lg shadow-brand/40 sm:w-auto'
      animationType={['ripple', 'sheen', 'icon']}
      color='brand'
      endContent={<ArrowRight aria-hidden='true' />}
      radius='full'
      render={<Link href={href} />}
      size='lg'
      variant='primary'
    >
      {children}
    </Button>
  );
}

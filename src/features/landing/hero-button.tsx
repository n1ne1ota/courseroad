'use client';

import type { ComponentProps, ReactNode } from 'react';

import Link from 'next/link';

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@courseroad/iota-ui';

interface ButtonHeroProps {
  children: ReactNode;
  href: ComponentProps<typeof Link>['href'];
}

export function HeroButton({ children, href }: ButtonHeroProps) {
  return (
    <motion.div initial='initial' whileHover='hover' whileTap='tap'>
      <Button
        className='relative w-full overflow-hidden font-medium shadow-lg shadow-primary/40 sm:w-auto'
        endContent={
          <motion.div
            variants={{
              hover: { x: 5 },
              initial: { x: 0 }
            }}
            transition={{ damping: 17, stiffness: 400, type: 'spring' }}
          >
            <ArrowRight className='h-5 w-5' />
          </motion.div>
        }
        animationType={['ripple', 'sheen']}
        color='primary'
        radius='full'
        render={<Link href={href} />}
        size='lg'
        variant='solid'
      >
        <span className='relative z-10'>{children}</span>
      </Button>
    </motion.div>
  );
}

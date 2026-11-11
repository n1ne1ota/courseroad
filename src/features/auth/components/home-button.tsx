import type { Route } from 'next';
import Link from 'next/link';

import { AltArrowLeft as ArrowLeftIcon } from '@solar-icons/react-perf/Linear';

import { Button } from '@courseroad/iota-ui';

/**
 * Reusable back to home link for authentication forms
 */
export function HomeButton() {
  return (
    <div className='mb-2 flex justify-start'>
      <Button
        className='-ml-2 px-2 font-normal text-muted-foreground hover:text-foreground'
        color='default'
        radius='md'
        render={<Link href={'/' as Route} />}
        size='sm'
        startContent={<ArrowLeftIcon size={16} />}
        variant='ghost'
      >
        Home
      </Button>
    </div>
  );
}

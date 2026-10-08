'use client';

import type { JSX } from 'react';

import { Check, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { Spinner } from '@courseroad/kurume-ui';

type SaveStatusState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusProps {
  errorMessage?: string;
  lastSavedAt?: Date | undefined;
  onRetry?: () => void;
  status: SaveStatusState;
}

export function SaveStatus({
  errorMessage = 'Failed to save',
  lastSavedAt,
  onRetry,
  status
}: SaveStatusProps): JSX.Element {
  return (
    <div className='flex h-9 items-center gap-2'>
      <AnimatePresence initial={false} mode='wait'>
        {status === 'saving' && (
          <motion.div
            key='saving'
            className='flex items-center gap-2 text-sm text-muted-foreground'
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Spinner size='sm' />
            <span>Saving</span>
          </motion.div>
        )}

        {status === 'saved' && (
          <motion.div
            key='saved'
            className='flex items-center gap-2 text-sm text-muted-foreground'
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Check className='h-4 w-4 text-emerald-500' />
            <span>Saved</span>
            {lastSavedAt && (
              <span className='hidden text-xs opacity-70 sm:inline'>
                {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key='error'
            className='flex items-center gap-2 text-sm text-destructive'
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <XCircle className='h-4 w-4' />
            <span>{errorMessage}</span>
            {onRetry && (
              <button className='ml-1 font-medium underline hover:no-underline' type='button' onClick={onRetry}>
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

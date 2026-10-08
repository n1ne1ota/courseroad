'use client';

import { useEffect, useState, useTransition } from 'react';

import { Badge, Sheet, SheetContent, SheetHeader, SheetTitle, Skeleton } from '@courseroad/kurume-ui';
import { formatDistanceToNow } from 'date-fns';

import type { VisitorSignals } from '@/features/analytics/types';

interface SignalInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  visitorId: string | null;
}

export function SignalInspector({ isOpen, onClose, visitorId }: SignalInspectorProps) {
  const [signals, setSignals] = useState<VisitorSignals | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen || !visitorId) return;

    startTransition(async () => {
      const response = await fetch(`/api/analytics/visitors/${encodeURIComponent(visitorId)}/signals`, {
        cache: 'no-store'
      });
      const res = await response.json();
      setSignals(res.data ?? null);
    });
  }, [isOpen, visitorId]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className='w-full max-w-full overflow-y-auto sm:w-[600px] sm:max-w-[600px]'>
        <SheetHeader className='mt-2 mb-6 px-4 sm:px-6'>
          <SheetTitle>Device Intelligence Inspector</SheetTitle>
          <p className='text-sm text-muted-foreground'>
            Raw telemetry for visitor{' '}
            {visitorId ? <code className='rounded bg-muted px-1 py-0.5 text-xs'>{visitorId.slice(0, 8)}</code> : ''}
          </p>
        </SheetHeader>

        {isPending ? (
          <div className='space-y-4 px-4 sm:px-6'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-40 w-full' />
          </div>
        ) : signals ? (
          <div className='space-y-6 px-4 pt-2 pb-10 sm:px-6'>
            {/* Network & Timestamps */}
            <div className='space-y-4 rounded-xl border bg-muted/20 p-5 shadow-sm transition-colors duration-300 hover:bg-muted/30'>
              <div className='flex items-center gap-2 border-b border-border/50 pb-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' />
                <h3 className='text-sm font-semibold tracking-tight'>Network & Status</h3>
              </div>
              <div className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>IP Address</span>
                  <span className='font-mono text-sm'>{signals.ipAddress ?? 'N/A'}</span>
                </div>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>Drift Occurrences</span>
                  <div>
                    <Badge
                      className={
                        signals.driftCount > 0
                          ? 'border-transparent bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                          : ''
                      }
                      variant={signals.driftCount > 0 ? 'default' : 'secondary'}
                    >
                      {signals.driftCount}
                    </Badge>
                  </div>
                </div>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>First Seen</span>
                  <span className='text-sm'>
                    {formatDistanceToNow(new Date(signals.firstSeenAt), { addSuffix: true })}
                  </span>
                </div>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>Last Seen</span>
                  <span className='text-sm'>
                    {formatDistanceToNow(new Date(signals.lastSeenAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Hardware */}
            <div className='space-y-4 rounded-xl border bg-muted/20 p-5 shadow-sm transition-colors duration-300 hover:bg-muted/30'>
              <h3 className='border-b border-border/50 pb-2 text-sm font-semibold tracking-tight'>
                Hardware Specification
              </h3>
              <div className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>Platform</span>
                  <span className='text-sm'>{signals.platform ?? 'Unknown'}</span>
                </div>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>Concurrency</span>
                  <span className='text-sm'>{signals.hardwareConcurrency ?? 'N/A'} Cores</span>
                </div>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>Device RAM</span>
                  <span className='text-sm'>{signals.deviceMemory ? `${signals.deviceMemory} GB` : 'N/A'}</span>
                </div>
                <div className='flex flex-col space-y-1'>
                  <span className='text-xs tracking-wider text-muted-foreground uppercase'>Screen Res</span>
                  <span className='font-mono text-sm'>
                    {signals.screenWidth && signals.screenHeight
                      ? `${signals.screenWidth}x${signals.screenHeight}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Biometrics */}
            <div className='space-y-4 rounded-xl border bg-muted/20 p-5 shadow-sm transition-colors duration-300 hover:bg-muted/30'>
              <h3 className='border-b border-border/50 pb-2 text-sm font-semibold tracking-tight'>Biometric Hashes</h3>
              <div className='grid grid-cols-1 gap-y-4 text-sm'>
                <div className='grid grid-cols-2 gap-x-4'>
                  <div className='flex flex-col space-y-1 overflow-hidden'>
                    <span className='text-xs tracking-wider text-muted-foreground uppercase'>Canvas Fingerprint</span>
                    <span
                      className='cursor-pointer truncate rounded-md border border-border/50 bg-background px-2 py-1.5 font-mono text-xs break-all transition-colors hover:bg-muted/50'
                      title={signals.canvasHash ?? ''}
                    >
                      {signals.canvasHash ?? 'N/A'}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1 overflow-hidden'>
                    <span className='text-xs tracking-wider text-muted-foreground uppercase'>Audio Fingerprint</span>
                    <span
                      className='cursor-pointer truncate rounded-md border border-border/50 bg-background px-2 py-1.5 font-mono text-xs break-all transition-colors hover:bg-muted/50'
                      title={signals.audioHash ?? ''}
                    >
                      {signals.audioHash ?? 'N/A'}
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
                  <div className='flex flex-col space-y-1 overflow-hidden'>
                    <span className='text-xs tracking-wider text-muted-foreground uppercase'>WebGL Vendor</span>
                    <span
                      className='truncate rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs'
                      title={signals.webglVendor ?? ''}
                    >
                      {signals.webglVendor ?? 'N/A'}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1 overflow-hidden'>
                    <span className='text-xs tracking-wider text-muted-foreground uppercase'>WebGL Renderer</span>
                    <span
                      className='truncate rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs'
                      title={signals.webglRenderer ?? ''}
                    >
                      {signals.webglRenderer ?? 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4 rounded-xl border bg-muted/20 p-5 shadow-sm transition-colors duration-300 hover:bg-muted/30'>
              <h3 className='border-b border-border/50 pb-2 text-sm font-semibold tracking-tight'>Signatures</h3>
              <div className='flex flex-col space-y-4 text-sm'>
                <div className='flex flex-col space-y-1.5'>
                  <span className='flex items-center justify-between text-xs tracking-wider text-muted-foreground uppercase'>
                    Stable Hash (Fast Index)
                  </span>
                  <code className='block rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-xs break-all text-foreground/80 shadow-inner'>
                    {signals.stableHash}
                  </code>
                </div>
                <div className='flex flex-col space-y-1.5'>
                  <span className='flex items-center justify-between text-xs tracking-wider text-muted-foreground uppercase'>
                    Full Hash (Exact Match)
                  </span>
                  <code className='block rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-xs break-all text-foreground/80 shadow-inner'>
                    {signals.fullHash}
                  </code>
                </div>
                <div className='flex flex-col space-y-1.5'>
                  <span className='flex items-center justify-between text-xs tracking-wider text-muted-foreground uppercase'>
                    User Agent
                  </span>
                  <code className='block rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-xs break-words text-foreground/80 shadow-inner'>
                    {signals.userAgent ?? 'N/A'}
                  </code>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex justify-center p-8 text-muted-foreground'>Failed to load signals.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}

'use client';

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Progress, ProgressLabel, ProgressValue, Spinner } from '@courseroad/kurume-ui';

import { AlertCircle } from 'lucide-react';

import { env } from '@/lib/config/env';
import { cn } from '@/lib/utils/cn';

import { organizationRequestHeaders } from '@/features/media/lib/organization-headers';

/**
 * Encoding usually finishes within a minute or two, and the video should appear as soon as it does, so poll often
 * at first. Later it is a stuck video rather than a slow one, so poll gently and stop once it has clearly stalled.
 */
const POLL_FAST_MS = 3_000;
const POLL_FAST_WINDOW_MS = 3 * 60_000;
const POLL_SLOW_MS = 10_000;
const POLL_GIVE_UP_MS = 10 * 60_000;

interface VideoPlayerProps {
  thumbnailUrl?: string;
  title?: string;
  url: string;
  /** Classes for the player frame, for example `rounded-none` when a card already clips its corners. */
  className?: string;
}

export function VideoPlayer({ className, title, url }: VideoPlayerProps): JSX.Element {
  // Derive video ID from the URL during render instead of in an effect
  const videoId = useMemo<string | null>(() => {
    try {
      const match = url.match(/\/([0-9a-fA-F-]{36})\//) || url.match(/\/([0-9a-fA-F-]{36})/);
      return match?.[1] ?? null;
    } catch {
      console.error('Failed to parse video ID from URL:', url);
      return null;
    }
  }, [url]);

  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [encodeProgress, setEncodeProgress] = useState<number>(0);
  const [stalled, setStalled] = useState(false);
  const [checkKey, setCheckKey] = useState(0);

  useEffect(() => {
    if (!videoId) {
      setEmbedUrl('');
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let isActive = true;
    const startedAt = Date.now();

    function scheduleNextPoll() {
      const elapsed = Date.now() - startedAt;
      if (elapsed > POLL_GIVE_UP_MS) {
        setStalled(true);
        return;
      }
      const delay = elapsed < POLL_FAST_WINDOW_MS ? POLL_FAST_MS : POLL_SLOW_MS;
      timeoutId = setTimeout(function poll() {
        // A hidden tab has nobody to show progress to; check again later without a request.
        if (document.hidden) timeoutId = setTimeout(poll, POLL_SLOW_MS);
        else void fetchToken(true);
      }, delay);
    }

    async function fetchToken(isPolling = false) {
      // Only show full loading state on first load, not during polling
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/stream/token?videoId=${videoId}`, {
          headers: organizationRequestHeaders(),
          cache: 'no-store'
        });
        if (!isActive) return;

        if (res.ok) {
          const data = await res.json();
          // Update state with fresh data
          setStatus(data.status);
          setEncodeProgress(data.encodeProgress || 0);

          // Status 4 is "Finished"
          if (data.status === 4) {
            // Build Bunny iframe embed URL with token
            const iframeUrl = `https://iframe.mediadelivery.net/embed/${data.libraryId}/${videoId}?token=${data.token}&expires=${data.expires}&autoplay=false&preload=true&responsive=true`;
            setEmbedUrl(iframeUrl);
          } else if (data.status !== 5 && data.status !== 6) {
            // If not finished and not error/failed, poll again
            // Status: 0=Created, 1=Uploaded, 2=Processing, 3=Transcoding
            scheduleNextPoll();
          } else {
            // Error status
            setError('Video processing failed');
          }
        } else {
          const text = await res.text();
          setError(`Could not authorize playback: ${text}`);
        }
      } catch (err) {
        console.error('Failed to fetch playback token:', err);
        setError('Connection failed while loading video');
      } finally {
        if (isActive && !isPolling) setLoading(false);
      }
    }

    // Reset state and begin fetching for the new video ID
    setStatus(null);
    setEncodeProgress(0);
    setEmbedUrl('');
    setStalled(false);
    void fetchToken(false);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [videoId, checkKey]);

  if (!url) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-muted/20 text-muted-foreground'>
        No video selected
      </div>
    );
  }

  if (!videoId) {
    const isLibraryIdMissing = !env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID;
    if (isLibraryIdMissing) {
      return (
        <div className='flex aspect-video w-full items-center justify-center bg-black text-destructive'>
          Player configuration missing
        </div>
      );
    }

    return (
      <div className='flex aspect-video w-full items-center justify-center bg-black text-muted-foreground'>
        Invalid video URL
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-black text-muted-foreground'>
        <div className='flex flex-col items-center gap-2'>
          <Spinner size='lg' />
          <span className='text-sm'>Loading video</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-black p-4 text-center text-muted-foreground'>
        <div className='flex flex-col items-center gap-3'>
          <div className='rounded-full bg-destructive/10 p-3'>
            <AlertCircle className='h-6 w-6 text-destructive' />
          </div>
          <div className='space-y-1 text-sm'>
            <p className='font-medium text-white'>Playback Error</p>
            <p className='text-muted-foreground'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (stalled) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-black p-4 text-center text-muted-foreground'>
        <div className='flex flex-col items-center gap-3'>
          <div className='rounded-full bg-warning/10 p-3'>
            <AlertCircle className='h-6 w-6 text-warning' aria-hidden='true' />
          </div>
          <div className='space-y-1 text-sm'>
            <p className='font-medium text-white'>Still not ready</p>
            <p className='text-muted-foreground'>
              {status === 0
                ? 'This video never finished uploading. Replace it to try again.'
                : 'Processing is taking longer than expected.'}
            </p>
          </div>
          <Button type='button' size='sm' variant='outline' onClick={() => setCheckKey(key => key + 1)}>
            Check again
          </Button>
        </div>
      </div>
    );
  }

  // Show processing state if we have a status but it's not finished (4)
  if (status !== null && status !== 4) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-black p-6 text-muted-foreground'>
        <div className='dark flex w-full max-w-xs flex-col items-center gap-3 text-center'>
          {/* Bunny reports encode progress in coarse jumps, so the bar keeps moving instead of looking stuck. */}
          <Progress animation='stripes' value={encodeProgress > 0 ? encodeProgress : null}>
            <ProgressLabel>Processing video</ProgressLabel>
            {encodeProgress > 0 && <ProgressValue />}
          </Progress>
          <span className='text-xs text-muted-foreground'>It plays here as soon as it is ready.</span>
        </div>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className='flex aspect-video w-full items-center justify-center bg-black text-muted-foreground'>
        <div className='flex flex-col items-center gap-2'>
          <Spinner size='lg' />
          <span className='text-sm'>Loading player</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-md bg-black', className)}>
      <iframe
        className='h-full w-full border-0'
        allowFullScreen
        allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen'
        loading='lazy'
        src={embedUrl}
        title={title || 'Video player'}
      />
    </div>
  );
}

'use client';

import { showSuccessToast } from '@courseroad/iota-ui';
import { Button } from '@courseroad/kurume-ui';
import { Share2 as ShareIcon } from 'lucide-react';

import { useShare, type UseShareOptions } from '@/hooks/use-share';

export interface ShareButtonProps {
  className?: string;
  label?: string;
  shareData: UseShareOptions;
  size?: 'default' | 'icon' | 'lg' | 'sm';
  variant?: 'default' | 'destructive' | 'ghost' | 'link' | 'outline' | 'secondary';
}

/** Share app content through the browser share API or clipboard fallback. */
export function ShareButton({ className, label, shareData, size = 'default', variant = 'outline' }: ShareButtonProps) {
  const { share } = useShare();

  const handleShare = async () => {
    const result = await share(shareData);

    // The hook falls back to clipboard if navigator.share isn't supported,
    if (result === 'shared') showSuccessToast('Shared successfully!');
    else if (result === 'copied') showSuccessToast('Link copied!');
  };

  return (
    <Button className={className} size={size} variant={variant} onClick={handleShare}>
      <ShareIcon className='mr-2 h-4 w-4' />
      {label && <span>{label}</span>}
      {!label && <span className='sr-only'>Share</span>}
    </Button>
  );
}

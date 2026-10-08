'use client';

import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';
import { RefreshCw } from 'lucide-react';

import { VideoPlayer } from '@/features/media/video-player';
import { VideoUpload } from '@/features/media/video-upload';

type VideoStatus = {
  status: number;
  encodeProgress: number;
  hasMP4Fallback: boolean;
};

export default function VideoPlayerDemoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);

  const checkStatus = async (url: string) => {
    // Extract video ID
    const match = url.match(/\/([0-9a-fA-F-]{36})\//) || url.match(/\/([0-9a-fA-F-]{36})/);
    if (!match || !match[1]) return;

    const videoId = match[1];
    try {
      const res = await fetch(`/api/stream/video/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        setVideoStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadComplete = (url: string) => {
    setVideoUrl(url);
    checkStatus(url);
  };

  const handleReset = () => {
    setVideoUrl(null);
    setVideoStatus(null);
  };

  return (
    <div className='container mx-auto max-w-2xl py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Video Upload & Play PoC</CardTitle>
          <CardDescription>
            Upload a video to verify the full pipeline: Upload - Processing - Secure Playback
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {!videoUrl ? (
            <div className='space-y-4 rounded-lg border border-dashed p-6'>
              <h3 className='mb-4 text-center font-medium'>Step 1: Upload Video</h3>
              <VideoUpload folder='demo-uploads' onUploadComplete={handleUploadComplete} />
            </div>
          ) : (
            <div className='animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4'>
              <div className='flex items-center justify-between'>
                <h3 className='font-medium'>Step 2: Secure Playback</h3>
                <div className='flex gap-2'>
                  <Button size='sm' variant='secondary' onClick={() => videoUrl && checkStatus(videoUrl)}>
                    Check Status
                  </Button>
                  <Button size='sm' variant='outline' onClick={handleReset}>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Start Over
                  </Button>
                </div>
              </div>

              <div className='overflow-hidden rounded-lg border bg-black shadow-lg'>
                <VideoPlayer title='Demo Video' url={videoUrl} />
              </div>

              <div className='space-y-2 rounded bg-muted p-3 font-mono text-xs break-all'>
                <p>
                  <strong>Video URL:</strong> {videoUrl}
                </p>
                {videoStatus && (
                  <div className='mt-2 border-t pt-2'>
                    <p>
                      <strong>Status:</strong> {videoStatus.status} (0=Queued, 1=Processing, 2=Encoding, 3=Finished,
                      4=Failed)
                    </p>
                    <p>
                      <strong>Encode Progress:</strong> {videoStatus.encodeProgress}%
                    </p>
                    <p>
                      <strong>Has MP4:</strong> {String(videoStatus.hasMP4Fallback)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

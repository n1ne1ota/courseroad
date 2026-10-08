'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@courseroad/kurume-ui';

import { ImageUpload } from '@/features/media/image-upload';
import { VideoUpload } from '@/features/media/video-upload';

export default function UploadDemoPage() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className='container mx-auto max-w-4xl space-y-8 py-10'>
      <h1 className='text-3xl font-bold'>Upload Component Demo</h1>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Video Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUpload onUploadComplete={setVideoUrl} />
            {videoUrl && (
              <div className='mt-4 rounded-md bg-muted p-2 font-mono text-xs break-all'>Uploaded: {videoUrl}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload scope='demo' value={imageUrl} onChange={setImageUrl} />
            {imageUrl && (
              <div className='mt-4 rounded-md bg-muted p-2 font-mono text-xs break-all'>Uploaded: {imageUrl}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pre-filled State Demo */}
      <div className='grid gap-8 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Image Upload (Pre-filled)</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              scope='demo'
              value='https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80'
              onChange={() => {}}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

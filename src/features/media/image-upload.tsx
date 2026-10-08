'use client';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import Image from 'next/image';

import type { Body, Meta, UppyFile } from '@uppy/core';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ImageCropperModal
} from '@courseroad/kurume-ui';
import UppyCompressor from '@uppy/compressor';
import UppyCore from '@uppy/core';
import UppyXHRUpload from '@uppy/xhr-upload';
import { CheckCircle2, Edit, ImageIcon, MoreVertical, Trash2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import type { ImageUploadScope } from '@/lib/constants/image-upload';
import { logs } from '@/lib/logging/client';
import { organizationRequestHeaders } from '@/lib/routes/organization-headers';
import { cn } from '@/lib/utils/cn';

type ImageUploadProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  fileName?: string;
  fileSize?: number;
  scope?: ImageUploadScope;
};

type UploadResponse = {
  url?: string;
  error?: string;
};

type UppyUploadProgress = {
  bytesUploaded: number;
  bytesTotal: number | null;
};

type UploadSuccessEventData = {
  body?: UploadResponse;
  status?: number;
};

type UppyEventHandlers = {
  'file-added': (file: UppyFile<Meta, Body>) => void;
  'file-removed': (file: UppyFile<Meta, Body> | undefined) => void;
  upload: () => void;
  'upload-progress': (file: UppyFile<Meta, Body> | undefined, progress: UppyUploadProgress) => void;
  'upload-success': (file: UppyFile<Meta, Body> | undefined, response: UploadSuccessEventData) => void;
  'upload-error': (file: UppyFile<Meta, Body> | undefined, error: Error, response?: unknown) => void;
  complete: (result: unknown) => void;
  'restriction-failed': (file: UppyFile<Meta, Body> | undefined, error: Error) => void;
};

const getDerivedFileName = (initialFileName?: string, value?: string | null) => {
  if (initialFileName) return initialFileName;
  if (!value) return undefined;

  try {
    const urlStr = value.startsWith('http') ? value : `https://${value}`;
    const urlObj = new URL(urlStr);
    const pathSegments = urlObj.pathname.split('/');
    const extractedName = pathSegments[pathSegments.length - 1];

    return extractedName
      ? extractedName.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, '')
      : 'image.webp';
  } catch {
    return 'image.webp';
  }
};

export function ImageUpload({
  disabled,
  fileName: initialFileName,
  fileSize: initialFileSize,
  onChange,
  scope = 'course-cover',
  value
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileInQueue, setFileInQueue] = useState<UppyFile<Meta, Body> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<{ src: string; fileName: string } | null>(null);
  const [fetchedFileSize, setFetchedFileSize] = useState<{ size: number; url: string } | null>(null);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const derivedFileName = useMemo(() => getDerivedFileName(initialFileName, value), [initialFileName, value]);
  const fetchedSizeForValue = fetchedFileSize?.url === value ? fetchedFileSize?.size : null;
  const displayFileSize = fileInQueue?.size ?? initialFileSize ?? fetchedSizeForValue ?? null;

  useEffect(() => {
    if (value && !initialFileSize && !fileInQueue) {
      fetch(value, { method: 'HEAD' })
        .then(res => {
          const size = res.headers.get('Content-Length');
          if (size) setFetchedFileSize({ size: parseInt(size, 10), url: value });
        })
        .catch(err => logs.upload.error('Failed to get file size', err));
    }
  }, [value, initialFileSize, fileInQueue]);

  const uppy = useMemo(
    () =>
      new UppyCore<Meta, Body>({
        autoProceed: false,
        restrictions: {
          allowedFileTypes: ['image/png', 'image/jpeg', 'image/webp'],
          maxFileSize: 10 * 1024 * 1024,
          maxNumberOfFiles: 1
        }
      }),
    []
  );

  const removePreview = useEffectEvent(() => {
    if (!previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  });

  const notifyUploadSuccess = useEffectEvent((url: string) => {
    onChange(url);
    showSuccessToast('Image uploaded successfully!');
    setIsUploadComplete(true);
  });

  useEffect(() => {
    type UppyEventBridge<U> = {
      on<Event extends keyof UppyEventHandlers>(event: Event, handler: UppyEventHandlers[Event]): U;
      off<Event extends keyof UppyEventHandlers>(event: Event, handler: UppyEventHandlers[Event]): U;
    };

    const typedUppy = uppy as typeof uppy & UppyEventBridge<typeof uppy>;

    // Register plugins
    if (!uppy.getPlugin('Compressor')) {
      uppy.use(UppyCompressor, {
        mimeType: 'image/webp',
        quality: 0.85
      });
    }

    if (!uppy.getPlugin('XHRUpload')) {
      uppy.use(UppyXHRUpload, {
        allowedMetaFields: ['scope'],
        endpoint: '/api/storage/images',
        headers: () => organizationRequestHeaders(),
        fieldName: 'file',
        formData: true,
        getResponseData: (xhr: XMLHttpRequest) => {
          try {
            return JSON.parse(xhr.responseText);
          } catch {
            return {};
          }
        }
      });
    }

    // Event handlers
    const handleFileAdded: UppyEventHandlers['file-added'] = file => {
      uppy.setFileMeta(file.id, { scope });
      const updatedFile = uppy.getFile(file.id);
      if (updatedFile) setFileInQueue(updatedFile as UppyFile<Meta, Body>);
      else {
        setFileInQueue(file);
      }
      setIsUploadComplete(false);

      // Create preview URL
      if (file.data instanceof Blob) {
        const url = URL.createObjectURL(file.data);
        setPreviewUrl(url);
      }
    };

    const handleFileRemoved: UppyEventHandlers['file-removed'] = _file => {
      const files = uppy.getFiles();
      if (files.length === 0) {
        setFileInQueue(null);
        removePreview();
      }
      setUploadProgress(0);
      setIsUploadComplete(false);
    };

    const handleUploadStart: UppyEventHandlers['upload'] = () => {
      setIsUploading(true);
      setUploadProgress(0);
    };

    const handleUploadProgress: UppyEventHandlers['upload-progress'] = (_file, progress) => {
      if (progress.bytesTotal && progress.bytesTotal > 0) {
        const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100);
        setUploadProgress(percentage);
      }
    };

    const handleUploadSuccess: UppyEventHandlers['upload-success'] = (_file, response) => {
      const url = response?.body?.url;
      if (url) {
        notifyUploadSuccess(url);
      } else {
        showErrorToast('Upload succeeded but no URL was returned');
      }
    };

    const handleUploadError: UppyEventHandlers['upload-error'] = (_file, error, _response) => {
      const errorMessage = error?.message || 'Upload failed';
      setIsUploading(false);
      showErrorToast(`Upload failed: ${errorMessage}`);
    };

    const handleComplete: UppyEventHandlers['complete'] = () => {
      setIsUploading(false);
      setUploadProgress(0);
    };

    const handleRestrictionFailed: UppyEventHandlers['restriction-failed'] = (_file, error) => {
      showErrorToast(error.message);
    };

    // Register event listeners
    typedUppy.on('file-added', handleFileAdded);
    typedUppy.on('file-removed', handleFileRemoved);
    typedUppy.on('upload', handleUploadStart);
    typedUppy.on('upload-progress', handleUploadProgress);
    typedUppy.on('upload-success', handleUploadSuccess);
    typedUppy.on('upload-error', handleUploadError);
    typedUppy.on('complete', handleComplete);
    typedUppy.on('restriction-failed', handleRestrictionFailed);

    // Cleanup
    return () => {
      typedUppy.off('file-added', handleFileAdded);
      typedUppy.off('file-removed', handleFileRemoved);
      typedUppy.off('upload', handleUploadStart);
      typedUppy.off('upload-progress', handleUploadProgress);
      typedUppy.off('upload-success', handleUploadSuccess);
      typedUppy.off('upload-error', handleUploadError);
      typedUppy.off('complete', handleComplete);
      typedUppy.off('restriction-failed', handleRestrictionFailed);
      // Don't cancel uploads on cleanup, only on unmount
      // uppy.cancelAll();
    };
  }, [scope, uppy]);

  // react-dropzone setup
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    disabled: disabled || isUploading || !!value || !!fileInQueue,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    noClick: value && !fileInQueue ? true : false, // Disable default click on root if showing current thumbnail (we handle it manually or let it bubble if we want, but here we want specific behavior)
    onDrop: acceptedFiles => {
      acceptedFiles.forEach(file => {
        uppy.addFile({
          data: file,
          name: file.name,
          source: 'react-dropzone',
          type: file.type
        });
      });
    },
    onDropRejected: rejections => {
      rejections.forEach(rejection => {
        const error = rejection.errors[0];
        if (error) showErrorToast(error.message);
      });
    }
  });

  const handleUpload = () => {
    if (fileInQueue && !isUploading) uppy.upload();
  };

  const handleClear = () => {
    uppy.cancelAll();
    uppy.getFiles().forEach(file => uppy.removeFile(file.id));
    onChange(null);
    setFileInQueue(null);
    setUploadProgress(0);
    setIsUploadComplete(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleEdit = () => {
    if (!fileInQueue || !previewUrl) return;
    setEditingFile({
      fileName: fileInQueue.name || 'image.webp',
      src: previewUrl
    });
  };

  const handleCropSave = (blob: Blob, fileName: string) => {
    if (!fileInQueue) return;

    // Remove the old file from Uppy
    uppy.removeFile(fileInQueue.id);

    // Add the new cropped file
    const newFile = uppy.addFile({
      data: blob,
      name: fileName,
      source: 'image-cropper',
      type: blob.type || 'image/webp'
    });

    // Update preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const newPreviewUrl = URL.createObjectURL(blob);
    setPreviewUrl(newPreviewUrl);

    // Update the file in queue with the new file
    const updatedFile = uppy.getFile(newFile);
    if (updatedFile) {
      uppy.setFileMeta(updatedFile.id, { scope });
      setFileInQueue(updatedFile as UppyFile<Meta, Body>);
    }

    showSuccessToast('Image edited successfully!');
  };

  return (
    <div className='space-y-3'>
      {/* Dropzone or Immersive Preview */}
      {!fileInQueue && !value ? (
        <div
          {...getRootProps()}
          className={cn(
            // Layout & Size
            'flex aspect-video w-full flex-col items-center justify-center',
            // Spacing
            'px-6 py-10',
            // Background & Borders
            'rounded-lg border-2 border-solid border-border bg-transparent',
            // Effects & Transitions
            'cursor-pointer transition-all duration-200',
            // States & Variants
            isDragActive ? 'border-dashed border-primary bg-primary/8' : 'hover:border-primary hover:bg-primary/3',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <ImageIcon
            className={cn(
              // Layout & Size
              'mb-4 h-12 w-12',
              // Typography
              'text-muted-foreground'
            )}
          />
          <p
            className={cn(
              // Spacing
              'mb-2',
              // Typography
              'text-center text-sm font-medium text-foreground'
            )}
          >
            {isDragActive ? 'Drop thumbnail here' : 'Drop thumbnail here or browse files'}
          </p>
          <p
            className={cn(
              // Typography
              'text-center text-xs text-muted-foreground'
            )}
          >
            PNG, JPG, WEBP up to 10 MB
          </p>
        </div>
      ) : (
        <div className='group relative flex aspect-video w-full flex-col overflow-hidden rounded-lg border border-border bg-black/95'>
          {/* Main Image Preview */}
          <div className='absolute inset-0 flex items-center justify-center p-4'>
            {(previewUrl || value) && (
              <Image
                className='h-full w-full object-contain'
                fill
                src={(() => {
                  const src = previewUrl || value || '';
                  if (!src) return '';
                  if (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('/')) return src;
                  try {
                    // Try to parse as URL to check if it has protocol
                    new URL(src);
                    return src;
                  } catch {
                    // If parsing fails, likely missing protocol
                    return `https://${src}`;
                  }
                })()}
                alt='Preview'
              />
            )}
          </div>

          {/* Top Right Status Badge */}
          {(isUploadComplete || (value && !fileInQueue)) && (
            <div className='absolute top-4 right-4 z-20 animate-in duration-300 fade-in zoom-in'>
              <div className='flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 backdrop-blur-sm'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Uploaded
              </div>
            </div>
          )}

          {/* Bottom Overlay Bar */}
          <div className='absolute right-0 bottom-0 left-0 z-20 border-t border-white/10 bg-black/60 p-4 backdrop-blur-xl'>
            {isUploading && uploadProgress > 0 ? (
              /* Upload Progress Bar (Replaces Info Bar) */
              <div className='flex h-10 animate-in flex-col justify-center space-y-2 duration-300 fade-in slide-in-from-bottom-2'>
                <div className='flex items-center justify-between text-xs text-white/70'>
                  <span className='flex items-center gap-2'>
                    <div className='h-2 w-2 animate-pulse rounded-full bg-primary' />
                    Uploading <span className='text-white/50'>—</span> {fileInQueue?.name || derivedFileName}
                  </span>
                  <span className='font-mono'>{uploadProgress}%</span>
                </div>
                <div className='h-1 w-full overflow-hidden rounded-full bg-white/10'>
                  <div
                    className='h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-300 ease-out'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* File Info & Actions */
              <div className='flex h-10 animate-in items-center gap-4 duration-300 fade-in slide-in-from-bottom-2'>
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <p
                    className='truncate text-sm font-medium text-white/90'
                    title={
                      fileInQueue?.name ||
                      derivedFileName ||
                      value
                        ?.split('/')
                        .pop()
                        ?.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, '')
                    }
                  >
                    {fileInQueue?.name ||
                      derivedFileName ||
                      value
                        ?.split('/')
                        .pop()
                        ?.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, '')}
                  </p>
                  <div className='flex items-center gap-2 text-xs text-white/50'>
                    {displayFileSize && <span>{(displayFileSize / 1024 / 1024).toFixed(2)} MB</span>}
                    {fileInQueue && !isUploadComplete && (
                      <>
                        <span>•</span>
                        <span className='text-green-400'>Ready to upload</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2'>
                  {/* Show Upload button if file is queued but not uploaded */}
                  {fileInQueue && !isUploadComplete && (
                    <Button
                      className='h-8 border-white/10 bg-white/10 text-white hover:bg-white/20'
                      type='button'
                      disabled={disabled || isUploading}
                      size='sm'
                      variant='secondary'
                      onClick={handleUpload}
                    >
                      <Upload className='mr-2 h-3.5 w-3.5' />
                      Upload
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className='h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white'
                        type='button'
                        disabled={disabled || isUploading}
                        size='icon'
                        variant='ghost'
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-auto' align='end'>
                      {/* Allow Edit only if we have a file in queue (frontend crop) OR if we implement remote crop later. For now, only queued files */}
                      {fileInQueue && (
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className='text-destructive focus:bg-destructive/10 focus:text-destructive'
                        onClick={handleClear}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {editingFile && (
        <ImageCropperModal
          imageFileName={editingFile.fileName}
          imageSrc={editingFile.src}
          open={!!editingFile}
          onOpenChange={open => {
            if (!open) setEditingFile(null);
          }}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}

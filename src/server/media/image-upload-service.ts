import 'server-only';

import { buildStoragePath, IMAGE_UPLOAD_SCOPES, type ImageUploadScope } from '@/lib/constants/image-upload';

import { env } from '@/server/config/env';
import { logs } from '@/server/logging/server';
import { STORAGE_UPLOAD_URL } from '@/server/media/stream-service';

const IMAGE_UPLOAD_MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
} as const;

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

type UploadScopedImageArgs = {
    file: File;
    organizationId: string;
    requestId: string;
    scope: unknown;
    userId: string;
};

type UploadScopedImageResult = {
    fileName: string;
    fileSize: number;
    path: string;
    url: string;
};

export class UploadRouteError extends Error {
    details?: unknown;
    status: number;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'UploadRouteError';
        this.status = status;
        this.details = details;
    }
}

export function assertValidImageUploadScope(scope: unknown): asserts scope is ImageUploadScope {
    if (typeof scope !== 'string' || !(scope in IMAGE_UPLOAD_SCOPES)) {
        throw new UploadRouteError('Invalid upload scope', 400);
    }

    const config = IMAGE_UPLOAD_SCOPES[scope as ImageUploadScope];
    if ('devOnly' in config && config.devOnly && process.env.NODE_ENV !== 'development') {
        throw new UploadRouteError('Invalid upload scope', 400);
    }
}

export function assertValidImageFile(file: unknown): asserts file is File {
    if (!(file instanceof File)) {
        throw new UploadRouteError('Missing file', 400);
    }

    if (!(file.type in IMAGE_UPLOAD_MIME_TYPES)) {
        throw new UploadRouteError('Unsupported file type', 400);
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        throw new UploadRouteError('File exceeds 10 MB limit', 400);
    }
}

function sanitizeFileName(fileName: string, mimeType: keyof typeof IMAGE_UPLOAD_MIME_TYPES): string {
    const fallbackExtension = IMAGE_UPLOAD_MIME_TYPES[mimeType];
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const normalizedBase =
        baseName
            .normalize('NFKD')
            .replace(/[^\x00-\x7F]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'image';

    return `${normalizedBase}.${fallbackExtension}`;
}

export async function uploadScopedImage({
    file,
    organizationId,
    requestId,
    scope,
    userId
}: UploadScopedImageArgs): Promise<UploadScopedImageResult> {
    assertValidImageUploadScope(scope);
    assertValidImageFile(file);

    const cdnBaseUrl = env.NEXT_PUBLIC_BUNNY_STORAGE_CDN;
    if (!cdnBaseUrl) {
        throw new UploadRouteError('Storage CDN is not configured', 500);
    }

    const sanitizedFileName = sanitizeFileName(file.name, file.type as keyof typeof IMAGE_UPLOAD_MIME_TYPES);
    const path = buildStoragePath(organizationId, scope, sanitizedFileName);

    logs.upload.info('Scoped image upload validated', {
        fileName: file.name,
        generatedPath: path,
        organizationId,
        requestId,
        sanitizedFileName,
        scope,
        size: file.size,
        type: file.type,
        uploadType: 'image',
        userId
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const target = STORAGE_UPLOAD_URL(path);

    logs.upload.info('Scoped image upload to storage starting', {
        generatedPath: path,
        organizationId,
        requestId,
        scope,
        target,
        uploadType: 'image',
        userId
    });

    const uploadRes = await fetch(target, {
        body: buffer,
        headers: {
            AccessKey: env.BUNNY_STORAGE_API_KEY,
            'Content-Length': String(buffer.length),
            'Content-Type': file.type
        },
        method: 'PUT'
    });

    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        const errorCode = uploadRes.headers.get('Bunny-Storage-Error-Code');
        const storageHeaders = Object.fromEntries(uploadRes.headers.entries());

        throw new UploadRouteError(`Storage upload failed: ${uploadRes.status}`, 502, {
            storageResponse: {
                body: text,
                errorCode,
                headers: storageHeaders,
                status: uploadRes.status
            },
            generatedPath: path,
            organizationId,
            scope
        });
    }

    return {
        fileName: file.name,
        fileSize: file.size,
        path,
        url: `${cdnBaseUrl}/${path}`
    };
}

export async function uploadBase64Image({
    base64DataUrl,
    prefixId,
    scope,
    userId
}: {
    base64DataUrl: string;
    prefixId: string;
    scope: ImageUploadScope;
    userId: string;
}): Promise<string> {
    const arr = base64DataUrl.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid base64 image data URL: missing comma');
    }
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mimeType = (mimeMatch && mimeMatch[1]) || 'image/jpeg';

    if (!(mimeType in IMAGE_UPLOAD_MIME_TYPES)) {
        throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    const extension = IMAGE_UPLOAD_MIME_TYPES[mimeType as keyof typeof IMAGE_UPLOAD_MIME_TYPES];
    const base64Data = arr[1];
    if (!base64Data || base64Data.trim() === '') {
        throw new Error('Base64 payload is empty');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const cdnBaseUrl = env.NEXT_PUBLIC_BUNNY_STORAGE_CDN;
    if (!cdnBaseUrl) {
        throw new Error('Storage CDN is not configured');
    }

    const filename = `avatar.${extension}`;
    const path = buildStoragePath(prefixId, scope, filename);
    const target = STORAGE_UPLOAD_URL(path);

    logs.upload.info('Base64 image upload to storage starting', {
        generatedPath: path,
        prefixId,
        scope,
        target,
        uploadType: 'image',
        userId
    });

    const uploadRes = await fetch(target, {
        body: buffer,
        headers: {
            AccessKey: env.BUNNY_STORAGE_API_KEY,
            'Content-Length': String(buffer.length),
            'Content-Type': mimeType
        },
        method: 'PUT'
    });

    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        const errorCode = uploadRes.headers.get('Bunny-Storage-Error-Code');
        const storageHeaders = Object.fromEntries(uploadRes.headers.entries());

        throw new UploadRouteError(`Storage upload failed: ${uploadRes.status}`, 502, {
            storageResponse: {
                body: text,
                errorCode,
                headers: storageHeaders,
                status: uploadRes.status
            },
            generatedPath: path,
            prefixId,
            scope
        });
    }

    return `${cdnBaseUrl}/${path}`;
}

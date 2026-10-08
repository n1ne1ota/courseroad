vi.mock('@/server/auth/organization-context', () => ({
    getOrganizationContext: async () => ({ organizationId: 'org-test' })
}));
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.fn();
const mockProtect = vi.fn();
const mockWithRule = vi.fn();
const mockFetch = vi.fn();

vi.mock('server-only', () => ({}));

vi.mock('node:crypto', () => ({
    default: {
        randomUUID: () => 'uuid-test'
    }
}));

vi.mock('@arcjet/next', () => ({
    detectBot: vi.fn(() => 'detectBotRule'),
    slidingWindow: vi.fn(() => 'slidingWindowRule')
}));

vi.mock('@/server/auth/auth', () => ({
    auth: {
        api: {
            getSession: mockGetSession
        }
    }
}));

vi.mock('@/server/security/security-service', () => {
    const chainable = {
        protect: mockProtect,
        withRule: mockWithRule
    };

    mockWithRule.mockImplementation(() => chainable);

    return {
        default: chainable
    };
});

vi.mock('@/server/config/env', () => ({
    env: {
        BUNNY_STORAGE_API_KEY: 'storage-key',
        NEXT_PUBLIC_BUNNY_STORAGE_CDN: 'https://cdn.example.com'
    }
}));

vi.mock('@/server/media/stream-service', () => ({
    STORAGE_UPLOAD_URL: (relativePath: string) => `https://storage.example.com/${relativePath}`
}));

vi.mock('@/server/logging/server', () => ({
    logs: {
        upload: {
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warn: vi.fn()
        }
    }
}));

vi.mock('@/lib/utils/request-id', () => ({
    getRequestIdFromRequest: () => 'req-test'
}));

const { POST } = await import('@/app/api/storage/images/route');

function createRequest(scope?: string, file?: File) {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (scope) formData.append('scope', scope);

    return {
        formData: async () => formData,
        headers: new Headers()
    };
}

describe('storage images route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', mockFetch);

        mockGetSession.mockResolvedValue({
            session: {
                activeOrganizationId: 'org-test'
            },
            user: {
                id: 'user-1',
                role: 'creator'
            }
        });

        mockProtect.mockResolvedValue({
            isDenied: () => false,
            reason: {
                isRateLimit: () => false
            }
        });

        mockFetch.mockResolvedValue(
            new Response('', {
                status: 201
            })
        );
    });

    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValueOnce(null);

        const response = await POST(
            createRequest('quiz-thumbnail', new File(['png'], 'thumb.png', { type: 'image/png' })) as never
        );

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 429 when Arcjet rate-limits the request', async () => {
        mockProtect.mockResolvedValueOnce({
            isDenied: () => true,
            reason: {
                isRateLimit: () => true
            }
        });

        const response = await POST(
            createRequest('quiz-thumbnail', new File(['png'], 'thumb.png', { type: 'image/png' })) as never
        );

        expect(response.status).toBe(429);
        await expect(response.json()).resolves.toEqual({ error: 'Too Many Requests' });
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 400 for an invalid upload scope', async () => {
        const response = await POST(
            createRequest('not-a-scope', new File(['png'], 'thumb.png', { type: 'image/png' })) as never
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: 'Invalid upload scope' });
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('uploads to Bunny storage using a generated scoped object key', async () => {
        const response = await POST(
            createRequest('quiz-thumbnail', new File(['png'], 'My Thumbnail.png', { type: 'image/png' })) as never
        );
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            fileName: 'My Thumbnail.png',
            fileSize: 3,
            path: 'org-test/quiz-thumbnails/uuid-test-my-thumbnail.png',
            url: 'https://cdn.example.com/org-test/quiz-thumbnails/uuid-test-my-thumbnail.png'
        });

        expect(mockFetch).toHaveBeenCalledWith(
            'https://storage.example.com/org-test/quiz-thumbnails/uuid-test-my-thumbnail.png',
            {
                body: expect.any(Buffer),
                headers: {
                    AccessKey: 'storage-key',
                    'Content-Length': '3',
                    'Content-Type': 'image/png'
                },
                method: 'PUT'
            }
        );
    });
});

import 'server-only';

import type { NextRequest } from 'next/server';

import { handleImageUploadRequest } from '@/features/media/server/http/storage/images/route';

export async function POST(req: NextRequest) {
    return handleImageUploadRequest(req, 'course-cover');
}

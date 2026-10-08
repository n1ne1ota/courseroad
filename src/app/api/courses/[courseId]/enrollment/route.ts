import { getEnrollmentStatus } from '@/features/course/server/enrollment';
import { privateRead } from '@/server/http/private-read';

export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
    return privateRead(async () => getEnrollmentStatus((await params).courseId));
}

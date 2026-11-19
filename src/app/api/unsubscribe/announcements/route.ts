import { unsubscribeAnnouncementEmails } from '@/features/blog/server/workflows/announcements';

/**
 * One-click unsubscribe, the target of the `List-Unsubscribe` header. Mail clients POST here without a session; the
 * signed token in the URL is the credential. A GET never changes anything.
 */
export async function POST(request: Request) {
    const token = new URL(request.url).searchParams.get('token');
    const ok = await unsubscribeAnnouncementEmails(token);
    return new Response(ok ? 'Unsubscribed' : 'Invalid link', { status: ok ? 200 : 400 });
}

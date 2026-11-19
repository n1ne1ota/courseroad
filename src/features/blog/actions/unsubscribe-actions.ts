'use server';

import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { unsubscribeAnnouncementEmails } from '@/features/blog/server/workflows/announcements';

/** The confirm button on the unsubscribe page. Works signed out: the signed token is the credential. */
export async function confirmAnnouncementUnsubscribe(formData: FormData) {
    const token = formData.get('token');
    const ok = await unsubscribeAnnouncementEmails(typeof token === 'string' ? token : null);
    redirect(`/unsubscribe/announcements?status=${ok ? 'done' : 'invalid'}` as Route);
}

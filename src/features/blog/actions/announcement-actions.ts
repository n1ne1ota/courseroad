'use server';

import * as announcements from '@/features/blog/server/workflows/announcements';

export async function createAnnouncement(...args: Parameters<typeof announcements.createAnnouncementAction>) {
    return announcements.createAnnouncementAction(...args);
}
export async function updateAnnouncement(...args: Parameters<typeof announcements.updateAnnouncementAction>) {
    return announcements.updateAnnouncementAction(...args);
}
export async function pinAnnouncement(...args: Parameters<typeof announcements.pinAnnouncementAction>) {
    return announcements.pinAnnouncementAction(...args);
}
export async function deleteAnnouncement(...args: Parameters<typeof announcements.deleteAnnouncementAction>) {
    return announcements.deleteAnnouncementAction(...args);
}
export async function publishAnnouncement(...args: Parameters<typeof announcements.publishAnnouncementAction>) {
    return announcements.publishAnnouncementAction(...args);
}
export async function markAnnouncementRead(...args: Parameters<typeof announcements.markAnnouncementReadAction>) {
    return announcements.markAnnouncementReadAction(...args);
}
export async function loadAnnouncementFeed(...args: Parameters<typeof announcements.loadFeedAction>) {
    return announcements.loadFeedAction(...args);
}
export async function setAnnouncementEmailPreference(
    ...args: Parameters<typeof announcements.setAnnouncementEmailPreferenceAction>
) {
    return announcements.setAnnouncementEmailPreferenceAction(...args);
}

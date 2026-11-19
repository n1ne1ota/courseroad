'use server';

import * as publishing from '@/features/course/server/workflows/publishing-actions';

export async function readPlatformPublishing(...args: Parameters<typeof publishing.readPlatformPublishing>) {
    return publishing.readPlatformPublishing(...args);
}
export async function readOrganizationPublishing(...args: Parameters<typeof publishing.readOrganizationPublishing>) {
    return publishing.readOrganizationPublishing(...args);
}
export async function changePlatformPublishing(...args: Parameters<typeof publishing.changePlatformPublishing>) {
    return publishing.changePlatformPublishing(...args);
}
export async function changeOrganizationPublishing(
    ...args: Parameters<typeof publishing.changeOrganizationPublishing>
) {
    return publishing.changeOrganizationPublishing(...args);
}
export async function changePlatformVisibility(...args: Parameters<typeof publishing.changePlatformVisibility>) {
    return publishing.changePlatformVisibility(...args);
}
export async function changeOrganizationVisibility(
    ...args: Parameters<typeof publishing.changeOrganizationVisibility>
) {
    return publishing.changeOrganizationVisibility(...args);
}

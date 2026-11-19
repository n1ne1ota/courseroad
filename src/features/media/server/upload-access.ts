import 'server-only';

import type { StorageOwner } from '@/lib/media/storage-layout';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError } from '@/server/auth/session';

type UploadContext = {
    organizationId: string | null;
    /** Ownership marker used in Stream video titles: `users/<id>` or the organization id. */
    prefixId: string;
    /** Who the files belong to, used for Storage paths. */
    owner: StorageOwner;
};

/** The URL organization is explicit; platform uploads never inherit a session's active tenant. */
export async function requireUploadContext(
    user: { id: string; role?: string | null },
    slug?: string
): Promise<UploadContext> {
    if (slug) {
        const { organizationId } = await getOrganizationContext(slug, 'creator');
        return { organizationId, owner: { kind: 'organization', organizationId }, prefixId: organizationId };
    }
    if (user.role?.toLowerCase() !== 'creator') throw new AccessError('Creator access required', 403);
    return { organizationId: null, owner: { kind: 'creator', userId: user.id }, prefixId: `users/${user.id}` };
}

import 'server-only';

import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized auth projection for CreatorDashboardProfilePage. */
export async function loadCreatorDashboardProfilePage() {
    const sessionUser = await getPlatformUser('CREATOR');
    const user = await prismaClient.user.findUniqueOrThrow({
        select: {
            bio: true,
            firstName: true,
            githubUrl: true,
            image: true,
            lastName: true,
            twitterUrl: true,
            username: true,
            websiteUrl: true
        },
        where: { id: sessionUser.id }
    });
    return { user };
}

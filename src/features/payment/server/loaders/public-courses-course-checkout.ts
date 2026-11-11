import 'server-only';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';

import { requireCoursePurchase } from '@/features/payment/server/access';
import { destination, missingResource } from '@/server/auth/read-errors';
import { getSession } from '@/server/auth/session';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized payment projection for CheckoutPage. */
export async function loadCheckoutPage(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    const courseId = params.courseId;
    const session = await getSession();
    if (!session?.user) {
        destination(`/api/auth/signin?callbackUrl=/courses/${courseId}/checkout`);
    }
    const course = await prismaClient.course.findUnique({
        include: {
            modules: { include: { lessons: true } }
        },
        where: { id: courseId }
    });
    if (!course || course.status !== 'Published') {
        missingResource();
    }
    await requireCoursePurchase(courseId);
    const creator = await prismaClient.user.findUnique({
        select: { firstName: true, lastName: true },
        where: { id: course.userId }
    });
    const imageUrl = resolveThumbnailUrl(course.thumbnailFileName);
    const creatorName = creator?.firstName ? `${creator.firstName} ${creator.lastName || ''}`.trim() : 'Instructor';
    const displayPrice = course.price ? `$${(course.price / 100).toFixed(2)}` : 'Free';
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    return { courseId, session, course, imageUrl, creatorName, displayPrice, totalLessons };
}

/** Verify the current user's existing purchase before initializing checkout. */
export async function getCheckoutEnrollment(courseId: string) {
    await requireCoursePurchase(courseId);
    const user = await getAuthenticatedUser();
    const enrollment = await prismaClient.enrollment.findUnique({
        where: { userId_courseId: { courseId, userId: user.id } },
        select: { id: true, course: { select: { organizationId: true } } }
    });
    if (!enrollment) return null;
    const org = enrollment.course.organizationId
        ? await prismaClient.organization.findUnique({
              where: { id: enrollment.course.organizationId },
              select: { slug: true }
          })
        : null;
    return org
        ? `/organization/${org.slug}/learner/dashboard/learn/${courseId}`
        : `/learner/dashboard/learn/${courseId}`;
}

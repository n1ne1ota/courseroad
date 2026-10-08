import { describe, expect, it } from 'vitest';

import { createOrgRoutes, getActiveRoleFromPath } from '@/lib/routes/org';

describe('B2B Organization Routes Helper', () => {
    describe('Given createOrgRoutes', () => {
        it('returns routes with correct prefixes for a given slug and role', () => {
            const orgSlug = 'test-academy';
            const ownerRoutes = createOrgRoutes(orgSlug, 'owner');
            const learnerRoutes = createOrgRoutes(orgSlug, 'learner');

            expect(ownerRoutes.base).toBe('/organization/test-academy');
            expect(ownerRoutes.roleBase).toBe('/organization/test-academy/owner');
            expect(ownerRoutes.dashboard).toBe('/organization/test-academy/owner/dashboard');
            expect(ownerRoutes.courses).toBe('/organization/test-academy/owner/dashboard/courses');
            expect(ownerRoutes.analytics).toBe('/organization/test-academy/owner/dashboard/analytics');
            expect(ownerRoutes.settings).toBe('/organization/test-academy/owner/dashboard/settings');
            expect(ownerRoutes.members).toBe('/organization/test-academy/owner/dashboard/members');
            expect(ownerRoutes.learners).toBe('/organization/test-academy/owner/dashboard/learners');
            expect(ownerRoutes.quizzes).toBe('/organization/test-academy/owner/dashboard/quizzes');

            expect(ownerRoutes.courseEdit('course-123')).toBe(
                '/organization/test-academy/owner/dashboard/courses/course-123'
            );
            expect(ownerRoutes.quizEditOrTake('quiz-789')).toBe(
                '/organization/test-academy/owner/dashboard/quizzes/quiz-789'
            );

            expect(learnerRoutes.roleBase).toBe('/organization/test-academy/learner');
            expect(learnerRoutes.dashboard).toBe('/organization/test-academy/learner/dashboard');
            expect(learnerRoutes.courses).toBe('/organization/test-academy/learner/dashboard/courses');
            expect(learnerRoutes.learn('course-123')).toBe(
                '/organization/test-academy/learner/dashboard/learn/course-123'
            );
            expect(learnerRoutes.learnLesson('course-123', 'lesson-456')).toBe(
                '/organization/test-academy/learner/dashboard/learn/course-123/lesson-456'
            );
        });
    });

    describe('Given getActiveRoleFromPath', () => {
        it('resolves owner role from owner paths', () => {
            expect(getActiveRoleFromPath('/organization/test-org/owner/dashboard')).toBe('owner');
            expect(getActiveRoleFromPath('/organization/test-org/owner/courses')).toBe('owner');
            expect(getActiveRoleFromPath('/organization/test-org/owner')).toBe('owner');
        });

        it('resolves learner role from learner paths', () => {
            expect(getActiveRoleFromPath('/organization/test-org/learner/dashboard')).toBe('learner');
            expect(getActiveRoleFromPath('/organization/test-org/learner/learn/123')).toBe('learner');
            expect(getActiveRoleFromPath('/organization/test-org/learner')).toBe('learner');
        });

        it('returns null for non-role B2B routes or other paths', () => {
            expect(getActiveRoleFromPath('/organization/test-org/dashboard')).toBeNull();
            expect(getActiveRoleFromPath('/dashboard/learner')).toBeNull();
            expect(getActiveRoleFromPath('/')).toBeNull();
        });
    });
});

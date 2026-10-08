import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, ownerAc } from 'better-auth/plugins/organization/access';

/**
 * Organization-scoped access control definitions for the Better Auth org plugin.
 *
 * These extend the default org statements (organization, member, invitation)
 * with Courseroad-specific resources (course, lesson, challenge).
 * The resulting `orgAc` controller and role definitions are passed to
 * both the server `organization()` plugin and the client `organizationClient()`.
 */

/**
 * The full permission statement matrix for organization-scoped resources.
 * Merges Better Auth's defaults (organization, member, invitation CRUD)
 * with Courseroad's content resources.
 */
export const orgStatement = {
    ...defaultStatements,
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete']
} as const;

export const orgAc = createAccessControl(orgStatement);

/**
 * Organization owner: full access to everything, including org management.
 */
export const orgOwner = orgAc.newRole({
    ...ownerAc.statements,
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete']
});

/**
 * Organization manager: manages academy members, invitations, settings.
 * Cannot delete the organization itself (owner-only).
 */
export const orgManager = orgAc.newRole({
    challenge: ['read'],
    course: ['read'],
    invitation: ['create', 'cancel'],
    lesson: ['read'],
    member: ['create', 'update', 'delete'],
    organization: ['update']
});

/**
 * Organization creator: full CRUD access to curriculum, courses, lessons, challenges.
 */
export const orgCreator = orgAc.newRole({
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete']
});

/**
 * Organization instructor: reviews progress, grades challenge/quiz submissions.
 */
export const orgInstructor = orgAc.newRole({
    challenge: ['read', 'update'],
    course: ['read'],
    lesson: ['read']
});

/**
 * Organization learner: read-only access to courses, lessons, challenges.
 */
export const orgLearner = orgAc.newRole({
    challenge: ['read'],
    course: ['read'],
    lesson: ['read']
});

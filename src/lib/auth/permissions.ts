import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Define the permissions statement matrix.
 * Using `as const` so TypeScript can infer the exact type structure.
 */
export const statement = {
    ...defaultStatements,
    // Custom resources for Courseroad
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete']
} as const;

export const ac = createAccessControl(statement);

// Role definitions
export const learner = ac.newRole({
    challenge: ['read'],
    course: ['read'],
    lesson: ['read']
});

export const creator = ac.newRole({
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete']
});

export const staff = ac.newRole({
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete'],
    // Staff gets limited admin statements by default, maybe not impersonate-admins
    ...adminAc.statements
});

export const admin = ac.newRole({
    challenge: ['create', 'read', 'update', 'delete'],
    course: ['create', 'read', 'update', 'delete'],
    lesson: ['create', 'read', 'update', 'delete'],
    ...adminAc.statements,
    user: ['impersonate-admins', ...adminAc.statements.user] // Give super admin access
});

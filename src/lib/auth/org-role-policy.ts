/** Shared single-role policy for organization administration and its UI controls. */
export const organizationMemberRoles = ['learner', 'instructor', 'creator', 'manager'] as const;
export type OrganizationMemberRole = (typeof organizationMemberRoles)[number];

export const organizationRoleLabels: Record<OrganizationMemberRole, string> = {
    creator: 'Creator',
    instructor: 'Instructor',
    learner: 'Learner',
    manager: 'Manager'
};

export function isOrganizationMemberRole(role: unknown): role is OrganizationMemberRole {
    return typeof role === 'string' && organizationMemberRoles.some(value => value === role);
}

/** The caller's membership, rather than their platform persona, determines assignment rights. */
export function canAssignOrganizationRole(actorRole: string, role: unknown): role is OrganizationMemberRole {
    return isOrganizationMemberRole(role) && (actorRole === 'owner' || (actorRole === 'manager' && role !== 'manager'));
}

export function assignableOrganizationRoles(actorRole: string): OrganizationMemberRole[] {
    return organizationMemberRoles.filter(role => canAssignOrganizationRole(actorRole, role));
}

/** Ordinary member controls never change ownership, peer managers, or the caller's own membership. */
export function canManageOrganizationMember(
    actor: { userId: string; role: string },
    target: { userId: string; role: string }
): boolean {
    return actor.userId !== target.userId && canAssignOrganizationRole(actor.role, target.role);
}

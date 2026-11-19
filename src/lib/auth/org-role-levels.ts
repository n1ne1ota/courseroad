export const organizationRoles = ['owner', 'manager', 'creator', 'instructor', 'learner'] as const;
export type OrgRoleLevel = (typeof organizationRoles)[number];

/** A required level admits that role and every role before it in `organizationRoles`. */
export function meetsOrganizationRole(actual: string, required: OrgRoleLevel) {
    const index = organizationRoles.indexOf(actual.toLowerCase() as OrgRoleLevel);
    return index >= 0 && index <= organizationRoles.indexOf(required);
}

/** Platform personas that an ordinary account may select without administrative access. */
export const selfServicePlatformRoles = ['learner', 'creator'] as const;

export function isSelfServicePlatformRole(role: unknown): role is (typeof selfServicePlatformRoles)[number] {
    return typeof role === 'string' && selfServicePlatformRoles.some(value => value === role);
}

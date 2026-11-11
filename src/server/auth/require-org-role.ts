import 'server-only';

import type { Route } from 'next';
import { notFound, redirect } from 'next/navigation';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError } from '@/server/auth/session';

import type { OrgRoleLevel } from '@/server/auth/organization-context';
export type { OrgRoleLevel };

/** Route adapter; authoritative checks also run at each DAL entry point. */
export async function requireOrgRole(role: OrgRoleLevel, redirectTo: Route = '/' as Route, slug?: string) {
    try {
        return await getOrganizationContext(slug, role);
    } catch (error) {
        if (error instanceof AccessError) {
            if (error.status === 401) redirect('/sign-in' as Route);
            if (error.status === 404) notFound();
            redirect(redirectTo);
        }
        throw error;
    }
}

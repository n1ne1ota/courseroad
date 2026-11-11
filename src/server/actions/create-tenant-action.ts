import 'server-only';

import type { z } from 'zod';

import { handleActionError, runWithValidation } from '@/server/actions/create-safe-action';
import { getOrganizationContext as requireOrgRole } from '@/server/auth/organization-context';

import type { OrgRoleLevel } from '@/server/auth/require-org-role';
import type { ActionState } from '@/types/action.types';

export type TenantContext = NonNullable<Awaited<ReturnType<typeof requireOrgRole>>>;

export function createTenantAction<S extends z.ZodType, T>(
    role: OrgRoleLevel,
    schema: S,
    handler: (validatedData: z.infer<S>, ctx: TenantContext) => Promise<T>
) {
    return async (data: unknown): Promise<ActionState<T>> => {
        try {
            const ctx = await requireOrgRole(undefined, role);
            return await runWithValidation<S, T, TenantContext>(data, schema, handler, ctx);
        } catch (error) {
            return handleActionError(error);
        }
    };
}

export function createTenantFormAction<S extends z.ZodType, T>(
    role: OrgRoleLevel,
    schema: S,
    handler: (validatedData: z.infer<S>, ctx: TenantContext) => Promise<T>
) {
    const action = async (...args: unknown[]): Promise<ActionState<T>> => {
        try {
            const ctx = await requireOrgRole(undefined, role);
            const data = args.length >= 3 ? args[0] : args.length === 2 ? args[1] : args[0];
            return await runWithValidation<S, T, TenantContext>(data, schema, handler, ctx);
        } catch (error) {
            return handleActionError(error);
        }
    };
    return action as unknown as (prevState: ActionState<T>, data: z.input<S>) => Promise<ActionState<T>>;
}

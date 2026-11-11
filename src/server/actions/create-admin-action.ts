import 'server-only';

import type { z } from 'zod';

import { handleActionError, runWithValidation } from '@/server/actions/create-safe-action';
import { requireRole } from '@/server/auth/require-role';

import type { ActionState } from '@/types/action.types';

export type AdminContext = { user: NonNullable<Awaited<ReturnType<typeof requireRole>>> };

export function createAdminAction<S extends z.ZodType, T>(
    schema: S,
    handler: (validatedData: z.infer<S>, ctx: AdminContext) => Promise<T>
) {
    return async (data: unknown): Promise<ActionState<T>> => {
        try {
            const user = await requireRole('admin');
            return await runWithValidation<S, T, AdminContext>(data, schema, handler, { user });
        } catch (error) {
            return handleActionError(error);
        }
    };
}

export function createAdminFormAction<S extends z.ZodType, T>(
    schema: S,
    handler: (validatedData: z.infer<S>, ctx: AdminContext) => Promise<T>
) {
    const action = async (...args: unknown[]): Promise<ActionState<T>> => {
        try {
            const user = await requireRole('admin');
            const data = args.length >= 3 ? args[0] : args.length === 2 ? args[1] : args[0];
            return await runWithValidation<S, T, AdminContext>(data, schema, handler, { user });
        } catch (error) {
            return handleActionError(error);
        }
    };
    return action as unknown as (prevState: ActionState<T>, data: z.input<S>) => Promise<ActionState<T>>;
}

import 'server-only';

import type { z } from 'zod';

import { handleActionError, runWithValidation } from '@/server/actions/create-safe-action';
import { getSession } from '@/server/auth/session';

import type { auth } from '@/server/auth/auth';
import type { ActionState } from '@/types/action.types';

export type AuthContext = typeof auth.$Infer.Session;

export function createAuthAction<S extends z.ZodType, T>(
    schema: S,
    handler: (validatedData: z.infer<S>, ctx: AuthContext) => Promise<T>
) {
    return async (data: unknown): Promise<ActionState<T>> => {
        try {
            const session = await getSession();

            if (!session?.user) {
                return { error: 'Unauthorized: Session required', success: false };
            }

            return await runWithValidation<S, T, AuthContext>(data, schema, handler, session);
        } catch (error) {
            return handleActionError(error);
        }
    };
}

export function createAuthFormAction<S extends z.ZodType, T>(
    schema: S,
    handler: (validatedData: z.infer<S>, ctx: AuthContext) => Promise<T>
) {
    const action = async (...args: unknown[]): Promise<ActionState<T>> => {
        try {
            const session = await getSession();

            if (!session?.user) {
                return { error: 'Unauthorized: Session required', success: false };
            }

            const data = args.length >= 3 ? args[0] : args.length === 2 ? args[1] : args[0];
            return await runWithValidation<S, T, AuthContext>(data, schema, handler, session);
        } catch (error) {
            return handleActionError(error);
        }
    };
    return action as unknown as (prevState: ActionState<T>, data: z.input<S>) => Promise<ActionState<T>>;
}

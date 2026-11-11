import 'server-only';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { z } from 'zod';

import { log } from '@/server/logging/server';

import type { ActionState } from '@/types/action.types';
export type { ActionState } from '@/types/action.types';

export function handleActionError<T = never>(error: unknown): ActionState<T> {
    const isNotFoundError = error instanceof Error && error.message === 'NEXT_NOT_FOUND';

    if (isRedirectError(error) || isNotFoundError) throw error;

    log.error('Safe action error', error);

    return {
        error: error instanceof Error ? error.message : 'Internal Server Error',
        success: false
    };
}

export async function runWithValidation<S extends z.ZodType, T, C = void>(
    data: unknown,
    schema: S,
    handler: C extends void
        ? (validatedData: z.infer<S>) => Promise<T>
        : (validatedData: z.infer<S>, ctx: C) => Promise<T>,
    ctx?: C
): Promise<ActionState<T>> {
    try {
        const result = schema.safeParse(data);

        if (!result.success) {
            return {
                error: 'Validation failed',
                fieldErrors: z.flattenError(result.error).fieldErrors,
                success: false
            };
        }

        const returnedData =
            ctx !== undefined
                ? await (handler as (validatedData: z.infer<S>, ctx: C) => Promise<T>)(result.data, ctx)
                : await (handler as (validatedData: z.infer<S>) => Promise<T>)(result.data);

        return {
            data: returnedData,
            success: true
        };
    } catch (error) {
        return handleActionError(error);
    }
}

export function createSafeAction<S extends z.ZodType, T>(
    schema: S,
    handler: (validatedData: z.infer<S>) => Promise<T>
) {
    return async (data: unknown): Promise<ActionState<T>> => {
        return runWithValidation(data, schema, handler);
    };
}

export function createSafeFormAction<S extends z.ZodType, T>(
    schema: S,
    handler: (validatedData: z.infer<S>) => Promise<T>
) {
    const action = async (...args: unknown[]): Promise<ActionState<T>> => {
        const data = args.length >= 3 ? args[0] : args.length === 2 ? args[1] : args[0];
        return runWithValidation(data, schema, handler);
    };
    return action as unknown as (prevState: ActionState<T>, data: z.input<S>) => Promise<ActionState<T>>;
}

export type ActionState<T> = {
    success: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

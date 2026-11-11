/** Browser contracts use the same string values as the persisted enum. */
export const QuestionType = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    CUSTOM_INPUT: 'CUSTOM_INPUT'
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
export const QuizVisibility = { DRAFT: 'DRAFT', PRIVATE: 'PRIVATE', PUBLIC: 'PUBLIC' } as const;
export type QuizVisibility = (typeof QuizVisibility)[keyof typeof QuizVisibility];

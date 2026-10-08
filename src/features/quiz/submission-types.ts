export type QuestionResult = {
    questionId: string;
    prompt: string;
    explanation: string | null;
    correct: boolean;
    submittedAnswer: string | string[];
    correctOptionIds: string[];
    correctTexts: string[];
};

export type SubmitQuizResult = {
    score: number;
    total: number;
    passed?: boolean;
    results: QuestionResult[];
};

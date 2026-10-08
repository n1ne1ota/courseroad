-- CreateEnum
CREATE TYPE "QuizVisibility" AS ENUM ('DRAFT', 'PUBLIC', 'PRIVATE');

-- AlterTable: replace isPublished with visibility enum
ALTER TABLE "quiz"
    DROP COLUMN IF EXISTS "isPublished",
    ADD COLUMN "visibility" "QuizVisibility" NOT NULL DEFAULT 'DRAFT';

-- AlterTable: add optional title to quiz_question
ALTER TABLE "quiz_question"
    ADD COLUMN IF NOT EXISTS "title" VARCHAR(200);

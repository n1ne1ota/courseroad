-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'TEACHER', 'PRO_STUDENT', 'STUDENT');

-- CreateEnum
CREATE TYPE "ChallengeLanguage" AS ENUM ('JavaScript', 'TypeScript', 'Python', 'Rust', 'Go');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('Draft', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('Draft', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('Purchase', 'AdminGrant', 'Free', 'Subscription');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('Pending', 'Paid', 'Refunded', 'Failed');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'CUSTOM_INPUT');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "uid" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeAccountId" TEXT,
    "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "hasPaidActivationFee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_challenge" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "starterCode" TEXT,
    "solution" TEXT,
    "language" "ChallengeLanguage" NOT NULL DEFAULT 'JavaScript',
    "difficulty" "ChallengeDifficulty" NOT NULL DEFAULT 'Easy',
    "status" "ChallengeStatus" NOT NULL DEFAULT 'Draft',
    "courseId" UUID,
    "lessonId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_submission" (
    "id" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "fileKey" TEXT,
    "thumbnailFileName" TEXT,
    "thumbnailFileSize" INTEGER,
    "introVideoUrl" TEXT,
    "introVideoFileName" TEXT,
    "introVideoFileSize" INTEGER,
    "introVideoThumbnailUrl" TEXT,
    "introVideoThumbnailFileName" TEXT,
    "introVideoThumbnailFileSize" INTEGER,
    "category" TEXT,
    "slug" TEXT NOT NULL,
    "price" INTEGER,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "level" "CourseLevel",
    "status" "CourseStatus" NOT NULL DEFAULT 'Draft',

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "courseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "videoThumbnailUrl" TEXT,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "moduleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "source" "EnrollmentSource" NOT NULL DEFAULT 'Purchase',
    "accessExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'Paid',
    "stripeChargeId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_purchase" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'Paid',
    "stripeChargeId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_event" (
    "id" UUID NOT NULL,
    "apiId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "account" TEXT,
    "created" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "pendingWebhooks" INTEGER NOT NULL,
    "request" JSONB,
    "type_description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" UUID,
    "lessonId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_question" (
    "id" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_option" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "quiz_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submission" (
    "id" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_uid_key" ON "user"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeCustomerId_key" ON "user"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeAccountId_key" ON "user"("stripeAccountId");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "coding_challenge_userId_idx" ON "coding_challenge"("userId");

-- CreateIndex
CREATE INDEX "coding_challenge_courseId_idx" ON "coding_challenge"("courseId");

-- CreateIndex
CREATE INDEX "coding_challenge_lessonId_idx" ON "coding_challenge"("lessonId");

-- CreateIndex
CREATE INDEX "challenge_submission_challengeId_idx" ON "challenge_submission"("challengeId");

-- CreateIndex
CREATE INDEX "challenge_submission_userId_idx" ON "challenge_submission"("userId");

-- CreateIndex
CREATE INDEX "course_userId_idx" ON "course"("userId");

-- CreateIndex
CREATE INDEX "course_status_idx" ON "course"("status");

-- CreateIndex
CREATE INDEX "course_category_idx" ON "course"("category");

-- CreateIndex
CREATE UNIQUE INDEX "course_userId_slug_key" ON "course"("userId", "slug");

-- CreateIndex
CREATE INDEX "module_courseId_idx" ON "module"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "module_courseId_order_key" ON "module"("courseId", "order");

-- CreateIndex
CREATE INDEX "lesson_moduleId_idx" ON "lesson"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_moduleId_order_key" ON "lesson"("moduleId", "order");

-- CreateIndex
CREATE INDEX "enrollment_userId_idx" ON "enrollment"("userId");

-- CreateIndex
CREATE INDEX "enrollment_courseId_idx" ON "enrollment"("courseId");

-- CreateIndex
CREATE INDEX "enrollment_accessExpiresAt_idx" ON "enrollment"("accessExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_userId_courseId_key" ON "enrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX "purchase_userId_idx" ON "purchase"("userId");

-- CreateIndex
CREATE INDEX "purchase_courseId_idx" ON "purchase"("courseId");

-- CreateIndex
CREATE INDEX "purchase_status_idx" ON "purchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_userId_courseId_key" ON "purchase"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_stripeChargeId_key" ON "purchase"("stripeChargeId");

-- CreateIndex
CREATE INDEX "platform_purchase_userId_idx" ON "platform_purchase"("userId");

-- CreateIndex
CREATE INDEX "platform_purchase_status_idx" ON "platform_purchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "platform_purchase_stripeChargeId_key" ON "platform_purchase"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_event_apiId_key" ON "stripe_event"("apiId");

-- CreateIndex
CREATE INDEX "quiz_userId_idx" ON "quiz"("userId");

-- CreateIndex
CREATE INDEX "quiz_courseId_idx" ON "quiz"("courseId");

-- CreateIndex
CREATE INDEX "quiz_lessonId_idx" ON "quiz"("lessonId");

-- CreateIndex
CREATE INDEX "quiz_question_quizId_idx" ON "quiz_question"("quizId");

-- CreateIndex
CREATE INDEX "quiz_option_questionId_idx" ON "quiz_option"("questionId");

-- CreateIndex
CREATE INDEX "quiz_submission_quizId_idx" ON "quiz_submission"("quizId");

-- CreateIndex
CREATE INDEX "quiz_submission_userId_idx" ON "quiz_submission"("userId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_challenge" ADD CONSTRAINT "coding_challenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_challenge" ADD CONSTRAINT "coding_challenge_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_challenge" ADD CONSTRAINT "coding_challenge_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_submission" ADD CONSTRAINT "challenge_submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "coding_challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_submission" ADD CONSTRAINT "challenge_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module" ADD CONSTRAINT "module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_purchase" ADD CONSTRAINT "platform_purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_option" ADD CONSTRAINT "quiz_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submission" ADD CONSTRAINT "quiz_submission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submission" ADD CONSTRAINT "quiz_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


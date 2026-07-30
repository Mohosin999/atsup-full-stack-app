-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "googleId" VARCHAR(255),
    "password" VARCHAR(255),
    "picture" TEXT,
    "preferences" JSONB,
    "subscription" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" VARCHAR(50) NOT NULL DEFAULT 'uploaded',
    "originalFormat" JSONB,
    "content" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
    "isAtsFriendly" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "resume_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL DEFAULT '',
    "jobTitle" TEXT,
    "company" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "atsScore" INTEGER NOT NULL DEFAULT 0,
    "atsBreakdown" JSONB,
    "jobMatchingBreakdown" JSONB,
    "atsSuggestions" TEXT[],
    "jobMatchSuggestions" TEXT[],
    "feedback" JSONB NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "missingKeywords" JSONB NOT NULL,
    "recommendedKeywords" TEXT[],
    "howToUseKeywords" TEXT[],
    "resumeImprovements" TEXT[],
    "jobMatch" JSONB,
    "existingSections" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "spellingGrammar" JSONB NOT NULL,
    "atsFriendliness" INTEGER NOT NULL,
    "suggestions" TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "ats_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_score_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "resumeName" VARCHAR(255) NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "spellingGrammar" JSONB NOT NULL,
    "atsFriendliness" INTEGER NOT NULL,
    "suggestions" TEXT[],
    "resumeContent" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "ats_score_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_descriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "job_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_matches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "matchPercentage" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "missingSkills" TEXT[],
    "missingKeywords" TEXT[],
    "suggestions" TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_match_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "resumeName" VARCHAR(255) NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "matchPercentage" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "missingSkills" TEXT[],
    "missingKeywords" TEXT[],
    "suggestions" TEXT[],
    "resumeContent" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "job_match_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'usd',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "paymentMethod" VARCHAR(50) NOT NULL,
    "planId" VARCHAR(50) NOT NULL,
    "credits" INTEGER NOT NULL,
    "stripeSessionId" VARCHAR(255),
    "bkashTransactionId" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_build_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "resumeContent" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "resume_build_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "resumes_userId_createdAt_idx" ON "resumes"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "resume_templates_userId_createdAt_idx" ON "resume_templates"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "analyses_userId_createdAt_idx" ON "analyses"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ats_scores_userId_createdAt_idx" ON "ats_scores"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ats_scores_resumeId_idx" ON "ats_scores"("resumeId");

-- CreateIndex
CREATE INDEX "ats_score_histories_userId_createdAt_idx" ON "ats_score_histories"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "job_descriptions_userId_createdAt_idx" ON "job_descriptions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "job_matches_userId_createdAt_idx" ON "job_matches"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "job_matches_resumeId_idx" ON "job_matches"("resumeId");

-- CreateIndex
CREATE INDEX "job_match_histories_userId_createdAt_idx" ON "job_match_histories"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "resume_build_histories_userId_createdAt_idx" ON "resume_build_histories"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_templates" ADD CONSTRAINT "resume_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_scores" ADD CONSTRAINT "ats_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_scores" ADD CONSTRAINT "ats_scores_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_score_histories" ADD CONSTRAINT "ats_score_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_match_histories" ADD CONSTRAINT "job_match_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_build_histories" ADD CONSTRAINT "resume_build_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

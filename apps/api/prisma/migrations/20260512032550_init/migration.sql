-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('guest', 'user', 'petition_creator', 'moderator', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "PetitionStatus" AS ENUM ('review', 'published', 'rejected', 'closed', 'achieved');

-- CreateEnum
CREATE TYPE "CategorySourceType" AS ENUM ('auto', 'manual');

-- CreateEnum
CREATE TYPE "DonationTargetType" AS ENUM ('petition', 'platform');

-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('one_time', 'recurring');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'paused', 'canceled');

-- CreateEnum
CREATE TYPE "ReviewQueueStatus" AS ENUM ('pending', 'approved', 'rejected', 'reclassified');

-- CreateEnum
CREATE TYPE "DecisionMakerType" AS ENUM ('government', 'local_government', 'school', 'company', 'public_org', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petition_categories" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentCode" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petition_categories_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "petitions" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "status" "PetitionStatus" NOT NULL DEFAULT 'review',
    "regionCode" TEXT,
    "decisionMakerId" TEXT,
    "decisionMakerNameRaw" TEXT,
    "primaryCategoryCode" TEXT,
    "signatureCountCached" INTEGER NOT NULL DEFAULT 0,
    "donationAmountCached" INTEGER NOT NULL DEFAULT 0,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetSignatureCount" INTEGER NOT NULL DEFAULT 5000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "achievedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "petitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petition_category_mappings" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" "CategorySourceType" NOT NULL DEFAULT 'auto',
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "petition_category_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petition_classification_results" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "classifierVersion" TEXT NOT NULL,
    "primaryCategoryCode" TEXT,
    "secondaryCategoryCodesJson" JSONB NOT NULL DEFAULT '[]',
    "matchedKeywordsJson" JSONB NOT NULL DEFAULT '[]',
    "matchedEntitiesJson" JSONB NOT NULL DEFAULT '[]',
    "confidence" DOUBLE PRECISION NOT NULL,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "rawReasoningSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "petition_classification_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petition_updates" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petition_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signatures" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "regionCode" TEXT,
    "ageBand" TEXT,
    "gender" TEXT,
    "comment" TEXT,
    "consentToStatistics" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "donorUserId" TEXT,
    "targetType" "DonationTargetType" NOT NULL,
    "petitionId" TEXT,
    "billingSubscriptionId" TEXT,
    "donationType" "DonationType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "provider" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'pending',
    "donorName" TEXT,
    "message" TEXT,
    "idempotencyKey" TEXT,
    "paymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "requestPayloadJson" JSONB,
    "responsePayloadJson" JSONB,
    "status" "PaymentAttemptStatus" NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_subscriptions" (
    "id" TEXT NOT NULL,
    "donorUserId" TEXT NOT NULL,
    "targetType" "DonationTargetType" NOT NULL,
    "petitionId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "billingCycle" "BillingCycle" NOT NULL,
    "provider" TEXT,
    "providerSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextBillingAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentCode" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "decision_makers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DecisionMakerType" NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "categoryCode" TEXT,
    "regionCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decision_makers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_queues" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "latestClassificationResultId" TEXT,
    "reviewStatus" "ReviewQueueStatus" NOT NULL DEFAULT 'pending',
    "reviewReason" TEXT,
    "assignedModeratorId" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "petitions_status_deletedAt_idx" ON "petitions"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "petitions_authorId_idx" ON "petitions"("authorId");

-- CreateIndex
CREATE INDEX "petitions_primaryCategoryCode_idx" ON "petitions"("primaryCategoryCode");

-- CreateIndex
CREATE INDEX "petitions_regionCode_idx" ON "petitions"("regionCode");

-- CreateIndex
CREATE UNIQUE INDEX "petition_category_mappings_petitionId_categoryCode_key" ON "petition_category_mappings"("petitionId", "categoryCode");

-- CreateIndex
CREATE INDEX "petition_classification_results_petitionId_idx" ON "petition_classification_results"("petitionId");

-- CreateIndex
CREATE INDEX "petition_updates_petitionId_idx" ON "petition_updates"("petitionId");

-- CreateIndex
CREATE INDEX "signatures_petitionId_idx" ON "signatures"("petitionId");

-- CreateIndex
CREATE UNIQUE INDEX "signatures_petitionId_userId_key" ON "signatures"("petitionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_idempotencyKey_key" ON "donations"("idempotencyKey");

-- CreateIndex
CREATE INDEX "donations_donorUserId_idx" ON "donations"("donorUserId");

-- CreateIndex
CREATE INDEX "donations_petitionId_idx" ON "donations"("petitionId");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "payment_attempts_donationId_idx" ON "payment_attempts"("donationId");

-- CreateIndex
CREATE INDEX "billing_subscriptions_donorUserId_idx" ON "billing_subscriptions"("donorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "review_queues_petitionId_key" ON "review_queues"("petitionId");

-- CreateIndex
CREATE UNIQUE INDEX "review_queues_latestClassificationResultId_key" ON "review_queues"("latestClassificationResultId");

-- CreateIndex
CREATE INDEX "review_queues_reviewStatus_idx" ON "review_queues"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_eventId_key" ON "webhook_events"("provider", "eventId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_actorUserId_idx" ON "admin_audit_logs"("actorUserId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "petition_categories" ADD CONSTRAINT "petition_categories_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "petition_categories"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petitions" ADD CONSTRAINT "petitions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petitions" ADD CONSTRAINT "petitions_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "regions"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petitions" ADD CONSTRAINT "petitions_decisionMakerId_fkey" FOREIGN KEY ("decisionMakerId") REFERENCES "decision_makers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petition_category_mappings" ADD CONSTRAINT "petition_category_mappings_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petition_category_mappings" ADD CONSTRAINT "petition_category_mappings_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "petition_categories"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petition_classification_results" ADD CONSTRAINT "petition_classification_results_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petition_updates" ADD CONSTRAINT "petition_updates_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petition_updates" ADD CONSTRAINT "petition_updates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "regions"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorUserId_fkey" FOREIGN KEY ("donorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_billingSubscriptionId_fkey" FOREIGN KEY ("billingSubscriptionId") REFERENCES "billing_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_donorUserId_fkey" FOREIGN KEY ("donorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "regions"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_makers" ADD CONSTRAINT "decision_makers_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "petition_categories"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_queues" ADD CONSTRAINT "review_queues_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "petitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_queues" ADD CONSTRAINT "review_queues_latestClassificationResultId_fkey" FOREIGN KEY ("latestClassificationResultId") REFERENCES "petition_classification_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_queues" ADD CONSTRAINT "review_queues_assignedModeratorId_fkey" FOREIGN KEY ("assignedModeratorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_queues" ADD CONSTRAINT "review_queues_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

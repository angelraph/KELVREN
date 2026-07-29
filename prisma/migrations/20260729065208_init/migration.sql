-- CreateEnum
CREATE TYPE "DeadlineCategory" AS ENUM ('DOMAIN', 'PASSPORT', 'VEHICLE_REGISTRATION', 'INSURANCE', 'PROFESSIONAL_LICENSE', 'PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "DeadlineSource" AS ENUM ('MANUAL', 'GMAIL_SCAN');

-- CreateEnum
CREATE TYPE "WatchItemStatus" AS ENUM ('PENDING', 'AUTO_APPROVED', 'AWAITING_APPROVAL', 'EXECUTED', 'FAILED', 'SNOOZED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('AWAITING_RESULT', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "pravaCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mandate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "DeadlineCategory" NOT NULL,
    "pravaMandateId" TEXT NOT NULL,
    "merchantScope" TEXT NOT NULL,
    "merchantName" TEXT,
    "approvedAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "recurringFrequency" TEXT NOT NULL,
    "status" "MandateStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mandate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "DeadlineCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "source" "DeadlineSource" NOT NULL,
    "gmailMessageId" TEXT,
    "merchantName" TEXT,
    "merchantUrl" TEXT,
    "estimatedAmount" DECIMAL(65,30),
    "currency" TEXT,
    "status" "WatchItemStatus" NOT NULL DEFAULT 'PENDING',
    "decisionRationale" TEXT,
    "mandateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "watchItemId" TEXT NOT NULL,
    "mandateId" TEXT,
    "pravaTransactionId" TEXT NOT NULL,
    "pravaOrderId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "merchantName" TEXT,
    "status" "ChargeStatus" NOT NULL DEFAULT 'AWAITING_RESULT',
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedAt" TIMESTAMP(3),

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_pravaCustomerId_key" ON "User"("pravaCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Mandate_pravaMandateId_key" ON "Mandate"("pravaMandateId");

-- CreateIndex
CREATE INDEX "Mandate_userId_category_idx" ON "Mandate"("userId", "category");

-- CreateIndex
CREATE INDEX "WatchItem_userId_status_idx" ON "WatchItem"("userId", "status");

-- CreateIndex
CREATE INDEX "WatchItem_userId_dueDate_idx" ON "WatchItem"("userId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_pravaTransactionId_key" ON "Charge"("pravaTransactionId");

-- CreateIndex
CREATE INDEX "Charge_watchItemId_idx" ON "Charge"("watchItemId");

-- AddForeignKey
ALTER TABLE "Mandate" ADD CONSTRAINT "Mandate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchItem" ADD CONSTRAINT "WatchItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchItem" ADD CONSTRAINT "WatchItem_mandateId_fkey" FOREIGN KEY ("mandateId") REFERENCES "Mandate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_watchItemId_fkey" FOREIGN KEY ("watchItemId") REFERENCES "WatchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_mandateId_fkey" FOREIGN KEY ("mandateId") REFERENCES "Mandate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

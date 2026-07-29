-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DeadlineCategory" ADD VALUE 'SUBSCRIPTION';
ALTER TYPE "DeadlineCategory" ADD VALUE 'UTILITY';
ALTER TYPE "DeadlineCategory" ADD VALUE 'PHONE_INTERNET';
ALTER TYPE "DeadlineCategory" ADD VALUE 'RENT_MORTGAGE';
ALTER TYPE "DeadlineCategory" ADD VALUE 'MEMBERSHIP';

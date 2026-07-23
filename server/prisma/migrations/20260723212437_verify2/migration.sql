-- CreateEnum
CREATE TYPE "CompliancePriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RenewalFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'NONE');

-- AlterTable
ALTER TABLE "compliance_records" ADD COLUMN     "filing_reference" TEXT,
ADD COLUMN     "last_filed" TIMESTAMP(3),
ADD COLUMN     "priority" "CompliancePriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "renewal_frequency" "RenewalFrequency" NOT NULL DEFAULT 'ANNUAL',
ADD COLUMN     "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW';

-- CreateIndex
CREATE INDEX "compliance_records_status_idx" ON "compliance_records"("status");

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MSME_OWNER', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('MANUFACTURING', 'SERVICES', 'TRADING', 'FOOD_PROCESSING', 'CONSTRUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'DUE', 'OVERDUE', 'EXEMPT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AlertThreshold" AS ENUM ('DAYS_30', 'DAYS_15', 'DAYS_7');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GST_CERTIFICATE', 'EPFO_CERTIFICATE', 'ESIC_CERTIFICATE', 'MCA_CERTIFICATE', 'UDYAM_CERTIFICATE', 'FSSAI_LICENSE', 'FACTORY_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuthorityType" AS ENUM ('GST', 'EPFO', 'ESIC', 'MCA', 'UDYAM', 'FSSAI');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MSME_OWNER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "msme_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "business_name" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "udyam_number" TEXT NOT NULL,
    "business_type" "BusinessType" NOT NULL,
    "sector" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "employee_count" INTEGER NOT NULL DEFAULT 0,
    "annual_turnover_lakh" DOUBLE PRECISION,
    "is_food_business" BOOLEAN NOT NULL DEFAULT false,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "last_compliance_sync" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "msme_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_records" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "authority" "AuthorityType" NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'UNKNOWN',
    "expiry_date" TIMESTAMP(3),
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "authority" "AuthorityType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size_kb" INTEGER NOT NULL,
    "validity_date" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "compliance_record_id" INTEGER NOT NULL,
    "threshold" "AlertThreshold" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_schemes" (
    "id" SERIAL NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eligibility_criteria" JSONB NOT NULL,
    "benefit_type" TEXT NOT NULL,
    "max_benefit_lakh" DOUBLE PRECISION,
    "application_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "government_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheme_matches" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "scheme_id" INTEGER NOT NULL,
    "match_score" INTEGER NOT NULL,
    "match_reasons" JSONB NOT NULL,
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheme_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_view_logs" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewer_ip" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "buyer_view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "msme_profiles_user_id_key" ON "msme_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "msme_profiles_gstin_key" ON "msme_profiles"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "msme_profiles_udyam_number_key" ON "msme_profiles"("udyam_number");

-- CreateIndex
CREATE INDEX "msme_profiles_gstin_idx" ON "msme_profiles"("gstin");

-- CreateIndex
CREATE INDEX "msme_profiles_udyam_number_idx" ON "msme_profiles"("udyam_number");

-- CreateIndex
CREATE INDEX "compliance_records_msme_id_idx" ON "compliance_records"("msme_id");

-- CreateIndex
CREATE INDEX "compliance_records_expiry_date_idx" ON "compliance_records"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_records_msme_id_authority_key" ON "compliance_records"("msme_id", "authority");

-- CreateIndex
CREATE INDEX "documents_msme_id_idx" ON "documents"("msme_id");

-- CreateIndex
CREATE INDEX "documents_authority_idx" ON "documents"("authority");

-- CreateIndex
CREATE INDEX "alerts_msme_id_idx" ON "alerts"("msme_id");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_scheduled_for_idx" ON "alerts"("scheduled_for");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_msme_id_compliance_record_id_threshold_key" ON "alerts"("msme_id", "compliance_record_id", "threshold");

-- CreateIndex
CREATE INDEX "government_schemes_ministry_idx" ON "government_schemes"("ministry");

-- CreateIndex
CREATE INDEX "scheme_matches_msme_id_idx" ON "scheme_matches"("msme_id");

-- CreateIndex
CREATE INDEX "scheme_matches_match_score_idx" ON "scheme_matches"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "scheme_matches_msme_id_scheme_id_key" ON "scheme_matches"("msme_id", "scheme_id");

-- CreateIndex
CREATE INDEX "buyer_view_logs_msme_id_idx" ON "buyer_view_logs"("msme_id");

-- CreateIndex
CREATE INDEX "buyer_view_logs_viewed_at_idx" ON "buyer_view_logs"("viewed_at");

-- AddForeignKey
ALTER TABLE "msme_profiles" ADD CONSTRAINT "msme_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_compliance_record_id_fkey" FOREIGN KEY ("compliance_record_id") REFERENCES "compliance_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheme_matches" ADD CONSTRAINT "scheme_matches_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheme_matches" ADD CONSTRAINT "scheme_matches_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "government_schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_view_logs" ADD CONSTRAINT "buyer_view_logs_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

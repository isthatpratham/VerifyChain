-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "compliance_rules" (
    "id" SERIAL NOT NULL,
    "rule_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" "CompliancePriority" NOT NULL DEFAULT 'MEDIUM',
    "authority" "AuthorityType" NOT NULL,
    "legal_reference" TEXT,
    "effective_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "conditions" JSONB NOT NULL,
    "success_explanation" TEXT NOT NULL,
    "failure_explanation" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_evaluation_logs" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "rule_id" INTEGER NOT NULL,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "execution_time_ms" DOUBLE PRECISION NOT NULL,
    "is_applicable" BOOLEAN NOT NULL,
    "matched_conditions" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "input_snapshot" JSONB NOT NULL,
    "engine_version" TEXT NOT NULL DEFAULT '1.0.0',

    CONSTRAINT "rule_evaluation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "compliance_rules_rule_id_key" ON "compliance_rules"("rule_id");

-- CreateIndex
CREATE INDEX "compliance_rules_authority_idx" ON "compliance_rules"("authority");

-- CreateIndex
CREATE INDEX "compliance_rules_status_idx" ON "compliance_rules"("status");

-- CreateIndex
CREATE INDEX "compliance_rules_rule_id_idx" ON "compliance_rules"("rule_id");

-- CreateIndex
CREATE INDEX "rule_evaluation_logs_msme_id_idx" ON "rule_evaluation_logs"("msme_id");

-- CreateIndex
CREATE INDEX "rule_evaluation_logs_rule_id_idx" ON "rule_evaluation_logs"("rule_id");

-- CreateIndex
CREATE INDEX "rule_evaluation_logs_evaluated_at_idx" ON "rule_evaluation_logs"("evaluated_at");

-- AddForeignKey
ALTER TABLE "rule_evaluation_logs" ADD CONSTRAINT "rule_evaluation_logs_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_evaluation_logs" ADD CONSTRAINT "rule_evaluation_logs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "compliance_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

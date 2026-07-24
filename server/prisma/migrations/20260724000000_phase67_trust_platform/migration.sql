-- VerifyChain Phase 6 and Phase 7 Migration

CREATE TYPE "TrustLevel" AS ENUM ('PENDING', 'VERIFIED', 'TRUSTED', 'HIGHLY_TRUSTED', 'ENTERPRISE_TRUSTED', 'SUSPENDED', 'EXPIRED', 'REVOKED');
CREATE TYPE "VerificationState" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'ARCHIVED');
CREATE TYPE "DistributionChannel" AS ENUM ('QR_CODE', 'TRUST_CARD', 'CERTIFICATE', 'EMBED_BADGE', 'WIDGET', 'PUBLIC_LINK', 'MOBILE_WALLET');
CREATE TYPE "DistributionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED', 'ARCHIVED');

CREATE TABLE "health_score_configs" ("id" SERIAL NOT NULL,"config_version" TEXT NOT NULL,"max_score" INTEGER NOT NULL DEFAULT 100,"min_score" INTEGER NOT NULL DEFAULT 0,"category_definitions" JSONB NOT NULL,"penalty_rules" JSONB NOT NULL,"bonus_rules" JSONB NOT NULL,"status" "RuleStatus" NOT NULL DEFAULT 'ACTIVE',"effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"expiry_date" TIMESTAMP(3),"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "health_score_configs_pkey" PRIMARY KEY ("id"));

CREATE TABLE "score_categories" ("id" SERIAL NOT NULL,"category_code" TEXT NOT NULL,"category_name" TEXT NOT NULL,"description" TEXT NOT NULL,"default_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,"is_active" BOOLEAN NOT NULL DEFAULT true,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "score_categories_pkey" PRIMARY KEY ("id"));

CREATE TABLE "health_score_snapshots" ("id" SERIAL NOT NULL,"msme_id" INTEGER NOT NULL,"config_version" TEXT NOT NULL,"overall_score" DOUBLE PRECISION,"risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',"category_breakdown" JSONB,"recommendations_snapshot" JSONB,"evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"engine_version" TEXT NOT NULL DEFAULT '1.0.0',CONSTRAINT "health_score_snapshots_pkey" PRIMARY KEY ("id"));

CREATE TABLE "supplier_trust_profiles" ("id" SERIAL NOT NULL,"msme_id" INTEGER NOT NULL,"public_slug" TEXT NOT NULL,"public_identifier" TEXT NOT NULL,"display_name" TEXT NOT NULL,"trust_level" "TrustLevel" NOT NULL DEFAULT 'PENDING',"verification_state" "VerificationState" NOT NULL DEFAULT 'DRAFT',"is_public" BOOLEAN NOT NULL DEFAULT false,"trust_score_snapshot" DOUBLE PRECISION,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "supplier_trust_profiles_pkey" PRIMARY KEY ("id"));

CREATE TABLE "trust_metadata" ("id" SERIAL NOT NULL,"supplier_trust_profile_id" INTEGER NOT NULL,"verified_by" TEXT,"verification_version" TEXT NOT NULL DEFAULT 'v1.0.0',"confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,"review_cycle" TEXT NOT NULL DEFAULT 'ANNUAL',"next_review_date" TIMESTAMP(3),"expiration_date" TIMESTAMP(3),"metadata_json" JSONB,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "trust_metadata_pkey" PRIMARY KEY ("id"));

CREATE TABLE "trust_timeline_events" ("id" SERIAL NOT NULL,"supplier_trust_profile_id" INTEGER NOT NULL,"event_type" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT NOT NULL,"actor" TEXT NOT NULL DEFAULT 'SYSTEM',"event_data" JSONB,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "trust_timeline_events_pkey" PRIMARY KEY ("id"));

CREATE TABLE "trust_distribution_identities" ("id" SERIAL NOT NULL,"supplier_trust_profile_id" INTEGER NOT NULL,"public_slug" TEXT NOT NULL,"stable_distribution_id" TEXT NOT NULL,"asset_version" TEXT NOT NULL DEFAULT 'v1.0.0',"status" "DistributionStatus" NOT NULL DEFAULT 'ACTIVE',"enabled_channels" TEXT[] DEFAULT ARRAY['PUBLIC_LINK', 'QR_CODE', 'TRUST_CARD']::TEXT[],"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "trust_distribution_identities_pkey" PRIMARY KEY ("id"));

CREATE TABLE "trust_distribution_configs" ("id" SERIAL NOT NULL,"trust_distribution_identity_id" INTEGER NOT NULL,"branding_json" JSONB,"visibility_json" JSONB,"token_policy_json" JSONB,"expiration_days" INTEGER NOT NULL DEFAULT 365,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "trust_distribution_configs_pkey" PRIMARY KEY ("id"));

CREATE TABLE "trust_distribution_timeline_events" ("id" SERIAL NOT NULL,"trust_distribution_identity_id" INTEGER NOT NULL,"event_type" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT,"actor" TEXT NOT NULL DEFAULT 'SYSTEM',"event_data" JSONB,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "trust_distribution_timeline_events_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "health_score_configs_config_version_key" ON "health_score_configs"("config_version");
CREATE UNIQUE INDEX "score_categories_category_code_key" ON "score_categories"("category_code");
CREATE INDEX "health_score_snapshots_msme_id_idx" ON "health_score_snapshots"("msme_id");
CREATE INDEX "health_score_snapshots_evaluated_at_idx" ON "health_score_snapshots"("evaluated_at");
CREATE UNIQUE INDEX "supplier_trust_profiles_msme_id_key" ON "supplier_trust_profiles"("msme_id");
CREATE UNIQUE INDEX "supplier_trust_profiles_public_slug_key" ON "supplier_trust_profiles"("public_slug");
CREATE UNIQUE INDEX "supplier_trust_profiles_public_identifier_key" ON "supplier_trust_profiles"("public_identifier");
CREATE INDEX "supplier_trust_profiles_public_slug_idx" ON "supplier_trust_profiles"("public_slug");
CREATE INDEX "supplier_trust_profiles_public_identifier_idx" ON "supplier_trust_profiles"("public_identifier");
CREATE INDEX "supplier_trust_profiles_trust_level_idx" ON "supplier_trust_profiles"("trust_level");
CREATE INDEX "trust_metadata_supplier_trust_profile_id_idx" ON "trust_metadata"("supplier_trust_profile_id");
CREATE INDEX "trust_timeline_events_supplier_trust_profile_id_idx" ON "trust_timeline_events"("supplier_trust_profile_id");
CREATE INDEX "trust_timeline_events_created_at_idx" ON "trust_timeline_events"("created_at");
CREATE UNIQUE INDEX "trust_distribution_identities_supplier_trust_profile_id_key" ON "trust_distribution_identities"("supplier_trust_profile_id");
CREATE UNIQUE INDEX "trust_distribution_identities_stable_distribution_id_key" ON "trust_distribution_identities"("stable_distribution_id");
CREATE INDEX "trust_distribution_identities_public_slug_idx" ON "trust_distribution_identities"("public_slug");
CREATE INDEX "trust_distribution_identities_stable_distribution_id_idx" ON "trust_distribution_identities"("stable_distribution_id");
CREATE UNIQUE INDEX "trust_distribution_configs_trust_distribution_identity_id_key" ON "trust_distribution_configs"("trust_distribution_identity_id");
CREATE INDEX "trust_distribution_timeline_events_trust_distribution_ident_idx" ON "trust_distribution_timeline_events"("trust_distribution_identity_id");
CREATE INDEX "trust_distribution_timeline_events_created_at_idx" ON "trust_distribution_timeline_events"("created_at");

ALTER TABLE "health_score_snapshots" ADD CONSTRAINT "health_score_snapshots_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "supplier_trust_profiles" ADD CONSTRAINT "supplier_trust_profiles_msme_id_fkey" FOREIGN KEY ("msme_id") REFERENCES "msme_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trust_metadata" ADD CONSTRAINT "trust_metadata_supplier_trust_profile_id_fkey" FOREIGN KEY ("supplier_trust_profile_id") REFERENCES "supplier_trust_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trust_timeline_events" ADD CONSTRAINT "trust_timeline_events_supplier_trust_profile_id_fkey" FOREIGN KEY ("supplier_trust_profile_id") REFERENCES "supplier_trust_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trust_distribution_identities" ADD CONSTRAINT "trust_distribution_identities_supplier_trust_profile_id_fkey" FOREIGN KEY ("supplier_trust_profile_id") REFERENCES "supplier_trust_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trust_distribution_configs" ADD CONSTRAINT "trust_distribution_configs_trust_distribution_identity_id_fkey" FOREIGN KEY ("trust_distribution_identity_id") REFERENCES "trust_distribution_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trust_distribution_timeline_events" ADD CONSTRAINT "trust_distribution_timeline_events_trust_distribution_iden_fkey" FOREIGN KEY ("trust_distribution_identity_id") REFERENCES "trust_distribution_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
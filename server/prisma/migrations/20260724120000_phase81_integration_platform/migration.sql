-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('DRAFT', 'CONFIGURED', 'CONNECTED', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('ERP', 'CRM', 'GOVERNMENT', 'OAUTH', 'WEBHOOK', 'PARTNER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'ROTATED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRIED', 'PERMANENTLY_FAILED');

-- CreateTable
CREATE TABLE "integrations" (
    "id" SERIAL NOT NULL,
    "integration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "IntegrationType" NOT NULL DEFAULT 'CUSTOM',
    "provider_code" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'v1.0.0',
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DRAFT',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configurations" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "msme_id" INTEGER,
    "environment" TEXT NOT NULL DEFAULT 'PRODUCTION',
    "config_version" TEXT NOT NULL DEFAULT 'v1.0.0',
    "base_url" TEXT,
    "auth_type" TEXT NOT NULL DEFAULT 'API_KEY',
    "settings_json" JSONB,
    "timeout_ms" INTEGER NOT NULL DEFAULT 10000,
    "retry_policy_json" JSONB,
    "rate_limit_rpm" INTEGER NOT NULL DEFAULT 120,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_secrets" (
    "id" SERIAL NOT NULL,
    "configuration_id" INTEGER NOT NULL,
    "secret_key" TEXT NOT NULL,
    "encrypted_value" TEXT NOT NULL,
    "encryption_algorithm" TEXT NOT NULL DEFAULT 'AES-256-GCM',
    "key_version" TEXT NOT NULL DEFAULT 'v1',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_connections" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "connection_identifier" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONFIGURED',
    "health_status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "last_connected_at" TIMESTAMP(3),
    "last_synced_at" TIMESTAMP(3),
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_applications" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "app_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'SANDBOX',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "developer_app_id" INTEGER NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'PRODUCTION',
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "revocation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_usage" (
    "id" SERIAL NOT NULL,
    "api_key_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "http_method" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_time_ms" DOUBLE PRECISION NOT NULL,
    "request_ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_key_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_subscriptions" (
    "id" SERIAL NOT NULL,
    "developer_app_id" INTEGER NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "target_url" TEXT NOT NULL,
    "subscribed_events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secret_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_attempts" (
    "id" SERIAL NOT NULL,
    "delivery_id" INTEGER NOT NULL,
    "response_status" INTEGER,
    "response_body" TEXT,
    "execution_time_ms" DOUBLE PRECISION NOT NULL,
    "error_message" TEXT,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_event_logs" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER,
    "event_type" TEXT NOT NULL,
    "event_source" TEXT NOT NULL DEFAULT 'VERIFYCHAIN_INTERNAL',
    "correlation_id" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_audit_logs" (
    "id" SERIAL NOT NULL,
    "actor_type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "changes_json" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_integration_id_key" ON "integrations"("integration_id");

-- CreateIndex
CREATE INDEX "integrations_provider_code_idx" ON "integrations"("provider_code");

-- CreateIndex
CREATE INDEX "integrations_type_idx" ON "integrations"("type");

-- CreateIndex
CREATE INDEX "integrations_status_idx" ON "integrations"("status");

-- CreateIndex
CREATE INDEX "integration_configurations_integration_id_idx" ON "integration_configurations"("integration_id");

-- CreateIndex
CREATE INDEX "integration_configurations_msme_id_idx" ON "integration_configurations"("msme_id");

-- CreateIndex
CREATE INDEX "integration_secrets_configuration_id_idx" ON "integration_secrets"("configuration_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_connections_connection_identifier_key" ON "integration_connections"("connection_identifier");

-- CreateIndex
CREATE INDEX "integration_connections_integration_id_idx" ON "integration_connections"("integration_id");

-- CreateIndex
CREATE INDEX "integration_connections_msme_id_idx" ON "integration_connections"("msme_id");

-- CreateIndex
CREATE UNIQUE INDEX "developer_applications_app_id_key" ON "developer_applications"("app_id");

-- CreateIndex
CREATE INDEX "developer_applications_msme_id_idx" ON "developer_applications"("msme_id");

-- CreateIndex
CREATE INDEX "developer_applications_app_id_idx" ON "developer_applications"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_developer_app_id_idx" ON "api_keys"("developer_app_id");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_status_idx" ON "api_keys"("status");

-- CreateIndex
CREATE INDEX "api_key_usage_api_key_id_idx" ON "api_key_usage"("api_key_id");

-- CreateIndex
CREATE INDEX "api_key_usage_created_at_idx" ON "api_key_usage"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_subscriptions_subscription_id_key" ON "webhook_subscriptions"("subscription_id");

-- CreateIndex
CREATE INDEX "webhook_subscriptions_developer_app_id_idx" ON "webhook_subscriptions"("developer_app_id");

-- CreateIndex
CREATE INDEX "webhook_subscriptions_subscription_id_idx" ON "webhook_subscriptions"("subscription_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_subscription_id_idx" ON "webhook_deliveries"("subscription_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_status_idx" ON "webhook_deliveries"("status");

-- CreateIndex
CREATE INDEX "webhook_attempts_delivery_id_idx" ON "webhook_attempts"("delivery_id");

-- CreateIndex
CREATE INDEX "integration_event_logs_integration_id_idx" ON "integration_event_logs"("integration_id");

-- CreateIndex
CREATE INDEX "integration_event_logs_event_type_idx" ON "integration_event_logs"("event_type");

-- CreateIndex
CREATE INDEX "integration_event_logs_correlation_id_idx" ON "integration_event_logs"("correlation_id");

-- CreateIndex
CREATE INDEX "integration_audit_logs_action_idx" ON "integration_audit_logs"("action");

-- CreateIndex
CREATE INDEX "integration_audit_logs_resource_type_resource_id_idx" ON "integration_audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "integration_audit_logs_created_at_idx" ON "integration_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "integration_configurations" ADD CONSTRAINT "integration_configurations_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_secrets" ADD CONSTRAINT "integration_secrets_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "integration_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_developer_app_id_fkey" FOREIGN KEY ("developer_app_id") REFERENCES "developer_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_usage" ADD CONSTRAINT "api_key_usage_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_developer_app_id_fkey" FOREIGN KEY ("developer_app_id") REFERENCES "developer_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "webhook_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_attempts" ADD CONSTRAINT "webhook_attempts_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "webhook_deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_event_logs" ADD CONSTRAINT "integration_event_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "developer_workspaces" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'PRODUCTION',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "developer_app_id" INTEGER,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GLOBAL',
    "filter_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_preferences" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'LIGHT',
    "default_view" TEXT NOT NULL DEFAULT 'OVERVIEW',
    "widget_config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_summaries" (
    "id" SERIAL NOT NULL,
    "developer_app_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_requests" INTEGER NOT NULL DEFAULT 0,
    "successful_requests" INTEGER NOT NULL DEFAULT 0,
    "failed_requests" INTEGER NOT NULL DEFAULT 0,
    "avg_latency_ms" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "peak_rpm" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_alerts" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata_json" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_preferences" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "sync_schedule_cron" TEXT,
    "auto_resolve_conflicts" BOOLEAN NOT NULL DEFAULT false,
    "settings_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_activities" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "activity_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_bookmarks" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "audit_log_id" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "msme_id" INTEGER NOT NULL,
    "email_alerts" BOOLEAN NOT NULL DEFAULT true,
    "security_alerts" BOOLEAN NOT NULL DEFAULT true,
    "webhook_failures_alert" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "developer_workspaces_msme_id_idx" ON "developer_workspaces"("msme_id");

-- CreateIndex
CREATE INDEX "saved_filters_msme_id_idx" ON "saved_filters"("msme_id");

-- CreateIndex
CREATE INDEX "saved_filters_category_idx" ON "saved_filters"("category");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_preferences_msme_id_key" ON "dashboard_preferences"("msme_id");

-- CreateIndex
CREATE INDEX "api_usage_summaries_developer_app_id_idx" ON "api_usage_summaries"("developer_app_id");

-- CreateIndex
CREATE INDEX "api_usage_summaries_date_idx" ON "api_usage_summaries"("date");

-- CreateIndex
CREATE INDEX "security_alerts_msme_id_idx" ON "security_alerts"("msme_id");

-- CreateIndex
CREATE INDEX "security_alerts_severity_idx" ON "security_alerts"("severity");

-- CreateIndex
CREATE INDEX "security_alerts_is_resolved_idx" ON "security_alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "connector_preferences_integration_id_msme_id_idx" ON "connector_preferences"("integration_id", "msme_id");

-- CreateIndex
CREATE INDEX "recent_activities_msme_id_idx" ON "recent_activities"("msme_id");

-- CreateIndex
CREATE INDEX "recent_activities_created_at_idx" ON "recent_activities"("created_at");

-- CreateIndex
CREATE INDEX "audit_bookmarks_msme_id_idx" ON "audit_bookmarks"("msme_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_msme_id_key" ON "notification_preferences"("msme_id");

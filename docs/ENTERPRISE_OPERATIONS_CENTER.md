# Enterprise Operations Center & Operational Intelligence

## Architectural Overview

The **Enterprise Operations Center** (`operationsAnalytics`) bounded context provides application-level operational intelligence, multi-domain analytics, system health monitoring, alert management, trend forecasting, and executive reporting across VerifyChain.

```
Enterprise Administration Platform
  ↓
Operations Center
  ↓
Metrics Engine (Business, Resource, Platform Metrics)
  ↓
Analytics Engine (User DAU/MAU, Document, Compliance, AI, Security Analytics)
  ↓
Health Engine (Diagnostic Polling for 14 System Modules)
  ↓
Alert Engine (Configurable Alerts & Ack/Assign/Resolve Lifecycle)
  ↓
Trend Engine (Daily/Weekly/Monthly/Quarterly/Yearly Forecasting)
  ↓
Reporting Engine (Executive Summary & Governance Report Generator)
  ↓
Executive Dashboard (Live KPI Grid, Health Cards, Insights, Alert Center)
```

---

## Phase 11.5 Operations Center Services

- **`HealthService`**: Diagnostics for 14 platform modules (`AUTHENTICATION`, `IDENTITY`, `IAM`, `BUSINESS_PROFILES`, `COMPLIANCE_ENGINE`, `TRUST_PLATFORM`, `DOCUMENT_VAULT`, `AI_PLATFORM`, `NOTIFICATION_SERVICE`, `AUDIT_CENTER`, `SEARCH_ENGINE`, `STORAGE`, `BACKGROUND_JOBS`, `QUEUES`). Statuses: `HEALTHY`, `WARNING`, `DEGRADED`, `MAINTENANCE`, `OFFLINE`, `UNKNOWN`.
- **`MetricsService`**: Business, resource, and storage metrics computation engine.
- **`AnalyticsService`**: Multi-domain analytics model (User DAU/MAU, Document lifecycle, Compliance distribution, AI usage, Audit & Security analytics).
- **`AlertEngine`**: Configurable operational alert lifecycle (`OPEN`, `ACKNOWLEDGED`, `ASSIGNED`, `RESOLVED`, `CLOSED`).
- **`TrendAnalysisService`**: Multi-timeframe trend forecasting (Daily, Weekly, Monthly, Quarterly, Yearly).
- **`KPIService`**: Configurable dashboard KPI widget calculations.
- **`ReportingService`**: Executive & governance report generation framework.
- **`OperationalInsightsService`**: Anomaly detection & insight extractor.
- **`ExecutiveSummaryService`**: Executive status briefing summary generator.
- **`OperationsDashboardService`**: Central aggregator for Executive Operations Center workspace payload.
- **`OperationsAnalyticsFacade`**: Unified facade layer exposing all Operations Center capabilities.

---

## Database Schema Extensions (Prisma)

- **`OpPlatformMetric`**: Time-series metrics data (`name`, `category`, `value_float`, `dimensions_json`, `timestamp`).
- **`OpPlatformHealth`**: Health diagnostics per module (`module_key`, `module_name`, `status`, `reason`, `duration_sec`, `severity`, `recovery_guidance`).
- **`OpOperationalAlert`**: Operational alert center records (`title`, `message`, `severity`, `category`, `status`, `acknowledged_by`, `assigned_to`).
- **`OpTrendSnapshot`**: Multi-timeframe trend snapshots (`metric_key`, `period_type`, `period_start`, `period_end`, `data_json`).
- **`OpExecutiveReport`**: Executive report catalog (`title`, `report_type`, `format`, `summary_json`).
- **`OpKPIConfiguration`**: Dashboard KPI configurations (`code`, `title`, `category`, `target_value`, `current_value`, `unit`, `widget_type`).
- **`OpAnalyticsSnapshot`**: Multi-domain analytics snapshots (`category`, `metrics_json`).

---

## REST API Specification (`/api/v1/operations-analytics`)

| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/operations-analytics/dashboard` | Aggregate Operations Center executive dashboard payload | `ops.read` |
| `GET` | `/api/v1/operations-analytics/health` | Platform health diagnostics for 14 modules | `ops.health.view` |
| `POST` | `/api/v1/operations-analytics/health/check` | Trigger real-time health diagnostic scan | `ops.health.view` |
| `PUT` | `/api/v1/operations-analytics/health/:moduleKey` | Update module health state | `ops.health.manage` |
| `GET` | `/api/v1/operations-analytics/metrics` | Fetch business & operational metrics | `ops.metrics.view` |
| `GET` | `/api/v1/operations-analytics/analytics/users` | Fetch user engagement analytics (DAU/MAU) | `ops.analytics.view` |
| `GET` | `/api/v1/operations-analytics/analytics/documents` | Fetch Document Vault analytics | `ops.analytics.view` |
| `GET` | `/api/v1/operations-analytics/analytics/compliance` | Fetch Compliance Platform analytics | `ops.analytics.view` |
| `GET` | `/api/v1/operations-analytics/analytics/ai` | Fetch AI Platform analytics | `ops.analytics.view` |
| `GET` | `/api/v1/operations-analytics/analytics/security` | Fetch Security & Audit analytics | `ops.analytics.view` |
| `GET` | `/api/v1/operations-analytics/alerts` | List operational alert center records | `ops.alerts.view` |
| `POST` | `/api/v1/operations-analytics/alerts` | Raise new operational alert | `ops.alerts.manage` |
| `PUT` | `/api/v1/operations-analytics/alerts/:id` | Update alert state (Ack / Assign / Resolve) | `ops.alerts.manage` |
| `GET` | `/api/v1/operations-analytics/trends` | Fetch multi-timeframe trend snapshots | `ops.trends.view` |
| `GET` | `/api/v1/operations-analytics/kpis` | List dashboard KPI widget configurations | `ops.kpi.view` |
| `GET` | `/api/v1/operations-analytics/reports` | List historical executive reports | `ops.reports.view` |
| `POST` | `/api/v1/operations-analytics/reports/generate` | Generate executive report | `ops.reports.generate` |

---

## Verification & Testing

- **Phase 11.5 Test Suite**: `node tests/enterpriseOperationsCenter.test.js` (**PASS - 8/8 test stages**)
- **Authentication Audit**: `node tests/authAudit.test.js` (**PASS**)
- **Frontend Production Build**: `npm run build` in `client/` (**PASS - 4756 modules transformed, 0 errors**)

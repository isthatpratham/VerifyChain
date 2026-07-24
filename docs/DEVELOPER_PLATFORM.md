# Enterprise Developer Platform & Integration Management Documentation — Phase 8.5

## Overview

The **VerifyChain Developer Platform** provides a comprehensive, enterprise-grade management workspace for managing APIs, developer applications, API keys, webhook subscriptions, third-party connectors, visual usage analytics, audit logs, security posture, system observability, and global search.

---

## Architectural Principles

The Developer Platform is designed as a management layer built directly on top of the lower-level Integration Platform, Public REST API Platform, Webhook Engine, and Connector Adapter Framework:

$$\text{Business Modules} \rightarrow \text{Integration Platform} \rightarrow \begin{cases} \text{Public APIs (v1)} \\ \text{Webhooks} \\ \text{Connectors} \end{cases} \rightarrow \mathbf{Developer\ Platform}$$

1. **Management Workspace**: It manages external integrations without replacing core domain modules.
2. **One-Time Secret Display**: Raw API keys (`vc_live_...` / `vc_test_...`) and Webhook signing secrets (`whsec_...`) are returned **ONLY ONCE** upon creation and are never exposed or stored in plain text.
3. **Least-Privilege Authorization**: Access to Developer Platform management endpoints is governed by granular permission scopes (`developer.read`, `developer.write`, `apikey.manage`, `webhook.manage`, `connector.manage`, `audit.read`, `integration.admin`).
4. **Credential Posture & Security Audit**: Continuous audit of expired keys, inactive keys, rate limit violations, and security recommendations.

---

## Core Developer Platform Capabilities

### 1. Developer Dashboard Overview
- High-level metrics: Active Applications, Active API Keys, Active Webhooks, Healthy Connections, 24-hour Request Volume, 24-hour Success Rate (%), Average Latency (ms), and Unresolved Security Alerts.
- Connected applications overview and recent audit event feed.

### 2. API Key Management
- **Enterprise Key Lifecycle**: Create, View, Rotate, Revoke, Disable, Expire, and Regenerate API Keys.
- **One-Time Secret Display**: Raw keys are generated using high-entropy crypto random bytes and returned **ONLY ONCE** upon creation.
- **Scope & Environment Isolation**: Assign fine-grained permission scopes per key with strict `PRODUCTION` vs `SANDBOX` environment separation.
- **Usage Statistics**: Track total request volume, error count, and average response latency per key.

### 3. Webhook Subscriptions Management
- **Subscription Lifecycle**: Create, Edit, Pause, Resume, Delete, and Rotate Signing Secrets.
- **Delivery Log Inspection**: Real-time inspection of HTTP delivery logs, attempt counts, response status codes, and error tracebacks.
- **Event Replay Engine**: Manually trigger replay execution for failed webhook deliveries.

### 4. Connector Framework Management
- **Installed Adapters**: Monitor connected SAP S/4HANA ERP, Salesforce CRM, GST Portal, and partner systems.
- **Health Diagnostics**: Trigger manual latency and connection health checks.
- **Manual Data Synchronization**: Trigger full, incremental, or manual sync jobs with conflict resolution.
- **Credential Rotation**: Rotate encrypted connection secrets at rest (AES-256-GCM).

### 5. Developer Applications
- Register and configure developer applications, environment flags, redirect metadata, and permission scopes.

### 6. Visual API Usage Analytics
- Visual datasets for request volume, success rate (%), failure rate (%), average response latency (ms), top requested endpoints, top consuming applications, and 7-day/30-day historical daily trends.

### 7. Audit Center
- Complete searchable audit log feed tracking API key operations, webhook edits, connector changes, permission updates, and authentication events. Supports bookmarking critical audit logs.

### 8. Security Center
- Security score calculation (0–100), active security alerts, expired key warnings, inactive key clean-up recommendations, and webhook failure diagnostic alerts.

### 9. System Observability
- Real-time status indicators for Database, API Gateway, Webhook Delivery Queue, and Connector Engine.

### 10. Universal Global Search
- Global search bar overlay allowing instant cross-entity searching across API Keys, Applications, Webhooks, Connectors, Domain Events, and Audit Logs.

---

## Management REST API Endpoint Summary (`/api/v1/developer-platform`)

| Endpoint | Method | Required Scope | Description |
|---|---|---|---|
| `/api/v1/developer-platform/dashboard` | GET | `developer.read` | Get Developer Dashboard overview & metrics |
| `/api/v1/developer-platform/analytics` | GET | `developer.read` | Get visual API usage analytics dataset |
| `/api/v1/developer-platform/apps` | GET | `developer.read` | List developer applications |
| `/api/v1/developer-platform/apps` | POST | `developer.write` | Register new developer application |
| `/api/v1/developer-platform/apps/:id/toggle` | PATCH | `developer.write` | Toggle active/inactive application status |
| `/api/v1/developer-platform/apikeys` | GET | `apikey.manage` | List API keys for an application |
| `/api/v1/developer-platform/apikeys` | POST | `apikey.manage` | Create API key (returns raw key **ONLY ONCE**) |
| `/api/v1/developer-platform/apikeys/:id/rotate` | POST | `apikey.manage` | Rotate API key |
| `/api/v1/developer-platform/apikeys/:id/revoke` | POST | `apikey.manage` | Revoke API key |
| `/api/v1/developer-platform/apikeys/:id/stats` | GET | `apikey.manage` | Get usage statistics for specific API key |
| `/api/v1/developer-platform/webhooks` | GET | `webhook.manage` | List webhook subscriptions |
| `/api/v1/developer-platform/webhooks` | POST | `webhook.manage` | Create webhook subscription |
| `/api/v1/developer-platform/webhooks/:id/toggle` | PATCH | `webhook.manage` | Pause / Resume webhook subscription |
| `/api/v1/developer-platform/webhooks/:id/rotate-secret` | POST | `webhook.manage` | Rotate webhook signing secret |
| `/api/v1/developer-platform/webhooks/deliveries/:id/replay` | POST | `webhook.manage` | Replay failed webhook delivery |
| `/api/v1/developer-platform/webhooks/:id/logs` | GET | `webhook.manage` | Get delivery logs for subscription |
| `/api/v1/developer-platform/connectors` | GET | `connector.manage` | List active connections & available providers |
| `/api/v1/developer-platform/connectors/connections/:id/test` | POST | `connector.manage` | Test connection health |
| `/api/v1/developer-platform/connectors/connections/:id/sync` | POST | `connector.manage` | Trigger manual data synchronization job |
| `/api/v1/developer-platform/connectors/connections/:id/rotate` | POST | `connector.manage` | Rotate connection credentials |
| `/api/v1/developer-platform/connectors/connections/:id` | DELETE | `connector.manage` | Remove connection |
| `/api/v1/developer-platform/audit` | GET | `audit.read` | Search & filter audit logs |
| `/api/v1/developer-platform/security` | GET | `developer.read` | Get security report & recommendations |
| `/api/v1/developer-platform/observability` | GET | `developer.read` | Get system observability status |
| `/api/v1/developer-platform/search` | GET | `developer.read` | Universal global search overlay |
| `/api/v1/developer-platform/preferences` | GET / PUT | `developer.write` | Get / Update dashboard & notification preferences |

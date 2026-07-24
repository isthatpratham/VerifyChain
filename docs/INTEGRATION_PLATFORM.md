# Enterprise Integration Platform Architecture — Phase 8.1

## Overview

The **Enterprise Integration Platform** is the single, isolated bounded context responsible for managing all external system communications for VerifyChain.

It enforces a strict architectural isolation rule:
$$\text{Business Profile} \rightarrow \text{Compliance} \rightarrow \text{Health} \rightarrow \text{Supplier Trust} \rightarrow \text{Distribution} \rightarrow \mathbf{Integration\ Platform} \rightarrow \text{External Systems}$$

No internal module may directly call external systems (ERP, CRM, Government Portals, OAuth providers, third-party APIs). All external interactions flow through the Integration Platform via versioned event contracts, cryptographic security, and scope-based permissions.

---

## Architectural Principles

1. **Single Gateway Rule**: All inbound and outbound external traffic is mediated by the Integration Platform.
2. **Zero Raw Secret Storage**: API keys are hashed with SHA-256; integration credentials & secrets are encrypted at rest using **AES-256-GCM**.
3. **Fine-Grained Scope Permissions**: API keys are bound to explicit permissions (`business.read`, `trust.read`, `compliance.read`, etc.).
4. **Versioned Public Event Contracts**: Domain events are transformed into public contracts (`BusinessUpdated`, `SupplierTrustPublished`, etc.) that decouple internal database schemas from external consumers.
5. **Auditable & Observable**: All key operations, credential modifications, permission grants, and API key invocations produce immutable audit logs and correlation-traced telemetry.

---

## Domain Models & Database Schema

The Integration Platform introduces 12 additive PostgreSQL tables:

```
+---------------------------+        +-------------------------------+
|       integrations        |        |  integration_configurations   |
+---------------------------+        +-------------------------------+
| id (PK)                   |<------1| id (PK)                       |
| integration_id (UK)       |        | integration_id (FK)           |
| name, type, provider_code |        | msme_id, environment          |
| status, capabilities      |        | base_url, auth_type           |
+---------------------------+        +-------------------------------+
              |                                     |
              |1                                   1|
              v                                     v
+---------------------------+        +-------------------------------+
|  integration_connections  |        |      integration_secrets      |
+---------------------------+        +-------------------------------+
| id (PK)                   |        | id (PK)                       |
| integration_id (FK)       |        | configuration_id (FK)         |
| msme_id                   |        | secret_key, encrypted_value   |
| status, health_status     |        | encryption_algorithm          |
+---------------------------+        +-------------------------------+
```

```
+---------------------------+        +-------------------------------+
|   developer_applications  |        |           api_keys            |
+---------------------------+        +-------------------------------+
| id (PK)                   |<------1| id (PK)                       |
| app_id (UK), msme_id      |        | developer_app_id (FK)         |
| name, environment         |        | key_prefix, key_hash (UK)     |
+---------------------------+        | status, scopes, expires_at    |
              |                      +-------------------------------+
             1|                                     |1
              v                                     v
+---------------------------+        +-------------------------------+
|   webhook_subscriptions   |        |         api_key_usage         |
+---------------------------+        +-------------------------------+
| id (PK)                   |        | id (PK)                       |
| subscription_id (UK)      |        | api_key_id (FK)               |
| target_url, secret_hash   |        | endpoint, status_code         |
+---------------------------+        +-------------------------------+
```

---

## API Key Security Infrastructure

API keys are managed by `ApiKeyManager.js`:

- **Key Format**: `vc_live_<48-hex-chars>` (Production) or `vc_test_<48-hex-chars>` (Sandbox).
- **Storage**: Only the SHA-256 hash of the key is stored in the database (`api_keys.key_hash`).
- **Rotation & Revocation**: Keys can be rotated (generating a new pair and setting the old key to `ROTATED`) or revoked with a reason.
- **Verification**: `timingSafeEqual` comparison prevents timing side-channel attacks.

---

## Scope & Permission Model

API Key permissions are governed by `ScopePermissions.js`:

| Scope | Description |
|---|---|
| `business.read` | Read MSME business profile information |
| `business.write` | Update MSME business profile fields |
| `compliance.read` | Read statutory compliance records and rules status |
| `health.read` | Read Health Intelligence scores and category breakdowns |
| `trust.read` | Read Supplier Trust Profile, decision, and snapshot |
| `distribution.read` | Read Trust Distribution identity, channels, and configs |
| `public.verify` | Resolve public QR tokens and verified supplier cards |
| `webhook.manage` | Create, update, or revoke webhook subscriptions |
| `integration.manage` | Configure integration providers and secrets |

---

## Integration Registry

The `IntegrationRegistry.js` provides an extensible template engine for registering future provider capabilities:

```javascript
const IntegrationRegistry = require('../integrationPlatform/registry/IntegrationRegistry');

// Query supported capabilities
const capabilities = IntegrationRegistry.listSupportedCapabilities();
// Returns registered provider capability templates (SAP S/4HANA, Tally Prime, Salesforce CRM, GST Portal, Custom Webhooks)
```

---

## Event Contracts

Public events published by the platform follow `EventContracts.js`:

```javascript
const { createEventPayload, INTEGRATION_EVENTS } = require('../integrationPlatform');

const payload = createEventPayload(INTEGRATION_EVENTS.SUPPLIER_TRUST_PUBLISHED, {
  msmeId: 8,
  publicSlug: 'apex-precision-components-pvt-ltd-8',
  trustLevel: 'VERIFIED',
});
```

---

## Future Extension Guidelines

To connect a future ERP, CRM, or Government provider in subsequent phases:
1. Register provider metadata in `IntegrationRegistry`.
2. Configure credentials in `IntegrationConfiguration` and `IntegrationSecret`.
3. Consume public event contracts via `EventContracts`.
4. Enforce permission scopes via `ScopePermissions`.

Core VerifyChain domain modules will remain completely untouched.

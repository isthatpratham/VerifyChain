# Enterprise Third-Party Connector & Integration Adapter Framework Documentation — Phase 8.4

## Overview

The **VerifyChain Connector & Adapter Framework** enables enterprise ERPs (SAP S/4HANA, Tally Prime), CRMs (Salesforce), Accounting Software, Government Statutory Portals (GST Portal, Udyam), and Partner Platforms to integrate with VerifyChain via standardized, isolated adapters.

---

## Architectural Principles & Outbound Boundary

$$\text{Business Profile} \rightarrow \text{Compliance} \rightarrow \text{Health} \rightarrow \text{Supplier Trust} \rightarrow \text{Distribution} \rightarrow \text{Integration Platform} \rightarrow \mathbf{Adapter\ Framework} \rightarrow \text{External Systems}$$

1. **Vendor Isolation**: Core application modules never directly communicate with third-party software. All interactions pass through the Adapter Framework.
2. **Provider Abstraction**: All connectors extend [`BaseIntegrationAdapter`](file:///c:/Users/premd/OneDrive/Documents/VerifyChain/server/src/connectorPlatform/adapters/BaseIntegrationAdapter.js) and implement uniform lifecycle hooks.
3. **Encrypted Credentials**: Credentials and API keys are encrypted at rest using **AES-256-GCM** symmetric encryption.
4. **Bidirectional Data Mapping**: Configurable field transformations translate vendor schemas to VerifyChain canonical domain models.
5. **Synchronization Engine**: Supports `FULL`, `INCREMENTAL`, `MANUAL`, and `REAL_TIME` sync jobs with conflict resolution.

---

## Supported Connector Categories

- `ERP` (Enterprise Resource Planning: SAP S/4HANA, NetSuite, Tally)
- `CRM` (Customer Relationship Management: Salesforce, HubSpot)
- `ACCOUNTING` (QuickBooks, Zoho Books)
- `PROCUREMENT` (Ariba, Coupa)
- `IDENTITY` (Okta, Azure AD / Microsoft Entra ID)
- `GOVERNMENT` (GST Portal, Udyam, Income Tax India)
- `ANALYTICS` (Mixpanel, Amplitude)
- `BI` (PowerBI, Tableau)
- `STORAGE` (AWS S3, Azure Blob, Google Cloud Storage)
- `NOTIFICATION` (Twilio, SendGrid)
- `MOBILE` (iOS/Android Native Push)
- `PARTNER` (Custom Enterprise Partner Systems)

---

## Base Adapter Interface & Extension Guide

To add a new custom adapter, extend `BaseIntegrationAdapter`:

```javascript
const { BaseIntegrationAdapter } = require('../connectorPlatform');

class CustomErpAdapter extends BaseIntegrationAdapter {
  constructor() {
    super('custom_erp_code', 'Custom Enterprise ERP', 'ERP');
  }

  async connect(credentials) {
    this.isConnected = true;
    return { success: true, status: 'CONNECTED' };
  }

  async testConnection(credentials) {
    return { success: true, statusCode: 200, pingMs: 15 };
  }

  async syncData(syncType, params) {
    return {
      syncType,
      recordsProcessed: 10,
      recordsUpdated: 2,
      conflictsDetected: 0,
      items: [ ... ],
    };
  }
}
```

Register the new adapter with `ConnectorProviderRegistry`:

```javascript
ConnectorProviderRegistry.registerAdapter(new CustomErpAdapter());
```

---

## Connector Management REST APIs (`/api/v1/connectors`)

| Path | Method | Scope Required | Description |
|---|---|---|---|
| `/api/v1/connectors/providers` | GET | `integration.manage` | List registered provider capabilities & categories |
| `/api/v1/connectors/connections` | POST | `integration.manage` | Create new connection with AES-256-GCM encrypted credentials |
| `/api/v1/connectors/connections` | GET | `integration.manage` | List configured connections |
| `/api/v1/connectors/connections/health` | GET | `integration.manage` | Run health & latency checks across all connections |
| `/api/v1/connectors/connections/:id` | GET | `integration.manage` | Get connection details |
| `/api/v1/connectors/connections/:id/test` | POST | `integration.manage` | Test connection health & latency |
| `/api/v1/connectors/connections/:id/sync` | POST | `integration.manage` | Trigger manual data synchronization job |
| `/api/v1/connectors/connections/:id/rotate-credentials` | POST | `integration.manage` | Rotate encrypted connection credentials |
| `/api/v1/connectors/conflicts/:conflictId/resolve` | POST | `integration.manage` | Resolve synchronization conflict |
| `/api/v1/connectors/connections/:id` | DELETE | `integration.manage` | Delete connection |

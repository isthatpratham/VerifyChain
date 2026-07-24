# Enterprise Webhook & Event Subscription Platform Documentation — Phase 8.3

## Overview

The **VerifyChain Webhook Platform** enables external systems, enterprise ERPs, CRMs, and partner portals to subscribe to real-time domain events and receive secure, reliable HTTP POST notifications.

---

## Architectural Principles & Data Flow

$$\text{Business Profile} \rightarrow \text{Compliance} \rightarrow \text{Health} \rightarrow \text{Supplier Trust} \rightarrow \text{Distribution} \rightarrow \text{Integration Platform} \rightarrow \mathbf{Webhook\ Platform} \rightarrow \text{Subscriber Endpoints}$$

1. **Isolation**: Internal modules never directly call subscriber endpoints. All outbound notifications flow through the Webhook Platform.
2. **Asynchronous & Non-Blocking**: Event delivery runs asynchronously in background queues without impacting core application request latency.
3. **Cryptographic HMAC-SHA256 Signing**: Every delivery includes an `X-VerifyChain-Signature` header signed with a unique secret key (`whsec_...`).
4. **Exponential Backoff Retries**: Failed deliveries are retried automatically up to 5 times (`10s`, `30s`, `5m`, `30m`, `2h`) before moving to the Dead Letter Queue (`PERMANENTLY_FAILED`).
5. **On-Demand Replay**: Any past delivery can be replayed on-demand via API.

---

## Standardized Event Catalog

| Event Name | Category | Description |
|---|---|---|
| `BusinessCreated` | Business | New enterprise MSME profile created |
| `BusinessUpdated` | Business | MSME profile attributes updated |
| `BusinessVerified` | Business | Statutory details verified |
| `ComplianceCreated` | Compliance | New compliance requirement registered |
| `ComplianceUpdated` | Compliance | Compliance record status updated |
| `ComplianceRenewed` | Compliance | Statutory license/certificate renewed |
| `ComplianceExpired` | Compliance | Statutory compliance expired |
| `ComplianceHealthCalculated` | Compliance | Health Intelligence score computed |
| `ComplianceHealthChanged` | Compliance | Risk score or category breakdown changed |
| `SupplierTrustCreated` | Trust | Supplier Trust Profile initialized |
| `SupplierTrustPublished` | Trust | Profile published to public directory |
| `SupplierTrustUpdated` | Trust | Trust status or level modified |
| `SupplierTrustScoreChanged`| Trust | Snapshot score updated |
| `DistributionCreated` | Distribution | Distribution Identity established |
| `DistributionPublished` | Distribution | Share links and assets published |
| `QRCodeGenerated` | Distribution | Dynamic QR verification asset generated |
| `TrustAssetGenerated` | Distribution | Badge/widget embed asset generated |
| `PublicProfilePublished` | Distribution | Public verification portal live |
| `IntegrationConnected` | Integration | Integration provider connected |
| `APIKeyCreated` | Developer | New API key pair issued |
| `APIKeyRevoked` | Developer | API key revoked |
| `DeveloperApplicationCreated`| Developer | Developer app registered |
| `WebhookCreated` | Webhook | Webhook subscription created |
| `WebhookUpdated` | Webhook | Webhook target URL or events updated |
| `WebhookDeleted` | Webhook | Webhook subscription deleted |
| `WebhookPingTest` | Webhook | Test ping event |

---

## Webhook Signature Verification Guide

Every HTTP POST payload sent to your webhook endpoint contains the following headers:

- `X-VerifyChain-Event`: The event type (e.g. `SupplierTrustPublished`)
- `X-VerifyChain-Delivery-ID`: Unique delivery identifier (e.g. `del_1784899012`)
- `X-VerifyChain-Timestamp`: UNIX timestamp in seconds
- `X-VerifyChain-Signature`: `t=<timestamp>,v1=<hmac-sha256-hex>`

### Verification Algorithm (Node.js Example)

```javascript
const crypto = require('crypto');

function verifyVerifyChainWebhook(rawBody, signatureHeader, signingSecret, toleranceSeconds = 300) {
  const parts = signatureHeader.split(',');
  let timestamp = null;
  let signatureHex = null;

  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key === 't') timestamp = parseInt(val, 10);
    if (key === 'v1') signatureHex = val;
  }

  // Prevent Replay Attacks
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    throw new Error('Signature timestamp outside tolerance window');
  }

  // Recompute HMAC-SHA256 signature
  const toSign = `${timestamp}.${typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)}`;
  const expected = crypto.createHmac('sha256', signingSecret).update(toSign, 'utf8').digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signatureHex), Buffer.from(expected));
}
```

---

## Delivery Payload Envelope

```json
{
  "deliveryId": "del_1784899012_9876",
  "subscriptionId": "WH-SUB-1784899012_1234",
  "event": "SupplierTrustPublished",
  "contractVersion": "v1.0.0",
  "timestamp": "2026-07-24T18:55:00.000Z",
  "correlationId": "corr_int_1784899012_a1b2",
  "isReplay": false,
  "data": {
    "msmeId": 8,
    "publicSlug": "apex-precision-components-pvt-ltd-8",
    "trustLevel": "VERIFIED",
    "trustScore": 85
  }
}
```

---

## Webhook REST APIs (`/api/v1/webhooks`)

| Endpoint | Method | Scope Required | Description |
|---|---|---|---|
| `/api/v1/webhooks/catalog` | GET | `webhook.manage` | List all supported events in catalog |
| `/api/v1/webhooks` | POST | `webhook.manage` | Create webhook subscription (returns `whsec_...` once) |
| `/api/v1/webhooks` | GET | `webhook.manage` | List active & paused subscriptions |
| `/api/v1/webhooks/:id` | GET | `webhook.manage` | Retrieve specific subscription details |
| `/api/v1/webhooks/:id` | PATCH | `webhook.manage` | Update target URL or subscribed events |
| `/api/v1/webhooks/:id` | DELETE | `webhook.manage` | Delete webhook subscription |
| `/api/v1/webhooks/:id/pause` | POST | `webhook.manage` | Pause event delivery |
| `/api/v1/webhooks/:id/resume` | POST | `webhook.manage` | Resume event delivery |
| `/api/v1/webhooks/:id/rotate-secret` | POST | `webhook.manage` | Rotate HMAC signing secret |
| `/api/v1/webhooks/:id/ping` | POST | `webhook.manage` | Dispatch test ping event |
| `/api/v1/webhooks/:id/deliveries` | GET | `webhook.manage` | List delivery attempt history |
| `/api/v1/webhooks/deliveries/:deliveryId/replay` | POST | `webhook.manage` | Replay delivery attempt on-demand |

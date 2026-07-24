# Public REST API Platform Documentation — Version 1 (`v1`)

## Overview

The **VerifyChain Public REST API Platform** exposes platform capabilities securely through predictable, versioned REST endpoints (`/api/v1/`).

It is designed to power:
- Enterprise Partner Systems & ERPs (SAP, Oracle, Tally, Zoho)
- CRMs (Salesforce, Hubspot)
- Mobile Applications & Third-Party Portals
- Public Enterprise Verification Portals

---

## Interactive Documentation & OpenAPI Spec

- **Swagger UI Interface**: `http://localhost:5000/api/v1/docs`
- **OpenAPI v3.0.3 Specification**: `http://localhost:5000/api/v1/docs/openapi.json`

---

## Versioning Strategy

All endpoints are versioned under `/api/v1/`.
Future major versions (`v2`, `v3`) will be mounted alongside `v1` without breaking backward compatibility for existing clients.

---

## Authentication

Authentication uses high-entropy API Keys managed by the Phase 8.1 Integration Platform:

### Request Headers
- **Option 1**: `x-api-key: vc_live_...` or `vc_test_...`
- **Option 2**: `Authorization: Bearer vc_live_...` or `vc_test_...`

```bash
curl -X GET "http://localhost:5000/api/v1/businesses" \
     -H "x-api-key: vc_live_e3f982a17b084920b123..."
```

> **Note**: Public Verification endpoints (`/api/v1/verify/:slug`) allow unauthenticated calls while supporting optional API key authentication.

---

## Scope & Permission Authorization

API Keys enforce fine-grained scope permissions:

| Scope | Required For |
|---|---|
| `public.verify` | Resolving public trust profiles and public assets |
| `business.read` | Searching and retrieving MSME business profiles |
| `business.write` | Updating MSME business profile attributes |
| `compliance.read` | Querying statutory compliance records |
| `health.read` | Retrieving Health Intelligence scores & category breakdowns |
| `trust.read` | Accessing supplier trust profiles, decisions & timelines |
| `distribution.read` | Querying trust distribution identities and channel configs |
| `developer.manage` | Generating, rotating, and revoking API keys |

---

## Standard Response Envelope

All API v1 endpoints return a uniform JSON envelope:

```json
{
  "success": true,
  "data": {
    "id": 8,
    "business_name": "Apex Precision Components Pvt Ltd",
    "gstin": "27AABCA1234H1Z0",
    "sector": "Manufacturing"
  },
  "metadata": {
    "verifiedAt": "2026-07-24T18:48:30.000Z"
  },
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "requestId": "req_1784899012_a1b2",
  "timestamp": "2026-07-24T18:48:30.000Z"
}
```

---

## Standard Error Model

Error responses return HTTP 4xx / 5xx status codes with a standardized error object:

```json
{
  "success": false,
  "error": {
    "statusCode": 403,
    "errorCode": "INSUFFICIENT_SCOPE",
    "message": "Insufficient permissions. Required scope: 'business.write'.",
    "details": {
      "requiredScope": "business.write",
      "grantedScopes": ["business.read"]
    },
    "requestId": "req_1784899015_c3d4",
    "timestamp": "2026-07-24T18:48:30.000Z",
    "documentationUrl": "http://localhost:5000/api/v1/docs"
  }
}
```

---

## Rate Limiting & Response Headers

Rate limiting is enforced per API Key (or per client IP if unauthenticated):

- **Default Limit**: `120 requests / minute`
- **Response Headers**:
  - `X-RateLimit-Limit`: 120
  - `X-RateLimit-Remaining`: 119
  - `X-RateLimit-Reset`: `<seconds-until-reset>`

When limits are exceeded, HTTP **429 Too Many Requests** is returned.

---

## Resource Summary

### Public Verification
- `GET /api/v1/verify/:slug` — Resolve public enterprise verification portal by slug / ID.
- `GET /api/v1/verify/:slug/assets` — Retrieve public trust distribution assets (QR code, badge HTML, widget snippet, certificate link).

### Business Profiles
- `GET /api/v1/businesses` — List & search enterprise business profiles (supports filtering, search, sorting, pagination).
- `GET /api/v1/businesses/:id` — Retrieve business profile by ID.
- `PATCH /api/v1/businesses/:id` — Update business profile fields.

### Statutory Compliance
- `GET /api/v1/compliance` — List compliance records with authority/status filtering.
- `GET /api/v1/compliance/health` — Retrieve Health Intelligence breakdown & risk scores.

### Supplier Trust
- `GET /api/v1/trust/profiles` — List supplier trust profiles.
- `GET /api/v1/trust/profiles/:id` — Retrieve detailed trust profile & verification status.

### Trust Distribution
- `GET /api/v1/distribution/identities` — List distribution identities & channel capabilities.

### Developer Platform
- `POST /api/v1/developer/apps` — Register developer application.
- `POST /api/v1/developer/keys` — Generate high-entropy API key pair (raw key shown ONCE).
- `GET /api/v1/developer/keys` — List API keys for application.
- `POST /api/v1/developer/keys/:id/rotate` — Rotate API key.
- `POST /api/v1/developer/keys/:id/revoke` — Revoke API key.

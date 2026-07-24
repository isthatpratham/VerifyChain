# TRUST DISTRIBUTION PLATFORM PRODUCTION SPECIFICATION

**Version:** 1.0.0 (Phase 7.6 Release Candidate)  
**Module:** Trust Distribution Subsystem Bounded Context  
**Authoritative Source of Truth:** `/docs`  

---

## 1. Executive Subsystem Overview

The **Trust Distribution Platform** is a multi-channel broadcasting and verification subsystem responsible for publishing verified Supplier Trust Profiles across digital, printable, embedded, and mobile verification channels.

### Key Submodules
1. **Trust Distribution Foundation (7.1)**: Canonical `TrustDistributionIdentity`, versioned branding config, and timeline logging.
2. **Dynamic QR Verification Engine (7.2)**: HMAC-SHA256 token signing, TTL validation, manual revocation, and high-density vector/raster QR generation.
3. **Trust Asset Generation Platform (7.3)**: Centralized `TrustBrandEngine` and multi-format `TrustAssetGenerator` (Cards, Badges, Social OpenGraph, Email Signatures, PDF Certificates).
4. **Trust Experience & Distribution Channels (7.4)**: `EmbeddableTrustWidget.jsx`, `EmbeddableTrustBadge.jsx`, canonical share links, and deep-link resolution.
5. **Trust Distribution Orchestration (7.5)**: Selective asset regeneration, dependency graph mapping, correlation IDs, and telemetry metrics tracking.
6. **Production Readiness & Hardening (7.6)**: 12-test automated audit suite passing with zero failures.

---

## 2. Complete Architecture

```
                               Domain Event Bus
          (TrustLevelChanged, QRCodeRevoked, BrandUpdated)
                                      │
                                      ▼
                        TrustDistributionOrchestrator
                       (Correlation ID & Metrics Tracking)
                                      │
                                      ▼
                        TrustDistributionImpactEngine
                     (Selective Asset Regeneration Check)
                                      │
                                      ▼
                         Trust Asset Generator Engine
               (Cards, Badges, Social Cards, PDF Certificates)
                                      │
                                      ▼
                       REST Endpoints & Public Experience
                 (/verify/:slug, /embed/widget/*, /embed/badge/*)
```

---

## 3. Supported Distribution Channels Matrix

| Channel Code | Name | Status | Output Format |
| :--- | :--- | :--- | :--- |
| `PUBLIC_LINK` | Shareable Public Link | `AVAILABLE` | HTML (`/verify/:slug`) |
| `QR_CODE` | Dynamic QR Code | `AVAILABLE` | PNG DataURL & SVG |
| `TRUST_CARD` | Digital Verified Card | `AVAILABLE` | SVG Vector Graphic |
| `CERTIFICATE` | Statutory Compliance Certificate | `AVAILABLE` | PDF Document Stream |
| `EMBED_BADGE` | Embeddable HTML Badge | `AVAILABLE` | SVG & HTML Snippet |
| `WIDGET` | Interactive Website Widget | `AVAILABLE` | iFrame (`/embed/widget/:slug`) |
| `MOBILE_WALLET` | Mobile Wallet Sync | `PLANNED` | Digital Credentials Pass |

---

## 4. REST API Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trust-distribution/identity` | Yes | Retrieve or initialize canonical distribution identity |
| `GET` | `/api/trust-distribution/config` | Yes | Retrieve distribution configuration and token policies |
| `GET` | `/api/trust-distribution/timeline` | Yes | Retrieve distribution timeline event logs |
| `GET` | `/api/trust-distribution/channels` | Yes | Retrieve supported distribution channel catalog |
| `POST` | `/api/trust-distribution/qr/generate` | Yes | Generate dynamic QR code & signed token |
| `POST` | `/api/trust-distribution/qr/regenerate` | Yes | Regenerate dynamic QR token |
| `POST` | `/api/trust-distribution/qr/revoke` | Yes | Revoke QR token |
| `GET` | `/api/trust-distribution/qr/resolve/:token` | No | Resolve signed QR token verification |
| `POST` | `/api/trust-distribution/assets/generate` | Yes | Generate multi-format trust asset package |
| `GET` | `/api/trust-distribution/assets/download/certificate` | Yes | Download printable PDF certificate |
| `GET` | `/api/trust-distribution/experience/share-link` | Yes | Retrieve public share link & social share URLs |
| `GET` | `/api/trust-distribution/experience/widget-config` | Yes | Retrieve website widget URL & iframe code |
| `GET` | `/api/trust-distribution/experience/badge-config` | Yes | Retrieve trust badge SVG & HTML embed code |
| `GET` | `/api/trust-distribution/experience/deep-link/:slug` | No | Resolve deep-link parameters |
| `POST` | `/api/trust-distribution/orchestration/synchronize` | Yes | Trigger distribution lifecycle sync |
| `POST` | `/api/trust-distribution/orchestration/impact-analysis` | Yes | Preview impact analysis for event type |
| `GET` | `/api/trust-distribution/orchestration/metrics` | Yes | Retrieve distribution lifecycle telemetry metrics |

---

## 5. Security & Token Model

- **HMAC-SHA256 Signing**: All QR verification tokens are signed using `JWT_SECRET`.
- **Structure**: `stableDistributionId:publicSlug:issuedAt:expiresAt:signature`.
- **Tamper Detection**: Altered payloads or signatures are rejected instantly (`INVALID_SIGNATURE`).
- **Revocation**: Blacklist set `revokedTokens` tracks revoked tokens.

---

## 6. Verification & Quality Audit Checklist

- [x] ESLint passing with **0 errors and 0 warnings** across client and server.
- [x] Automated test suite (`node --test test/trustDistributionPlatform.test.js`) passing cleanly with **12/12 passing tests**.
- [x] Vite production build (`npm run build`) passing in 6.84s.
- [x] 100% Frontend Preservation Contract compliance verified.

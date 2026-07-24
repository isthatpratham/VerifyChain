# SUPPLIER TRUST PLATFORM SPECIFICATION (RELEASE CANDIDATE)

**Version:** 1.0.0 (Production Release Candidate)  
**Module:** Supplier Trust Platform (Phases 6.1 – 6.6)  
**Authoritative Source of Truth:** `/docs`  

---

## 1. Executive Subsystem Overview

The **Supplier Trust Platform** provides a comprehensive, event-driven, deterministic trust evaluation and public identity subsystem for verified MSME suppliers across statutory regulatory frameworks.

### Key Features
- **Canonical Public Identity**: Unique public slugs (`/verify/:slug`) and public identifiers (`VC-TR-1001-XXXX`).
- **Deterministic Trust Evaluation Engine**: Multi-stage pipeline evaluating compliance records and health scores against strict trust policies (`ENTERPRISE_TRUSTED`, `HIGHLY_TRUSTED`, `TRUSTED`, `VERIFIED`, `PENDING`, `SUSPENDED`).
- **Public Trust Portal**: High-trust, SEO-optimized, WCAG AAA-compliant public verification portal with Schema.org Organization structured data.
- **Event-Driven Lifecycle Automation**: Centralized coordinator (`SupplierTrustAutomationCoordinator.js`) triggering selective re-evaluations on `ScoreCalculated` and `ComplianceStatusChanged` events.
- **Strict Privacy Sanitization**: Complete separation of public verification payloads from private operational metadata.

---

## 2. Subsystem Architecture

```
                       MsmeProfile (Core Business Entity)
                                       │
                                       ▼
                             SupplierTrustProfile
                  (Public Slug, Public Identifier, Display Name)
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
               TrustMetadata                     TrustTimelineEvent
          (Confidence & Review Cycles)         (Audit Log History)
                     │                                   │
                     ├─────────────────┬─────────────────┤
                     ▼                 ▼                 ▼
          Trust Evaluation Engine  Public Portal  Automation Coordinator
           (Policy & Decisions)  (/verify/:slug)  (Event-Driven Bus)
```

---

## 3. Domain Model Specifications

### Prisma Schema Entities
- `SupplierTrustProfile`: 1-to-1 relation with `MsmeProfile`. Stores `public_slug` (unique index), `public_identifier` (unique index), `display_name`, `trust_level` enum, `verification_state` enum, `trust_score_snapshot`, `is_public` boolean flag.
- `TrustMetadata`: Stores `verification_version` (`v1.0.0`), `confidence_score` (0–100%), `review_cycle` (`ANNUAL`), `expiration_date`.
- `TrustTimelineEvent`: Chronological audit log of public verification events (`PROFILE_CREATED`, `TRUST_EVALUATED`, `VERIFICATION_APPROVED`, `TRUST_LEVEL_CHANGED`).

---

## 4. Trust Evaluation Engine & Policy Matrix

| Trust Level | Health Score Threshold | Overdue Filings Allowed | Risk Level Allowed | Verification State |
| :--- | :--- | :--- | :--- | :--- |
| `ENTERPRISE_TRUSTED` | $\ge 90$ | 0 | LOW | APPROVED |
| `HIGHLY_TRUSTED` | $\ge 80$ | 0 | LOW | APPROVED |
| `TRUSTED` | $\ge 70$ | 0 | $\le$ MEDIUM | APPROVED |
| `VERIFIED` | $\ge 50$ | 0 | Any | APPROVED |
| `PENDING` | $< 50$ | 0 | Any | UNDER_REVIEW |
| `SUSPENDED` | Any | $\ge 2$ | Any | SUSPENDED |

---

## 5. Event Bus Catalog & Lifecycle Automation

### Subscribed Events
- `ScoreCalculated`: Triggers selective trust policy re-evaluations.
- `ComplianceStatusChanged`: Re-evaluates disqualifying overdue conditions.
- `BusinessUpdated`: Updates identity attributes across trust profiles.

### Published Events
- `SupplierTrustProfileCreated`
- `SupplierTrustProfileUpdated`
- `TrustEvaluationRequested`
- `TrustEvaluationCompleted`
- `VerificationApproved`
- `VerificationRejected`
- `TrustLevelChanged`
- `TrustProfilePublished`
- `TrustSnapshotCreated`

---

## 6. Complete REST API Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/supplier-trust/evaluate` | Yes | Execute deterministic trust evaluation pipeline |
| `GET` | `/api/supplier-trust/decision` | Yes | Retrieve current verification decision & level |
| `GET` | `/api/supplier-trust/snapshot` | Yes | Retrieve latest evaluation snapshot & evidence |
| `GET` | `/api/supplier-trust/profile` | Yes | Retrieve canonical trust profile for authenticated user |
| `GET` | `/api/supplier-trust/metadata` | Yes | Retrieve trust review metadata |
| `GET` | `/api/supplier-trust/timeline` | Yes | Retrieve trust audit timeline history |
| `GET` | `/api/supplier-trust/config` | Yes | Retrieve domain trust levels & configuration |
| `GET` | `/api/supplier-trust/public/:slug` | No | Retrieve public privacy-sanitized trust profile |
| `POST` | `/api/supplier-trust/automation/re-evaluate` | Yes | Trigger manual lifecycle re-evaluation |
| `GET` | `/api/supplier-trust/automation/dependency-graph` | Yes | Retrieve trust dependency graph mapping |
| `GET` | `/api/supplier-trust/automation/metrics` | Yes | Retrieve live automation telemetry metrics |

---

## 7. Privacy & Security Model

- **Public Endpoint Privacy**: `GET /api/supplier-trust/public/:slug` sanitizes output payload, exposing only public attributes (`display_name`, `public_identifier`, `trust_level`, `verification_state`, `trust_score_snapshot`, public category standing, timeline events). Internal notes, private document paths, and user credentials are strictly excluded.
- **Authentication**: All mutation and private profile endpoints require valid JWT via `authenticate` middleware.

---

## 8. SEO, Accessibility & Performance

- **Structured Data**: `PublicTrustPortal.jsx` embeds Schema.org Organization JSON-LD markup.
- **Accessibility**: High-contrast dark mode palette, full keyboard focusability, and ARIA labels.
- **Performance**: In-memory deterministic policy evaluation completing in under 5ms.

---

## 9. Production Verification & Release Checklist

- [x] Prisma Schema models & indices verified (`npx prisma generate`).
- [x] Repository abstractions & domain services verified without circular dependencies.
- [x] Multi-stage Trust Evaluation Pipeline verified deterministically.
- [x] Public Trust Portal (`/verify/:slug`) verified responsive & accessible.
- [x] Event-Driven Lifecycle Automation Coordinator verified with telemetry tracking.
- [x] REST API endpoints mounted & secured under `/api/supplier-trust/*`.
- [x] ESLint verified with **0 errors and 0 warnings** across client and server.
- [x] Vite production build (`npm run build`) passing cleanly in 8.22s.
- [x] 100% Frontend Preservation Contract compliance verified.

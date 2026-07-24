# COMPLIANCE HEALTH INTELLIGENCE & SCORE ENGINE SPECIFICATION

**Version:** 1.0.0  
**Module:** Compliance Health Intelligence Subsystem (Phases 5.1 – 5.6)  
**Authoritative Source of Truth:** `/docs`  

---

## 1. Executive Subsystem Overview

The **Compliance Health Intelligence Subsystem** provides a deterministic, explainable, reproducible, versioned, and event-driven architecture for evaluating, monitoring, and improving enterprise statutory compliance health.

### Key Characteristics
- **100% Deterministic**: Given identical statutory input records and configuration, the pipeline guarantees 100% identical outputs. No AI, no non-deterministic heuristics.
- **Explainable & Traceable**: Every score point deduction, category contribution, and recommendation links directly back to authoritative statutory filing records.
- **Loose Event-Driven Coupling**: Orchestrated via `DomainEventBus.js` and `HealthAutomationCoordinator.js` without circular module dependencies.
- **Immutable Versioning**: Configured via `HealthScoreConfig` (`v1.0.0`) with historical snapshots persisted in `health_score_snapshots`.

---

## 2. Architecture & Subsystem Topology

```
                                  Domain Events
           (BusinessUpdated, ComplianceStatusChanged, RuleActivated)
                                       │
                                       ▼
                         HealthAutomationCoordinator
                       (Dependency Graph Resolution)
                                       │
                                       ▼
                            ScorePipeline Coordinator
                                       │
  ┌─────────────────┬──────────────────┼──────────────────┬──────────────────┐
  ▼                 ▼                  ▼                  ▼                  ▼
Data Collection  Eligibility    Category Evaluator  Penalty & Bonus  Weighted Aggregator
  (Repositories)  Validation    (TAX, LABOUR, etc)     Engine         & Normalizer (0-100)
  └─────────────────┴──────────────────┼──────────────────┴──────────────────┘
                                       │
                                       ▼
                            HealthIntelligenceFacade
                   (Risk, Strengths/Weaknesses, Recommendations)
                                       │
                                       ▼
                         Database Snapshot Persistence
                      & REST API (/api/compliance/health/*)
```

---

## 3. Score Pipeline Stages

1. **Data Collection**: Assembles business profile (`MsmeProfile`), statutory compliance records (`ComplianceRecord`), active configuration (`HealthScoreConfig`), and category definitions (`ScoreCategory`).
2. **Eligibility Validation**: Ensures profile completeness, minimum required records, and active configuration.
3. **Category Evaluation**:
   - `TAX`: Evaluates Goods & Services Tax (GST) returns.
   - `LABOUR`: Evaluates EPFO and ESIC statutory contributions.
   - `CORPORATE`: Evaluates MCA annual filings (AOC-4, MGT-7).
   - `LICENSING`: Evaluates Udyam MSME certification and FSSAI licenses.
4. **Penalty & Bonus Evaluation**:
   - Penalty: `-15` points per overdue filing; `-5` points per filing due soon.
   - Bonus: `+5` points for 100% flawless statutory compliance history.
5. **Weighted Aggregation & Normalization**:
   - Aggregates category scores with equal weighting (1.0 default).
   - Clamps score strictly between `min_score` (0) and `max_score` (100).
6. **Confidence & Risk Classification**:
   - Data Completeness Confidence (0–100%).
   - Risk Level: `HIGH` (<60), `MEDIUM` (60–84), `LOW` (85–100).
7. **Snapshot Persistence & Event Dispatch**:
   - Persists snapshot record into `health_score_snapshots`.
   - Publishes `ScoreCalculated` and `HealthInsightsGenerated` to `DomainEventBus`.

---

## 4. Domain Event Bus Catalog

| Event Name | Producer | Consumers | Description |
| :--- | :--- | :--- | :--- |
| `BusinessUpdated` | `msme.service.js` | `HealthAutomationCoordinator` | Triggered on MSME profile updates |
| `ComplianceStatusChanged` | `compliance.service.js` | `HealthAutomationCoordinator` | Triggered when filing status updates |
| `ScoreCalculated` | `ScorePipeline.js` | `HealthIntelligenceFacade` | Triggered on score calculation completion |
| `HealthInsightsGenerated` | `HealthIntelligenceFacade` | Subscribed modules | Triggered on insights report creation |
| `RecommendationsGenerated` | `RecommendationEngine` | Subscribed modules | Triggered on recommendation generation |
| `RiskAnalysisCompleted` | `RiskAnalysisEngine` | Subscribed modules | Triggered on risk analysis completion |

---

## 5. Dependency Graph Mapping

| Changed Profile Field | Affected Authorities | Affected Scoring Category |
| :--- | :--- | :--- |
| `gstin` | `GST` | `TAX` |
| `employee_count` | `EPFO`, `ESIC` | `LABOUR` |
| `annual_turnover_lakh` | `GST`, `MCA` | `TAX`, `CORPORATE` |
| `is_food_business` | `FSSAI` | `LICENSING` |
| `udyam_number` | `UDYAM` | `LICENSING` |
| `state` / `sector` | `GST`, `MCA` | `TAX`, `CORPORATE` |

---

## 6. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/compliance/health/calculate` | Calculate/recalculate deterministic health score |
| `GET` | `/api/compliance/health/current` | Retrieve current score & latest snapshot |
| `GET` | `/api/compliance/health/breakdown` | Retrieve category breakdown and score rules |
| `GET` | `/api/compliance/health/insights` | Full deterministic health intelligence report |
| `GET` | `/api/compliance/health/insights/risk` | Deterministic risk analysis & impact report |
| `GET` | `/api/compliance/health/insights/strengths-weaknesses` | Enterprise strengths and weaknesses breakdown |
| `GET` | `/api/compliance/health/insights/recommendations` | Prioritized action recommendations |
| `GET` | `/api/compliance/health/insights/summary` | Executive health summary report |
| `POST` | `/api/compliance/health/automation/re-evaluate` | Trigger selective or full automation workflow |
| `GET` | `/api/compliance/health/automation/dependency-graph` | Inspect dependency graph mapping structure |
| `GET` | `/api/compliance/health/automation/metrics` | Inspect telemetry metrics and active workflows |
| `GET` | `/api/compliance/health/snapshots` | Retrieve historical score snapshots list |
| `GET` | `/api/compliance/health/config` | Retrieve active health score configuration |
| `GET` | `/api/compliance/health/categories` | List active scoring categories |
| `GET` | `/api/compliance/health/metadata` | Retrieve subsystem engine version & event catalog |

---

## 7. Operational & Production Readiness Checklist

- [x] **Deterministic Scoring**: Verified 100% reproducible score outputs across identical inputs.
- [x] **Loose Event Coupling**: Verified `DomainEventBus` listeners execute asynchronously without blocking requests.
- [x] **Frontend Preservation**: 100% compliance with Frontend Preservation Contract (0 UI/UX regressions).
- [x] **Code Quality**: ESLint verified with **0 errors and 0 warnings** across client and server codebases.
- [x] **Production Bundle**: Vite production build (`npm run build`) passing cleanly.
- [x] **Extensibility**: Ready for Phase 6 (Supplier Verification), Phase 7 (QR Engine), Phase 8 (Alerts), Phase 9 (Government Scheme Matcher), Phase 10 (Document Vault).

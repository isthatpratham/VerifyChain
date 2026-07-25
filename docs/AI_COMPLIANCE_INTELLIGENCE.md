# VerifyChain AI Compliance Intelligence Engine Architecture (Phase 9.2)

## Overview

The **AI Compliance Intelligence Engine** (`server/src/complianceIntelligence`) provides decision intelligence for the VerifyChain platform. It processes context aggregated by `AIContextBuilder` and produces explainable recommendations, multi-dimensional risk assessments, compliance gaps, remediation action plans, executive summaries, and transparent confidence indicators.

---

## 1. Architectural Pipeline

```
Business Profile → Compliance Engine → Compliance Health → Supplier Trust → Trust Distribution
                                                                  │
                                                                  ▼
                                                        [AI Context Builder]
                                                                  │
                                                                  ▼
                                                 [Compliance Intelligence Facade]
                                                                  │
                                ┌─────────────────┬───────────────┼───────────────┬────────────────┐
                                ▼                 ▼               ▼               ▼                ▼
                          [Gap Analyzer]  [Risk Analyzer] [Rec Engine] [Action Planner] [Summary Generator]
                                │                 │               │               │                │
                                └─────────────────┴───────────────┼───────────────┴────────────────┘
                                                                  ▼
                                                        [Explanation Engine]
                                                                  │
                                                                  ▼
                                                       [Confidence Scorer & Guardrails]
```

> **Strict Non-Mutation Rule**: The AI Compliance Intelligence Engine consumes platform data to generate insights, but **never modifies core business data directly**.

---

## 2. Core Sub-Engines

1. **Gap Analyzer (`GapAnalyzer.js`)**:
   - Detects missing registrations, expired/expiring statutory certificates, incomplete profiles, and suboptimal trust factors.
2. **Risk Analyzer (`RiskAnalyzer.js`)**:
   - Multi-dimensional scoring across 6 risk vectors: Financial Risk, Operational Risk, Supplier Risk, Trust Degradation Risk, Compliance Risk, and Regulatory Risk.
3. **Recommendation Engine (`RecommendationEngine.js`)**:
   - Generates explainable, context-aware recommendations containing Title, Description, Business Impact, Reasoning, Confidence Score, Priority, Affected Modules, Recommended Actions, Effort, Impact, and Supporting Evidence.
4. **Priority Engine (`PriorityEngine.js`)**:
   - Ranks items across 5 priority tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFORMATIONAL`) based on severity, business impact, expiry timeline, and dependencies.
5. **Action Planner (`ActionPlanner.js`)**:
   - Formulates step-by-step remediation action plans with role owners and impact estimations.
6. **Summary Generator (`SummaryGenerator.js`)**:
   - Produces executive risk summaries, top priorities, critical actions, and key insights for leadership.
7. **Explanation Engine (`ExplanationEngine.js`)**:
   - Details "Why this recommendation exists", data analyzed, rules applied, assumptions made, and confidence.
8. **Confidence Scorer (`ConfidenceScorer.js`)**:
   - Calculates confidence score (0.0 to 1.0) and data completeness ratio.
9. **Guardrails Engine (`GuardrailsEngine.js`)**:
   - Enforces grounding, output validation, confidence thresholding (default >= 0.70), and hallucination prevention.

---

## 3. Database Schema

- `compliance_recommendations`: Persisted active, accepted, and dismissed recommendations.
- `recommendation_evidences`: Linked supporting data points and regulatory rule references.
- `risk_assessments`: Overall risk score, risk vector breakdown, and overall severity.
- `risk_factors`: Specific risk categories and mitigation actions.
- `compliance_gaps`: Discovered compliance and profile vulnerabilities.
- `executive_summaries`: Leadership posture, top priorities, and critical actions.
- `action_plans`: Step-by-step remediation plans.
- `recommendation_histories`: Audit trail of generated, accepted, and dismissed recommendations.

---

## 4. API Specification (`/api/v1/ai-compliance`)

- `POST /api/v1/ai-compliance/analyze`: Trigger full compliance intelligence analysis (`ai.compliance.manage`).
- `GET /api/v1/ai-compliance/recommendations`: Retrieve active recommendations (`ai.recommendations.read`).
- `POST /api/v1/ai-compliance/recommendations/:id/accept`: Mark recommendation accepted (`ai.compliance.manage`).
- `POST /api/v1/ai-compliance/recommendations/:id/dismiss`: Mark recommendation dismissed (`ai.compliance.manage`).
- `GET /api/v1/ai-compliance/risks`: Retrieve risk assessment overview (`ai.compliance.read`).
- `GET /api/v1/ai-compliance/executive-summary`: Retrieve executive summary (`ai.executive.read`).
- `GET /api/v1/ai-compliance/gaps`: Retrieve compliance gaps (`ai.compliance.read`).
- `GET /api/v1/ai-compliance/action-plans`: Retrieve action plans (`ai.compliance.read`).

---

## 5. UI Workspace

Accessible at `/ai-compliance-intelligence`:
- **Executive Summary Card**: Posture badge, risk score, trust score, data completeness.
- **Top Recommendations**: Prioritized recommendation cards with impact badges, effort estimates, and Accept/Dismiss triggers.
- **Explainability Drawer**: Detailed modal revealing "Why this recommendation exists", data analyzed, rules applied, and supporting evidence.
- **Compliance Gaps Matrix**: Categorized list of missing registrations and expiring filings.
- **Risk Assessment Dashboard**: Multi-dimensional risk score bars.
- **Action Plan Queue**: Step-by-step remediation roadmap.

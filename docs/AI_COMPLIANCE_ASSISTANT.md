# VerifyChain AI Compliance Assistant & Copilot Architecture (Phase 9.4)

## Overview

The **VerifyChain AI Compliance Assistant** (`server/src/aiAssistant`) is a domain-specific enterprise compliance copilot. It provides grounded answers, explains platform metrics and recommendations, generates formal exportable reports, and guides organizations using authorized VerifyChain platform telemetry.

---

## 1. Architectural Processing Pipeline

```
User Query Input
       │
       ▼
[Assistant UI Workspace] (`AIAssistantPage.jsx`)
       │
       ▼
[Safety Layer] (Sanitizes input, prompt injection filter, org isolation)
       │
       ▼
[Intent Engine] (Classifies intent: Compliance, Document, Trust, Risk, Audit, Report)
       │
       ▼
[Tool Orchestrator] (Invokes internal queries: getTrustScore, getComplianceGaps, getRiskAssessment, etc.)
       │
       ▼
[Citation Service] (Generates grounded references linking responses to platform records)
       │
       ▼
[Grounding Service] (Verifies statement grounding & calculates confidence score)
       │
       ▼
[AIServiceFacade & Prompt Orchestrator] (Renders LLM completion)
       │
       ▼
[Conversation Memory Service] (Persists transcript to PostgreSQL)
```

> **Strict Non-Generalist Copilot Rule**: All answers must come exclusively from authorized VerifyChain data. The assistant never uses unverified external web searches or fabricates ungrounded statements.

---

## 2. Intent Classification Taxonomy

Managed by `IntentEngine.js`:
- `TRUST_INQUIRY`: Queries regarding Supplier Trust Score, badge levels, and score changes.
- `RECOMMENDATION_EXPLANATION`: Queries regarding compliance gaps, priority fixes, and statutory recommendations.
- `RISK_ANALYSIS`: Queries regarding multi-dimensional risk scores and exposure breakdown.
- `REPORT_GENERATION`: Requests to formulate Board Reports, Audit Readiness Briefs, or Supplier Risk Summaries.
- `DOCUMENT_QUESTION`: Queries regarding uploaded GST Certificates, PAN, Udyam, or Commercial Invoices.
- `AUDIT_INQUIRY`: Queries regarding recent platform audit trail actions and telemetry.
- `COMPLIANCE_INQUIRY`: General statutory compliance health and filing queries.

---

## 3. Internal Tool Orchestrator

Managed by `ToolOrchestrator.js`:
- `getTrustScore`: Fetches Supplier Trust Score and badge standing.
- `getComplianceGaps`: Queries active statutory compliance gaps.
- `getRiskAssessment`: Retrieves multi-dimensional risk matrix.
- `getRecommendations`: Retrieves active explainable recommendations.
- `getExecutiveSummary`: Retrieves leadership compliance posture.
- `getDocuments`: Retrieves verified document vault records.

---

## 4. Grounded Citations & Report Generator

- **Citation Service (`CitationService.js`)**: Formulates explicit references linking responses to statutory records, compliance gaps, documents, or risk matrices with inspectable links.
- **Report Generator (`ReportGenerator.js`)**: Formulates exportable Markdown/JSON reports (Board Report, Executive Summary, Audit Readiness Report, Supplier Risk Report).

---

## 5. API Specification (`/api/v1/ai-assistant`)

- `POST /api/v1/ai-assistant/conversations/messages`: Post user prompt & receive grounded response (`ai.assistant.use`).
- `GET /api/v1/ai-assistant/conversations`: Retrieve conversation list (`ai.assistant.use`).
- `POST /api/v1/ai-assistant/reports/generate`: Formulate exportable compliance report (`ai.assistant.reports`).
- `POST /api/v1/ai-assistant/feedback`: Submit response rating (`ai.assistant.use`).

---

## 6. UI Workspace

Accessible at `/ai-assistant`:
- **Copilot Chat Stream**: Conversation history with typing states and confidence indicators.
- **Suggested Quick Prompts**: 1-click prompts ("Explain my Trust Score", "What should I fix first?", "Generate Board Report").
- **Grounded Citations Inspector**: Drawer displaying linked statutory evidence.
- **Generated Reports Gallery**: Exportable Markdown/JSON report brief viewer.

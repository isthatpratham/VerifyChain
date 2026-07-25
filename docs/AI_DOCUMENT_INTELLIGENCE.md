# VerifyChain AI Document Intelligence Platform Architecture (Phase 9.3)

## Overview

The **AI Document Intelligence Platform** (`server/src/documentIntelligence`) is an automated business document understanding system built on top of the VerifyChain AI Foundation. It classifies, extracts, validates, compares, summarizes, detects fraud indicators, and provides human approval review workflows for statutory business records (GST Certificates, PAN Cards, Udyam Certificates, FSSAI Licenses, Commercial Invoices, and Custom Documents).

---

## 1. Architectural Processing Pipeline

```
Document Upload / Input
          │
          ▼
[OCR Abstraction Layer] (Google Vision / Azure / AWS / Tesseract / Mock)
          │
          ▼
[Classification Engine] (Document type, issuing authority, category, language, quality score)
          │
          ▼
[Extraction Engine] (Key-value pairs, dates, GSTIN, PAN, Udyam numbers, tables)
          │
          ▼
[Validation Engine] (15-digit GSTIN checksum, 10-char PAN format, expiry checks)
          │
          ▼
[Fraud Detection Layer] (Image tampering, font alignment anomalies, metadata checks)
          │
          ▼
[AI Summarization Engine] (Executive overview, statutory obligations, renewal deadlines)
          │
          ▼
[Human Review Approval Workflow] (Approve & Map to Compliance, Reject, Field Override)
          │
          ▼
[Compliance Engine & Business Profile]
```

> **Human Approval Constraint**: Document understanding results never directly modify statutory business records automatically; human review approval and field override actions are fully supported and audited.

---

## 2. OCR Provider Abstraction

- **`AbstractOCRProvider`**: Abstract interface specifying `extractText({ fileBuffer, fileName })` and `checkHealth()`.
- **`OCRProviderFactory`**: Resolves configurable OCR adapters (`MOCK_OCR`, `TESSERACT`, `AZURE_FORM_RECOGNIZER`, `AWS_TEXTRACT`, `GOOGLE_VISION`).
- **`MockOCRProvider`**: Deterministic offline OCR provider for zero-dependency development and automated testing.

---

## 3. Sub-Engines

1. **Classification Engine (`ClassificationEngine.js`)**: Automatically identifies document type, category, issuing authority, language, quality score, and confidence.
2. **Extraction Engine (`ExtractionEngine.js`)**: Extracts structured fields (`businessName`, `gstin`, `pan`, `udyamNumber`, `registrationDate`, `jurisdiction`).
3. **Validation Engine (`ValidationEngine.js`)**: Validates regex formats, statutory checksums, completeness, and date boundaries.
4. **Fraud Detection Engine (`FraudDetectionEngine.js`)**: Detects font kerning anomalies, layout manipulation, duplicate filings, and image tampering.
5. **Comparison Engine (`ComparisonEngine.js`)**: Computes version field diffs, field changes, and similarity scores.
6. **Summarization Engine (`SummarizationEngine.js`)**: Formulates human-readable overview, key obligations, and important statutory deadlines.
7. **Approval Workflow Engine (`ApprovalWorkflowEngine.js`)**: Manages human review decisions (`APPROVED`, `REJECTED`, `CORRECTION_REQUESTED`), field overrides, and audit logs.

---

## 4. API Specification (`/api/v1/document-intelligence`)

- `POST /api/v1/document-intelligence/analyze`: Upload and execute document understanding pipeline.
- `GET /api/v1/document-intelligence/documents`: List document analysis history for organization.
- `GET /api/v1/document-intelligence/documents/:id`: Retrieve detailed document analysis, extracted fields, and validations.
- `POST /api/v1/document-intelligence/documents/:id/approve`: Approve review decision and apply optional field overrides.
- `POST /api/v1/document-intelligence/documents/:id/reject`: Reject document analysis.
- `POST /api/v1/document-intelligence/compare`: Compare two document field sets.

---

## 5. UI Workspace

Accessible at `/document-intelligence`:
- **Document Selection List**: Side drawer displaying uploaded documents with review status tags (`PENDING_REVIEW`, `APPROVED`, `REJECTED`).
- **Classification & Quality Banner**: Document type, issuing authority, quality score meter, and action triggers.
- **Extracted Fields & Field Editor**: Grid of extracted attributes with confidence scores and human field override inputs.
- **Validation & Fraud Indicators Grid**: Formatting checks and risk severity indicators.
- **Approval Actions**: "Approve & Map Record" and "Reject Document" triggers.

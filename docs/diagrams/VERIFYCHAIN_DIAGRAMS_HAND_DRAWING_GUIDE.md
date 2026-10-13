# VERIFYCHAIN SYSTEM ARCHITECTURE & DIAGRAMS GUIDE
## Precision Hand-Drawing Manual for Academic & MCA Project Reports

**Document Version:** 1.0.0-PROD  
**Target Repository:** `isthatpratham/VerifyChain`  
**Inspected Git Branch:** `13/final-certification-and-integration`  
**Inspected Commit:** `e23768b` (`chore: remove unused and out-of-scope code`)  
**Target Output File:** `docs/diagrams/VERIFYCHAIN_DIAGRAMS_HAND_DRAWING_GUIDE.md`  
**Prepared For:** MCA Final Project Dissertation, System Design Defense, and Technical Viva Voce  

---

## 1. Verified Repository Analysis Summary

A comprehensive, read-only static analysis and runtime tracing was conducted across the VerifyChain repository. Below is the ground truth verified from checked-out source files, mounted Express routes, the Prisma schema, migration histories, and frontend navigation trees:

1. **Architecture Style**: VerifyChain is a modular, monolithic web application comprising:
   - **Client Tier**: React 18 SPA built with Vite 5, Tailwind CSS 3, React Router 6, Axios, and Phosphor Icons (`client/`).
   - **Application Tier**: Node.js 20 with Express 4 (`server/src/app.js`), structured with layered controllers, services, repositories, deterministic calculation engines, and an asynchronous internal domain event bus (`DomainEventBus.js`).
   - **Data Tier**: PostgreSQL 16 accessed strictly via Prisma ORM 5.20.0 (`server/prisma/schema.prisma`).
2. **Absence of Blockchain**: Despite the repository name *VerifyChain*, there is **zero blockchain or distributed ledger technology** (no Web3, Ethereum, Solana, Solidity, or smart contract libraries) in the codebase. PRD Section 6 explicitly classifies blockchain certificate anchoring as a *future milestone*. Trust is enforced via HMAC-SHA256 cryptographically signed distribution tokens, unique public slugs, and deterministic audit trails.
3. **Absence of AI/LLMs**: The repository scope deliberately excludes all external AI/LLM components. Commit `e23768b` verified the total removal of `geminiAI.service.js` and external AI tests. Empty placeholder directories (`aiAdmin/`, `aiAssistant/`, `aiPlatform/`, `documentVault/`, `complianceIntelligence/`, etc.) contain 0 files. All evaluations are **100% deterministic**.
4. **Statutory Compliance Validation**: Verification of GSTIN, PAN, and Udyam numbers is performed locally and deterministically using structural regexes, checksum algorithms, and state code decoders in `server/src/services/verification.service.js`. No live external government API connections exist.
5. **Deterministic Engines**:
   - **Rules Engine** (`server/src/rulesEngine/`): Evaluates business profiles against JSON conditions using `RuleEvaluator.js` and logs evaluations in `rule_evaluation_logs`.
   - **Score Engine** (`server/src/scoreEngine/`): Aggregates category scores (TAX, LABOUR, CORPORATE, LICENSING), calculates statutory penalties/bonuses, and derives a 0–100 Compliance Health Score (CHS) stored in `health_score_snapshots`.
   - **Supplier Trust Engine** (`server/src/supplierTrustEngine/`): Maps CHS score and overdue counts to discrete Trust Levels (`ENTERPRISE_TRUSTED`, `HIGHLY_TRUSTED`, `TRUSTED`, `VERIFIED`, `PENDING`, `SUSPENDED`) in `supplier_trust_profiles`.
   - **Trust Distribution & QR Engine** (`server/src/qrEngine/`, `assetEngine/`): Generates HMAC-SHA256 signed dynamic QR verification tokens, SVG cards, badges, and printable PDF certificates.
6. **Discrepancy Resolution (Docs vs Implementation)**: Early documentation (`docs/ARCHITECTURE.md`, `docs/PRD.md`) references an 8-table database and unmounted routes (`/api/documents`, `/api/alerts`, `/api/schemes`, `/api/buyer`, `/api/admin`). Current production code and Prisma migrations reflect an advanced 19-model schema where Phase 6 (Supplier Trust) and Phase 7 (Trust Distribution) are fully active, while Documents, Alerts, Schemes, and Admin dashboards remain dormant groundwork.

---

## 2. Current Active Scope vs Retained Groundwork & Excluded Scope

To ensure academic and architectural rigor, all system modules are formally classified:

| Module / Subsystem | Classification | Evidence & Runtime Status |
| :--- | :--- | :--- |
| **Authentication & User Accounts** | **ACTIVE** | `auth.routes.js`, `auth.service.js`, `users` table, JWT auth middleware, bcrypt hashing. |
| **MSME Profile Management** | **ACTIVE** | `msme.routes.js`, `msme.service.js`, `msme_profiles` table, profile forms. |
| **Statutory Identifier Verification** | **ACTIVE** | `verification.routes.js`, `verification.service.js`, regex validation for GSTIN, PAN, Udyam. |
| **Deterministic Rules Engine** | **ACTIVE** | `compliance.routes.js`, `RuleExecutionEngine.js`, `compliance_rules`, `rule_evaluation_logs`. |
| **Compliance Health Score (CHS)** | **ACTIVE** | `ScorePipeline.js`, `CategoryEvaluator.js`, `health_score_configs`, `health_score_snapshots`. |
| **Health Intelligence & Insights** | **ACTIVE** | `HealthIntelligenceFacade.js`, `RiskAnalysisEngine.js`, `/api/compliance/health/insights`. |
| **Supplier Trust Platform** | **ACTIVE** | `supplierTrust.routes.js`, `TrustEvaluationPipeline.js`, `supplier_trust_profiles`, `trust_metadata`. |
| **Trust Distribution & QR Engine** | **ACTIVE** | `trustDistribution.routes.js`, `DistributionTokenEngine.js`, `trust_distribution_identities`, dynamic QR. |
| **Public Verification Portal** | **ACTIVE** | `PublicTrustPortal.jsx`, `/verify/:slug`, `VerificationResolver.js`, public REST endpoints. |
| **Domain Event Infrastructure** | **ACTIVE** | `DomainEventBus.js`, internal event-driven subscriptions across pipelines. |
| **Encrypted Document Vault** | **FOUNDATIONAL** | `Document` model, `document.repository.js`, storage directory exist; no mounted routes or UI. |
| **Proactive Expiry Alerts** | **FOUNDATIONAL** | `Alert` model, `alert.repository.js` exist; `server/src/jobs/` is empty (no cron worker or email trigger). |
| **Government Scheme Matcher** | **FOUNDATIONAL** | `GovernmentScheme` & `SchemeMatch` models and seed data exist; no mounted controller or UI. |
| **Legacy Buyer View Log** | **FOUNDATIONAL** | `BuyerViewLog` model exists; superseded by `trust_timeline_events` and `trust_distribution_timeline_events`. |
| **Platform Administrator Portal** | **DORMANT** | `ADMIN` role enum, seeded admin user, `admin.middleware.js` exist; no admin routes or UI mounted. |
| **External AI / LLM Services** | **OUT OF SCOPE** | Deliberately removed in commit `e23768b`; all empty AI directories contain 0 files. |
| **Blockchain / Distributed Ledger** | **OUT OF SCOPE** | Zero code in repository; explicitly documented as future exploratory feature in PRD. |

---

## 3. Evidence Ledger of Key Inspected Files & Symbols

| File Path | Key Symbols / Classes / Functions | Architectural Role |
| :--- | :--- | :--- |
| `server/src/app.js` | Express app bootstrap, `/api/health`, mounted route registration | Main Server Entry Point |
| `server/prisma/schema.prisma` | 19 Models: `User`, `MsmeProfile`, `SupplierTrustProfile`, etc. | Physical Database Schema |
| `server/src/routes/auth.routes.js` | `POST /register`, `POST /login`, `GET /me`, `authLimiter` | Authentication Endpoints |
| `server/src/routes/msme.routes.js` | `POST /profile`, `GET /profile`, `PATCH /profile` | Business Profile Endpoints |
| `server/src/routes/verification.routes.js` | `POST /verify/gstin`, `/pan`, `/udyam`, `GET /verification/status` | Identifier Verification Endpoints |
| `server/src/routes/compliance.routes.js` | `GET /`, `POST /rules/evaluate`, `POST /health/calculate`, `/insights` | Compliance & CHS Endpoints |
| `server/src/routes/supplierTrust.routes.js` | `GET /public/:slug`, `POST /evaluate`, `GET /decision`, `/timeline` | Supplier Trust Endpoints |
| `server/src/routes/trustDistribution.routes.js`| `GET /qr/resolve/:token`, `POST /qr/generate`, `POST /assets/generate`| Trust Distribution Endpoints |
| `server/src/services/verification.service.js` | `validateGstin()`, `validatePan()`, `validateUdyam()`, `verifyAll()` | Deterministic Regex Validator |
| `server/src/rulesEngine/RuleEvaluator.js` | `evaluateCondition()`, `evaluateRule()` | Condition Evaluator (AND/OR) |
| `server/src/rulesEngine/RuleExecutionEngine.js`| `createSnapshot()`, `evaluateBusinessProfile()` | Rules Engine Pipeline |
| `server/src/scoreEngine/ScorePipeline.js` | `executePipeline()` | CHS Score Calculation Pipeline |
| `server/src/scoreEngine/CategoryEvaluator.js` | `evaluateCategories()`, `AUTHORITY_CATEGORY_MAP` | Category Score Mapper |
| `server/src/scoreEngine/PenaltyBonusEngine.js` | `evaluate()` (-15 overdue, -5 due, +5 perfect bonus) | Penalty/Bonus Deduction Logic |
| `server/src/scoreEngine/ScoreAggregator.js` | `aggregate()`, risk classification (<60 HIGH, <85 MED, 85+ LOW)| Score Normalizer & Risk Engine |
| `server/src/supplierTrustEngine/TrustPolicyEngine.js` | `evaluatePolicy()` (ENTERPRISE >=90, HIGHLY >=80, etc.) | Trust Policy Decision Engine |
| `server/src/qrEngine/DistributionTokenEngine.js`| `issueToken()`, `validateToken()`, `revokeToken()` | HMAC-SHA256 QR Token Cryptography |
| `server/src/events/DomainEventBus.js` | `publish()`, `subscribe()`, 25+ strongly-typed domain events | Decoupled Internal Event Bus |
| `client/src/App.jsx` | React Router route definitions (`/dashboard`, `/profile`, `/verify/:slug`)| Frontend Routing Root |
| `client/src/services/api.js` | Axios instance, JWT Bearer interceptor, base HTTP clients | Frontend HTTP Client |

---

## 4. Master Diagram Specifications

---

### Diagram 1 — UML Use Case Diagram

#### 1. Identification & Caption
- **Figure Number**: Figure 1
- **Title**: VerifyChain System Use Case Diagram
- **Purpose**: Depict the functional boundary of the VerifyChain system, illustrating the interactions between human/external actors and executable system use cases.
- **Report Caption**: *Figure 1: UML Use Case Diagram illustrating active functional use cases for authenticated MSME Owners and unauthenticated Public Verifiers.*

#### 2. Layout Plan
- **Sheet Orientation**: Landscape (A4).
- **Left Margin**: Primary Actor — `MSME Owner` (Stick figure).
- **Center Canvas**: Large rectangular box labelled `<<system boundary>> VerifyChain System`.
- **Inside System Boundary**:
  - Upper section: Authentication & Business Profile Use Cases.
  - Middle section: Statutory Verification, Compliance Rules & Health Scoring Use Cases.
  - Lower section: Supplier Trust Evaluation, Dynamic QR Generation, and Trust Distribution Use Cases.
- **Right Margin**: Secondary Actor — `Buyer / Public Verifier` (Stick figure).
- **Bottom Note / Excluded Box**: Explicit note indicating `Platform Administrator` is dormant groundwork (unmounted).

#### 3. Exact Numbered List of Symbols & Nodes
1. **Actor 1**: `MSME Owner` (Left side).
2. **Actor 2**: `Buyer / Public Verifier` (Right side).
3. **Boundary**: `VerifyChain System Boundary` (Large rectangle enclosing UC1 through UC15).
4. **UC1**: `Register Account` (Ellipse).
5. **UC2**: `Login & Authenticate` (Ellipse).
6. **UC3**: `Manage Business Profile` (Ellipse).
7. **UC4**: `Verify Statutory Identifiers (GSTIN/PAN/Udyam)` (Ellipse).
8. **UC5**: `Evaluate Compliance Rules Deterministically` (Ellipse).
9. **UC6**: `Calculate Compliance Health Score (CHS)` (Ellipse).
10. **UC7**: `View Risk Intelligence & Recommendations` (Ellipse).
11. **UC8**: `Request Supplier Trust Evaluation` (Ellipse).
12. **UC9**: `Manage Trust Distribution Channels` (Ellipse).
13. **UC10**: `Generate Dynamic QR Code` (Ellipse).
14. **UC11**: `Download Printable PDF Certificate` (Ellipse).
15. **UC12**: `Copy Embeddable Badges & Widgets` (Ellipse).
16. **UC13**: `Resolve Dynamic QR Token Verification` (Ellipse).
17. **UC14**: `View Public Verified Supplier Standing` (Ellipse).
18. **UC15**: `View Embedded Trust Badge/Widget` (Ellipse).

#### 4. Explicit Arrow & Relationship Ledger
- `MSME Owner ─── UC1` (Solid association line)
- `MSME Owner ─── UC2` (Solid association line)
- `MSME Owner ─── UC3` (Solid association line)
- `MSME Owner ─── UC5` (Solid association line)
- `MSME Owner ─── UC6` (Solid association line)
- `MSME Owner ─── UC7` (Solid association line)
- `MSME Owner ─── UC8` (Solid association line)
- `MSME Owner ─── UC9` (Solid association line)
- `MSME Owner ─── UC10` (Solid association line)
- `MSME Owner ─── UC11` (Solid association line)
- `MSME Owner ─── UC12` (Solid association line)
- `UC3 -.-> UC4: <<include>>` (Dashed arrow from UC3 to UC4: profile completion triggers statutory verification)
- `UC6 -.-> UC5: <<include>>` (Dashed arrow from UC6 to UC5: score calculation requires rule evaluation outputs)
- `UC7 -.-> UC6: <<extend>>` (Dashed arrow from UC7 to UC6: viewing insights extends score calculation)
- `UC8 -.-> UC6: <<include>>` (Dashed arrow from UC8 to UC6: trust evaluation includes health score inputs)
- `UC10 -.-> UC8: <<extend>>` (Dashed arrow from UC10 to UC8: QR generation extends approved trust evaluation)
- `Buyer / Public Verifier ─── UC13` (Solid association line)
- `Buyer / Public Verifier ─── UC14` (Solid association line)
- `Buyer / Public Verifier ─── UC15` (Solid association line)
- `UC13 -.-> UC14: <<include>>` (Dashed arrow from UC13 to UC14: resolving QR token includes displaying public profile)

#### 5. Compact ASCII Preview
```
  ┌──────────────┐                                                             ┌────────────────────────┐
  │  MSME Owner  │                                                             │ Buyer / Public Verifier│
  │   (Actor)    │                                                             │        (Actor)         │
  └──────┬───────┘                                                             └───────────┬────────────┘
         │                                                                                 │
         │      ┌─────────────────────── VerifyChain System ────────────────────────┐      │
         ├─────►│ (UC1) Register Account                                            │      │
         ├─────►│ (UC2) Login & Authenticate                                        │      │
         ├─────►│ (UC3) Manage Business Profile ──<<include>>──► (UC4) Verify IDs   │      │
         ├─────►│ (UC5) Evaluate Compliance Rules                                   │      │
         ├─────►│ (UC6) Calculate Health Score (CHS) ◄──<<include>>─ (UC5)          │      │
         ├─────►│ (UC7) View Risk Intelligence ──<<extend>>──► (UC6)                │      │
         ├─────►│ (UC8) Request Supplier Trust Eval ──<<include>>──► (UC6)          │      │
         ├─────►│ (UC9) Manage Distribution Channels                                │      │
         ├─────►│ (UC10) Generate Dynamic QR ───<<extend>>─────► (UC8)              │      │
         ├─────►│ (UC11) Download PDF Certificate                                  │      │
         ├─────►│ (UC12) Copy Embed Badges/Widgets                                 │      │
         │      │                                                                   │      │
         │      │ (UC13) Resolve QR Token ────<<include>>────► (UC14) Public Profile│◄─────┤
         │      │ (UC15) View Embed Badge/Widget ───────────────────────────────────│◄─────┘
         │      └───────────────────────────────────────────────────────────────────┘
         │
 [Dormant Note: Platform Administrator actor excluded from active canvas; models retained as groundwork]
```

#### 6. Notation Legend & Verification Checklist
- **Actor**: Stick figure representing user roles interacting with the system.
- **Ellipse**: Functional use case representing an actionable system goal.
- **Solid Line**: Direct association between an actor and a use case.
- **Dashed Arrow with `<<include>>`**: Base use case unconditionally invokes target use case.
- **Dashed Arrow with `<<extend>>`**: Target use case conditionally enhances base use case.
- **Check Your Drawing**:
  - [ ] Only two active actors drawn: `MSME Owner` and `Buyer / Public Verifier`.
  - [ ] No administrator drawn in active boundary (administrator is documented as dormant).
  - [ ] All use cases map directly to verified mounted endpoints.
  - [ ] Arrowheads on `<<include>>` and `<<extend>>` point in the standard UML direction.

---

### Diagram 2 — UML Activity Diagram: Core Business Workflow

#### 1. Identification & Caption
- **Figure Number**: Figure 2
- **Title**: VerifyChain Core Business Workflow Activity Diagram
- **Purpose**: Trace the end-to-end procedural workflow from MSME onboarding and statutory validation to deterministic compliance scoring, trust classification, and public QR verification.
- **Report Caption**: *Figure 2: UML Activity Diagram detailing the deterministic lifecycle of enterprise compliance evaluation and public trust distribution.*

#### 2. Layout Plan
- **Sheet Orientation**: Portrait (A4).
- **Top to Bottom Swimlanes / Linear Flow**:
  1. Initial node: Account Onboarding.
  2. Sequential actions: Profile submission, statutory regex verification.
  3. Decision diamond: Identifiers format check (`[Valid]` vs `[Invalid]`).
  4. Parallel fork/join or sequential rules execution across statutory authorities.
  5. Action: Category evaluation (TAX, LABOUR, CORPORATE, LICENSING).
  6. Action: Penalty/Bonus calculation and score aggregation (0–100 CHS).
  7. Decision diamond: Trust Level policy branching (`[CHS >= 90 & 0 Overdue]`, `[CHS >= 70]`, `[Overdue >= 2]`).
  8. Action: Generate HMAC-SHA256 signed distribution token & dynamic QR code.
  9. Action: Public buyer scans QR and resolves verification token.
  10. Final activity node: Verified Profile Rendered.

#### 3. Exact Numbered List of Symbols & Nodes
1. `Start Node`: Filled black circle (Start).
2. `Act1`: `Submit Enterprise Profile & Statutory IDs (GSTIN, Udyam, PAN)` (Rounded rectangle).
3. `Act2`: `Execute Deterministic Format & Checksum Regex Verification` (Rounded rectangle).
4. `Dec1`: `Statutory IDs Valid?` (Decision diamond).
5. `Act3`: `Return Validation Error & Correction Prompt` (Rounded rectangle).
6. `Act4`: `Execute Deterministic Compliance Rules Engine against Profile Snapshot` (Rounded rectangle).
7. `Act5`: `Evaluate Category Scores & Deduct Overdue Penalties / Add Bonuses` (Rounded rectangle).
8. `Act6`: `Aggregate 0–100 Compliance Health Score (CHS) & Persist Snapshot` (Rounded rectangle).
9. `Dec2`: `Evaluate Supplier Trust Qualification Policy` (Decision diamond).
10. `Act7a`: `Assign ENTERPRISE_TRUSTED / HIGHLY_TRUSTED Standing` (Rounded rectangle).
11. `Act7b`: `Assign TRUSTED / VERIFIED Standing` (Rounded rectangle).
12. `Act7c`: `Assign SUSPENDED / PENDING Standing` (Rounded rectangle).
13. `Act8`: `Issue Cryptographic Distribution Token (HMAC-SHA256) & Render Dynamic QR` (Rounded rectangle).
14. `Act9`: `Buyer / Verifier Scans QR & Dispatches Token Resolution Request` (Rounded rectangle).
15. `Dec3`: `Signature Valid & Token Not Expired/Revoked?` (Decision diamond).
16. `Act10`: `Display Tampered / Expired Token Warning Page` (Rounded rectangle).
17. `Act11`: `Render Authoritative Public Verified Standing & Compliance Evidence` (Rounded rectangle).
18. `End Node`: Bullseye circle (Filled circle inside border circle).

#### 4. Explicit Arrow & Relationship Ledger
- `Start Node ──► Act1`
- `Act1 ──► Act2`
- `Act2 ──► Dec1`
- `Dec1 ──► Act3: [Invalid Format]`
- `Act3 ──► Act1: [Re-enter Data]`
- `Dec1 ──► Act4: [Valid Format]`
- `Act4 ──► Act5`
- `Act5 ──► Act6`
- `Act6 ──► Dec2`
- `Dec2 ──► Act7a: [Score >= 80 & 0 Overdue]`
- `Dec2 ──► Act7b: [50 <= Score < 80 & 0 Overdue]`
- `Dec2 ──► Act7c: [Overdue >= 2 OR Score < 50]`
- `Act7a ──► Act8`
- `Act7b ──► Act8`
- `Act7c ──► Act8: [Generates Suspended/Pending Token]`
- `Act8 ──► Act9`
- `Act9 ──► Dec3`
- `Dec3 ──► Act10: [Signature Invalid or Expired]`
- `Dec3 ──► Act11: [Signature Valid]`
- `Act10 ──► End Node`
- `Act11 ──► End Node`

#### 5. Compact ASCII Preview
```
       ●  (Start)
       │
       ▼
 ┌────────────────────────────────────────────────────────┐
 │ Act1: Submit Business Profile (GSTIN, Udyam, Turnover) │
 └─────────────────────────┬──────────────────────────────┘
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │ Act2: Deterministic Regex & Checksum Verification      │
 └─────────────────────────┬──────────────────────────────┘
                           ▼
                         /   \
                       /  Dec1 \────[Invalid]──► ┌─────────────────────────┐
                       \ Valid?/                 │ Act3: Display Validation│
                         \   /                   │       Correction Errors │
                           │ [Valid]             └────────────┬────────────┘
                           ▼                                  │
 ┌──────────────────────────────────────────────────────┐     │
 │ Act4: Evaluate Compliance Rules against Snapshot     │◄────┘
 └─────────────────────────┬────────────────────────────┘
                           ▼
 ┌──────────────────────────────────────────────────────┐
 │ Act5: Evaluate Categories (TAX, LABOUR, LICENSING)   │
 └─────────────────────────┬────────────────────────────┘
                           ▼
 ┌──────────────────────────────────────────────────────┐
 │ Act6: Compute 0-100 CHS Score & Persist DB Snapshot  │
 └─────────────────────────┬────────────────────────────┘
                           ▼
                         /   \
                       /  Dec2 \──────[Overdue >= 2]────────► ┌──────────────────┐
                       \ Policy/                              │ Act7c: SUSPENDED │
                         \   /                                └────────┬─────────┘
                      [>=80]│ [50-79]                                  │
              ┌─────────────┴─────────────┐                            │
              ▼                           ▼                            │
 ┌────────────────────────┐  ┌────────────────────────┐                │
 │ Act7a: ENTERPRISE/HIGH │  │ Act7b: TRUSTED/VERIFIED│                │
 └────────────┬───────────┘  └────────────┬───────────┘                │
              └─────────────┬─────────────┘                            │
                            ├──────────────────────────────────────────┘
                            ▼
 ┌──────────────────────────────────────────────────────┐
 │ Act8: Issue Signed HMAC-SHA256 Token & Dynamic QR    │
 └─────────────────────────┬────────────────────────────┘
                           ▼
 ┌──────────────────────────────────────────────────────┐
 │ Act9: Public Verifier Scans QR / Resolves Token      │
 └─────────────────────────┬────────────────────────────┘
                           ▼
                         /   \
                       /  Dec3 \────[Tampered/Expired]──► ┌──────────────────────┐
                       \ Token?/                          │ Act10: Token Invalid │
                         \   /                            └──────────┬───────────┘
                           │ [Valid]                                 │
                           ▼                                         │
 ┌──────────────────────────────────────────────────────┐            │
 │ Act11: Render Verified Public Profile & Trust Standing│            │
 └─────────────────────────┬────────────────────────────┘            │
                           │                                         │
                           └───────────────────┬─────────────────────┘
                                               ▼
                                              (◎) (End)
```

#### 6. Notation Legend & Verification Checklist
- **Filled Circle**: Start state of workflow.
- **Rounded Rectangle**: Deterministic processing activity or system action.
- **Diamond**: Decision branch requiring boolean guards (`[Guard]`).
- **Bullseye (Double Circle)**: Terminus / End state.
- **Check Your Drawing**:
  - [ ] Every branch from a decision diamond has an explicit guard label.
  - [ ] Both success and failure paths terminate gracefully at an end state.
  - [ ] Deductions (-15, -5) and bonus (+5) match verified code in `PenaltyBonusEngine.js`.

---

### Diagram 3 — UML Sequence Diagram: Best-Verified End-to-End Use Case

#### 1. Identification & Caption
- **Figure Number**: Figure 3
- **Title**: End-to-End Sequence Diagram: Profile Creation to Deterministic Compliance & Trust Orchestration
- **Purpose**: Document the chronological call stack and message sequence executing across frontend, router, controller, service, engines, repositories, and PostgreSQL database.
- **Report Caption**: *Figure 3: UML Sequence Diagram tracing the end-to-end execution path of business profile creation, compliance evaluation, health scoring, and trust publishing.*

#### 2. Layout Plan
- **Sheet Orientation**: Landscape (A4).
- **Lifelines (Left to Right — Exactly 8 Lifelines)**:
  1. `Actor`: MSME Owner
  2. `Frontend`: `BusinessProfileForm.jsx`
  3. `API Client`: `api.js (Axios)`
  4. `Route/Ctrl`: `msme.routes.js & msme.controller.js`
  5. `Service`: `msme.service.js`
  6. `Orchestrators`: `complianceOrchestrator.service.js & ScorePipeline.js`
  7. `Engines`: `RuleExecutionEngine.js & TrustPolicyEngine.js`
  8. `Database`: `PostgreSQL (via Prisma)`

#### 3. Message-Order Table

| Step | Source Lifeline | Target Lifeline | Message / Method Call | Semantics / Data Payload | Evidence |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `MSME Owner` | `Frontend` | `submitProfileForm(formData)` | UI form submission | `BusinessProfileForm.jsx` |
| **2** | `Frontend` | `API Client` | `createMsmeProfile(payload)` | Function call | `api.js:61` |
| **3** | `API Client` | `Route/Ctrl` | `POST /api/msme/profile` | HTTP Request with Bearer JWT | `msme.routes.js:16` |
| **4** | `Route/Ctrl` | `Route/Ctrl` | `verifyToken + validate` | Middleware token & input checks | `auth.middleware.js` |
| **5** | `Route/Ctrl` | `Service` | `createProfile(userId, profileData)` | Controller delegates to service | `msme.controller.js:20` |
| **6** | `Service` | `Database` | `msmeProfile.create({ data })` | SQL INSERT into `msme_profiles` | `msme.service.js:23` |
| **7** | `Database` | `Service` | `newProfile (msmeId: 101)` | Returns persisted profile record | `msmeProfileRepository.js` |
| **8** | `Service` | `Orchestrators` | `synchronizeCompliance(msmeId)` | Triggers compliance synchronization | `msme.service.js:43` |
| **9** | `Orchestrators`| `Engines` | `evaluateBusinessProfile(profile)` | Runs deterministic rules pipeline | `RuleExecutionEngine.js:28`|
| **10**| `Engines` | `Database` | `complianceRule.findActiveRules()` | SQL SELECT active rules | `complianceRule.repository.js`|
| **11**| `Engines` | `Database` | `complianceRecord.upsert(...)` | SQL UPSERT into `compliance_records`| `complianceOrchestrator:113`|
| **12**| `Engines` | `Database` | `ruleEvaluationLog.create(...)` | SQL INSERT audit log | `RuleExecutionEngine.js:55`|
| **13**| `Orchestrators`| `Orchestrators`| `ScorePipeline.executePipeline(msmeId)`| Triggered via internal event | `ScorePipeline.js:40` |
| **14**| `Orchestrators`| `Database` | `healthScoreSnapshot.create(...)` | SQL INSERT into snapshots | `ScorePipeline.js:90` |
| **15**| `Service` | `Engines` | `evaluateTrust(msmeId)` | Evaluates trust policy thresholds | `supplierTrust.service.js` |
| **16**| `Engines` | `Database` | `supplierTrustProfile.update(...)`| SQL UPDATE trust level & snapshot | `supplierTrustProfile.repo` |
| **17**| `Service` | `Route/Ctrl` | `return { msmeProfile, message }` | Service response object | `msme.service.js:66` |
| **18**| `Route/Ctrl` | `API Client` | `HTTP 201 Created (JSON)` | REST response | `msme.controller.js:25` |
| **19**| `API Client` | `Frontend` | `resolve(response.data)` | Promise fulfilled | `api.js:63` |
| **20**| `Frontend` | `MSME Owner` | `displaySuccessMessageAndRedirect()` | UI updates, routes to `/dashboard`| `BusinessProfileForm.jsx` |

#### 4. Compact ASCII Preview
```
MSME Owner   Frontend     api.js    Route/Ctrl   msme.service  Orchestrators   Engines      Database
    │            │          │           │             │              │            │            │
    │──1:submit─►│          │           │             │              │            │            │
    │            │──2:call─►│           │             │              │            │            │
    │            │          │──3:POST──►│             │              │            │            │
    │            │          │           │──4:verify──┐│              │            │            │
    │            │          │           │◄───token───┘│              │            │            │
    │            │          │           │──5:create──►│              │            │            │
    │            │          │           │             │──6:INSERT─────────────────────────────►│
    │            │          │           │             │◄─7:profile record──────────────────────│
    │            │          │           │             │──8:syncComp─►│            │            │
    │            │          │           │             │              │──9:eval───►│            │
    │            │          │           │             │              │            │──10:SELECT►│
    │            │          │           │             │              │            │◄─rules─────│
    │            │          │           │             │              │            │──11:UPSERT►│
    │            │          │           │             │              │            │──12:LOG────►│
    │            │          │           │             │              │──13:score─┐│            │
    │            │          │           │             │              │◄──calc────┘│            │
    │            │          │           │             │              │──14:INSERT snapshot────►│
    │            │          │           │             │──15:trust───►│            │            │
    │            │          │           │             │              │            │──16:UPDATE►│
    │            │          │           │             │◄─completed───┴────────────┴────────────│
    │            │          │           │◄─17:success─│              │            │            │
    │            │          │◄─18:201───│             │              │            │            │
    │            │◄─19:data─│           │             │              │            │            │
    │◄─20:render─│          │           │             │              │            │            │
```

#### 5. Notation Legend & Verification Checklist
- **Vertical Dashed Line**: Lifeline representing active object existence over time.
- **Tall Skinny Rectangle**: Activation bar indicating object execution.
- **Solid Arrow with Filled Head**: Synchronous call/message.
- **Dashed Arrow with Open Head**: Return reply message.
- **Check Your Drawing**:
  - [ ] Exact route name `POST /api/msme/profile` is shown.
  - [ ] Exact database operations (INSERT, UPSERT, SELECT) match Prisma queries.
  - [ ] Exactly 8 lifelines are drawn to maintain legibility.

---

### Diagram 4 — UML Component Diagram: Current Runtime

#### 1. Identification & Caption
- **Figure Number**: Figure 4
- **Title**: VerifyChain Runtime Component Diagram
- **Purpose**: Show the structural software components, layers, interfaces, and directional dependencies in the actual deployed environment.
- **Report Caption**: *Figure 4: UML Component Diagram depicting the modular runtime architecture, deterministic engines, and persistence layers.*

#### 2. Layout Plan
- **Sheet Orientation**: Landscape (A4).
- **Three Main Nodes / Boundary Containers**:
  1. `Client Runtime Node (Browser Process)`: Top/Left container.
  2. `Server Runtime Node (Node.js/Express Process)`: Center/Right container.
  3. `Data Persistence Node (PostgreSQL Server)`: Bottom container.
- **Inside Client Node**:
  - Components: `UI Presentation Component`, `Navigation Subsystem`, `State & Context Provider`, `API Client Component (api.js)`.
- **Inside Server Node**:
  - `HTTP Interface & Security Middleware Layer` (`helmet`, `cors`, `rateLimiter`, `jwtVerify`).
  - `Controller Layer` (`auth`, `msme`, `verification`, `compliance`, `supplierTrust`, `trustDistribution`).
  - `Service & Orchestration Layer` (`ComplianceOrchestrator`, `SupplierTrustService`, `TrustDistributionService`).
  - `Internal Domain Event Bus` (`DomainEventBus.js`).
  - `Deterministic Engines Subsystem` (Box containing `RulesEngine`, `ScoreEngine`, `HealthIntelligenceEngine`, `SupplierTrustEngine`, `QREngine`, `AssetEngine`).
  - `Data Access Layer (Repository Pattern)` (`Repositories & Prisma Client 5.20.0`).
- **Inside Persistence Node**:
  - Component: `PostgreSQL Database` (19 physical tables).

#### 3. Exact Numbered List of Symbols & Nodes
1. `Client Process Node`: Box with double-border or node cube.
2. `Server Process Node`: Box with double-border or node cube.
3. `Database Node`: Box with cylinder or database symbol.
4. `Comp1`: `React UI Components (Views, Modals, Forms)` (Component box with tabs).
5. `Comp2`: `HTTP Client (Axios api.js)` (Component box).
6. `Comp3`: `Express HTTP Pipeline & Security Middleware` (Component box).
7. `Comp4`: `REST API Controllers` (Component box).
8. `Comp5`: `Business Services & Orchestration Layer` (Component box).
9. `Comp6`: `Domain Event Bus (DomainEventBus.js)` (Component box).
10. `Comp7`: `Deterministic Compliance Rules Engine` (Component box).
11. `Comp8`: `Compliance Health Score Engine (CHS)` (Component box).
12. `Comp9`: `Supplier Trust Evaluation Engine` (Component box).
13. `Comp10`: `Dynamic QR & Cryptographic Token Engine` (Component box).
14. `Comp11`: `Multi-Format Trust Asset Generator (PDF/SVG)` (Component box).
15. `Comp12`: `Repository Data Access Layer (Prisma ORM)` (Component box).
16. `Comp13`: `PostgreSQL Relational Storage` (Database cylinder).

#### 4. Explicit Arrow & Port Ledger
- `Comp1 ──► Comp2`: Internal module dependency (React components import `api.js`).
- `Comp2 ──► Comp3: HTTP / HTTPS (JSON via Port 5000)`: Directional network dependency.
- `Comp3 ──► Comp4`: Express route dispatching through security middleware.
- `Comp4 ──► Comp5`: Controller invokes business service methods.
- `Comp5 ──► Comp6`: Publishes & subscribes domain events (`DomainEventBus`).
- `Comp5 ──► Comp7`: Invokes rule execution on profile changes.
- `Comp6 ──► Comp8`: Dispatches `ComplianceEvaluated` event to trigger `ScorePipeline`.
- `Comp6 ──► Comp9`: Dispatches `ScoreCalculated` event to trigger `TrustEvaluationPipeline`.
- `Comp6 ──► Comp10`: Dispatches `TrustLevelChanged` to trigger `TrustDistributionOrchestrator`.
- `Comp10 ──► Comp11`: Calls asset generator to render badges and certificates.
- `Comp5, Comp7, Comp8, Comp9, Comp10 ──► Comp12`: Repositories invoke Prisma models.
- `Comp12 ──► Comp13: TCP/IP Port 5432 (Prisma Query Engine)`: SQL queries to PostgreSQL.

#### 5. Compact ASCII Preview
```
 ┌────────────────────────── CLIENT RUNTIME (Vite/Browser) ──────────────────────────┐
 │ ┌────────────────────────────────────┐     ┌────────────────────────────────────┐ │
 │ │ React 18 UI Components & Pages     │────►│ Axios Central API Client (api.js)  │ │
 │ └────────────────────────────────────┘     └─────────────────┬──────────────────┘ │
 └──────────────────────────────────────────────────────────────┼────────────────────┘
                                           HTTP/REST (Port 5000)│ JSON Payloads
                                                                ▼
 ┌────────────────────────── SERVER RUNTIME (Node.js/Express) ───────────────────────┐
 │ ┌───────────────────────────────────────────────────────────────────────────────┐ │
 │ │ Express HTTP Server & Security Middleware (Helmet, CORS, RateLimiter, JWT)    │ │
 │ └──────────────────────────────────────┬────────────────────────────────────────┘ │
 │                                        ▼                                          │
 │ ┌───────────────────────────────────────────────────────────────────────────────┐ │
 │ │ REST API Controllers (auth, msme, compliance, supplierTrust, trustDist)       │ │
 │ └──────────────────────────────────────┬────────────────────────────────────────┘ │
 │                                        ▼                                          │
 │ ┌───────────────────────────────────────────────────────────────────────────────┐ │
 │ │ Business Services & Orchestration Layer ◄──► Internal Domain Event Bus        │ │
 │ └───────┬───────────────────────────────┬───────────────────────────────┬───────┘ │
 │         ▼                               ▼                               ▼         │
 │ ┌────────────────────────┐    ┌────────────────────────┐    ┌───────────────────┐ │
 │ │ Rules Engine (JSON     │    │ Score Engine (0-100    │    │ Supplier Trust    │ │
 │ │ Evaluator, Logs)       │    │ Aggregator, Penalties) │    │ Decision Engine   │ │
 │ └───────┬────────────────┘    └─────────┬──────────────┘    └───────────┬───────┘ │
 │         │                               │                               │         │
 │         ▼                               ▼                               ▼         │
 │ ┌───────────────────────────────────────────────────────────────────────────────┐ │
 │ │ Dynamic QR Token Engine (HMAC-SHA256) & Asset Generator (PDFKit / SVG)        │ │
 │ └──────────────────────────────────────┬────────────────────────────────────────┘ │
 │                                        ▼                                          │
 │ ┌───────────────────────────────────────────────────────────────────────────────┐ │
 │ │ Data Access Repositories (Prisma Client ORM 5.20.0)                           │ │
 │ └──────────────────────────────────────┬────────────────────────────────────────┘ │
 └────────────────────────────────────────┼──────────────────────────────────────────┘
                                          │ TCP/IP Port 5432 (SQL)
                                          ▼
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                     DATA PERSISTENCE TIER (PostgreSQL 16)                         │
 │  Tables: users, msme_profiles, compliance_records, compliance_rules,              │
 │          rule_evaluation_logs, health_score_snapshots, supplier_trust_profiles,  │
 │          trust_metadata, trust_distribution_identities, etc.                      │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

#### 6. Notation Legend & Verification Checklist
- **Component Box**: Rectangle with two smaller protruding rectangles on the left side (or standard `<<component>>` stereotype).
- **Dependency Arrow**: Dashed arrow with open arrowhead pointing to the required dependency.
- **Port**: Small square on a component boundary representing a network interface.
- **Check Your Drawing**:
  - [ ] No AI/LLM components shown.
  - [ ] No blockchain nodes or smart contracts shown.
  - [ ] Clear distinction between client process (browser) and server process (Node.js).

---

### Diagram 5 — Data Flow Diagram (DFD) Level 0: Context Diagram

#### 1. Identification & Caption
- **Figure Number**: Figure 5
- **Title**: DFD Level 0 Context Diagram
- **Purpose**: Establish the environmental boundary of VerifyChain by depicting external entities and net information exchanges with the central process.
- **Report Caption**: *Figure 5: DFD Level 0 Context Diagram defining the high-level boundary and verified data flows.*

#### 2. Layout Plan
- **Sheet Orientation**: Landscape (A4).
- **Center**: Single large circle/rounded rectangle labelled `0.0 VerifyChain System`.
- **Left Margin**: External Entity 1 — `MSME Owner` (Solid rectangle).
- **Right Margin**: External Entity 2 — `Buyer / Public Verifier` (Solid rectangle).
- **Data Flows**: Clear directed arrows with descriptive noun phrases (no verbs).

#### 3. Exact DFD Flow Ledger (Level 0)

| Source | Destination | Data Label | Code Evidence |
| :--- | :--- | :--- | :--- |
| `MSME Owner` | `0.0 VerifyChain System` | `Registration & Login Credentials` | `POST /api/auth/register`, `login` |
| `MSME Owner` | `0.0 VerifyChain System` | `Enterprise Profile Attributes (GSTIN, Udyam)` | `POST /api/msme/profile` |
| `MSME Owner` | `0.0 VerifyChain System` | `Statutory Verification Request` | `POST /api/msme/verify/gstin` |
| `MSME Owner` | `0.0 VerifyChain System` | `Compliance Re-evaluation Trigger` | `POST /api/compliance/rules/evaluate` |
| `MSME Owner` | `0.0 VerifyChain System` | `Dynamic QR Generation Request` | `POST /api/trust-distribution/qr/generate` |
| `0.0 VerifyChain System` | `MSME Owner` | `JWT Authentication Token & User Profile` | Auth controller response |
| `0.0 VerifyChain System` | `MSME Owner` | `Statutory Verification Result & Metadata` | Verification controller response |
| `0.0 VerifyChain System` | `MSME Owner` | `Compliance Health Score (0-100) & Insights`| Health controller response |
| `0.0 VerifyChain System` | `MSME Owner` | `Supplier Trust Standing & Audit Timeline` | Supplier trust response |
| `0.0 VerifyChain System` | `MSME Owner` | `Signed Dynamic QR Code & Printable PDF` | Trust distribution response |
| `Buyer / Public Verifier`| `0.0 VerifyChain System` | `Public Verification Request (Slug)` | `GET /api/supplier-trust/public/:slug` |
| `Buyer / Public Verifier`| `0.0 VerifyChain System` | `Dynamic QR Verification Token` | `GET /api/trust-distribution/qr/resolve/:token`|
| `0.0 VerifyChain System` | `Buyer / Public Verifier`| `Verified Supplier Identity & Status Badges`| Public trust portal render |
| `0.0 VerifyChain System` | `Buyer / Public Verifier`| `Embeddable Trust Badge / Widget Assets` | Embed endpoints render |

#### 4. Compact ASCII Preview
```
                            ┌───────────────────────────────────────────────┐
                            │               MSME Owner                      │
                            │           (External Entity)                   │
                            └───────┬───────────────────────────────▲───────┘
                                    │                               │
        Registration & Credentials  │                               │ JWT Auth Token & User Data
        Enterprise Profile Details  │                               │ Statutory Verification Result
        Verification Requests       │                               │ Compliance Health Score (0-100)
        QR Code Generation Requests │                               │ Supplier Trust Standing
                                    ▼                               │ Signed QR Code & PDF Cert
                            ┌───────────────────────────────────────┴───────┐
                            │                                               │
                            │                      0.0                      │
                            │               VerifyChain System              │
                            │               (Central Process)               │
                            │                                               │
                            └───────┬───────────────────────────────▲───────┘
                                    │                               │
       Verified Supplier Identity   │                               │ Public Verification Query (Slug)
       Status Badges & Audit History│                               │ Dynamic QR Verification Token
       Embeddable Badge/Widget HTML │                               │ Deep-Link Query Parameters
                                    ▼                               │
                            ┌───────────────────────────────────────┴───────┐
                            │            Buyer / Public Verifier            │
                            │               (External Entity)               │
                            └───────────────────────────────────────────────┘
```

#### 5. Notation Legend & Verification Checklist
- **Square / Rectangle**: External Entity (source or sink of data outside the system boundary).
- **Circle or Rounded Box**: Central transformation process (`0.0`).
- **Directed Arrow**: Labeled data flow containing a noun phrase.
- **Check Your Drawing**:
  - [ ] No internal database drawn as an external entity (PostgreSQL is internal).
  - [ ] Only confirmed external actors (`MSME Owner`, `Buyer / Public Verifier`) are present.
  - [ ] All flows have noun labels describing the data.

---

### Diagram 6 — Data Flow Diagram (DFD) Level 1: Subsystem Decomposition

#### 1. Identification & Caption
- **Figure Number**: Figure 6
- **Title**: DFD Level 1 Subsystem Decomposition Diagram
- **Purpose**: Decompose the central `0.0 VerifyChain System` into 7 active sub-processes and real internal data stores, proving mathematical balancing with Level 0.
- **Report Caption**: *Figure 6: DFD Level 1 Diagram decomposing core system processes, data flows, and active physical stores.*

#### 2. Layout Plan
- **Sheet Orientation**: Landscape (A4).
- **Process Decomposition (Numbered 1.0 to 7.0)**:
  - `1.0`: Authenticate & Manage Session
  - `2.0`: Manage Business Profile & Verify Statutory IDs
  - `3.0`: Evaluate Compliance Rules Deterministically
  - `4.0`: Calculate Compliance Health Score & Insights
  - `5.0`: Evaluate Supplier Trust Standing & Timeline
  - `6.0`: Issue & Distribute Dynamic Trust Assets
  - `7.0`: Resolve Public Verification & Buyer Inquiries
- **Data Stores (Open-ended rectangles)**:
  - `D1: users`
  - `D2: msme_profiles`
  - `D3: compliance_rules`
  - `D4: rule_evaluation_logs`
  - `D5: compliance_records`
  - `D6: health_score_configs & snapshots`
  - `D7: supplier_trust_profiles & metadata`
  - `D8: trust_distribution_identities & configs`

#### 3. Exact DFD Flow Ledger (Level 1)

| Source | Destination | Data Label | Store / Table Involved |
| :--- | :--- | :--- | :--- |
| `MSME Owner` | `1.0 Authenticate` | `Credentials (Email, Password)` | — |
| `1.0 Authenticate` | `D1: users` | `User Record Lookup / Insert` | `users` |
| `D1: users` | `1.0 Authenticate` | `Hashed Password & Role` | `users` |
| `1.0 Authenticate` | `MSME Owner` | `JWT Bearer Token` | — |
| `MSME Owner` | `2.0 Manage Profile` | `Profile Attributes & IDs` | — |
| `2.0 Manage Profile`| `D2: msme_profiles` | `Persisted Profile Data` | `msme_profiles` |
| `D2: msme_profiles`| `2.0 Manage Profile` | `Existing Profile Record` | `msme_profiles` |
| `2.0 Manage Profile`| `MSME Owner` | `Verification Status & Profile`| — |
| `D2: msme_profiles`| `3.0 Evaluate Rules` | `Business Profile Snapshot` | `msme_profiles` |
| `D3: rules` | `3.0 Evaluate Rules` | `Active Statutory Rules JSON` | `compliance_rules` |
| `3.0 Evaluate Rules`| `D4: eval_logs` | `Audit Trail Logs` | `rule_evaluation_logs` |
| `3.0 Evaluate Rules`| `D5: comp_records`| `Synchronized Records` | `compliance_records` |
| `D5: comp_records` | `4.0 Calculate Score`| `Active Compliance Records` | `compliance_records` |
| `D6: score_store` | `4.0 Calculate Score`| `Scoring Config & Weights` | `health_score_configs` |
| `4.0 Calculate Score`| `D6: score_store` | `CHS Snapshot Record` | `health_score_snapshots`|
| `4.0 Calculate Score`| `MSME Owner` | `0-100 Score & Insights` | — |
| `D6: score_store` | `5.0 Evaluate Trust`| `Latest Score & Risk Level` | `health_score_snapshots`|
| `D5: comp_records` | `5.0 Evaluate Trust`| `Overdue Filings Count` | `compliance_records` |
| `5.0 Evaluate Trust`| `D7: trust_store` | `Trust Level & State` | `supplier_trust_profiles`|
| `5.0 Evaluate Trust`| `MSME Owner` | `Trust Decision & Timeline` | — |
| `D7: trust_store` | `6.0 Issue Assets` | `Public Identifier & Standing`| `supplier_trust_profiles`|
| `6.0 Issue Assets` | `D8: dist_store` | `Distribution Identity & QR`| `trust_distribution_identities`|
| `6.0 Issue Assets` | `MSME Owner` | `Signed QR Code & PDF Cert` | — |
| `Buyer / Verifier` | `7.0 Resolve Public`| `Signed QR Token / Slug` | — |
| `D8: dist_store` | `7.0 Resolve Public`| `Token Metadata & Status` | `trust_distribution_identities`|
| `D7: trust_store` | `7.0 Resolve Public`| `Public Profile & Evidence` | `supplier_trust_profiles`|
| `7.0 Resolve Public`| `Buyer / Verifier` | `Sanitized Public Verification`| — |

#### 4. Compact ASCII Preview
```
 ┌────────────┐               ┌────────────────────────┐              ┌───────────────┐
 │ MSME Owner │──Credentials─►│ 1.0 Authenticate User  │◄──Read/Write►│   D1: users   │
 └─────┬──────┘               └───────────┬────────────┘              └───────────────┘
       │                                  │ JWT Token
       │ Profile Data                     ▼
       ├─────────────────────►┌────────────────────────┐              ┌───────────────┐
       │                      │ 2.0 Manage Business    │◄──Read/Write►│ D2: profiles  │
       │◄──Profile Status─────│     Profile & IDs      │              └───────┬───────┘
       │                      └────────────────────────┘                      │
       │                                                              Snapshot│
       │                                                                      ▼
       │                      ┌────────────────────────┐              ┌───────────────┐
       │                      │ 3.0 Evaluate Rules     │◄──Rules──────│   D3: rules   │
       │                      │     Deterministically  │───Audit──────►│ D4: eval_logs │
       │                      └───────────┬────────────┘───Upsert─────►│ D5: records   │
       │                                  │                            └───────┬───────┘
       │                                  ▼                                    │
       │                      ┌────────────────────────┐              Records  │
       │◄──Score & Insights───│ 4.0 Calculate CHS      │◄──────────────────────┘
       │                      │     Health Score (0-100│◄──Config/Snap►┌───────────────┐
       │                      └───────────┬────────────┘              │ D6: chs_snaps │
       │                                  │ Score Event               └───────┬───────┘
       │                                  ▼                                   │
       │                      ┌────────────────────────┐                      │
       │◄──Trust Standing─────│ 5.0 Evaluate Supplier  │◄──Snapshots──────────┘
       │                      │     Trust Standing     │◄──Read/Write►┌───────────────┐
       │                      └───────────┬────────────┘              │ D7: trust_prof│
       │                                  │ Trust Level Changed       └───────┬───────┘
       │                                  ▼                                   │
       │                      ┌────────────────────────┐                      │
       │◄──QR & PDF Assets────│ 6.0 Issue Dynamic QR & │◄──Trust Profile──────┘
       │                      │     Distribution Assets│◄──Read/Write►┌───────────────┐
       │                      └────────────────────────┘              │ D8: dist_ident│
       │                                                              └───────┬───────┘
       │                                                                      │
 ┌─────┴────────────────┐     ┌────────────────────────┐                      │
 │   Buyer / Verifier   │────►│ 7.0 Resolve Public     │◄──Verify Token/Slug──┘
 │  (External Entity)   │◄────│     Verification Query │
 └──────────────────────┘     └────────────────────────┘
```

#### 5. Notation Legend & Verification Checklist
- **Circles**: Sub-processes 1.0 through 7.0.
- **Open Rectangles (`[D# Name]`)**: Physical data stores.
- **Arrows**: Directed, labelled data flows.
- **Level-0 Balancing Proof**:
  - Net inputs from MSME Owner to 1.0, 2.0, 6.0 match inputs to 0.0.
  - Net outputs from 1.0, 2.0, 4.0, 5.0, 6.0 to MSME Owner match outputs from 0.0.
  - Net inputs/outputs to Buyer match inputs/outputs to 0.0.
  - Zero black hole processes (every process has both inputs and outputs).
  - Zero miracle processes (no data is generated without inputs).

---

### Diagram 7 — Entity-Relationship (ER) Diagram: Physical Database

#### 1. Identification & Caption
- **Figure Number**: Figure 7
- **Title**: VerifyChain Physical Relational Database ER Diagram
- **Purpose**: Present the exact relational schema, primary keys, foreign keys, unique constraints, and physical cardinalities declared in `schema.prisma` and enforced by PostgreSQL migrations.
- **Report Caption**: *Figure 7: Physical ER Diagram detailing active models, relational foreign keys, unique indexes, and retained groundwork models.*

#### 2. Layout Plan
- **Sheet Orientation**: Landscape (A4).
- **Core Entity Backbone**:
  - `users` (1:1 optional) `msme_profiles`.
  - `msme_profiles` (1:N) `compliance_records`.
  - `msme_profiles` (1:N) `rule_evaluation_logs` (N:1) `compliance_rules`.
  - `msme_profiles` (1:N) `health_score_snapshots`.
  - `msme_profiles` (1:1 optional) `supplier_trust_profiles`.
  - `supplier_trust_profiles` (1:N) `trust_metadata`.
  - `supplier_trust_profiles` (1:N) `trust_timeline_events`.
  - `supplier_trust_profiles` (1:1 optional) `trust_distribution_identities`.
  - `trust_distribution_identities` (1:1 optional) `trust_distribution_configs`.
  - `trust_distribution_identities` (1:N) `trust_distribution_timeline_events`.
- **Standalone Reference Tables**:
  - `health_score_configs` (Versioned config catalog; scalar link from snapshot).
  - `score_categories` (Scoring category taxonomy).
- **Retained Groundwork Note (Clearly demarcated bottom box)**:
  - `documents` (FK -> `msme_profiles`)
  - `alerts` (FK -> `msme_profiles`, FK -> `compliance_records`)
  - `government_schemes` (1:N) `scheme_matches` (FK -> `msme_profiles`)
  - `buyer_view_logs` (FK -> `msme_profiles`)

#### 3. Full Model Relationship Ledger

| Model A (Parent) | Relationship | Model B (Child) | Foreign Key / Scalar Field | Physical Cardinality | Source Evidence | Status |
| :--- | :---: | :--- | :--- | :---: | :--- | :--- |
| `User` | 1 to 0..1 | `MsmeProfile` | `msme_profiles.user_id -> users.id` | `1 : 0..1` (Unique FK) | `schema.prisma:175` | **ACTIVE** |
| `MsmeProfile` | 1 to 0..N | `ComplianceRecord` | `compliance_records.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:332` | **ACTIVE** |
| `MsmeProfile` | 1 to 0..N | `RuleEvaluationLog` | `rule_evaluation_logs.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:386` | **ACTIVE** |
| `ComplianceRule`| 1 to 0..N | `RuleEvaluationLog` | `rule_evaluation_logs.rule_id -> compliance_rules.id` | `1 : 0..*` | `schema.prisma:387` | **ACTIVE** |
| `MsmeProfile` | 1 to 0..N | `HealthScoreSnapshot` | `health_score_snapshots.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:441` | **ACTIVE** |
| `MsmeProfile` | 1 to 0..1 | `SupplierTrustProfile`| `supplier_trust_profiles.msme_id -> msme_profiles.id` | `1 : 0..1` (Unique FK) | `schema.prisma:205` | **ACTIVE** |
| `SupplierTrustProfile`| 1 to 0..N | `TrustMetadata` | `trust_metadata.supplier_trust_profile_id -> stp.id` | `1 : 0..*` | `schema.prisma:230` | **ACTIVE** |
| `SupplierTrustProfile`| 1 to 0..N | `TrustTimelineEvent` | `trust_timeline_events.supplier_trust_profile_id -> stp.id` | `1 : 0..*` | `schema.prisma:248` | **ACTIVE** |
| `SupplierTrustProfile`| 1 to 0..1 | `TrustDistributionIdentity`| `trust_distribution_identities.stp_id -> stp.id` | `1 : 0..1` (Unique FK) | `schema.prisma:268` | **ACTIVE** |
| `TrustDistributionIdentity`| 1 to 0..1 | `TrustDistributionConfig` | `tdc.trust_distribution_identity_id -> tdi.id` | `1 : 0..1` (Unique FK) | `schema.prisma:289` | **ACTIVE** |
| `TrustDistributionIdentity`| 1 to 0..N | `TrustDistributionTimelineEvent`| `tdte.trust_distribution_identity_id -> tdi.id` | `1 : 0..*` | `schema.prisma:306` | **ACTIVE** |
| `MsmeProfile` | 1 to 0..N | `Document` | `documents.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:462` | **FOUNDATIONAL** |
| `MsmeProfile` | 1 to 0..N | `Alert` | `alerts.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:482` | **FOUNDATIONAL** |
| `ComplianceRecord`| 1 to 0..N | `Alert` | `alerts.compliance_record_id -> compliance_records.id` | `1 : 0..*` | `schema.prisma:483` | **FOUNDATIONAL** |
| `GovernmentScheme`| 1 to 0..N | `SchemeMatch` | `scheme_matches.scheme_id -> government_schemes.id` | `1 : 0..*` | `schema.prisma:523` | **FOUNDATIONAL** |
| `MsmeProfile` | 1 to 0..N | `SchemeMatch` | `scheme_matches.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:522` | **FOUNDATIONAL** |
| `MsmeProfile` | 1 to 0..N | `BuyerViewLog` | `buyer_view_logs.msme_id -> msme_profiles.id` | `1 : 0..*` | `schema.prisma:540` | **FOUNDATIONAL** |

*Note on Unconnected Active Models*:
- `HealthScoreConfig` and `ScoreCategory` do not possess physical foreign key constraints. `HealthScoreSnapshot.config_version` is a scalar string reference, allowing immutable decoupling when configurations are updated.

#### 4. Physical Entity Field Inventory

```
┌─────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│ users                           │       │ msme_profiles                                │
├─────────────────────────────────┤       ├──────────────────────────────────────────────┤
│ PK  id: Int                     │◄──────┤ PK     id: Int                               │
│ UQ  email: String               │ 1:0..1│ UQ,FK  user_id: Int                          │
│     password_hash: String       │       │        business_name: String                 │
│     name: String                │       │ UQ     gstin: String                         │
│     phone: String?              │       │ UQ     udyam_number: String                  │
│     role: UserRole              │       │        business_type: BusinessType           │
│     is_active: Boolean          │       │        sector, state, district: String       │
│     created_at, updated_at      │       │        employee_count: Int                   │
└─────────────────────────────────┘       │        annual_turnover_lakh: Float?          │
                                          │        is_food_business: Boolean             │
                                          │        is_profile_complete: Boolean          │
                                          │        last_compliance_sync: DateTime?       │
                                          │        created_at, updated_at                │
                                          └───────┬──────────────┬──────────────┬────────┘
                                                  │1             │1             │1
                                                  │              │              │
                     ┌────────────────────────────┘              │              └────────────────────────────┐
                     │0..*                                       │0..*                                       │0..1
                     ▼                                           ▼                                           ▼
┌─────────────────────────────────┐       ┌──────────────────────────────┐       ┌───────────────────────────────────────────┐
│ compliance_records              │       │ health_score_snapshots       │       │ supplier_trust_profiles                   │
├─────────────────────────────────┤       ├──────────────────────────────┤       ├───────────────────────────────────────────┤
│ PK     id: Int                  │       │ PK  id: Int                  │       │ PK     id: Int                            │
│ FK     msme_id: Int             │       │ FK  msme_id: Int             │       │ UQ,FK  msme_id: Int                       │
│        authority: AuthorityType │       │     config_version: String   │       │ UQ     public_slug: String                │
│        status: ComplianceStatus │       │     overall_score: Float?    │       │ UQ     public_identifier: String          │
│        priority: Priority       │       │     risk_level: RiskLevel    │       │        display_name: String               │
│        renewal_frequency: Freq  │       │     category_breakdown: JSON │       │        trust_level: TrustLevel            │
│        risk_level: RiskLevel    │       │     recommendations: JSON    │       │        verification_state: State          │
│        expiry_date: DateTime?   │       │     evaluated_at: DateTime   │       │        is_public: Boolean                 │
│        last_checked: DateTime   │       │     engine_version: String   │       │        trust_score_snapshot: Float?       │
│        notes: String?           │       └──────────────────────────────┘       │        created_at, updated_at             │
│ UQ(msme_id, authority)          │                                              └───────┬───────────────────────────┬───────┘
└─────────────────────────────────┘                                                      │1                          │1
                                                                                         │                           │
                                                             ┌───────────────────────────┘                           │
                                                             │0..*                                                   │0..1
                                                             ▼                                                       ▼
┌─────────────────────────────────┐       ┌──────────────────────────────┐       ┌───────────────────────────────────────────┐
│ rule_evaluation_logs            │       │ trust_timeline_events        │       │ trust_distribution_identities             │
├─────────────────────────────────┤       ├──────────────────────────────┤       ├───────────────────────────────────────────┤
│ PK  id: Int                     │       │ PK  id: Int                  │       │ PK     id: Int                            │
│ FK  msme_id: Int                │       │ FK  supplier_trust_profile_id│       │ UQ,FK  supplier_trust_profile_id: Int     │
│ FK  rule_id: Int                │       │     event_type: String       │       │        public_slug: String                │
│     evaluated_at: DateTime      │       │     title, description       │       │ UQ     stable_distribution_id: String     │
│     execution_time_ms: Float    │       │     actor: String            │       │        asset_version: String              │
│     is_applicable: Boolean      │       │     event_data: JSON         │       │        status: DistributionStatus         │
│     matched_conditions: JSON    │       │     created_at: DateTime     │       │        enabled_channels: String[]         │
│     explanation: String         │       └──────────────────────────────┘       │        created_at, updated_at             │
└────────────────▲────────────────┘                                              └───────┬───────────────────────────┬───────┘
                 │0..*                                                                   │1                          │1
                 │                                                                       │                           │
                 │1                                          ┌───────────────────────────┘                           │
┌────────────────┴────────────────┐                          │0..*                                                   │0..1
│ compliance_rules                │                          ▼                                                       ▼
├─────────────────────────────────┤       ┌──────────────────────────────┐       ┌───────────────────────────────────────────┐
│ PK  id: Int                     │       │ trust_dist_timeline_events   │       │ trust_distribution_configs                │
│ UQ  rule_id: String             │       ├──────────────────────────────┤       ├───────────────────────────────────────────┤
│     rule_name: String           │       │ PK  id: Int                  │       │ PK     id: Int                            │
│     authority: AuthorityType    │       │ FK  trust_dist_identity_id   │       │ UQ,FK  trust_distribution_identity_id     │
│     priority: Priority          │       │     event_type, title, desc  │       │        branding_json: JSON                │
│     conditions: JSON            │       │     actor, event_data: JSON  │       │        visibility_json: JSON              │
│     success_explanation: String │       │     created_at: DateTime     │       │        expiration_days: Int (365)         │
│     failure_explanation: String │       └──────────────────────────────┘       │        created_at, updated_at             │
└─────────────────────────────────┘                                              └───────────────────────────────────────────┘
```

#### 5. Compact Notation Legend & Groundwork Summary
- **PK**: Primary Key (`@id`).
- **FK**: Foreign Key (`@relation(fields: [...], references: [...])`).
- **UQ**: Unique constraint (`@unique` or multi-column `@@unique`).
- **Crow's Foot Cardinalities**:
  - `1 : 0..1`: Mandatory parent, optional single child (enforced via `@unique` FK).
  - `1 : 0..*`: Mandatory parent, zero or many children.
- **Retained Groundwork Models (Draw in a boxed footer on the same sheet)**:
  - `documents` (`msme_id` FK -> `msme_profiles.id`)
  - `alerts` (`msme_id` FK -> `msme_profiles.id`, `compliance_record_id` FK -> `compliance_records.id`)
  - `government_schemes` (Parent of `scheme_matches` via `scheme_id`)
  - `scheme_matches` (`msme_id` FK -> `msme_profiles.id`, `scheme_id` FK -> `government_schemes.id`)
  - `buyer_view_logs` (`msme_id` FK -> `msme_profiles.id`)

---

### Diagram 8 — UML Class Diagram / Module Architecture View

#### 1. Identification & Caption
- **Figure Number**: Figure 8
- **Title**: VerifyChain Module Architecture & Class Structure Diagram
- **Purpose**: Map the object-oriented structure, class responsibilities, methods, and coupling across deterministic calculation engines, repositories, and singleton services.
- **Report Caption**: *Figure 8: UML Class and Module Architecture Diagram detailing class methods, encapsulation, and engine dependencies.*

#### 2. Rationale: JavaScript Modules vs Strict UML Classes
In a JavaScript/Node.js runtime, standard files often export plain object literals or functions. A naive class diagram that invents fictitious classes would be academically fraudulent. However, VerifyChain deliberately uses **ES6 Classes** for all critical engines, coordinators, repositories, and services (`RuleExecutionEngine`, `RuleEvaluator`, `ScorePipeline`, `CategoryEvaluator`, `PenaltyBonusEngine`, `ScoreAggregator`, `TrustPolicyEngine`, `TrustDecisionEngine`, `DistributionTokenEngine`, `BaseRepository`, etc.). Diagram 8 captures these real classes and their explicit method signatures.

#### 3. Exact Class & Method Inventory

```
┌────────────────────────────────────────────────────────┐
│ <<class>> RuleExecutionEngine                          │
├────────────────────────────────────────────────────────┤
│ + createSnapshot(msmeProfile: Object): Object          │
│ + evaluateBusinessProfile(profile: Object): Promise    │
└───────────────────────────┬────────────────────────────┘
                            │ uses
                            ▼
┌────────────────────────────────────────────────────────┐
│ <<class>> RuleEvaluator                                │
├────────────────────────────────────────────────────────┤
│ + evaluateCondition(condition: JSON, snap: JSON): Object│
│ + evaluateRule(rule: Object, snap: JSON): Object       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ <<class>> ScorePipeline                                │
├────────────────────────────────────────────────────────┤
│ - domainEventBus: DomainEventBus                       │
├────────────────────────────────────────────────────────┤
│ + constructor(): registers event listeners             │
│ + executePipeline(msmeId: Int): Promise<CHSResult>     │
└───────┬───────────────────┬────────────────────┬───────┘
        │ delegates         │ delegates          │ delegates
        ▼                   ▼                    ▼
┌─────────────────────┐ ┌──────────────────┐ ┌───────────────────────┐
│ CategoryEvaluator   │ │PenaltyBonusEngine│ │ ScoreAggregator       │
├─────────────────────┤ ├──────────────────┤ ├───────────────────────┤
│+ evaluateCategories │ │+ evaluate(recs,  │ │+ aggregate(cats, pen, │
│  (records, codes)   │ │  config): Penalties│   config, prof): Result│
└─────────────────────┘ └──────────────────┘ └───────────────────────┘

┌────────────────────────────────────────────────────────┐
│ <<class>> TrustEvaluationPipeline                      │
├────────────────────────────────────────────────────────┤
│ + executePipeline(msmeId: Int): Promise<TrustResult>   │
└───────┬────────────────────────────────────────┬───────┘
        │ uses                                   │ uses
        ▼                                        ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────┐
│ <<class>> TrustPolicyEngine        │ │ <<class>> TrustDecisionEngine   │
├────────────────────────────────────┤ ├─────────────────────────────────┤
│ + evaluatePolicy(score, risk, recs)│ │ + generateDecision(pol, prof)   │
└────────────────────────────────────┘ └─────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ <<class>> DistributionTokenEngine                      │
├────────────────────────────────────────────────────────┤
│ - SECRET: String                                       │
│ - revokedTokens: Set<String>                           │
├────────────────────────────────────────────────────────┤
│ + issueToken(payload: Object): SignedToken             │
│ + validateToken(rawToken: String): ValidationResult    │
│ + revokeToken(rawToken: String): RevocationResult      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ <<class>> DomainEventBus (extends EventEmitter)        │
├────────────────────────────────────────────────────────┤
│ + EVENTS: Object (Catalog of 25+ events)               │
├────────────────────────────────────────────────────────┤
│ + publish(eventName: String, payload: Object): void    │
│ + subscribe(eventName: String, handler: Function): Func│
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ <<class>> BaseRepository                               │
├────────────────────────────────────────────────────────┤
│ # model: PrismaDelegate                                │
├────────────────────────────────────────────────────────┤
│ + findById(id: Int): Promise<Record>                   │
│ + findMany(query: Object): Promise<Record[]>           │
│ + create(data: Object): Promise<Record>                │
│ + update(where: Object, data: Object): Promise<Record> │
│ + delete(where: Object): Promise<Record>               │
└────────────────────────────────────────────────────────┘
```

#### 4. Notation Legend & Verification Checklist
- **Box with 3 Compartments**: Class Name, Attributes, and Operations/Methods.
- **Plus Sign (`+`)**: Public method.
- **Minus Sign (`-`)**: Private field/method.
- **Hash Sign (`#`)**: Protected property.
- **Hollow Triangle Arrow (`──▷`)**: Inheritance / Generalization (`extends`).
- **Solid Arrow with Open Head (`──►`)**: Association / Dependency call.
- **Check Your Drawing**:
  - [ ] Method names match exact symbol names in JavaScript classes.
  - [ ] Repositories inherit from `BaseRepository`.
  - [ ] `DomainEventBus` inherits from Node.js `EventEmitter`.

---

## 5. Comprehensive ER Model & Relationship Specification Table

Below is the exhaustive, authoritative data dictionary for all 19 models declared in `server/prisma/schema.prisma`:

| Model Name | Table Name | Primary Key | Foreign Keys & Target Models | Unique Constraints | Cardinality | Active / Groundwork Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `User` | `users` | `id` (Int) | None | `email` | 1 to 0..1 `MsmeProfile` | **ACTIVE** |
| `MsmeProfile` | `msme_profiles` | `id` (Int) | `user_id -> users.id` | `user_id`, `gstin`, `udyam_number` | 1:1 with User; 1:N children | **ACTIVE** |
| `SupplierTrustProfile`| `supplier_trust_profiles`| `id` (Int) | `msme_id -> msme_profiles.id` | `msme_id`, `public_slug`, `public_identifier`| 1:1 with MsmeProfile; 1:N children | **ACTIVE** |
| `TrustMetadata` | `trust_metadata` | `id` (Int) | `supplier_trust_profile_id -> stp.id`| None | N:1 with SupplierTrustProfile | **ACTIVE** |
| `TrustTimelineEvent` | `trust_timeline_events`| `id` (Int) | `supplier_trust_profile_id -> stp.id`| None | N:1 with SupplierTrustProfile | **ACTIVE** |
| `TrustDistributionIdentity`| `trust_distribution_identities`| `id` (Int)| `stp_id -> stp.id` | `stp_id`, `stable_distribution_id`| 1:1 with STP; 1:1 Config; 1:N Events | **ACTIVE** |
| `TrustDistributionConfig` | `trust_distribution_configs`| `id` (Int) | `tdi_id -> tdi.id` | `tdi_id` | 1:1 with TrustDistributionIdentity | **ACTIVE** |
| `TrustDistributionTimelineEvent`| `trust_distribution_timeline_events`| `id` (Int)| `tdi_id -> tdi.id` | None | N:1 with TrustDistributionIdentity | **ACTIVE** |
| `ComplianceRecord` | `compliance_records` | `id` (Int) | `msme_id -> msme_profiles.id` | `[msme_id, authority]` | N:1 with MsmeProfile; 1:N Alerts | **ACTIVE** |
| `ComplianceRule` | `compliance_rules` | `id` (Int) | None | `rule_id` | 1:N with RuleEvaluationLog | **ACTIVE** |
| `RuleEvaluationLog`| `rule_evaluation_logs`| `id` (Int) | `msme_id -> msme_profiles.id`, `rule_id -> cr.id` | None | N:1 with MsmeProfile & ComplianceRule | **ACTIVE** |
| `HealthScoreConfig`| `health_score_configs`| `id` (Int) | None | `config_version` | Standalone Config Store | **ACTIVE** |
| `ScoreCategory` | `score_categories` | `id` (Int) | None | `category_code` | Standalone Category Taxonomy | **ACTIVE** |
| `HealthScoreSnapshot`| `health_score_snapshots`| `id` (Int)| `msme_id -> msme_profiles.id`| None | N:1 with MsmeProfile | **ACTIVE** |
| `Document` | `documents` | `id` (Int) | `msme_id -> msme_profiles.id` | None | N:1 with MsmeProfile | **FOUNDATIONAL** |
| `Alert` | `alerts` | `id` (Int) | `msme_id -> mp.id`, `compliance_record_id -> cr.id`| `[msme_id, compliance_record_id, threshold]`| N:1 with MsmeProfile & ComplianceRecord | **FOUNDATIONAL** |
| `GovernmentScheme` | `government_schemes` | `id` (Int) | None | None | 1:N with SchemeMatch | **FOUNDATIONAL** |
| `SchemeMatch` | `scheme_matches` | `id` (Int) | `msme_id -> mp.id`, `scheme_id -> gs.id`| `[msme_id, scheme_id]` | N:1 with MsmeProfile & Scheme | **FOUNDATIONAL** |
| `BuyerViewLog` | `buyer_view_logs` | `id` (Int) | `msme_id -> msme_profiles.id` | None | N:1 with MsmeProfile | **FOUNDATIONAL** |

---

## 6. Glossary of VerifyChain-Specific Terminology

- **CHS (Compliance Health Score)**: A 0–100 integer derived deterministically from statutory records across TAX, LABOUR, CORPORATE, and LICENSING categories, adjusted for penalties and bonuses.
- **GSTIN**: 15-character Goods and Services Tax Identification Number issued to Indian tax-paying businesses.
- **Udyam Registration Number**: Official MSME recognition identifier formatted as `UDYAM-XX-00-0000000`.
- **PAN (Permanent Account Number)**: 10-character alphanumeric tax identifier whose 4th character encodes legal entity type (`C` = Company, `P` = Person, `F` = Firm).
- **AuthorityType**: Enumeration of Indian regulatory bodies: `GST`, `EPFO`, `ESIC`, `MCA`, `UDYAM`, `FSSAI`.
- **ComplianceStatus**: State of a statutory obligation: `COMPLIANT`, `DUE` (impending), `OVERDUE` (breached), `EXEMPT` (statutorily not applicable), `UNKNOWN`.
- **TrustLevel**: Discrete qualification tier: `ENTERPRISE_TRUSTED`, `HIGHLY_TRUSTED`, `TRUSTED`, `VERIFIED`, `PENDING`, `SUSPENDED`, `EXPIRED`, `REVOKED`.
- **Stable Distribution ID**: A permanent UUID/identifier (`VC-DIST-1001-XXXX`) assigned to an enterprise for multi-channel broadcasting.
- **Dynamic QR Code**: A vector/raster QR code encoding a short-lived or revocable URL containing an HMAC-SHA256 signed distribution token.
- **Public Slug**: SEO-friendly alphanumeric URL identifier (e.g., `gupta-textiles`) exposing privacy-sanitized standing at `/verify/:slug`.

---

## 7. Cross-Diagram Consistency Checklist

Ensure 100% alignment when hand-drawing all diagrams:

- [ ] **Actor Consistency**: `MSME Owner` and `Buyer / Public Verifier` are identical across Use Case, DFD Context, and DFD Level 1 diagrams.
- [ ] **Role Realism**: `Platform Administrator` is not shown as an active participant on the main canvas of Diagrams 1, 2, 4, 5, or 6 (documented as dormant groundwork).
- [ ] **Process Balancing**: Process names and data flows in DFD Level 0 match the net inputs/outputs of DFD Level 1.
- [ ] **Entity Names**: Table names in ERD match the data store names in DFD Level 1 (`users`, `msme_profiles`, `compliance_records`, etc.).
- [ ] **Route Names**: Routes called in Diagram 3 Sequence Diagram match endpoints in Diagram 4 Component Diagram.
- [ ] **Formulas & Weights**: Deductions (-15, -5) and bonus (+5) match in Activity Diagram, Component Diagram, and Class Diagram.
- [ ] **Exclusion of Non-Existent Tech**: No diagram features blockchain networks, smart contracts, Gemini AI, Ollama, or LLM agents.

---

## 8. Uncertainties, Inconsistencies & Open Questions

The following implementation-specific nuances should be noted in project report footnotes:

1. **Scheduled Alerts Execution**: While the `Alert` model and `node-cron`/`nodemailer` dependencies exist in `server/package.json`, `server/src/jobs/` is currently an empty directory. Expiry alerts do not trigger background emails at runtime without a bootstrap worker.
2. **Document Upload Storage**: The `Document` model stores a local file path (`uploads/`), and the repository exists, but no multipart upload route (e.g., `multer`) is mounted in `app.js`.
3. **Database Port vs App Port**: The backend Express server listens on Port 5000 (`http://localhost:5000`), the Vite client listens on Port 3000 (`http://localhost:3000`), and PostgreSQL listens on default Port 5432.
4. **Prisma Client Dependency**: During testing on a clean checkout without installed `node_modules`, runtime requires `npm install` before tests or migrations execute.

---

## 9. Comprehensive Academic Viva Defense Guide

Use these concise technical answers during your MCA viva voce defense:

### Q1: Why is the project named VerifyChain if there is no blockchain in the codebase?
> *"VerifyChain establishes an immutable, cryptographic chain of custody for enterprise statutory compliance. Instead of incurring the high gas fees, latency, and regulatory barriers of a public distributed ledger, VerifyChain achieves tamper-resistance through HMAC-SHA256 cryptographically signed distribution tokens, unique public slugs, and append-only relational audit logs (`rule_evaluation_logs` and `trust_timeline_events`). Blockchain anchoring is architected in the PRD as an optional future trust layer, but the current production core is 100% deterministic and zero-cost."*

### Q2: How does the Compliance Health Score (CHS) prevent arbitrary or biased scoring?
> *"The CHS is strictly deterministic, explainable, and reproducible. It groups statutory authorities into four equal categories: TAX, LABOUR, CORPORATE, and LICENSING. Each category starts at 100 base points. Filings marked DUE deduct 15 category points; OVERDUE filings deduct 35 points. The Category Evaluator averages these, and the PenaltyBonusEngine applies global deductions (-15 per overdue, -5 per due) or a +5 perfect compliance bonus. The result is strictly clamped between 0 and 100 and snapshotted with complete audit metadata."*

### Q3: Why is there no artificial intelligence or machine learning in the compliance evaluation?
> *"Statutory compliance is governed by strict Indian legal statutes (e.g., Section 39 of the CGST Act 2017, EPF & MP Act 1952). Regulatory compliance requires 100% deterministic, explainable rules. Large Language Models and probabilistic AI can hallucinate legal obligations or produce non-reproducible scores across identical inputs. By using a condition-based rules engine with boolean AST evaluators (`RuleEvaluator.js`), VerifyChain guarantees identical, legally defensible decisions every single time."*

### Q4: How does dynamic QR verification prevent tampering or forged screenshot fraud?
> *"The dynamic QR code does not merely encode a static URL. It embeds an HMAC-SHA256 signed token formatted as `stableDistributionId:publicSlug:issuedAt:expiresAt:signature`. When a buyer scans the QR code, the server verifies the cryptographic signature using the server secret key, checks against an in-memory revocation set, and confirms expiration dates before rendering the verified profile. Any modified payload results in an immediate `INVALID_SIGNATURE` rejection."*

### Q5: How is multi-tenancy and data isolation enforced between MSME owners?
> *"Data isolation is enforced at the middleware and service layers. Every protected HTTP request requires a valid JWT Bearer token decoded by `verifyToken` middleware, extracting `userId` and `msmeId`. The `msmeProfileRepository` queries filter records strictly by the authenticated `user_id`. Furthermore, the unique one-to-one constraint between `User` and `MsmeProfile` in the PostgreSQL database guarantees that an enterprise user cannot access or mutate another company's compliance records."*

# PRD.md — VerifyChain Product Requirements Document

Version: 1.0 | Status: Approved | Type: MCA Minor Project | Duration: 10–12 Weeks | Budget: ₹0

---

## 1. Vision

To become India's first free, citizen-accessible MSME compliance intelligence platform — giving every micro-enterprise a single source of truth for its compliance health, and giving every buyer instant verification of a supplier's credibility.

---

## 2. Mission

VerifyChain exists to eliminate the three-part compliance problem faced by India's micro-MSMEs: fragmentation across authorities, invisibility to buyers, and reactive (not proactive) discovery of compliance gaps. It does this through an aggregated compliance dashboard, a shareable buyer-facing verification card, and a proactive expiry alert engine — all completely free.

---

## 3. Objectives

| ID | Objective | Measurable Target |
|---|---|---|
| O1 | Provide MSME owners a unified compliance dashboard | Dashboard shows status across 6 authorities |
| O2 | Generate a shareable Verified Supplier Card | QR-linked public URL works without auth |
| O3 | Compute a transparent Compliance Health Score | Score includes named rule breakdown |
| O4 | Alert MSME owners before compliance deadlines expire | Alert engine triggers 30, 15, 7 days before expiry |
| O5 | Match MSMEs to eligible government schemes | 200+ seeded schemes; matcher runs on profile |
| O6 | Enable document upload and storage | Files stored locally; metadata in DB |
| O7 | Deliver working MVP in 10–12 weeks | All P0/P1 features functional on localhost |

---

## 4. Target Users

### Primary: MSME Owner

A micro or small enterprise owner who manages a business with 1–50 employees. They interact with multiple government portals manually, are often unaware of impending compliance deadlines, and lose contracts because buyers cannot verify their compliance status quickly.

**Profile:** Low-to-moderate digital literacy. Likely accesses the platform on a desktop browser. Primary language: English or regional. Key motivation: getting verified to win more contracts and access government schemes.

### Secondary: Buyer / Procurement Manager

An enterprise procurement officer or GeM buyer who needs to verify a supplier's compliance before awarding a contract. They have no standardized way to verify this today beyond asking for PDFs which may be expired or forged.

**Profile:** High digital literacy. Accesses the Supplier Card via QR scan or direct URL share. Does not create an account — reads the public card only.

### Internal: Platform Administrator

A platform team member who manages MSME verification queues, monitors compliance data quality, and manages platform health.

---

## 5. User Personas

### Persona 1: Ramesh Gupta, 44, Textile Manufacturer, Surat

Ramesh runs a 12-person garment unit. He exports to a European buyer who now requires ESG compliance documentation before each order. He has a GST certificate but doesn't know the status of his EPFO filings. He spends ₹18,000/year on a CA just to track these dates. He missed an FSSAI renewal last year and lost a ₹3 lakh order.

**Goal:** See all compliance in one place. Know what's expiring next. Show the buyer a professional verified profile — not a WhatsApp PDF.

### Persona 2: Priya Nair, 31, Procurement Manager, Bengaluru

Priya evaluates 40–60 small suppliers per quarter for her electronics company. She needs to verify each supplier's GST, EPFO, and factory license before onboarding them. Currently she manually calls each supplier, asks for PDFs, and waits 2–5 days for a response. She has no way to verify PDF authenticity.

**Goal:** Scan a QR code or visit a URL and see a live, verified compliance status in under 30 seconds. No calls. No waiting.

### Persona 3: Admin User (Platform Team)

Manages the verification queue, reviews flagged MSMEs, monitors alert delivery, and manages scheme data accuracy.

**Goal:** See system health at a glance. Review pending verifications. Manage scheme database.

---

## 6. User Stories

### MSME Owner — Auth & Profile

| ID | Story | Priority |
|---|---|---|
| US-01 | As an MSME owner, I want to register with my email, GSTIN, and Udyam number | P0 |
| US-02 | As an MSME owner, I want to log in and see my compliance dashboard | P0 |
| US-03 | As an MSME owner, I want to complete my business profile (type, sector, employee count, state) | P0 |

### MSME Owner — Compliance

| ID | Story | Priority |
|---|---|---|
| US-04 | As an MSME owner, I want to see my compliance status across GST, EPFO, ESIC, MCA, Udyam, FSSAI | P0 |
| US-05 | As an MSME owner, I want to see my Compliance Health Score (0–100) with a breakdown | P0 |
| US-06 | As an MSME owner, I want to see which compliance areas are at risk | P0 |
| US-07 | As an MSME owner, I want to refresh my compliance data on demand | P1 |

### MSME Owner — Supplier Card

| ID | Story | Priority |
|---|---|---|
| US-08 | As an MSME owner, I want to see my Verified Supplier Card | P0 |
| US-09 | As an MSME owner, I want to download my Supplier Card as a PDF | P1 |
| US-10 | As an MSME owner, I want to share a QR code that links to my public Supplier Card | P0 |

### MSME Owner — Documents

| ID | Story | Priority |
|---|---|---|
| US-11 | As an MSME owner, I want to upload compliance certificates to my Document Vault | P1 |
| US-12 | As an MSME owner, I want to tag each document by authority type | P1 |
| US-13 | As an MSME owner, I want to set a validity date on uploaded documents | P1 |
| US-14 | As an MSME owner, I want to download my previously uploaded documents | P1 |

### MSME Owner — Alerts

| ID | Story | Priority |
|---|---|---|
| US-15 | As an MSME owner, I want to receive an email alert 30, 15, and 7 days before any compliance deadline | P0 |
| US-16 | As an MSME owner, I want to see all upcoming and past alerts in an Alerts page | P1 |

### MSME Owner — Schemes

| ID | Story | Priority |
|---|---|---|
| US-17 | As an MSME owner, I want to see government schemes I am likely eligible for | P1 |
| US-18 | As an MSME owner, I want to see why I match or don't match a particular scheme | P1 |
| US-19 | As an MSME owner, I want a plain-language explanation of each scheme | P2 (AI) |

### Buyer

| ID | Story | Priority |
|---|---|---|
| US-20 | As a buyer, I want to scan a QR code and see an MSME's verified compliance status instantly | P0 |
| US-21 | As a buyer, I want to see when the compliance data was last updated | P0 |
| US-22 | As a buyer, I want to see individual authority status badges on the Supplier Card | P0 |

### Admin

| ID | Story | Priority |
|---|---|---|
| US-23 | As an admin, I want to see total MSMEs, compliance distribution, and alert status | P1 |
| US-24 | As an admin, I want to see a list of all MSMEs with their scores | P1 |
| US-25 | As an admin, I want to manage the government schemes database | P2 |

---

## 7. Functional Requirements

### FR-AUTH

| ID | Requirement |
|---|---|
| FR-AUTH-01 | Passwords hashed with bcrypt (salt rounds = 10) |
| FR-AUTH-02 | JWT issued on login; expiry 7 days |
| FR-AUTH-03 | JWT payload: { id, email, role, msmeId } |
| FR-AUTH-04 | Protected routes reject invalid/expired JWT with HTTP 401 |
| FR-AUTH-05 | Admin routes additionally check role = ADMIN; return 403 otherwise |
| FR-AUTH-06 | Password minimum 8 characters |
| FR-AUTH-07 | GSTIN format validated on registration: 15-character format |
| FR-AUTH-08 | Udyam number format validated: UDYAM-XX-00-0000000 |

### FR-COMPLIANCE

| ID | Requirement |
|---|---|
| FR-COMP-01 | System tracks 6 authorities: GST, EPFO, ESIC, MCA, Udyam, FSSAI |
| FR-COMP-02 | Each compliance_record has: authority, status (COMPLIANT/DUE/OVERDUE/EXEMPT/UNKNOWN), expiry_date, last_checked |
| FR-COMP-03 | Status FSSAI is set to EXEMPT for non-food businesses automatically |
| FR-COMP-04 | Compliance data is fetched/simulated on MSME profile creation and on manual refresh |
| FR-COMP-05 | Compliance refresh is rate-limited: maximum once per 24 hours per MSME |

### FR-SCORE

| ID | Requirement |
|---|---|
| FR-SCORE-01 | Score is computed only from compliance_records for the MSME |
| FR-SCORE-02 | Score range: 0–100 integer |
| FR-SCORE-03 | Score is always returned with a breakdown array (named rules + weights) |
| FR-SCORE-04 | Score levels: LOW (0–39), MEDIUM (40–74), HIGH (75–100) |
| FR-SCORE-05 | Score is never stored in the database — computed fresh each time |

### FR-SUPPLIER-CARD

| ID | Requirement |
|---|---|
| FR-CARD-01 | Buyer card URL: GET /api/buyer/card/:msmeId — no authentication required |
| FR-CARD-02 | Card shows: business name, GSTIN, Udyam, score, level, per-authority badges, last_verified timestamp |
| FR-CARD-03 | Each view is logged in buyer_view_logs |
| FR-CARD-04 | QR code is generated client-side (qrcode.react) — points to the buyer card URL |
| FR-CARD-05 | Card is printable (CSS print styles applied) |

### FR-DOCUMENTS

| ID | Requirement |
|---|---|
| FR-DOC-01 | Files stored in server/uploads/ directory |
| FR-DOC-02 | File types accepted: PDF, PNG, JPG, JPEG |
| FR-DOC-03 | Maximum file size: 5MB per file |
| FR-DOC-04 | File metadata (name, authority, validity_date, file_path) stored in documents table |
| FR-DOC-05 | Users can only access their own documents |
| FR-DOC-06 | Maximum 20 documents per MSME in MVP |

### FR-ALERTS

| ID | Requirement |
|---|---|
| FR-ALERT-01 | Alert engine runs daily via node-cron at 08:00 IST |
| FR-ALERT-02 | Alert triggered when expiry_date is 30, 15, or 7 days away |
| FR-ALERT-03 | Email sent via Nodemailer + Gmail SMTP |
| FR-ALERT-04 | Alert record created in alerts table with status SENT or FAILED |
| FR-ALERT-05 | In-app alerts visible on Alerts page |
| FR-ALERT-06 | No duplicate alerts: if alert already sent for same record + day threshold, skip |

### FR-SCHEMES

| ID | Requirement |
|---|---|
| FR-SCHEME-01 | 200+ government schemes seeded in government_schemes table |
| FR-SCHEME-02 | Each scheme has eligibility criteria (JSON) used for matching |
| FR-SCHEME-03 | Matcher runs when MSME profile is complete or on-demand |
| FR-SCHEME-04 | Match score (0–100) and match reasons stored in scheme_matches |
| FR-SCHEME-05 | MSME sees only schemes with match_score >= 50 |

---

## 8. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | All API responses under 500ms on localhost |
| NFR-02 | Security | No password_hash in any API response |
| NFR-03 | Security | JWT secret in environment variable only |
| NFR-04 | Security | All inputs validated server-side |
| NFR-05 | Security | File uploads validated (type + size) before storage |
| NFR-06 | Security | Users can only access their own MSME data |
| NFR-07 | Usability | All pages responsive at >= 375px width |
| NFR-08 | Usability | All form errors displayed inline |
| NFR-09 | Reliability | Score engine handles missing/null compliance records gracefully |
| NFR-10 | Cost | ₹0 — no paid services anywhere |
| NFR-11 | Compatibility | Works in Chrome and Firefox |

---

## 9. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Score is computed fresh on every request — never persisted |
| BR-02 | FSSAI compliance is auto-set to EXEMPT for non-food sectors |
| BR-03 | Compliance refresh capped at once per 24 hours per MSME |
| BR-04 | Only the MSME's own owner can upload, edit, or delete their documents |
| BR-05 | Buyer card is publicly accessible — no auth, no login |
| BR-06 | Scheme matches with score < 50 are not shown to the MSME owner |
| BR-07 | Alert is never sent twice for the same expiry + threshold combination |
| BR-08 | Admin role is seed-only — no self-registration to admin |
| BR-09 | File upload limit is 5MB per file, 20 files per MSME |
| BR-10 | Buyer view logs are created on every public card access (even unauthenticated) |

---

## 10. Project Scope

### In Scope

- MSME registration and profile management
- Compliance status tracking (6 authorities, simulated data)
- Compliance Health Score (0–100, rule-based)
- Verified Supplier Card (QR-linked public page)
- Document Vault (upload, tag, store locally)
- Expiry Alert Engine (email + in-app)
- Government Scheme Matcher (200+ schemes seeded)
- Admin dashboard (stats, MSME list)
- Buyer public view (no auth)
- PDF export of Supplier Card (pdfkit)
- Optional: Ollama scheme explanation (local AI)

### Out of Scope

- Live GSTN / EPFO / ESIC / MCA API integration
- SMS alerts (Twilio / Fast2SMS — paid)
- Payment processing
- Cloud deployment
- Mobile application
- Docker / Kubernetes
- Monitoring / observability
- TypeScript
- Multi-language UI
- Blockchain certificate anchoring (future)
- Real bank/NBFC integration for credit scoring

---

## 11. Constraints

| Type | Constraint |
|---|---|
| Budget | ₹0 |
| Time | 10–12 weeks |
| Team | 3–5 MCA students, beginner–intermediate |
| Language | JavaScript only |
| Hosting | Localhost only |
| APIs | Only free, open-source, or simulated |

---

## 12. Acceptance Criteria

| Feature | Criteria |
|---|---|
| Registration | MSME can register with GSTIN + Udyam, see dashboard on first login |
| Compliance Dashboard | Shows status for all 6 authorities with correct badges |
| Health Score | Seeded HIGH-score MSME returns score >= 75 with named breakdown |
| Supplier Card | Buyer can visit public URL without logging in and see live score |
| QR Code | Scanning QR opens Supplier Card URL in browser |
| Document Upload | PDF upload succeeds, appears in vault with authority tag |
| Alert Engine | Running `node-cron` job creates alert records for expiring items |
| Scheme Matcher | At least 5 schemes shown for a demo MSME with complete profile |
| Admin Dashboard | Stats cards show correct counts; MSME list renders |

---

## 13. Feature Priorities

| Priority | Features |
|---|---|
| P0 — Critical | Auth, MSME profile, compliance dashboard, health score, supplier card, alert engine |
| P1 — High | Document vault, scheme matcher, alerts page, admin dashboard, PDF export |
| P2 — Medium | Admin scheme management, buyer view log analytics |
| P3 — Optional | Ollama AI scheme explanation |
| Future | Live government API integration, mobile app, blockchain anchoring |

---

## 14. Development Milestones

| Milestone | Weeks | Deliverable |
|---|---|---|
| M1 — Foundation | 1 | Repo, DB, Express running, Prisma migrated |
| M2 — Auth + Profile | 2 | Register/login/JWT, MSME profile creation |
| M3 — Compliance + Score | 3–4 | Compliance records, score engine, dashboard |
| M4 — Supplier Card | 5 | QR-linked public card, buyer view |
| M5 — Documents + Alerts | 6–7 | Vault upload, alert engine, email |
| M6 — Schemes | 8 | Scheme seed, matcher, results page |
| M7 — Admin + Polish | 9 | Admin dashboard, PDF export, UI polish |
| M8 — Demo Ready | 10 | Seed data, demo scenarios, slides, README |

---

## 15. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Live government API access blocked | High | High | Use simulated data — architecture ready for swap |
| Gmail SMTP rate limits | Low | Medium | Daily alert job sends few emails; free tier sufficient |
| File uploads bloat server disk | Low | Medium | 5MB limit, 20 files per MSME |
| Ollama too slow on student laptops | Medium | Low | Feature is optional; graceful fallback |
| Unequal team skill distribution | Medium | Medium | Clear role assignment from Week 1 |

---

## 16. Future Roadmap

### Phase 2
- Live GSTN API integration (when sandbox approved)
- EPFO/ESIC API connectors
- SMS alerts via free tier (SMTP-to-SMS or Brevo free tier)

### Phase 3 (Startup Version)
- SaaS pricing (₹499/month per MSME)
- B2B API for enterprise buyers (compliance score query per GSTIN)
- GeM auto-qualification check
- TReDS / credit score integration

### Phase 4 (Enterprise)
- State government white-label
- Bank/NBFC API for MSME lending underwriting
- Export readiness assessment (DGFT, APEDA, BIS)

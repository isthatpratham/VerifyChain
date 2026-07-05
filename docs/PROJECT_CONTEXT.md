# PROJECT_CONTEXT.md — VerifyChain

> **Audience:** AI coding agents.
> **Instruction:** Read this document completely before writing any code, editing any file, or making any decision.
> **Status:** This is the single source of truth for the VerifyChain project. All other documents are subordinate unless explicitly stated otherwise.

---

## 1. What VerifyChain Is

VerifyChain is a Micro-MSME Compliance Intelligence and Supplier Verification Platform. It is an MCA Minor Project built by a team of 3–5 students with a ₹0 budget running entirely on localhost.

**Core product:** An MSME owner registers, provides their GSTIN and Udyam number, and VerifyChain:
1. Fetches compliance data from simulated/public government sources
2. Computes a Compliance Health Score (0–100)
3. Generates a shareable Verified Supplier Card (QR-linked public URL)
4. Alerts the owner before any compliance deadline expires
5. Matches the MSME profile to eligible government schemes

**What it is NOT:**
- Not a real-time bank or NPCI integration
- Not a payment processor
- Not a government portal
- Not an accounting software (no invoicing, no ledger)
- Not a production-deployed cloud service

---

## 2. The Problem It Solves

India has 7.4 crore registered MSMEs. 97% are micro-enterprises. They suffer three compounding problems:

1. **Fragmentation:** Compliance is spread across GST, EPFO, ESIC, MCA, Labour, Factory Act, FSSAI — each with its own portal and certificate format. No single view exists.
2. **Invisibility to buyers:** Buyers (GeM, enterprise procurement, export OEMs) cannot verify an MSME's compliance in seconds. MSMEs lose contracts because of this.
3. **Reactive discovery:** MSMEs learn about expired licenses only when a deal is rejected — not in advance.

VerifyChain solves all three: aggregated dashboard + shareable verification card + proactive alerts.

---

## 3. Technology Stack (Fixed)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router 6 |
| State | React Context API |
| HTTP Client | Axios |
| Charts | Chart.js + react-chartjs-2 |
| QR Generation | qrcode.react |
| Icons | Heroicons |
| Toasts | react-hot-toast |
| Backend | Node.js, Express.js |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, express-rate-limit |
| Scheduling | node-cron |
| Email | Nodemailer + Gmail SMTP (free) |
| PDF | pdfkit (open source) |
| AI (optional) | Ollama + llama3 (local, free) |
| Language | JavaScript only — NO TypeScript |
| Budget | ₹0 — no paid APIs, no paid cloud |
| Hosting | Localhost only |

Do not substitute, add, or remove any technology from this list.

---

## 4. Constraints (Hard Limits)

| Constraint | Detail |
|---|---|
| Language | JavaScript only. No `.ts` or `.tsx` files. |
| Budget | ₹0. No paid APIs, no paid services, no paid AI. |
| Hosting | Localhost only. No Vercel, AWS, Railway, Render. |
| Database | PostgreSQL + Prisma only. |
| Containers | No Docker. No Kubernetes. |
| Monitoring | None. No Grafana, Sentry, Prometheus. |
| TypeScript | Forbidden everywhere. |
| Government APIs | No live GSTN/EPFO/MCA API calls in MVP — use mock/simulated data and local seed database only. |
| AI | Ollama (local, free) only for optional scheme explanation. Never used for score computation. |

---

## 5. Folder Structure (Fixed)

```
verifychain/
├── client/src/
│   ├── pages/          One component per route
│   ├── components/     Reusable UI components
│   ├── context/        AuthContext.jsx only
│   ├── hooks/          useAuth.js, useCompliance.js
│   ├── services/       api.js (ALL axios calls)
│   └── utils/          Pure functions only
├── server/src/
│   ├── routes/         URL + middleware + validation
│   ├── controllers/    Thin handlers (no business logic)
│   ├── services/       All business logic
│   ├── middleware/     auth, admin, rateLimiter
│   ├── utils/          prismaClient.js, responseFormatter.js
│   └── jobs/           node-cron scheduled tasks
├── server/prisma/      schema.prisma, seed.js, migrations/
├── server/uploads/     Local file storage for documents
└── docs/               All extended documentation
```

Do not create new top-level folders. Do not rename existing folders.

---

## 6. Core Modules (8 Total)

| Module | Responsibility |
|---|---|
| Auth | Register, login, JWT, role management (MSME_OWNER / BUYER / ADMIN) |
| MSME Profile | GSTIN + Udyam registration, profile management, business type |
| Compliance Fetcher | Pulls simulated compliance data per authority, stores in DB |
| Score Engine | Computes 0–100 Compliance Health Score from compliance records |
| Document Vault | Upload, store (local disk), tag, retrieve compliance certificates |
| Alert Engine | node-cron job — daily scan for expiring compliance; sends email/in-app alerts |
| Scheme Matcher | Matches MSME profile to seeded government schemes; optional Ollama summary |
| Buyer View | Public QR-linked page showing Verified Supplier Card — no auth required |

---

## 7. Database Entities (8 Tables)

| Table | Purpose |
|---|---|
| `users` | All platform users; role = MSME_OWNER / BUYER / ADMIN |
| `msme_profiles` | Business profile linked 1:1 to a USER |
| `compliance_records` | One row per authority per MSME; holds status + expiry date |
| `documents` | Uploaded certificate files; linked to MSME + authority |
| `alerts` | Scheduled expiry alerts; linked to MSME + compliance_record |
| `government_schemes` | Seeded scheme database (200+ schemes) |
| `scheme_matches` | Junction: which schemes match which MSME |
| `buyer_view_logs` | Tracks when a Supplier Card was viewed (analytics) |

**Key invariant:** Compliance Health Score is computed from `compliance_records` only. It is never stored — it is computed fresh on every dashboard load and every buyer card view.

---

## 8. Compliance Authorities Tracked (MVP — 6)

| Authority | Data Source in MVP | What Is Checked |
|---|---|---|
| GST | Simulated (seed data + mock) | Filing status, return history, registration validity |
| EPFO | Simulated | Monthly contribution compliance |
| ESIC | Simulated | Employee health insurance compliance |
| MCA / ROC | Simulated | Company incorporation, annual return filing |
| Udyam | Simulated | Udyam Registration Certificate validity |
| FSSAI | Simulated | Food license (applicable only to food businesses) |

**Why simulated:** Live GSTN/EPFO APIs require government-approved API keys that take months to obtain. The MVP uses seeded mock data to demonstrate the full workflow. The architecture is designed so that when real API access is granted, the `complianceFetcher.js` service can swap mock calls for real ones with no other changes.

---

## 9. Compliance Health Score (Summary)

- Range: 0–100
- Computed by `server/src/services/scoreEngine.js`
- Rule-based, deterministic, fully explainable (breakdown array returned always)
- No machine learning — only named rules with fixed weights
- Levels: `LOW` (0–39), `MEDIUM` (40–74), `HIGH` (75–100)
- Score is computed on demand — never cached, never stored

Full specification: `docs/SCORE_ENGINE.md`

---

## 10. Verified Supplier Card

- Public URL: `GET /api/buyer/card/:msme_id` (no auth required)
- QR code on this URL is generated client-side (qrcode.react)
- Card shows: Business name, GSTIN, Udyam number, Compliance Health Score, per-authority status badges, last verified timestamp
- Card is printable and shareable — a buyer scans it, sees live compliance status
- Buyer view is logged in `buyer_view_logs` for analytics

---

## 11. Alert Engine

- Runs via `node-cron` daily at 08:00 IST
- Scans `compliance_records` for entries where `expiry_date` is within the next 30, 15, or 7 days
- Creates/updates rows in `alerts` table
- Sends email via Nodemailer (Gmail SMTP, free) to the MSME owner
- Also creates in-app notifications readable on the Alerts page

---

## 12. AI Rules

AI is optional and isolated to one feature only: scheme description generation. Ollama (local, free) with llama3 is used to generate a plain-language explanation of a government scheme when a user clicks "Explain this scheme". This is a non-critical enhancement — the application works fully without it. The AI never touches the score engine, compliance data, or any other module.

---

## 13. AI Agent Operating Rules

1. Never change the architecture.
2. Never rename or relocate folders.
3. Never invent new modules beyond the 8 in Section 6.
4. Never modify the database schema without updating `docs/DATABASE.md` first.
5. Never change API endpoint contracts without updating `docs/API_SPEC.md` first.
6. Never introduce TypeScript.
7. Never introduce paid APIs, paid services, or paid AI.
8. Never call live government APIs (GSTN, EPFO, MCA) — use simulated data only.
9. Never compute or modify scores outside `scoreEngine.js`.
10. Never store files outside `server/uploads/` for the document vault.
11. Always read `AGENTS.md` before implementing any feature.
12. Always implement backend before frontend for any new feature.
13. Always use `prisma.msmeProfile.findUnique` with the `userId` from `req.user.id` to scope queries to the authenticated user's data.
14. Always exclude `password_hash` from every API response using Prisma `select`.

---

## 14. Documentation Hierarchy

```
PROJECT_CONTEXT.md     ← Read first. Always.
        ↓
AGENTS.md              ← Coding rules, conventions, workflow
        ↓
docs/ARCHITECTURE.md   ← System structure, request lifecycle
        ↓
docs/DATABASE.md       ← Schema, indexes, relationships
        ↓
docs/API_SPEC.md       ← Endpoint contracts
        ↓
docs/SCORE_ENGINE.md   ← Scoring rules and weights
        ↓
docs/UI_UX.md          ← Page designs and component specs
        ↓
Everything else
```

Higher documents override lower documents when conflicts exist.

---

## 15. Definition of Done

An implementation is complete when:
- Architecture matches Section 6 and `docs/ARCHITECTURE.md` exactly
- All 8 database tables exist and match `docs/DATABASE.md`
- Score is computed only in `scoreEngine.js`, only from `compliance_records`
- Buyer card is publicly accessible without auth at `/api/buyer/card/:msme_id`
- Alert engine runs via `node-cron` and sends email via Nodemailer
- Document vault stores files in `server/uploads/` and records metadata in DB
- All pages handle loading, error, empty, and success states
- ₹0 budget — no paid service is used anywhere in the stack
- Demo works end-to-end with seeded data on localhost

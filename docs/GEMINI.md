# GEMINI.md — VerifyChain Quick Context

> Read this to understand VerifyChain in under 2 minutes.
> You are the Assistant AI. Claude handles planning. Antigravity handles coding.
> Your role: answer questions, suggest implementations, review logic, explain concepts.

---

## What VerifyChain Is

A web app for India's micro-MSMEs (7.4 crore registered businesses) that:
1. Aggregates compliance status across 6 government authorities (GST, EPFO, ESIC, MCA, Udyam, FSSAI)
2. Computes a Compliance Health Score (0–100) with a transparent rule-based breakdown
3. Generates a public QR-linked Verified Supplier Card buyers can scan to verify compliance
4. Alerts MSME owners before compliance deadlines expire
5. Matches MSME profiles to 200+ eligible government schemes

**Budget: ₹0. No paid APIs. No cloud. Runs entirely on localhost.**

---

## Stack (Fixed — Never Change)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| DB | PostgreSQL 16 + Prisma ORM |
| Auth | JWT + bcryptjs |
| File uploads | Multer + local disk (server/uploads/) |
| Email | Nodemailer + Gmail SMTP (free) |
| PDF | pdfkit (open source) |
| Scheduling | node-cron |
| AI (optional) | Ollama + llama3 (local, free) |
| Language | JavaScript ONLY — no TypeScript |

---

## Database (8 Tables)

| Table | Purpose |
|---|---|
| `users` | Platform accounts; role: MSME_OWNER / BUYER / ADMIN |
| `msme_profiles` | 1:1 with users; business identity + profile |
| `compliance_records` | One row per authority per MSME; status + expiry |
| `documents` | Uploaded certificate files metadata |
| `alerts` | Expiry alert records with status |
| `government_schemes` | Seeded scheme database (200+) |
| `scheme_matches` | Matched schemes per MSME with score + reasons |
| `buyer_view_logs` | Analytics: when buyer card was viewed |

---

## Score Engine (The Core)

- File: `server/src/services/scoreEngine.js`
- Input: `msmeId` + Prisma client
- Output: `{ score, level, breakdown, lastComputed }`
- Score: 0–100, computed from compliance_records — NEVER stored
- Levels: LOW (0–39), MEDIUM (40–74), HIGH (75–100)
- FSSAI is auto-EXEMPT for non-food businesses
- Penalties apply for OVERDUE (e.g., GST_OVERDUE_PENALTY: -10)
- Bonus: ALL_SIX_COMPLIANT (+5), PROFILE_COMPLETE (+2)
- Breakdown always returned — never hidden

---

## Compliance Data

**MVP uses simulated data only — no live GSTN/EPFO APIs** (those require government approval). `complianceFetcher.js` generates mock data matching real API response shapes so the swap to live APIs requires only that one file to change.

---

## Key Routes

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | None | Create account |
| `POST /api/msme/profile` | Required | Create MSME profile (triggers compliance fetch) |
| `GET /api/compliance/dashboard` | Required | Score + authority statuses |
| `GET /api/buyer/card/:msmeId` | **NONE** | Public supplier card |
| `POST /api/documents/upload` | Required | Upload certificate |
| `GET /api/alerts` | Required | Expiry alerts |
| `GET /api/schemes/matches` | Required | Matched government schemes |
| `GET /api/admin/stats` | Admin | Platform statistics |

---

## Non-Negotiables

- No TypeScript
- No paid APIs (not even Gmail is paid — it's free SMTP)
- No cloud deployment — localhost only
- Score computed only in `scoreEngine.js`
- Buyer card public at `/api/buyer/card/:msmeId` — no auth
- File uploads only to `server/uploads/`
- FSSAI always EXEMPT when `is_food_business = false`
- MSME data always scoped to `req.user.msmeId`

---

## Demo Scenarios (Seeded)

| MSME | GSTIN | Expected Level |
|---|---|---|
| Gupta Textiles (non-food, all compliant) | 27AABCU9603R1ZX | HIGH (~82) |
| Sharma Services (ESIC+MCA due) | 29AADCB2230M1ZP | MEDIUM (~54) |
| New Trading Co. (GST overdue) | 33AAHCS1429R1ZM | LOW (~28) |

---

## Your Role as Gemini

When the team asks for help:
1. Check if the answer violates any rule in AGENTS.md
2. Suggest implementations matching the folder structure in README.md
3. Answer in JavaScript — never TypeScript
4. Reference schema.prisma for database questions
5. Never suggest changing the score engine architecture
6. Never suggest paid services
7. When asked about compliance data: remind that it is simulated, not live

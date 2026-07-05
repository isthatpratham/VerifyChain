# DEVELOPMENT_PLAN.md — VerifyChain 10-Week Sprint Plan

---

## Team Roles

| Role | Responsibility |
|---|---|
| **Dev A** | Frontend — all React pages, Tailwind UI, routing |
| **Dev B** | Backend — Express routes, controllers, score engine, compliance fetcher |
| **Dev C** | Database — Prisma schema, migrations, seed data, scheme seeding |
| **Dev D** | Integration — API wiring, testing, documentation, bug fixes |
| **Dev E** (if 5) | Alert engine, PDF export, admin panel, QR, presentation |

---

## Critical Path

```
Week 1: Foundation (ALL)
    ↓
Week 2: Auth + MSME Profile (B, C, A, D)
    ↓
Week 3–4: Compliance Engine + Dashboard (B, C first → A, D after)
    ↓
Week 5: Supplier Card + Buyer View (B, A)
    ↓
Week 6: Document Vault + Alert Engine (B, E)
    ↓
Week 7: Scheme Matcher + Alerts Page (B, C, A)
    ↓
Week 8: Admin Panel + PDF Export (E, B, A)
    ↓
Week 9: Integration + Demo Seed Data (ALL)
    ↓
Week 10: Documentation + Presentation (ALL)
```

**The Score Engine (Week 3) is the critical path core.** Nothing downstream works without it. Pair-program `scoreEngine.js` — do not assign to one person alone.

---

## Week 1 — Foundation

**Goal:** Every team member has a working local environment. Server responds. Database connected. Prisma migrated.

| Task | Owner | Hours |
|---|---|---|
| GitHub repo setup, branch strategy, README skeleton | Dev D | 1h |
| Create root folder structure (`client/`, `server/`, `docs/`) | Dev D | 1h |
| `npm create vite@latest client -- --template react` | Dev A | 30m |
| Install Tailwind CSS, configure `tailwind.config.js` | Dev A | 1h |
| Install React Router 6, scaffold `App.jsx` with placeholder routes | Dev A | 2h |
| Figma wireframes: Landing, Dashboard, Compliance Status | Dev A | 4h |
| `npm init` in server, install all dependencies | Dev B | 1h |
| `server/src/app.js`: dotenv, cors, helmet, express.json, health route | Dev B | 2h |
| Install PostgreSQL 16 on all machines, verify via pgAdmin | Dev C | 2h |
| Create `verifychain` database in pgAdmin | Dev C | 30m |
| Write complete `schema.prisma` (all 8 models, all enums) | Dev C | 4h |
| `npx prisma migrate dev --name init` | Dev C | 30m |
| Verify all 8 tables in pgAdmin | Dev C | 30m |
| Write `.env.example` | Dev B | 30m |
| All team members configure `.env` | All | 30m |
| Commit: `chore: initialise project structure` | Dev D | 30m |

**Week 1 Deliverable:** `GET /api/health` returns 200. React loads on port 3000. 8 DB tables exist. Every machine runs both servers.

---

## Week 2 — Authentication + MSME Profile

**Goal:** Register, login, JWT working. MSME profile can be created.

| Task | Owner | Hours |
|---|---|---|
| `POST /api/auth/register` — validate, hash, create, JWT | Dev B | 3h |
| `POST /api/auth/login` — compare, JWT, include msmeId | Dev B | 2h |
| `GET /api/auth/me` | Dev B | 1h |
| `auth.middleware.js` — verify JWT, set req.user | Dev B | 1h |
| `admin.middleware.js` — check role | Dev B | 30m |
| `POST /api/msme/profile` — create profile, trigger complianceFetcher | Dev B | 3h |
| `GET /api/msme/profile` — scoped to req.user.id | Dev B | 1h |
| `PATCH /api/msme/profile` — partial update | Dev B | 1h |
| GSTIN format validator (`validateGSTIN.js`) | Dev B | 1h |
| Udyam number format validator | Dev B | 30m |
| Prisma seed: 1 admin, 3 MSME users + profiles | Dev C | 3h |
| `AuthContext.jsx` — user, token, msmeId, login(), logout() | Dev A | 3h |
| `useAuth.js` hook | Dev A | 30m |
| `Register.jsx` — form, client-side validation | Dev A | 3h |
| `Login.jsx` — form, error handling | Dev A | 2h |
| `App.jsx` — ProtectedRoute, AdminRoute wrappers | Dev A | 1h |
| `api.js` — axios instance, auth header auto-attach | Dev A | 1h |
| Test register → login → GET /me in Postman | Dev D | 2h |
| Commit: `feat(auth): JWT registration, login, MSME profile creation` | Dev D | 30m |

**Week 2 Deliverable:** Register and login work end-to-end. MSME profile created and returned. JWT in localStorage. Protected routes redirect to login.

---

## Week 3 — Compliance Fetcher + Score Engine

**Goal:** The core scoring pipeline works. Dashboard shows real scores.

**Priority: Pair-program `scoreEngine.js` and `complianceFetcher.js` — these are the most important files in the project.**

| Task | Owner | Hours |
|---|---|---|
| `complianceFetcher.js` — simulates 6 authorities, upserts compliance_records | Dev B | 5h |
| FSSAI auto-exempt logic in fetcher | Dev B | 1h |
| `scoreEngine.js` — AUTHORITY_RULES, computeScore(), breakdown array | Dev B | 6h |
| Unit tests for scoreEngine.js (Vitest) — 5 test cases | Dev D | 3h |
| `GET /api/compliance/dashboard` — calls scoreEngine + returns records | Dev B | 2h |
| `POST /api/compliance/refresh` — 24h rate limit + re-fetch | Dev B | 2h |
| Seed compliance_records for all 3 demo MSMEs (varied statuses) | Dev C | 3h |
| `Dashboard.jsx` — ScoreRing, authority grid, alerts preview, quick actions | Dev A | 5h |
| `ScoreRing.jsx` — SVG circular progress component | Dev A | 3h |
| `ComplianceBadge.jsx` — per-authority status pill | Dev A | 1h |
| `useCompliance.js` hook — fetch dashboard data | Dev A | 1h |
| Wire api.js → GET /compliance/dashboard | Dev A | 30m |
| Loading, error, empty states on Dashboard | Dev A | 1h |
| `ComplianceStatus.jsx` — 6 authority cards + score breakdown table | Dev A | 4h |
| Verify: demo HIGH MSME returns score >= 75 with correct breakdown | Dev D | 1h |
| Verify: demo LOW MSME returns score < 40 | Dev D | 30m |
| Commit: `feat(core): compliance fetcher, score engine, dashboard` | Dev D | 30m |

**Week 3 Deliverable:** Dashboard shows live score, authority badges, and breakdown. Different demo MSMEs return different score levels. Score is computed correctly per `SCORE_ENGINE.md`.

---

## Week 4 — Supplier Card + Buyer View

**Goal:** Public supplier card works. QR code generated. Buyers can view without login.

| Task | Owner | Hours |
|---|---|---|
| `GET /api/buyer/card/:msmeId` — public, no auth, log view | Dev B | 3h |
| `buyer_view_logs` creation in controller | Dev B | 1h |
| `SupplierCard.jsx` component — business info + score + badges | Dev A | 4h |
| `SupplierProfile.jsx` page — preview + QR code + share links | Dev A | 4h |
| QR code generation (qrcode.react) pointing to `/buyer/:msmeId` | Dev A | 1h |
| "Copy URL" + "Download QR as PNG" buttons | Dev A | 2h |
| `BuyerView.jsx` page — public layout, no auth sidebar | Dev A | 3h |
| Print CSS for BuyerView (A4-compatible) | Dev A | 2h |
| "Last verified" timestamp display on buyer card | Dev A | 30m |
| Test: Visit `/buyer/1` without being logged in — should work | Dev D | 30m |
| Test: QR code scans to correct URL | Dev D | 30m |
| Commit: `feat(supplier-card): public buyer view and QR code` | Dev D | 30m |

**Week 4 Deliverable:** Supplier card page renders for any MSME ID without auth. QR code works. Print layout looks clean.

---

## Week 5 — Document Vault

**Goal:** MSME can upload, view, download, and delete compliance certificates.

| Task | Owner | Hours |
|---|---|---|
| Configure `multer` — file type filter (PDF/PNG/JPG), size limit 5MB | Dev B | 2h |
| Unique filename generator: `<msmeId>_<timestamp>_<originalName>` | Dev B | 1h |
| `POST /api/documents/upload` — multer, validate, prisma.create | Dev B | 3h |
| `GET /api/documents` — list own documents | Dev B | 1h |
| `GET /api/documents/:id/download` — verify ownership, res.sendFile | Dev B | 2h |
| `DELETE /api/documents/:id` — verify ownership, unlink + prisma.delete | Dev B | 2h |
| Ensure `server/uploads/` is in `.gitignore` | Dev D | 15m |
| `DocumentVault.jsx` — upload form, document list, download/delete | Dev A | 5h |
| Drag-and-drop file input (optional enhancement) | Dev A | 2h |
| File type badge in document list (PDF icon, image icon) | Dev A | 1h |
| Test: Upload PDF → appears in list → download works → delete removes from disk | Dev D | 2h |
| Commit: `feat(documents): local document vault with upload/download` | Dev D | 30m |

**Week 5 Deliverable:** Document vault fully functional. Files stored in `server/uploads/`. Metadata in DB. Download and delete work correctly.

---

## Week 6 — Alert Engine + Email

**Goal:** Daily alert job runs, creates alert records, sends emails.

| Task | Owner | Hours |
|---|---|---|
| `emailService.js` — Nodemailer + Gmail SMTP, `sendAlert()` function | Dev E | 3h |
| Configure Gmail app password in `.env` | Dev E | 30m |
| `alertEngine.js` — `runDailyCheck()`: scan expiring records, create alerts, call email | Dev E | 5h |
| Deduplication logic: skip if alert already sent for same record + threshold | Dev E | 2h |
| `dailyAlertJob.js` — node-cron `'0 8 * * *'`, calls `runDailyCheck()` | Dev E | 1h |
| Start cron job in `app.js` | Dev E | 30m |
| `GET /api/alerts` — list with status filter | Dev B | 2h |
| Seed 5 alerts (mix of PENDING, SENT, FAILED) in seed.js | Dev C | 1h |
| Seed compliance_records with expiry dates 7–30 days away for demo | Dev C | 1h |
| `Alerts.jsx` page — AlertCard list, filter tabs | Dev A | 3h |
| `AlertCard.jsx` component | Dev A | 1h |
| Manual trigger for demo: `POST /api/admin/alerts/trigger` (admin only) | Dev B | 1h |
| Test: Run alert engine manually → alert records created → email received | Dev D | 2h |
| Commit: `feat(alerts): daily alert engine with Nodemailer email` | Dev D | 30m |

**Week 6 Deliverable:** Alert engine runs. Alert records created for expiring compliance. Email received in Gmail. Alerts page shows alert history.

---

## Week 7 — Scheme Matcher

**Goal:** 200+ schemes seeded. Matcher runs. Results shown to MSME.

| Task | Owner | Hours |
|---|---|---|
| Seed `government_schemes` with 30 representative schemes | Dev C | 4h |
| Scheme eligibility criteria JSON format documented in DATABASE.md | Dev C | 1h |
| `schemeMatcher.js` — `matchSchemes(msmeId, prisma)`: compute match_score per scheme | Dev B | 5h |
| `POST /api/schemes/refresh-matches` — runs matcher, upserts scheme_matches | Dev B | 2h |
| `GET /api/schemes/matches` — returns matches with score >= 50 | Dev B | 1h |
| `GET /api/schemes/:schemeId/explain` — calls Ollama if available, graceful fallback | Dev B | 3h |
| Ollama integration check: try `fetch('http://localhost:11434/api/generate')` | Dev B | 1h |
| `SchemesMatcher.jsx` — scheme cards with match%, reasons, Apply button | Dev A | 4h |
| Filter tabs: All / Credit / Subsidy / Training / Market Access | Dev A | 1h |
| AI explanation modal with loading state + fallback | Dev A | 2h |
| Trigger scheme matching on profile completion | Dev B | 1h |
| Test: Demo MSME sees >=5 schemes with score >=50 | Dev D | 1h |
| Commit: `feat(schemes): government scheme matcher with 30 seeded schemes` | Dev D | 30m |

**Week 7 Deliverable:** Scheme matcher shows relevant schemes per MSME. Match reasons displayed. Ollama explanation works if Ollama is running.

---

## Week 8 — Admin Panel + PDF Export

**Goal:** Admin can see platform stats. PDF download of Supplier Card works.

| Task | Owner | Hours |
|---|---|---|
| `GET /api/admin/stats` — aggregate counts + level distribution | Dev E | 2h |
| `GET /api/admin/msmes` — paginated list with score (computed per MSME) | Dev E | 3h |
| `GET /api/admin/msmes/:msmeId` — full profile view | Dev E | 1h |
| `GET /api/admin/schemes` — scheme list | Dev E | 1h |
| `PATCH /api/admin/schemes/:id` — toggle active | Dev E | 1h |
| `POST /api/admin/alerts/trigger` — manual trigger for demo | Dev E | 1h |
| `pdfGenerator.js` — pdfkit generates Supplier Card PDF | Dev E | 4h |
| `GET /api/buyer/card/:msmeId/pdf` — returns PDF buffer | Dev E | 1h |
| `AdminDashboard.jsx` — stats cards + Chart.js pie + bar | Dev A | 4h |
| `AdminMSMEs.jsx` — paginated MSME table with filter | Dev A | 3h |
| "Download PDF" button on SupplierProfile page | Dev A | 1h |
| Test admin routes with admin JWT in Postman | Dev D | 1h |
| Test PDF download — verify it opens and looks correct | Dev D | 1h |
| Commit: `feat(admin): admin panel, stats, PDF export` | Dev D | 30m |

**Week 8 Deliverable:** Admin dashboard shows live stats and chart. PDF of Supplier Card downloads correctly. Admin MSME list renders.

---

## Week 9 — Integration + Demo Readiness

**Goal:** End-to-end flows work. Demo data compelling. All bugs fixed.

| Task | Owner | Hours |
|---|---|---|
| Expand seed to 3 full demo MSMEs with distinct score levels | Dev C | 3h |
| Seed 30 schemes (total) with clear eligibility JSON | Dev C | 2h |
| Demo MSME 1: HIGH — all compliant, non-food, 12 employees | Dev C | 1h |
| Demo MSME 2: MEDIUM — ESIC due, MCA due, services sector | Dev C | 1h |
| Demo MSME 3: LOW — GST overdue, new business | Dev C | 1h |
| Full end-to-end test: Register → Profile → Dashboard → Card → Buyer URL | Dev D | 3h |
| Test all loading states (throttle network in browser DevTools) | Dev D | 2h |
| Test all error states (kill server, verify error UI) | Dev D | 2h |
| Test all empty states (new account, no documents) | Dev D | 1h |
| Fix all bugs found during testing | Dev A + Dev B | 6h |
| Mobile responsiveness pass on all pages | Dev A | 2h |
| Remove all console.log statements | All | 1h |
| Verify no password_hash in any API response | Dev B | 1h |
| Verify MSME data scoping (user cannot see another's data) | Dev D | 1h |
| Write demo script (who types what during presentation) | Dev D | 1h |
| Commit: `fix: integration testing and demo readiness` | Dev D | 30m |

**Week 9 Deliverable:** All flows work end-to-end. Three demo MSMEs produce distinct score levels. No breaking bugs.

---

## Week 10 — Documentation + Presentation

**Goal:** Professional documentation. Presentation ready. Demo rehearsed.

| Task | Owner | Hours |
|---|---|---|
| Take screenshots of all 12 pages | Dev D | 1h |
| Update README.md with screenshots | Dev D | 30m |
| Final review of all .md documentation files | All | 2h |
| Export ER diagram from Excalidraw → `docs/er-diagram.png` | Dev C | 1h |
| Export architecture diagram → `docs/architecture-diagram.png` | Dev B | 1h |
| Export Postman collection → `docs/api-collection.json` | Dev D | 1h |
| Write `docs/setup.md` — step-by-step local setup guide | Dev D | 2h |
| Final presentation slides (Canva / Google Slides) | Dev E | 4h |
| Demo video walkthrough (Loom, 5 minutes) | Dev D | 2h |
| Practice full demo twice (end-to-end, with QR scan live) | All | 2h |
| Final GitHub push — clean history, no secrets committed | Dev D | 1h |
| Commit: `docs: finalise all documentation and presentation materials` | Dev D | 30m |

**Week 10 Deliverable:** Professional README with screenshots. All 14 documentation files complete. Slides polished. Demo rehearsed and reliable.

---

## Must-Have vs Skip-If-Behind

| Week | Must Complete | Skip If Behind |
|---|---|---|
| 1 | DB + server running, 8 tables migrated | Figma wireframes |
| 2 | Auth + MSME profile creation | PATCH profile |
| 3 | Score engine + compliance dashboard | ComplianceStatus page detail |
| 4 | Supplier card + buyer view public URL | PDF export (move to Week 8) |
| 5 | Document upload + download | Drag-and-drop UI |
| 6 | Alert engine creates records + sends email | Alert page UI (move to Week 7) |
| 7 | Scheme matcher + results page | Ollama AI explanation |
| 8 | Admin dashboard + stats | Admin scheme management |
| 9 | Demo data + end-to-end testing | Mobile polish |
| 10 | README + slides + demo script | Video recording |

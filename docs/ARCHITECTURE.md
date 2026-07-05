# ARCHITECTURE.md — VerifyChain System Architecture

---

## 1. Overall Architecture

VerifyChain is a three-tier monolithic web application. No microservices. No serverless functions. No message queues. One React frontend, one Express backend, one PostgreSQL database — all on localhost.

```
┌──────────────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                              │
│           React 18 + Vite + Tailwind CSS                         │
│                     Port: 3000                                   │
│                                                                  │
│  Pages (12): Landing, Register, Login, Dashboard,                │
│  ComplianceStatus, DocumentVault, SupplierProfile,               │
│  SchemesMatcher, Alerts, BuyerView, AdminDashboard, AdminMSMEs   │
│                                                                  │
│  State: React Context API (AuthContext)                          │
│  Routing: React Router 6                                         │
│  HTTP: Axios via api.js (centralised)                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP/REST (JSON)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                               │
│             Node.js 20 + Express.js                              │
│                     Port: 5000                                   │
│                                                                  │
│  Middleware: helmet → cors → express.json → rateLimiter          │
│                                                                  │
│  Routes:                                                         │
│    /api/auth          /api/msme          /api/compliance         │
│    /api/documents     /api/alerts        /api/schemes            │
│    /api/buyer         /api/admin                                 │
│                                                                  │
│  Controllers (thin): parse → call service → respond              │
│                                                                  │
│  Services (business logic):                                      │
│    scoreEngine.js        complianceFetcher.js                    │
│    alertEngine.js        schemeMatcher.js                        │
│    pdfGenerator.js       emailService.js                         │
│                                                                  │
│  Scheduled Jobs (node-cron):                                     │
│    dailyAlertJob.js — 08:00 IST daily                           │
│                                                                  │
│  File Storage: server/uploads/ (local disk)                      │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Prisma ORM
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATA TIER                                    │
│               PostgreSQL 16  —  Port: 5432                       │
│               Managed via pgAdmin 4                              │
│                                                                  │
│  Tables (8): users, msme_profiles, compliance_records,           │
│  documents, alerts, government_schemes, scheme_matches,          │
│  buyer_view_logs                                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Diagram

```
CLIENT
───────────────────────────────────────────────────────────────────
AuthContext.jsx
  └── Provides: user, token, msmeId, login(), logout()
  └── Consumed via: useAuth() hook
  └── Consumed by: every protected page + ProtectedRoute wrapper

api.js
  └── Single axios instance
  └── Attaches Authorization header from AuthContext automatically
  └── One exported function per endpoint
  └── Consumed by: all pages and hooks

Pages
  └── Call api.js functions
  └── Manage local state (loading, error, data)
  └── Use components for display
  └── Handle 4 states: loading, error, empty, success

Components
  └── ScoreRing: animated circular score display
  └── ComplianceBadge: per-authority status pill
  └── AlertCard: individual alert display
  └── SupplierCard: buyer-facing card layout
  └── Navbar + Footer

SERVER
───────────────────────────────────────────────────────────────────
app.js
  └── Loads dotenv
  └── Initialises Prisma client
  └── Registers global middleware
  └── Mounts all routers
  └── Starts cron jobs
  └── Registers 404 handler

Routes
  └── Define URL, method, middleware chain, validation rules
  └── Reference controller handler functions

Controllers
  └── Check validationResult
  └── Extract from req.body / req.params / req.user
  └── Call one service function
  └── Return JSON with correct HTTP status
  └── Wrap in try/catch

Services
  ├── scoreEngine.js
  │     └── Reads compliance_records via Prisma
  │     └── Applies AUTHORITY_RULES
  │     └── Returns { score, level, breakdown }
  │
  ├── complianceFetcher.js
  │     └── Simulates compliance data per authority
  │     └── Upserts compliance_records via Prisma
  │     └── Sets FSSAI to EXEMPT for non-food automatically
  │
  ├── alertEngine.js
  │     └── Scans compliance_records for expiring items
  │     └── Creates Alert records
  │     └── Calls emailService.sendAlert()
  │
  ├── schemeMatcher.js
  │     └── Reads msme_profile
  │     └── Reads all active government_schemes
  │     └── Computes match_score per scheme
  │     └── Upserts scheme_matches
  │
  ├── pdfGenerator.js
  │     └── Uses pdfkit to generate Supplier Card PDF
  │     └── Returns Buffer
  │
  └── emailService.js
        └── Uses Nodemailer + Gmail SMTP
        └── Sends formatted alert emails

Jobs
  └── dailyAlertJob.js
        └── node-cron: '0 8 * * *' (08:00 IST daily)
        └── Calls alertEngine.runDailyCheck()
```

---

## 3. Layered Architecture (Backend)

```
┌──────────────────────────────────────────┐
│              ROUTE LAYER                 │
│  URL + method + middleware + validation   │
│  server/src/routes/*.routes.js           │
└──────────────────┬───────────────────────┘
                   │ delegates to
┌──────────────────▼───────────────────────┐
│           CONTROLLER LAYER               │
│  Parse request → call service → respond  │
│  server/src/controllers/*.controller.js  │
│  Rule: NO business logic here            │
└──────────────────┬───────────────────────┘
                   │ calls
┌──────────────────▼───────────────────────┐
│            SERVICE LAYER                 │
│  All business logic                      │
│  server/src/services/*.js                │
│  May import Prisma                       │
│  May import other services               │
│  May NOT import controllers or routes    │
└──────────────────┬───────────────────────┘
                   │ queries via
┌──────────────────▼───────────────────────┐
│          DATA ACCESS LAYER               │
│  Prisma ORM                              │
│  server/prisma/schema.prisma             │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│            DATABASE                      │
│  PostgreSQL 16                           │
└──────────────────────────────────────────┘
```

---

## 4. Authentication Flow

```
REGISTRATION
────────────────────────────────────────────────────────────────
POST /api/auth/register { name, email, password, phone }
  → Validate input
  → Check email uniqueness (Prisma findUnique)
  → bcrypt.hash(password, 10)
  → prisma.user.create({ name, email, password_hash, role: MSME_OWNER })
  → jwt.sign({ id, email, role, msmeId: null }, JWT_SECRET, { expiresIn: '7d' })
  → Return { token, user }
Client stores token in localStorage
AuthContext updates user state

LOGIN
────────────────────────────────────────────────────────────────
POST /api/auth/login { email, password }
  → prisma.user.findUnique({ where: { email } })
  → bcrypt.compare(password, user.password_hash)
  → Find associated msme_profile (may be null on first login)
  → jwt.sign({ id, email, role, msmeId: msmeProfile?.id || null })
  → Return { token, user }

AUTHENTICATED REQUEST
────────────────────────────────────────────────────────────────
Client: api.js attaches Authorization: Bearer <token>
Server: auth.middleware.js
  → Extract token from header
  → jwt.verify(token, process.env.JWT_SECRET)
  → Set req.user = { id, email, role, msmeId }
  → next()

MSME DATA SCOPING
────────────────────────────────────────────────────────────────
Every controller that returns MSME-specific data:
  → Uses req.user.msmeId to scope the Prisma query
  → Verifies msme_profile.user_id === req.user.id if queried by msmeId param
  → Returns 403 if mismatch
```

---

## 5. Compliance Data Flow

```
INITIAL (on profile creation)
────────────────────────────────────────────────────────────────
MSME registers → creates profile via POST /api/msme/profile
  → msme.controller.js calls complianceFetcher.fetchAll(msmeId)
  → complianceFetcher loops through 6 authorities:
      For each: generates simulated compliance data
      Determines status based on seeded patterns for this GSTIN
      Sets FSSAI to EXEMPT if !is_food_business
      prisma.complianceRecord.upsert({ where: { msme_id_authority: ... } })
  → Updates msme_profile.last_compliance_sync

MANUAL REFRESH
────────────────────────────────────────────────────────────────
MSME clicks "Refresh" → POST /api/compliance/refresh
  → Checks last_compliance_sync; rejects if < 24h ago (429)
  → Calls complianceFetcher.fetchAll(msmeId) again
  → Updates all 6 compliance_records
  → Returns updated status

SCORE COMPUTATION
────────────────────────────────────────────────────────────────
GET /api/compliance/dashboard OR GET /api/buyer/card/:msmeId
  → compliance.controller.js calls scoreEngine.computeScore(msmeId, prisma)
  → scoreEngine reads compliance_records via prisma
  → Applies AUTHORITY_RULES per authority
  → Applies bonus rules
  → Caps score at 100, floors at 0
  → Returns { score, level, breakdown, lastComputed }
  → Controller combines score + raw compliance records in response
```

---

## 6. Alert Engine Flow

```
SCHEDULED (daily at 08:00 IST via node-cron)
────────────────────────────────────────────────────────────────
dailyAlertJob.js → alertEngine.runDailyCheck()
  → Query: SELECT * FROM compliance_records
           WHERE expiry_date IS NOT NULL
           AND expiry_date <= NOW() + 30 days
           AND status NOT IN ('EXEMPT', 'UNKNOWN')

  For each record:
    For each threshold in [30, 15, 7]:
      daysUntilExpiry = daysBetween(now, record.expiry_date)
      If daysUntilExpiry <= threshold:
        Check alerts table: WHERE msme_id = X AND compliance_record_id = Y AND threshold = Z
        If no existing alert:
          prisma.alert.create({ status: PENDING, scheduled_for: now })
          emailService.sendAlert(msme, record, threshold)
          If email sent: update alert.status = SENT, alert.sent_at = now
          If email fails: update alert.status = FAILED, alert.failure_reason = error.message

IN-APP
────────────────────────────────────────────────────────────────
GET /api/alerts → returns all alerts for MSME
  → Alerts page displays them sorted by scheduled_for DESC
  → PENDING: yellow; SENT: green; FAILED: red with retry option
```

---

## 7. Document Vault Flow

```
UPLOAD
────────────────────────────────────────────────────────────────
POST /api/documents/upload (multipart/form-data)
  → Multer middleware: validate type (PDF/PNG/JPG), size (<=5MB)
  → Generate unique filename: <msmeId>_<timestamp>_<originalName>
  → Write to server/uploads/<filename>
  → prisma.document.create({
      msme_id, document_type, authority,
      file_name, file_path: 'uploads/<filename>',
      file_size_kb, validity_date, notes
    })
  → Return document metadata

DOWNLOAD
────────────────────────────────────────────────────────────────
GET /api/documents/:id/download
  → prisma.document.findFirst({ where: { id, msme_id: req.user.msmeId } })
  → If not found or wrong msme: 403/404
  → res.sendFile(path.join(__dirname, '../../../', document.file_path))

DELETE
────────────────────────────────────────────────────────────────
DELETE /api/documents/:id
  → Verify ownership
  → fs.unlink(filePath) — remove from disk
  → prisma.document.delete({ where: { id } })
```

---

## 8. Supplier Card Flow (Public)

```
MSME copies card URL: http://localhost:3000/buyer/:msmeId
OR scans QR code generated on SupplierProfile page

GET /api/buyer/card/:msmeId (no auth required)
  → prisma.msmeProfile.findUnique({ where: { id: msmeId } })
  → If not found: 404
  → scoreEngine.computeScore(msmeId, prisma)
  → prisma.complianceRecord.findMany({ where: { msme_id: msmeId } })
  → prisma.buyerViewLog.create({ msme_id: msmeId, viewer_ip, user_agent })
  → Return: business info + score + authority badges

React BuyerView.jsx renders:
  → Business identity section
  → Score ring (ScoreRing component)
  → Per-authority badge grid (ComplianceBadge per authority)
  → Last verified timestamp
  → "This information is refreshed daily" disclaimer
```

---

## 9. Folder Responsibilities

| Folder | What Belongs Here | What Does NOT Belong Here |
|---|---|---|
| `client/src/pages/` | Route components (one per URL) | Reusable components |
| `client/src/components/` | UI used on 2+ pages | Page-specific layouts |
| `client/src/services/api.js` | All axios calls | Business logic, state |
| `client/src/context/` | AuthContext only | Non-global state |
| `client/src/hooks/` | Custom hooks (`use*`) | Components |
| `client/src/utils/` | Pure functions, no side effects | API calls |
| `server/src/routes/` | URL + middleware + validation | Business logic |
| `server/src/controllers/` | Request parsing + response sending | Business logic |
| `server/src/services/` | Business logic, Prisma queries | HTTP concerns |
| `server/src/middleware/` | Cross-cutting auth/rate-limit | Business logic |
| `server/src/jobs/` | node-cron schedule definitions | Business logic (in services) |
| `server/uploads/` | Uploaded certificate files | Application code |
| `server/prisma/` | Schema, migrations, seed | Application code |

---

## 10. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Simulated compliance data (no live APIs) | GSTN/EPFO APIs require approved government credentials. Simulation lets MVP demonstrate the full workflow without 3-month approval waits. Architecture is designed so `complianceFetcher.js` can swap mock data for real API calls with no other changes. |
| Score not stored in DB | Score depends on live compliance_record data. Storing it would mean it becomes stale within hours. Computing fresh ensures buyer card always reflects current state. |
| Public buyer card needs no auth | The purpose of the card is to be shared with buyers who have no VerifyChain account. Auth would defeat the product's core value. |
| Local file storage (server/uploads) | No cloud budget. `multer` + local disk is sufficient for a localhost demo with <20 files per MSME. |
| node-cron for alerts | No message queue (RabbitMQ, Redis) is in scope. `node-cron` is sufficient for a daily alert job at this scale. |
| FSSAI auto-exempt | Business rule: non-food businesses don't need FSSAI. Hardcoded in score engine to prevent incorrect LOW scores for manufacturing MSMEs. |
| Ollama for AI (optional) | Local, free, no API key. Runs on student laptops with >= 8GB RAM. Graceful fallback if not available. Used only for scheme explanation — never for any compliance computation. |

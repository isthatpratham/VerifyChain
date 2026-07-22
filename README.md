# VerifyChain ✅

> **Turn your MSME into a buyer-ready business in 48 hours.**

VerifyChain is a Micro-MSME Compliance Intelligence & Supplier Verification Platform. It gives India's 7.4 crore registered MSMEs a single compliance health dashboard, a shareable buyer-facing verified supplier profile, and proactive expiry alerts — all aggregated from government sources, with zero cost to the MSME.

---

## The Problem

India's MSMEs contribute 31% of GDP, 35.4% of manufacturing, and nearly 50% of exports — yet 5 in 10 face supplier management and compliance challenges (LocalCircles MSME Day 2026 survey, 16,000+ respondents). The specific gap:

- **No single dashboard** aggregates compliance status across GST, EPFO, ESIC, MCA, and Labour authorities
- **No buyer-facing standard** for verified supplier profiles — buyers cannot verify a supplier's compliance in seconds
- **No proactive alerting** — MSMEs discover expired licenses only when a buyer rejects them
- **₹10,000–50,000/year** spent on consultants for work that should be automated
- **₹30 lakh crore credit gap** partly because MSMEs cannot demonstrate compliance health to banks

VerifyChain closes this gap by aggregating compliance status from public government data sources, computing a Compliance Health Score (0–100), and generating a shareable QR-linked Verified Supplier Card that any buyer can scan to verify in seconds.

---

## Key Features

| Feature | Description |
|---|---|
| Compliance Dashboard | Live status across 6+ compliance authorities |
| Compliance Health Score | 0–100 score with rule-based breakdown |
| Verified Supplier Card | QR-linked public profile any buyer can scan |
| Expiry Alert Engine | SMS/email alerts before license expiry |
| Document Vault | Upload, tag, and store compliance certificates |
| Government Scheme Matcher | Match MSME profile to eligible central and state schemes |
| Admin Panel | Platform management, verification queue |

---

## Screenshots

| Dashboard | Supplier Card | Scheme Matcher |
|---|---|---|
| `docs/screenshots/dashboard.png` | `docs/screenshots/supplier-card.png` | `docs/screenshots/schemes.png` |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│     React 18 + Vite + Tailwind CSS          │
│              Port 3000                      │
└──────────────────┬──────────────────────────┘
                   │ HTTP (Axios)
                   ▼
┌─────────────────────────────────────────────┐
│     Node.js + Express.js API                │
│              Port 5000                      │
│  Routes → Controllers → Services → Prisma   │
│  Middleware: JWT | Helmet | CORS | RateLimit │
└──────────────────┬──────────────────────────┘
                   │ Prisma ORM
                   ▼
┌─────────────────────────────────────────────┐
│     PostgreSQL 16 (pgAdmin 4)               │
│              Port 5432                      │
└─────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router 6 |
| HTTP Client | Axios |
| State | React Context API |
| Charts | Chart.js + react-chartjs-2 |
| QR Generation | qrcode.react |
| Icons | Heroicons |
| Notifications | react-hot-toast |
| Backend | Node.js, Express.js |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, express-rate-limit |
| Scheduling | node-cron (alert engine) |
| Email | Nodemailer + Gmail SMTP (free) |
| PDF Generation | pdfkit (open source) |
| AI (optional) | Ollama + llama3 (local, free) |

---

## Folder Structure

```
verifychain/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ScoreRing.jsx
│       │   ├── ComplianceBadge.jsx
│       │   ├── AlertCard.jsx
│       │   ├── SupplierCard.jsx
│       │   └── Footer.jsx
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Register.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── ComplianceStatus.jsx
│       │   ├── DocumentVault.jsx
│       │   ├── SupplierProfile.jsx
│       │   ├── SchemesMatcher.jsx
│       │   ├── Alerts.jsx
│       │   ├── BuyerView.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminMSMEs.jsx
│       │   └── NotFound.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useCompliance.js
│       ├── services/
│       │   └── api.js
│       ├── utils/
│       │   ├── formatScore.js
│       │   └── validateGSTIN.js
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── msme.routes.js
│   │   │   ├── compliance.routes.js
│   │   │   ├── documents.routes.js
│   │   │   ├── schemes.routes.js
│   │   │   ├── alerts.routes.js
│   │   │   ├── buyer.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── msme.controller.js
│   │   │   ├── compliance.controller.js
│   │   │   ├── documents.controller.js
│   │   │   ├── schemes.controller.js
│   │   │   ├── alerts.controller.js
│   │   │   ├── buyer.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── scoreEngine.js
│   │   │   ├── complianceFetcher.js
│   │   │   ├── alertEngine.js
│   │   │   ├── schemeMatcher.js
│   │   │   ├── pdfGenerator.js
│   │   │   └── emailService.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   └── rateLimiter.js
│   │   ├── utils/
│   │   │   ├── prismaClient.js
│   │   │   └── responseFormatter.js
│   │   ├── jobs/
│   │   │   └── dailyAlertJob.js
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── screenshots/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API_SPEC.md
│   ├── SCORE_ENGINE.md
│   ├── UI_UX.md
│   └── er-diagram.png
├── .gitignore
├── README.md
├── PRD.md
├── AGENTS.md
├── PROJECT_CONTEXT.md
├── CONTRIBUTING.md
├── CODING_STANDARDS.md
└── DEVELOPMENT_PLAN.md
```

---

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 16
- pgAdmin 4
- Git

---

## Installation

```bash
git clone https://github.com/your-team/verifychain.git
cd verifychain

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

## Environment Setup

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
```

---

## Database Setup

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Verify in pgAdmin: all 8 tables created, seed data present.

---

## Running the Application

```bash
# Terminal 1 — Backend
cd server && npm run dev
# Server: http://localhost:5000
# Health: GET http://localhost:5000/api/health

# Terminal 2 — Frontend
cd client && npm run dev
# Client: http://localhost:3000
```

---

## Available Scripts

### Server

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon src/app.js` | Development with auto-restart |
| `npm start` | `node src/app.js` | Production start |
| `npm test` | `vitest` | Unit tests |
| `npm run db:migrate` | `prisma migrate dev` | Apply migration |
| `npm run db:seed` | `prisma db seed` | Seed data |
| `npm run db:studio` | `prisma studio` | Visual DB browser |
| `npm run db:reset` | `prisma migrate reset` | Reset + reseed |

### Client

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Dev server |
| `npm run build` | `vite build` | Production build |
| `npm test` | `vitest` | Tests |

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@verifychain.dev | Admin@123 |
| MSME Owner | demo@verifychain.dev | Demo@123 |
| Buyer | buyer@verifychain.dev | Buyer@123 |

## Demo GSTINs

| GSTIN | Type | Expected Score |
|---|---|---|
| 27AABCU9603R1ZX | Manufacturing | 82 — HIGH |
| 29AADCB2230M1ZP | Services | 54 — MEDIUM |
| 33AAHCS1429R1ZM | Trading | 28 — LOW |

---

## Future Scope

- Live GSTN API integration (when sandbox access granted)
- MCA21 director data pull
- EPFO/ESIC API connectors
- Mobile app (React Native)
- Blockchain-anchored compliance certificate hashing
- Export readiness assessment (DGFT, APEDA, BIS)
- TReDS / GeM auto-qualification check

---

## Contributors

| Name | Role |
|---|---|
| [Team Member 1] | Frontend Development |
| [Team Member 2] | Backend + Score Engine |
| [Team Member 3] | Database + Seed Data |
| [Team Member 4] | Integration + Testing |
| [Team Member 5] | Admin Panel + Presentation |

---

## License

Academic use only — MCA Minor Project 2026.

---

## Acknowledgements

- LocalCircles MSME Day 2026 survey data
- NITI Aayog MSME reports
- IndiaAI Mission publications
- Open Government Data Platform (data.gov.in)
- All open-source libraries used in this project


Collaborators/Contributors :
1. <a href="https://github.com/krishanu717" target="_blank">krishanu717</a>
<br>
2. <a href="https://github.com/hiitecch" target="_blank">hiitecch</a>
<br>
3. <a href="https://github.com/ammiyo" target="_blank">ammiyo</a>

# DATABASE.md — VerifyChain Database Design

---

## 1. Overview

VerifyChain uses PostgreSQL 16 accessed exclusively through Prisma ORM. The schema has 8 tables covering users, MSME profiles, compliance tracking, documents, alerts, government schemes, and buyer analytics.

All schema changes go through `npx prisma migrate dev`. Never modify the database outside of migrations.

---

## 2. Complete Prisma Schema

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ──────────────────────────────────────────────────────

enum UserRole {
  MSME_OWNER
  BUYER
  ADMIN
}

enum BusinessType {
  MANUFACTURING
  SERVICES
  TRADING
  FOOD_PROCESSING
  CONSTRUCTION
  OTHER
}

enum ComplianceStatus {
  COMPLIANT
  DUE
  OVERDUE
  EXEMPT
  UNKNOWN
}

enum AlertStatus {
  PENDING
  SENT
  FAILED
}

enum AlertThreshold {
  DAYS_30
  DAYS_15
  DAYS_7
}

enum DocumentType {
  GST_CERTIFICATE
  EPFO_CERTIFICATE
  ESIC_CERTIFICATE
  MCA_CERTIFICATE
  UDYAM_CERTIFICATE
  FSSAI_LICENSE
  FACTORY_LICENSE
  OTHER
}

enum AuthorityType {
  GST
  EPFO
  ESIC
  MCA
  UDYAM
  FSSAI
}

// ─── USERS ──────────────────────────────────────────────────────

model User {
  id            Int          @id @default(autoincrement())
  email         String       @unique
  password_hash String
  name          String
  phone         String?
  role          UserRole     @default(MSME_OWNER)
  is_active     Boolean      @default(true)
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt

  msme_profile  MsmeProfile?

  @@map("users")
}

// ─── MSME PROFILES ──────────────────────────────────────────────

model MsmeProfile {
  id                  Int          @id @default(autoincrement())
  user_id             Int          @unique
  business_name       String
  gstin               String       @unique
  udyam_number        String       @unique
  business_type       BusinessType
  sector              String
  state               String
  district            String
  employee_count      Int          @default(0)
  annual_turnover_lakh Float?
  is_food_business    Boolean      @default(false)
  is_profile_complete Boolean      @default(false)
  last_compliance_sync DateTime?
  created_at          DateTime     @default(now())
  updated_at          DateTime     @updatedAt

  user              User                @relation(fields: [user_id], references: [id])
  compliance_records ComplianceRecord[]
  documents         Document[]
  alerts            Alert[]
  scheme_matches    SchemeMatch[]
  buyer_view_logs   BuyerViewLog[]

  @@index([gstin])
  @@index([udyam_number])
  @@map("msme_profiles")
}

// ─── COMPLIANCE RECORDS ─────────────────────────────────────────

model ComplianceRecord {
  id              Int              @id @default(autoincrement())
  msme_id         Int
  authority       AuthorityType
  status          ComplianceStatus @default(UNKNOWN)
  expiry_date     DateTime?
  last_checked    DateTime         @default(now())
  notes           String?
  raw_data        Json?
  created_at      DateTime         @default(now())
  updated_at      DateTime         @updatedAt

  msme_profile  MsmeProfile @relation(fields: [msme_id], references: [id])
  alerts        Alert[]

  @@unique([msme_id, authority])
  @@index([msme_id])
  @@index([expiry_date])
  @@map("compliance_records")
}

// ─── DOCUMENTS ──────────────────────────────────────────────────

model Document {
  id             Int          @id @default(autoincrement())
  msme_id        Int
  document_type  DocumentType
  authority      AuthorityType
  file_name      String
  file_path      String
  file_size_kb   Int
  validity_date  DateTime?
  uploaded_at    DateTime     @default(now())
  notes          String?

  msme_profile MsmeProfile @relation(fields: [msme_id], references: [id])

  @@index([msme_id])
  @@index([authority])
  @@map("documents")
}

// ─── ALERTS ─────────────────────────────────────────────────────

model Alert {
  id                  Int            @id @default(autoincrement())
  msme_id             Int
  compliance_record_id Int
  threshold           AlertThreshold
  status              AlertStatus    @default(PENDING)
  scheduled_for       DateTime
  sent_at             DateTime?
  failure_reason      String?
  created_at          DateTime       @default(now())

  msme_profile       MsmeProfile      @relation(fields: [msme_id], references: [id])
  compliance_record  ComplianceRecord @relation(fields: [compliance_record_id], references: [id])

  @@unique([msme_id, compliance_record_id, threshold])
  @@index([msme_id])
  @@index([status])
  @@index([scheduled_for])
  @@map("alerts")
}

// ─── GOVERNMENT SCHEMES ─────────────────────────────────────────

model GovernmentScheme {
  id                   Int     @id @default(autoincrement())
  scheme_name          String
  ministry             String
  description          String
  eligibility_criteria Json
  benefit_type         String
  max_benefit_lakh     Float?
  application_url      String
  is_active            Boolean @default(true)
  created_at           DateTime @default(now())

  scheme_matches SchemeMatch[]

  @@index([ministry])
  @@map("government_schemes")
}

// ─── SCHEME MATCHES ─────────────────────────────────────────────

model SchemeMatch {
  id          Int      @id @default(autoincrement())
  msme_id     Int
  scheme_id   Int
  match_score Int
  match_reasons Json
  matched_at  DateTime @default(now())

  msme_profile      MsmeProfile      @relation(fields: [msme_id], references: [id])
  government_scheme GovernmentScheme @relation(fields: [scheme_id], references: [id])

  @@unique([msme_id, scheme_id])
  @@index([msme_id])
  @@index([match_score])
  @@map("scheme_matches")
}

// ─── BUYER VIEW LOGS ────────────────────────────────────────────

model BuyerViewLog {
  id           Int      @id @default(autoincrement())
  msme_id      Int
  viewed_at    DateTime @default(now())
  viewer_ip    String?
  user_agent   String?

  msme_profile MsmeProfile @relation(fields: [msme_id], references: [id])

  @@index([msme_id])
  @@index([viewed_at])
  @@map("buyer_view_logs")
}
```

---

## 3. ER Diagram (Text)

```
┌──────────────────┐         ┌──────────────────────────────────┐
│     users        │ 1:1     │        msme_profiles             │
│ ──────────────── │────────▶│ ──────────────────────────────── │
│ id (PK)          │         │ id (PK)                          │
│ email (UNIQUE)   │         │ user_id (FK → users, UNIQUE)     │
│ password_hash    │         │ business_name                    │
│ name             │         │ gstin (UNIQUE)                   │
│ role             │         │ udyam_number (UNIQUE)            │
│ is_active        │         │ business_type                    │
│ created_at       │         │ sector, state, district          │
│ updated_at       │         │ employee_count                   │
└──────────────────┘         │ is_food_business                 │
                             │ is_profile_complete              │
                             │ last_compliance_sync             │
                             └──────────────┬───────────────────┘
                                            │ 1:N
              ┌─────────────────────────────┼──────────────────────────────┐
              │                             │                              │
              ▼                             ▼                              ▼
┌─────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────┐
│  compliance_records     │  │       documents           │  │       alerts           │
│ ─────────────────────── │  │ ──────────────────────── │  │ ────────────────────── │
│ id (PK)                 │  │ id (PK)                  │  │ id (PK)                │
│ msme_id (FK)            │  │ msme_id (FK)             │  │ msme_id (FK)           │
│ authority (ENUM)        │  │ document_type (ENUM)     │  │ compliance_record_id   │
│ status (ENUM)           │  │ authority (ENUM)         │  │   (FK)                 │
│ expiry_date             │  │ file_name                │  │ threshold (ENUM)       │
│ last_checked            │  │ file_path                │  │ status (ENUM)          │
│ raw_data (JSON)         │  │ file_size_kb             │  │ scheduled_for          │
│ @@unique[msme_id,       │  │ validity_date            │  │ sent_at                │
│   authority]            │  │ uploaded_at              │  │ @@unique[msme_id,      │
└─────────────────────────┘  └──────────────────────────┘  │  record_id, threshold] │
              │                                             └────────────────────────┘
              │ 1:N (alerts reference compliance_records)
              └────────────────────────────────────────────▶ (see alerts above)

┌──────────────────────────────┐   ┌─────────────────────────┐
│     government_schemes       │   │     buyer_view_logs      │
│ ──────────────────────────── │   │ ─────────────────────── │
│ id (PK)                      │   │ id (PK)                 │
│ scheme_name                  │   │ msme_id (FK)            │
│ ministry                     │   │ viewed_at               │
│ description                  │   │ viewer_ip               │
│ eligibility_criteria (JSON)  │   │ user_agent              │
│ benefit_type                 │   └─────────────────────────┘
│ application_url              │
│ is_active                    │
└──────────────┬───────────────┘
               │ 1:N
               ▼
┌──────────────────────────────┐
│       scheme_matches         │
│ ──────────────────────────── │
│ id (PK)                      │
│ msme_id (FK → msme_profiles) │
│ scheme_id (FK → gov_schemes) │
│ match_score                  │
│ match_reasons (JSON)         │
│ @@unique[msme_id, scheme_id] │
└──────────────────────────────┘
```

---

## 4. Table Descriptions

### users

Stores all platform users. Role determines access: `MSME_OWNER` for business owners, `BUYER` for procurement users (read Supplier Card only — currently no account needed), `ADMIN` for platform operators.

**Never expose:** `password_hash` — always use Prisma `select` to exclude it.

---

### msme_profiles

One-to-one with `users`. Contains business identity and profile attributes used for scheme matching and compliance scoring context. `is_food_business` controls whether FSSAI compliance is EXEMPT or tracked.

**Key fields:**
- `gstin`: 15-character GSTIN — unique identifier for compliance lookups
- `udyam_number`: UDYAM-XX-00-0000000 format
- `is_profile_complete`: set to `true` when all required profile fields are filled; triggers scheme matching
- `last_compliance_sync`: tracks last time complianceFetcher ran for this MSME

---

### compliance_records

One row per authority per MSME. Unique constraint on `[msme_id, authority]` prevents duplicates. `upsert` is used in `complianceFetcher.js` for this reason.

**Statuses:**
- `COMPLIANT` — all filings current, license valid
- `DUE` — filing or renewal due within 30 days
- `OVERDUE` — past due date
- `EXEMPT` — not applicable to this business type (FSSAI for non-food)
- `UNKNOWN` — data not yet fetched or unavailable

**`raw_data`** (JSON): stores the full simulated API response for reference and future real-API swap.

---

### documents

Stores uploaded compliance certificates. `file_path` is the relative path within `server/uploads/`. Actual file is on disk. If file is deleted from disk without deleting the DB record, the download endpoint returns 404 gracefully.

---

### alerts

Tracks which compliance expiry alerts have been sent. The unique constraint on `[msme_id, compliance_record_id, threshold]` prevents duplicate alerts being sent for the same expiry at the same threshold.

**`threshold`** values: `DAYS_30`, `DAYS_15`, `DAYS_7` — three separate alerts per expiring item.

---

### government_schemes

Seeded with 200+ central and state government schemes. `eligibility_criteria` is a JSON object the scheme matcher reads.

**Eligibility criteria JSON shape:**
```json
{
  "business_types": ["MANUFACTURING", "FOOD_PROCESSING"],
  "min_employees": 0,
  "max_employees": 50,
  "states": ["ALL"],
  "sectors": ["ALL"],
  "max_turnover_lakh": 500,
  "requires_udyam": true
}
```

---

### scheme_matches

Junction table between `msme_profiles` and `government_schemes`. `match_score` (0–100) and `match_reasons` (JSON array of strings) computed by `schemeMatcher.js`. Only matches with `match_score >= 50` are shown to users.

---

### buyer_view_logs

Created on every `GET /api/buyer/card/:msmeId` request. `viewer_ip` and `user_agent` stored for analytics. No PII required — IP is optional and not shown to the MSME owner, only aggregate count.

---

## 5. Key Indexes

| Index | Table | Column(s) | Reason |
|---|---|---|---|
| Unique | `users` | `email` | Login lookup |
| Unique | `msme_profiles` | `user_id` | 1:1 relationship enforcement |
| Unique | `msme_profiles` | `gstin` | Business identity lookup |
| Unique | `msme_profiles` | `udyam_number` | Business identity lookup |
| Unique | `compliance_records` | `[msme_id, authority]` | One record per authority per MSME |
| Unique | `alerts` | `[msme_id, compliance_record_id, threshold]` | No duplicate alerts |
| Unique | `scheme_matches` | `[msme_id, scheme_id]` | No duplicate matches |
| Index | `compliance_records` | `expiry_date` | Alert engine daily scan |
| Index | `alerts` | `status`, `scheduled_for` | Alert job filtering |
| Index | `buyer_view_logs` | `msme_id`, `viewed_at` | Analytics queries |

---

## 6. Migration Strategy

```bash
# Create migration
npx prisma migrate dev --name <descriptive-name>

# Examples of good migration names:
# init
# add_buyer_view_logs
# add_index_compliance_expiry
# add_is_food_business_to_profile

# Apply pending (for team members syncing)
npx prisma migrate dev

# Reset and reseed (destroys all data — dev only)
npx prisma migrate reset
```

**Rules:**
- One migration per logical schema change
- Never edit a migration file after it is committed
- Migration files committed to git

---

## 7. Seed Strategy

```bash
npx prisma db seed
# or triggered automatically by: npx prisma migrate reset
```

**Seed creates:**

| Entity | Count | Notes |
|---|---|---|
| Admin users | 1 | `admin@verifychain.dev` / `Admin@123` |
| MSME owner users | 3 | Different sectors and states |
| MSME profiles | 3 | One HIGH, one MEDIUM, one LOW score expected |
| Compliance records | 18 | 6 per MSME profile, various statuses |
| Documents | 6 | 2 per MSME |
| Government schemes | 30 | Representative sample of 10 categories |
| Scheme matches | 10+ | Pre-computed for demo MSMEs |
| Alerts | 5 | Mix of SENT and PENDING |

**Seed uses `upsert` everywhere** — safe to run multiple times.

---

## 8. Compliance Record Lifecycle

```
1. MSME registers → complianceFetcher.js called automatically
2. One ComplianceRecord created per authority (6 total) using upsert
3. Status populated from mock/simulated data
4. expiry_date set based on simulated data
5. Daily alert job scans: WHERE expiry_date <= NOW() + 30 days
6. For each expiring record: create Alert if not already created for that threshold
7. Send email → update alert.status = SENT
8. MSME sees alert on Alerts page
9. On manual refresh: complianceFetcher runs again, updates records
```

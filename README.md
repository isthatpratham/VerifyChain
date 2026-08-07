# VerifyChain — Micro-MSME Compliance Intelligence & Supplier Verification Platform

VerifyChain is a compliance intelligence platform for Indian Micro-MSMEs that aggregates compliance status, calculates a Compliance Health Score, generates public shareable Supplier Cards with QR verification, alerts MSMEs before compliance expirations, and matches MSME profiles to eligible government schemes.

## Technology Stack:

- **Frontend:** React 18, Vite, Tailwind CSS, React Router 6, Axios
- **Backend:** Node.js, Express.js, Helmet, CORS, Morgan
- **Database / ORM:** PostgreSQL 16, Prisma 5 ORM
- **Auth & Security:** JWT (jsonwebtoken), bcryptjs, express-validator, express-rate-limit
- **Scheduling & Email:** node-cron, Nodemailer (Gmail SMTP)
- **Utilities & PDF:** pdfkit, qrcode.react, Chart.js

---

## Installation

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL 16 installed and running locally
- npm (v9+ recommended)

---

## Environment Setup

### 1. Client Environment

Copy `.env.example` in `client/` to `.env`:

```bash
cd client
cp .env.example .env
```

Environment variables:
- `VITE_API_BASE_URL`: Base URL for the Express API (default: `http://localhost:5000/api`)

### 2. Server Environment

Copy `.env.example` in `server/` to `.env`:

```bash
cd server
cp .env.example .env
```

Environment variables:
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://postgres:password@localhost:5432/verifychain`)
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: `5000`)
- `CLIENT_URL`: Client origin for CORS (default: `http://localhost:3000`)
- `EMAIL_*`: SMTP configuration for email alerts
- `UPLOAD_DIR`: Local storage directory for documents (default: `uploads`)

---

## Running the Applications

### Frontend (Client)

```bash
cd client
npm install
npm run dev
```

The frontend will run at `http://localhost:3000`.

To build and lint:
```bash
npm run build
npm run lint
```

### Backend (Server)

```bash
cd server
npm install
npm run dev
```

The server will run at `http://localhost:5000`.

Exposed Bootstrap Endpoint:
- `GET /api/health`: Returns API health status `{ "success": true, "message": "VerifyChain API is running" }`

To lint:
```bash
npm run lint
```

---

## Running Prisma

To set up Prisma ORM:

```bash
cd server
npx prisma generate
```

To run database migrations (when models are defined in Phase 1):
```bash
npx prisma migrate dev
```

---

## Development Workflow

1. All code strictly follows JavaScript (ES6+), with **no TypeScript**.
2. Frontend code is in `client/src` (React, Vite, Tailwind CSS).
3. Backend code is in `server/src` (Express, Prisma).
4. All extended project documentation is located in the `/docs` directory.

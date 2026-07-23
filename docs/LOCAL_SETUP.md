# VerifyChain — Local Setup Guide

This guide is for developers who have cloned the VerifyChain repository and wish to set up and run the project locally.

---

## 1. Prerequisites

Ensure the following tools are installed on your machine before getting started:

| Tool | Recommended Version | Download / Notes |
|---|---|---|
| **Node.js** | v18.x or v20.x (LTS) | [nodejs.org](https://nodejs.org) |
| **npm** | v9.x or v10.x | Comes bundled with Node.js |
| **PostgreSQL** | v16.x | [postgresql.org](https://www.postgresql.org/download/) · Managed locally via pgAdmin 4 or CLI |
| **Git** | v2.x | [git-scm.com](https://git-scm.com) |

---

## 2. Clone Repository

Clone the project repository to your local directory using Git:

```bash
git clone https://github.com/isthatpratham/VerifyChain.git
cd VerifyChain
```

---

## 3. Install Dependencies

VerifyChain is structured as a client/server workspace. Install dependencies separately for both the `client` and `server` folders:

### Install Frontend (Client) Dependencies

```bash
cd client
npm install
cd ..
```

### Install Backend (Server) Dependencies

```bash
cd server
npm install
cd ..
```

---

## 4. Environment Variables

Create environment configuration files from the provided `.env.example` templates for both the `server` and `client`.

### Server Environment (`server/.env`)

Copy `server/.env.example` to `server/.env`:

```bash
cd server
cp .env.example .env
```

Key environment variables in `server/.env`:

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/verifychain` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | Min 32-char string |
| `JWT_EXPIRY` | Duration for token validity | `7d` |
| `PORT` | Server HTTP port | `5000` |
| `CLIENT_URL` | Client origin URL for CORS policy | `http://localhost:3000` |
| `NODE_ENV` | Application environment state | `development` |
| `EMAIL_HOST` | SMTP server hostname (Gmail SMTP) | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_SECURE` | TLS/SSL flag | `false` |
| `EMAIL_USER` | Email sender address | `yourteam@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (16 chars) | `your-gmail-app-password` |
| `EMAIL_FROM` | Sender display string | `VerifyChain Alerts <yourteam@gmail.com>` |
| `MAX_FILE_SIZE_BYTES` | Max upload size limit (5MB) | `5242880` |
| `UPLOAD_DIR` | Local disk upload folder path | `uploads` |

> [!CAUTION]
> Never commit actual `.env` files or real credentials to git.

### Client Environment (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```bash
cd client
cp .env.example .env
```

Key environment variables in `client/.env`:

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base API URL for backend requests | `http://localhost:5000/api` |

---

## 5. Database Setup

Ensure PostgreSQL 16 is running locally and that the database user credentials in `server/.env` are valid.

### Step 1: Create PostgreSQL Database

You can create the database via `psql` command line or pgAdmin 4:

```sql
CREATE DATABASE verifychain;
```

### Step 2: Generate Prisma Client & Run Migrations

From the `server` directory, run Prisma migration to generate tables and Prisma Client:

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### Step 3: Seed Initial Data

Populate the database with initial development baselines (Admin account, sample MSME profiles, compliance records, and schemes):

```bash
npx prisma db seed
```

---

## 6. Running the Backend

From the `server` directory, start the development server with Nodemon:

```bash
cd server
npm run dev
```

- **Expected URL:** `http://localhost:5000`
- **Expected Console Output:** `VerifyChain API running on port 5000`
- **Health Check Endpoint:** Test by navigating to `http://localhost:5000/api/health` in your browser. Expected response:

```json
{
  "success": true,
  "message": "VerifyChain API is running"
}
```

---

## 7. Running the Frontend

In a separate terminal window, start the React + Vite development server from the `client` directory:

```bash
cd client
npm run dev
```

- **Expected URL:** `http://localhost:3000`
- **Expected Console Output:** Vite dev server ready message pointing to local port `3000`.

---

## 8. Local Testing Checklist

Use this checklist to verify your local setup:

- [ ] PostgreSQL 16 is running and `verifychain` database is created.
- [ ] Backend starts without errors (`npm run dev` in `server`).
- [ ] Frontend starts without errors (`npm run dev` in `client`).
- [ ] `GET http://localhost:5000/api/health` returns status HTTP 200.
- [ ] Registration works (`POST /api/auth/register` or via UI at `/register`).
- [ ] Login works (`POST /api/auth/login` or via UI at `/login`).
- [ ] Protected route `/dashboard` is accessible after logging in.
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`.
- [ ] Logout flow clears session and updates navigation bar.
- [ ] Browser refresh preserves session state without asking for re-login.

---

## 9. Useful Commands

### Client Commands (`/client`)

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server on port 3000 |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run lint` | Runs ESLint analysis across `src/` |
| `npm run format` | Formats code files using Prettier |

### Server Commands (`/server`)

| Command | Action |
|---|---|
| `npm run dev` | Starts Express server with Nodemon hot-reloading on port 5000 |
| `npm run lint` | Runs ESLint check across backend JavaScript files |
| `npx prisma generate` | Generates Prisma Client SDK from `schema.prisma` |
| `npx prisma migrate dev` | Applies pending schema migrations to local database |
| `npx prisma validate` | Validates syntax of `schema.prisma` |
| `npx prisma db seed` | Executes database seed script (`prisma/seed.js`) |
| `npx prisma studio` | Launches interactive web UI to view and edit local database data |

---

## 10. Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| **Port 5000 / 3000 already in use** | Another process is occupying the required port. | Kill process running on the port or update `PORT` in `server/.env` or `vite.config.js`. |
| **`DATABASE_URL` Connection Refused** | PostgreSQL service isn't running or credentials in `.env` are invalid. | Ensure PostgreSQL 16 service is running. Check username, password, host, and port in `DATABASE_URL`. |
| **Prisma Schema Error on Migrate** | Missing PostgreSQL database or model conflicts. | Ensure the database exists in PostgreSQL. Run `npx prisma validate` to locate syntax issues. |
| **`VITE_API_BASE_URL` Network Error** | Express backend server is not running on port 5000. | Start server via `npm run dev` in `server/` before testing frontend requests. |
| **Node Version Mismatch** | Older Node.js version installed. | Upgrade Node.js to v18.x or v20.x LTS. |

---

## 11. Project Structure

Below is an overview of the root directory structure:

```
VerifyChain/
├── client/          # Frontend application (React 18, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/   # Reusable UI & layout components
│   │   ├── context/      # AuthContext & state providers
│   │   ├── hooks/        # Custom React hooks (useAuth, useRequireAuth)
│   │   ├── pages/        # Route page components
│   │   ├── routes/       # Protected and public route guards
│   │   ├── services/     # Axios HTTP client & API integration functions
│   │   └── utils/        # Pure helper and formatting functions
├── server/          # Backend REST API (Node.js, Express.js, Prisma ORM)
│   ├── prisma/      # Database schema, migrations, and seed script
│   ├── uploads/     # Local disk storage for compliance documents
│   └── src/
│       ├── controllers/ # Thin request & response handlers
│       ├── middleware/  # Auth, rate-limiting, and validation middleware
│       ├── repositories/# Modular database access abstraction layer
│       ├── routes/      # Express API route endpoints
│       ├── services/    # Business logic & domain services
│       └── utils/       # Prisma client singleton & error helpers
└── docs/            # Comprehensive project architecture & specs documentation
```

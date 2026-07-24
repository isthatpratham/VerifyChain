# Enterprise Production Deployment Guide

## Overview

This document provides the complete deployment, configuration, operations, and incident response guide for the VerifyChain Enterprise Platform.

---

## 1. System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Node.js | 18.x LTS | 22.x LTS |
| PostgreSQL | 14 | 16+ |
| Memory | 512 MB | 2 GB |
| CPU | 1 vCPU | 2+ vCPU |
| Disk | 5 GB | 20 GB |

---

## 2. Environment Configuration

All configuration is managed via environment variables. A reference `.env.example` is provided in `docs/.env.example`.

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/verifychain` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `<random 64-char hex>` |
| `PORT` | HTTP port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `CLIENT_URL` | Frontend origin for CORS | `https://app.verifychain.org` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://app.verifychain.org,https://admin.verifychain.org` |

### Optional Variables

| Variable | Description | Default |
|---|---|---|
| `INTEGRATION_SECRET_KEY` | AES-256-GCM encryption key for connector secrets | Auto-generated |
| `WEBHOOK_MAX_RETRIES` | Maximum webhook delivery retry attempts | `5` |
| `LOG_LEVEL` | Structured log level | `info` |

---

## 3. Database Setup & Migration

```bash
# Install dependencies
cd server && npm install

# Push schema to database (development)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Production: Use migration-based deployment
npx prisma migrate deploy
```

### Backup Strategy

- **Automated Daily Backups**: Configure `pg_dump` cron job.
- **Point-in-Time Recovery**: Enable WAL archiving on PostgreSQL.
- **Pre-Migration Backup**: Always take a snapshot before running `prisma migrate deploy`.

### Rollback Plan

1. Restore from the latest database snapshot.
2. Deploy the previous application version.
3. Run `npx prisma migrate resolve --rolled-back <migration_name>` if a migration fails.

---

## 4. Build & Deploy

### Production Build

```bash
# Server
cd server && npm install --production

# Client
cd client && npm install && npm run build
```

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ ./
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/app.js"]
```

### Process Management (PM2)

```bash
pm2 start src/app.js --name verifychain-api -i max
pm2 save
pm2 startup
```

---

## 5. Health Probes

| Endpoint | Purpose | Expected Response |
|---|---|---|
| `GET /health/liveness` | Process alive | `200 { status: "UP" }` |
| `GET /health/readiness` | Database connected | `200 { checks: { database: "HEALTHY" } }` |
| `GET /health/metrics` | Operational metrics | `200 { memory, cache, uptime }` |
| `GET /api/health` | Legacy health check | `200 { success: true }` |

### Kubernetes Configuration

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /health/readiness
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## 6. Security Checklist

- [x] **Helmet** HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- [x] **CORS** strict origin whitelist
- [x] **JWT** authentication with bcrypt password hashing
- [x] **API Key** authentication with SHA-256 hashed storage
- [x] **Scope-based authorization** on all protected endpoints
- [x] **HMAC-SHA256** webhook signature verification
- [x] **AES-256-GCM** encryption for connector secrets at rest
- [x] **Rate limiting** on API v1 endpoints
- [x] **Input validation** on all request bodies
- [x] **Request body size limit** (1 MB)
- [x] **X-Powered-By** header removed
- [x] **Graceful shutdown** on SIGTERM/SIGINT
- [x] **Unhandled rejection/exception** safety handlers

---

## 7. Monitoring & Alerting

### Recommended Stack

| Tool | Purpose |
|---|---|
| Prometheus | Metrics scraping (`/health/metrics`) |
| Grafana | Dashboard visualization |
| Sentry | Error tracking |
| PagerDuty | Incident alerting |

### Key Metrics to Monitor

- API request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database connection pool utilization
- Webhook delivery success rate
- Cache hit ratio
- Memory and CPU usage

---

## 8. Incident Response Runbook

### Scenario: Database Unreachable

1. Check `/health/readiness` — if `database: UNHEALTHY`, the database is down.
2. Verify PostgreSQL is running: `pg_isready -h <host> -p 5432`.
3. Check connection pool exhaustion in application logs.
4. Restart the application if connection pool is stale.

### Scenario: High API Latency

1. Check `/health/metrics` for memory pressure (high `heapUsedBytes`).
2. Review slow query logs in PostgreSQL.
3. Verify cache hit ratio — low ratio indicates missing cache entries.
4. Scale horizontally if CPU is saturated.

### Scenario: Webhook Delivery Failures

1. Check webhook delivery logs via `GET /api/v1/developer-platform/webhooks/:id/logs`.
2. Verify target URL is reachable from the application network.
3. Check circuit breaker status — if OPEN, the target has been consistently failing.
4. Replay failed deliveries via `POST /api/v1/developer-platform/webhooks/deliveries/:id/replay`.

---

## 9. Production Deployment Checklist

- [ ] Environment variables configured
- [ ] `DATABASE_URL` pointing to production database
- [ ] `JWT_SECRET` set to a unique, high-entropy value
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGINS` set to production frontend domains
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Health probes verified (`/health/liveness`, `/health/readiness`)
- [ ] Security headers verified (Helmet)
- [ ] Rate limiting configured
- [ ] Process manager configured (PM2 / K8s)
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured
- [ ] SSL/TLS termination configured (reverse proxy)
- [ ] Log aggregation configured

# CODING_STANDARDS.md — VerifyChain Code Style Guide

---

## 1. General JavaScript

- `const` by default. `let` only when reassignment is required. `var` never.
- `async/await` for all async operations. No `.then().catch()` chains.
- Every `async` function that can fail is wrapped in `try/catch`.
- No `console.log` in committed code. `console.error` for caught errors only.
- Named constants for all threshold values, score levels, cron schedules.

```javascript
// WRONG
if (score >= 75) { ... }

// CORRECT
const SCORE_LEVEL_HIGH = 75;
if (score >= SCORE_LEVEL_HIGH) { ... }
```

- CommonJS (`require/module.exports`) in `server/`. ES Modules (`import/export`) in `client/`.

---

## 2. Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| React page | PascalCase + `.jsx` | `ComplianceStatus.jsx` |
| React component | PascalCase + `.jsx` | `ScoreRing.jsx` |
| React hook | `use` + camelCase + `.js` | `useCompliance.js` |
| React context | PascalCase + `Context.jsx` | `AuthContext.jsx` |
| Express route | camelCase + `.routes.js` | `compliance.routes.js` |
| Express controller | camelCase + `.controller.js` | `compliance.controller.js` |
| Express service | camelCase + `.js` | `scoreEngine.js` |
| Express middleware | camelCase + `.middleware.js` | `auth.middleware.js` |
| Scheduled job | camelCase + `Job.js` | `dailyAlertJob.js` |
| Utility | camelCase + `.js` | `validateGSTIN.js` |

### Variables

| Type | Convention | Example |
|---|---|---|
| Variables | camelCase | `msmeId`, `complianceRecords` |
| Constants | SCREAMING_SNAKE_CASE | `SCORE_LEVEL_HIGH` |
| Booleans | prefix `is`, `has`, `can` | `isFoodBusiness`, `hasExpired` |
| React components | PascalCase | `<ScoreRing />` |
| Controller functions | `handle` + PascalCase | `handleGetDashboard` |
| Service functions | verb + Noun | `computeScore`, `fetchCompliance` |

---

## 3. React Standards

### Component Template

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScoreRing from '../components/ScoreRing';
import { getDashboard } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// 2. Component (default export for pages, named for components)
export default function Dashboard() {
  // 2a. Hooks
  const { user } = useAuth();

  // 2b. State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2c. Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboard();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2d. Event handlers (defined before return)
  const handleRefresh = async () => { ... };

  // 2e. Four-state render guard
  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorBanner message={error} />;
  if (!data)   return <EmptyState message="No data yet." />;

  // 2f. Success render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### Rules

- Props destructured in signature: `function ScoreRing({ score, level }) { ... }`
- `react-hot-toast` for transient success/error notifications
- Tailwind utility classes only — no custom CSS files
- `<Link>` for internal navigation, `useNavigate()` for programmatic
- QR code: `import QRCode from 'qrcode.react'`; generate client-side only

---

## 4. Express Standards

### Route File

```javascript
// compliance.routes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { handleGetDashboard, handleRefresh } = require('../controllers/compliance.controller');
const { refreshRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/dashboard', verifyToken, handleGetDashboard);

router.post(
  '/refresh',
  verifyToken,
  refreshRateLimiter,
  handleRefresh
);

module.exports = router;
```

### Controller Function

```javascript
const handleGetDashboard = async (req, res) => {
  try {
    const msmeId = req.user.msmeId;
    if (!msmeId) {
      return res.status(404).json({ error: 'MSME profile not found. Please complete your profile.' });
    }

    const scoreResult = await scoreEngine.computeScore(msmeId, prisma);
    const records = await prisma.complianceRecord.findMany({
      where: { msme_id: msmeId },
      orderBy: { authority: 'asc' },
    });

    return res.status(200).json({ ...scoreResult, authorities: records });
  } catch (error) {
    console.error('[handleGetDashboard]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

### app.js

```javascript
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const { startDailyAlertJob } = require('./jobs/dailyAlertJob');

const authRoutes       = require('./routes/auth.routes');
const msmeRoutes       = require('./routes/msme.routes');
const complianceRoutes = require('./routes/compliance.routes');
const documentsRoutes  = require('./routes/documents.routes');
const alertsRoutes     = require('./routes/alerts.routes');
const schemesRoutes    = require('./routes/schemes.routes');
const buyerRoutes      = require('./routes/buyer.routes');
const adminRoutes      = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/auth',       authRoutes);
app.use('/api/msme',       msmeRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/documents',  documentsRoutes);
app.use('/api/alerts',     alertsRoutes);
app.use('/api/schemes',    schemesRoutes);
app.use('/api/buyer',      buyerRoutes);
app.use('/api/admin',      adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

startDailyAlertJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VerifyChain API running on port ${PORT}`));
module.exports = app;
```

---

## 5. Prisma Standards

```javascript
// Shared client — import everywhere
const prisma = require('../utils/prismaClient');

// prismaClient.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;

// Never expose password_hash — always use select
const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, email: true, passwordHash: true, role: true },
});

// findMany always includes orderBy
const records = await prisma.complianceRecord.findMany({
  where: { msme_id: msmeId },
  orderBy: { authority: 'asc' },
});

// Upsert for compliance records (one per authority)
await prisma.complianceRecord.upsert({
  where: { msme_id_authority: { msme_id: msmeId, authority: 'GST' } },
  update: { status, expiry_date, last_checked: new Date(), raw_data },
  create: { msme_id: msmeId, authority: 'GST', status, expiry_date, raw_data },
});

// Upsert for scheme matches
await prisma.schemeMatch.upsert({
  where: { msme_id_scheme_id: { msme_id: msmeId, scheme_id: schemeId } },
  update: { match_score, match_reasons },
  create: { msme_id: msmeId, scheme_id: schemeId, match_score, match_reasons },
});

// Seed files use upsert — never create (must be idempotent)
```

---

## 6. Formatting

- 2 spaces for indentation everywhere. No tabs.
- Prettier config: `{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "es5", "printWidth": 100 }`
- Single quotes in JavaScript. Double quotes in JSX attributes.
- Files end with a single newline.
- No trailing whitespace.

---

## 7. Error Handling

### Backend Pattern

```javascript
// Controllers always:
// 1. Check validation
// 2. Verify auth scope
// 3. try/catch business logic
// 4. Meaningful status codes
// 5. Never expose stack traces

async function handleX(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  try {
    const result = await service.doThing();
    if (!result) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[handleX]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Frontend Pattern

```javascript
// In useEffect or handler
try {
  const data = await apiCall();
  setData(data);
  toast.success('Done!');
} catch (err) {
  setError(err.message || 'Something went wrong.');
  toast.error(err.message || 'Request failed');
} finally {
  setLoading(false);
}
```

---

## 8. Security Checklist (Before Every Commit)

- [ ] No `password_hash` in any API response
- [ ] JWT secret from `process.env.JWT_SECRET` — not hardcoded
- [ ] MSME queries scoped to `req.user.msmeId` — not user-supplied ID
- [ ] File uploads: MIME type + size validated before write
- [ ] `server/uploads/` in `.gitignore`
- [ ] `.env` in `.gitignore`
- [ ] No `console.log` in committed code
- [ ] `helmet()` and `cors()` active in `app.js`
- [ ] No paid API keys anywhere in codebase

---

## 9. File Length Guidelines

| Type | Recommended Max | Action |
|---|---|---|
| Controller | 150 lines | Split into multiple or extract to service |
| Service | 350 lines | Split into sub-services |
| React page | 200 lines | Extract into components |
| React component | 100 lines | Extract sub-components |
| Score engine | No limit | It is the most important file — clarity over brevity |

---

## 10. Import Order

### Server (CommonJS)
```javascript
// 1. Built-ins
const path = require('path');
const fs   = require('fs');

// 2. Third-party
const express = require('express');
const { body } = require('express-validator');

// 3. Internal
const prisma       = require('../utils/prismaClient');
const scoreEngine  = require('../services/scoreEngine');
```

### Client (ES Modules)
```jsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

// 3. Internal components
import ScoreRing from '../components/ScoreRing';
import ComplianceBadge from '../components/ComplianceBadge';

// 4. Hooks / services / utils
import { useAuth } from '../hooks/useAuth';
import { getDashboard } from '../services/api';
```

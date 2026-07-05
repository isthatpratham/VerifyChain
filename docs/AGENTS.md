# AGENTS.md — VerifyChain AI Agent Operating Manual

> Read this document completely before writing any code.
> Every rule here is non-negotiable unless overridden by a specific task prompt.
> When this document and a task prompt conflict, ask — never guess.

---

## Architecture Rules

**AR-01** Three-tier monolith: React (client) → Express (server) → PostgreSQL (Prisma). No microservices. No serverless.

**AR-02** All frontend API calls go through `client/src/services/api.js` exclusively. No `fetch()` or `axios()` calls inside components or pages.

**AR-03** All business logic lives in `server/src/services/`. Controllers are thin — they parse requests and return responses. They do not contain business logic.

**AR-04** The score engine lives exclusively in `server/src/services/scoreEngine.js`. No other file computes or modifies a compliance score.

**AR-05** Database access is exclusively through Prisma. No raw SQL except via `prisma.$queryRaw` when Prisma cannot express the query — and only when documented.

**AR-06** Auth state in the frontend lives exclusively in `client/src/context/AuthContext.jsx`. No other file manages auth state.

**AR-07** File uploads are stored in `server/uploads/`. File metadata is stored in the `documents` table. No other storage mechanism.

**AR-08** The Alert Engine lives in `server/src/services/alertEngine.js` and is scheduled in `server/src/jobs/dailyAlertJob.js`. Alert logic does not live in controllers.

**AR-09** The `complianceFetcher.js` service is the only code that creates or updates `compliance_records`. No controller directly writes compliance data.

**AR-10** The public Buyer Card endpoint `GET /api/buyer/card/:msmeId` requires no authentication. This is intentional and permanent.

---

## Coding Rules

**CR-01** JavaScript only. No TypeScript. No `.ts` or `.tsx` files anywhere.

**CR-02** `const` by default. `let` only when reassignment is required. `var` is forbidden.

**CR-03** `async/await` for all asynchronous code. No `.then().catch()` chains.

**CR-04** Every `async` function that can fail must be wrapped in `try/catch`.

**CR-05** No `console.log` in committed code. Use `console.error` for caught errors only.

**CR-06** Magic numbers are forbidden. Define named constants at the top of the file.

```javascript
// WRONG
if (score >= 75) { ... }

// CORRECT
const SCORE_LEVEL_HIGH = 75;
if (score >= SCORE_LEVEL_HIGH) { ... }
```

**CR-07** Functions do one thing. If a function name contains "and", it should be split.

**CR-08** CommonJS (`require` / `module.exports`) in the server. ES Modules (`import` / `export`) in the client.

**CR-09** No unused imports in committed code.

**CR-10** All user inputs are validated server-side with `express-validator` before any processing. Client-side validation is UX only.

---

## Folder Rules

**FR-01** Page components: `client/src/pages/`. One file per route. PascalCase.

**FR-02** Reusable UI: `client/src/components/`. PascalCase. Used on 2+ pages.

**FR-03** All API calls: `client/src/services/api.js`. One function per endpoint. This is the only file that imports axios.

**FR-04** Custom hooks: `client/src/hooks/`. Filename starts with `use`.

**FR-05** Pure client utilities: `client/src/utils/`. No side effects. No API calls.

**FR-06** Route definitions: `server/src/routes/`. One file per resource.

**FR-07** Controller functions: `server/src/controllers/`. One file per resource. Functions named `handle<Action>`.

**FR-08** Business logic: `server/src/services/`. May import Prisma. May not import controllers.

**FR-09** Middleware: `server/src/middleware/`. One function per file. Default export.

**FR-10** Scheduled jobs: `server/src/jobs/`. Imported and started in `app.js`.

**FR-11** Uploads: `server/uploads/`. Only the document vault writes here.

**FR-12** Do not create new top-level folders. Do not rename existing folders.

---

## Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| React page | PascalCase + `.jsx` | `ComplianceStatus.jsx` |
| React component | PascalCase + `.jsx` | `ScoreRing.jsx` |
| React hook | camelCase starting `use` + `.js` | `useCompliance.js` |
| React context | PascalCase + `Context.jsx` | `AuthContext.jsx` |
| Express route | camelCase + `.routes.js` | `compliance.routes.js` |
| Express controller | camelCase + `.controller.js` | `compliance.controller.js` |
| Express service | camelCase + `.js` | `scoreEngine.js` |
| Express middleware | camelCase + `.middleware.js` | `auth.middleware.js` |
| Scheduled job | camelCase + `Job.js` | `dailyAlertJob.js` |
| Utility | camelCase + `.js` | `validateGSTIN.js` |

### Variables and Functions

| Type | Convention | Example |
|---|---|---|
| Variables | camelCase | `complianceRecords`, `msmeId` |
| Constants | SCREAMING_SNAKE_CASE | `SCORE_LEVEL_HIGH` |
| Booleans | prefix `is`, `has`, `can` | `isCompliant`, `hasExpired` |
| React components | PascalCase | `<ScoreRing />` |
| Controller functions | `handle` + PascalCase | `handleGetDashboard` |
| Service functions | verb + Noun | `computeScore`, `fetchCompliance` |

### Database

| Type | Convention | Example |
|---|---|---|
| Table names (`@@map`) | snake_case | `compliance_records` |
| Column names (`@map`) | snake_case | `msme_id`, `expiry_date` |
| Prisma model names | PascalCase | `ComplianceRecord` |
| Enum names | PascalCase | `ComplianceStatus` |
| Enum values | SCREAMING_SNAKE_CASE | `COMPLIANT`, `OVERDUE` |

### API

| Type | Convention | Example |
|---|---|---|
| URL path | lowercase, kebab-case, plural | `/api/compliance-records` |
| JSON body keys | camelCase | `{ gstin, udyamNumber }` |
| JSON response keys | camelCase | `{ score, breakdownRules }` |
| Query params | camelCase | `?authorityType=GST` |

---

## Database Conventions

**DC-01** Every table has an auto-incrementing integer primary key named `id`.

**DC-02** Timestamp columns: `created_at` (default `NOW()`) and `updated_at` (`@updatedAt`).

**DC-03** Foreign keys follow the pattern `<related_model_singular>_id`. Exception: where semantic clarity demands a different name (e.g., `owner_id` for `user_id` of an MSME).

**DC-04** All columns with a fixed set of values use Prisma enums.

**DC-05** Indexes on every column used in WHERE clauses. Minimum required indexes defined in `docs/DATABASE.md`.

**DC-06** Seed file (`server/prisma/seed.js`) uses `upsert`, never `create`. Seeds are idempotent.

**DC-07** `password_hash` is excluded from every API response using Prisma `select`. This is mandatory with no exceptions.

---

## API Conventions

**AC-01** All endpoints prefixed with `/api`.

**AC-02** Resource paths are plural and lowercase: `/api/compliance-records`, `/api/documents`.

**AC-03** Every successful response is a JSON object. Never a bare array at the root.

```javascript
// WRONG
res.json([record1, record2]);

// CORRECT
res.json({ records: [record1, record2], total: 2 });
```

**AC-04** Error response shape: `{ error: "Human readable message" }`.

**AC-05** Validation error shape: `{ error: "Validation failed", details: [{ field, message }] }`.

**AC-06** HTTP status codes:
- 200: successful GET / PATCH
- 201: successful POST (resource created)
- 400: validation or client error
- 401: not authenticated
- 403: authenticated but wrong role
- 404: resource not found
- 429: rate limited
- 500: unexpected server error

**AC-07** Protected routes require `Authorization: Bearer <JWT>`.

**AC-08** MSME-scoped routes must verify `req.user.id === msmeProfile.userId` before returning data. Users never access another user's data.

---

## React Conventions

**RC-01** Every page is a default export. Every reusable component is a named export.

**RC-02** Props destructured in function signature.

**RC-03** Every page handles four states: loading, error, empty, success.

**RC-04** `useEffect` for side effects. `useState` for form state.

**RC-05** Tailwind utility classes only. No custom CSS files.

**RC-06** `<Link>` for internal navigation. `useNavigate()` for programmatic navigation.

**RC-07** `react-hot-toast` for transient notifications. Inline error text for form field errors.

**RC-08** Protected pages redirect to `/login` if user is not authenticated. Admin pages redirect to `/` if role is not ADMIN.

---

## Express Conventions

**EC-01** `app.js` registers: dotenv, global middleware (cors, helmet, express.json), all routers, 404 handler, cron jobs.

**EC-02** Validation rules are defined in the route file, not the controller.

**EC-03** Controller pattern:

```javascript
const handleX = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  try {
    const result = await service.doThing(req.body, req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[handleX]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

**EC-04** Prisma client is instantiated once in `server/src/utils/prismaClient.js` and imported wherever needed.

---

## Security Rules

**SR-01** Never expose `password_hash` in any API response.

**SR-02** JWT secret in `process.env.JWT_SECRET` only. Never hardcoded.

**SR-03** `helmet()` active on all routes in `app.js`.

**SR-04** CORS restricted to `process.env.CLIENT_URL`.

**SR-05** Rate limiting on compliance refresh and file upload endpoints.

**SR-06** File uploads: validate MIME type and size before writing to disk. Reject anything not PDF/PNG/JPG.

**SR-07** MSME data scoping: every query that returns MSME-specific data must filter by the authenticated user's `msme_profile.id`.

**SR-08** `.env` is in `.gitignore`. Never commit it.

**SR-09** No stack traces in API error responses.

---

## Git Commit Style

Conventional Commits format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `seed`

Examples:
```
feat(score-engine): add FSSAI_EXEMPT rule with weight 0
fix(auth): scope MSME queries to authenticated user id
seed(schemes): add 50 MSME manufacturing schemes
docs(api-spec): document GET /api/buyer/card/:msmeId
```

---

## Forbidden Practices

| Forbidden | Reason |
|---|---|
| TypeScript | Project constraint |
| Paid APIs | Budget constraint |
| `var` | Use `const` / `let` |
| Direct `fetch()` in React components | All calls through `api.js` |
| Raw SQL for standard queries | Use Prisma |
| Business logic in controllers | Belongs in services |
| Score computation outside `scoreEngine.js` | Core invariant |
| Writing to disk outside `server/uploads/` | Document vault only |
| Live government API calls | Use simulated data only |
| Calling Ollama for score computation | AI is for scheme explanation only |
| Exposing `password_hash` | Security violation |
| Storing JWT in cookies | `localStorage` for this MVP |
| Hardcoding `localhost:5000` in client code | Use env variable |

---

## Always-Do List

| Always | Reason |
|---|---|
| Validate inputs server-side | Client validation is UX only |
| Wrap async controllers in try/catch | Prevent unhandled rejections |
| Use `select` to exclude `password_hash` | Security |
| Scope MSME queries to authenticated user | Data isolation |
| Return breakdown array with every score | Transparency is core |
| Use `upsert` in seed files | Idempotent seeding |
| Update `docs/API_SPEC.md` when changing endpoints | Documentation consistency |
| Set `FSSAI` to EXEMPT for non-food sectors | Business rule |
| Check `validationResult(req).isEmpty()` first | Catch validation errors early |
| Log `buyer_view_logs` on every public card access | Analytics |

---

## Agent Workflow

When receiving a task:

1. **Read** `PROJECT_CONTEXT.md` → `AGENTS.md` → relevant spec document
2. **Identify the layer**: frontend only / backend only / both
3. **Implement in order**: schema change → service → controller → route → `api.js` update → page/component
4. **Check before committing:**
   - [ ] No TypeScript
   - [ ] No paid services
   - [ ] `password_hash` excluded from all responses
   - [ ] MSME queries scoped to authenticated user
   - [ ] Score computed only in `scoreEngine.js`
   - [ ] Loading/error/empty/success states in UI
   - [ ] `api.js` updated if new endpoints added
5. **Write a conventional commit**

---

## Definition of Done

A feature is done when:
- Backend route + controller + service implemented following patterns above
- All inputs validated with `express-validator`
- Frontend page handles all 4 states (loading, error, empty, success)
- Data scoping: user can only see their own MSME data
- Demo-testable with seeded data — no manual DB setup required
- No regressions in existing features
- Committed with proper commit message

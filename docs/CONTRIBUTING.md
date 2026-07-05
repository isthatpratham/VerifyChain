# CONTRIBUTING.md — VerifyChain Contribution Guide

---

## Repository Workflow

Single GitHub repository. One long-lived branch: `main`. All work happens on feature branches merged via Pull Requests.

---

## Local Setup

```bash
git clone https://github.com/your-team/verifychain.git
cd verifychain

# Server
cd server && npm install
cp .env.example .env  # Fill in your values

# Database
npx prisma migrate dev
npx prisma db seed

# Client
cd ../client && npm install

# Run
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

---

## Branch Naming

```
<type>/<short-description>
```

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Refactor without feature change |
| `seed` | Seed data or schema changes |
| `test` | Adding tests |
| `style` | Formatting only |

**Examples:**
```
feat/score-engine
feat/document-vault
fix/fssai-exempt-logic
seed/government-schemes-30
docs/api-spec-buyer-card
```

---

## Commit Format

Conventional Commits: `<type>(<scope>): <description>`

```
feat(score-engine): add ALL_SIX_COMPLIANT bonus rule
fix(compliance): set FSSAI to EXEMPT for non-food business
seed(schemes): add 30 MSME government schemes
docs(api-spec): document POST /api/compliance/refresh
refactor(alert-engine): extract email logic to emailService
```

**Rules:** Imperative mood. Lowercase. No period. Max 72 chars on subject line.

---

## Pull Request Template

```markdown
## What was built or fixed
[2–4 sentences]

## How to test locally
1. Step
2. Step

## API changes
- Added / Changed / Removed: [endpoint]

## Database changes
- Schema change: yes/no
- Run: npx prisma migrate dev
- Seed change: yes/no — run: npx prisma db seed

## Checklist
- [ ] Follows CODING_STANDARDS.md
- [ ] No password_hash in any response
- [ ] MSME data scoped to req.user.msmeId
- [ ] Loading/error/empty/success states in UI
- [ ] No console.log left in
- [ ] No TypeScript introduced
- [ ] No paid API used
- [ ] API_SPEC.md updated if endpoints changed
```

---

## Review Checklist

- [ ] Business logic in services, not controllers
- [ ] async functions wrapped in try/catch
- [ ] FSSAI auto-exempt logic respected
- [ ] Score computed only in scoreEngine.js
- [ ] File uploads in server/uploads/ only
- [ ] No hardcoded URLs or secrets

---

## Merge Policy

- Minimum 1 team member approves before merge
- `scoreEngine.js` changes require all available team members to review
- Use **Squash and Merge** to keep history clean
- Delete feature branch after merge

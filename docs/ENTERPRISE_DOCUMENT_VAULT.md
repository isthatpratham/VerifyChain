# Enterprise Document Vault, Version Control, Smart Organization, Collaboration & Records Governance Platform

## Architectural Overview

The **Enterprise Document Vault** (`documentVault`) bounded context serves as the central, permanent, immutable, organized, collaborative, and legally governed knowledge platform for VerifyChain.

```
Upload → AI Document Intelligence → Validation → Document Repository → Enterprise Document Vault
  ↓
Version Manager → Metadata Evolution → Comparison Engine → Version Timeline → Soft Rollback → Lineage Graph
  ↓
Organization Engine → Folders → Smart Collections → Tagging → Taxonomy → Search Engine → Discovery UI
  ↓
Permission Engine → Sharing Engine → Comment Service → Mention Service → Watcher Service → Review Request Service → Activity Feed
  ↓
Records Manager → Retention Engine → Policy Assignment → Legal Hold Service → Archive Service → Disposition Service → Governance Dashboard
```

---

## Phase 10.5 Records Management & Governance Modules

- **`RecordsManagementService`**: Master orchestration engine for document lifecycle state machine (`Draft`, `Active`, `Reviewed`, `Approved`, `Published`, `Archived`, `Retention Active`, `Retention Expired`, `Legal Hold`, `Pending Disposition`, `Disposed`, `Destroyed`) and compliance governance transitions.
- **`RetentionPolicyEngine`**: Statutory & compliance retention policies (GST 8Y, KYC Permanent, Financial 7Y, Legal 10Y, Supplier 5Y, System Logs 3Y) and custom policy definitions.
- **`PolicyAssignmentService`**: Automated rule-matching and manual override policy assignments with expiration date calculations.
- **`LegalHoldService`**: Statutory legal hold creation, case references, priority tagging, asset binding, release workflow, and strict deletion/disposition block enforcement (`canDeleteOrDispose`).
- **`ArchiveService`**: Enterprise soft archiving, archive restoration, storage tier tracking (`STANDARD`, `COLD_ARCHIVE`, `GLACIER`), and archive statistics.
- **`DispositionService`**: Governed disposition queue (`PENDING_REVIEW`, `APPROVED`, `REJECTED`, `EXECUTED`, `CANCELLED`), officer review approval, and secure logical destruction audit logging.
- **`GovernanceDashboardService`**: Governance metrics (total assets, active holds, active policies, archived count, pending dispositions, 30-day expirations, compliance health score) and compliance report generation.

---

## Database Schema Extensions (Prisma)

- **`VaultRetentionPolicy`**: Statutory & custom retention policies (`scope`, `retention_days`, `archive_action`, `disposition_action`).
- **`VaultPolicyAssignment`**: Asset-Policy junction table.
- **`VaultRetentionEvent`**: Audit log of retention lifecycle events.
- **`VaultLegalHold`**: Legal hold headers (`case_reference`, `reason`, `priority`, `status`).
- **`VaultHoldAsset`**: Legal Hold-Asset junction table.
- **`VaultArchiveRecord`**: Archival records & storage tiers.
- **`VaultDispositionRecord`**: Disposition review & execution tracking.
- **`VaultGovernanceReport`**: Generated compliance & governance reports.

---

## REST API Specification (`/api/v1/vault`)

| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/vault/assets/:id/lifecycle` | Transition document lifecycle state | `vault.update` |
| `GET` | `/api/v1/vault/policies` | List active retention policies | `vault.read` |
| `POST` | `/api/v1/vault/policies` | Create custom retention policy | `vault.update` |
| `POST` | `/api/v1/vault/assets/:id/policies` | Assign retention policy | `vault.update` |
| `GET` | `/api/v1/vault/legal-holds` | List statutory legal holds | `vault.read` |
| `POST` | `/api/v1/vault/legal-holds` | Create legal hold & bind assets | `vault.update` |
| `POST` | `/api/v1/vault/legal-holds/:id/release` | Release legal hold | `vault.archive` |
| `GET` | `/api/v1/vault/archives` | List archived assets | `vault.read` |
| `POST` | `/api/v1/vault/assets/:id/archive` | Move asset to vault archive | `vault.archive` |
| `POST` | `/api/v1/vault/assets/:id/restore` | Restore asset from archive | `vault.archive` |
| `GET` | `/api/v1/vault/dispositions` | List disposition review queue | `vault.read` |
| `POST` | `/api/v1/vault/assets/:id/disposition` | Queue asset for disposition | `vault.archive` |
| `POST` | `/api/v1/vault/dispositions/:id/review` | Approve or reject disposition | `vault.archive` |
| `POST` | `/api/v1/vault/dispositions/:id/execute` | Execute secure logical destruction | `vault.delete` |
| `GET` | `/api/v1/vault/governance/metrics` | Fetch governance dashboard metrics | `vault.read` |
| `POST` | `/api/v1/vault/governance/reports` | Generate compliance & governance report | `vault.read` |

---

## Verification & Testing

- **Phase 10.1 Test Suite**: `node tests/documentVault.test.js` (**PASS - 6/6 test stages**)
- **Phase 10.2 Test Suite**: `node tests/documentVersioning.test.js` (**PASS - 8/8 test stages**)
- **Phase 10.3 Test Suite**: `node tests/documentOrganizationSearch.test.js` (**PASS - 9/9 test stages**)
- **Phase 10.4 Test Suite**: `node tests/documentCollaboration.test.js` (**PASS - 7/7 test stages**)
- **Phase 10.5 Test Suite**: `node tests/documentRecords.test.js` (**PASS - 8/8 test stages**)
- **Authentication Audit**: `node tests/authAudit.test.js` (**PASS**)
- **Frontend Production Build**: `npm run build` in `client/` (**PASS - 4756 modules transformed, 0 errors**)

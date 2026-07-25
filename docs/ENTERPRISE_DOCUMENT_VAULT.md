# Phase 10.1 & 10.2: Enterprise Document Repository & Version Control Platform

## Architectural Overview

The **Enterprise Document Vault** (`documentVault`) bounded context serves as the central, permanent, and immutable repository for every document processed by VerifyChain.

```
Upload → AI Document Intelligence → Validation → Document Repository → Enterprise Document Vault
  ↓
Version Manager → Metadata Evolution → Comparison Engine → Version Timeline → Soft Rollback → Lineage Graph
```

---

## Phase 10.2 Version Control Modules

- **`VersionManager`**: Manages major (`v1.0` -> `v2.0`) and minor (`v1.0` -> `v1.1`) version increments, registers immutable version snapshots, and assigns version tags (`CURRENT`, `LATEST`, `DRAFT`, `PUBLISHED`, `ARCHIVED`, `VERIFIED`, `COMPLIANCE_APPROVED`).
- **`MetadataEvolutionEngine`**: Computes field-level deltas between version snapshots for title, description, category, compliance mapping, business mapping, tags, owner, AI summary, AI classification, validation status, risk indicators, and custom metadata.
- **`VersionComparisonEngine`**: Compares any two version snapshots side-by-side and produces human-readable diff summaries.
- **`VersionTimelineService`**: Builds unified chronological timelines of versions, status changes, actor activity, and audit logs.
- **`RollbackManager`**: Executes soft rollbacks to historical versions by creating a *new restored version snapshot* (never destroying or mutating existing history).
- **`DocumentLineageService`**: Tracks document ancestry graph: Original Document -> Parent Version -> Child Version -> Derived/AI-Generated Documents.

---

## PostgreSQL Database Models (Prisma)

- **`VaultAsset`**: Parent document model (`current_version`, `title`, `storage_identifier`, `category`, `status`, `checksum`).
- **`VaultDocumentVersion`**: Immutable version snapshot (`version_number`, `major_version`, `minor_version`, `version_tag`, `change_summary`, `metadata_snapshot`).
- **`VaultVersionChange`**: Field-level delta record per version (`field_name`, `previous_value`, `new_value`, `change_type`).
- **`VaultDocumentLineage`**: Parent-child document ancestry node (`parent_version_number`, `child_version_number`, `lineage_type`).
- **`VaultRollbackOperation`**: Audit record of soft rollback operations (`target_version_number`, `new_version_number`, `restored_by`, `reason`).

---

## REST API Specification (`/api/v1/vault`)

| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/vault/assets` | Upload / Ingest file asset into vault (creates `v1.0`) | `vault.upload` |
| `GET` | `/api/v1/vault/assets` | Search & filter repository assets | `vault.read` |
| `GET` | `/api/v1/vault/metrics` | Storage statistics & metrics | `vault.read` |
| `GET` | `/api/v1/vault/assets/:assetId` | Retrieve single asset details | `vault.read` |
| `GET` | `/api/v1/vault/assets/:assetId/versions` | List all immutable version snapshots | `vault.read` |
| `GET` | `/api/v1/vault/assets/:assetId/versions/:ver` | Retrieve specific version snapshot | `vault.read` |
| `GET` | `/api/v1/vault/assets/:assetId/timeline` | Unified chronological version timeline | `vault.read` |
| `GET` | `/api/v1/vault/assets/:assetId/lineage` | Document ancestry lineage graph | `vault.read` |
| `GET` | `/api/v1/vault/assets/:assetId/compare` | Side-by-side version comparison diff | `vault.read` |
| `POST` | `/api/v1/vault/assets/:assetId/versions` | Create manual version snapshot | `vault.update` |
| `POST` | `/api/v1/vault/assets/:assetId/rollback` | Execute soft rollback to target version | `vault.archive` |
| `GET` | `/api/v1/vault/assets/:assetId/download` | Secure binary stream download | `vault.read` |
| `PATCH` | `/api/v1/vault/assets/:assetId/status` | Update asset lifecycle status | `vault.update` |
| `PATCH` | `/api/v1/vault/assets/:assetId/metadata` | Update asset metadata | `vault.update` |
| `POST` | `/api/v1/vault/assets/:assetId/archive` | Archive asset | `vault.archive` |
| `POST` | `/api/v1/vault/assets/:assetId/restore` | Restore asset | `vault.restore` |
| `DELETE` | `/api/v1/vault/assets/:assetId` | Soft delete asset | `vault.delete` |

---

## Verification & Testing

- **Phase 10.1 Test Suite**: `node tests/documentVault.test.js` (**PASS - 6/6 test stages**)
- **Phase 10.2 Test Suite**: `node tests/documentVersioning.test.js` (**PASS - 8/8 test stages**)
- **Authentication Audit**: `node tests/authAudit.test.js` (**PASS**)
- **Frontend Production Build**: `npm run build` in `client/` (**PASS - 4756 modules transformed, 0 errors**)

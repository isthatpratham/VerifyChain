# Enterprise Identity & Access Management (IAM) Platform

## Architectural Overview

The **Enterprise IAM Platform** (`iam`) bounded context serves as the centralized, policy-driven authorization engine for VerifyChain.

```
Enterprise Administration Platform
  ↓
Identity Service
  ↓
Role Service & Permission Service
  ↓
Authorization Engine (can(user, permission, resource))
  ↓
Policy Engine (Reusable Rules & ABAC Evaluation)
  ↓
Access Evaluation & Decision Matrix (PERMIT / DENY)
  ↓
Audit Center (RoleAuditRecord & AccessReviewRecord)
```

---

## Phase 11.2 IAM Services & Capabilities

- **`PermissionCatalog`**: Centralized registry of standard permissions grouped by category domain (`BUSINESS`, `COMPLIANCE`, `DOCUMENT`, `AI`, `TRUST`, `USER`, `ORGANIZATIONS`, `AUDIT`, `SETTINGS`).
- **`RoleService`**: Role management (Platform Super Admin, Platform Admin, Org Admin, Compliance Manager, Compliance Officer, Business Owner, Reviewer, Auditor, Editor, Contributor, Viewer, Read Only, Custom Roles) and cloning/template instantiation.
- **`RoleInheritanceEngine`**: Parent-child role inheritance resolution (`Super Admin` -> `Org Admin` -> `Compliance Manager` -> `Officer` -> `Viewer`) with circular dependency protection.
- **`PolicyEngine`**: Reusable policy rules (`OWNER_ONLY`, `COMPLIANCE_MANAGER_ONLY`, `ORG_ADMIN_ONLY`, `PLATFORM_ADMIN_BYPASS`).
- **`AuthorizationEngine`**: Centralized access decision engine (`can({ user, permission, resource, organizationId })`).
- **`RoleAssignmentService`**: User role assignment management per organization & resource scope.
- **`TemporaryAccessService`**: Time-bound temporary access management & automatic expiration engine.
- **`AccessReviewService`**: Administrative access review audits & inactive user access flagging.
- **`IAMFacade`**: Unified facade exposing all IAM services cleanly.

---

## Database Schema Extensions (Prisma)

- **`PlatformRole`**: Platform & custom role definitions (`code`, `name`, `scope`, `parent_role_id`, `is_custom`, `msme_id`).
- **`PlatformPermission`**: Granular permission catalog (`code`, `name`, `category`, `description`).
- **`RolePermission`**: Role-Permission join table.
- **`UserRoleAssignment`**: User role assignments per organization (`user_id`, `role_id`, `organization_id`, `resource_type`, `resource_id`).
- **`TemporaryAccessAssignment`**: Time-bound access grants (`start_time`, `end_time`, `status`, `reason`).
- **`AuthorizationPolicy`**: Policy definitions (`code`, `rule_type`, `condition_json`).
- **`AccessReviewRecord`**: Administrative access review logs (`title`, `reviewer_id`, `status`, `summary_json`).
- **`RoleAuditRecord`**: Role configuration change audit log.

---

## REST API Specification (`/api/v1/iam`)

| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/iam/dashboard/stats` | Fetch IAM metrics | `iam.read` |
| `GET` | `/api/v1/iam/permissions` | Fetch permission catalog | `iam.read` |
| `GET` | `/api/v1/iam/roles` | List roles directory | `iam.read` |
| `POST` | `/api/v1/iam/roles` | Create custom role | `iam.write` |
| `GET` | `/api/v1/iam/roles/:id` | Get role details | `iam.read` |
| `GET` | `/api/v1/iam/roles/:id/effective-permissions` | Resolve effective permissions with inheritance | `iam.read` |
| `POST` | `/api/v1/iam/authorize/evaluate` | Centralized authorization evaluation | `iam.evaluate` |
| `GET` | `/api/v1/iam/assignments` | List role assignments | `iam.read` |
| `POST` | `/api/v1/iam/assignments` | Assign role to user | `iam.write` |
| `DELETE` | `/api/v1/iam/assignments/:id` | Revoke role assignment | `iam.write` |
| `GET` | `/api/v1/iam/temporary-access` | List temporary access grants | `iam.read` |
| `POST` | `/api/v1/iam/temporary-access` | Grant time-bound access | `iam.write` |
| `POST` | `/api/v1/iam/temporary-access/:id/revoke` | Revoke temporary access grant | `iam.write` |
| `GET` | `/api/v1/iam/access-reviews` | List access review audits | `iam.read` |
| `POST` | `/api/v1/iam/access-reviews` | Conduct administrative access review | `iam.write` |

---

## Verification & Testing

- **Phase 11.2 Test Suite**: `node tests/enterpriseIAM.test.js` (**PASS - 8/8 test stages**)
- **Authentication Audit**: `node tests/authAudit.test.js` (**PASS**)
- **Frontend Production Build**: `npm run build` in `client/` (**PASS - 4756 modules transformed, 0 errors**)

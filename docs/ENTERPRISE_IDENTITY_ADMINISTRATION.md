# Enterprise Identity, User & Organization Management Platform

## Architectural Overview

The **Enterprise Administration Platform** (`identity`) bounded context serves as the central identity, user, organization, membership, and invitation foundation for VerifyChain.

```
Enterprise Administration Platform
  ↓
Identity Service (User Identities, Profiles, Auth Mapping)
  ↓
Organization Service (Organizations, Branding, Quotas, Settings)
  ↓
Organization Membership Service (Memberships, Roles, Switching)
  ↓
Invitation Service (Invitations, Expiration Tokens, Acceptance)
  ↓
User Lifecycle Service (User Status State Machine: Active, Suspended, Archived)
  ↓
Organization Lifecycle Service (Org Status State Machine: Active, Trial, Suspended)
  ↓
Administration Dashboard (Platform Overview, Directories, Invites, Auditing)
```

---

## Phase 11.1 Identity & Administration Modules

- **`IdentityService`**: Enterprise Identity management (Unique ID, Profile, Organization Memberships, Roles, Status, Auth Provider, Preferences, Activity Summary, Audit References).
- **`OrganizationService`**: Enterprise Organization CRUD, branding, logo, storage quotas, settings, metadata, status.
- **`OrganizationMembershipService`**: Membership management, primary organization, organization switching, membership status/history.
- **`InvitationService`**: Enterprise invitation workflow (invite user, resend, cancel, accept, reject, expiration tokens, notes, bulk invites, validation).
- **`UserLifecycleService`**: User status transitions (`INVITED`, `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `LOCKED`, `DISABLED`, `ARCHIVED`, `DELETED`, `RESTORED`) with audit event logs.
- **`OrganizationLifecycleService`**: Organization status transitions (`CREATED`, `ACTIVE`, `SUSPENDED`, `TRIAL`, `INACTIVE`, `ARCHIVED`, `DELETED`, `RESTORED`) with audit event logs.
- **`ProfileAdministrationService`**: User profile attributes (display name, avatar, job title, department, phone, email, timezone, language, notification/security preferences, custom metadata).
- **`OrganizationAdministrationService`**: Organization administrative settings, storage quotas, compliance preferences, notification/security defaults.
- **`IdentitySearchService`**: Administration Search (search users, organizations, invitations, memberships, status, email, role, activity).
- **`IdentityFacade`**: Centralized facade exposing all Identity & Organization services cleanly.

---

## Database Schema Extensions (Prisma)

- **`PlatformOrganization`**: Central organization records (`slug`, `status`, `subscription_tier`, `storage_quota_mb`, `branding_logo_url`, `settings_json`).
- **`OrganizationMembership`**: User-Organization junction table (`role`, `status`, `is_primary`, `joined_at`).
- **`OrganizationInvitation`**: Invitation tokens & tracking (`token`, `email`, `organization_id`, `role`, `status`, `expires_at`).
- **`UserProfile`**: Detailed user identity attributes (`job_title`, `department`, `timezone`, `language`, `preferences`).
- **`OrganizationSettings`**: Organization defaults & security settings (`compliance_defaults`, `notification_defaults`, `security_defaults`).
- **`UserStatusHistory`**: User lifecycle transition audit log.
- **`OrganizationStatusHistory`**: Organization lifecycle transition audit log.
- **`InvitationHistory`**: Invitation lifecycle event log.

---

## REST API Specification (`/api/v1/admin`)

| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard/stats` | Fetch platform administration metrics | `admin.read` |
| `GET` | `/api/v1/admin/users` | List platform user identities | `admin.read` |
| `POST` | `/api/v1/admin/users` | Create platform user identity | `admin.write` |
| `GET` | `/api/v1/admin/users/:id` | Get user identity details & profile | `admin.read` |
| `PUT` | `/api/v1/admin/users/:id/profile` | Update user profile & preferences | `admin.write` |
| `POST` | `/api/v1/admin/users/:id/status` | Transition user lifecycle state | `admin.write` |
| `GET` | `/api/v1/admin/organizations` | List platform organizations | `admin.read` |
| `POST` | `/api/v1/admin/organizations` | Create platform organization | `admin.write` |
| `GET` | `/api/v1/admin/organizations/:id` | Get organization details & settings | `admin.read` |
| `PUT` | `/api/v1/admin/organizations/:id` | Update organization settings & quota | `admin.write` |
| `POST` | `/api/v1/admin/organizations/:id/status` | Transition organization lifecycle state | `admin.write` |
| `GET` | `/api/v1/admin/organizations/:id/members` | List organization members | `admin.read` |
| `POST` | `/api/v1/admin/memberships` | Add user membership to organization | `admin.write` |
| `DELETE` | `/api/v1/admin/memberships` | Remove member from organization | `admin.write` |
| `POST` | `/api/v1/admin/memberships/switch` | Switch user active primary organization | `admin.write` |
| `GET` | `/api/v1/admin/invitations` | List invitations | `admin.read` |
| `POST` | `/api/v1/admin/invitations` | Create & send invitation | `admin.write` |
| `POST` | `/api/v1/admin/invitations/:id/resend` | Resend pending invitation | `admin.write` |
| `POST` | `/api/v1/admin/invitations/:id/cancel` | Cancel invitation | `admin.write` |
| `POST` | `/api/v1/admin/invitations/accept` | Accept invitation token | `admin.write` |
| `POST` | `/api/v1/admin/invitations/bulk` | Bulk invite users to organization | `admin.write` |
| `GET` | `/api/v1/admin/search` | Search users, orgs, invitations, memberships | `admin.read` |

---

## Verification & Testing

- **Phase 11.1 Test Suite**: `node tests/enterpriseIdentity.test.js` (**PASS - 8/8 test stages**)
- **Authentication Audit**: `node tests/authAudit.test.js` (**PASS**)
- **Frontend Production Build**: `npm run build` in `client/` (**PASS - 4756 modules transformed, 0 errors**)

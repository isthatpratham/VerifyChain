# Enterprise AI Administration & Governance Platform

## Architectural Overview

The **AI Operations Center** (`aiAdmin`) bounded context provides a provider-agnostic administration framework for AI models, providers, prompts, versioning, quotas, and policies across VerifyChain.

```
Enterprise Administration Platform
  ↓
AI Administration Service (System Overview, Default Configuration)
  ↓
Provider Registry (Google Gemini, OpenAI, Anthropic, Azure OpenAI, Ollama, Mock)
  ↓
Model Registry (gemini-1.5-pro, gpt-4o, claude-3-5-sonnet, mock-model)
  ↓
Prompt Registry (Centralized Production Prompts, Template Variables)
  ↓
Prompt Version Service (Immutable Versioning, Diffs, Rollback)
  ↓
Quota Manager (User, Organization, Module, Daily & Token Limits)
  ↓
Usage Policy Engine (Context Bounds, PII Redaction, Confidence Thresholds)
  ↓
AI Operations Dashboard (Providers, Models, Prompts, Policies, Audits)
```

---

## Phase 11.4 AI Administration Services

- **`ProviderRegistryService`**: Registration for future AI providers (`GEMINI`, `OPENAI`, `ANTHROPIC`, `AZURE_OPENAI`, `OLLAMA`, `MOCK`) with priority, status, and health hooks.
- **`ModelRegistryService`**: Provider-independent model catalog management with context windows, streaming, and structured output support flags.
- **`PromptRegistryService`**: Centralized prompt library across categories (`COMPLIANCE`, `DOCUMENT`, `ASSISTANT`, `PREDICTIVE`, `GENERAL`).
- **`PromptVersionService`**: Immutable prompt versioning (`DRAFT`, `REVIEW`, `APPROVED`, `DEPRECATED`), review notes, and rollback engine.
- **`QuotaService`**: Quota limits per user, organization, module, and feature with alert threshold monitoring.
- **`AIPolicyEngine`**: Governance rules (context size, PII handling, human review, confidence thresholds).
- **`AIConfigurationService`**: Default AI configuration parameters (default provider, default model, default temperature, default timeout, retry count).
- **`AIAuditService`**: Governance audit events logging & history.
- **`AIAdministrationService`**: Central orchestrator for AI Operations Center overview.
- **`AIAdminFacade`**: Unified facade layer exposing all AI Administration services.

---

## Database Schema Extensions (Prisma)

- **`AIAdminProvider`**: Provider registry (`key`, `name`, `status`, `priority`, `capabilities_json`).
- **`AIAdminModel`**: Provider-independent model catalog (`key`, `name`, `provider_id`, `context_window`).
- **`AIAdminPrompt`**: Prompt catalog (`code`, `name`, `category`, `system_prompt`, `current_version`).
- **`AIAdminPromptVersion`**: Immutable prompt versioning (`version_number`, `template_text`, `variables_json`, `status`).
- **`AIAdminConfig`**: AI platform settings (`key`, `value_json`, `category`).
- **`AIAdminQuota`**: Quota limits (`scope_type`, `scope_id`, `daily_request_limit`, `monthly_token_limit`).
- **`AIAdminPolicy`**: Governance policies (`code`, `name`, `rule_type`, `rules_json`).
- **`AIAdminAuditEvent`**: Governance audit events (`action`, `actor_id`, `details_json`).
- **`AIAdminUsageStat`**: Aggregated usage statistics (`module`, `requests_count`, `prompt_tokens_estimated`).

---

## REST API Specification (`/api/v1/ai-admin`)

| Method | Endpoint | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/ai-admin/dashboard/stats` | Fetch AI Operations Center metrics | `ai.admin.read` |
| `GET` | `/api/v1/ai-admin/providers` | List registered AI providers | `ai.provider.read` |
| `PUT` | `/api/v1/ai-admin/providers/:key` | Update AI provider priority & status | `ai.provider.manage` |
| `GET` | `/api/v1/ai-admin/models` | List provider-independent model catalog | `ai.model.manage` |
| `GET` | `/api/v1/ai-admin/prompts` | List production prompt library | `ai.prompt.manage` |
| `POST` | `/api/v1/ai-admin/prompts` | Create new prompt template | `ai.prompt.manage` |
| `POST` | `/api/v1/ai-admin/prompts/:id/versions` | Publish new prompt version | `ai.prompt.manage` |
| `POST` | `/api/v1/ai-admin/prompts/:id/rollback` | Rollback prompt to historical version | `ai.prompt.manage` |
| `GET` | `/api/v1/ai-admin/quotas` | List AI quotas | `ai.quota.manage` |
| `POST` | `/api/v1/ai-admin/quotas` | Set quota limits | `ai.quota.manage` |
| `GET` | `/api/v1/ai-admin/policies` | List AI governance policies | `ai.policy.manage` |
| `PUT` | `/api/v1/ai-admin/policies/:code` | Update AI governance policy | `ai.policy.manage` |
| `GET` | `/api/v1/ai-admin/config` | List AI platform configurations | `ai.configure` |
| `POST` | `/api/v1/ai-admin/config` | Update AI configuration setting | `ai.configure` |
| `GET` | `/api/v1/ai-admin/audits` | List AI governance audit trail | `ai.audit.view` |

---

## Verification & Testing

- **Phase 11.4 Test Suite**: `node tests/enterpriseAIAdmin.test.js` (**PASS - 8/8 test stages**)
- **Authentication Audit**: `node tests/authAudit.test.js` (**PASS**)
- **Frontend Production Build**: `npm run build` in `client/` (**PASS - 4756 modules transformed, 0 errors**)

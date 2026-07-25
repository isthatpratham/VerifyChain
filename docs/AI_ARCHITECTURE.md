# VerifyChain Enterprise AI Platform Architecture

## Overview

The **VerifyChain AI Platform** (`server/src/aiPlatform`) provides the foundational, reusable AI infrastructure powering present and future AI capabilities across the platform.

### Core Architectural Principle

```
Business Modules (Auth, Business, Compliance, Trust, Distribution, DevPlatform)
        │
        ▼
[AI Context Builder]
        │
        ▼
[Prompt Orchestrator]
        │
        ▼
[Model Provider Factory]
        │
        ▼
[LLM Provider (OpenAI / Anthropic / Gemini / Azure / Local / Mock)]
        │
        ▼
[Structured AI Response & JSON Validation]
```

> **Strict Scoping Constraint**: No business module invokes model provider APIs directly. All AI execution flows strictly through `AIServiceFacade`.

---

## 1. Provider Abstraction & Registry

The provider layer decouples business logic from specific LLM vendors:
- **`AbstractModelProvider`**: Base interface specifying `generateCompletion()` and `checkHealth()`.
- **Supported Providers**:
  - `OPENAI`: OpenAI GPT-4o, GPT-4, GPT-3.5-turbo
  - `ANTHROPIC`: Anthropic Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
  - `GEMINI`: Google Gemini 1.5 Flash, Gemini 1.5 Pro
  - `AZURE_OPENAI`: Enterprise Azure OpenAI deployments
  - `LOCAL`: Local Ollama / HTTP inference endpoints
  - `MOCK`: Deterministic mock provider for offline development & verification testing
- **`ProviderFactory`**: Dynamically resolves target model provider based on runtime configuration without requiring application restarts.
- **`ModelRegistry`**: Tracks model context windows, prompt cost per 1k tokens, completion cost per 1k tokens, latency expectations, and capabilities.

---

## 2. Prompt Orchestration Engine

Managed by `PromptOrchestrator.js`:
- **Template Management**: Stores system prompts, user prompt templates, and output JSON schemas.
- **Variable Substitution**: Renders `{{variableName}}` expressions dynamically.
- **Context Injection**: Automatically injects unified JSON domain contexts.
- **Output Validation**: Validates raw model completion against expected JSON structure.
- **Retry Strategy**: Automatic exponential backoff retries on transient failures or parsing errors.

---

## 3. Unified AI Context Builder

Aggregates domain-specific context from platform repositories:
- **Business Profile Context**: MSME profile, GSTIN, PAN, industry type, verification posture.
- **Compliance Context**: Requirement counts, compliance health score, pending renewals.
- **Supplier Trust Context**: Trust score, trust badge level, active connectors count.
- **Developer Platform Context**: Application count, API keys count, webhook subscriptions count.
- **Audit Context**: Recent audit actions and telemetry timestamps.

---

## 4. Permission-Aware Memory Architecture

Managed by `MemoryManager.js`:
- **Conversation Memory**: Appends and retrieves multi-turn system/user/assistant interaction history.
- **Organization Memory**: Stores organization-level preferences and key-value attributes.
- **Retention & TTL Purging**: Supports optional retention TTLs per memory record for privacy compliance.

---

## 5. Token Accounting & AI Auditing

- **Token Accounting (`TokenAccountingService.js`)**:
  - Logs `prompt_tokens`, `completion_tokens`, `total_tokens`, and `estimated_cost` in USD per request.
  - Aggregates usage analytics and average latency per organization.
- **AI Audit (`AIAuditService.js`)**:
  - Securely logs AI interaction events to `IntegrationAuditLog` with correlation IDs, provider code, model code, and status.
  - Never stores raw secret keys or sensitive credentials.

---

## 6. Permission Scopes

The AI Platform enforces fine-grained authorization:
- `ai.use`: Execute AI prompt templates and context builders.
- `ai.admin`: Configure model providers, default models, and system prompts.
- `ai.analytics`: Query token accounting, cost metrics, and latency reports.
- `ai.configuration`: Update platform runtime feature flags and provider fallbacks.

---

## 7. Extension Guide

To add a new AI Model Provider:
1. Extend `AbstractModelProvider` in `server/src/aiPlatform/providers/NewProvider.js`.
2. Implement `async generateCompletion(params)`.
3. Register the new provider in `ProviderFactory.js`.

---
name: help
description: "List all /api commands and their usage"
category: api
complexity: basic
mcp-servers: []
personas: []
---

# /api:help - API Commands Reference

## Available Commands

### Setup & Context

| Command | Description | Agent | Model |
|---------|-------------|-------|-------|
| `/api:init` | Initialize project context (creates `.apidog.json`) | - | - |
| `/api:context` | View or modify current context | - | - |

### Design & Documentation

| Command | Description | Agent | Model |
|---------|-------------|-------|-------|
| `/api:design` | Design new APIs (API-first) | api-designer | Sonnet |
| `/api:push` | Push existing code to Apidog (Code-first) | api-pusher | Sonnet |
| `/api:docs` | Search and view API documentation | - | - |

### Update & Maintenance

| Command | Description | Agent | Model |
|---------|-------------|-------|-------|
| `/api:update` | Update existing API endpoints | api-designer | Sonnet |
| `/api:diff` | Compare code vs Apidog specs | - | - |
| `/api:cleanup` | Remove placeholders, unused schemas | - | - |

### Implementation & Client

| Command | Description | Agent | Model |
|---------|-------------|-------|-------|
| `/api:implement` | Implement backend from Apidog specs | api-worker | Haiku |
| `/api:consume` | Generate client code from specs | api-consumer | Haiku |

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Lifecycle                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     /api:init                               │
│               (프로젝트 컨텍스트 초기화)                      │
│                         │                                   │
│         ┌───────────────┴───────────────┐                   │
│         ▼                               ▼                   │
│    [API-First]                    [Code-First]              │
│         │                               │                   │
│         ▼                               ▼                   │
│    /api:design                     /api:push                │
│    (새 API 설계)                (기존 코드 → Apidog)         │
│         │                               │                   │
│         └───────────────┬───────────────┘                   │
│                         ▼                                   │
│                    ┌─────────┐                              │
│                    │ Apidog  │  ← Single Source of Truth    │
│                    └─────────┘                              │
│                         │                                   │
│     ┌───────────────────┼───────────────────┐               │
│     ▼                   ▼                   ▼               │
│ /api:update        /api:implement      /api:consume         │
│ (API 수정)         (백엔드 구현)        (클라이언트 생성)     │
│                                                             │
│ /api:docs ← 문서 조회      /api:diff ← 코드/스펙 비교        │
│ /api:cleanup ← 정리        /api:context ← 컨텍스트 관리      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Examples

```bash
# Initialize project context (run first!)
/api:init my-service backend

# View/modify context
/api:context                      # view current
/api:context new-service api      # update
/api:context --clear              # clear

# Design new user management API
/api:design user-management

# Push existing Express routes to Apidog
/api:push

# Update existing API endpoint
/api:update /users/{id}

# Compare code vs Apidog specs
/api:diff --context my-app/backend

# Clean up placeholder endpoints
/api:cleanup --placeholders --dry-run
/api:cleanup --placeholders

# Look up API documentation
/api:docs users

# Implement backend from Apidog spec
/api:implement /users --framework fastapi

# Generate TypeScript client
/api:consume users --lang typescript --style axios
```

## Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `--context` | Service/project path | `my-app/backend` |
| `--framework` | Backend framework | `express`, `fastapi`, `nestjs` |
| `--lang` | Client language | `typescript`, `python`, `kotlin` |
| `--style` | HTTP client style | `fetch`, `axios`, `ky`, `httpx` |
| `--folder` | Apidog folder | `Users`, `Auth` |
| `--dry-run` | Preview without changes | (cleanup, diff) |
| `--placeholders` | Target placeholder endpoints | (cleanup) |

## MCP Tools Used

All commands use the Apidog MCP server tools:

### Read Tools
- `apidog_search` - Search endpoints
- `apidog_get_endpoint` - Get endpoint details
- `apidog_get_schema` - Get schema definitions
- `apidog_list_endpoints` - List all endpoints
- `apidog_project_info` - Get project metadata
- `apidog_refresh` - Refresh cached data

### Context Tools
- `apidog_set_context` - Set project context (service/project)
- `apidog_get_context` - Get current context
- `apidog_clear_context` - Clear context

### Write Tools
- `apidog_add_endpoint` - Register endpoints
- `apidog_add_schema` - Register schemas
- `apidog_import_url` - Import from URL
- `apidog_import_spec` - Import OpenAPI spec

### Update/Delete Tools
- `apidog_update_endpoint` - Update endpoint
- `apidog_sync_spec` - Sync with spec (removes unmatched)
- `apidog_clear_project` - Delete ALL (requires confirm)
- `apidog_list_placeholders` - List placeholder endpoints
- `apidog_delete_endpoints` - Delete specific endpoints (dryRun/confirm)
- `apidog_delete_placeholders` - Delete all placeholders (dryRun/confirm)

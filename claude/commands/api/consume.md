---
name: consume
description: "Generate client code from Apidog API specifications"
category: api
complexity: standard
mcp-servers: [apidog]
personas: [api-consumer]
---

# /api:consume - Generate API Client Code

## Triggers
- Frontend/client API integration needs
- "API 클라이언트 만들어줘", "이 API 호출 코드 생성해줘"
- Type-safe API client generation requests
- SDK generation from Apidog specs

## Usage
```
/api:consume [endpoint-path-or-keyword] [--context service/project] [--lang typescript|python|kotlin|swift] [--style fetch|axios|ky|httpx]
```

## Behavioral Flow
1. **Detect Target Service** (from natural language):
   - User says "resume-core의 API" → context = "resume-core"
   - User says "백엔드 API" → context = from `.apidog.json` or ask
   - No service mentioned → search all or use `.apidog.json` as hint
2. **Fetch Specs**: Retrieve endpoint and schema definitions from Apidog
3. **Analyze Target**: Check existing client code patterns and conventions
4. **Generate Types**: Create request/response type definitions
5. **Generate Client**: Create API client functions/methods
6. **Error Handling**: Include typed error handling
7. **Integration**: Ensure compatibility with existing codebase

Key behaviors:
- Type-safe generation: full TypeScript/type hint support
- Pattern matching: follows existing client code conventions
- Complete client: types, functions, error handling
- Framework-aware: supports various HTTP libraries

## MCP Integration
- **Apidog MCP**: Read specifications for client generation
  - `apidog_set_context`: Set project context
  - `apidog_search`: Find relevant endpoints
  - `apidog_get_endpoint`: Get endpoint details
  - `apidog_get_schema`: Get type definitions

## Agent
Uses `api-consumer` agent (Haiku model) for fast client code generation.

## Examples

### Generate TypeScript Client
```
/api:consume users --context aura-assistant/backend --lang typescript --style axios
# Fetches: User-related endpoints from Apidog
# Generates:
#   - types/user.ts (UserResponse, CreateUserRequest, etc.)
#   - api/userApi.ts (createUser, getUser, updateUser, deleteUser)
```

### Generate Python Client
```
/api:consume auth --lang python --style httpx
# Fetches: Auth endpoints from Apidog
# Generates:
#   - models/auth.py (LoginRequest, TokenResponse, etc.)
#   - clients/auth_client.py (login, logout, refresh)
```

### Generate Full SDK
```
/api:consume --context my-service/api --lang typescript
# Fetches: All endpoints in context
# Generates: Complete typed API client SDK
```

## Boundaries

**Will:**
- Read API specs from Apidog
- Generate type-safe client code
- Create request/response types from schemas
- Follow existing client code patterns

**Will Not:**
- Design API specifications (use `/api:design`)
- Implement backend code (use `/api:implement`)
- Modify Apidog specifications
- Make API design decisions

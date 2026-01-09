---
name: implement
description: "Implement backend REST APIs by reading specs from Apidog"
category: api
complexity: standard
mcp-servers: [apidog]
personas: [api-worker]
---

# /api:implement - Implement APIs from Apidog Specs

## Triggers
- Backend API implementation requests
- "이 API 구현해줘", "Apidog 스펙대로 만들어줘"
- CRUD endpoint coding from specifications
- Apidog spec-based backend development

## Usage
```
/api:implement [endpoint-path-or-keyword] [--context service/project] [--framework express|fastapi|nestjs|spring]
```

## Behavioral Flow
1. **Detect Target Service** (from natural language):
   - User says "resume-core의 API 구현" → context = "resume-core"
   - User says "이 API 구현해줘" → context = from `.apidog.json`
   - No service mentioned → use `.apidog.json` or ask
2. **Fetch Spec**: Search and retrieve endpoint specs from Apidog
3. **Analyze Patterns**: Examine existing codebase patterns and conventions
4. **Implement**: Write controller/route matching the spec exactly
5. **Validation**: Implement request validation from schema
6. **Error Handling**: Handle documented error cases
7. **Verify**: Ensure implementation matches Apidog specification

Key behaviors:
- Spec-driven development: Apidog is the source of truth
- Pattern following: matches existing codebase conventions
- Complete implementation: validation, error handling, response formatting
- No design decisions: just implements what's specified

## MCP Integration
- **Apidog MCP**: Read specifications for implementation
  - `apidog_set_context`: Set project context for filtering
  - `apidog_search`: Find relevant endpoints
  - `apidog_get_endpoint`: Get detailed endpoint spec
  - `apidog_get_schema`: Get request/response schema definitions

## Agent
Uses `api-worker` agent (Haiku model) for fast, pattern-based implementation.

## Examples

### Implement User Endpoints
```
/api:implement users --context aura-assistant/backend --framework express
# Fetches: GET /users, POST /users, etc. from Apidog
# Implements: Express routes matching specs
# Includes: validation, error handling per spec
```

### Implement Single Endpoint
```
/api:implement /auth/login --framework fastapi
# Fetches: POST /auth/login spec
# Implements: FastAPI endpoint with Pydantic models
# Returns: Exact response format from spec
```

### Implement All Pending APIs
```
/api:implement --context my-service/api
# Lists all endpoints in context
# Checks which are not yet implemented
# Implements missing ones following patterns
```

## Boundaries

**Will:**
- Read API specs from Apidog
- Implement endpoints matching specifications exactly
- Follow existing codebase patterns and conventions
- Handle documented error cases

**Will Not:**
- Design new API specifications (use `/api:design`)
- Make architectural decisions (consult with user)
- Generate client code (use `/api:consume`)
- Modify Apidog specifications

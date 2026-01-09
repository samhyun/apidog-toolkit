---
name: push
description: "Push existing REST APIs from code to Apidog (Code-first approach)"
category: api
complexity: standard
mcp-servers: [apidog]
personas: [api-pusher]
---

# /api:push - Push Existing APIs to Apidog

## CRITICAL: This command MUST call Apidog MCP tools
- DO NOT generate local YAML/JSON files
- MUST call `mcp__apidog__apidog_add_endpoint` for each endpoint
- MUST call `mcp__apidog__apidog_add_schema` for each schema
- Result should be visible in Apidog UI, not local files

## Triggers
- Existing code needs API documentation
- "이 API 문서화해줘", "Apidog에 등록해줘"
- Code-first projects needing spec synchronization

## Usage
```
/api:push [path-or-pattern] [--context service/project] [--framework express|fastapi|nestjs|spring]
```

## Behavioral Flow
1. **Load Context**: Read `.apidog.json` from project root
   - If not found → Tell user to run `/api:init` first
   - If found → Call `apidog_set_context` with serviceName/projectName
2. **Code Analysis**: Scan target files for API endpoint definitions using Read/Glob/Grep
3. **Extract & Register**: For EACH endpoint found:
   - Call `mcp__apidog__apidog_add_schema` for request/response types
   - Call `mcp__apidog__apidog_add_endpoint` with full spec
4. **Verify**: `mcp__apidog__apidog_project_info` to confirm registration

## Required MCP Tool Calls

### For each schema/type found:
```
mcp__apidog__apidog_add_schema({
  name: "UserResponse",
  schema: {
    type: "object",
    properties: { id: { type: "string" }, ... }
  }
})
```

### For each endpoint found:
```
mcp__apidog__apidog_add_endpoint({
  method: "POST",
  path: "/users",
  name: "Create User",
  tags: ["Users"],
  requestBody: { ... },
  responses: { "200": { ... } }
})
```

## Agent
Uses `api-pusher` agent (Sonnet model) - MUST call Apidog MCP tools.

## Expected Output
```
✅ Registered to Apidog:

Endpoints (5):
- GET /users - List Users
- POST /users - Create User
...

Schemas (3):
- User
- CreateUserRequest
...
```

## NOT Expected (These are WRONG):
- ❌ "Generated openapi.yaml file"
- ❌ "Created api-spec.json"
- ❌ "Here's the OpenAPI specification..."

## Examples

### Push Express Routes
```
/api:push src/routes/ --context my-app/backend --framework express
# Scans code → Calls MCP tools → Registers to Apidog
```

### Push FastAPI Endpoints
```
/api:push app/api/ --framework fastapi
# Scans code → Calls MCP tools → Registers to Apidog
```

## Boundaries

**Will:**
- Analyze existing code for API patterns
- CALL Apidog MCP tools to register specs
- Detect and import existing OpenAPI files via `apidog_import_spec`

**Will Not:**
- Generate local YAML/JSON files (WRONG!)
- Design new APIs (use `/api:design`)
- Modify existing code

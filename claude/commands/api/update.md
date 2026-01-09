---
name: update
description: "Update existing API endpoints in Apidog"
category: api
complexity: standard
mcp-servers: [apidog]
personas: [api-designer]
---

# /api:update - Update Existing APIs

## Triggers
- Existing API modification requests
- "API 수정해줘", "엔드포인트 업데이트해줘"
- Schema changes for existing endpoints
- API versioning updates

## Usage
```
/api:update [endpoint-path-or-keyword] [--context service/project] [--field name|params|body|response]
```

## Behavioral Flow
1. **Load Context**: Read `.apidog.json` from project root
   - If not found → Tell user to run `/api:init` first
   - If found → Call `apidog_set_context` with serviceName/projectName
2. **Find Endpoint**: Search for the target endpoint
   - Use `apidog_search` or `apidog_get_endpoint` to find existing spec
   - Show current specification to user
3. **Identify Changes**: Understand what needs to be modified
   - Ask user for specific changes if not clear
   - Compare with current spec
4. **Update Endpoint**: Apply changes using `apidog_update_endpoint`
   - Preserve unchanged fields
   - Validate new schema if modified
5. **Update Related Schemas**: If request/response types changed
   - Check if schema exists with `apidog_get_schema`
   - Update or add schemas as needed
6. **Verify**: Confirm update with `apidog_get_endpoint`

Key behaviors:
- **Preserve existing data**: Only modify specified fields
- **Schema consistency**: Update related schemas together
- **Validation**: Ensure changes maintain API consistency
- **Show diff**: Display before/after comparison

## MCP Integration
- **Apidog MCP**: Read and update specifications
  - `apidog_set_context`: Set project context
  - `apidog_search`: Find target endpoints
  - `apidog_get_endpoint`: Get current specification
  - `apidog_get_schema`: Get related schemas
  - `apidog_update_endpoint`: Apply updates
  - `apidog_add_schema`: Add new schemas if needed

## Agent
Uses `api-designer` agent (Sonnet model) for intelligent API updates.

## Examples

### Update Single Endpoint
```
/api:update /users/{id}
# Shows current spec
# Asks what to change
# Applies updates
```

### Update Request Schema
```
/api:update /users --field body
# Shows current request body
# Accepts new schema definition
# Updates endpoint and related schema
```

### Update Response Codes
```
/api:update /auth/login --field response
# Shows current responses
# Allows adding/modifying response codes
```

### Batch Update by Keyword
```
/api:update users --context my-app/backend
# Lists all user-related endpoints
# Allows selecting which to update
```

## Output Format
```
📝 Updating API Endpoint

Current:
  POST /users
  Request: { email: string, name: string }
  Response: 201 { id: string, ... }

Changes:
  + Added field: phone (optional)
  ~ Modified: name → required

Updated:
  POST /users
  Request: { email: string, name: string, phone?: string }
  Response: 201 { id: string, ... }

✅ Endpoint updated in Apidog
```

## Boundaries

**Will:**
- Read existing API specs from Apidog
- Update endpoint definitions preserving unchanged fields
- Modify related schemas as needed
- Show before/after comparison

**Will Not:**
- Create new endpoints (use `/api:design`)
- Delete endpoints (use `/api:cleanup` or direct MCP tools)
- Implement backend code changes
- Auto-sync code with spec changes

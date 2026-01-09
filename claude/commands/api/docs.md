---
name: docs
description: "Search and view API documentation from Apidog"
category: api
complexity: basic
mcp-servers: [apidog]
personas: []
---

# /api:docs - API Documentation Lookup

## Triggers
- API documentation lookup requests
- "이 API 뭐야?", "엔드포인트 찾아줘"
- Quick API reference needs
- Schema/model definition queries

## Usage
```
/api:docs [keyword-or-path] [--context service/project] [--type endpoint|schema|all]
```

## Behavioral Flow
1. **Detect Target Service** (from natural language):
   - User says "resume-core의 API" → context = "resume-core"
   - User says "백엔드 API 문서" → context = from `.apidog.json` or ask
   - No service mentioned → search all
2. **Search**: Find matching endpoints or schemas
3. **Display**: Show formatted documentation
4. **Details**: Provide full specs on request

Key behaviors:
- Fast lookup: no agent overhead, direct MCP calls
- Flexible search: by path, name, keyword
- Context filtering: narrow to specific service/project
- Complete info: method, path, parameters, request/response, errors

## MCP Integration
- **Apidog MCP**: Direct documentation access
  - `apidog_set_context`: Optional context filtering
  - `apidog_search`: Keyword search across endpoints
  - `apidog_get_endpoint`: Detailed endpoint info
  - `apidog_get_schema`: Schema/model definitions
  - `apidog_list_endpoints`: List all endpoints
  - `apidog_project_info`: Project overview

## Examples

### Search Endpoints
```
/api:docs users
# Searches: endpoints matching "users"
# Returns: List of matching endpoints with methods and paths
```

### Get Endpoint Details
```
/api:docs /users/{id}
# Returns: Full endpoint specification
#   - Method, path, description
#   - Parameters (path, query, header)
#   - Request body schema
#   - Response schemas (200, 400, 404, etc.)
```

### View Schema
```
/api:docs UserResponse --type schema
# Returns: Schema definition
#   - Properties with types
#   - Required fields
#   - Validation rules
```

### Project Overview
```
/api:docs --context aura-assistant/backend
# Returns: All endpoints in context
#   - Grouped by folder/tag
#   - Method counts
#   - Schema list
```

### List All
```
/api:docs --type all
# Returns: Complete API catalog
#   - All endpoints
#   - All schemas
#   - Project info
```

## Boundaries

**Will:**
- Search and display API documentation
- Show endpoint details and schemas
- Filter by context/project
- Provide quick reference information

**Will Not:**
- Modify API specifications
- Design new APIs
- Implement or generate code
- Make any changes to Apidog

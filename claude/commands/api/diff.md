---
name: diff
description: "Compare API implementations in code vs specifications in Apidog"
category: api
complexity: standard
mcp-servers: [apidog]
personas: []
---

# /api:diff - API Code vs Spec Comparison

## Triggers
- API sync verification requests
- "코드랑 Apidog 비교해줘", "API 차이점 보여줘"
- Pre-deployment API validation
- Documentation drift detection

## Usage
```
/api:diff [path-or-keyword] [--context service/project] [--framework express|fastapi|nestjs] [--output summary|detailed|json]
```

## Options

| Option | Description |
|--------|-------------|
| `path-or-keyword` | Specific endpoint path or search keyword |
| `--context` | Service/project to compare |
| `--framework` | Backend framework for code analysis |
| `--output` | Output format (summary, detailed, json) |

## Behavioral Flow

1. **Load Context**: Read `.apidog.json` from project root
2. **Scan Code**: Analyze codebase for API endpoint definitions
   - Express: `router.get()`, `app.post()`, etc.
   - FastAPI: `@app.get()`, `@router.post()`, etc.
   - NestJS: `@Get()`, `@Post()`, `@Controller()`, etc.
3. **Fetch Specs**: Get endpoint specifications from Apidog
4. **Compare**: Match and diff code vs specs
   - Path matching
   - Method matching
   - Parameter comparison
   - Request/Response schema comparison
5. **Report**: Generate comparison report

## Comparison Categories

### Status Types
| Status | Symbol | Meaning |
|--------|--------|---------|
| Match | ✅ | Code and spec are in sync |
| Drift | ⚠️ | Differences found between code and spec |
| Code Only | 📝 | Endpoint exists in code but not in Apidog |
| Spec Only | 📋 | Endpoint exists in Apidog but not in code |

### Drift Details
- **Path Mismatch**: URL structure differs
- **Method Mismatch**: HTTP method differs
- **Params Drift**: Query/path parameters differ
- **Body Drift**: Request body schema differs
- **Response Drift**: Response schema or status codes differ

## MCP Integration
- **Apidog MCP**: Read specifications
  - `apidog_set_context`: Set project context
  - `apidog_list_endpoints`: Get all Apidog endpoints
  - `apidog_get_endpoint`: Get detailed spec
  - `apidog_get_schema`: Get schema definitions

## Examples

### Full Project Comparison
```
/api:diff --context my-app/backend

# Output:
📊 API Diff Report: my-app/backend

Summary:
  ✅ Matched: 8 endpoints
  ⚠️  Drift: 2 endpoints
  📝 Code Only: 1 endpoint
  📋 Spec Only: 1 endpoint

Drift Details:
┌──────────────────┬─────────────┬─────────────────────────────┐
│ Endpoint         │ Status      │ Issue                       │
├──────────────────┼─────────────┼─────────────────────────────┤
│ PUT /users/{id}  │ ⚠️ Drift    │ Response: missing 404 case  │
│ POST /orders     │ ⚠️ Drift    │ Body: +quantity field       │
│ GET /health      │ 📝 Code Only│ Not in Apidog               │
│ DELETE /legacy   │ 📋 Spec Only│ Not in codebase             │
└──────────────────┴─────────────┴─────────────────────────────┘

Recommendations:
- /api:push → Sync GET /health to Apidog
- /api:cleanup --stale → Remove DELETE /legacy
- /api:update PUT /users/{id} → Add 404 response
- /api:update POST /orders → Add quantity field
```

### Specific Endpoint Comparison
```
/api:diff /users/{id}

# Output:
📊 Comparing: PUT /users/{id}

Code (Express):
  Path: PUT /users/:id
  Params: { id: string }
  Body: { name, email, phone }
  Response: 200 { user }

Apidog Spec:
  Path: PUT /users/{id}
  Params: { id: string }
  Body: { name, email }        ← Missing: phone
  Response: 200 { user }

⚠️ Drift Detected:
  - Request Body: Code has 'phone' field not in spec

Action: Run `/api:update /users/{id}` to sync spec
```

### JSON Output (for automation)
```
/api:diff --output json

{
  "summary": {
    "matched": 8,
    "drift": 2,
    "codeOnly": 1,
    "specOnly": 1
  },
  "endpoints": [
    {
      "path": "/users/{id}",
      "method": "PUT",
      "status": "drift",
      "issues": ["body:missing_field:phone"]
    }
  ]
}
```

## Sync Recommendations

Based on diff results, the command suggests appropriate actions:

| Situation | Recommended Action |
|-----------|-------------------|
| Code Only | `/api:push` to add to Apidog |
| Spec Only | `/api:cleanup --stale` or implement in code |
| Body Drift | `/api:update` to sync spec |
| Response Drift | `/api:update` to add missing responses |

## Boundaries

**Will:**
- Scan code for API endpoint definitions
- Compare with Apidog specifications
- Report differences with actionable recommendations
- Support multiple framework patterns

**Will Not:**
- Automatically sync (use `/api:push` or `/api:update`)
- Modify code or specs
- Make assumptions about which version is correct
- Handle complex routing patterns (custom middleware)

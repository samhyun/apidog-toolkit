---
name: design
description: "Design new REST APIs and register them to Apidog (API-first approach)"
category: api
complexity: standard
mcp-servers: [apidog]
personas: [api-designer]
---

# /api:design - API Design & Registration

## Triggers
- New feature requiring API endpoints
- API architecture design requests
- "API 설계해줘", "엔드포인트 정의해줘"
- Requirements that need API interface definition

## Usage
```
/api:design [feature-name] [--context service/project] [--folder folder-path]
```

## Behavioral Flow
1. **Load Context**: Read `.apidog.json` from project root
   - If not found → Tell user to run `/api:init` first
   - If found → Call `apidog_set_context` with serviceName/projectName
2. **Requirements Analysis**: Understand what data flows and operations are needed
3. **API Design**: Create RESTful resource-based endpoints with proper HTTP methods
4. **Schema Definition**: Define request/response data structures with validation rules
5. **Register to Apidog**: Push specs using `apidog_add_endpoint` and `apidog_add_schema`
6. **Folder Documentation**: Use tags with `{name, description}` for folder-level docs
7. **Verification**: Confirm registration with `apidog_get_endpoint`

Key behaviors:
- API-first design approach: spec before implementation
- RESTful best practices: proper methods, status codes, URL structure
- Complete specifications: parameters, request/response bodies, error cases
- Team visibility: registered to Apidog as single source of truth

## MCP Integration
- **Apidog MCP**: Primary tool for all API specification operations
  - `apidog_set_context`: Set service/project folder context
  - `apidog_add_endpoint`: Register new endpoints (use tags with description for folder docs)
  - `apidog_add_schema`: Register request/response schemas
  - `apidog_update_endpoint`: Update existing endpoints

## Agent
Uses `api-designer` agent (Sonnet model) for intelligent API design decisions.

## Examples

### Design User Management API
```
/api:design user-management --context aura-assistant/backend
# Designs: POST /users, GET /users/{id}, PUT /users/{id}, DELETE /users/{id}
# Creates: CreateUserRequest, UpdateUserRequest, UserResponse schemas
# Registers all to Apidog under aura-assistant/backend/Users folder
```

### Design Authentication Endpoints
```
/api:design auth --folder Auth
# Designs: POST /auth/login, POST /auth/logout, POST /auth/refresh
# Adds folder documentation with auth flow explanation
```

## Boundaries

**Will:**
- Design comprehensive API specifications following REST best practices
- Register endpoints and schemas to Apidog
- Create folder documentation for API groups
- Ensure consistency across endpoints

**Will Not:**
- Implement the actual backend code (use `/api:implement`)
- Generate client-side code (use `/api:consume`)
- Make business logic decisions beyond API interface

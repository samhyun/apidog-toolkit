# API Init

Initialize Apidog project context for the current codebase.

## Usage
```
/api:init [service-name] [project-name]
```

## What This Does
1. Analyzes the current project structure
2. Creates `.apidog.json` in project root
3. Sets Apidog context for subsequent commands

## Workflow

### Step 1: Discover Project Info
Analyze project files to extract:
- **Project name**: from package.json, pyproject.toml, go.mod, or directory name
- **Framework**: Express, FastAPI, NestJS, Gin, etc.

### Step 2: Create `.apidog.json`
Create the config file in project root:

```json
{
  "serviceName": "my-service",
  "projectName": "backend"
}
```

Use the **Write** tool to create this file at `./.apidog.json`

### Step 3: Set Context in Apidog
```
CALL: mcp__apidog__apidog_set_context
  serviceName: [from .apidog.json]
  projectName: [from .apidog.json]
```

## Arguments
- `service-name` (optional): Override detected service name
- `project-name` (optional): Override detected project name (default: "backend")

## Example Output
```
✅ Apidog project initialized

Created: .apidog.json
{
  "serviceName": "my-awesome-api",
  "projectName": "backend"
}

Context set in Apidog.

Next steps:
- /api:push - Push existing endpoints to Apidog
- /api:design - Design new endpoints
```

## Tools Used
- Read, Glob: Project analysis
- Write: Create .apidog.json
- mcp__apidog__apidog_set_context: Set context in Apidog

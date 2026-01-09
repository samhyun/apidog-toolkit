---
name: cleanup
description: "Clean up API documentation - remove placeholders, unused schemas, or stale endpoints"
category: api
complexity: standard
mcp-servers: [apidog]
personas: []
---

# /api:cleanup - API Documentation Cleanup

## Triggers
- Placeholder endpoint cleanup requests
- "API 정리해줘", "placeholder 삭제해줘"
- Unused schema removal needs
- API documentation hygiene

## Usage
```
/api:cleanup [--placeholders] [--unused] [--stale] [--context service/project] [--dry-run]
```

## Options

| Option | Description |
|--------|-------------|
| `--placeholders` | Remove `/__docs__/...` placeholder endpoints |
| `--unused` | Remove schemas not referenced by any endpoint |
| `--stale` | Remove endpoints not in codebase (requires code scan) |
| `--context` | Limit cleanup to specific service/project |
| `--dry-run` | Preview what would be deleted without actually deleting |

## Behavioral Flow

### For `--placeholders`:
1. **List Placeholders**: Call `apidog_list_placeholders`
2. **Preview**: Show what will be deleted
3. **Confirm**: Ask user for confirmation
4. **Delete**: Call `apidog_delete_placeholders` with confirm

### For `--unused`:
1. **Get All Schemas**: Scan all registered schemas
2. **Get All Endpoints**: Check which schemas are referenced
3. **Find Orphans**: Identify unreferenced schemas
4. **Preview & Confirm**: Show and ask before deletion
5. **Delete**: Remove unused schemas

### For `--stale`:
1. **Load Context**: Read `.apidog.json`
2. **Scan Code**: Find all endpoints in codebase
3. **Compare**: Match against Apidog endpoints
4. **Find Stale**: Identify endpoints not in code
5. **Preview & Confirm**: Show and ask before deletion
6. **Delete**: Remove stale endpoints

## MCP Integration
- **Apidog MCP**: Cleanup operations
  - `apidog_list_placeholders`: Find placeholder endpoints
  - `apidog_delete_placeholders`: Remove placeholders (with confirm)
  - `apidog_delete_endpoints`: Remove specific endpoints
  - `apidog_list_endpoints`: Get all endpoints
  - `apidog_get_schema`: Check schema usage

## Examples

### Clean Placeholders (Most Common)
```
/api:cleanup --placeholders

# Output:
🔍 Found 3 placeholder endpoints:

1. GET /__docs__/Users
2. GET /__docs__/Auth
3. GET /__docs__/Orders

Delete these placeholders? [y/N]: y

✅ Deleted 3 placeholder endpoints
   Remaining endpoints: 15
```

### Dry Run Preview
```
/api:cleanup --placeholders --dry-run

# Output:
🔍 DRY RUN - No changes will be made

Would delete 3 placeholder endpoints:
- GET /__docs__/Users
- GET /__docs__/Auth
- GET /__docs__/Orders

Run without --dry-run to delete.
```

### Clean Unused Schemas
```
/api:cleanup --unused

# Output:
🔍 Analyzing schema references...

Found 2 unused schemas:
- OldUserRequest (not referenced)
- DeprecatedResponse (not referenced)

Delete these schemas? [y/N]: y

✅ Deleted 2 unused schemas
```

### Clean Stale Endpoints
```
/api:cleanup --stale --context my-app/backend

# Output:
🔍 Comparing Apidog specs with codebase...

Found 1 stale endpoint:
- DELETE /legacy/users (not in code)

Delete this endpoint? [y/N]: y

✅ Deleted 1 stale endpoint
```

### Full Cleanup
```
/api:cleanup --placeholders --unused

# Runs both cleanups sequentially
```

## Safety Features

1. **Always Preview First**: Shows what will be deleted before action
2. **Explicit Confirmation**: Requires user confirmation
3. **Dry Run Option**: `--dry-run` for safe preview
4. **Schema Preservation**: Delete operations preserve schemas by default
5. **Context Scoping**: `--context` limits scope to specific project

## Boundaries

**Will:**
- Remove placeholder endpoints (`/__docs__/...`)
- Remove unreferenced schemas
- Remove endpoints not found in codebase
- Preview changes before deletion
- Require explicit confirmation

**Will Not:**
- Delete without confirmation
- Remove endpoints that might still be needed
- Modify endpoint definitions
- Clean up code (only Apidog documentation)

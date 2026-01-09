# API Context

View or modify Apidog project context.

## Usage
```
/api:context                        # 현재 context 확인
/api:context [service] [project]    # context 수정
/api:context --clear                # context 삭제
```

## What This Does

### View Context (no arguments)
1. Read `.apidog.json` from project root
2. Display current serviceName and projectName
3. Show if file doesn't exist

### Set Context (with arguments)
1. Update `.apidog.json` with new values
2. Call `apidog_set_context` to sync with Apidog

### Clear Context (--clear)
1. Delete `.apidog.json` file
2. Clear context in Apidog

## Examples

### View Current Context
```
/api:context

# Output:
📁 Current Apidog Context

Service: my-service
Project: backend
File: .apidog.json ✓
```

### Update Context
```
/api:context new-service api

# Output:
✅ Context updated

Service: my-service → new-service
Project: backend → api
File: .apidog.json updated
```

### Clear Context
```
/api:context --clear

# Output:
🗑️ Context cleared

Deleted: .apidog.json
```

## Workflow

### View
```
READ: .apidog.json
→ Display serviceName, projectName
→ If not found: "No context. Run /api:init first"
```

### Set
```
READ: .apidog.json (if exists)
WRITE: .apidog.json with new values
CALL: apidog_set_context(serviceName, projectName)
→ Show before/after
```

### Clear
```
DELETE: .apidog.json
CALL: apidog_clear_context()
→ Confirm deletion
```

## Tools Used
- Read: Check current .apidog.json
- Write: Update .apidog.json
- Bash: Delete file (for --clear)
- mcp__apidog__apidog_set_context: Set context
- mcp__apidog__apidog_clear_context: Clear context

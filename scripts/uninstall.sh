#!/bin/bash

# ===========================================
# Apidog Toolkit - Uninstaller
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLKIT_DIR="$(dirname "$SCRIPT_DIR")"
CLAUDE_DIR="$HOME/.claude"

echo "==========================================="
echo "  Apidog Toolkit Uninstaller"
echo "==========================================="
echo ""

# 1. Stop MCP server if running
echo "[1/3] Stopping MCP server..."
"$TOOLKIT_DIR/mcp-server/scripts/stop.sh" 2>/dev/null || echo "  Server not running"

# 2. Remove command symlinks
echo "[2/3] Removing command links..."
if [ -L "$CLAUDE_DIR/commands/api" ]; then
    rm "$CLAUDE_DIR/commands/api"
    echo "  ✓ Commands removed"
else
    echo "  Commands not linked"
fi

# 3. Remove agent symlinks
echo "[3/3] Removing agent links..."
for agent in "$TOOLKIT_DIR/claude/agents/"*.md; do
    agent_name=$(basename "$agent")
    if [ -L "$CLAUDE_DIR/agents/$agent_name" ]; then
        rm "$CLAUDE_DIR/agents/$agent_name"
        echo "  ✓ Removed $agent_name"
    fi
done

echo ""
echo "==========================================="
echo "  Uninstallation Complete!"
echo "==========================================="
echo ""
echo "The toolkit directory is preserved at:"
echo "  $TOOLKIT_DIR"
echo ""
echo "To completely remove, run:"
echo "  rm -rf $TOOLKIT_DIR"
echo ""
echo "Don't forget to remove from ~/.claude/settings.json:"
echo '  "apidog": { ... }'
echo ""

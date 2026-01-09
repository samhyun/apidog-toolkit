#!/bin/bash

# ===========================================
# Apidog Toolkit - Updater
# ===========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLKIT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==========================================="
echo "  Apidog Toolkit Updater"
echo "==========================================="
echo ""

# 1. Pull latest changes
echo "[1/3] Pulling latest changes..."
cd "$TOOLKIT_DIR"
if [ -d ".git" ]; then
    git pull
    echo "  ✓ Updated from git"
else
    echo "  ⚠ Not a git repository, skipping pull"
fi

# 2. Rebuild MCP server
echo "[2/3] Rebuilding MCP server..."
cd "$TOOLKIT_DIR/mcp-server"
pnpm install
pnpm run build
echo "  ✓ MCP server rebuilt"

# 3. Restart MCP server
echo "[3/3] Restarting MCP server..."
"$TOOLKIT_DIR/mcp-server/scripts/restart.sh"

echo ""
echo "==========================================="
echo "  Update Complete!"
echo "==========================================="
echo ""
echo "Note: Symlinks are preserved, so commands and"
echo "agents are automatically updated."
echo ""

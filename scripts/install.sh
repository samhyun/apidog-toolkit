#!/bin/bash

# ===========================================
# Apidog Toolkit - Full Installation
# ===========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLKIT_DIR="$(dirname "$SCRIPT_DIR")"
CLAUDE_DIR="$HOME/.claude"

echo "==========================================="
echo "  Apidog Toolkit Installer"
echo "==========================================="
echo ""

# 1. Install MCP Server
echo "[1/4] Installing MCP Server..."
cd "$TOOLKIT_DIR/mcp-server"

if [ ! -d "node_modules" ]; then
    pnpm install
fi

if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
    pnpm run build
fi

echo "  ✓ MCP Server built"

# 2. Create Claude directories
echo "[2/4] Setting up Claude directories..."
mkdir -p "$CLAUDE_DIR/commands"
mkdir -p "$CLAUDE_DIR/agents"

# 3. Create symlinks for commands
echo "[3/4] Linking commands..."
if [ -L "$CLAUDE_DIR/commands/api" ]; then
    rm "$CLAUDE_DIR/commands/api"
elif [ -d "$CLAUDE_DIR/commands/api" ]; then
    echo "  ⚠ Backing up existing commands/api to commands/api.backup"
    mv "$CLAUDE_DIR/commands/api" "$CLAUDE_DIR/commands/api.backup"
fi
ln -sf "$TOOLKIT_DIR/claude/commands/api" "$CLAUDE_DIR/commands/api"
echo "  ✓ Commands linked"

# 4. Create symlinks for agents
echo "[4/4] Linking agents..."
for agent in "$TOOLKIT_DIR/claude/agents/"*.md; do
    agent_name=$(basename "$agent")
    if [ -L "$CLAUDE_DIR/agents/$agent_name" ]; then
        rm "$CLAUDE_DIR/agents/$agent_name"
    fi
    ln -sf "$agent" "$CLAUDE_DIR/agents/$agent_name"
done
echo "  ✓ Agents linked"

echo ""
echo "==========================================="
echo "  Installation Complete!"
echo "==========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure environment:"
echo "   cp $TOOLKIT_DIR/.env.example $TOOLKIT_DIR/mcp-server/.env"
echo "   # Edit .env and add APIDOG_ACCESS_TOKEN"
echo ""
echo "2. Add MCP server to Claude settings:"
echo "   Edit ~/.claude/settings.json:"
echo ""
echo '   {
     "mcpServers": {
       "apidog": {
         "type": "http",
         "url": "http://localhost:3333/mcp"
       }
     }
   }'
echo ""
echo "3. Start the MCP server:"
echo "   cd $TOOLKIT_DIR/mcp-server && pnpm start"
echo "   # Or use: $TOOLKIT_DIR/mcp-server/scripts/restart.sh"
echo ""
echo "4. Test in Claude:"
echo "   /api:help"
echo ""

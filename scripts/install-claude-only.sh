#!/bin/bash

# ===========================================
# Apidog Toolkit - Claude Config Only Installation
# ===========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLKIT_DIR="$(dirname "$SCRIPT_DIR")"
CLAUDE_DIR="$HOME/.claude"

echo "==========================================="
echo "  Apidog Claude Config Installer"
echo "==========================================="
echo ""
echo "Note: This assumes MCP server is already running."
echo ""

# 1. Create Claude directories
echo "[1/3] Setting up Claude directories..."
mkdir -p "$CLAUDE_DIR/commands"
mkdir -p "$CLAUDE_DIR/agents"

# 2. Create symlinks for commands
echo "[2/3] Linking commands..."
if [ -L "$CLAUDE_DIR/commands/api" ]; then
    rm "$CLAUDE_DIR/commands/api"
elif [ -d "$CLAUDE_DIR/commands/api" ]; then
    echo "  ⚠ Backing up existing commands/api to commands/api.backup"
    mv "$CLAUDE_DIR/commands/api" "$CLAUDE_DIR/commands/api.backup"
fi
ln -sf "$TOOLKIT_DIR/claude/commands/api" "$CLAUDE_DIR/commands/api"
echo "  ✓ Commands linked"

# 3. Create symlinks for agents
echo "[3/3] Linking agents..."
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
echo "  Claude Config Installation Complete!"
echo "==========================================="
echo ""
echo "Commands available:"
ls -1 "$TOOLKIT_DIR/claude/commands/api/" | sed 's/.md$//' | sed 's/^/  \/api:/'
echo ""
echo "Agents available:"
ls -1 "$TOOLKIT_DIR/claude/agents/" | sed 's/.md$//' | sed 's/^/  /'
echo ""

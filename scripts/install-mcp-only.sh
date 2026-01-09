#!/bin/bash

# ===========================================
# Apidog Toolkit - MCP Server Only Installation
# ===========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLKIT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==========================================="
echo "  Apidog MCP Server Installer"
echo "==========================================="
echo ""

cd "$TOOLKIT_DIR/mcp-server"

echo "[1/2] Installing dependencies..."
pnpm install

echo "[2/2] Building..."
pnpm run build

echo ""
echo "==========================================="
echo "  MCP Server Installation Complete!"
echo "==========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure environment:"
echo "   cp $TOOLKIT_DIR/.env.example $TOOLKIT_DIR/mcp-server/.env"
echo "   # Edit .env and add APIDOG_ACCESS_TOKEN"
echo ""
echo "2. Start the server:"
echo "   cd $TOOLKIT_DIR/mcp-server && pnpm start"
echo ""
echo "3. Server will be available at:"
echo "   http://localhost:3333/mcp"
echo ""

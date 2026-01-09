#!/bin/bash

# ===========================================
# Apidog MCP Server 시작 스크립트
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT="${PORT:-3333}"

cd "$PROJECT_DIR"

echo "Apidog MCP Server 시작 중..."

# 이미 실행 중인지 확인
PID=$(lsof -ti:$PORT 2>/dev/null || true)
if [ -n "$PID" ]; then
    echo "  ⚠ 이미 실행 중 (PID: $PID, 포트: $PORT)"
    echo "  종료하려면: ./scripts/stop.sh"
    exit 1
fi

# 백그라운드로 시작
nohup pnpm run start > /tmp/apidog-mcp.log 2>&1 &
NEW_PID=$!
sleep 2

# 상태 확인
if curl -s "http://localhost:$PORT/mcp" > /dev/null 2>&1; then
    echo "  ✓ 서버 시작됨 (PID: $NEW_PID, 포트: $PORT)"
    echo "  로그: tail -f /tmp/apidog-mcp.log"
else
    echo "  ✗ 서버 시작 실패"
    tail -10 /tmp/apidog-mcp.log
    exit 1
fi

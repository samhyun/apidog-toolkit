#!/bin/bash

# ===========================================
# Apidog MCP Server 종료 스크립트
# ===========================================

PORT="${PORT:-3333}"

echo "Apidog MCP Server 종료 중..."

PID=$(lsof -ti:$PORT 2>/dev/null || true)

if [ -n "$PID" ]; then
    echo "  포트 $PORT에서 실행 중인 프로세스: PID $PID"
    kill -9 $PID 2>/dev/null || true
    echo "  ✓ 서버 종료됨"
else
    echo "  실행 중인 서버 없음"
fi

#!/bin/bash

# ===========================================
# Apidog MCP Server 상태 확인 스크립트
# ===========================================

PORT="${PORT:-3333}"

echo "=========================================="
echo "  Apidog MCP Server 상태"
echo "=========================================="

# 프로세스 확인
PID=$(lsof -ti:$PORT 2>/dev/null || true)

if [ -n "$PID" ]; then
    echo ""
    echo "상태: 🟢 실행 중"
    echo "  - PID: $PID"
    echo "  - 포트: $PORT"

    # 헬스체크
    HEALTH=$(curl -s "http://localhost:$PORT/mcp" 2>/dev/null || echo "failed")
    if [ "$HEALTH" != "failed" ]; then
        echo "  - 헬스: OK"
        echo ""
        echo "응답:"
        echo "$HEALTH" | jq . 2>/dev/null || echo "$HEALTH"
    else
        echo "  - 헬스: 응답 없음"
    fi
else
    echo ""
    echo "상태: 🔴 중지됨"
    echo ""
    echo "시작하려면: ./scripts/start.sh"
fi

echo ""
echo "=========================================="

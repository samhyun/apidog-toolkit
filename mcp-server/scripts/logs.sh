#!/bin/bash

# ===========================================
# Apidog MCP Server 로그 확인 스크립트
# ===========================================

LOG_FILE="/tmp/apidog-mcp.log"

if [ -f "$LOG_FILE" ]; then
    echo "Apidog MCP Server 로그 (Ctrl+C로 종료)"
    echo "=========================================="
    tail -f "$LOG_FILE"
else
    echo "로그 파일이 없습니다: $LOG_FILE"
    echo "서버를 먼저 시작하세요: ./scripts/start.sh"
fi

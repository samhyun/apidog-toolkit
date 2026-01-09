#!/bin/bash

# ===========================================
# Apidog MCP Server 재시작 스크립트
# ===========================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT="${PORT:-3333}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Apidog MCP Server 재시작${NC}"
echo -e "${BLUE}========================================${NC}"

cd "$PROJECT_DIR"

# 1. 기존 프로세스 종료
echo -e "\n${YELLOW}[1/4] 기존 서버 프로세스 종료 중...${NC}"

# 포트로 프로세스 찾기
PID=$(lsof -ti:$PORT 2>/dev/null || true)

if [ -n "$PID" ]; then
    echo -e "  포트 $PORT에서 실행 중인 프로세스 발견: PID $PID"
    kill -9 $PID 2>/dev/null || true
    sleep 1
    echo -e "  ${GREEN}✓ 프로세스 종료됨${NC}"
else
    echo -e "  ${GREEN}✓ 실행 중인 서버 없음${NC}"
fi

# 2. 빌드
echo -e "\n${YELLOW}[2/4] TypeScript 빌드 중...${NC}"
pnpm run build
echo -e "  ${GREEN}✓ 빌드 완료${NC}"

# 3. 서버 시작 (백그라운드)
echo -e "\n${YELLOW}[3/4] 서버 시작 중...${NC}"
nohup pnpm run start > /tmp/apidog-mcp.log 2>&1 &
NEW_PID=$!
sleep 2

# 4. 상태 확인
echo -e "\n${YELLOW}[4/4] 서버 상태 확인...${NC}"

# 헬스체크
if curl -s "http://localhost:$PORT/mcp" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ 서버가 정상적으로 시작됨${NC}"
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  재시작 완료!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n서버 정보:"
    echo -e "  - PID: $NEW_PID"
    echo -e "  - 포트: $PORT"
    echo -e "  - 헬스체크: http://localhost:$PORT/mcp"
    echo -e "  - 로그: tail -f /tmp/apidog-mcp.log"
else
    echo -e "  ${RED}✗ 서버 시작 실패${NC}"
    echo -e "\n로그 확인:"
    tail -20 /tmp/apidog-mcp.log
    exit 1
fi

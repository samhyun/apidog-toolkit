# Apidog Toolkit for Claude Code

Apidog API 문서를 Claude Code에서 직접 관리할 수 있는 통합 도구입니다.

## 기능

- **MCP 서버**: 19개의 Apidog 관리 도구 제공
- **Claude 커맨드**: `/api:*` 10개 커맨드
- **Claude 에이전트**: 5개 전문 에이전트

## 빠른 시작

### 1. 설치

```bash
git clone https://github.com/samhyunkim/apidog-toolkit ~/toolkits/apidog-toolkit
cd ~/toolkits/apidog-toolkit
./scripts/install.sh
```

### 2. 환경 설정

```bash
cp .env.example mcp-server/.env
# .env 파일을 열고 APIDOG_ACCESS_TOKEN 설정
```

### 3. MCP 서버 시작

```bash
cd mcp-server && pnpm start
# 또는
./mcp-server/scripts/restart.sh
```

### 4. Claude 설정

`~/.claude/settings.json`에 추가:

```json
{
  "mcpServers": {
    "apidog": {
      "type": "http",
      "url": "http://localhost:3333/mcp"
    }
  }
}
```

### 5. 사용

```bash
claude
/api:help
```

## 커맨드 목록

| 커맨드 | 설명 |
|--------|------|
| `/api:init` | 프로젝트 컨텍스트 초기화 |
| `/api:context` | 컨텍스트 조회/수정 |
| `/api:design` | 새 API 설계 (API-first) |
| `/api:push` | 코드에서 API 추출 (Code-first) |
| `/api:update` | 기존 API 수정 |
| `/api:docs` | API 문서 조회 |
| `/api:diff` | 코드 vs 스펙 비교 |
| `/api:cleanup` | placeholder, 미사용 정리 |
| `/api:implement` | 스펙 기반 백엔드 구현 |
| `/api:consume` | 클라이언트 코드 생성 |

## 에이전트 목록

| 에이전트 | 용도 | 모델 |
|----------|------|------|
| `api-designer` | API 설계 | Sonnet |
| `api-pusher` | 코드→Apidog 푸시 | Sonnet |
| `api-worker` | 백엔드 구현 | Haiku |
| `api-consumer` | 클라이언트 생성 | Haiku |
| `apidog-api-manager` | 전체 API 관리 | Haiku |

## MCP 도구 (19개)

### 읽기 도구
- `apidog_search` - 엔드포인트 검색
- `apidog_get_endpoint` - 엔드포인트 상세 조회
- `apidog_get_schema` - 스키마 조회
- `apidog_list_endpoints` - 전체 목록
- `apidog_project_info` - 프로젝트 정보
- `apidog_refresh` - 캐시 갱신

### 컨텍스트 도구
- `apidog_set_context` - 컨텍스트 설정
- `apidog_get_context` - 컨텍스트 조회
- `apidog_clear_context` - 컨텍스트 삭제

### 쓰기 도구
- `apidog_add_endpoint` - 엔드포인트 추가
- `apidog_add_schema` - 스키마 추가
- `apidog_import_url` - URL에서 가져오기
- `apidog_import_spec` - OpenAPI 스펙 가져오기

### 수정/삭제 도구
- `apidog_update_endpoint` - 엔드포인트 수정
- `apidog_sync_spec` - 스펙 동기화
- `apidog_clear_project` - 전체 삭제
- `apidog_list_placeholders` - placeholder 목록
- `apidog_delete_endpoints` - 엔드포인트 삭제
- `apidog_delete_placeholders` - placeholder 삭제

## 디렉토리 구조

```
apidog-toolkit/
├── mcp-server/           # MCP 서버
│   ├── src/              # 소스 코드
│   ├── dist/             # 빌드 결과
│   ├── scripts/          # 서버 관리 스크립트
│   └── package.json
├── claude/               # Claude Code 설정
│   ├── commands/api/     # /api:* 커맨드들
│   └── agents/           # 에이전트들
├── scripts/              # 설치 스크립트
│   ├── install.sh        # 전체 설치
│   ├── install-mcp-only.sh
│   ├── install-claude-only.sh
│   ├── uninstall.sh
│   └── update.sh
└── README.md
```

## 설치 옵션

```bash
# 전체 설치 (권장)
./scripts/install.sh

# MCP 서버만 (다른 AI 도구에서 사용)
./scripts/install-mcp-only.sh

# Claude 설정만 (이미 MCP 있으면)
./scripts/install-claude-only.sh
```

## 업데이트

```bash
cd ~/toolkits/apidog-toolkit
git pull
./scripts/update.sh
```

## 제거

```bash
./scripts/uninstall.sh
```

## 요구사항

- Node.js 18+
- pnpm
- Claude Code CLI
- Apidog 계정 및 Access Token

## 라이선스

MIT

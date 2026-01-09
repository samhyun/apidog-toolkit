import { listTools, callTool } from "./tools";

const SERVER_INFO = {
  name: "apidog-mcp-server",
  version: "1.0.0"
};

const CAPABILITIES = {
  tools: {},
  resources: {}
};

export async function handleRpc(payload: any) {
  const { jsonrpc, id, method, params } = payload;

  if (jsonrpc !== "2.0") {
    return error(id, -32600, "Invalid JSON-RPC version");
  }

  try {
    switch (method) {
      // MCP 초기화
      case "initialize":
        return ok(id, {
          protocolVersion: "2024-11-05",
          capabilities: CAPABILITIES,
          serverInfo: SERVER_INFO
        });

      case "initialized":
        // 클라이언트가 초기화 완료를 알림 - 응답 없음
        return ok(id, {});

      // 도구 관련
      case "tools/list":
        return ok(id, listTools());

      case "tools/call":
        return ok(id, await callTool(params));

      // 리소스 관련 (현재는 빈 목록)
      case "resources/list":
        return ok(id, { resources: [] });

      case "resources/read":
        return error(id, -32601, "Resource not found");

      case "resources/templates/list":
        return ok(id, { resourceTemplates: [] });

      // 프롬프트 관련 (현재는 빈 목록)
      case "prompts/list":
        return ok(id, { prompts: [] });

      case "prompts/get":
        return error(id, -32601, "Prompt not found");

      // 로깅
      case "logging/setLevel":
        return ok(id, {});

      // ping/pong
      case "ping":
        return ok(id, {});

      // 완료 (자동 완성 지원 - 선택적)
      case "completion/complete":
        return ok(id, { completion: { values: [] } });

      default:
        return error(id, -32601, `Method not found: ${method}`);
    }
  } catch (e: any) {
    console.error(`[MCP Error] ${method}:`, e.message);
    return error(id, -32000, e.message);
  }
}

const ok = (id: string | number | null, result: any) => ({
  jsonrpc: "2.0",
  id,
  result
});

const error = (id: string | number | null, code: number, message: string) => ({
  jsonrpc: "2.0",
  id,
  error: { code, message }
});

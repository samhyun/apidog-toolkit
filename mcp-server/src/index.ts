import "dotenv/config";
import express from "express";
import { json } from "express";
import { handleRpc } from "./rpc/router";
import { authMiddleware } from "./security/auth";
import crypto from "crypto";

const app = express();
app.use(json());
app.use(express.urlencoded({ extended: true })); // OAuth token 요청용

// ============================================
// OAuth 2.0 엔드포인트 (Claude Code 호환)
// ============================================

// OAuth 메타데이터
app.get("/.well-known/oauth-authorization-server", (_req, res) => {
  const baseUrl = `http://localhost:${process.env.PORT || 3333}`;
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    registration_endpoint: `${baseUrl}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"]
  });
});

// 클라이언트 등록 (동적)
const registeredClients = new Map<string, any>();

app.post("/register", (req, res) => {
  const clientId = crypto.randomUUID();
  const clientInfo = {
    client_id: clientId,
    client_name: req.body.client_name || "Claude Code",
    redirect_uris: req.body.redirect_uris || [],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none"
  };
  registeredClients.set(clientId, clientInfo);
  res.status(201).json(clientInfo);
});

// 인증 (자동 승인)
const authCodes = new Map<string, { clientId: string; redirectUri: string; codeChallenge?: string }>();

app.get("/authorize", (req, res) => {
  const { client_id, redirect_uri, state, code_challenge } = req.query;
  const code = crypto.randomUUID();

  authCodes.set(code, {
    clientId: client_id as string,
    redirectUri: redirect_uri as string,
    codeChallenge: code_challenge as string
  });

  const redirectUrl = new URL(redirect_uri as string);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state as string);

  res.redirect(redirectUrl.toString());
});

// 토큰 발급
app.post("/token", (req, res) => {
  const { grant_type, code, refresh_token } = req.body;

  if (grant_type === "authorization_code" && code) {
    const authInfo = authCodes.get(code);
    if (!authInfo) {
      return res.status(400).json({ error: "invalid_grant" });
    }
    authCodes.delete(code);

    const accessToken = crypto.randomUUID();
    const newRefreshToken = crypto.randomUUID();

    return res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: newRefreshToken
    });
  }

  if (grant_type === "refresh_token" && refresh_token) {
    const accessToken = crypto.randomUUID();
    const newRefreshToken = crypto.randomUUID();

    return res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: newRefreshToken
    });
  }

  res.status(400).json({ error: "unsupported_grant_type" });
});

// ============================================
// MCP 엔드포인트
// ============================================

// Health check (인증 없음)
app.get("/mcp", (_req, res) => {
  res.status(200).json({
    status: "ok",
    server: "apidog-mcp-server",
    version: "1.0.0"
  });
});

app.head("/mcp", (_req, res) => {
  res.status(200).end();
});

// MCP RPC endpoint (인증 적용)
app.post("/mcp", authMiddleware, async (req, res) => {
  try {
    const response = await handleRpc(req.body);
    res.json(response);
  } catch (error: any) {
    console.error("[MCP] Unhandled error:", error);
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: "Internal server error"
      }
    });
  }
});

// SSE endpoint for streaming (선택적)
app.get("/mcp/sse", authMiddleware, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 연결 유지
  const keepAlive = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`[MCP] Apidog MCP Server listening on port ${port}`);
  console.log(`[MCP] Health check: http://localhost:${port}/mcp`);
  console.log(`[MCP] RPC endpoint: POST http://localhost:${port}/mcp`);

  // 설정 확인
  const hasToken = !!process.env.APIDOG_ACCESS_TOKEN || !!process.env.APIDOG_API_KEY;
  const hasProjectId = !!process.env.APIDOG_PROJECT_ID;
  const hasOasUrl = !!process.env.APIDOG_OAS_URL;

  if (hasOasUrl) {
    console.log(`[MCP] Mode: OpenAPI Spec URL`);
  } else if (hasToken && hasProjectId) {
    console.log(`[MCP] Mode: Apidog Project`);
  } else {
    console.warn(`[MCP] Warning: Missing configuration. Set APIDOG_ACCESS_TOKEN + APIDOG_PROJECT_ID or APIDOG_OAS_URL`);
  }
});

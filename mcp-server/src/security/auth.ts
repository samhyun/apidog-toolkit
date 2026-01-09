import { Request, Response, NextFunction } from "express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const expected = process.env.MCP_API_KEY;

  // MCP_API_KEY가 설정되지 않은 경우 인증 bypass (개발 모드)
  if (!expected) {
    return next();
  }

  // Bearer token 또는 x-api-key 헤더 확인
  const authHeader = req.header("Authorization");
  const apiKeyHeader = req.header("x-api-key");

  let providedKey: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7);
  } else if (apiKeyHeader) {
    providedKey = apiKeyHeader;
  }

  if (providedKey !== expected) {
    return res.status(401).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32001,
        message: "Unauthorized: Invalid or missing API key"
      }
    });
  }

  next();
}

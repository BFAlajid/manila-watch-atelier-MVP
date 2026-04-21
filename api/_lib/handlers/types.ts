// Pure, framework-agnostic handler contract.
// Wrappers (dev-server Express route, api/*.ts Vercel function) translate req/res
// into HandlerContext and back from HandlerResult. Handlers never touch req/res.

export interface HandlerContext {
  method: string; // UPPERCASED by the wrapper
  query: Record<string, string | string[] | undefined>;
  body: unknown; // already JSON-parsed (or multipart-parsed for uploads)
  headers: Record<string, string | undefined>; // keys lowercased by the wrapper
  auth: { authenticated: boolean; username?: string }; // pre-verified by wrapper
  clientIP: string; // pre-resolved by wrapper
}

export interface HandlerResult {
  status: number; // 200, 201, 400, 401, 404, 409, 429, 500, 503 ...
  body?: unknown; // JSON-serialisable; undefined → empty body
  headers?: Record<string, string>; // rare per-response overrides
}

export type Handler = (ctx: HandlerContext) => Promise<HandlerResult>;

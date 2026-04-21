// POST /api/chat — SSE-streamed chat via streamChat. Bypasses the
// standard adapter because the response is a live stream, not a JSON body.
import { setCorsHeaders } from './_lib/cors.js';
import { toCtx } from './_lib/handlers/adapter.js';
import { streamChat } from './_lib/handlers/chat.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  await streamChat(toCtx(req), res);
}

// Shared helpers for the /api functions. Files starting with "_" are not routes on Vercel.
export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

export function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(obj));
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

// Returns false (and answers the request) when the call must not go on.
export function guard(req, res) {
  if (req.method !== 'POST') { send(res, 405, { error: 'method' }); return false; }
  if (!process.env.ANTHROPIC_API_KEY) { send(res, 503, { error: 'no_key' }); return false; }
  const code = process.env.CLASS_CODE;
  if (code && req.headers['x-class-code'] !== code) { send(res, 401, { error: 'bad_code' }); return false; }
  return true;
}

export async function claude(content, maxTokens) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens || 2000, messages: [{ role: 'user', content }] })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const type = j && j.error && j.error.type;
    const err = new Error((j && j.error && j.error.message) || ('anthropic ' + r.status));
    err.code = r.status === 429 || type === 'rate_limit_error' ? 'rate_limited'
      : r.status === 529 || type === 'overloaded_error' ? 'busy'
      : (r.status === 400 && /image/i.test(err.message)) ? 'image_rejected' : 'failed';
    throw err;
  }
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

export function fail(res, e) {
  console.error(e && e.message);
  const c = (e && e.code) || 'failed';
  send(res, c === 'rate_limited' || c === 'busy' ? 429 : c === 'image_rejected' ? 422 : 502, { error: c });
}

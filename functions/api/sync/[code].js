const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function normalizeCode(raw) {
  const code = String(raw || '').trim().toLowerCase();
  if (!/^[a-z0-9]{6,16}$/.test(code)) return null;
  return code;
}

function kvKey(code) {
  return `board:${code}`;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(context) {
  const code = normalizeCode(context.params.code);
  if (!code) return json({ error: 'invalid_code', message: '同步码无效' }, 400);
  const kv = context.env.WEDDING_BOARD_SYNC;
  if (!kv) return json({ error: 'kv_unavailable', message: '同步服务未配置' }, 503);
  const raw = await kv.get(kvKey(code));
  if (!raw) return json({ error: 'not_found', message: '未找到该同步码' }, 404);
  try {
    return json(JSON.parse(raw));
  } catch (e) {
    return json({ error: 'corrupt', message: '同步数据损坏' }, 500);
  }
}

export async function onRequestPut(context) {
  const code = normalizeCode(context.params.code);
  if (!code) return json({ error: 'invalid_code', message: '同步码无效' }, 400);
  const kv = context.env.WEDDING_BOARD_SYNC;
  if (!kv) return json({ error: 'kv_unavailable', message: '同步服务未配置' }, 503);

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json({ error: 'bad_json', message: '请求体须为 JSON' }, 400);
  }
  if (!body || typeof body !== 'object') {
    return json({ error: 'bad_payload', message: '同步载荷无效' }, 400);
  }

  const updatedAt = body.updatedAt || new Date().toISOString();
  const existingRaw = await kv.get(kvKey(code));
  if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw);
      const remoteTs = Date.parse(existing.updatedAt || 0) || 0;
      const localTs = Date.parse(updatedAt) || 0;
      if (remoteTs > localTs) {
        return json({
          error: 'stale',
          message: '云端更新，已拒绝覆盖（最后写入优先）',
          remoteUpdatedAt: existing.updatedAt,
        }, 409);
      }
    } catch (e) {
      /* overwrite corrupt */
    }
  }

  const payload = {
    ...body,
    version: body.version || 5,
    syncVersion: 1,
    updatedAt,
    code,
  };
  const text = JSON.stringify(payload);
  if (text.length > 900000) {
    return json({ error: 'too_large', message: '同步数据过大' }, 413);
  }

  await kv.put(kvKey(code), text, { expirationTtl: 60 * 60 * 24 * 90 });
  return json({ ok: true, code, updatedAt, bytes: text.length });
}

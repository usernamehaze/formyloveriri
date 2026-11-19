// 🔗 Riri & Me sync server (Cloudflare Worker + D1).
// Paste this whole file into your Worker, and add a D1 database binding named DB.
// Data is stored per secret pair code ("room"). Tables are created automatically.

const KINDS = ['letters', 'photos', 'voice'];
const MAX_BODY = 1_500_000;      // ~1.5 MB per photo / voice note
const PAGE = 40;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

let ready = false;
async function init(db){
  if (ready) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS items (
      room TEXT NOT NULL, id TEXT NOT NULL, kind TEXT NOT NULL,
      ts INTEGER NOT NULL, updated INTEGER NOT NULL, data TEXT NOT NULL,
      PRIMARY KEY (room, id))`),
    db.prepare(`CREATE INDEX IF NOT EXISTS items_room_updated ON items (room, updated)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS state (room TEXT PRIMARY KEY, ts INTEGER NOT NULL, data TEXT NOT NULL)`),
  ]);
  ready = true;
}

async function readBody(req){
  const len = +(req.headers.get('content-length') || 0);
  if (len > MAX_BODY) throw Object.assign(new Error('too big'), { status: 413 });
  const text = await req.text();
  if (text.length > MAX_BODY) throw Object.assign(new Error('too big'), { status: 413 });
  return JSON.parse(text);
}

export default {
  async fetch(req, env){
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (url.pathname === '/' ) return json({ ok: true, app: 'riri-and-me sync', db: !!env.DB });
    const m = url.pathname.match(/^\/api\/([a-z0-9-]{16,64})\/(sync|items|state)$/);
    if (!m) return json({ error: 'not found' }, 404);
    if (!env.DB) return json({ error: 'no database: add a D1 binding named DB to this Worker' }, 500);
    const [, room, what] = m, db = env.DB;
    try {
      await init(db);

      // GET /api/<room>/sync?since=<ms>&st=<state ts>&wait=<seconds>
      //   → new/changed items + shared pet state.
      //   With wait, the request stays open until something changes (realtime), up to `wait` seconds.
      if (what === 'sync' && req.method === 'GET'){
        const since = Math.max(0, +url.searchParams.get('since') || 0);
        const knownSt = url.searchParams.has('st') ? +url.searchParams.get('st') : null;
        const wait = Math.min(25, Math.max(0, +url.searchParams.get('wait') || 0)) * 1000;
        const start = Date.now();
        for (;;){
          const { results } = await db.prepare(
            'SELECT id, kind, updated, data FROM items WHERE room = ? AND updated > ? ORDER BY updated ASC LIMIT ?'
          ).bind(room, since, PAGE).all();
          const st = await db.prepare('SELECT ts, data FROM state WHERE room = ?').bind(room).first();
          const stateChanged = knownSt === null || (st ? st.ts : 0) !== knownSt;
          if (results.length || stateChanged || Date.now() - start >= wait){
            return json({
              items: results.map(r => ({ id: r.id, kind: r.kind, updated: r.updated, item: JSON.parse(r.data) })),
              more: results.length === PAGE,
              state: st ? JSON.parse(st.data) : null,
              now: Date.now(), live: true,
            });
          }
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      // POST /api/<room>/items  { kind, item }  →  add a letter / photo / voice note
      if (what === 'items' && req.method === 'POST'){
        const { kind, item } = await readBody(req);
        if (!KINDS.includes(kind) || !item || typeof item !== 'object' || !item.id) return json({ error: 'bad item' }, 400);
        const id = String(item.id).slice(0, 64);
        await db.prepare(
          `INSERT INTO items (room, id, kind, ts, updated, data) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (room, id) DO UPDATE SET data = excluded.data, updated = excluded.updated, ts = excluded.ts`
        ).bind(room, id, kind, Math.floor(+item.ts || Date.now()), Date.now(), JSON.stringify({ ...item, id })).run();
        return json({ ok: true, id });
      }

      // PUT /api/<room>/state  { ...pet stats, ts }  →  only replaces older state
      if (what === 'state' && req.method === 'PUT'){
        const st = await readBody(req);
        if (!st || typeof st !== 'object') return json({ error: 'bad state' }, 400);
        await db.prepare(
          `INSERT INTO state (room, ts, data) VALUES (?, ?, ?)
           ON CONFLICT (room) DO UPDATE SET ts = excluded.ts, data = excluded.data WHERE excluded.ts > state.ts`
        ).bind(room, Math.floor(+st.ts || 0), JSON.stringify(st)).run();
        return json({ ok: true });
      }

      return json({ error: 'method not allowed' }, 405);
    } catch (e){
      return json({ error: e.status === 413 ? 'that file is too big' : (e instanceof SyntaxError ? 'bad json' : 'server error: ' + e.message) }, e.status || (e instanceof SyntaxError ? 400 : 500));
    }
  },
};

// 🔗 Sync between your phones through your Cloudflare Worker (see worker/worker.js).
// Everything is stored under your secret pair code, so only phones with the code can see it.
// Each phone checks for new things every few seconds while the game is open.
const BASE = String(window.SYNC_URL || '').trim().replace(/\/+$/, '');
const S = window.Sync = { configured: !!BASE, status: 'off', error: '', room: null, add: null, saveState: null, connect: null, disconnect: null };
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const setStatus = (st, err = '') => { S.status = st; S.error = err; emit('sync:status', { status: st, error: err }); };
const KINDS = ['letters', 'photos', 'voice'];

let gen = 0, timer = null, cursor = 0, first = true, lastStateTs = -1;
let items = {}, mine = new Set();
const reset = () => { cursor = 0; first = true; lastStateTs = -1; items = { letters: new Map(), photos: new Map(), voice: new Map() }; mine = new Set(); };
reset();

async function api(path, opts){
  let r;
  try { r = await fetch(`${BASE}/api/${S.room}${path}`, opts); }
  catch(e){ throw new Error('can\'t reach the sync server'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `sync server error (${r.status})`);
  return j;
}
const listOf = k => [...items[k].values()].sort((a, b) => (b.ts || 0) - (a.ts || 0));
const strip = it => { const o = Object.assign({}, it); delete o.__u; return o; };

async function poll(g){
  if (g !== gen) return;
  clearTimeout(timer);
  try {
    const added = { letters: [], photos: [], voice: [] }, changed = new Set();
    let since = Math.max(0, cursor - 3000), more = true, state = null;
    while (more){
      const j = await api(`/sync?since=${since}`);
      if (g !== gen) return;
      state = j.state;
      for (const r of j.items){
        const m = items[r.kind]; if (!m) continue;
        const old = m.get(r.id);
        if (!old && !first && !mine.has(r.id)) added[r.kind].push(Object.assign({}, r.item, { id: r.id }));
        if (!old || old.__u !== r.updated){ m.set(r.id, Object.assign({}, r.item, { id: r.id, __u: r.updated })); changed.add(r.kind); }
        cursor = Math.max(cursor, r.updated); since = r.updated;
      }
      more = j.more;
    }
    if (first) KINDS.forEach(k => changed.add(k));
    changed.forEach(k => emit('sync:items', { kind: k, items: listOf(k).map(strip), added: added[k] }));
    const sts = state ? state.ts : 0;
    if (first || sts !== lastStateTs){ lastStateTs = sts; emit('sync:state', state); }
    first = false;
    if (S.status !== 'on') setStatus('on');
  } catch(e){
    if (g !== gen) return;
    setStatus('error', e.message);
  }
  timer = setTimeout(() => poll(g), document.hidden ? 20000 : 4000);
}

S.connect = room => {
  room = String(room || '').trim().toLowerCase();
  if (!/^[a-z0-9-]{16,64}$/.test(room)) { setStatus('error', 'pair code must be 16+ letters, numbers or dashes'); return; }
  S.disconnect(true);
  reset(); S.room = room; gen++;
  try { localStorage.setItem('riri-room', room); } catch(e){}
  S.add = async (kind, item) => {
    const it = Object.assign({}, item); delete it.local;
    mine.add(it.id);
    items[kind].set(it.id, Object.assign({}, it, { __u: 0 }));      // show it right away
    await api('/items', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ kind, item: it }) });
  };
  S.saveState = st => api('/state', { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(st) });
  setStatus('connecting');
  poll(gen);
};
S.disconnect = keepRoom => {
  gen++; clearTimeout(timer);
  S.add = null; S.saveState = null;
  if (!keepRoom){ S.room = null; try { localStorage.removeItem('riri-room'); } catch(e){} setStatus('off'); }
};
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.room && S.add) poll(gen); });

if (!S.configured) setStatus('unconfigured');
else {
  let saved = null;
  try { saved = localStorage.getItem('riri-room'); } catch(e){}
  const join = (location.hash.match(/join=([a-z0-9-]{16,64})/i) || [])[1];
  if (join){ saved = join.toLowerCase(); history.replaceState(null, '', location.pathname + location.search); }
  if (saved) S.connect(saved); else setStatus('off');
}
emit('sync:ready', {});

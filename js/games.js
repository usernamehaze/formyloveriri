// 🎮 Two mini games: "Cherry Dash" (3-lane runner) and "Heart Quest" (side-scrolling platformer).
// All art is drawn in code. The host page provides window.GameHost (who's playing, sounds, rewards).
(function(){
'use strict';
const W = 180, H = 320, r = Math.round;
const $ = id => document.getElementById(id);
const host = () => window.GameHost || { who: () => 'riri', name: id => id, nick: () => 'love', boop(){}, onFinish(){} };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
const fetchStore = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? d; } catch(e){ return d; } };

// ---------- mini sprites ----------
const PAL = {
  riri: { h:'#5a3221', s:'#f7c8a7', p:'#f39cb3', r:'#d8384d', w:'#ffffff', k:'#1f1c24', e:'#2b1a14', c:'#ffffff', b:'#f08a9a', m:'#6b2a2a' },
  me:   { b:'#1d1b23', s:'#ecb791', g:'#a2a8b8', e:'#2b1a14', t:'#27252c', x:'#cfc7b8', j:'#6283ad', k:'#222027', w:'#f2f2f2', a:'#55515c', m:'#6b2a2a', o:'#2f2c34' },
};
const SIDE = {
  riri: { body: [
    '....hhhhhhh.....','...hhhhhhhhhh...','..hhhhhhhhhhhh..','..hhhhhhhchhhh..','..hhhhhhhhhhhs..',
    '.hhhhhhhhsssss..','.hhhhhhhssesss..','.hhhhhhhsssssb..','.hhhhhhhssssms..','.hhhhhhhhssss...',
    '.hhhhhhhh.ss....','..hhhhhwppppw...','..hhhhppppppss..','...hh.pprppp.s..','......ppppppp...',
    '.....ppprppppp..','.....pppppprpp..','....pppppppppp..','....wwwwwwwwwww.' ],
    stand: ['......ss..ss....','......ss..ss....','......kk..kk....','......kk..kk....','.....kkk..kkkk..'],
    run:   ['.....ss...ss....','....ss.....ss...','...kk.......kk..','..kkk.......kkk.','................'],
    jump:  ['.....ss..ss.....','....kk...kk.....','...kkk..kkk.....','................','................'] },
  me: { body: [
    '....bbbbbbb.....','...bbbbbbbbbb...','..bbbbbbbbbbbb..','..bbbbbbbbbbbb..','..bbbbbbbbbbbb..',
    '..bbbbbbbbsssb..','..bbbbbbbgggggg.','..bbbbbbbgsesgs.','..bbbbbbbgggggg.','..bbbbbbbsssss..',
    '..bbbbbbbssmms..','...bbbbb..sss...','....ttttttttt...','...tttttttttsss.','...ttaxxxxtt.ss.',
    '...tttatttttt...','...ttttatttt....','...ttttttatt....','...jjjjjjjjjj...','...jjjjjjjjjj...' ],
    stand: ['....jjjj.jjjj...','....jjjj.jjjj...','....jjjj.jjjj...','....jjjj.jjjj...','...kkkkk.kkkkk..','...wwwww.wwwww..'],
    run:   ['...jjjj...jjjj..','..jjjj.....jjjj.','.jjjj.......jjj.','.jjj.........jj.','kkkk........kkkk','wwww........wwww'],
    jump:  ['....jjjjjjjjj...','...jjjj..jjjj...','..jjjj..jjjj....','..kkkk..kkkk....','..wwww..wwww....','................'] },
};
const BACK = {
  riri: { legRow: 18, rows: [
    '....hhhhhhhh....','...hhhhhhhhhh...','..hhhhhhhhhhhh..','..hhhhhhhhhchh..','..hhhhhhhhhhhh..','..hhhhhhhhhhhh..',
    '.shhhhhhhhhhhhs.','.shhhhhhhhhhhhs.','.shhhhhhhhhhhhs.','.shhhhhhhhhhhhs.','.swhhhhhhhhhhws.','.sphhhhhhhhhhps.',
    '..pphhhhhhhhpp..','..ppphhhhhhppp..','..pprpppppprpp..','.pppppppppppppp.','.ppprpppppprppp.','.wwwwwwwwwwwwww.',
    '....ss....ss....','....ss....ss....','....kk....kk....','....kk....kk....','...kkk....kkk...','...kkk....kkk...' ] },
  me: { legRow: 19, rows: [
    '....bbbbbbbb....','...bbbbbbbbbb...','..bbbbbbbbbbbb..','..bbbbbbbbbbbb..','..bbbbbbbbbbbb..','..bbbbbbbbbbbb..',
    '..sbbbbbbbbbbs..','...bbbbbbbbbb...','....bbbbbbbb....','.....ssssss.....','..sttttttttttas.','.sstttttttttass.',
    '.ss.ttttttatt.ss','.ss.tttttattt.ss','.s..ttttatttt..s','....tttattttt...','...ooajjjjjjj...','...oojjjjjjjj...',
    '....jjjjjjjjj...','....jjjj.jjjj...','....jjjj.jjjj...','....jjjj.jjjj...','....kkkk.kkkk...','....wwww.wwww...' ] },
};
function outline(c){
  const w = c.width, h = c.height, x2 = c.getContext('2d'), img = x2.getImageData(0, 0, w, h), d = img.data, a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 40 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const i = y * w + x; if (a[i]) continue;
    if ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])){ d[i * 4] = 52; d[i * 4 + 1] = 28; d[i * 4 + 2] = 36; d[i * 4 + 3] = 255; }
  }
  x2.putImageData(img, 0, 0);
}
function bake(rows, pal, flip){
  const w = rows[0].length + 2, h = rows.length + 2, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  rows.forEach((row, j) => { for (let i = 0; i < row.length; i++){ const ch = row[i]; if (ch === '.' || !pal[ch]) continue; x.fillStyle = pal[ch]; x.fillRect(1 + (flip ? row.length - 1 - i : i), 1 + j, 1, 1); } });
  outline(c); return c;
}
const SPR = {};
function sprites(id){
  if (SPR[id]) return SPR[id];
  const pal = PAL[id], s = SIDE[id], b = BACK[id], o = { side: {}, sideL: {}, back: [] };
  ['stand', 'run', 'jump'].forEach(k => { o.side[k] = bake(s.body.concat(s[k]), pal, false); o.sideL[k] = bake(s.body.concat(s[k]), pal, true); });
  // back view: frame 0 standing, frames 1/2 = left / right leg lifted
  const lift = side => b.rows.map((row, j) => {
    if (j < b.legRow) return row;
    const src = b.rows[Math.min(b.rows.length - 1, j + 2)] || '';
    return row.split('').map((ch, i) => ((side < 0 ? i < 8 : i >= 8) ? (j + 2 < b.rows.length ? src[i] : '.') : ch)).join('');
  });
  o.back = [bake(b.rows, pal), bake(lift(-1), pal), bake(lift(1), pal)];
  return (SPR[id] = o);
}

// ---------- shared pixel helpers ----------
let P;
function pa(x, y, w, h, c){ P.fillStyle = c; P.fillRect(r(x), r(y), w, h); }
const HEART = ['01010','11111','11111','01110','00100'];
function heart(x, y, c, s = 1){ P.fillStyle = c; HEART.forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '1') P.fillRect(r(x + i * s), r(y + j * s), s, s); }); }
function cherry(x, y){ pa(x + 2, y, 1, 3, '#5aa04e'); pa(x + 3, y - 1, 2, 1, '#5aa04e'); pa(x + 4, y, 1, 3, '#5aa04e'); pa(x, y + 3, 3, 3, '#d8384d'); pa(x + 3, y + 3, 3, 3, '#d8384d'); pa(x, y + 3, 1, 1, '#f27a8a'); pa(x + 3, y + 3, 1, 1, '#f27a8a'); }

// ---------- UI shell ----------
let cv, ctx, cur = null, raf = 0, last = 0;
function ui(){
  if ($('gmodal')) return;
  const css = document.createElement('style');
  css.textContent = `
  #gmodal{position:fixed; inset:0; z-index:20; background:#2a1d24; display:none; flex-direction:column; align-items:center; touch-action:none}
  #gmodal.show{display:flex}
  #gtop{width:100%; max-width:440px; display:flex; align-items:center; justify-content:space-between; padding:10px 12px 6px; color:#fff; font-size:16px; font-weight:700}
  #gtop button{border:0; background:#ffffff22; color:#fff; font:inherit; font-size:18px; width:38px; height:38px; border-radius:12px; cursor:pointer}
  #gstage{position:relative; flex:1; min-height:0; width:100%; display:flex; justify-content:center; padding:0 8px 10px}
  #gwrap{position:relative; height:100%; aspect-ratio:180/320; max-width:100%; border-radius:16px; overflow:hidden; background:#000}
  #gcv{width:100%; height:100%; display:block; image-rendering:pixelated; image-rendering:crisp-edges; touch-action:none}
  #gmenu,#gover{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:18px; background:rgba(42,29,36,.72); color:#fff; text-align:center}
  #gmenu h2,#gover h2{margin:0; font-size:24px}
  .gcard{width:100%; border:3px solid #fff; border-radius:16px; padding:14px; color:#4a2a35; cursor:pointer; font:inherit; text-align:left; box-shadow:0 5px 0 rgba(0,0,0,.25)}
  .gcard b{display:block; font-size:19px} .gcard small{font-size:13px; opacity:.8}
  .gbtn{border:0; border-radius:14px; padding:12px 18px; font:inherit; font-size:16px; font-weight:700; cursor:pointer; background:#f49ab0; color:#fff; box-shadow:0 4px 0 #d9708f; min-width:180px}
  .gbtn.alt{background:#fff; color:#4a2a35; box-shadow:0 4px 0 #ccc}
  #gpad{position:absolute; left:0; right:0; bottom:0; height:96px; display:none; justify-content:space-between; align-items:center; padding:0 12px 10px}
  #gpad.show{display:flex}
  #gpad button{width:64px; height:64px; border-radius:50%; border:3px solid #fff; background:rgba(255,255,255,.35); color:#fff; font-size:26px; font-weight:700; touch-action:none; -webkit-user-select:none; user-select:none}
  #gpad button.on{background:rgba(255,255,255,.7); color:#4a2a35}
  #gpad .l{display:flex; gap:12px}
  #ghint{position:absolute; left:0; right:0; bottom:12px; text-align:center; color:#fff; font-size:13px; text-shadow:0 1px 2px #000; pointer-events:none}
  `;
  document.head.appendChild(css);
  const m = document.createElement('div'); m.id = 'gmodal';
  m.innerHTML = `<div id="gtop"><button id="gback" aria-label="Back">✕</button><span id="gtitle">🎮 Games</span><span id="gscore" style="min-width:38px;text-align:right"></span></div>
    <div id="gstage"><div id="gwrap"><canvas id="gcv" width="${W}" height="${H}"></canvas>
      <div id="gpad"><div class="l"><button data-k="left">◀</button><button data-k="right">▶</button></div><button data-k="jump">⤒</button></div>
      <div id="ghint"></div><div id="gmenu"></div><div id="gover" style="display:none"></div></div></div>`;
  document.body.appendChild(m);
  cv = $('gcv'); ctx = cv.getContext('2d');
  $('gback').onclick = () => { if (cur) menu(); else close(); };
  // controls
  m.querySelectorAll('#gpad button').forEach(b => {
    const k = b.dataset.k, on = v => { keys[k] = v; b.classList.toggle('on', v); if (v && k === 'jump') keys.jumpHit = true; };
    b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch(_){} on(true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => on(false)));
  });
  let sx = 0, sy = 0, st = 0;
  cv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = performance.now(); });
  cv.addEventListener('pointerup', e => {
    if (!cur || !cur.swipe) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18){ cur.swipe(e.clientX - cv.getBoundingClientRect().left < cv.clientWidth / 2 ? 'left' : 'right', true); return; }
    cur.swipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  window.addEventListener('keydown', e => {
    if (!$('gmodal').classList.contains('show') || !cur) return;
    const map = { ArrowLeft:'left', a:'left', ArrowRight:'right', d:'right', ArrowUp:'up', w:'up', ' ':'up', ArrowDown:'down', s:'down' };
    const k = map[e.key]; if (!k) return; e.preventDefault();
    if (cur.swipe && !e.repeat) cur.swipe(k);
    if (k === 'left' || k === 'right') keys[k] = true;
    if (k === 'up'){ if (!keys.jump) keys.jumpHit = true; keys.jump = true; }
  });
  window.addEventListener('keyup', e => {
    const map = { ArrowLeft:'left', a:'left', ArrowRight:'right', d:'right', ArrowUp:'jump', w:'jump', ' ':'jump' };
    const k = map[e.key]; if (k) keys[k] = false;
  });
}
const keys = { left: false, right: false, jump: false, jumpHit: false };
function open(){ ui(); $('gmodal').classList.add('show'); menu(); }
function close(){ stop(); $('gmodal').classList.remove('show'); }
function stop(){ cancelAnimationFrame(raf); raf = 0; cur = null; $('gpad').classList.remove('show'); $('ghint').textContent = ''; $('gover').style.display = 'none'; $('gscore').textContent = ''; }
function menu(){
  stop();
  const h = host(), me = h.who();
  $('gtitle').textContent = '🎮 Games';
  const m = $('gmenu'); m.style.display = 'flex';
  m.innerHTML = `<h2>pick a game</h2><div style="font-size:13px;opacity:.85">playing as ${h.name(me)} ✨</div>
    <button class="gcard" id="g1" style="background:#ffe3cc"><b>🍒 Cherry Dash</b><small>run down the love lane! swipe ← → to switch lanes, ↑ to jump, ↓ to slide</small></button>
    <button class="gcard" id="g2" style="background:#d4ecff"><b>💖 Heart Quest</b><small>run, jump & stomp bugs to reach ${h.name(me === 'riri' ? 'me' : 'riri')} at the end!</small></button>
    <div style="font-size:12px;opacity:.8">best: 🍒 ${fetchStore('best-dash', 0)} · 💖 ${fetchStore('best-quest', 0)}</div>`;
  $('g1').onclick = () => start(Dash);
  $('g2').onclick = () => start(Quest);
  drawIdle();
}
function drawIdle(){
  P = ctx; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffd1dd'); g.addColorStop(1, '#bfe6ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) heart((i * 37) % W, (i * 53) % H, 'rgba(255,255,255,.6)', 2);
}
function start(G){
  stop(); $('gmenu').style.display = 'none';
  keys.left = keys.right = keys.jump = keys.jumpHit = false;
  cur = G.create(host().who());
  $('gtitle').textContent = G.title;
  last = performance.now();
  const loop = now => {
    const dt = Math.min(.04, (now - last) / 1000); last = now;
    if (cur){ try { cur.update(dt); cur.draw(); } catch(e){ console.error(e); } }
    if (cur) raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}
function gameOver(G, res){
  const best = fetchStore(G.bestKey, 0), isBest = res.score > best;
  if (isBest) store(G.bestKey, res.score);
  host().onFinish(Object.assign({ game: G.id }, res));
  const o = $('gover'); o.style.display = 'flex';
  o.innerHTML = `<h2>${res.win ? '💞 ' + res.title : res.title}</h2>
    <div style="font-size:30px;font-weight:700">${res.score}</div>
    <div style="font-size:13px;opacity:.85">${res.detail || ''}${isBest ? '<br>🏆 new best!' : `<br>best: ${Math.max(best, res.score)}`}</div>
    <button class="gbtn" id="gagain">play again</button><button class="gbtn alt" id="gmenuB">other game</button>`;
  $('gagain').onclick = () => start(G);
  $('gmenuB').onclick = menu;
}

// =====================================================================
// 🍒 CHERRY DASH: three-lane runner down a pastel "love lane"
// =====================================================================
const Dash = { id: 'dash', title: '🍒 Cherry Dash', bestKey: 'best-dash',
  create(who){
    const spr = sprites(who), HY = 92, BY = 300, F = 6;
    const S = { who, lane: 1, lx: 1, jh: 0, jv: 0, duck: 0, d: 0, speed: 15, objs: [], next: 18, cherries: 0, t: 0, dead: 0, done: false, shake: 0, swipe: null, sparks: [] };
    $('ghint').textContent = 'swipe ← → ↑ ↓';
    setTimeout(() => { if (cur === S) $('ghint').textContent = ''; }, 3500);
    const f = d => F / (F + Math.max(-.9, d));
    const sy = d => HY + (BY - HY) * f(d);
    const sx = (lane, d) => 90 + (lane - 1) * 52 * f(d);
    S.swipe = dir => {
      if (S.dead) return;
      if (dir === 'left' && S.lane > 0){ S.lane--; host().boop(520, .05, 'square', .03); }
      if (dir === 'right' && S.lane < 2){ S.lane++; host().boop(520, .05, 'square', .03); }
      if (dir === 'up' && S.jh <= 0.1){ S.jv = 150; S.duck = 0; host().boop(660, .1, 'square', .04, 1.6); }
      if (dir === 'down'){ S.duck = .65; if (S.jh > 0) S.jv = -200; host().boop(300, .08, 'triangle', .04, .6); }
    };
    function spawnRow(at){
      const kinds = ['crate', 'bar', 'wall'];
      const free = Math.floor(Math.random() * 3);
      for (let l = 0; l < 3; l++){
        if (l === free){ if (Math.random() < .8) for (let k = 0; k < 4; k++) S.objs.push({ kind: Math.random() < .07 ? 'heart' : 'cherry', lane: l, d: at + k * 2.2, h: 0 }); continue; }
        const r2 = Math.random();
        if (r2 < .3) continue;
        const kind = kinds[r2 < .55 ? 0 : r2 < .78 ? 1 : 2];
        S.objs.push({ kind, lane: l, d: at });
        if (kind === 'crate' && Math.random() < .5) S.objs.push({ kind: 'cherry', lane: l, d: at, h: 26 });
      }
    }
    S.update = dt => {
      S.t += dt;
      if (S.dead){ S.dead += dt; S.shake = Math.max(0, S.shake - dt); if (S.dead > 1.1 && !S.done){ S.done = true; const score = r(S.d) + S.cherries * 10;
        gameOver(Dash, { score, title: 'ouch!', detail: `${r(S.d)} m · ${S.cherries} 🍒` }); } return; }
      S.speed = Math.min(34, 15 + S.t * .45);
      const mv = S.speed * dt; S.d += mv;
      S.lx += (S.lane - S.lx) * Math.min(1, dt * 14);
      if (S.jh > 0 || S.jv > 0){ S.jh += S.jv * dt; S.jv -= 520 * dt; if (S.jh <= 0){ S.jh = 0; S.jv = 0; } }
      S.duck = Math.max(0, S.duck - dt);
      S.next -= mv; if (S.next <= 0){ spawnRow(60); S.next = Math.max(9, 16 - S.t * .12) + Math.random() * 6; }
      S.objs.forEach(o => o.d -= mv);
      const px = S.lx, lane = r(S.lx);
      S.objs = S.objs.filter(o => {
        if (o.d < -2) return false;
        if (o.got) return true;
        if (Math.abs(o.d) < .9 && o.lane === lane && Math.abs(px - lane) < .4){
          if (o.kind === 'cherry' || o.kind === 'heart'){
            if (Math.abs((o.h || 0) - S.jh) < 22){ o.got = true; S.cherries += o.kind === 'heart' ? 5 : 1; host().boop(o.kind === 'heart' ? 1200 : 900, .06, 'square', .035, 1.3);
              for (let i = 0; i < 4; i++) S.sparks.push({ x: sx(o.lane, 0), y: BY - 30 - (o.h || 0), vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 40, t: .5 }); return false; }
          } else {
            const hit = o.kind === 'wall' || (o.kind === 'crate' && S.jh < 14) || (o.kind === 'bar' && S.duck <= 0);
            if (hit){ S.dead = .001; S.shake = .4; host().boop(140, .35, 'sawtooth', .06, .4); }
          }
        }
        return true;
      });
      S.sparks.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 200 * dt; s.t -= dt; }); S.sparks = S.sparks.filter(s => s.t > 0);
      $('gscore').textContent = `${r(S.d) + S.cherries * 10}`;
    };
    S.draw = () => {
      P = ctx; ctx.save();
      if (S.shake > 0) ctx.translate(r((Math.random() - .5) * 6), r((Math.random() - .5) * 6));
      // sky + sunset
      const g = ctx.createLinearGradient(0, 0, 0, HY); g.addColorStop(0, '#9fd4ff'); g.addColorStop(1, '#ffd6e4'); ctx.fillStyle = g; ctx.fillRect(-4, -4, W + 8, HY + 4);
      pa(130, 28, 18, 18, '#fff3b0'); pa(128, 32, 22, 10, '#fff3b0');
      for (let i = 0; i < 3; i++){ const cx = ((i * 70 - S.t * 4) % 240 + 240) % 240 - 30; pa(cx, 20 + i * 14, 26, 6, '#fff'); pa(cx + 6, 16 + i * 14, 14, 6, '#fff'); }
      // far hills + town
      for (let x = 0; x < W; x += 2){ const hgt = 10 + Math.sin(x * .07) * 5 + Math.sin(x * .19) * 3; pa(x, HY - hgt, 2, hgt, '#b5dba0'); }
      [[14,18],[34,26],[120,22],[150,30],[164,16]].forEach(([x, hh]) => { pa(x, HY - hh, 12, hh, '#f7c6d4'); pa(x + 3, HY - hh + 4, 2, 3, '#fff'); pa(x + 7, HY - hh + 4, 2, 3, '#fff'); });
      // grass
      ctx.fillStyle = '#8fd17c'; ctx.fillRect(-4, HY, W + 8, H - HY + 4);
      // path (trapezoid) row by row
      for (let y = HY; y < H; y++){
        const k = (y - HY) / (BY - HY), half = 6 + k * 84, d = F / Math.max(.001, k) - F;
        const stripe = ((d + S.d) % 4 + 4) % 4 < 2;
        pa(90 - half, y, half * 2, 1, stripe ? '#ffe9d6' : '#ffdcc4');
        pa(90 - half - 2, y, 2, 1, '#e7b48f'); pa(90 + half, y, 2, 1, '#e7b48f');
        const l1 = 90 - half / 3, l2 = 90 + half / 3; if (stripe){ pa(l1, y, 1, 1, '#f0bfa0'); pa(l2, y, 1, 1, '#f0bfa0'); }
        if (((d + S.d) % 6 + 6) % 6 < .9 && k > .02){ pa(0, y, 90 - half - 2, 1, '#83c871'); pa(92 + half, y, W, 1, '#83c871'); }
      }
      // roadside trees & lamps
      for (let i = 0; i < 8; i++){
        const d = ((i * 8 - S.d) % 64 + 64) % 64, ff = f(d), y = sy(d), side = i % 2 ? 1 : -1;
        const x = 90 + side * (110 + 10 * (i % 3)) * ff, s = ff * 2.2;
        if (i % 3 === 0){ pa(x - 1 * s, y - 30 * s, 2 * s, 30 * s, '#c99a6e'); pa(x - 9 * s, y - 44 * s, 18 * s, 16 * s, '#f6a8c1'); pa(x - 6 * s, y - 50 * s, 12 * s, 8 * s, '#ffc6d6'); }
        else { pa(x - .7 * s, y - 34 * s, 1.5 * s, 34 * s, '#7d6e8c'); pa(x - 3 * s, y - 38 * s, 6 * s, 5 * s, '#fff3b0'); }
      }
      // objects far → near
      S.objs.slice().sort((a, b) => b.d - a.d).forEach(o => {
        if (o.d < -1.5) return;
        const ff = f(o.d), x = sx(o.lane, o.d), y = sy(o.d), s = ff * 6;   // s ≈ pixels per unit at this depth
        if (o.kind === 'cherry' || o.kind === 'heart'){
          const yy = y - (14 + (o.h || 0)) * ff * 1 - Math.sin(S.t * 6 + o.d) * 2 * ff;
          ctx.save(); ctx.translate(r(x - 3 * ff * 2), r(yy)); ctx.scale(ff * 2, ff * 2);
          if (o.kind === 'heart') heart(0, 0, '#ff4f7e'); else cherry(0, 0); ctx.restore();
        } else if (o.kind === 'crate'){
          const w = 34 * ff, h = 22 * ff; pa(x - w / 2, y - h, w, h, '#f49ab0'); pa(x - w / 2, y - h, w, 3 * ff, '#ffc2d1'); pa(x - 2 * ff, y - h, 4 * ff, h, '#fff'); pa(x - w / 2, y - h * .55, w, 3 * ff, '#fff');
          pa(x - 6 * ff, y - h - 5 * ff, 5 * ff, 5 * ff, '#fff'); pa(x + 1 * ff, y - h - 5 * ff, 5 * ff, 5 * ff, '#fff');
        } else if (o.kind === 'bar'){
          const w = 44 * ff, top = y - 64 * ff; pa(x - w / 2, top, 3 * ff, 64 * ff, '#9b8ae0'); pa(x + w / 2 - 3 * ff, top, 3 * ff, 64 * ff, '#9b8ae0');
          pa(x - w / 2, top + 6 * ff, w, 14 * ff, '#fff0c2'); for (let i = 0; i < 5; i++) pa(x - w / 2 + (4 + i * 8) * ff, top + 9 * ff, 4 * ff, 8 * ff, i % 2 ? '#ff7aa8' : '#7cc3f0');
        } else if (o.kind === 'wall'){
          const w = 46 * ff, h = 70 * ff; pa(x - w / 2, y - h, w, h, '#c9b3f2'); pa(x - w / 2, y - h, w, 6 * ff, '#e4d9ff');
          pa(x - w / 2 + 4 * ff, y - h + 12 * ff, w - 8 * ff, 18 * ff, '#fff'); ctx.save(); ctx.translate(r(x - 5 * ff * 2), r(y - h + 14 * ff)); ctx.scale(ff * 2, ff * 2); heart(0, 0, '#ff4f7e'); ctx.restore();
          pa(x - w / 2 + 3 * ff, y - 8 * ff, 8 * ff, 8 * ff, '#3a3842'); pa(x + w / 2 - 11 * ff, y - 8 * ff, 8 * ff, 8 * ff, '#3a3842');
        }
      });
      // player (back view, 2x)
      const frame = S.dead ? 0 : S.jh > 0 ? 0 : 1 + (Math.floor(S.t * 10) % 2), img = spr.back[frame];
      const px = 90 + (S.lx - 1) * 52, scale = 2, w = img.width * scale;
      pa(px - 14, BY - 3, 28, 4, 'rgba(0,0,0,.15)');
      const hgt = S.duck > 0 ? img.height * scale * .55 : img.height * scale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, r(px - w / 2), r(BY - hgt - S.jh), w, r(hgt));
      S.sparks.forEach(s => pa(s.x, s.y, 2, 2, '#ffd23c'));
      ctx.restore();
    };
    return S;
  } };

// =====================================================================
// 💖 HEART QUEST: side-scrolling platformer
// =====================================================================
const T = 10, ROWS = 23;
function buildLevel(){
  const COLS = 172, g = Array.from({ length: ROWS }, () => Array(COLS).fill('.'));
  const put = (x, y, ch) => { if (x >= 0 && x < COLS && y >= 0 && y < ROWS) g[y][x] = ch; };
  const ground = (a, b) => { for (let x = a; x <= b; x++){ put(x, 21, '#'); put(x, 22, '#'); } };
  const row = (x, y, n, ch) => { for (let i = 0; i < n; i++) put(x + i, y, ch); };
  const col = (x, h, ch = 'P') => { for (let i = 0; i < h; i++) put(x, 20 - i, ch); };
  const stairs = (x, n, up = true) => { for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) put(up ? x + i : x + n - 1 - i, 20 - j, 'S'); };
  ground(0, 25); row(8, 17, 4, 'o'); put(14, 16, '?'); put(15, 16, 'B'); put(16, 16, '?'); put(15, 12, 'o'); put(22, 20, 'E');
  ground(29, 52); col(34, 3); row(38, 17, 3, 'o'); put(42, 20, 'E'); row(44, 15, 5, 'B'); row(45, 13, 3, 'o'); put(46, 15, '?'); put(49, 20, 'E');
  row(26, 18, 2, 'B');
  ground(56, 82); stairs(60, 4); row(60, 15, 4, 'o'); put(68, 20, 'E'); put(72, 20, 'E'); put(76, 16, '?'); put(77, 16, 'B'); put(78, 16, '?'); put(80, 20, 'C');
  row(83, 18, 3, 'B');
  ground(87, 112); row(92, 20, 2, '^'); col(98, 2); row(91, 15, 7, 'o'); put(103, 20, 'E'); put(107, 20, 'E'); row(100, 14, 4, 'B'); put(101, 14, '?');
  row(114, 17, 2, 'B'); row(118, 16, 2, 'B');
  ground(122, 171); row(126, 16, 5, 'B'); put(127, 16, '?'); put(129, 16, '?'); put(128, 12, 'o'); put(134, 20, 'E'); put(138, 20, 'E'); stairs(142, 4); stairs(146, 4, false);
  row(152, 17, 3, 'o'); put(156, 20, '^'); put(160, 20, 'E'); put(166, 20, 'F');
  return { g, COLS };
}
const SOLID = new Set(['#', 'B', '?', 'S', 'P', 'U']);
const Quest = { id: 'quest', title: '💖 Heart Quest', bestKey: 'best-quest',
  create(who){
    const partner = who === 'riri' ? 'me' : 'riri', spr = sprites(who), pspr = sprites(partner);
    const { g, COLS } = buildLevel();
    const ents = [], items = [];
    let finish = null, check = { x: 2 * T, y: 18 * T };
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
      const ch = g[y][x];
      if (ch === 'E'){ ents.push({ x: x * T, y: y * T + 2, w: 10, h: 8, vx: -18, vy: 0, dead: 0 }); g[y][x] = '.'; }
      if (ch === 'o'){ items.push({ x: x * T + 2, y: y * T + 1, got: false }); g[y][x] = '.'; }
      if (ch === 'F'){ finish = { x: x * T, gy: (y + 1) * T }; g[y][x] = '.'; }
      if (ch === 'C'){ check.cx = x * T; g[y][x] = 'c'; }
    }
    const pl = { x: check.x, y: check.y, w: 9, h: 22, vx: 0, vy: 0, on: false, face: 1, coyote: 0, buf: 0, inv: 0 };
    const S = { who, lives: 3, hearts: 0, t: 0, cam: 0, done: false, won: 0, dying: 0, pops: [], swipe: null };
    $('gpad').classList.add('show');
    const tile = (tx, ty) => (tx < 0 || tx >= COLS) ? '#' : (ty < 0 || ty >= ROWS ? '.' : g[ty][tx]);
    const solidAt = (px, py) => SOLID.has(tile(Math.floor(px / T), Math.floor(py / T)));
    function move(o, dx, dy, onHead){
      o.x += dx;
      if (dx){ const xs = dx > 0 ? o.x + o.w : o.x; for (const yy of [o.y + 1, o.y + o.h / 2, o.y + o.h - 1]) if (solidAt(xs, yy)){ o.x = dx > 0 ? Math.floor(xs / T) * T - o.w - .01 : (Math.floor(xs / T) + 1) * T + .01; o.vx = o.isEnemy ? -o.vx : 0; break; } }
      o.y += dy; o.on = false;
      if (dy > 0){ for (const xx of [o.x + 1, o.x + o.w - 1]) if (solidAt(xx, o.y + o.h)){ o.y = Math.floor((o.y + o.h) / T) * T - o.h; o.vy = 0; o.on = true; break; } }
      else if (dy < 0){ for (const xx of [o.x + 2, o.x + o.w - 2]) if (solidAt(xx, o.y)){ const tx = Math.floor(xx / T), ty = Math.floor(o.y / T); o.y = (ty + 1) * T; o.vy = 0; if (onHead) onHead(tx, ty); break; } }
    }
    function hurt(){
      if (pl.inv > 0 || S.dying || S.won) return;
      S.lives--; host().boop(180, .3, 'sawtooth', .05, .5);
      if (S.lives <= 0){ S.dying = .001; pl.vy = -260; return; }
      pl.inv = 1.6; pl.vy = -200; pl.vx = -pl.face * 90;
    }
    function respawn(){ pl.x = check.x; pl.y = check.y; pl.vx = pl.vy = 0; pl.inv = 1.5; }
    S.update = dt => {
      S.t += dt;
      if (S.won){ S.won += dt; if (S.won > 2.6 && !S.done){ S.done = true; const score = S.hearts * 10 + S.lives * 50 + Math.max(0, 300 - r(S.t));
        gameOver(Quest, { win: true, score, title: `you found ${host().nick(who)}!`, detail: `${S.hearts} 🍒 · ${S.lives} ❤️ · ${r(S.t)}s` }); } return; }
      if (S.dying){ S.dying += dt; pl.vy += 900 * dt; pl.y += pl.vy * dt; if (S.dying > 1.6 && !S.done){ S.done = true;
        gameOver(Quest, { score: S.hearts * 10, title: 'oh no!', detail: `${S.hearts} 🍒 collected` }); } return; }
      // input
      const acc = pl.on ? 520 : 360, max = 78;
      if (keys.left){ pl.vx = Math.max(-max, pl.vx - acc * dt); pl.face = -1; }
      else if (keys.right){ pl.vx = Math.min(max, pl.vx + acc * dt); pl.face = 1; }
      else pl.vx *= pl.on ? Math.pow(.0005, dt) : Math.pow(.3, dt);
      pl.coyote = pl.on ? .09 : pl.coyote - dt;
      if (keys.jumpHit){ pl.buf = .12; keys.jumpHit = false; } else pl.buf -= dt;
      if (pl.buf > 0 && pl.coyote > 0){ pl.vy = -318; pl.buf = 0; pl.coyote = 0; host().boop(620, .08, 'square', .035, 1.7); }
      if (!keys.jump && pl.vy < -120) pl.vy = -120;          // short hop when released early
      pl.vy = Math.min(420, pl.vy + 900 * dt);
      move(pl, pl.vx * dt, pl.vy * dt, (tx, ty) => {
        if (g[ty][tx] === '?'){ g[ty][tx] = 'U'; S.hearts += 2; S.pops.push({ x: tx * T + 2, y: ty * T - 6, t: .6 }); host().boop(1000, .08, 'square', .04, 1.5); }
        else if (g[ty][tx] === 'B') host().boop(240, .05, 'square', .03);
      });
      pl.x = Math.max(0, pl.x);
      pl.inv = Math.max(0, pl.inv - dt);
      // hazards
      const ftx = Math.floor((pl.x + pl.w / 2) / T), fty = Math.floor((pl.y + pl.h - 2) / T);
      if (tile(ftx, fty) === '^') hurt();
      if (pl.y > ROWS * T + 30){ S.lives--; host().boop(180, .3, 'sawtooth', .05, .5); if (S.lives <= 0){ S.dying = 1; } else respawn(); }
      if (check.cx && pl.x > check.cx && check.x < check.cx){ check.x = check.cx; check.y = 17 * T; host().boop(880, .15, 'sine', .05, 1.5); S.pops.push({ x: check.cx, y: 180, t: 1, txt: 'checkpoint!' }); }
      // items
      items.forEach(it => { if (!it.got && Math.abs(it.x + 3 - (pl.x + pl.w / 2)) < 8 && Math.abs(it.y + 3 - (pl.y + pl.h / 2)) < 13){ it.got = true; S.hearts++; host().boop(900, .05, 'square', .03, 1.3); } });
      // enemies
      ents.forEach(e => {
        if (e.dead){ e.dead += dt; return; }
        if (Math.abs(e.x - pl.x) > 200) return;
        e.isEnemy = true; e.vy = Math.min(400, e.vy + 900 * dt);
        const ahead = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
        if (e.on && !solidAt(ahead, e.y + e.h + 2)) e.vx = -e.vx;
        move(e, e.vx * dt, e.vy * dt);
        if (pl.x < e.x + e.w && pl.x + pl.w > e.x && pl.y < e.y + e.h && pl.y + pl.h > e.y){
          if (pl.vy > 40 && pl.y + pl.h - e.y < 9){ e.dead = .001; pl.vy = -230; S.hearts += 1; host().boop(400, .1, 'square', .04, 2); S.pops.push({ x: e.x, y: e.y - 8, t: .6, txt: '+1' }); }
          else hurt();
        }
      });
      S.pops.forEach(p2 => { p2.t -= dt; p2.y -= 20 * dt; }); S.pops = S.pops.filter(p2 => p2.t > 0);
      // finish
      if (finish && pl.x + pl.w > finish.x - 4){ S.won = .001; pl.vx = 0; host().boop(660, .15, 'sine', .06, 1.5); setTimeout(() => host().boop(990, .25, 'sine', .06, 1.5), 160); }
      S.cam += (Math.max(0, Math.min(COLS * T - W, pl.x - 70)) - S.cam) * Math.min(1, dt * 8);
      $('gscore').textContent = `🍒${S.hearts} ${'❤'.repeat(Math.max(0, S.lives))}`;
    };
    S.draw = () => {
      P = ctx; ctx.imageSmoothingEnabled = false;
      const cam = r(S.cam);
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#a9dcff'); sky.addColorStop(.7, '#ffe3ee'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++){ const x = ((i * 90 - cam * .2) % 540 + 540) % 540 - 60; pa(x, 30 + (i % 3) * 22, 30, 7, '#fff'); pa(x + 8, 25 + (i % 3) * 22, 16, 6, '#fff'); }
      for (let x = 0; x < W; x += 2){ const wx = x + cam * .45, h1 = 36 + Math.sin(wx * .03) * 14 + Math.sin(wx * .011) * 10; pa(x, 210 - h1, 2, h1, '#c6e8b2'); }
      for (let x = 0; x < W; x += 2){ const wx = x + cam * .7, h2 = 18 + Math.sin(wx * .05 + 1) * 8; pa(x, 212 - h2, 2, h2, '#a8dc94'); }
      // tiles
      const t0 = Math.floor(cam / T), t1 = t0 + Math.ceil(W / T) + 1;
      for (let ty = 0; ty < ROWS; ty++) for (let tx = t0; tx <= t1; tx++){
        const ch = tile(tx, ty), x = tx * T - cam, y = ty * T;
        if (ch === '#'){ const top = !SOLID.has(tile(tx, ty - 1)); pa(x, y, T, T, '#d29a66'); pa(x + 2, y + 6, 2, 2, '#b98152'); pa(x + 6, y + 3, 1, 1, '#b98152');
          if (top){ pa(x, y, T, 4, '#86cf6c'); pa(x, y + 4, T, 1, '#5aa04e'); pa(x + 3, y - 1, 1, 1, '#86cf6c'); } }
        else if (ch === 'B'){ pa(x, y, T, T, '#f2a0b4'); pa(x, y + 4, T, 1, '#d97a95'); pa(x + 4, y, 1, 4, '#d97a95'); pa(x + 8, y + 5, 1, 5, '#d97a95'); pa(x + 1, y + 1, 2, 1, '#ffc6d4'); }
        else if (ch === '?'){ const b = Math.sin(S.t * 5 + tx) > .6 ? '#ffd86b' : '#f6c34a'; pa(x, y, T, T, b); pa(x, y + 9, T, 1, '#d9a531'); heart(x + 2, y + 2, '#fff'); }
        else if (ch === 'U'){ pa(x, y, T, T, '#c4a07a'); pa(x + 1, y + 1, T - 2, T - 2, '#b08b66'); }
        else if (ch === 'S'){ pa(x, y, T, T, '#c9b3e0'); pa(x, y, T, 1, '#e4d9ff'); pa(x + T - 1, y, 1, T, '#a790c4'); }
        else if (ch === 'P'){ pa(x + 1, y, 8, T, '#e48a6a'); if (!SOLID.has(tile(tx, ty - 1))){ pa(x - 1, y, 12, 3, '#f0a184'); pa(x + 3, y - 5, 4, 4, '#ff7aa8'); pa(x + 4, y - 4, 2, 2, '#fff3b0'); } }
        else if (ch === '^'){ for (let i = 0; i < 3; i++){ pa(x + i * 3 + 1, y + 6, 2, 4, '#b8bcc8'); pa(x + i * 3 + 1, y + 4, 1, 2, '#dfe2ea'); } }
        else if (ch === 'c'){ pa(x + 4, y - 20, 1, 30, '#7d6e8c'); pa(x + 5, y - 20, 9, 7, check.x >= tx * T ? '#ff7aa8' : '#ddd'); }
      }
      // dirt under the world (behind the controls)
      pa(0, ROWS * T, W, H - ROWS * T, '#b98152');
      items.forEach(it => { if (!it.got){ const x = it.x - cam; if (x > -10 && x < W + 10) cherry(x, it.y + r(Math.sin(S.t * 5 + it.x) * 1.5)); } });
      ents.forEach(e => {
        const x = r(e.x - cam), y = r(e.y); if (x < -12 || x > W + 12) return;
        if (e.dead){ if (e.dead < .5){ pa(x, y + 5, 10, 3, '#8a6fc4'); } return; }
        const st = Math.floor(S.t * 6) % 2;
        pa(x + 1, y + 1, 8, 6, '#8a6fc4'); pa(x, y + 3, 10, 3, '#8a6fc4'); pa(x + 2, y, 6, 1, '#a58ce0');
        pa(x + (e.vx < 0 ? 2 : 5), y + 2, 1, 2, '#fff'); pa(x + (e.vx < 0 ? 4 : 7), y + 2, 1, 2, '#fff'); pa(x + (e.vx < 0 ? 2 : 5), y + 3, 1, 1, '#2b1a14'); pa(x + (e.vx < 0 ? 4 : 7), y + 3, 1, 1, '#2b1a14');
        pa(x + 1 + st, y + 7, 2, 1, '#4a2a35'); pa(x + 6 - st, y + 7, 2, 1, '#4a2a35');
      });
      // partner waiting at the finish
      if (finish){
        const fx = finish.x - cam, img = pspr.sideL[S.won ? 'jump' : 'stand'];
        const gy = finish.gy;
        pa(fx - 8, gy - 44, 32, 3, '#ff7aa8'); pa(fx - 8, gy - 42, 3, 42, '#ff7aa8'); pa(fx + 21, gy - 42, 3, 42, '#ff7aa8');
        heart(fx + 3, gy - 58 + r(Math.sin(S.t * 4) * 2), '#ff4f7e', 2);
        ctx.drawImage(img, r(fx), r(gy - img.height + 1 - (S.won ? Math.abs(Math.sin(S.won * 8)) * 6 : 0)));
      }
      // player
      if (!(pl.inv > 0 && Math.floor(S.t * 12) % 2)){
        const set = pl.face > 0 ? spr.side : spr.sideL;
        const k = !pl.on ? 'jump' : Math.abs(pl.vx) > 12 ? (Math.floor(S.t * 10) % 2 ? 'run' : 'stand') : 'stand';
        const img = set[k];
        ctx.drawImage(img, r(pl.x - cam - (img.width - pl.w) / 2), r(pl.y + pl.h - img.height + 1));
      }
      if (S.won){ for (let i = 0; i < 6; i++) heart(finish.x - cam - 10 + i * 7, finish.gy - 40 - ((S.won * 30 + i * 13) % 50), ['#ff4f7e','#ff9ab8'][i % 2]); }
      S.pops.forEach(p2 => { if (p2.txt){ ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.fillText(p2.txt, r(p2.x - cam), r(p2.y)); } else heart(p2.x - cam, p2.y, '#ff4f7e'); });
    };
    return S;
  } };

window.Games = { open, close };
})();

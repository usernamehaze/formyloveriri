// 🎨 Riri & Me, hand-drawn in pixel art (no images, so they can move into any pose).
// Each person is drawn in parts so poses like hugging can layer arms over each other.
(function(){
'use strict';
let P = null, OX = 0, OY = 0, HX = 0, HY = 0;
const r = Math.round;
function p(x, y, w, h, c){ P.fillStyle = c; P.fillRect(r(OX + x), r(OY + y), w, h); }      // body space
function q(x, y, w, h, c){ P.fillStyle = c; P.fillRect(r(OX + HX + x), r(OY + HY + y), w, h); } // head space (tilts)
function pa(x, y, w, h, c){ P.fillStyle = c; P.fillRect(r(x), r(y), w, h); }                  // world space
function line(x0, y0, x1, y1, th, c){
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  P.fillStyle = c;
  for (let i = 0; i <= n; i++){ const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; P.fillRect(r(x - th / 2), r(y - th / 2), th, th); }
}
const DK = '#2b1a14', MOUTH = '#6b2a2a', TONGUE = '#e2707e';

// ---------- faces ----------
function eyes(kind, x1, x2, y, look = 0){
  [x1 + look, x2 + look].forEach(x => {
    if (kind === 'arc'){ q(x - 2, y + 1, 1, 1, DK); q(x - 1, y, 3, 1, DK); q(x + 2, y + 1, 1, 1, DK); }
    else if (kind === 'closed'){ q(x - 2, y, 1, 1, DK); q(x - 1, y + 1, 3, 1, DK); q(x + 2, y, 1, 1, DK); }
    else if (kind === 'blink'){ q(x - 2, y + 1, 5, 1, DK); }
    else if (kind === 'wide'){ q(x - 1, y - 2, 3, 5, DK); q(x - 1, y - 2, 1, 1, '#fff'); q(x + 1, y + 1, 1, 1, '#fff'); }
    else { q(x - 1, y - 1, 3, 4, DK); q(x - 1, y - 1, 1, 1, '#fff'); q(x + 1, y + 2, 1, 1, '#6b4b3e'); }
  });
  if (kind === 'sad'){ q(x1 - 3, y - 4, 2, 1, DK); q(x1 - 1, y - 5, 2, 1, DK); q(x2 + 1, y - 5, 2, 1, DK); q(x2 + 3, y - 4, 2, 1, DK); }
}
function mouth(kind, mx, my, hw, amp = 0){
  if (kind === 'grin'){
    q(mx - hw, my, hw * 2, 1, MOUTH); q(mx - hw, my + 1, 1, 2, MOUTH); q(mx + hw - 1, my + 1, 1, 2, MOUTH);
    q(mx - hw + 1, my + 1, hw * 2 - 2, 2, '#fff');
    q(mx - hw + 1, my + 3, 1, 1, MOUTH); q(mx + hw - 2, my + 3, 1, 1, MOUTH);
    q(mx - hw + 2, my + 3, hw * 2 - 4, 1, TONGUE); q(mx - hw + 2, my + 4, hw * 2 - 4, 1, MOUTH);
  } else if (kind === 'smile'){ q(mx - 3, my, 1, 1, MOUTH); q(mx - 2, my + 1, 5, 1, MOUTH); q(mx + 3, my, 1, 1, MOUTH); }
  else if (kind === 'open'){ const h = Math.max(1, r(amp * 4)); q(mx - 3, my, 6, h + 2, MOUTH); q(mx - 2, my + 1, 4, h, TONGUE); }
  else if (kind === 'frown'){ q(mx - 3, my + 1, 1, 1, MOUTH); q(mx - 2, my, 5, 1, MOUTH); q(mx + 3, my + 1, 1, 1, MOUTH); }
  else if (kind === 'o'){ q(mx - 1, my, 3, 3, MOUTH); q(mx, my + 1, 1, 1, TONGUE); }
  else if (kind === 'kiss'){ q(mx - 1, my, 3, 1, '#d9536b'); q(mx - 2, my + 1, 2, 1, '#d9536b'); q(mx + 1, my + 1, 2, 1, '#d9536b'); q(mx - 1, my + 2, 3, 1, '#d9536b'); }
  else if (kind === 'chew'){ const h = amp > .5 ? 3 : 1; q(mx - 3, my, 6, h, MOUTH); if (h > 1) q(mx - 2, my + 1, 4, 1, TONGUE); }
}

// ---------- arms ----------
// spec: { type: 'thumb'|'down'|'to'|'wave'|'cheer'|'mouth'|'ear'|'rim'|'hip'|'none', x, y, ph }
function arm(spec, sx, sy, side, th, S, SD, extra){
  const t = spec.type || 'down', ph = spec.ph || 0;
  const hand = (hx, hy, big) => { pa(hx - 2, hy - 2, big ? 6 : 5, 5, S); pa(hx - 2 + (side > 0 ? 3 : 0), hy + 1, 1, 2, SD); return [hx, hy]; };
  let end;
  if (t === 'none') return null;
  if (t === 'down'){ const ex = sx + side * 3, ey = sy + 13, hx = sx + side * 4, hy = sy + 25; line(sx, sy, ex, ey, th, S); line(ex, ey, hx, hy, th - 1, S); end = hand(hx, hy); }
  else if (t === 'hip'){ const ex = sx + side * 9, ey = sy + 12, hx = sx + side * 3, hy = sy + 22; line(sx, sy, ex, ey, th, S); line(ex, ey, hx, hy, th - 1, S); end = hand(hx, hy); }
  else if (t === 'to'){
    let hx = spec.x, hy = spec.y; const dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy), max = spec.reach || 44;
    if (d > max){ hx = sx + dx / d * max; hy = sy + dy / d * max; }
    const ex = (sx + hx) / 2 + side * 2, ey = (sy + hy) / 2 + 4;
    line(sx, sy, ex, ey, th, S); line(ex, ey, hx, hy, th - 1, S); end = hand(hx, hy);
  }
  else if (t === 'wave'){
    const w = Math.sin(ph) * 3, ex = sx + side * 9, ey = sy + 2, hx = sx + side * (10 + w), hy = sy - 15;
    line(sx, sy, ex, ey, th, S); line(ex, ey, hx, hy, th - 1, S);
    pa(hx - 3, hy - 4, 6, 6, S); for (let i = 0; i < 4; i++) pa(hx - 3 + i * 1.5, hy - 7, 1, 3, S); pa(hx + side * 3, hy - 2, 2, 1, S);
    end = [hx, hy];
  }
  else if (t === 'cheer'){ const w = Math.sin(ph) * 2, hx = sx + side * (7 + w), hy = sy - 24; line(sx, sy, sx + side * 5, sy - 10, th, S); line(sx + side * 5, sy - 10, hx, hy, th - 1, S); end = hand(hx, hy, true); }
  else if (t === 'mouth'){ const ex = sx + side * 5, ey = sy + 14, hx = spec.x, hy = spec.y; line(sx, sy, ex, ey, th, S); line(ex, ey, hx, hy, th - 1, S); end = hand(hx, hy); }
  else if (t === 'ear'){ const ex = sx + side * 9, ey = sy + 4, hx = spec.x, hy = spec.y; line(sx, sy, ex, ey, th, S); line(ex, ey, hx, hy, th - 1, S); end = hand(hx, hy); }
  else if (t === 'rim'){ const hx = sx + side * 16, hy = sy + 8; line(sx, sy, hx, hy, th, S); end = hand(hx, hy); }
  if (extra) extra(sx, sy, end);
  return end;
}

// ---------- Riri ----------
const RIRI = {
  w: 52, h: 116, mouth: [26, 32], head: [26, 0], shoulders: [[13, 49], [38, 49]], th: 4,
  col: { H: '#5a3221', H2: '#3d2015', HL: '#83502f', S: '#f7c8a7', SD: '#e6a985', PK: '#f39cb3', PKD: '#de7a97', PKL: '#ffd2de', R: '#d8384d', G: '#76b964', K: '#1f1c24' },
};
function ririBack(o){
  const { H, H2, HL } = RIRI.col; const wv = o.hairWave || 0;
  q(7, 4, 38, 6, H); q(3, 8, 46, 10, H); q(1, 16, 50, 38, H);
  q(0 - wv, 22, 2, 8, H); q(0, 36, 2, 9, H); q(50 + wv, 26, 2, 9, H); q(50, 40, 2, 8, H);
  q(2, 54, 9, 4, H); q(41, 54, 9, 4, H); q(4, 58, 6, 3, H); q(42, 58, 6, 3, H); q(1, 50, 4, 6, H); q(47, 50, 4, 6, H);
  q(3, 30, 1, 10, H2); q(6, 44, 1, 8, H2); q(47, 32, 1, 10, H2); q(44, 46, 1, 8, H2); q(4, 20, 1, 6, HL); q(48, 20, 1, 6, HL);
  q(2, 40, 1, 6, H2); q(49, 44, 1, 5, H2);
}
function ririLegs(o){
  const { S, K } = RIRI.col, a = o.legs === 'walkA' ? -2 : 0, b = o.legs === 'walkB' ? -2 : 0;
  p(19, 90 + a, 5, 14, S); p(29, 90 + b, 5, 14, S);
  p(19, 101 + a, 5, 10, K); p(29, 101 + b, 5, 10, K);
  for (let y = 102; y < 110; y += 2){ p(20, y + a, 3, 1, '#35313c'); p(30, y + b, 3, 1, '#35313c'); }
  p(17, 110 + a, 8, 5, '#141217'); p(28, 110 + b, 8, 5, '#141217'); p(17, 114 + a, 8, 2, '#09080b'); p(28, 114 + b, 8, 2, '#09080b');
  p(18, 111 + a, 3, 1, '#4d4955'); p(29, 111 + b, 3, 1, '#4d4955');
}
function ririBody(o){
  const { S, SD, PK, PKD, PKL, R, G } = RIRI.col;
  p(22, 40, 8, 6, SD);
  if (o.only === 'bust'){ p(14, 44, 24, 12, S); p(20, 44, 12, 2, SD); return; }
  p(16, 43, 2, 5, '#fff'); p(34, 43, 2, 5, '#fff');
  p(15, 47, 22, 1, '#fff'); p(15, 48, 22, 6, PK);
  for (let y = 54; y < 90; y++){ const e = r((y - 54) * .2); p(15 - e, y, 22 + e * 2, 1, PK); }
  p(8, 88, 36, 2, PKD); p(15, 54, 22, 1, PKD); p(9, 87, 34, 1, PKL);
  const cherry = (x, y) => { p(x, y + 2, 2, 2, R); p(x + 3, y + 2, 2, 2, R); p(x + 1, y, 1, 2, G); p(x + 3, y, 1, 2, G); p(x + 2, y - 1, 2, 1, G); p(x, y + 2, 1, 1, '#f27a8a'); };
  cherry(21, 49); cherry(14, 60); cherry(27, 62); cherry(19, 72); cherry(31, 74); cherry(12, 80); cherry(24, 83); cherry(35, 84);
}
function ririHead(o){
  const { H, HL, S, SD } = RIRI.col;
  q(11, 12, 30, 28, S); q(12, 40, 28, 2, S); q(14, 42, 24, 1, S);
  q(10, 8, 32, 8, H);
  [[10,16,4,4],[14,16,3,3],[17,16,4,2],[21,16,3,4],[24,16,4,2],[28,16,3,3],[31,16,4,2],[35,16,3,4],[38,16,4,5]].forEach(a => q(a[0], a[1], a[2], a[3], H));
  q(8, 14, 4, 28, H); q(40, 14, 4, 28, H); q(9, 42, 3, 6, H); q(40, 42, 3, 6, H);
  q(16, 9, 9, 1, HL); q(30, 10, 6, 1, HL);
  q(13, 12, 2, 1, '#fff'); q(15, 11, 2, 1, '#fff'); q(17, 10, 2, 1, '#fff'); q(14, 13, 2, 1, '#d9d4dc');
  const bl = o.blush ? 'rgba(240,100,120,.6)' : 'rgba(240,120,130,.42)';
  q(13, 29, 5, 2, bl); q(34, 29, 5, 2, bl);
  [[15,29],[17,30],[14,31],[35,29],[37,30],[36,31]].forEach(a => q(a[0], a[1], 1, 1, '#c27a60'));
  eyes(o.eyes || 'open', 19, 33, 24, o.look || 0);
  mouth(o.mouth || 'smile', 26, 32, 6, o.amp || 0);
}

// ---------- Me ----------
const ME = {
  w: 58, h: 130, mouth: [29, 34], head: [29, 0], shoulders: [[13, 51], [45, 51]], th: 5,
  col: { B: '#1d1b23', BL: '#3d3a49', S: '#ecb791', SD: '#d79a74', T: '#27252c', TL: '#3b3943', J: '#6283ad', JD: '#4b6a93', JL: '#83a0c6' },
};
const FONT = { M:['101','111','111','101','101'], I:['111','010','010','010','111'], L:['100','100','100','100','111'], A:['010','101','111','101','101'], N:['110','101','101','101','101'], O:['111','101','101','101','111'] };
function meBack(o){
  const { B } = ME.col;
  q(11, 2, 36, 8, B); q(7, 6, 44, 12, B); q(7, 14, 7, 30, B); q(44, 14, 7, 30, B);
  q(14, 0, 5, 3, B); q(25, 0, 8, 2, B); q(37, 1, 5, 3, B); q(6, 22, 1, 16, B); q(51, 22, 1, 16, B);
  q(8, 42, 4, 4, B); q(46, 42, 4, 4, B); q(9, 46, 2, 2, B); q(47, 46, 2, 2, B);
}
function meLegs(o){
  const { J, JD, JL } = ME.col, a = o.legs === 'walkA' ? -2 : 0, b = o.legs === 'walkB' ? -2 : 0;
  p(14, 88, 30, 6, J); p(13, 94 + a, 14, 30, J); p(31, 94 + b, 14, 30, J); p(27, 94, 4, 4, J);
  p(19, 96 + a, 1, 26, JD); p(38, 96 + b, 1, 26, JD); p(14, 100 + a, 2, 6, JL); p(42, 104 + b, 2, 7, JL); p(15, 112 + a, 9, 1, JD); p(33, 116 + b, 9, 1, JD);
  p(14, 89, 30, 1, JD);
  p(10, 122 + a, 17, 5, '#222027'); p(31, 122 + b, 17, 5, '#222027');
  p(10, 127 + a, 17, 2, '#f2f2f2'); p(31, 127 + b, 17, 2, '#f2f2f2');
  p(10, 124 + a, 4, 3, '#efefef'); p(44, 124 + b, 4, 3, '#efefef');
  p(16, 123 + a, 5, 1, '#d8d8d8'); p(37, 123 + b, 5, 1, '#d8d8d8');
}
function meBody(o){
  const { S, SD, T, TL } = ME.col;
  p(23, 42, 12, 7, SD);
  if (o.only === 'bust'){ p(12, 47, 34, 12, S); p(22, 47, 14, 2, SD); return; }
  p(12, 48, 34, 40, T); p(13, 86, 32, 3, T);
  p(26, 48, 6, 2, SD); p(27, 50, 4, 2, SD); p(28, 52, 2, 1, SD);
  p(12, 48, 3, 6, TL); p(43, 48, 3, 6, TL);
  let fx = 17; 'MILANO'.split('').forEach(ch => { FONT[ch].forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '1') p(fx + i, 58 + j, 1, 1, '#cfc7b8'); }); fx += 4; });
  p(16, 65, 26, 1, '#a88a4a'); p(21, 68, 16, 1, '#6d6a72');
  p(16, 76, 10, 1, TL); p(30, 80, 12, 1, TL);
  line(OX + 42, OY + 48, OX + 14, OY + 84, 2, '#45414c');
  p(29, 62, 2, 1, '#ef6b7b'); p(29, 63, 2, 1, '#f6b84b'); p(29, 64, 2, 1, '#7cc3f0'); p(26, 68, 3, 3, '#eaeaea');
  p(5, 80, 14, 15, '#2f2c34'); p(5, 80, 14, 5, '#3d3a43'); p(11, 84, 2, 2, '#77737f');
}
function meHead(o){
  const { B, BL, S } = ME.col;
  q(12, 12, 34, 30, S); q(14, 42, 30, 2, S); q(17, 44, 24, 1, S);
  q(11, 10, 36, 6, B);
  [[12,16,5,5],[17,16,4,3],[21,16,5,6],[26,16,4,3],[30,16,5,5],[35,16,4,3],[39,16,5,7],[11,16,2,9],[44,16,3,10]].forEach(a => q(a[0], a[1], a[2], a[3], B));
  q(10, 14, 4, 26, B); q(44, 14, 4, 26, B);
  q(18, 5, 10, 1, BL); q(32, 7, 7, 1, BL); q(14, 12, 6, 1, BL);
  q(46, 34, 1, 2, '#ececf2');
  const bl = o.blush ? 'rgba(230,100,110,.55)' : 'rgba(230,110,110,.32)';
  q(14, 31, 5, 2, bl); q(39, 31, 5, 2, bl);
  eyes(o.eyes || 'open', 20, 38, 25, o.look || 0);
  const GL = '#8f95a6';
  P.fillStyle = 'rgba(210,225,255,.22)'; P.fillRect(r(OX + HX + 15), r(OY + HY + 22), 11, 8); P.fillRect(r(OX + HX + 33), r(OY + HY + 22), 11, 8);
  [[14, 21], [32, 21]].forEach(([x, y]) => { q(x, y, 13, 1, GL); q(x, y + 9, 13, 1, GL); q(x, y, 1, 10, GL); q(x + 12, y, 1, 10, GL); q(x + 1, y + 1, 2, 1, '#fff'); });
  q(27, 23, 5, 1, GL); q(11, 22, 3, 1, GL); q(45, 22, 2, 1, GL);
  mouth(o.mouth || 'smile', 29, 34, 8, o.amp || 0);
}

// ---------- thumbs up (the pose from your picture) ----------
// fist with curled fingers + a thumb on the side nearest the body (so it reads as 👍)
function fist(fx, fy, inner, S, SD){
  p(fx, fy, 7, 6, S);                                       // fist
  const tx = inner > 0 ? fx + 4 : fx;                        // thumb sits on the inner edge
  p(tx, fy - 4, 3, 4, S); p(tx + (inner > 0 ? 0 : 1), fy - 5, 2, 1, S);
  p(tx + (inner > 0 ? -1 : 3), fy - 1, 1, 2, SD);            // crease between thumb and fingers
  const cx = inner > 0 ? fx : fx + 2;
  for (let k = 0; k < 3; k++) p(cx, fy + 1 + k * 2, 5, 1, SD); // curled fingers
}
function ririThumb(side, w){
  const { S, SD } = RIRI.col;
  if (side < 0){ p(10, 48, 4, 13, S); p(6, 57, 8, 5, S); p(6, 47 + w, 4, 13 - w, S); fist(4, 42 + w, 1, S, SD); return [OX + 7, OY + 44 + w]; }
  p(38, 48, 4, 13, S); p(38, 57, 8, 5, S); p(42, 47 + w, 4, 13 - w, S); fist(41, 42 + w, -1, S, SD); return [OX + 44, OY + 44 + w];
}
function meThumb(side, w){
  const { S, SD } = ME.col;
  if (side > 0){ p(45, 50, 5, 15, S); p(45, 61, 10, 5, S); p(50, 47 + w, 5, 17 - w, S); fist(49, 41 + w, -1, S, SD); p(50, 56 + w, 5, 2, '#e0b84a'); return [OX + 52, OY + 43 + w]; }
  p(8, 50, 5, 15, S); p(3, 61, 10, 5, S); p(3, 47 + w, 5, 17 - w, S); fist(2, 41 + w, 1, S, SD); return [OX + 5, OY + 43 + w];
}

// ---------- public: draw a person in parts ----------
const DEF = { riri: RIRI, me: ME };
const PARTS = {
  riri: { back: ririBack, legs: ririLegs, body: ririBody, head: ririHead, thumb: ririThumb },
  me:   { back: meBack,   legs: meLegs,   body: meBody,   head: meHead,   thumb: meThumb },
};
// o: { x (top-left), y, bob, hdx, hdy, eyes, mouth, amp, blush, look, legs, only:'all'|'bust'|'head', armL, armR, wiggle }
function setup(ctx, who, o){ P = ctx; OX = o.x + (o.jx || 0); OY = o.y; HX = o.hdx || 0; HY = o.hdy || 0; }
function part(ctx, who, name, o){
  setup(ctx, who, o);
  const d = DEF[who], parts = PARTS[who], bob = o.bob || 0;
  if (name === 'legs'){ if (o.only && o.only !== 'all') return; parts.legs(o); return; }
  OY = o.y + bob;
  if (name === 'back') parts.back(o);
  else if (name === 'body'){ if (o.only === 'head') return; parts.body(o); }
  else if (name === 'head') parts.head(o);
  else if (name === 'armL' || name === 'armR'){
    if (o.only === 'head') return;
    const i = name === 'armL' ? 0 : 1, side = i ? 1 : -1, spec = (name === 'armL' ? o.armL : o.armR) || { type: 'down' };
    if (spec.type === 'thumb') return parts.thumb(side, spec.w || 0);
    const [sx, sy] = d.shoulders[i];
    const extra = who === 'me' && i === 0 ? (x0, y0, end) => {
      if (!end) return; const [hx, hy] = end;
      [.3, .45, .55].forEach((f, k) => pa(x0 + (hx - x0) * f - 1 + k % 2, y0 + (hy - y0) * f, 2, 2, k % 2 ? '#c46f64' : '#9a5a63'));
      pa(x0 + (hx - x0) * .8 - 2, y0 + (hy - y0) * .8 - 1, 5, 2, '#8a8a94');
    } : who === 'me' && i === 1 ? (x0, y0, end) => { if (end) pa(x0 + (end[0] - x0) * .82 - 2, y0 + (end[1] - y0) * .82 - 1, 5, 2, '#e0b84a'); } : null;
    return arm(spec, OX + sx, OY + sy, side, d.th, d.col.S, d.col.SD, extra);
  }
}
function draw(ctx, who, o){ ['back', 'legs', 'body', 'head', 'armL', 'armR'].forEach(n => part(ctx, who, n, o)); }

// ---------- props ----------
function bed(ctx, cx, y, t){
  P = ctx; const x = cx - 62;
  // headboard
  pa(x + 2, y, 120, 30, '#c8956b'); pa(x + 4, y + 2, 116, 26, '#dcab80'); pa(x + 2, y, 4, 70, '#b07f58'); pa(x + 118, y, 4, 70, '#b07f58');
  for (let i = 0; i < 5; i++) pa(x + 16 + i * 22, y + 6, 12, 18, '#e8bd94');
  pa(x + 54, y + 9, 16, 12, '#f08aa6'); pa(x + 56, y + 7, 5, 4, '#f08aa6'); pa(x + 63, y + 7, 5, 4, '#f08aa6');
  // pillows
  pa(x + 12, y + 26, 46, 18, '#fbf7f2'); pa(x + 66, y + 26, 46, 18, '#fbf7f2'); pa(x + 12, y + 41, 46, 3, '#e9e2da'); pa(x + 66, y + 41, 46, 3, '#e9e2da');
}
function blanket(ctx, cx, y){
  P = ctx; const x = cx - 62;
  pa(x + 4, y, 116, 46, '#f6a8bd'); pa(x + 4, y, 116, 6, '#ffd2de'); pa(x + 4, y + 6, 116, 1, '#e98aa4');
  for (let j = 0; j < 3; j++) for (let i = 0; i < 7; i++){ const hx = x + 12 + i * 16 + (j % 2) * 8, hy = y + 12 + j * 11; pa(hx, hy, 2, 2, '#ffe4ec'); pa(hx + 3, hy, 2, 2, '#ffe4ec'); pa(hx, hy + 2, 5, 1, '#ffe4ec'); pa(hx + 1, hy + 3, 3, 1, '#ffe4ec'); pa(hx + 2, hy + 4, 1, 1, '#ffe4ec'); }
  pa(x + 4, y + 44, 116, 2, '#e98aa4');
  pa(x + 6, y + 46, 4, 8, '#b07f58'); pa(x + 114, y + 46, 4, 8, '#b07f58');
  // two little bumps for your bodies
  pa(x + 20, y + 2, 30, 3, '#f9b9cb'); pa(x + 74, y + 2, 32, 3, '#f9b9cb');
}
function tub(ctx, cx, y, front){
  P = ctx; const x = cx - 36;
  if (!front){ pa(x + 2, y, 68, 6, '#e9eef3'); return; }
  pa(x, y + 4, 72, 28, '#ffffff'); pa(x + 2, y + 26, 68, 6, '#e3e9ef'); pa(x, y + 4, 72, 3, '#f1f5f8');
  pa(x - 2, y + 2, 76, 4, '#eef3f7'); pa(x + 6, y + 32, 5, 6, '#e0b84a'); pa(x + 61, y + 32, 5, 6, '#e0b84a');
  pa(x + 6, y + 10, 2, 12, '#f7fafc');
}
function duck(ctx, x, y){ P = ctx; pa(x, y + 2, 7, 4, '#ffd23c'); pa(x + 4, y, 4, 4, '#ffd23c'); pa(x + 8, y + 1, 2, 2, '#ff8a3c'); pa(x + 6, y + 1, 1, 1, DK); }

window.People = { draw, part, DEF, bed, blanket, tub, duck };
})();

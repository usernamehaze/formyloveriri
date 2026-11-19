// 🏡 Rooms of your little house, drawn in pixel art.
// Rooms.draw(ctx, room, { night, photo(frameId) -> Image|null, awake }) paints the background.
// Rooms.FRAMES lists the photo frames in each room (tap one to choose its photo).
(function(){
'use strict';
const W = 180, H = 260, r = Math.round;
let P;
const pa = (x, y, w, h, c) => { P.fillStyle = c; P.fillRect(r(x), r(y), w, h); };
const box = (x, y, w, h, fill, edge) => { pa(x, y, w, h, edge); pa(x + 1, y + 1, w - 2, h - 2, fill); };
const HEART = ['01010','11111','11111','01110','00100'];
const heart = (x, y, c, s = 1) => { P.fillStyle = c; HEART.forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '1') P.fillRect(r(x + i * s), r(y + j * s), s, s); }); };

const ROOMS = [
  { id: 'yard',     icon: '🏡', name: 'outside' },
  { id: 'living',   icon: '🛋️', name: 'living room' },
  { id: 'kitchen',  icon: '🍳', name: 'kitchen' },
  { id: 'bedroom',  icon: '🛏️', name: 'bedroom' },
  { id: 'bathroom', icon: '🛁', name: 'bathroom' },
  { id: 'pets',     icon: '🐾', name: 'fur babies' },
];
const FRAMES = {
  yard: [],
  living:   [{ id: 'living1', x: 16, y: 30, w: 44, h: 44, label: 'living room · big frame', style: 'gold' }, { id: 'living2', x: 66, y: 40, w: 26, h: 26, label: 'living room · small frame', style: 'wood' }],
  kitchen:  [{ id: 'kitchen1', x: 9, y: 64, w: 24, h: 24, label: 'kitchen · fridge photo', style: 'polaroid' }],
  bedroom:  [{ id: 'bed1', x: 66, y: 30, w: 46, h: 40, label: 'bedroom · above the bed', style: 'gold' }, { id: 'bed2', x: 9, y: 146, w: 18, h: 18, label: 'bedroom · nightstand', style: 'wood' }],
  bathroom: [{ id: 'bath1', x: 72, y: 44, w: 26, h: 26, label: 'bathroom · little frame', style: 'white' }],
  pets:     [{ id: 'pets1', x: 70, y: 34, w: 40, h: 36, label: 'fur babies room · frame', style: 'paw' }],
};

// ---------- shared bits ----------
function sky(x, y, w, h, night){
  const g = P.createLinearGradient(0, y, 0, y + h);
  if (night){ g.addColorStop(0, '#26244f'); g.addColorStop(1, '#4b3f7a'); } else { g.addColorStop(0, '#9fd4ff'); g.addColorStop(1, '#ffe2ec'); }
  P.fillStyle = g; P.fillRect(x, y, w, h);
}
function windowView(x, y, w, h, night, curtains){
  box(x - 2, y - 2, w + 4, h + 4, '#ffffff', '#c9b8a8');
  sky(x, y, w, h, night);
  if (night){ pa(x + w - 12, y + 5, 6, 6, '#fff3c4'); pa(x + w - 10, y + 4, 5, 5, '#4b3f7a'); for (let i = 0; i < 6; i++) pa(x + 3 + (i * 13) % (w - 6), y + 3 + (i * 7) % (h / 2), 1, 1, '#fff'); }
  else { pa(x + 4, y + 6, 12, 4, '#fff'); pa(x + 7, y + 4, 6, 3, '#fff'); pa(x + w - 14, y + 10, 10, 3, '#fff'); }
  for (let i = 0; i < w; i += 2){ const hh = 6 + Math.sin((x + i) * .2) * 3; pa(x + i, y + h - hh, 2, hh, night ? '#3d5a4a' : '#8fd17c'); }
  pa(x + w * .3, y + h - 14, 3, 8, night ? '#4a3a33' : '#a0754e'); pa(x + w * .3 - 4, y + h - 20, 11, 8, night ? '#2f4a3c' : '#6fbf67');
  pa(x + w / 2 - 1, y, 2, h, '#ffffff'); pa(x, y + h / 2 - 1, w, 2, '#ffffff');
  pa(x - 3, y + h + 1, w + 6, 3, '#e7d8c6');
  if (curtains){
    for (let j = 0; j < h + 8; j++){ const sway = r(Math.sin(j * .15) * 1); pa(x - 6 + sway, y - 4 + j, 8, 1, j % 6 < 3 ? curtains[0] : curtains[1]); pa(x + w - 2 - sway, y - 4 + j, 8, 1, j % 6 < 3 ? curtains[0] : curtains[1]); }
    pa(x - 8, y - 6, w + 16, 3, '#b58d6a');
  }
}
function frame(f, img){
  const { x, y, w, h, style } = f;
  const edge = { gold: ['#e2b446', '#f6cf68'], wood: ['#9a6b45', '#c08b5c'], polaroid: ['#d9d2cc', '#ffffff'], white: ['#c9c2c8', '#ffffff'], paw: ['#e48a6a', '#f7b39a'] }[style] || ['#9a6b45', '#c08b5c'];
  pa(x + 2, y + 2, w, h, 'rgba(74,42,53,.15)');
  pa(x - 2, y - 2, w + 4, h + 4 + (style === 'polaroid' ? 6 : 0), edge[0]); pa(x - 1, y - 1, w + 2, h + 2 + (style === 'polaroid' ? 6 : 0), edge[1]);
  if (img && img.complete && img.naturalWidth){
    const iw = img.naturalWidth, ih = img.naturalHeight, ar = w / h;
    let sw = iw, sh = iw / ar; if (sh > ih){ sh = ih; sw = ih * ar; }
    P.imageSmoothingEnabled = true; P.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  } else { pa(x, y, w, h, '#fde5ea'); heart(x + w / 2 - 5, y + h / 2 - 4, '#ef6b8b', 2); }
  if (style === 'polaroid') pa(x + w / 2 - 3, y - 4, 6, 3, '#ff7aa8');
  if (style === 'paw'){ pa(x - 4, y - 4, 3, 3, '#e48a6a'); pa(x + w + 1, y - 4, 3, 3, '#e48a6a'); }
}
function floorWood(y, a = '#d9b48c', b = '#cfa77c'){ pa(0, y, W, H - y, a); for (let yy = y + 6; yy < H; yy += 7) pa(0, yy, W, 1, b); for (let yy = y, k = 0; yy < H; yy += 7, k++) for (let x = (k % 2) * 24; x < W; x += 48) pa(x, yy, 1, 7, b); }
function baseboard(y, c = '#e8d9c6'){ pa(0, y, W, 4, c); pa(0, y + 4, W, 1, 'rgba(0,0,0,.08)'); }
function lotus(x, y){ pa(x - 4, y + 3, 3, 1, '#bccba5'); pa(x + 2, y + 3, 3, 1, '#bccba5'); pa(x - 1, y - 4, 3, 6, '#f3bcc6'); pa(x - 4, y - 2, 3, 4, '#f3bcc6'); pa(x + 2, y - 2, 3, 4, '#f3bcc6'); pa(x, y - 3, 1, 4, '#e79aaa'); }
function plant(x, y){ pa(x, y, 14, 14, '#e9e2d8'); pa(x - 1, y - 2, 16, 3, '#f6f1ea'); for (let i = 0; i < 5; i++){ pa(x + 2 + i * 2, y - 12 + (i % 2) * 3, 2, 12, i % 2 ? '#5aa063' : '#3f7d4c'); pa(x - 3 + i * 4, y - 16 + (i % 3) * 2, 5, 3, '#6fbf67'); } }

// ---------- rooms ----------
function yard(o){
  sky(0, 0, W, 175, o.night);
  if (o.night){ pa(140, 18, 12, 12, '#fff3c4'); pa(144, 16, 10, 10, '#2c2a58'); for (let i = 0; i < 22; i++) pa((i * 37) % W, (i * 23) % 110, 1, 1, '#fff'); }
  else { pa(140, 16, 16, 16, '#fff3b0'); pa(138, 20, 20, 8, '#fff3b0'); pa(14, 20, 26, 6, '#fff'); pa(20, 16, 14, 5, '#fff'); pa(100, 34, 20, 5, '#fff'); }
  for (let x = 0; x < W; x += 2){ const hh = 22 + Math.sin(x * .05) * 8 + Math.sin(x * .13) * 4; pa(x, 172 - hh, 2, hh, o.night ? '#3a5a52' : '#b9e2a4'); }
  // the house
  const wall = o.night ? '#d9b7c4' : '#fbe1d8', wall2 = o.night ? '#c9a5b3' : '#f2cdc1', roof = '#c96b7d', roofD = '#a8546a', lit = o.night ? '#ffe08a' : '#cfeaff';
  pa(36, 92, 108, 80, wall); for (let y = 96; y < 172; y += 5) pa(36, y, 108, 1, wall2);
  for (let y = 46; y <= 94; y++){ const hw = (y - 46) * 1.22 + 2; pa(90 - hw, y, hw * 2, 1, ((y - 46) % 6 < 1) ? roofD : roof); }
  pa(24, 92, 132, 4, '#fff'); pa(26, 96, 128, 1, 'rgba(0,0,0,.1)');
  pa(116, 52, 12, 26, '#b5596b'); pa(114, 50, 16, 4, '#8f4456');
  box(83, 62, 14, 14, lit, '#ffffff'); heart(85, 66, '#ff7aa8', 2);
  [[46, 104], [116, 104]].forEach(([x, y]) => { box(x, y, 20, 18, lit, '#ffffff'); pa(x + 9, y, 2, 18, '#fff'); pa(x - 2, y + 18, 24, 3, '#fff'); pa(x - 4, y - 1, 4, 20, '#7cc3a5'); pa(x + 20, y - 1, 4, 20, '#7cc3a5'); });
  [[42, 136], [118, 136]].forEach(([x, y]) => { box(x, y, 22, 20, lit, '#ffffff'); pa(x + 10, y, 2, 20, '#fff'); pa(x - 2, y + 20, 26, 3, '#fff'); pa(x, y + 22, 22, 4, '#f28aa6'); for (let i = 0; i < 5; i++) pa(x + 2 + i * 4, y + 21, 2, 2, ['#ffd23c', '#ff7aa8', '#fff'][i % 3]); });
  box(78, 130, 24, 42, '#e48aa0', '#ffffff'); pa(80, 132, 20, 38, '#d97790'); heart(85, 138, '#fff', 2); pa(96, 152, 2, 3, '#ffd23c');
  pa(74, 124, 32, 4, '#fff'); pa(72, 120, 36, 5, roof);
  pa(103, 128, 4, 5, o.night ? '#ffe08a' : '#fff3c4');
  // fence, bushes, path, lawn
  pa(0, 170, W, 90, o.night ? '#4f7f56' : '#8fd17c');
  for (let y = 176; y < H; y += 8) pa(0, y, W, 4, o.night ? '#4a7752' : '#86c973');
  for (let x = 0; x < 36; x += 6){ pa(x, 150, 4, 22, '#fff'); pa(x + 1, 148, 2, 2, '#fff'); } for (let x = 146; x < W; x += 6){ pa(x, 150, 4, 22, '#fff'); pa(x + 1, 148, 2, 2, '#fff'); }
  pa(0, 156, 36, 2, '#fff'); pa(0, 164, 36, 2, '#fff'); pa(146, 156, 34, 2, '#fff'); pa(146, 164, 34, 2, '#fff');
  [[30, 162], [140, 162]].forEach(([x, y]) => { pa(x, y, 14, 10, '#5aa063'); pa(x + 2, y - 3, 10, 4, '#6fbf67'); pa(x + 3, y + 1, 2, 2, '#ff7aa8'); pa(x + 9, y + 3, 2, 2, '#fff'); });
  for (let i = 0; i < 6; i++){ const k = i / 5, w = 10 + k * 26, y = 174 + i * 13; pa(90 - w / 2, y, w, 5, '#f6d3c4'); pa(90 - w / 2, y + 5, w, 1, '#e3b8a6'); }
  // mailbox (tap it for letters)
  pa(162, 150, 3, 26, '#9a6b45'); box(154, 138, 20, 13, '#ff8fab', '#c9566f'); pa(156, 140, 16, 2, '#ffb3c6'); heart(161, 143, '#fff');
  // tree with a swing
  pa(4, 70, 6, 100, '#a0754e'); pa(-10, 46, 40, 32, '#6fbf67'); pa(-4, 38, 30, 14, '#86cf6c'); pa(2, 60, 4, 4, '#ff7aa8'); pa(18, 52, 4, 4, '#ff7aa8');
  pa(14, 78, 1, 50, '#d6c3aa'); pa(26, 78, 1, 50, '#d6c3aa'); pa(12, 128, 17, 3, '#c99a6e');
}
function living(o){
  pa(0, 0, W, 192, '#f7ecdd');
  for (let y = 16; y < 190; y += 26) for (let x = (y / 26 % 2 ? 14 : 2); x < W; x += 26) lotus(x, y);
  baseboard(190); floorWood(195);
  windowView(116, 26, 46, 52, o.night, ['#ffc2d1', '#f7a8bd']);
  FRAMES.living.forEach(f => frame(f, o.photo(f.id)));
  // shelf with books
  pa(66, 84, 40, 3, '#c08b5c'); [['#7cc3f0', 7], ['#f49ab0', 9], ['#f6c34a', 6], ['#9b8ae0', 8]].forEach(([c, h], i) => pa(68 + i * 5, 84 - h, 4, h, c)); pa(92, 78, 8, 6, '#6fbf67');
  // sofa
  pa(10, 140, 160, 36, '#e48aa0'); pa(10, 140, 160, 4, '#f2a6b8'); for (let i = 0; i < 3; i++) box(16 + i * 50, 146, 48, 24, '#f09bb0', '#d6768f');
  pa(4, 150, 14, 40, '#d6768f'); pa(162, 150, 14, 40, '#d6768f'); pa(10, 176, 160, 14, '#d6768f'); pa(14, 190, 4, 4, '#8a5a3a'); pa(162, 190, 4, 4, '#8a5a3a');
  box(24, 150, 14, 12, '#fff3b0', '#e2b446'); box(140, 150, 14, 12, '#d4ecff', '#79b7e8');
  // rug + lamp + plant
  for (let y = -10; y <= 10; y++){ const w = r(76 * Math.sqrt(1 - y * y / 100)); pa(90 - w, 238 + y, w * 2, 1, y % 4 === 0 ? '#f7cdd7' : '#f0b3c2'); }
  pa(170, 60, 2, 130, '#8a7a6a'); pa(163, 52, 16, 10, '#fff3c4'); if (o.night){ P.fillStyle = 'rgba(255,230,150,.25)'; P.fillRect(150, 60, 30, 60); }
  plant(2, 178);
}
function kitchen(o){
  pa(0, 0, W, 192, '#eef8f3'); for (let y = 0; y < 192; y += 8) pa(0, y, W, 1, '#d8ece2'); for (let x = 0; x < W; x += 8) pa(x, 0, 1, 192, '#d8ece2');
  // upper cabinets
  for (let i = 0; i < 3; i++){ box(48 + i * 26, 8, 24, 36, '#a9dcc7', '#7fbca3'); pa(48 + i * 26 + 18, 24, 2, 5, '#fff'); }
  windowView(132, 18, 38, 40, o.night, ['#ffd6a5', '#ffc48a']);
  // counter
  pa(40, 118, 140, 6, '#f3e7d3'); pa(40, 124, 140, 68, '#a9dcc7'); for (let i = 0; i < 5; i++){ box(42 + i * 28, 130, 26, 58, '#b9e6d3', '#7fbca3'); pa(42 + i * 28 + 11, 136, 4, 2, '#fff'); }
  // stove + pot + sink
  pa(70, 112, 30, 6, '#3b3943'); pa(73, 113, 8, 2, '#ef6b5b'); pa(87, 113, 8, 2, '#ef6b5b');
  pa(76, 98, 20, 14, '#e9e9ee'); pa(74, 98, 24, 3, '#c9c9d2'); pa(70, 101, 6, 2, '#c9c9d2');
  pa(118, 112, 34, 6, '#c9d6de'); pa(132, 98, 3, 14, '#b8bcc8'); pa(132, 98, 10, 3, '#b8bcc8');
  pa(54, 106, 10, 12, '#fff'); pa(56, 102, 6, 4, '#f49ab0');  // jar
  for (let i = 0; i < 3; i++){ pa(110 + i * 8, 60, 1, 10, '#8a8a94'); pa(108 + i * 8, 70, 5, 6, ['#f6c34a', '#ef6b7b', '#7cc3f0'][i]); }
  // fridge with photo
  pa(2, 34, 38, 158, '#f4f4f8'); pa(2, 34, 38, 2, '#ffffff'); pa(2, 100, 38, 2, '#d8d8e0'); pa(34, 50, 2, 30, '#c9c9d2'); pa(34, 110, 2, 40, '#c9c9d2');
  pa(10, 112, 6, 6, '#ff7aa8'); pa(20, 118, 6, 6, '#7cc3f0'); pa(12, 126, 8, 5, '#f6c34a');
  FRAMES.kitchen.forEach(f => frame(f, o.photo(f.id)));
  // checkered floor
  for (let y = 192; y < H; y += 8) for (let x = 0; x < W; x += 8) pa(x, y, 8, 8, ((x + y) / 8) % 2 ? '#ffd9e2' : '#ffffff');
}
function bedroom(o){
  pa(0, 0, W, 192, o.night ? '#cfc4ea' : '#ece5f8');
  for (let y = 10; y < 190; y += 20) for (let x = (y / 20 % 2 ? 10 : 0); x < W; x += 20){ pa(x, y, 1, 3, '#d9cdf0'); pa(x - 1, y + 1, 3, 1, '#d9cdf0'); }
  baseboard(190, '#d9cdf0');
  pa(0, 195, W, H - 195, '#d8c6ee'); for (let y = 199; y < H; y += 4) for (let x = (y % 8 ? 0 : 2); x < W; x += 4) pa(x, y, 1, 1, '#cbb7e4');
  windowView(124, 24, 44, 60, o.night, ['#c9b3f2', '#b49be6']);
  FRAMES.bedroom.forEach(f => { if (f.id !== 'bed2') frame(f, o.photo(f.id)); });
  // fairy lights
  for (let i = 0; i < 12; i++){ const x = 8 + i * 9, y = 12 + r(Math.sin(i * .9) * 3); pa(x, y - 2, 1, 2, '#9a8ab0'); pa(x, y, 2, 2, ['#ffe08a', '#ff9ab8', '#a6e3ff'][i % 3]); }
  // nightstand + lamp + small frame
  pa(4, 168, 28, 24, '#c8956b'); pa(4, 168, 28, 3, '#dcab80'); pa(16, 178, 4, 2, '#8a5a3a');
  FRAMES.bedroom.forEach(f => { if (f.id === 'bed2') frame(f, o.photo(f.id)); });
  pa(28, 150, 2, 18, '#8a7a6a'); pa(23, 142, 12, 9, '#ffe9a8'); if (o.night){ P.fillStyle = 'rgba(255,225,140,.3)'; P.fillRect(10, 136, 40, 40); }
  if (o.awake && window.People){ People.bed(P, 90, 148); People.blanket(P, 90, 188); }
  // slippers
  pa(140, 246, 10, 4, '#ff9ab8'); pa(152, 247, 10, 4, '#ff9ab8');
}
function bathroom(o){
  pa(0, 0, W, 192, '#dff1fb'); for (let y = 0; y < 192; y += 10) pa(0, y, W, 1, '#c6e4f3'); for (let y = 0, k = 0; y < 192; y += 10, k++) for (let x = (k % 2) * 5; x < W; x += 10) pa(x, y, 1, 10, '#c6e4f3');
  pa(0, 100, W, 4, '#f49ab0');
  pa(68, 14, 34, 24, '#c6e4f3'); windowView(70, 14, 30, 22, o.night, null);
  FRAMES.bathroom.forEach(f => frame(f, o.photo(f.id)));
  // mirror + sink
  pa(122, 34, 40, 56, '#b8c9d6'); pa(124, 36, 36, 52, '#e9f6ff'); pa(128, 40, 4, 14, '#ffffff'); pa(134, 42, 2, 8, '#ffffff');
  pa(124, 112, 36, 10, '#ffffff'); pa(122, 110, 40, 3, '#f1f5f8'); pa(136, 122, 12, 70, '#f4f7fa'); pa(140, 100, 3, 10, '#b8bcc8'); pa(140, 100, 8, 2, '#b8bcc8');
  pa(126, 104, 6, 6, '#ffb3c6'); pa(150, 102, 4, 8, '#a6e3ff');
  // towel rack
  pa(10, 70, 30, 2, '#b8bcc8'); pa(14, 72, 22, 34, '#ff9ab8'); for (let y = 76; y < 106; y += 6) pa(14, y, 22, 1, '#ffc2d1');
  // tub (when nobody is in it)
  if (o.awake && window.People){ People.tub(P, 64, 202, false); People.tub(P, 64, 202, true); pa(28, 160, 2, 44, '#b8bcc8'); pa(28, 160, 14, 2, '#b8bcc8'); pa(38, 162, 6, 3, '#b8bcc8'); }
  for (let y = 192; y < H; y += 10) for (let x = 0; x < W; x += 10) pa(x, y, 10, 10, ((x + y) / 10) % 2 ? '#d4ecff' : '#f7fbff');
  pa(150, 236, 24, 12, '#ffd2de'); for (let i = 0; i < 6; i++) pa(150 + i * 4, 248, 2, 2, '#ffd2de');
}
function pets(o){
  pa(0, 0, W, 192, '#fff1c9');
  for (let y = 14; y < 190; y += 22) for (let x = (y / 22 % 2 ? 12 : 0); x < W; x += 24){ pa(x, y + 2, 4, 3, '#f3dc9e'); pa(x - 2, y - 1, 2, 2, '#f3dc9e'); pa(x + 1, y - 2, 2, 2, '#f3dc9e'); pa(x + 4, y - 1, 2, 2, '#f3dc9e'); }
  baseboard(190, '#f3dc9e'); floorWood(195, '#e8c9a0', '#dcb98c');
  windowView(128, 26, 42, 50, o.night, ['#a9dcc7', '#8fcdb5']);
  FRAMES.pets.forEach(f => frame(f, o.photo(f.id)));
  // bunting
  for (let i = 0; i < 9; i++){ const x = 4 + i * 13; pa(x, 8, 12, 1, '#c99a6e'); for (let j = 0; j < 6; j++) pa(x + j, 9 + j, 12 - j * 2, 1, ['#ff9ab8', '#7cc3f0', '#f6c34a'][i % 3]); }
  // cat tree
  pa(16, 110, 6, 86, '#e3cba5'); pa(36, 150, 6, 46, '#e3cba5'); for (let y = 112; y < 196; y += 4) pa(16, y, 6, 1, '#cfb48a');
  box(4, 104, 34, 8, '#ff9ab8', '#d9708f'); box(24, 144, 26, 7, '#ff9ab8', '#d9708f'); box(2, 186, 48, 8, '#ff9ab8', '#d9708f');
  pa(8, 92, 26, 12, '#f2a0b4'); pa(10, 94, 22, 8, '#ffc2d1'); pa(30, 112, 2, 12, '#d6c3aa'); pa(28, 124, 6, 6, '#ff7aa8');
  // dog bed
  for (let y = -9; y <= 9; y++){ const w = r(30 * Math.sqrt(1 - y * y / 81)); pa(140 - w, 238 + y, w * 2, 1, y < -4 ? '#5f8fcc' : '#86aee0'); } pa(122, 236, 36, 6, '#d4ecff');
  // bowls
  pa(70, 238, 14, 8, '#ff9ab8'); pa(72, 236, 10, 2, '#ffc2d1'); pa(96, 238, 16, 8, '#7cc3f0'); pa(98, 236, 12, 2, '#a6d6f6'); pa(68, 246, 46, 3, '#f3dc9e');
  // toys
  pa(112, 250, 6, 6, '#ef6b7b'); pa(113, 251, 2, 2, '#ffb3c6'); pa(52, 248, 7, 7, '#9b8ae0'); pa(54, 250, 3, 1, '#c9b3f2');
}
const DRAW = { yard, living, kitchen, bedroom, bathroom, pets };
function draw(ctx, room, o){ P = ctx; ctx.imageSmoothingEnabled = false; (DRAW[room] || yard)(Object.assign({ night: false, photo: () => null, awake: true }, o)); }

window.Rooms = { ROOMS, FRAMES, draw };
})();

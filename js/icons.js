// 🎨 Pixel icon set: every emoji in the app is swapped for one of these hand-made pixel icons.
// PixelIcons.html(name) → <img>, PixelIcons.canvasFor(emoji) → canvas for drawing in the game.
(function(){
'use strict';
const PAL = {
  w:'#ffffff', r:'#e8435a', R:'#b8304a', p:'#ff8fab', P:'#ffc2d1', o:'#f59a3c', O:'#c9741c', y:'#ffd23c', Y:'#d9a520',
  g:'#6fbf67', G:'#3f8f4a', b:'#7cc3f0', B:'#3f7fc4', c:'#fff1d6', n:'#a0704a', N:'#6b4530', s:'#c9ccd6', S:'#7d7a88',
  l:'#c4adf0', L:'#8a6fd4', t:'#f2c29b', m:'#8fd6b8', M:'#4fae88', x:'#2b2230', k:'#4a2a35', e:'#efe0c6',
};
const I = {
  heart:   ['.rr..rr.','rPrrrrrr','rPrrrrrr','rrrrrrrr','.rrrrrr.','..rrrr..','...rr...'],
  heartp:  ['.pp..pp.','pPpppppp','pPpppppp','pppppppp','.pppppp.','..pppp..','...pp...'],
  hearty:  ['.yy..yy.','ywyyyyyy','ywyyyyyy','yyyyyyyy','.yyyyyy.','..yyyy..','...yy...'],
  hug:     ['.pp.pp.....','pPpppppp...','ppppppp.rr.rr','.ppppp.rPrrrr','..ppp..rrrrrr','...p....rrrr.','.........rr..'],
  home:    ['....rr....','...rrrr...','..rrrrrr..','.rrrrrrrr.','rrrrrrrrrr','.cccccccc.','.cbbccnnc.','.cbbccnnc.','.cccccnnc.'],
  play:    ['.llllllll.','llwllllpll','lwwwllplpl','llwllllpll','llllllllll','lll....lll','.l......l.'],
  mic:     ['..ssss..','.sSssSs.','.ssssss.','.sSssSs.','.ssssss.','s.ssss.s','.s.nn.s.','..ssss..','...nn...','.nnnnnn.'],
  camera:  ['..pppp....','PPPPPPPPyP','PPPbbbbPPP','PPbBBBBbPP','PPbBwBBbPP','PPbBBBBbPP','PPPbbbbPPP','PPPPPPPPPP'],
  letter:  ['wwwwwwwwwww','wPwwwwwwwPw','wwPwwwwwPww','wwwPwwwPwww','wwwwPrPwwww','wwwwrrrwwww','wwwwwrwwwww','wwwwwwwwwww'],
  link:    ['.mmmm.....','m....m....','m....m....','m...mmmmm.','.mmmmm...m','....m....m','....m....m','.....mmmm.'],
  cherry:  ['....GG..','...G.G..','..G...G.','.G....G.','rr...rr.','rPr.rPr.','rrr.rrr.','.r...r..'],
  star:    ['....y....','...yyy...','yyyyyyyyy','.yyyYyyy.','..yyyyy..','.yyy.yyy.','.yy...yy.'],
  bolt:    ['...yyy','..yyy.','.yyy..','yyyyyy','...yy.','..yy..','.yy...','yy....'],
  bubbles: ['.bbb......','bwbbb.....','bbbbb.bb..','bbbbb.wbb.','.bbb..bbb.','......bb..','..bb......','.bwb......','..bb......'],
  bow:     ['pp....pp','pPp..pPp','pPPrrPPp','pPPrrPPp','pPp..pPp','pp.pp.pp','...p..p.'],
  glasses: ['SSSS..SSSS','SbbSSSSbbS','SbbS..SbbS','SSSS..SSSS'],
  cat:     ['w.....w','ww...ww','wwwwwww','wowwwow','wwwpwww','.wwwww.'],
  dog:     ['ewwwwwwe','ewwwwwwe','ewxwwxwe','ewwwwwwe','.wwxxww.','..wwww..'],
  tree:    ['..gggg..','.gggggg.','gggGgggg','gggggGgg','.gggggg.','...nn...','...nn...','..nnnn..'],
  sofa:    ['.pppppppp.','.pPPPPPPp.','pppppppppp','pPPPPPPPPp','pppppppppp','n........n'],
  pot:     ['...w.w...','..w.w....','SSSSSSSSS','SsssssssS','.sssssss.','.sssssss.','..sssss..'],
  bed:     ['n........','nww......','nwwpppppp','nPPPPPPPP','npppppppp','n.......n'],
  tub:     ['S.........','Sb.b.b....','wwwwwwwwww','wbbbbbbbbw','.wwwwwwww.','.y......y.'],
  paw:     ['..p..p..','.pp..pp.','p......p','pp.pp.pp','..pppp..','.pppppp.','.pppppp.','..pppp..'],
  mailbox: ['.pppppp.r.','pPPPPPPprr','pPPPPPPpr.','pppppppp..','...nn.....','...nn.....'],
  tv:      ['..S...S..','...S.S...','SSSSSSSSS','SbbbbbbbS','SbBbbbbbS','SbbbbbbbS','SSSSSSSSS','.S.....S.'],
  plate:   ['.wwwww.','wPPPPPw','wPrrrPw','wPPPPPw','.wwwww.'],
  moon:    ['..yyy..','.yyy...','yyy....','yyy....','yyy...y','.yyyyy.','..yyy..'],
  sun:     ['y..y..y','.y.y.y.','..yyy..','yyyyyyy','..yyy..','.y.y.y.','y..y..y'],
  ball:    ['..yyyy..','.yyyyyy.','ywyyyyyy','yywwyyyy','yyyywwyy','yyyyyywy','.yyyyyy.','..yyyy..'],
  yarn:    ['..llll..','.lLlllL.','lllLlLll','lLlllLll','llLllllL','.lllLll.','..llll.l','.......l'],
  journal: ['nnnnnnnn','nPPPPPPw','nPrPPPPw','nPPPPPPw','nPPPPPPw','nPPPPPPw','nnnnnnnn'],
  photo:   ['wwwwwwww','wbbbbbbw','wbbbybbw','wggbbbbw','wgggggbw','wwwwwwww','wwwwwwww'],
  voice:   ['..SSSS..','.S....S.','S......S','pp....pp','pp....pp','pp....pp'],
  pencil:  ['......pp','.....ypp','....yyy.','...yyy..','..yyy...','.cyy....','cxc.....','xc......'],
  trash:   ['..SSS..','SSSSSSS','.sssss.','.sSsSs.','.sSsSs.','.sSsSs.','.sssss.'],
  frame:   ['YYYYYYYY','YbbbbbbY','YbbbbbbY','YggbbbbY','YgggggbY','YYYYYYYY'],
  send:    ['........w','......ww.','....wwbw.','..wwwbw..','wwwwbww..','..wwbw...','...w.w...','....w....'],
  sparkle: ['...y...','...y...','..yyy..','yyywyyy','..yyy..','...y...','...y...'],
  thumb:   ['..tt....','..tt....','.ttt....','tttttttt','bttttttt','btttttt.','bttttttt','btttttt.'],
  kiss:    ['.rr.rr.','rrrrrrr','RRRRRRR','.rrrrr.','..rrr..'],
  face:    ['..yyyy..','.yyyyyy.','yykyykyy','yyyyyyyy','ypyyyypy','yykkkkyy','.yyyyyy.','..yyyy..'],
  dotg:    ['.gg.','gggg','gggg','.gg.'],
  doty:    ['.yy.','yyyy','yyyy','.yy.'],
  dotr:    ['.rr.','rrrr','rrrr','.rr.'],
  warn:    ['...y...','..yyy..','..yxy..','.yyxyy.','.yyyyy.','yyyxyyy','yyyyyyy'],
  stop:    ['rrrrrr','rwwwwr','rwwwwr','rwwwwr','rwwwwr','rrrrrr'],
  trophy:  ['yyyyyyy','yYyyyYy','.yyyyy.','..yyy..','...y...','..YYY..','.yyyyy.'],
  zzz:     ['lllll..','...l...','..l....','lllll..','....bbb','.....b.','....bbb'],
  ear:     ['.tttt.','tt..tt','t..t.t','...t.t','..t.tt','..ttt.','.tt...'],
  // food
  strawberry: ['..GgG..','.rrGrr.','rryrryr','rrrrrrr','ryrryrr','.rrrrr.','..rrr..','...r...'],
  orange:  ['...Gg..','.ooooo.','oowoooo','ooooooo','oooooOo','ooooOOo','.ooooo.'],
  icecream:['..pp...','.pPpp..','pPpppp.','pppppp.','.oooo..','.oOoo..','..oo...','..o....'],
  flan:    ['..NNNN..','.NnnnnN.','.yyyyyy.','yyyyyyyy','YyyyyyyY','wwwwwwwwww'],
  soup:    ['..w..w...','...w..w..','grooggrog','bbbbbbbbb','.bbbbbbb.','..bbbbb..'],
  adobo:   ['..ww..NN..','.wwwwNNNN.','wwwwwNnNNN','ssssssssss','.ssssssss.'],
  ramen:   ['.....nn...','....nn..n.','yywyyyyny.','ywOwyGyyy.','rrrrrrrrrr','.rrrrrrrr.','..rrrrrr..'],
  chicken: ['...oooo.','..oOoooo','..oooooo','..ooooo.','.wooo...','ww......','w.......'],
  milktea: ['.....p.','....p..','wwwwwww','.ccccc.','.ccccc.','.cxcxc.','.xcxcx.','..ccc..'],
  coffee:  ['..w.w...','...w.w..','wwwwww..','wNNNNwww','wNNNNw.w','wwwwwwww','.wwwww..'],
  fish:    ['...bbb...b','.bbbbbbbbb','bwbbbbbbb.','bbbbbbbbb.','.bbbbbbbbb','...bbb...b'],
  can:     ['SSSSSS','ssssss','bbbbbb','bwbbbb','ssssss','SSSSSS'],
  milk:    ['..bb..','.wwww.','wwwwww','wbbbbw','wwwwww','wwwwww'],
  bone:    ['ww....ww','wwwwwwww','wwwwwwww','ww....ww'],
  meat:    ['..rrrr..','.rRrrrr.','rrrrrRrr','rrRrrrrr','.rrrrrw.','......ww','......w.'],
  carrot:  ['....gg','...gg.','..oo..','.ooo..','.oo...','oo....','o.....'],
  cake:    ['...r...','.PPPPP.','ppppppp','PPPPPPP','ppppppp'],
  rice:    ['.wwww.','wwwwww','wwxwww','wwwwww','.wwww.'],
};
const EMO = {
  '❤':'heart','♥':'heart','💕':'hug','💗':'heartp','💖':'heartp','💞':'hug','💓':'heartp','💘':'heartp','💛':'hearty','💝':'heartp','🫶':'hug','🤍':'heartp',
  '🏠':'home','🏡':'tree','🎮':'play','🎤':'mic','🎙':'mic','📷':'camera','📸':'photo','💌':'letter','✉':'letter','📨':'letter','📬':'mailbox','🔗':'link',
  '🍒':'cherry','⭐':'star','🌟':'star','✨':'sparkle','🎉':'sparkle','⚡':'bolt','🫧':'bubbles','🧼':'bubbles','🎀':'bow','👓':'glasses','🐱':'cat','🐈':'cat','🐶':'dog','🐕':'dog','🐾':'paw',
  '🛋':'sofa','🍳':'pot','🛏':'bed','🛁':'tub','📺':'tv','🍽':'plate','🌙':'moon','☀':'sun','💤':'zzz','😴':'zzz','😪':'zzz','🎾':'ball','🧶':'yarn','📔':'journal','📖':'journal','🖼':'frame',
  '🎧':'voice','🔊':'voice','✏':'pencil','✍':'pencil','🛠':'pencil','🗑':'trash','📤':'send','👍':'thumb','💋':'kiss','😚':'kiss','😘':'kiss','🟢':'dotg','🟡':'doty','🔴':'dotr','⚠':'warn','⏹':'stop','🏆':'trophy','👂':'ear',
  '🍓':'strawberry','🍊':'orange','🍦':'icecream','🍨':'icecream','🍮':'flan','🍲':'soup','🍛':'adobo','🍜':'ramen','🍗':'chicken','🧋':'milktea','☕':'coffee','🐟':'fish','🥫':'can','🥛':'milk','🦴':'bone','🍖':'meat','🥕':'carrot','🍰':'cake','🍙':'rice','💭':'letter','👀':'face',
};
const SIZE = 14, cache = {}, urls = {};
function bake(name){
  if (cache[name]) return cache[name];
  const rows = I[name] || I.sparkle, w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE;
  const x = c.getContext('2d'), ox = Math.floor((SIZE - w) / 2), oy = Math.floor((SIZE - h) / 2);
  rows.forEach((row, j) => { for (let i = 0; i < row.length; i++){ const ch = row[i]; if (PAL[ch]){ x.fillStyle = PAL[ch]; x.fillRect(ox + i, oy + j, 1, 1); } } });
  // dark pixel outline
  const img = x.getImageData(0, 0, SIZE, SIZE), d = img.data, a = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] > 0;
  for (let yy = 0; yy < SIZE; yy++) for (let xx = 0; xx < SIZE; xx++){ const i = yy * SIZE + xx; if (a[i]) continue;
    if ((xx > 0 && a[i - 1]) || (xx < SIZE - 1 && a[i + 1]) || (yy > 0 && a[i - SIZE]) || (yy < SIZE - 1 && a[i + SIZE])){ d[i * 4] = 74; d[i * 4 + 1] = 42; d[i * 4 + 2] = 53; d[i * 4 + 3] = 255; } }
  x.putImageData(img, 0, 0);
  return (cache[name] = c);
}
const url = name => urls[name] || (urls[name] = bake(name).toDataURL());
const RE = /\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu;
const KEEP = /^[◀▶©®™↩↪↔↕⬅➡⬆⬇▪▫◻◼]/;
const nameFor = e => EMO[e.replace(/[️‍]/g, '')] || EMO[[...e][0]] || 'sparkle';
function html(name, cls){ return `<img class="pxi${cls ? ' ' + cls : ''}" alt="" src="${url(name)}">`; }
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'TITLE', 'OPTION', 'CANVAS']);
function swapText(node){
  const s = node.nodeValue; RE.lastIndex = 0; const hits = s.match(RE); if (!hits || hits.every(h => KEEP.test(h))) return;
  RE.lastIndex = 0;
  const frag = document.createDocumentFragment(); let last = 0, m;
  while ((m = RE.exec(s))){
    if (KEEP.test(m[0])) continue;
    if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
    const im = document.createElement('img'); im.className = 'pxi'; im.alt = ''; im.src = url(nameFor(m[0])); frag.appendChild(im);
    last = m.index + m[0].length;
  }
  if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
  node.parentNode.replaceChild(frag, node);
}
function walk(root){
  if (root.nodeType === 3){ if (root.parentNode && !SKIP.has(root.parentNode.nodeName)) swapText(root); return; }
  if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
  while (tw.nextNode()) list.push(tw.currentNode);
  list.forEach(n => { if (n.parentNode && !SKIP.has(n.parentNode.nodeName)) swapText(n); });
}
function start(){
  walk(document.body);
  new MutationObserver(ms => ms.forEach(m => { if (m.type === 'characterData') walk(m.target); else m.addedNodes.forEach(walk); }))
    .observe(document.body, { childList: true, subtree: true, characterData: true });
}
if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
window.PixelIcons = { html, url, canvas: bake, canvasFor: e => bake(nameFor(e)), nameFor, has: n => !!I[n] };
})();

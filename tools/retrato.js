// Draws the pixel portrait (assets/me.png). Run: node tools/retrato.js [preview.png]
const zlib = require('zlib'), fs = require('fs'), path = require('path');
const W = 60, H = 72;
const px = Array.from({ length: H }, () => Array(W).fill(null));

const P = {
  skin: '#f1c7a0', skin2: '#dba57f', skin3: '#bf8462', blush: '#eea48f', glow: '#fbe0c2',
  hair: '#1c1716', hair2: '#383030', hair3: '#5b4f4e', rim: '#4a403f',
  white: '#fbfaf5', iris: '#4a2d1d', pupil: '#130c09', lid: '#1a1210',
  frame: '#4a3a30', lip: '#b8605a', lip2: '#e59c93',
  shirt: '#f0f1ec', shirt2: '#d0d3cc', shirt3: '#aeb2aa',
  jean: '#3f608c', jean2: '#2c4568', jean3: '#5c82b3',
  shoe: '#f0f1ec', sole: '#9fa39b', lace: '#c9ccc5',
};
const HAIRS = [P.hair, P.hair2, P.hair3, P.rim];
const SKINS = [P.skin, P.skin2, P.skin3, P.blush, P.glow];

const inb = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
const set = (x, y, c) => { if (inb(x, y)) px[y][x] = c; };
const get = (x, y) => inb(x, y) ? px[y][x] : null;
function ell(cx, cy, rx, ry, c, test, n = 2) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.abs((x - cx) / rx) ** n + Math.abs((y - cy) / ry) ** n;
    if (d <= 1 && (!test || test(x, y))) px[y][x] = typeof c === 'function' ? c(x, y, d) : c;
  }
}
function ring(cx, cy, rx, ry, c, t = 1, n = 2) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = Math.abs((x - cx) / rx) ** n + Math.abs((y - cy) / ry) ** n;
    const i = Math.abs((x - cx) / (rx - t)) ** n + Math.abs((y - cy) / (ry - t)) ** n;
    if (o <= 1 && i > 1) px[y][x] = c;
  }
}
const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
const dots = (c, list) => list.forEach(([x, y]) => set(x, y, c));
const hline = (x0, x1, y, c) => rect(x0, y, x1, y, c);
function limb(x0, y0, x1, y1, r, c) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= n; i++) ell(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, r, r, c);
}

/* ---------- legs and sneakers ---------- */
rect(22, 58, 38, 61, P.jean);
rect(22, 62, 28, 67, P.jean); rect(32, 62, 38, 67, P.jean);
rect(22, 59, 22, 67, P.jean2); rect(38, 59, 38, 67, P.jean2); rect(28, 62, 28, 67, P.jean2); rect(32, 62, 32, 67, P.jean2);
rect(24, 60, 24, 66, P.jean3); rect(34, 60, 34, 66, P.jean3);
hline(29, 31, 61, P.jean2); set(30, 60, P.jean2);
hline(22, 28, 67, P.jean2); hline(32, 38, 67, P.jean2);
rect(20, 68, 28, 70, P.shoe); rect(32, 68, 40, 70, P.shoe);
set(20, 68, null); set(40, 68, null);
hline(20, 28, 71, P.sole); hline(32, 40, 71, P.sole);
dots(P.lace, [[24, 68], [26, 68], [25, 69], [34, 68], [36, 68], [35, 69]]);
dots(P.sole, [[28, 70], [32, 70]]);

/* ---------- sweatshirt ---------- */
ell(30, 50, 10.5, 9.5, P.shirt, null, 3.2);
rect(20, 54, 40, 56, P.shirt);
rect(20, 57, 40, 58, P.shirt2); hline(20, 40, 59, P.shirt3);
for (let x = 21; x <= 39; x += 2) set(x, 58, P.shirt3);
// far arm, hanging
limb(41.5, 45, 43, 54, 2.1, P.shirt);
rect(41, 54, 45, 55, P.shirt2);
rect(41, 56, 44, 58, P.skin); hline(41, 44, 58, P.skin2); set(45, 57, P.skin);
for (let y = 45; y <= 55; y++) set(40, y, P.shirt2);
// folds
dots(P.shirt2, [[23, 47], [23, 48], [24, 49], [36, 52], [37, 53], [37, 54], [25, 55], [26, 56], [30, 51], [30, 52]]);
// thumbs-up arm
limb(19.5, 45.5, 14.5, 51, 2.3, P.shirt);
limb(14.5, 51, 12.5, 48.5, 2.3, P.shirt);
dots(P.shirt2, [[17, 52], [16, 53], [15, 53], [14, 53], [13, 53], [18, 51], [19, 50], [20, 49], [20, 48], [20, 50]]);
rect(10, 47, 15, 48, P.shirt2);
rect(10, 42, 15, 46, P.skin);
rect(11, 38, 12, 41, P.skin); set(13, 41, P.skin);
set(10, 42, null); set(15, 42, P.skin2);
dots(P.skin2, [[13, 43], [14, 43], [15, 43], [13, 45], [14, 45], [15, 45], [15, 44], [15, 46], [10, 46], [11, 46], [12, 46], [13, 46], [14, 46]]);
dots(P.glow, [[11, 39], [11, 40]]);

/* ---------- neck and collar ---------- */
rect(27, 39, 33, 43, '#a66f4e');
ring(30, 43, 5.6, 2.6, P.shirt3, 1.2);
hline(27, 33, 44, P.shirt2);

/* ---------- head ---------- */
ell(13.5, 27.5, 2.6, 3.6, P.skin); ell(46.5, 27.5, 2.6, 3.6, P.skin2);
dots(P.skin3, [[13, 27], [13, 28], [14, 29], [47, 27], [47, 28], [46, 29]]);
const face = (x, y) => x >= 44 ? P.skin2 : P.skin;
ell(30, 24, 16, 15, face);
ell(30, 28, 14.8, 12.6, face);
// chin and jaw shadow
for (let y = 30; y <= 41; y++) for (let x = 12; x < 48; x++) {
  if (!SKINS.includes(get(x, y))) continue;
  if (!SKINS.includes(get(x, y + 1)) && y >= 39) px[y][x] = P.skin2;
}

/* ---------- hair: same cut as the reference doll: round black cap, side locks, parted fringe ---------- */
// lowest hair row per column: side locks, left chunk, forehead window, hanging strand, tuft, right chunk
const FRINGE = [[11, 25], [14, 21], [17, 18], [20, 14], [23, 17], [26, 20], [29, 21], [31, 12], [34, 15], [36, 12], [44, 16], [47, 25], [50, 0]];
const hairline = x => { let v = 0; for (const [x0, y] of FRINGE) if (x >= x0) v = y; return v; };
for (let y = 0; y <= 25; y++) for (let x = 11; x <= 49; x++) {
  const inCap = y >= 14 || ((x - 30) / 19.5) ** 2 + ((y - 14) / 13.5) ** 2 <= 1;
  if (inCap && y <= hairline(x)) px[y][x] = P.hair;
}
const strand = (x, y, len, dx, c) => { for (let i = 0; i < len; i++) { const xx = Math.round(x + dx * i), yy = y + i; if (get(xx, yy) === P.hair) set(xx, yy, c); } };
[[22, 4, 8, -.6], [30, 3, 7, -.3], [38, 4, 7, .5], [27, 12, 6, .3]].forEach(([x, y, l, d]) => strand(x, y, l, d, P.hair2));
// thin light edge so the black hair reads on a dark card
for (let y = 0; y < 27; y++) for (let x = 0; x < W; x++) if (get(x, y) === P.hair && (get(x, y - 1) === null || get(x - 1, y) === null || get(x + 1, y) === null)) px[y][x] = P.rim;
// shadow under the fringe
for (let x = 14; x <= 46; x++) for (let y = 12; y < 26; y++) if (get(x, y) === P.skin && HAIRS.includes(get(x, y - 1))) { px[y][x] = P.skin2; break; }

/* ---------- face ---------- */
[[19, 26], [34, 41]].forEach(([a, b], k) => {
  hline(a, b, 19, P.hair); hline(a + 1, b - 1, 18, P.hair);
});
[23, 37].forEach(cx => {
  ell(cx, 26, 3.3, 2.9, P.white);
  hline(cx - 3, cx + 3, 23, P.lid); set(cx - 4, 24, P.lid); set(cx + 4, 24, P.lid);
  rect(cx - 1, 24, cx + 1, 28, P.iris);
  rect(cx, 25, cx + 1, 27, P.pupil); set(cx - 1, 26, P.pupil);
  set(cx - 1, 24, P.white); set(cx + 1, 28, '#7a5236');
});
// glasses: big, thin, rounded-square
ring(22.5, 26, 6.9, 6.2, P.frame, 1, 3);
ring(37.5, 26, 6.9, 6.2, P.frame, 1, 3);
dots(P.frame, [[29, 24], [30, 23], [31, 24], [15, 24], [14, 24], [45, 24], [46, 24]]);
dots(P.glow, [[18, 23], [19, 22], [33, 23], [34, 22]]);
// nose
dots(P.skin2, [[31, 29], [31, 30]]);
dots(P.skin3, [[29, 32], [30, 32], [31, 32]]);
// cheeks
dots(P.blush, [[17, 33], [18, 33], [19, 33], [18, 34], [41, 33], [42, 33], [43, 33], [42, 34]]);
// mouth: closed, easy smile
hline(26, 34, 35, P.lip); dots(P.lip, [[25, 34], [35, 34]]);
hline(28, 32, 36, P.lip2);

/* ---------- png ---------- */
const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return ~c >>> 0; };
function png(scale, bg) {
  const w = W * scale, h = H * scale, raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = px[Math.floor(y / scale)][Math.floor(x / scale)], o = y * (w * 4 + 1) + 1 + x * 4;
    const [r, g, b] = hex(c || bg || '#000000');
    raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = c || bg ? 255 : 0;
  }
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'me.png'), png(1));
if (process.argv[2]) fs.writeFileSync(process.argv[2], png(8, '#1a1c17'));

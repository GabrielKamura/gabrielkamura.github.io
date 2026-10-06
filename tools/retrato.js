// Draws the pixel portrait (assets/me.png). Run: node tools/retrato.js [preview.png]
const zlib = require('zlib'), fs = require('fs'), path = require('path');
const W = 64, H = 72;
const px = Array.from({ length: H }, () => Array(W).fill(null));

const P = {
  skin: '#f0bd94', skin2: '#dea178', skin3: '#c4835c', blush: '#ec9f86',
  hair: '#2a1f1a', hairHi: '#5a4234', hairLo: '#17110e', fade: '#4a382e',
  white: '#f6f4ec', eye: '#3b2418', pupil: '#120b08', lid: '#1c1310',
  frame: '#30323a', glint: '#ffffff',
  mouth: '#4b1a17', tongue: '#d0604f', lip: '#a9644c',
  shirt: '#eceee8', shirt2: '#cfd2cb', shirt3: '#aeb2aa', line: '#8f948b',
};

const inb = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
const set = (x, y, c) => { if (inb(x, y)) px[y][x] = c; };
const get = (x, y) => inb(x, y) ? px[y][x] : null;
function ell(cx, cy, rx, ry, c, test) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) px[y][x] = typeof c === 'function' ? c(x, y, dx, dy) : c;
  }
}
function ring(cx, cy, rx, ry, c, t = 1) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2, i = ((x - cx) / (rx - t)) ** 2 + ((y - cy) / (ry - t)) ** 2;
    if (o <= 1 && i > 1) px[y][x] = c;
  }
}
const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
const dots = (c, list) => list.forEach(([x, y]) => set(x, y, c));
const hline = (x0, x1, y, c) => rect(x0, y, x1, y, c);

/* sweatshirt */
ell(32, 81, 31, 19, (x, y, dx, dy) => { const d = dx * dx + dy * dy; return d > .9 ? P.shirt3 : d > .72 ? P.shirt2 : P.shirt; });
dots(P.shirt2, [[13, 69], [14, 70], [15, 71], [50, 69], [49, 70], [48, 71]]);

/* neck */
/* collar behind, neck, collar in front */
ring(32, 64, 11, 5, P.shirt3, 2.4);
rect(27, 52, 37, 64, P.skin2);
rect(27, 56, 37, 60, P.skin3);
ell(32, 64, 8, 3.4, P.skin2);
for (const [c, t] of [[P.shirt2, 2.4], [P.line, .9]]) { const keep = px.map(r => r.slice()); ring(32, 64, 11, 5, c, t); for (let y = 0; y < 64; y++) px[y] = keep[y]; }

/* ears */
ell(17, 39, 3, 4.5, P.skin); ell(47, 39, 3, 4.5, P.skin2);
dots(P.skin3, [[16, 38], [16, 39], [17, 40], [48, 38], [48, 39], [47, 40]]);

/* face: skull + jaw */
const faceColor = (x, y) => (x >= 42 || (x >= 40 && y >= 46)) ? P.skin2 : P.skin;
ell(32, 35, 14, 15, faceColor);
ell(32, 41, 12.2, 15.2, faceColor);
// soft jaw shadow
for (let y = 44; y < 58; y++) for (let x = 18; x < 47; x++) {
  if (get(x, y) === P.skin || get(x, y) === P.skin2) {
    const below = get(x, y + 1), side = get(x + 1, y);
    if ((below !== P.skin && below !== P.skin2 && y > 52) ) px[y][x] = P.skin3;
    else if (side !== P.skin && side !== P.skin2 && side !== P.skin3 && x > 32) px[y][x] = P.skin3;
  }
}

/* hair */
const isHairZone = (x, y) => {
  // forehead stays clear: a rounded hairline, a bit higher on his right (our left)
  const hl = 25 + Math.round(Math.abs(x - 30) * Math.abs(x - 30) / 55);
  return y < hl || x < 20 || x > 45;
};
ell(32, 21, 16.5, 12, P.hair, (x, y) => isHairZone(x, y) && y < 34);
[[23, 12, 5, 4], [31, 10, 6, 4], [39, 11, 5, 4], [45, 16, 4, 5], [18, 17, 4, 5], [27, 9, 4, 3], [36, 9, 4, 3]].forEach(([x, y, a, b]) => ell(x, y, a, b, P.hair));
// faded sides
for (let y = 27; y <= 34; y++) for (let x = 0; x < W; x++) if (get(x, y) === P.hair && (x <= 19 || x >= 45)) px[y][x] = P.fade;
// fringe: a few curls dropping on the forehead
dots(P.hair, [[22, 26], [23, 26], [24, 25], [26, 25], [27, 26], [33, 25], [34, 25], [38, 26], [39, 26], [41, 27], [42, 27], [21, 27], [43, 28]]);
// curls: highlights and deep shadows
const hi = [[22, 13, 3], [26, 10, 4], [33, 8, 4], [40, 10, 3], [44, 15, 3], [19, 18, 2], [28, 15, 4], [36, 14, 4], [24, 19, 3], [41, 19, 3], [31, 20, 4], [20, 23, 2], [45, 22, 2], [35, 21, 2]];
hi.forEach(([x, y, n]) => { for (let i = 0; i < n; i++) if (get(x + i, y - (i >> 1)) === P.hair) set(x + i, y - (i >> 1), P.hairHi); });
const lo = [[24, 15, 3], [31, 13, 3], [38, 17, 3], [21, 21, 2], [28, 22, 3], [42, 23, 2], [34, 17, 2]];
lo.forEach(([x, y, n]) => { for (let i = 0; i < n; i++) if (get(x + i, y + (i >> 1)) === P.hair) set(x + i, y + (i >> 1), P.hairLo); });
// shadow the hair casts on the forehead
for (let x = 20; x <= 45; x++) for (let y = 24; y < 32; y++) if (get(x, y) === P.skin && [P.hair, P.hairHi, P.hairLo].includes(get(x, y - 1))) { px[y][x] = P.skin2; break; }

/* eyebrows */
[[21, 28], [36, 43]].forEach(([a, b], k) => {
  hline(a, b, 29, P.hair); hline(a + 1, b - 1, 28, P.hair);
  set(k ? b : a, 30, P.hair);
});

/* eyes */
[25, 39].forEach(cx => {
  ell(cx, 37.5, 3.6, 3, P.white);
  hline(cx - 3, cx + 3, 35, P.lid); set(cx - 4, 36, P.lid); set(cx + 4, 36, P.lid);
  rect(cx - 1, 36, cx + 1, 39, P.eye);
  rect(cx, 37, cx + 1, 39, P.pupil);
  set(cx - 1, 36, P.glint);
  hline(cx - 2, cx + 2, 41, P.skin2);
});

/* glasses: thin round frames */
ring(25, 37.5, 6.4, 6.4, P.frame, .95);
ring(39, 37.5, 6.4, 6.4, P.frame, .95);
hline(31, 33, 36, P.frame);
dots(P.frame, [[18, 36], [17, 36], [46, 36], [47, 36]]);
dots('#7d828c', [[21, 34], [22, 33], [35, 34], [36, 33]]);

/* nose */
dots(P.skin2, [[33, 40], [33, 41], [33, 42]]);
dots(P.skin3, [[31, 44], [32, 44], [33, 44], [34, 43]]);

/* cheeks */
dots(P.blush, [[20, 45], [21, 45], [22, 45], [21, 46], [42, 45], [43, 45], [44, 45], [43, 46]]);

/* smile */
ell(32, 47, 6.8, 5, P.mouth, (x, y) => y >= 47);
hline(27, 37, 47, P.white); hline(27, 37, 48, P.white);
ell(32, 52, 3.6, 2, P.tongue, (x, y) => get(x, y) === P.mouth);
dots(P.mouth, [[25, 46], [39, 46], [24, 45], [40, 45]]);
dots(P.skin2, [[30, 54], [31, 54], [32, 54], [33, 54], [34, 54]]);

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

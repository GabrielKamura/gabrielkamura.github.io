// Draws the pixel portrait (assets/me.png). Run: node tools/retrato.js [preview.png]
// Bust with the hand lifting the glasses. One letter per pixel, '.' is transparent.
const zlib = require('zlib'), fs = require('fs'), path = require('path');
const W = 80, H = 76;
const PAL = ['#0f0d12', '#7d7990', '#4a4558', '#34303f', '#16141b', '#24212c', '#f6cfb6', '#fde6d4', '#2a1810', '#ffffff', '#dfe6ee', '#5a3522', '#8a5a3c', '#eeb199', '#b9685c', '#a3a8b3', '#c4c8cf', '#fbfbf7'];
const ROWS = [
  '................................................................................',
  '.................................aa.bbbbb.......................................',
  '..................................aaaaaaaccccb.....ad...........................',
  '................................bbbaeffffaaaaacbbcefefb.........................',
  '.............................bccdefeefffdfffdfeeccafedbb........................',
  '.........................caaaaaaaefffdfddffffdffffafdfabbbcaaa..................',
  '........................aaeffffffffdfdddddddddfdffffdfabbafeaa..................',
  '.......................dbcfaffddddddddddddddccfddddddcfaffddfa..................',
  '.......................bcaafdddddddddddddddcccdddddddccfcddffc..................',
  '....................b.cfffdfddddddddddddddddccddddddccccccdfdb..................',
  '................ccccfaafffddddddddddddddddddddddddccccccccffdd..................',
  '..............aaaeeefffffffddddddddddddddddddddddddccccccdddffdb................',
  '...............eaffffffffffdddddffdddfdddddccccccddccccddccdddfec...............',
  '...............deefdffffffdcdddddddddfdddccccccccdccdcdddbbcddddec..............',
  '................aeffdffffdccddddddddddddcccdcccccccccddcbbbbccddde..............',
  '................beffffffdcbcccddddddddccccdccccccccccdcbbbbbbccdcde.............',
  '.................bfffdddccbbbccddddddccccdcbbcccccccbbcbbbbbbbcdcddfc...........',
  '.................cfffddcbbbbbbccdddcccccccbbcccccccccbccbbbbbbcdcdcdfd..........',
  '................caafffdcbbbbccccdfcbbbbbbbccccccddccdbbccbbbbbcdccccda..........',
  '................eafffdcbcccccdcfffcbbbbbccddcccdddddccccccbbcbbcdccdcfa.........',
  '...............eeffffccccddffdffffbbbbbcdcccdccdddddcccccdddcccccccffe..........',
  '..............fffffffddfffffddfffbbbbcdddddcccdddffccccccccccccccdcfac..........',
  '.............afffdddffffffffdfffdbbddcccccccccdfdffddcccccccccccccddfb..........',
  '.............affddddffffffffdddddcdddcccccccccfefdddcccccccdccccccccdc..........',
  '............aafffdddfffffffddffddcddccccccccdcefdddddccccccddddcccccdd..........',
  '............aaaffffdfffffffddfffdddccccccccdcfaefdddfdcccccdddddccccdd..........',
  '...........aaacffffdffffffdddfafddccccccccddccffffddfdcccccdfdddddccdda.........',
  '.............bbdffffffefffdffeeddccccccccdfcfacdefddfddccccdffddddcdfda.........',
  '..............dfffffffefffffeeecccccccccdffcfcgcdefddddccccdffddddddffac........',
  '.............cffffffffefffffccddccccccccfecfcgggdaffdddcccccffdddddffafd........',
  '.............aefffffffeffffccccccccccccdfedccgggcfffdfdcccccfffddddffaea........',
  '.............effffeeffeffeecgcccccccccdccddcgggggcffffdccccdfeffffffeeca........',
  '.............efffffeffeffecgggccccccccccccdbbggccccffffcccccdefffeffeabb........',
  '.............eeeeffefffeaccdcccccccddcggccbbccccghbcaffcccccffefffeeaa..........',
  '.............ffeaaaaeeeeccgcdcddddddcgggggcccgbgghhbcffccccdfeeffeeeea..........',
  '.............ffcdfdfaeadcggggcddcddggghhcccggbgccddgbcfdcccdfeffeffaaa..........',
  '.............ddgghhcaiaddaafdgcdcggggghhgcccaaaaaaaaccddcccfeeeeefeaaa..........',
  '............adggghhjgfaaaaaaaaacgjgggghgcdfaaaaaaaaaaieefffeaaaaeeaac...........',
  '..........dggggggggjgdd.cccccdddaghhhhgddccdddkccggclmfeaaaaadceaaa.............',
  '.........dcggggggdccdc..kkkkiaaccdjhjhcfgkkcdckaagkcikfeaaafcgggaaa.............',
  '.........hhggggggaaadk..kkkdaacccadddcfc..kcckkaackkfdaaeedgggggcac.............',
  '........hhhhhggggaaackkkkkkiaagdgaaaaaac..kkkaaaackkfcacddgggnnnhc..............',
  '......a.hhhhhhgggccamkkkkkkiaaaikaadcaa...kkmiaiic.kdcagdgggnnnnhha.............',
  '......ahhhhhhhggcccamkkkk..liaaikacggcfc...kliallkkkgdahgggnnnnghha.............',
  '......ahhhhhnnnnacbalkkkkk.cliimkagjhgdc...klmmmlkkkjcahhhhnnngggha.............',
  '......ahhhhnnnnnacbaakkkkk.klmmmkaghhhgdgkkkmkkkkkkkgfghhhhnnngggd..............',
  '......ahhhhnnnnnaccaickcgj.kkkmkgdnggghdckkkkkkkkkkkcahhhhhnnnggga..............',
  '......ahhhhnnnnnnccccdcggjkkkkkcagggghhgddkkkkkkkkkcdgghhhhnnggg................',
  '......ahhhhhnnnnnnnggcaaaaaaiiacghhghgghgcaaaaaaffacgghghhggggg.................',
  '......ahhhhhhnnnnnngncdadccccggghhhhhhhggggggggggcggggggcgggg...................',
  '......ahhhhhhnnnggnncdcacggggggghhhhhhgggggggggggggggggaaad.....................',
  '......chhhhhgggggggcd...cggggggghhhggooggghhhgggggggggdaaa......................',
  '.....ahhhhgggggggg......dcggggghhhhgggggghhhhggggggggdaaaa......................',
  '.....dhhhhgghgcdaa.......acgghhhhhhhhhhhhhhhhgghhggcaaac........................',
  '.....hhhhhhhhgdc..........achhhhhhhhhhhhhhhhhhhhhhcaaaab........................',
  '....chhhhhhhgga............dchhhhhhhhhhhhhggghhhc.aa..b.........................',
  '..gaghhhhhhhgga.............paqppppphhhhhhggggqaap..............................',
  '..ggghhhhhhhgag..............qaappppppppppqqqqqap...............................',
  '..aghhhhhhhhha..................ppppaaaaaaqqqqqap...............................',
  '.gagghhhhhhhag........qqq.paaaacpppppaaaqqqqqqqqp...............................',
  'gaggghhhhhhhaggppqqqqqcaaacccqcdaaaeaaqqqqqqqqqaaaa.............................',
  'gagghhhhhhhhaaaaaeaaeecqqqqqqqqqqqppaaqqqqqqqqqppppap...........................',
  'agghhhhhhhhhaaqqqqqqqqqqqqqqqqqqqqpepqqqqqqqqqpppqqpaapq........................',
  'agghhhhhhhhhaaqqqqqqqqqqqqqqqqqqqqqppqqqqqqqqpapqqqrrrraqp......................',
  'ahhhhhhhhhhgggdqqqqqqqqqqqqqqqqqqqqqpqqqqqppappqqrrrrrrrrpp.....................',
  'ahhhhhhhhhggggfqqqqqqqqqqqqqqqqqqqqqqqdaaapppqqqrrrrrrrr.rpp....................',
  'ahhhhhhhhgggggaqqqqqqqqqqqqqqrrqqqqqqqqqqqqqqqqrrrrrrrrrrrrpa...................',
  '..hhhhhhhhggggaqqqqqqqqqqqqqrrrrrqqqqqqqqqqqrrrrrrrrrrrrrrrrrp..................',
  '..gghhhhhhggggaqqqqqqqqqqqqrrrrrrrqqqqqqqqrrrrrrrrrrrrrrrrrrra..................',
  '..ggghhhhhggggaqqqqqqqqqqqqrrrrrrrrqqqqrrrrrrrrrrrrrrrrrrrrrrrr.................',
  '...gghhhhgggggaqqqqqqqqqqqqrrrrrrrrrrrrrrrrrrrrrrrrrrqqrrrrrrrr.................',
  '....ahhhggggggaqqqqqqqqqqqrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrra.................',
  '.....aaaagggggeqqqqqqqqqqqrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrp................',
  '.......gaaaaaaeqqqqqqqqqqqrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrra................',
  '..........aaaaeqqqqqqqqqqrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrap...............',
  '..........aaaadqqqqqqqqqqrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrqp...............',
];
const px = ROWS.map(r => [...r].map(ch => ch === '.' ? null : PAL[ch.charCodeAt(0) - 97]));

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

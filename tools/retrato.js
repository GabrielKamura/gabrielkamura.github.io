// Draws the pixel portrait (assets/me.png). Run: node tools/retrato.js [preview.png]
// Bust with the hand lifting the glasses. One letter per pixel, '.' is transparent.
const zlib = require('zlib'), fs = require('fs'), path = require('path');
const W = 80, H = 76;
const PAL = ['#4b4556', '#4d4959', '#a09db3', '#17131a', '#15131a', '#211e28', '#2f2b38', '#f6cfb6', '#fde6d4', '#2a1810', '#eeb199', '#ffffff', '#8a5a3c', '#5a3522', '#dc8e7a', '#dfe6ee', '#c4c8cf', '#a3a8b3', '#e3e5e6', '#b9685c', '#fbfbf7'];
const ROWS = [
  '................................................................................',
  '..................................a.bbbbbc......................................',
  '..................................aadddddbbbbcc..b.a............................',
  '................................ccbeeffffeddddbcbbafagc.........................',
  '.............................cbbgffeefffggffffefbbeffgcc........................',
  '.........................baaafdffffffffggffffggfffdggfgcccaaa...................',
  '........................aefffffffgggfgggggggggggffggggfccfffea..................',
  '........................ccgdffggggggggggggggbbggggggggfdffggfa..................',
  '.......................cbddggggggggggggggggbbbgggggggbbfbbgfgb..................',
  '.....................bbdffggggggggggggggggggbbggggggbbbbbbgfgc..................',
  '................bbbbbddfffgggggggggggggggggggggggggbbbbbbbgfgb..................',
  '...............adeeefffffffgggggggggggggggggbggggggbbbbbbgggffg.................',
  '...............adeeffffffffggggggggggggggggbbbbbbggbbbbbgbbgggfab...............',
  '................aeffffffffgbgggggggggggggbbbbbbbbgbbbbgggccbggggfb..............',
  '................gefffffffgbbggggggggggggbbbbbbbbbbbbbgggccccbbgbgec.............',
  '................cfffffffgbbbbbggggggggbbbbbbbbbbbbbbbgbccccccbbgbgfb............',
  '.................affggggbbcbcbbggggggbbbbbbccbbbbbbbbbbcccccccbbbggfb...........',
  '.................affgggbcccccbbbgggbbbbbbbccbbbbbbbbbcbbccccccbgggbgfg..........',
  '.................affffbbccccbbbbgfbcccccccbbbbbbbgbbbccbbccccccggbbbga..........',
  '................adffffbbbbbbbbbfffccccccbbbbbbbggggbbbbbbbccbccbgbbbbga.........',
  '..............baeffffbbbbbbgggffffcccccggbbbbbbgggggbbbbbbbbbbbbbbbbba..........',
  '..............afffffffffffffggfffccccbbgggbbbbgggffbbbbbbbbbbbbbbbbgdb..........',
  '.............affffgggffffffggfffgccggbbbbbbbbbgggffggbbbbbbbbbbbbbggbc..........',
  '.............affggggffffffffgggggggggbbbbbbbbbfffgggbbbbbbbgbbbbbbgbgb..........',
  '............adfffgggfffffffggffgggggbbbbbbbbbbffgggggbbbbbbggggbbbbbgg..........',
  '............addffffgfffffffggffggggbbbbbbbbgbfdfggggggbbbbbgggggbbbbgg..........',
  '............aebfffffffffffgggfdgggbbbbbbbbggbbffffggggbbbbbgggggggbbgga.........',
  '..............cfffffffffffgfffgggbbbbbbbbggbbdbgdfggfggbbbbgfgggggbggga.........',
  '..............afffffffffffffffggbbbbbbbbbggbbbhbgefgfggbbbbbffgggggggfdb........',
  '..............afffffffeffffffbggbbbbbbbbgggbbbhhgdffgggbbbbbffggggggfdfg........',
  '.............affffffffefffffbbbbbbbbbbbbgggbbhhhhfffgfgbbbbbgffggggffdfa........',
  '.............affffeeffefffgbhbbbbbbbbbbbbggbhhhhhbfffffbbbbggfffffffegba........',
  '.............afffffeffeffebhhhbbbbbbgbbbbbgchhhbbbbffffbbbbbgfffffffeec.........',
  '.............aeeeffefffedbbbbhbbbbbggbhhbbbbbbhbhhhbdffbbbbbgfefffeeda..........',
  '.............afeddddeeefgbhhbbgggggghhhhhbbbbhbhhhhbbffbbbbgfeeffeeeea..........',
  '.............afgggggdedgghhhbbggggghhhhhhbbbhhbbbggbbbbbbbbgeeffeffdda..........',
  '.............gghiiibfjdggfdfgbbgbhhhhhhihbbbgdddddddbbbfbbbgeeeeefedfa..........',
  '............gghkhhihhgddddddddfbhlhhhhhhbgfdjjfffffffjeeffgeddddeeddb...........',
  '..........ghkhhkkkhlhg..bbbbbgggfhhihihggbbgggmbbhhbjnfedddddgbgdda.............',
  '.........ghkkkhhogbbgb..mpphgffbbfliilbfhpmbjbpgfhpbjnfedddfhhhhfda.............',
  '.........hhhhkhhodddgmn.pppgdfbbbdgggbfb..pbbpmjdbphfgdefeghhhhhha..............',
  '........hhhhhkkhoffdbmmmpppfdgbgbddddddb..pmmjdddbppgbfbgghhkkkhhb..............',
  '........hhhhhhhhbfbdnmnmpppfdddjmddgbfa...ppnjdjjbppggfhghhkkkkkhha.............',
  '......ahhhhhhhoobbbdnmmppp.jjddjmdbhhbfb...mjjdjnmpphgfihhkkkkkkhha.............',
  '......ahhhhkhkoobbbdnmpmpp.njjjnmdhhilgbp..mnnnnnmpplgfiihhkkkkhhha.............',
  '......ahhhkkkkkkfbbdjmmmpp.mnnnnhdhihhhghpppnnnmmppphfhiiihkkkkhhh..............',
  '......ahhhhkkkkkfbbdfbmmhlppmmnmhfkhhhhgbpppmmmmppplbfihiihkkkkhh...............',
  '......ahhhhhkkkkkkbbbgbbhhlpmmmbfhkkhhhkbgpppppppppbghhiihkkkkhh................',
  '......ahhhhhkkkkkkkkhbfdddfdjjdghhhhihhhhbddddjddddbhhihhhhhhhh.................',
  '......ahhhhhhkkkkkkkobgdgbbbbhbhiihiihihhkhhhbhhhbhhhhhhhhhhh...................',
  '.......hhhhhkkkkkkkobgbfbhhhhhhhhihiihhhhhhhhhhhhhhhhhhhdfgg....................',
  '.......hhhhhkhhhhhhbg...bhhhhhhhhhhhhhhhhhhhhhhhhhhhhhbdda......................',
  '.....ahhhhhhhhhhhh.......bhhhhhhhhhhhhhhhhhhhhhhhhhhhgddda......................',
  '.....hhhhhhhhhhhda........bhhhhhhhihhhhhhhhhhhhhhhhhfddb........................',
  '.....hhihhhhhhh............bhhhhihiihiihhhhhhhhhhhbddda.........................',
  '....bhiihhhhhh..............bhhiiiiiihiihhhhhhhhh.aa..c.........................',
  '..qrsiihhhhhhsa.............rdrrsssshhhhhhhhhhqddr..............................',
  '..rqsihhhhhhsrr..............rddrrrrrrrrrrroooodr...............................',
  '.qdshhhhhhhiqa..................rrrrddddddtokkorr...............................',
  '.rsshhhhhhhsdr..........q.raaaabqrrrrdddkkkkkkkrr...............................',
  'qdsshhhhhhhsdqrrrrqrqqbaeabbbrbqqdrdddqkkkkkkkkddaa.............................',
  'qdsshhhhhhhsddeeeddddqqqqqqqqqqqqbrrddkkkkkkkkkrrrrar...........................',
  'assshhhhhhiqddrqqqqqqqqqqqqqqqqqqqrrrqkkkkkkkkrrrqqrfarq........................',
  'aushhhhhhiiqddrqqqqqrqqqqqqqqqqqqrrrrqkkkkkkkrdrqqsssssdrq......................',
  'ahiihhhhhhhkqqgrqqqqqqqqqqqqqqqqqrqqrrqoooqrdrqqqsssssssqrr.....................',
  'ahhihhhhhhkkkqgrqqqqqqqqqqqqqqqqqqrqrrrdddrrrqqqssssssss.qrr....................',
  'ahhihhhhhhkhkqdrqqqqqqqqqqqqqssqqqrqqqrrrrrqqqqssssssssssssqa...................',
  '..iihhhhhhhhkkdrqqqqqqqqqqqqssssssqrqqqqqqqssssssssssssssssqrr..................',
  '..shhhhhhhhkkkdrqqqqqqqqqqqqssssssqqrrrqqqssssssssssssssssssqa..................',
  '..quhhhhhhhkkkdrqqqqqqqqqqqssssssssqqssssssssssssssssssssssssdr.................',
  '...rqhhhhhkkkkdrqqqqqqqqqqqssuussssssssssssssssssssssqssssssssrq................',
  '....rrqqkkkkkodqqqqqqqqqqrsssuusssssssssssssssssssssqqssssssssdq................',
  '.....rdrrrrrrrgqqqqqqqqqrrsssuusssssssssssuussssssssqssssssssssr................',
  '......qqrdddddgqqqqqqqqqrrssssssssssssssssuusssssssssssssssssssa................',
  '..........rdddgqqqqqqqqqrsssssssssssssssssuusssssssssssssssssssdr...............',
  '..........rdddgqqqqqqqqqrsssssssssssssssssussssssssssssssssssssqr...............',
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

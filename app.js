(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ME = 'GabrielKamura';
  const COLORS = { o: '#d97757', w: '#eceee6', k: '#0c0d0b' };

  /* ---------- fox sprite ---------- */
  const FOX = {
    walk1: ['........o..o', '........oooo', 'o.......okok', 'oo......owwo', 'woooooooooo.', '.ooooooooo..', '.ooooooooo..', '.o.o...o.o..'],
    walk2: ['........o..o', '........oooo', 'o.......okok', 'oo......owwo', 'woooooooooo.', '.ooooooooo..', '.ooooooooo..', '..o.o...o.o.'],
    sleep: ['............', '............', '............', '........o..o', '.ooooo..oooo', 'ooooooooowwo', 'woooooooooo.', '.wooooooooo.'],
  };
  function drawFox(ctx, frame, x = 0, y = 0, s = 4) {
    FOX[frame].forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.') continue;
        ctx.fillStyle = COLORS[ch];
        ctx.fillRect(x + c * s, y + r * s, s, s);
      }
    });
  }

  /* ---------- secrets ---------- */
  const SECRETS = [
    ['wake', 'Light sleeper', 'Someone is napping on the job.'],
    ['letters', 'Keyboard walk', 'Touch every letter of the name.'],
    ['konami', 'Old school', 'Up, up, down, down...'],
    ['kamura', 'Say my name', 'Type the family name anywhere.'],
    ['sudo', 'Nice try', 'Ask the terminal for more power.'],
    ['ttt', 'Not a loser', 'Do not lose at tic-tac-toe.'],
    ['mirror', 'Mirror match', 'Compare me with me.'],
    ['explorer', 'Explorer', 'Run five different commands.'],
  ];
  let found = new Set();
  try { found = new Set(JSON.parse(localStorage.getItem('secrets') || '[]')); } catch (e) {}
  const banner = $('#banner');
  let bannerTimer;
  function renderSecrets() {
    const n = `${found.size}/${SECRETS.length}`;
    $('#secretsCount').textContent = n;
    $('#panelCount').textContent = n;
    $('#secretsList').innerHTML = SECRETS.map(([id, name, hint]) =>
      `<div class="item"${found.has(id) ? ' data-found' : ''}><span class="iname">${found.has(id) ? name : '???'}</span><span class="hint">${hint}</span></div>`).join('');
  }
  function unlock(id) {
    if (found.has(id)) return;
    found.add(id);
    try { localStorage.setItem('secrets', JSON.stringify([...found])); } catch (e) {}
    renderSecrets();
    const s = SECRETS.find(x => x[0] === id);
    banner.innerHTML = `Secret found: ${s[1]} <span class="count">${found.size}/${SECRETS.length}</span>`;
    banner.setAttribute('data-on', '');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => banner.removeAttribute('data-on'), 3200);
  }
  renderSecrets();
  const panel = $('#panel'), backdrop = $('#backdrop');
  const setPanel = open => { panel.hidden = backdrop.hidden = !open; if (open) $('#panelClose').focus(); else $('#secretsToggle').focus(); };
  $('#secretsToggle').addEventListener('click', () => setPanel(true));
  $('#panelClose').addEventListener('click', () => setPanel(false));
  backdrop.addEventListener('click', () => setPanel(false));

  /* ---------- parade ---------- */
  function parade() {
    if (reduce) return;
    const cv = $('#parade'), ctx = cv.getContext('2d');
    cv.hidden = false;
    cv.width = innerWidth; cv.height = innerHeight;
    const foxes = Array.from({ length: 14 }, (_, i) => ({ x: -60 - i * 90 - Math.random() * 40, y: innerHeight - 60 - Math.random() * innerHeight * .5, v: 5 + Math.random() * 4 }));
    let t = 0;
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      t++;
      foxes.forEach(f => { f.x += f.v; drawFox(ctx, (t >> 3) % 2 ? 'walk1' : 'walk2', Math.round(f.x), Math.round(f.y)); });
      if (foxes.some(f => f.x < cv.width)) requestAnimationFrame(tick); else cv.hidden = true;
    })();
  }

  /* ---------- keys: konami + kamura ---------- */
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let keys = [], word = '';
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!panel.hidden) setPanel(false); setMenu(false); return; }
    keys = [...keys, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
    if (keys.join() === KONAMI.join()) { unlock('konami'); parade(); }
    if (e.key.length === 1) {
      word = (word + e.key.toLowerCase()).slice(-6);
      if (word === 'kamura' && e.target.id !== 'handle') { unlock('kamura'); parade(); }
    }
  });

  /* ---------- hero ---------- */
  const hero = $('.hero'), title = $('#title');
  title.innerHTML = [...title.textContent].map((ch, i) => `<span class="letter" style="--i:${i}" aria-hidden="true">${ch}</span>`).join('');
  const touched = new Set();
  $$('.letter', title).forEach((el, i) => {
    if (!el.textContent.trim()) { touched.add(i); return; }
    el.addEventListener('pointerenter', () => { touched.add(i); if (touched.size === title.children.length) unlock('letters'); });
  });
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', e.clientX - r.left + 'px');
    hero.style.setProperty('--my', e.clientY - r.top + 'px');
  });

  const menuButton = $('#menuButton'), menu = $('#mobile-menu');
  function setMenu(open) { menuButton.setAttribute('aria-expanded', open); menu.toggleAttribute('data-open', open); }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  const segs = $('#segs'), fox = $('#fox'), bubble = $('#bubble'), fctx = $('#foxCanvas').getContext('2d');
  const SEG = 20;
  segs.innerHTML = '<span></span>'.repeat(SEG);
  const builds = $$('.content [data-build]');
  const paint = f => { fctx.clearRect(0, 0, 48, 32); drawFox(fctx, f); };
  const restX = () => $('#ground').clientWidth - 48 - 24;
  let asleep = false, napTimer;
  function nap() {
    asleep = true; paint('sleep');
    fox.style.transform = `translateX(${restX()}px)`;
    bubble.textContent = 'ZZZ'; bubble.hidden = false;
    fox.setAttribute('aria-label', 'A small fox, asleep');
    hero.dataset.phase = 'idle';
  }
  const LINES = ['Five more minutes.', 'I was resting my eyes.', 'Ship it tomorrow.', 'Who goes there?', 'Not a bug. A nap.'];
  let line = 0;
  fox.addEventListener('click', () => {
    if (hero.dataset.phase !== 'idle') return;
    unlock('wake');
    asleep = false; paint('walk1');
    bubble.textContent = LINES[line++ % LINES.length]; bubble.hidden = false;
    fox.setAttribute('aria-label', 'A small fox, awake');
    clearTimeout(napTimer);
    napTimer = setTimeout(nap, 2600);
  });
  addEventListener('resize', () => { if (hero.dataset.phase === 'idle') fox.style.transform = `translateX(${restX()}px)`; });

  function finishBuild() {
    builds.forEach(b => b.setAttribute('data-solid', ''));
    $$('span', segs).forEach(s => s.setAttribute('data-on', ''));
    nap();
  }
  if (reduce) finishBuild();
  else {
    const D = 2200, t0 = performance.now(), end = restX();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / D), x = Math.round(end * p / 4) * 4;
      fox.style.transform = `translateX(${x}px)`;
      paint(Math.floor((now - t0) / 110) % 2 ? 'walk1' : 'walk2');
      const upto = Math.floor(((x + 40) / (end + 72)) * SEG);
      $$('span', segs).forEach((s, i) => i <= upto && s.setAttribute('data-on', ''));
      builds.forEach((b, i) => p > (i + .4) / (builds.length + .6) && b.setAttribute('data-solid', ''));
      if (p < 1) requestAnimationFrame(tick); else finishBuild();
    })(t0);
  }

  /* ---------- contribution graph ---------- */
  const LEVELS = ['#1a1c17', '#1f4a2c', '#2f7a45', '#45b066', '#5ce483'];
  const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  function drawGraph(cv, days) {
    const w = cv.parentElement.clientWidth;
    const list = w < 592 ? days.slice(-26 * 7) : days;
    const first = new Date(list[0].date + 'T00:00:00Z').getUTCDay();
    const cols = Math.ceil((first + list.length) / 7);
    const step = Math.max(6, Math.floor(w / cols)), gap = step >= 14 ? 4 : 2, cell = step - gap;
    const h = step * 7 - gap, dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    const max = Math.max(1, ...list.map(d => d.count));
    cv._cells = list.map((d, i) => {
      const k = first + i, x = Math.floor(k / 7) * step, y = (k % 7) * step;
      ctx.fillStyle = LEVELS[d.count ? Math.min(4, Math.ceil(d.count / max * 4)) : 0];
      ctx.fillRect(x, y, cell, cell);
      return { x, y, d };
    });
    cv._step = step;
  }
  function bindGraph(cv, out) {
    cv.addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const hit = (cv._cells || []).find(c => x >= c.x && x < c.x + cv._step && y >= c.y && y < c.y + cv._step);
      out.textContent = hit ? `${hit.d.count} contribution${hit.d.count === 1 ? '' : 's'} on ${fmtDate(hit.d.date)}` : '';
    });
    cv.addEventListener('pointerleave', () => { out.textContent = ''; });
  }
  async function fetchYear(login) {
    const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(login)}?y=last`);
    if (r.status === 404) throw new Error('notfound');
    if (!r.ok) throw new Error('down');
    const j = await r.json();
    const days = (j.contributions || []).map(c => ({ date: c.date, count: c.count })).sort((a, b) => a.date < b.date ? -1 : 1);
    if (!days.length) throw new Error('notfound');
    return days;
  }
  const sum = days => days.reduce((n, d) => n + d.count, 0);
  function numbers(days) {
    let streak = 0, best = 0, bestDay = 0, active = 0;
    days.forEach(d => { if (d.count) { streak++; active++; best = Math.max(best, streak); bestDay = Math.max(bestDay, d.count); } else streak = 0; });
    return { 'Contributions': sum(days), 'Active days': active, 'Best day': bestDay, 'Longest streak': best };
  }
  let mine = null, theirs = null;
  const mineCv = $('#mine'), yoursCv = $('#yours');
  bindGraph(mineCv, $('#mineDay')); bindGraph(yoursCv, $('#yoursDay'));
  function showMine(days) {
    mine = days;
    drawGraph(mineCv, days);
    $('#mineTotal').textContent = `· ${sum(days).toLocaleString('en-US')} contributions in the last year`;
  }
  fetch('data/contributions.json').then(r => r.json())
    .then(j => showMine(j.days.map(d => ({ date: d.d, count: d.c }))))
    .catch(() => {})
    .then(() => fetchYear(ME)).then(showMine).catch(() => {});
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (mine) drawGraph(mineCv, mine); if (theirs) drawGraph(yoursCv, theirs); }, 120); });

  const status = $('#status');
  $('#compare').addEventListener('submit', async e => {
    e.preventDefault();
    const login = $('#handle').value.trim().replace(/^@/, '');
    if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(login)) { status.textContent = 'That does not look like a GitHub handle.'; return; }
    const btn = $('.button', e.target);
    btn.disabled = true; status.textContent = 'Counting blocks...';
    try {
      theirs = await fetchYear(login);
      status.textContent = '';
      $('#theirs').hidden = false;
      drawGraph(yoursCv, theirs);
      yoursCv.setAttribute('aria-label', `Contribution graph of ${login}`);
      const link = $('#yoursLink'); link.textContent = '@' + login; link.href = 'https://github.com/' + login;
      $('#yoursTotal').textContent = `· ${sum(theirs).toLocaleString('en-US')} contributions in the last year`;
      $('#yoursHead').textContent = '@' + login;
      const a = numbers(mine || []), b = numbers(theirs);
      $('#scoreBody').innerHTML = Object.keys(a).map(k =>
        `<tr><th scope="row">${k}</th><td${a[k] > b[k] ? ' data-win' : ''}>${a[k].toLocaleString('en-US')}</td><td${b[k] > a[k] ? ' data-win' : ''}>${b[k].toLocaleString('en-US')}</td></tr>`).join('');
      const same = login.toLowerCase() === ME.toLowerCase();
      if (same) unlock('mirror');
      const d = b.Contributions - a.Contributions;
      $('#verdict').textContent = same ? 'It is a tie. Suspicious.' : d > 0 ? `You shipped ${d.toLocaleString('en-US')} more than me. Respect.` : d < 0 ? `I shipped ${(-d).toLocaleString('en-US')} more than you. This year.` : 'A perfect tie. What are the odds?';
    } catch (err) {
      status.textContent = err.message === 'notfound' ? `No GitHub user called @${login}.` : 'Could not reach GitHub right now. Try again in a bit.';
    }
    btn.disabled = false;
  });

  /* ---------- terminal ---------- */
  const tlog = $('#tlog'), tin = $('#tin'), typed = $('#typed'), ph = $('#ph'), screen = $('#screen');
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  function print(text, cls = 't-out') { const n = el('div', cls, text); tlog.append(n); screen.scrollTop = screen.scrollHeight; return n; }
  function row(name, desc) {
    const n = el('div', 't-row'), b = el('button', 'cmd', name);
    b.type = 'button'; b.addEventListener('click', () => run(name));
    n.append(b, el('span', '', desc)); tlog.append(n);
  }
  function link(label, href) {
    const n = el('div', 't-out'), a = el('a', 'tLink', label);
    a.href = href; a.target = '_blank'; a.rel = 'noopener'; n.append(a); tlog.append(n);
  }
  const SITES = {
    kamurafy: 'https://gabrielkamura.github.io/kamurafy/', moneysniper: 'https://moneysniper.io',
    kamurafox: 'https://github.com/GabrielKamura/kamurafox', kamurar: 'https://github.com/GabrielKamura/kamurar',
    github: 'https://github.com/GabrielKamura', x: 'https://x.com/infligem',
    linkedin: 'https://www.linkedin.com/in/gabrielkamura', instagram: 'https://www.instagram.com/gabriel_kamura',
  };
  const used = new Set();
  const COMMANDS = {
    help() {
      [['about', 'who is this'], ['projects', 'what I made'], ['socials', 'where to find me'], ['note', 'say something to me on X'],
       ['follow', 'follow me on GitHub'], ['open', 'open <name>, like open kamurafy'], ['ttt', 'play tic-tac-toe'], ['secrets', 'how many you found'], ['clear', 'wipe the screen']]
        .forEach(([n, d]) => row(n, d));
    },
    about() { print('Gabriel Kamura. São Paulo, Brazil.'); print('I make Mac apps, extensions and games. Mostly open source.'); },
    whoami() { print('guest. But a welcome one.'); },
    projects() { ['kamurafy', 'moneysniper', 'kamurafox', 'kamurar'].forEach(k => link(k, SITES[k])); },
    socials() { ['x', 'linkedin', 'instagram', 'github'].forEach(k => link(k, SITES[k])); },
    ls() { COMMANDS.projects(); },
    follow() { print('Opening GitHub...', 't-ok'); window.open(SITES.github, '_blank', 'noopener'); },
    note() { print('Opening X with my handle ready...', 't-ok'); window.open('https://x.com/intent/post?text=' + encodeURIComponent('@infligem '), '_blank', 'noopener'); },
    open(arg) {
      const k = (arg || '').replace(/[\s-]/g, '');
      if (SITES[k]) { print(`Opening ${k}...`, 't-ok'); window.open(SITES[k], '_blank', 'noopener'); }
      else print('Open what? Try: ' + Object.keys(SITES).join(', '), 't-err');
    },
    secrets() { print(`${found.size}/${SECRETS.length} found.`, 't-ok'); SECRETS.forEach(s => print(`${found.has(s[0]) ? '[x]' : '[ ]'} ${s[2]}`, 't-dim')); },
    sudo() { unlock('sudo'); print('guest is not in the sudoers file. This incident will be reported to the fox.', 't-err'); },
    clear() { tlog.innerHTML = ''; },
    ttt() { tictactoe(); },
  };
  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    print('guest ~ $ ' + text, 't-in');
    const [name, ...rest] = text.toLowerCase().split(/\s+/);
    const fn = COMMANDS[name];
    if (fn) { fn(rest.join(' ')); used.add(name); if (used.size >= 5) unlock('explorer'); }
    else print(`Command not found: ${name}. Type help.`, 't-err');
    screen.scrollTop = screen.scrollHeight;
  }
  function tictactoe() {
    const b = Array(9).fill(''), grid = el('div', 'ttt');
    const WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const winner = m => WINS.some(w => w.every(i => b[i] === m));
    const free = () => b.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    const cells = b.map((_, i) => { const c = el('button', 'square'); c.type = 'button'; c.setAttribute('aria-label', `Square ${i + 1}`); c.addEventListener('click', () => play(i)); grid.append(c); return c; });
    const mark = (i, m) => { b[i] = m; cells[i].textContent = m; cells[i].dataset.mark = m; cells[i].disabled = true; };
    const finish = (msg, cls) => { cells.forEach(c => c.disabled = true); print(msg, cls); };
    function play(i) {
      if (b[i]) return;
      mark(i, 'x');
      if (winner('x')) { unlock('ttt'); return finish('You win. The fox demands a rematch: ttt', 't-ok'); }
      if (!free().length) { unlock('ttt'); return finish('Draw. Good enough for a secret.', 't-ok'); }
      const pick = m => free().find(j => { b[j] = m; const w = winner(m); b[j] = ''; return w; });
      const f = free();
      let j = pick('o'); if (j == null) j = pick('x'); if (j == null) j = b[4] ? f[Math.floor(Math.random() * f.length)] : 4;
      mark(j, 'o');
      if (winner('o')) return finish('The fox wins. Try again: ttt', 't-err');
      if (!free().length) { unlock('ttt'); finish('Draw. Good enough for a secret.', 't-ok'); }
    }
    print('You are X. The fox is O.');
    tlog.append(grid);
  }
  const sync = () => { typed.textContent = tin.value; ph.hidden = !!tin.value; };
  tin.addEventListener('input', sync);
  tin.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const v = tin.value; tin.value = ''; sync(); run(v); } });
  $$('.chip').forEach(c => c.addEventListener('click', () => run(c.dataset.cmd)));
  print("Hi. This is Gabriel's terminal.", 't-boot');
  print('Type a command and press enter,', 't-boot');
  print('or just use the buttons below.', 't-boot');
})();

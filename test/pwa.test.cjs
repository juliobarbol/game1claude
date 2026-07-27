// test/pwa.test.cjs — el juego en un navegador de verdad (headless).
//
// Verifica lo que node no puede:
//   1. que arranque sin un solo error de consola,
//   2. que el Service Worker tome el control y cree la cache de la versión
//      declarada en sw.js,
//   3. que el juego cargue OFFLINE (es una PWA: se juega sin señal),
//   4. que la física del navegador dé EXACTAMENTE lo mismo que la de node
//      (mismo estado + mismas teclas = misma posición, hasta el decimal),
//   5. que el récord y el fantasma sobrevivan a una recarga.
//
// El punto 4 es el importante: si el navegador y node no coinciden, el
// fantasma que corre al lado tuyo estaría mintiendo.
//
// Uso:  node test/pwa.test.cjs

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { loadGame } = require('./_load.cjs');
const { K, solve, actionsFor } = require('./_bot.cjs');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8700 + (process.pid % 300);

let chromium;
for (const p of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']){
  try { chromium = require(p).chromium; break; } catch (_){}
}
if (!chromium){
  console.error('No se encontró playwright. Probá:  NODE_PATH=/opt/node22/lib/node_modules node test/pwa.test.cjs');
  process.exit(2);
}

const MIME = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png',
  '.webmanifest':'application/manifest+json', '.json':'application/json' };

let ok = true;
const check = (name, pass, extra) => {
  if (!pass) ok = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
};

(async () => {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
      res.writeHead(404); res.end('no'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    res.end(fs.readFileSync(file));
  });
  await new Promise(r => server.listen(PORT, r));
  const URL_ = `http://127.0.0.1:${PORT}/index.html`;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:900, height:600 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(URL_, { waitUntil:'load' });
  await page.waitForTimeout(900);
  check('arranca sin errores de consola', errs.length === 0, errs.join(' | '));

  // ── Service Worker + cache ──
  const CACHE = (fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/const CACHE\s*=\s*'([^']+)'/) || [])[1];
  check('sw.js declara CACHE', !!CACHE, CACHE);
  const swOk = await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready.catch(() => null);
    return !!(r && navigator.serviceWorker.controller) ||
           !!(await navigator.serviceWorker.getRegistration());
  });
  check('el Service Worker se registra', swOk);
  await page.waitForTimeout(600);
  const caches_ = await page.evaluate(() => caches.keys());
  check('crea la cache de la versión', caches_.includes(CACHE), caches_.join(','));

  // ── Offline ──
  await ctx.setOffline(true);
  const resp = await page.reload({ waitUntil:'load' }).catch(e => ({ err:e.message }));
  const titulo = await page.title().catch(() => '');
  check('carga sin internet', /FILO/.test(titulo), titulo || (resp && resp.err));
  await ctx.setOffline(false);

  // ── Paridad de física navegador ↔ node ──
  // Misma tanda de entradas en los dos lados; tienen que dar el mismo píxel.
  const PLAN = [ [40,{x:1,y:0,jump:false,dash:false}], [14,{x:1,y:0,jump:true,dash:false}],
                 [30,{x:1,y:0,jump:false,dash:false}], [22,{x:-1,y:0,jump:true,dash:false}],
                 [40,{x:0,y:0,jump:false,dash:false}] ];
  const runPlan = (G, idx) => {
    const w = G.newWorld(idx);
    for (const [n, inp] of PLAN) for (let i = 0; i < n; i++) G.stepWorld(w, inp);
    return [w.p.x, w.p.y, w.p.vx, w.p.vy, w.timer, w.deaths];
  };
  const G = loadGame();
  for (const idx of [0, 6, 12]){
    const enNode = runPlan(G, idx);
    const enNav = await page.evaluate(([i, plan]) => {
      const w = newWorld(i);
      for (const [n, inp] of plan) for (let k = 0; k < n; k++) stepWorld(w, inp);
      return [w.p.x, w.p.y, w.p.vx, w.p.vy, w.timer, w.deaths];
    }, [idx, PLAN]);
    check(`física idéntica en navegador y node (nivel ${idx+1})`,
      JSON.stringify(enNode) === JSON.stringify(enNav), `node ${enNode} · nav ${enNav}`);
  }

  // ── Persistencia del récord y del fantasma ──
  await page.evaluate(() => {
    lvRec(0).best = 321; SAVE.deaths = 7; saveSave();
    ghostSave(0, [10,20,1, 12,20,1, 14,20,0]);
  });
  await page.reload({ waitUntil:'load' });
  await page.waitForTimeout(500);
  const persist = await page.evaluate(() => ({
    best: lvRec(0).best, deaths: SAVE.deaths, ghost: (ghostLoad(0) || {}).n,
  }));
  check('el récord sobrevive a recargar', persist.best === 321 && persist.deaths === 7,
    JSON.stringify(persist));
  check('el fantasma sobrevive a recargar', persist.ghost === 3, JSON.stringify(persist));

  // ── Una partida real de punta a punta ──
  // El camino lo busca el bot en node y se REPITE en el navegador: si gana
  // en los dos con el mismo cronómetro, el juego es el mismo juego en los dos.
  const LV = 1;
  const sol = solve(G, LV, 300000);
  check('el bot resuelve el nivel de prueba en node', sol.ok, sol.why || (sol.frames/60).toFixed(2) + 's');
  if (sol.ok){
    // Se maneja el BUCLE REAL del juego (frame → pollInput → stepWorld →
    // eventos → guardado), no la física suelta: así se prueba también que la
    // vuelta quede grabada como fantasma y que el récord se escriba.
    const jugado = await page.evaluate(([lv, plan, k]) => {
      try { localStorage.clear(); } catch(_){}
      loadSave();
      const guiones = [];
      for (const a of plan) for (let i = 0; i < k; i++) guiones.push(a);
      window.requestAnimationFrame = () => 0;      // el bucle no se re-agenda solo
      let f = 0;
      window.pollInput = () => guiones[Math.min(f++, guiones.length - 1)];
      GAME._abShown = -1; startLevel(lv);
      let t = performance.now();
      for (let i = 0; i < guiones.length + 120 && GAME.mode === 'play'; i++) frame(t += 1000/60);
      const g = ghostLoad(lv);
      return { modo:GAME.mode, best:lvRec(lv).best, ghost: g ? g.n : 0, wins:SAVE.wins };
    }, [LV, sol.path.map(i => actionsFor(G.LEVELS[LV])[i]), K]);
    check('el bucle real termina el nivel y guarda el récord',
      jugado.modo === 'win' && jugado.best === sol.frames, JSON.stringify(jugado) + ' vs ' + sol.frames);
    check('la vuelta queda grabada como fantasma',
      jugado.ghost === sol.frames, JSON.stringify(jugado));
  }

  await browser.close();
  server.close();
  console.log(ok ? '\nOK — la PWA anda.' : '\nHAY FALLAS.');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });

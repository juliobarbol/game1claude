// test/modos.test.cjs — maratón, espejo y tabla, en un navegador de verdad.
//
// POR QUÉ EXISTE: el maratón y el espejo tocan cosas que el solver no ve
// (estado de la partida, claves de guardado, pantallas) y que el test de PWA
// tampoco mira. Lo que más importa acá:
//
//   1. el maratón encadena los niveles SOLO, sin pantalla intermedia;
//   2. su cronómetro NO se reinicia al morir (el de nivel sí);
//   3. el récord del recorrido se guarda con sus parciales;
//   4. el espejo es de verdad el espejo, y sus récords van a otro casillero
//      (si se mezclaran, el récord de un lado borraría el del otro);
//   5. la tabla de récords no rompe nada cuando no hay internet.
//
// Uso:  NODE_PATH=/opt/node22/lib/node_modules node test/modos.test.cjs

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8300 + (process.pid % 300);

let chromium;
for (const p of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']){
  try { chromium = require(p).chromium; break; } catch (_){}
}
if (!chromium){
  console.error('No se encontró playwright. Probá:  NODE_PATH=/opt/node22/lib/node_modules node test/modos.test.cjs');
  process.exit(2);
}

const MIME = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png',
  '.webmanifest':'application/manifest+json', '.json':'application/json' };

let ok = true;
const check = (name, pass, extra) => {
  if (!pass) ok = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${extra != null ? '  — ' + extra : ''}`);
};

(async () => {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const f = path.join(ROOT, rel);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){
      res.writeHead(404); res.end('no'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    res.end(fs.readFileSync(f));
  }).listen(PORT);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push(String(e)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    // El pedido a Supabase lo corta este mismo test; que el navegador lo
    // anote en la consola es lo esperado, no un error del juego. Lo que NO
    // puede pasar es que ese corte tire una excepción (eso lo agarra
    // 'pageerror', que no se filtra).
    const u = (m.location() && m.location().url) || '';
    if (/supabase\.co/.test(u)) return;
    errores.push(m.text() + (u ? ' @ ' + u : ''));
  });
  // Que no salga a internet: así se prueba justo el caso "sin conexión".
  await page.route('**://*.supabase.co/**', r => r.abort());
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil:'load' });
  await page.waitForFunction(() => typeof window.startRun === 'function');

  // ── El espejo es el espejo ──
  const esp = await page.evaluate(() => {
    OPTS.mirror = 0; const a = parseLevel(LEVELS[0]);
    OPTS.mirror = 1; const b = parseLevel(LEVELS[0]);
    OPTS.mirror = 0;
    const W = a.w, H = a.h;
    let igual = true;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      if (a.tiles[y*W + x] !== b.tiles[y*W + (W-1-x)]) igual = false;
    return { igual, ax:a.spawn.x, bx:b.spawn.x, W, TS };
  });
  check('el espejo refleja la sala tile por tile', esp.igual);
  check('el inicio también se refleja', esp.ax !== esp.bx,
    `normal x=${esp.ax} · espejo x=${esp.bx}`);

  // Los pinchos laterales tienen que cambiar de lado, si no el nivel espejado
  // tendría púas mirando hacia adentro de la pared.
  const puas = await page.evaluate(() => {
    const i = LEVELS.findIndex(L => L.rows.join('').includes('>'));
    if (i < 0) return { salteado:true };
    OPTS.mirror = 0; const a = parseLevel(LEVELS[i]);
    OPTS.mirror = 1; const b = parseLevel(LEVELS[i]);
    OPTS.mirror = 0;
    const W = a.w;
    let cuentaA = 0, cuentaB = 0;
    for (let k = 0; k < a.tiles.length; k++){
      if (a.tiles[k] === T_SP_R) cuentaA++;
      if (b.tiles[k] === T_SP_L) cuentaB++;
    }
    return { i, cuentaA, cuentaB };
  });
  check('los pinchos laterales cambian de lado', puas.salteado || puas.cuentaA === puas.cuentaB,
    puas.salteado ? 'ningún nivel usa ">"' : `${puas.cuentaA} ">" → ${puas.cuentaB} "<"`);

  // ── Récords en casilleros distintos ──
  const casilleros = await page.evaluate(() => {
    try { localStorage.clear(); } catch(_){}
    loadSave();
    OPTS.mirror = 0; lvRec(3).best = 100;
    OPTS.mirror = 1; lvRec(3).best = 200;
    const normal = lvRec(3, '').best, espejo = lvRec(3, 'm').best;
    const gk = { normal:(OPTS.mirror = 0, ghostKey(3)), espejo:(OPTS.mirror = 1, ghostKey(3)) };
    OPTS.mirror = 0;
    return { normal, espejo, gk };
  });
  check('el récord del espejo no pisa al normal',
    casilleros.normal === 100 && casilleros.espejo === 200,
    `normal ${casilleros.normal} · espejo ${casilleros.espejo}`);
  check('el fantasma también va aparte', casilleros.gk.normal !== casilleros.gk.espejo,
    `${casilleros.gk.normal} vs ${casilleros.gk.espejo}`);

  // El desbloqueo se mira SIEMPRE contra el juego normal: si no, el espejo
  // arrancaría con todo trabado y sería un castigo en vez de un modo.
  const desbloqueo = await page.evaluate(() => {
    try { localStorage.clear(); } catch(_){}
    loadSave();
    OPTS.mirror = 0; lvRec(0).best = 120;      // terminaste el 1 en el juego normal
    OPTS.mirror = 1;
    const abierto = unlocked(1);
    OPTS.mirror = 0;
    return abierto;
  });
  check('el espejo hereda los niveles desbloqueados', desbloqueo === true);

  // ── Maratón ──
  const maraton = await page.evaluate(async () => {
    try { localStorage.clear(); } catch(_){}
    loadSave();
    OPTS.mirror = 0;
    const def = runDefs()[0];                  // el mundo 1
    startRun(def);
    const pantallas = [];
    const N = def.b - def.a;
    for (let k = 0; k < N; k++){
      pantallas.push(GAME.idx);
      GAME.run.on = true;
      GAME.run.frames += 60 * (k + 1);         // "tardaste" k+1 segundos
      GAME.w.timer = 60 * (k + 1);
      onWin();
      // Entre nivel y nivel NO tiene que aparecer ninguna pantalla.
      const visible = [...document.querySelectorAll('.screen')].some(s => !s.classList.contains('hidden'));
      if (visible && k < N - 1) return { error:'apareció una pantalla en el medio del maratón' };
      if (GAME.run) runAdvance();
    }
    const r = SAVE.run[def.k];
    return { pantallas, N, guardado:r, fin:GAME.lastRun, corriendo:!!GAME.run,
             pantallaFinal:!document.getElementById('scr-runend').classList.contains('hidden') };
  });
  check('el maratón encadena los niveles solo',
    !maraton.error && String(maraton.pantallas) === String([0,1,2,3,4].slice(0, maraton.N)),
    maraton.error || ('niveles ' + maraton.pantallas));
  check('el maratón termina y muestra el resultado',
    !maraton.corriendo && maraton.pantallaFinal === true);
  check('guarda el récord del recorrido con sus parciales',
    !!maraton.guardado && maraton.guardado.splits.length === maraton.N,
    maraton.guardado ? `${maraton.guardado.best} frames · ${maraton.guardado.splits.length} parciales` : 'no guardó');
  check('los parciales son acumulados y crecientes',
    !!maraton.guardado && maraton.guardado.splits.every((v, k, a) => k === 0 || v > a[k-1]),
    maraton.guardado ? String(maraton.guardado.splits) : '');

  // El reloj del recorrido no se reinicia al morir: es lo que lo hace un
  // maratón y no una suma de vueltas sueltas.
  const alMorir = await page.evaluate(() => {
    try { localStorage.clear(); } catch(_){}
    loadSave();
    startRun(runDefs()[0]);
    GAME.run.on = true; GAME.run.frames = 900;
    GAME.w.timer = 400;
    retryLevel();
    const r = { run:GAME.run.frames, nivel:GAME.w.timer, muertes:GAME.run.deaths };
    GAME.run = null; GAME.mode = 'menu'; GAME.w = null;
    return r;
  });
  check('al morir el reloj del maratón sigue y el del nivel se reinicia',
    alMorir.run === 900 && alMorir.nivel === 0 && alMorir.muertes === 1,
    `maratón ${alMorir.run} · nivel ${alMorir.nivel} · ☠ ${alMorir.muertes}`);

  // ── Maratón EXTREMO ──
  // El reloj de pared cuenta lo que el normal no cuenta: el rato que te
  // tomás para leer la sala antes de moverte, el respiro entre nivel y
  // nivel, y la pausa. Y para EXACTO en la última bandera.
  const extremo = await page.evaluate(async () => {
    try { localStorage.clear(); } catch(_){}
    loadSave();
    OPTS.extremo = 1;
    const def = runDefs()[0];
    startRun(def);
    const arrancoSolo = GAME.run.t0 > 0 && GAME.run.extremo === true;
    // Sin tocar una tecla, el reloj tiene que correr igual.
    await new Promise(r => setTimeout(r, 250));
    runTick(GAME.run);
    const quieto = GAME.run.frames;
    // Terminar todos los niveles menos el último.
    const N = def.b - def.a;
    for (let k = 0; k < N - 1; k++){ onWin(); runAdvance(); }
    onWin();                                   // última bandera
    const congelado = GAME.run ? GAME.run.frames : 0;
    await new Promise(r => setTimeout(r, 200));
    runTick(GAME.run);
    const despues = GAME.run ? GAME.run.frames : congelado;
    if (GAME.run) runAdvance();
    const clave = Object.keys(SAVE.run)[0];
    OPTS.extremo = 0;
    return { arrancoSolo, quieto, congelado, despues, clave, guardado:SAVE.run[clave] };
  });
  check('el extremo arranca al aparecer la sala, sin esperar tu movimiento',
    extremo.arrancoSolo && extremo.quieto > 0, `${extremo.quieto} frames quieto`);
  check('el extremo para en la última bandera y no sigue corriendo',
    extremo.congelado === extremo.despues,
    `${extremo.congelado} → ${extremo.despues}`);
  check('el récord extremo va a su propio casillero', extremo.clave === 'w0x',
    extremo.clave);

  // Normal y extremo no se pisan entre sí.
  const casillerosRun = await page.evaluate(() => {
    try { localStorage.clear(); } catch(_){}
    loadSave();
    OPTS.extremo = 0; OPTS.mirror = 0;
    const a = runKey('w0');
    OPTS.extremo = 1;         const b = runKey('w0');
    OPTS.mirror = 1;          const c = runKey('w0');
    OPTS.extremo = 0;         const d = runKey('w0');
    OPTS.mirror = 0;
    return [a, b, c, d];
  });
  check('los cuatro casilleros de recorrido son distintos',
    new Set(casillerosRun).size === 4, casillerosRun.join(' '));

  // ── La tabla sin internet ──
  const tabla = await page.evaluate(async () => {
    abrirTabla(null);
    await new Promise(r => setTimeout(r, 500));
    return { visible:!document.getElementById('scr-tabla').classList.contains('hidden'),
             texto:document.getElementById('tbList').textContent };
  });
  check('la tabla avisa que no hay conexión en vez de romperse',
    tabla.visible && /sin conexi/i.test(tabla.texto), tabla.texto.slice(0, 60));

  // Sin nombre puesto, no se manda nada (ni se rompe).
  const sinNombre = await page.evaluate(() => {
    NET.name = '';
    subirRecord('n0', 123, 0);
    return true;
  });
  check('sin nombre no intenta subir nada', sinNombre === true);

  check('ningún error de consola en todo el recorrido', errores.length === 0,
    errores.slice(0, 3).join(' | ') || 'limpio');

  await browser.close();
  srv.close();
  console.log(ok ? '\nOK — los modos nuevos andan.' : '\nHAY MODOS ROTOS.');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });

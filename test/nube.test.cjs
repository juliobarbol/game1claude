// test/nube.test.cjs — los borradores compartidos (Supabase).
//
// Prueba el ciclo completo con DOS navegadores distintos: una persona edita,
// la otra abre la misma clase desde otra computadora, ve el aviso de que hay
// algo más nuevo y se lo trae.
//
// Corre en dos modos y avisa en cuál:
//   REAL   — habla con Supabase de verdad.
//   DOBLE  — intercepta las llamadas y responde con un servidor de mentira.
//            Sirve para probar TODO el lado del navegador (la URL, las
//            cabeceras, el cuerpo, los avisos, la mezcla) sin depender de la
//            red. En el sandbox de Claude Code el navegador no sale a
//            internet, así que ahí corre siempre en este modo.
//
//   node test/nube.test.cjs
//   CURSO_FRASE=... node test/nube.test.cjs     ← para forzar el modo REAL

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8613;
const SUPA = 'https://pibikqsitcbotxbqeymr.supabase.co';
const FRASE_REAL = process.env.CURSO_FRASE || null;
const FRASE_DOBLE = 'frase-de-prueba';

let ok = true;
const check = (n, p, e) => {
  if (!p) ok = false;
  console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${e ? '  — ' + e : ''}`);
};

let chromium;
for (const p of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']){
  try { chromium = require(p).chromium; break; } catch (_){}
}
if (!chromium){
  console.log('SKIP  la nube — no se encontró playwright.');
  process.exit(0);
}

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };

// ─── El doble de Supabase ─────────────────────────────────────────────
// Implementa las cuatro funciones `curso_*` en memoria. Si el cliente manda
// una URL, una cabecera o un cuerpo distinto del esperado, esto falla — que
// es justamente lo que se quiere probar.
function armarDoble(){
  const filas = new Map();
  return async (route) => {
    const req = route.request();
    const fn = req.url().split('/rest/v1/rpc/')[1];
    const cab = req.headers();
    if (!cab['apikey'] || !/^Bearer /.test(cab['authorization'] || ''))
      return route.fulfill({ status: 401, body: '{"message":"sin apikey"}' });

    let cuerpo = {};
    try { cuerpo = JSON.parse(req.postData() || '{}'); } catch (e) {}

    if (cuerpo.frase !== FRASE_DOBLE)
      return route.fulfill({ status: 401, contentType: 'application/json',
        body: JSON.stringify({ code:'42501', message:'frase incorrecta' }) });

    const json = (v) => route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify(v) });

    if (fn === 'curso_listar')
      return json([...filas.values()]
        .map(({ id, titulo, quien, actualizado }) => ({ id, titulo, quien, actualizado }))
        .sort((a, b) => b.actualizado.localeCompare(a.actualizado)));

    if (fn === 'curso_leer')
      return json((filas.get(cuerpo.p_id) || {}).datos || null);

    if (fn === 'curso_guardar'){
      const cuando = new Date().toISOString();
      filas.set(cuerpo.p_id, { id: cuerpo.p_id, titulo: (cuerpo.p_datos || {}).titulo || '',
        datos: cuerpo.p_datos, quien: cuerpo.p_quien || '', actualizado: cuando });
      return json(cuando);
    }

    if (fn === 'curso_borrar'){ filas.delete(cuerpo.p_id); return json(true); }

    return route.fulfill({ status: 404, body: '{}' });
  };
}

(async () => {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    let f = path.join(ROOT, rel);
    if (!f.startsWith(ROOT)){ res.writeHead(403); res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)){ res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'text/plain' });
    res.end(fs.readFileSync(f));
  });
  await new Promise(r => server.listen(PORT, r));
  const base = `http://127.0.0.1:${PORT}`;

  const browser = await chromium.launch();

  // ¿Llega el navegador a Supabase? Eso decide el modo.
  let real = false;
  if (FRASE_REAL){
    const c = await browser.newContext();
    const p = await c.newPage();
    await p.goto('about:blank');
    real = await p.evaluate(async (u) => {
      try { const r = await fetch(u + '/rest/v1/', { method: 'HEAD' }); return r.status < 500; }
      catch (e){ return false; }
    }, SUPA);
    await c.close();
  }
  const FRASE = real ? FRASE_REAL : FRASE_DOBLE;
  const doble = real ? null : armarDoble();
  console.log(`\nModo: ${real ? 'REAL (Supabase de verdad)' : 'DOBLE (servidor de mentira)'}\n`);

  const nuevoAparato = async () => {
    const c = await browser.newContext();
    const p = await c.newPage();
    if (doble) await p.route(SUPA + '/rest/v1/rpc/*', doble);
    return { c, p };
  };

  const errs = [];
  const id = 'n1p1u01';

  // ─── Aparato 1 ──────────────────────────────────────────────────────
  const a1 = await nuevoAparato();
  a1.p.on('pageerror', e => errs.push(e.message));
  await a1.p.goto(`${base}/curso/editor.html?u=${id}`, { waitUntil: 'load' });
  await a1.p.waitForSelector('details.caja');

  check('sin nube, el editor arranca igual', !!(await a1.p.$('#form details')));
  check('el panel de la nube arranca oculto',
    await a1.p.$eval('#nubeFondo', e => getComputedStyle(e).display === 'none'));

  await a1.p.click('#nube');
  check('el panel se abre al tocar Nube',
    await a1.p.$eval('#nubeFondo', e => getComputedStyle(e).display !== 'none'));

  await a1.p.fill('#nubeQuien', 'Vicky');
  await a1.p.fill('#nubeFrase', 'frase-equivocada');
  await a1.p.click('#nubeEntrar');
  await a1.p.waitForTimeout(1200);
  const err = await a1.p.$eval('#nubeError', e => e.hidden ? '' : e.textContent);
  check('una frase incorrecta se avisa y no conecta', /no es/i.test(err), err.trim());
  check('y sigue sin conectar', !(await a1.p.$eval('#nube', e => e.classList.contains('conectado'))));

  await a1.p.fill('#nubeFrase', FRASE);
  await a1.p.click('#nubeEntrar');
  await a1.p.waitForTimeout(1500);
  check('con la frase correcta, conecta',
    await a1.p.$eval('#nube', e => e.classList.contains('conectado')));
  check('y el panel se cierra',
    await a1.p.$eval('#nubeFondo', e => getComputedStyle(e).display === 'none'));

  await a1.p.fill('input[data-ruta=\'["titulo"]\']', 'Clase sincronizada');
  await a1.p.waitForTimeout(2600);
  const estado = await a1.p.$eval('#estado', e => e.textContent);
  check('lo escrito sube a la nube', /nube/.test(estado), estado);

  // ─── Aparato 2: otra computadora ────────────────────────────────────
  const a2 = await nuevoAparato();
  a2.p.on('pageerror', e => errs.push(e.message));
  await a2.p.goto(`${base}/curso/editor.html?u=${id}`, { waitUntil: 'load' });
  await a2.p.waitForSelector('details.caja');
  check('el aparato 2 arranca con la versión publicada',
    (await a2.p.$eval('input[data-ruta=\'["titulo"]\']', e => e.value)) === "Hi, I'm…");

  await a2.p.click('#nube');
  await a2.p.fill('#nubeQuien', 'Julio');
  await a2.p.fill('#nubeFrase', FRASE);
  await a2.p.click('#nubeEntrar');
  await a2.p.waitForTimeout(2000);

  // Lo importante: acá NO hay nada que preguntar. El aparato 2 no tenía
  // cambios propios, así que lo de la nube es simplemente lo más nuevo.
  check('el aparato 2 se actualiza SOLO, sin preguntar nada',
    (await a2.p.$eval('input[data-ruta=\'["titulo"]\']', e => e.value)) === 'Clase sincronizada');

  const banda = await a2.p.$eval('#bandaNube', e => e.hidden ? '' : e.textContent).catch(() => '');
  check('avisa discretamente que se actualizó', /actualizado/i.test(banda), banda.trim().slice(0, 70));
  check('y dice de quién era', /Vicky/.test(banda));
  check('NO le pregunta con cuál seguir', !/con cuál|Con la de/i.test(banda));

  // ─── El único caso en que SÍ hay que preguntar ──────────────────────
  // El aparato 2 escribe algo propio, y mientras tanto el 1 escribe otra cosa.
  // Ahí hay dos versiones distintas y elegir por ella sería perderle trabajo.
  await a2.p.fill('input[data-ruta=\'["titulo"]\']', 'Lo que escribió Julio');
  await a2.p.waitForTimeout(700);
  await a2.p.evaluate(() => window.__pausa = true);      // simula quedarse sin señal
  await a2.p.route(SUPA + '/rest/v1/rpc/curso_guardar', r => r.abort());

  await a1.p.fill('input[data-ruta=\'["titulo"]\']', 'Lo que escribió Vicky');
  await a1.p.waitForTimeout(2600);

  await a2.p.unroute(SUPA + '/rest/v1/rpc/curso_guardar');
  if (doble) await a2.p.route(SUPA + '/rest/v1/rpc/*', doble);
  await a2.p.reload({ waitUntil: 'load' });
  await a2.p.waitForSelector('details.caja');
  await a2.p.waitForTimeout(2500);

  const banda2 = await a2.p.$eval('#bandaNube', e => e.hidden ? '' : e.textContent).catch(() => '');
  check('con cambios de los dos lados, SÍ pregunta', /con cuál seguimos/i.test(banda2),
    banda2.trim().slice(0, 90));
  check('y no pisó nada solo',
    (await a2.p.$eval('input[data-ruta=\'["titulo"]\']', e => e.value)) === 'Lo que escribió Julio');

  await a2.p.click('#traerNube');
  await a2.p.waitForTimeout(1200);
  check('si elige la de la nube, la trae',
    (await a2.p.$eval('input[data-ruta=\'["titulo"]\']', e => e.value)) === 'Lo que escribió Vicky');

  // Y a partir de ahí vuelve a estar todo al día: no debe volver a preguntar.
  await a2.p.reload({ waitUntil: 'load' });
  await a2.p.waitForSelector('details.caja');
  await a2.p.waitForTimeout(2000);
  const banda3 = await a2.p.$eval('#bandaNube', e => e.hidden ? '' : e.textContent).catch(() => '');
  check('resuelto una vez, no vuelve a preguntar', !/con cuál seguimos/i.test(banda3), banda3.slice(0, 60));

  await a2.p.goto(`${base}/curso/clase.html?u=${id}`, { waitUntil: 'load' });
  await a2.p.waitForSelector('.card');
  check('la clase muestra lo traído',
    (await a2.p.$eval('header.top h1 .en', e => e.textContent)) === 'Lo que escribió Vicky');

  // ─── Un alumno: ni ve borradores ni toca la red ─────────────────────
  const a3 = await nuevoAparato();
  const pedidos = [];
  a3.p.on('request', r => { if (r.url().indexOf(SUPA) === 0) pedidos.push(r.url()); });
  await a3.p.goto(`${base}/curso/clase.html?u=${id}`, { waitUntil: 'load' });
  await a3.p.waitForSelector('.card');
  await a3.p.waitForTimeout(1200);
  check('un alumno ve la versión publicada',
    (await a3.p.$eval('header.top h1 .en', e => e.textContent)) === "Hi, I'm…");
  check('y su navegador nunca habla con la nube', pedidos.length === 0, pedidos.join(' '));

  // ─── Desconectar ────────────────────────────────────────────────────
  await a1.p.click('#nube');
  await a1.p.click('#nubeSalir');
  await a1.p.waitForTimeout(300);
  check('se puede desconectar',
    !(await a1.p.$eval('#nube', e => e.classList.contains('conectado'))));

  check('sin errores de JavaScript', errs.length === 0, errs.join(' | '));

  // Limpieza: en modo REAL hay que sacar lo que dejamos en la base.
  if (real){
    await a2.p.goto(`${base}/curso/editor.html?u=${id}`, { waitUntil: 'load' });
    await a2.p.evaluate(x => NUBE.borrar(x), id);
    await a2.p.waitForTimeout(1200);
  }

  await browser.close();
  server.close();
  console.log(ok ? '\nOK — la nube anda.' : '\nHAY PROBLEMAS EN LA NUBE.');
  process.exit(ok ? 0 : 1);
})();

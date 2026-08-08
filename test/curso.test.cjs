// test/curso.test.cjs — el curso: datos, esquema y renderizado.
//
// Prueba tres cosas distintas:
//   1. ESQUEMA — cada clase declarada como 'listo' en el índice tiene su
//      archivo y todas las cajas obligatorias, sin cajas vacías.
//   2. COHERENCIA — el índice y los datos dicen lo mismo (id, número de
//      clase, título), y no hay ids repetidos ni archivos huérfanos.
//   3. RENDERIZADO — en un navegador de verdad: la clase se dibuja, sin
//      errores de consola, con las 12 cajas, y los botones funcionan.
//
//   node test/curso.test.cjs
//   NODE_PATH=/opt/node22/lib/node_modules node test/curso.test.cjs

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'curso', 'data');
const PORT = 8571;

let ok = true;
const check = (nombre, pasa, extra) => {
  if (!pasa) ok = false;
  console.log(`${pasa ? 'PASS' : 'FAIL'}  ${nombre}${extra ? '  — ' + extra : ''}`);
};

// ─── 1 · Cargar el índice y el esquema ──────────────────────────────
const { CURSO } = require(path.join(DATA, 'indice.js'));
// La validación es LA MISMA que ve la profesora en el editor: si el test y el
// editor tuvieran reglas propias, se desincronizarían y el editor mentiría.
const { ESQUEMA } = require(path.join(ROOT, 'curso', 'esquema.js'));
const todas = CURSO.todas();

check('el índice carga y tiene unidades', todas.length > 0, `${todas.length} unidades`);

const ids = todas.map(u => u.id);
check('no hay ids repetidos en el índice',
  new Set(ids).size === ids.length,
  ids.filter((v, i) => ids.indexOf(v) !== i).join(', ') || undefined);

const clases = todas.map(u => u.clase);
check('los números de clase son correlativos desde 1',
  clases.every((n, i) => n === i + 1),
  clases.join(','));

// ─── 2 · Cargar cada clase 'lista' y validar el esquema ─────────────
const CAJAS_GRAMMAR = ['inContext','theRule','watchOut','practice','speaking','iCan'];
const CAJAS_VOCAB   = ['wordBank','chunks','sayItRight','useIt','cards','myWords'];

function cargar(id){
  const f = path.join(DATA, id + '.js');
  if (!fs.existsSync(f)) return { falta: true };
  const ctx = { CLASES: {} };
  vm.createContext(ctx);
  new vm.Script(fs.readFileSync(f, 'utf8'), { filename: id + '.js' }).runInContext(ctx);
  return { clase: ctx.CLASES[id] };
}

const vacia = v =>
  v == null ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && Object.keys(v).length === 0);

// Todas las cadenas de texto del contenido, sin la estructura del objeto.
function textos(v, out){
  out = out || [];
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) textos(v[k], out);
  return out;
}

const listas = todas.filter(u => u.estado === 'listo');
check('hay al menos una clase lista', listas.length > 0, `${listas.length} lista(s)`);

for (const u of listas){
  const { falta, clase } = cargar(u.id);
  if (falta){ check(`${u.id}: existe el archivo de datos`, false, `falta curso/data/${u.id}.js`); continue; }
  if (!clase){ check(`${u.id}: el archivo declara CLASES['${u.id}']`, false); continue; }

  check(`${u.id}: el archivo declara la clase`, true, clase.titulo);

  // coherencia con el índice
  check(`${u.id}: el índice y los datos coinciden`,
    clase.id === u.id && clase.clase === u.clase && clase.titulo === u.titulo,
    `índice="${u.titulo}" datos="${clase.titulo}"`);

  // Todo lo demás lo dice la validación compartida con el editor: las 12 cajas
  // completas, la unidad que termina hablando, la práctica que termina en
  // personalizar y las marcas de texto cerradas.
  const problemas = ESQUEMA.validar(clase);
  const errores = problemas.filter(p => p.nivel === 'error');
  check(`${u.id}: pasa la validación del editor`, errores.length === 0,
    errores.map(e => `${e.donde}: ${e.texto}`).join(' | ') || undefined);

  const avisos = problemas.filter(p => p.nivel === 'aviso');
  if (avisos.length)
    console.log(`      avisos: ${avisos.map(a => `${a.donde}: ${a.texto}`).join(' | ')}`);
}

// ─── 2b · La validación detecta lo que tiene que detectar ───────────
// Si la validación no se prueba a sí misma, un cambio la puede volver ciega
// y el test seguiría en verde con clases rotas.
{
  const base = cargar(listas[0].id).clase;
  const clonar = () => JSON.parse(JSON.stringify(base));
  const rompe = (nombre, romper) => {
    const c = clonar(); romper(c);
    const hay = ESQUEMA.validar(c).some(p => p.nivel === 'error');
    check(`la validación detecta: ${nombre}`, hay);
  };
  rompe('una caja vacía',            c => { c.vocabulary.chunks = {}; });
  rompe('speaking sin rondas',       c => { c.grammar.speaking.rondas = []; });
  rompe('práctica sin personalizar', c => { c.grammar.practice.pasos.pop(); });
  rompe('un [[ sin cerrar',          c => { c.titulo += ' [['; });
  rompe('un ** sin cerrar',          c => { c.promesa += ' **'; });
  rompe('falta el título',           c => { c.titulo = ''; });
  check('la validación aprueba una clase buena',
    ESQUEMA.validar(base).filter(p => p.nivel === 'error').length === 0);
}

// ─── 3 · Archivos de datos huérfanos ────────────────────────────────
const archivos = fs.readdirSync(DATA)
  .filter(f => f.endsWith('.js') && f !== 'indice.js')
  .map(f => f.replace(/\.js$/, ''));
const huerfanos = archivos.filter(a => !ids.includes(a));
check('no hay archivos de datos fuera del índice', huerfanos.length === 0, huerfanos.join(', ') || undefined);

const declaradosSinArchivo = listas.filter(u => !archivos.includes(u.id)).map(u => u.id);
check('toda clase marcada como lista tiene su archivo',
  declaradosSinArchivo.length === 0, declaradosSinArchivo.join(', ') || undefined);

// ─── 4 · Renderizado en un navegador de verdad ──────────────────────
let chromium;
for (const p of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']){
  try { chromium = require(p).chromium; break; } catch (_){}
}

if (!chromium){
  console.log('\nSKIP  renderizado en navegador — no se encontró playwright.');
  console.log('      Probá:  NODE_PATH=/opt/node22/lib/node_modules node test/curso.test.cjs');
  console.log(ok ? '\nOK — los datos del curso están bien.' : '\nHAY PROBLEMAS EN EL CURSO.');
  process.exit(ok ? 0 : 1);
}

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.png':'image/png', '.webmanifest':'application/manifest+json' };

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
  const ctx = await browser.newContext({ viewport:{ width:1100, height:900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  // Un 404 de curso/data/<id>.js NO es un error: es lo que pasa cuando se abre
  // una clase que todavía no está armada, y es justamente lo que se está
  // probando. Se filtra por origen, no por el momento en que ocurre.
  const esperado404 = m => /\/curso\/data\/.*\.js/.test((m.location() || {}).url || '') &&
                           /404/.test(m.text());
  page.on('console', m => {
    if (m.type() === 'error' && !esperado404(m)) errs.push('console: ' + m.text());
  });

  // ── la portada se dibuja desde el índice ──
  await page.goto(base + '/', { waitUntil:'load' });
  const filas = await page.$$eval('.classes .cls', e => e.length);
  check('la portada dibuja todas las clases del índice', filas === todas.length, `${filas} de ${todas.length}`);
  const entrables = await page.$$eval('.classes a.cls', e => e.length);
  check('solo las clases listas son clickeables', entrables === listas.length, `${entrables} de ${listas.length}`);

  // ── cada clase lista se dibuja entera ──
  for (const u of listas){
    await page.goto(`${base}/curso/clase.html?u=${u.id}`, { waitUntil:'load' });
    await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {});

    const cajas = await page.$$eval('.card', e => e.length);
    check(`${u.id}: dibuja las 12 cajas`, cajas === 12, `${cajas}`);

    const oops = await page.$('.oops');
    check(`${u.id}: no muestra el aviso de error`, !oops);

    const titulo = await page.title();
    check(`${u.id}: el título de la pestaña sale de los datos`,
      titulo.includes(u.titulo), titulo);

    // el contenido no se coló como HTML crudo
    const crudo = await page.evaluate(() =>
      document.body.innerText.includes('{{') || document.body.innerText.includes('[[') ||
      document.body.innerText.includes('**'));
    check(`${u.id}: no quedaron marcas de texto sin procesar`, !crudo);

    // el resaltado del diálogo y los huecos existen
    const marcas = await page.$$eval('mark', e => e.length);
    check(`${u.id}: el diálogo tiene estructura resaltada`, marcas > 0, `${marcas} resaltados`);

    const huecos = await page.$$eval('.gap', e => e.length);
    check(`${u.id}: la práctica tiene huecos`, huecos > 0, `${huecos} huecos`);

    // las tablas del word bank (país/nacionalidad, números) se dibujan
    const { clase: datos } = cargar(u.id);
    const tablasEsperadas = ((datos && datos.vocabulary.wordBank.tablas) || []);
    if (tablasEsperadas.length){
      const dibujadas = await page.$$eval('.tabla-vocab', e => e.length);
      check(`${u.id}: dibuja las tablas del word bank`,
        dibujadas === tablasEsperadas.length, `${dibujadas} de ${tablasEsperadas.length}`);
      const filas = await page.$$eval('.tabla-vocab tbody tr', e => e.length);
      const esperadas = tablasEsperadas.reduce((n, t) => n + t.filas.length, 0);
      check(`${u.id}: las tablas tienen todas las filas`, filas === esperadas, `${filas} de ${esperadas}`);
      const columnasOk = await page.$$eval('.tabla-vocab', ts => ts.every(t => {
        const n = t.querySelectorAll('thead th').length;
        return [...t.querySelectorAll('tbody tr')].every(f => f.children.length === n);
      }));
      check(`${u.id}: cada fila tiene tantas celdas como columnas`, columnasOk);
    }

    // los botones andan
    const ocultosAntes = await page.$$eval('.gap.hidden', e => e.length);
    await page.click('button[data-respuestas]');
    const ocultosDespues = await page.$$eval('.gap.hidden', e => e.length);
    check(`${u.id}: el botón de respuestas descubre huecos`,
      ocultosDespues < ocultosAntes, `${ocultosAntes} → ${ocultosDespues}`);

    const tapadasAntes = await page.$$eval('.bank li .t.hidden', e => e.length);
    await page.click('button[data-traducciones]');
    const tapadasDespues = await page.$$eval('.bank li .t.hidden', e => e.length);
    check(`${u.id}: el botón de traducciones las tapa`,
      tapadasDespues > tapadasAntes, `${tapadasAntes} → ${tapadasDespues}`);

    // no se desborda en un celu
    await page.setViewportSize({ width: 390, height: 800 });
    const desborde = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${u.id}: no desborda a lo ancho en 390px`, desborde === 0, `${desborde}px`);
    await page.setViewportSize({ width: 1100, height: 900 });
  }

  // ── versión profesora ──
  for (const u of listas){
    await page.goto(`${base}/curso/clase.html?u=${u.id}&v=profesor`, { waitUntil:'load' });
    await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {});

    const tapados = await page.$$eval('.gap.hidden', e => e.length);
    check(`${u.id}: en versión profesora las respuestas vienen puestas`, tapados === 0, `${tapados} tapados`);

    const { clase } = cargar(u.id);
    if (clase && clase.profe){
      const cajaProfe = await page.$('.card.profe');
      check(`${u.id}: la versión profesora muestra el plan de clase`, !!cajaProfe);
      const filasPlan = await page.$$eval('.plan-clase tbody tr', e => e.length).catch(() => 0);
      check(`${u.id}: el plan tiene todos los tramos`,
        filasPlan === (clase.profe.plan || []).length, `${filasPlan}`);
    }

    // y en la versión alumno NO aparece
    await page.goto(`${base}/curso/clase.html?u=${u.id}`, { waitUntil:'load' });
    await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {});
    const seFiltro = await page.$('.card.profe');
    check(`${u.id}: la caja de la profesora NO aparece en la versión alumno`, !seFiltro);
  }

  // ── impresión ──
  await page.goto(`${base}/curso/imprimir.html?parte=n1p1`, { waitUntil:'load' });
  await page.waitForSelector('.clase', { timeout: 5000 }).catch(() => {});
  const impresas = await page.$$eval('.clase', e => e.length);
  check('imprimir una parte dibuja todas las clases armadas', impresas === listas.length, `${impresas}`);
  check('imprimir una parte pone portada', !!(await page.$('.portada')));

  await page.emulateMedia({ media: 'print' });
  const ocultos = await page.evaluate(() => {
    const oculto = sel => {
      const e = document.querySelector(sel);
      return !e || getComputedStyle(e).display === 'none';
    };
    return ['.panel', 'button.toggle', 'button.tema', 'footer'].every(oculto);
  });
  check('en impresión no salen los controles de pantalla', ocultos);

  const fondoImpreso = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('en impresión el fondo es blanco', fondoImpreso === 'rgb(255, 255, 255)', fondoImpreso);

  const traduccionesImpresas = await page.evaluate(() => {
    const t = document.querySelector('.bank li .t');
    return t ? getComputedStyle(t).visibility : 'sin-word-bank';
  });
  check('en impresión las traducciones se ven', traduccionesImpresas === 'visible', traduccionesImpresas);

  const cortes = await page.evaluate(() => {
    const c = document.querySelector('.card');
    return c ? getComputedStyle(c).breakInside : 'sin-cajas';
  });
  check('en impresión una caja no se parte entre hojas', cortes === 'avoid', cortes);

  // el tema oscuro no debe ensuciar el papel
  await page.evaluate(() => document.documentElement.setAttribute('data-theme','dark'));
  const fondoOscuroImpreso = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('en impresión se fuerza el claro aunque esté en tema oscuro',
    fondoOscuroImpreso === 'rgb(255, 255, 255)', fondoOscuroImpreso);
  await page.emulateMedia({ media: 'screen' });

  // ── imprimir un solo libro ──
  for (const [libro, cabecera, ausente] of [['grammar','.bookhead.g','.bookhead.v'],
                                            ['vocabulary','.bookhead.v','.bookhead.g']]){
    await page.goto(`${base}/curso/imprimir.html?parte=n1p1&libro=${libro}`, { waitUntil:'load' });
    await page.waitForSelector('.clase', { timeout: 5000 }).catch(() => {});
    check(`imprimir solo ${libro}: está el libro pedido`, !!(await page.$(cabecera)));
    check(`imprimir solo ${libro}: no está el otro`, !(await page.$(ausente)));
  }

  // ── el editor ──
  const pendiente0 = todas.find(u => u.estado !== 'listo');

  await page.goto(`${base}/curso/editor.html?u=${listas[0].id}`, { waitUntil:'load' });
  await page.waitForSelector('details.caja', { timeout: 5000 }).catch(() => {});

  const cajasForm = await page.$$eval('details.caja', e => e.length);
  check('el editor arma el formulario desde el esquema', cajasForm === 14, `${cajasForm} secciones`);

  const previa = await page.$$eval('.vista .card', e => e.length);
  check('el editor muestra la vista previa completa', previa === 12, `${previa} cajas`);

  const validoAlAbrir = await page.$eval('#resumen-val', e => e.textContent);
  check('una clase publicada abre sin errores en el editor',
    validoAlAbrir.includes('completa'), validoAlAbrir);

  // escribir el título y ver que la vista previa cambia
  const campoTitulo = await page.$('input[data-ruta=\'["titulo"]\']');
  check('el editor tiene el campo del título', !!campoTitulo);
  await campoTitulo.fill('Título de prueba');
  await page.waitForTimeout(150);
  const enVista = await page.$eval('.vista header.top h1 .en', e => e.textContent);
  check('la vista previa se actualiza mientras escribe', enVista === 'Título de prueba', enVista);

  // se guarda solo
  await page.waitForTimeout(700);
  const estado = await page.$eval('#estado', e => e.textContent);
  check('el borrador se guarda solo', estado.includes('guardado'), estado);

  const guardado = await page.evaluate(id =>
    (JSON.parse(localStorage.getItem('curso-borrador-' + id) || '{}').clase || {}).titulo,
    listas[0].id);
  check('el borrador queda en el navegador', guardado === 'Título de prueba', guardado);

  // la clase muestra el borrador y avisa
  await page.goto(`${base}/curso/clase.html?u=${listas[0].id}`, { waitUntil:'load' });
  await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {});
  const banda = await page.$('.banda-borrador');
  check('la clase avisa que está mostrando un borrador', !!banda);
  const tituloConBorrador = await page.$eval('header.top h1 .en', e => e.textContent);
  check('el borrador pisa a la clase publicada',
    tituloConBorrador === 'Título de prueba', tituloConBorrador);

  // exportar produce un archivo que se puede volver a leer
  await page.goto(`${base}/curso/editor.html?u=${listas[0].id}`, { waitUntil:'load' });
  await page.waitForSelector('details.caja', { timeout: 5000 }).catch(() => {});
  const ida = await page.evaluate(() => {
    const texto = BORRADORES.comoArchivo(
      JSON.parse(localStorage.getItem('curso-borrador-' + document.getElementById('cual').value)).clase);
    const vuelta = BORRADORES.desdeTexto(texto);
    return { titulo: vuelta.titulo, cajas: Object.keys(vuelta.grammar).length,
             arranca: texto.indexOf('CLASES[') > 0 };
  });
  check('exportar e importar devuelve la misma clase',
    ida.titulo === 'Título de prueba' && ida.cajas === 6 && ida.arranca, JSON.stringify(ida));

  // descartar el borrador vuelve a la versión publicada
  await page.evaluate(id => localStorage.removeItem('curso-borrador-' + id), listas[0].id);
  await page.goto(`${base}/curso/clase.html?u=${listas[0].id}`, { waitUntil:'load' });
  await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {});
  check('sin borrador vuelve la versión publicada',
    (await page.$eval('header.top h1 .en', e => e.textContent)) === listas[0].titulo);
  check('y desaparece el aviso de borrador', !(await page.$('.banda-borrador')));

  // una clase sin armar se puede empezar desde el índice
  if (pendiente0){
    await page.goto(`${base}/curso/editor.html?u=${pendiente0.id}`, { waitUntil:'load' });
    await page.waitForSelector('details.caja', { timeout: 5000 }).catch(() => {});
    const arranque = await page.$eval('input[data-ruta=\'["titulo"]\']', e => e.value);
    check('una clase sin armar arranca con los datos del índice',
      arranque === pendiente0.titulo, arranque);
    const faltan = await page.$eval('#resumen-val', e => e.textContent);
    check('y avisa todo lo que falta', /falta/i.test(faltan), faltan);
    await page.evaluate(id => localStorage.removeItem('curso-borrador-' + id), pendiente0.id);
  }

  // ── el tema abre SIEMPRE claro, aunque el sistema esté en oscuro ──
  const oscuro = await browser.newContext({ colorScheme: 'dark', viewport:{ width:1100, height:900 } });
  const po = await oscuro.newPage();
  for (const ruta of ['/', `/curso/clase.html?u=${listas[0].id}`, '/curso/nivel-1/parte-1/syllabus.html']){
    await po.goto(base + ruta, { waitUntil:'load' });
    const tema = await po.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const fondo = await po.evaluate(() =>
      getComputedStyle(document.body).backgroundColor);
    check(`${ruta}: abre en claro con el sistema en oscuro`,
      tema === 'light' && fondo === 'rgb(252, 252, 253)', `${tema} / ${fondo}`);
  }

  // ── el botón cambia a oscuro y la elección se recuerda ──
  await po.goto(base + `/curso/clase.html?u=${listas[0].id}`, { waitUntil:'load' });
  await po.click('[data-tema-boton]');
  const trasClic = await po.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('el botón pasa a oscuro', trasClic === 'dark', trasClic);

  await po.goto(base + '/', { waitUntil:'load' });
  const recordado = await po.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('la elección de tema se recuerda entre páginas', recordado === 'dark', recordado);

  await po.click('[data-tema-boton]');
  await po.goto(base + '/', { waitUntil:'load' });
  const vuelta = await po.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('se puede volver a claro', vuelta === 'light', vuelta);
  await oscuro.close();

  // ── una clase que está en el índice pero no armada avisa bien ──
  const pendiente = todas.find(u => u.estado !== 'listo');
  if (pendiente){
    await page.goto(`${base}/curso/clase.html?u=${pendiente.id}`, { waitUntil:'load' });
    await page.waitForTimeout(300);
    const aviso = await page.$eval('.oops h2', e => e.textContent).catch(() => null);
    check('una clase no armada avisa en vez de romperse', !!aviso, aviso || 'sin aviso');
  }

  // ── un id inventado no rompe ──
  await page.goto(`${base}/curso/clase.html?u=noexiste`, { waitUntil:'load' });
  await page.waitForTimeout(200);
  const aviso404 = await page.$eval('.oops h2', e => e.textContent).catch(() => null);
  check('un id inexistente avisa en vez de romperse', !!aviso404, aviso404 || 'sin aviso');

  check('ningún error de consola en todo el recorrido', errs.length === 0, errs.join(' | '));

  await browser.close();
  server.close();

  console.log(ok ? '\nOK — el curso se dibuja bien.' : '\nHAY PROBLEMAS EN EL CURSO.');
  process.exit(ok ? 0 : 1);
})();

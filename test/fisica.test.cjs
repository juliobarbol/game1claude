// test/fisica.test.cjs — la física, medida con regla.
//
// POR QUÉ EXISTE: el solver dice si un nivel se puede terminar, pero no si un
// movimiento hace lo que dice hacer. Los números de `PHY` son el contrato con
// el diseño de niveles ("un salto sube 3,2 tiles", "salto+dash cruza 9") y si
// alguno se mueve sin querer, los niveles siguen siendo terminables pero
// dejan de estar calibrados.
//
// Se juega sobre salas de mentira hechas acá (una losa plana, un pasillo),
// no sobre los niveles del juego: así mide la física y nada más.
//
// Uso:  node test/fisica.test.cjs

const { loadGame } = require('./_load.cjs');
const G = loadGame();

let ok = true;
const check = (name, pass, extra) => {
  if (!pass) ok = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${extra != null ? '  — ' + extra : ''}`);
};
const cerca = (a, b, tol) => Math.abs(a - b) <= tol;

// Una sala plana: piso corrido abajo y nada más. `P` al principio.
function salaPlana(){
  const vacia = ' '.repeat(28);
  const rows = [];
  for (let i = 0; i < 12; i++) rows.push(vacia);
  rows.push(' P' + ' '.repeat(26));
  rows.push('#'.repeat(28));
  rows.push(vacia);
  return { n:'plana', rows, par:[9,9,9], wall:true, dash:true, grav:true };
}
const QUIETO = { x:0, y:0, jump:false, dash:false };
const A = (o) => Object.assign({ x:0, y:0, jump:false, dash:false }, o);

function nuevo(){ return G.newWorld(G.parseLevel(salaPlana())); }
// Corre una lista de [cuántos cuadros, acción] y junta los eventos.
function correr(w, pasos){
  const ev = [];
  for (const [n, a] of pasos)
    for (let i = 0; i < n; i++){ G.stepWorld(w, a); for (const e of w.events) ev.push(e); }
  return ev;
}

// ── Los números que usa el diseño de niveles ──────────────────────
{
  const w = nuevo();
  const y0 = w.p.y;
  let alto = 0;
  correr(w, [[1, A({ jump:true })]]);
  for (let i = 0; i < 60; i++){
    G.stepWorld(w, A({ jump:true }));
    alto = Math.max(alto, y0 - w.p.y);
    if (w.p.grounded && i > 5) break;
  }
  check('un salto parado sube ~3,2 tiles', cerca(alto/G.TS, 3.2, .35), (alto/G.TS).toFixed(2) + ' tiles');
}
{
  const w = nuevo();
  correr(w, [[45, A({ x:1 })]]);              // tomar carrera
  const x0 = w.p.x, y0 = w.p.y;
  correr(w, [[1, A({ x:1, jump:true })]]);
  let n = 0, despego = false;
  while (n++ < 200){
    G.stepWorld(w, A({ x:1, jump:true }));
    if (!w.p.grounded) despego = true;
    else if (despego) break;
  }
  check('un salto corriendo cruza ~6 tiles', cerca((w.p.x - x0)/G.TS, 6, 1),
    ((w.p.x - x0)/G.TS).toFixed(2) + ' tiles');
}

// ── El impulso ────────────────────────────────────────────────────
// Dashear en diagonal hacia el piso y apretar salto JUSTO al tocar. El
// buffer del salto dura 8 cuadros desde que se aprieta, así que mantenerlo
// desde antes no sirve: hay que dar el golpe en la ventana. Para no depender
// de contar cuadros a mano, se mira un cuadro adelante con `cloneWorld`
// (que es lo que hace el bot) y se aprieta cuando el próximo toca piso.
function conImpulso(apretarSalto, gv){
  const arriba = gv === -1;
  const def = salaPlana();
  const rows = arriba ? def.rows.slice().reverse() : def.rows;
  const w = G.newWorld(G.parseLevel(Object.assign({}, def, rows !== def.rows
    ? { rows, gravInicial:-1 } : { rows })));
  correr(w, [[45, A({ x:1 })], [1, A({ x:1, jump:true })], [6, A({ x:1, jump:true })]]);
  const ev = correr(w, [[1, A({ x:1, y:arriba ? -1 : 1, dash:true })]]);
  const suelto = A({ x:1 }), saltando = A({ x:1, jump:true });
  for (let i = 0; i < 60 && !w.p.grounded; i++){
    // ¿el próximo cuadro toca piso?
    const espia = G.cloneWorld(w);
    G.stepWorld(espia, suelto);
    const tocaYa = espia.p.grounded;
    G.stepWorld(w, (apretarSalto && tocaYa) ? saltando : suelto);
    for (const e of w.events) ev.push(e);
    if (ev.includes('impulso')) break;
  }
  return { w, ev };
}
{
  const con = conImpulso(true), sin = conImpulso(false);
  check('con el salto apretado al tocar el piso sale el impulso', con.ev.includes('impulso'),
    'vx ' + con.w.p.vx.toFixed(0));
  check('sin apretar salto NO sale', !sin.ev.includes('impulso'));
  check('el impulso deja más rápido que correr',
    con.w.p.vx > G.PHY.RUN * 1.5, con.w.p.vx.toFixed(0) + ' vs RUN ' + G.PHY.RUN);
  check('el impulso salta MÁS BAJO que un salto normal',
    Math.abs(con.w.p.vy) < G.PHY.JUMP, Math.abs(con.w.p.vy).toFixed(0) + ' vs JUMP ' + G.PHY.JUMP);
}
{
  // Lo que va por encima de RUN se va de a poco, no de golpe: si no, el
  // impulso duraría tres cuadros y no serviría de nada.
  const { w } = conImpulso(true);
  const v0 = Math.abs(w.p.vx);
  for (let i = 0; i < 15; i++) G.stepWorld(w, A({ x:1 }));
  const v1 = Math.abs(w.p.vx);
  check('la velocidad de más se gasta despacio', v1 > G.PHY.RUN && v1 < v0,
    `${v0.toFixed(0)} → ${v1.toFixed(0)} en 15 cuadros`);
}
{
  // El impulso tiene que ganar distancia de verdad contra un salto corriendo.
  const medir = (usarImpulso) => {
    const r = usarImpulso ? conImpulso(true) : { w:(() => {
      const w = nuevo();
      correr(w, [[45, A({ x:1 })], [1, A({ x:1, jump:true })]]);
      return w;
    })() };
    const w = r.w, x0 = w.p.x;
    for (let i = 0; i < 45; i++) G.stepWorld(w, A({ x:1 }));
    return (w.p.x - x0)/G.TS;
  };
  const conI = medir(true), sinI = medir(false);
  check('el impulso llega más lejos que el salto corriendo',
    conI > sinI, `impulso ${conI.toFixed(2)} tiles vs salto ${sinI.toFixed(2)}`);
}

// ── Cabeza abajo tiene que valer lo mismo ─────────────────────────
{
  const r = conImpulso(true, -1);
  check('el impulso también sale con la gravedad dada vuelta', r.ev.includes('impulso'),
    'vy ' + r.w.p.vy.toFixed(0) + ' · vx ' + r.w.p.vx.toFixed(0));
}

// ── Determinismo ──────────────────────────────────────────────────
{
  const guion = [[45, A({ x:1 })], [1, A({ x:1, jump:true })], [8, A({ x:1, jump:true })],
                 [1, A({ x:1, y:1, dash:true })], [20, A({ x:1, jump:true })]];
  const a = nuevo(), b = nuevo();
  correr(a, guion); correr(b, guion);
  check('dos partidas con las mismas teclas terminan idénticas',
    a.p.x === b.p.x && a.p.y === b.p.y && a.p.vx === b.p.vx && a.p.vy === b.p.vy,
    `${a.p.x.toFixed(4)},${a.p.y.toFixed(4)}`);
}

console.log(ok ? '\nOK — la física mide lo que dice medir.' : '\nLA FÍSICA CAMBIÓ.');
process.exit(ok ? 0 : 1);

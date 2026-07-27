// test/solver.test.cjs — un bot juega los 15 niveles.
//
// POR QUÉ EXISTE: en un juego de precisión el peor error posible es publicar
// un nivel IMPOSIBLE (o uno que se rompe porque moviste una constante de la
// física). Un humano no puede probar 15 niveles a mano en cada cambio; un bot
// sí. Este test hace una búsqueda en anchura sobre las entradas del mando
// (las MISMAS que usa una persona: ← → ↑ ↓, SALTO, DASH) y exige que cada
// nivel se pueda terminar sin morir.
//
// Como la física es determinista y de paso fijo, la secuencia encontrada se
// vuelve a jugar desde cero sobre un mundo nuevo: si ahí también gana, el
// nivel es terminable de verdad (no es un artefacto de la búsqueda).
//
// Hace DOS pasadas por nivel:
//   1. llegar a la meta   → el tiempo de esa pasada es el piso de las medallas;
//   2. llegar a la meta CON la estrella → una estrella que no se puede juntar
//      es una promesa rota (y no hay forma de darse cuenta jugando: se ve, se
//      intenta veinte veces y no está).
//
// Uso:  node test/solver.test.cjs            (todos)
//       node test/solver.test.cjs 12         (solo el nivel 12)
//       node test/solver.test.cjs --par      (sugiere tiempos de medallas)
//       node test/solver.test.cjs --rapido   (saltea la pasada de estrellas)

const { loadGame } = require('./_load.cjs');
const G = loadGame();

const { K, solve, replay } = require('./_bot.cjs');

// ── Revisión de estructura ──────────────────────────────────────────
// Barata y ANTES que el bot: agarra las metidas de pata que no se ven
// jugando (una sala sin marca de inicio arranca en la esquina de arriba a
// la izquierda y "funciona"; una fila de 27 caracteres corre medio nivel).
function revisarEstructura(G){
  let ok = true;
  const mal = (i, m) => { ok = false; console.log(`FAIL  estructura L${i+1}: ${m}`); };
  G.LEVELS.forEach((L, i) => {
    if (L.rows.length !== 15) mal(i, `tiene ${L.rows.length} filas (tienen que ser 15)`);
    L.rows.forEach((r, y) => {
      if (r.length !== 28) mal(i, `la fila y${y+1} mide ${r.length} (tienen que ser 28)`);
      const raro = r.replace(/[ #^v<>=scoud*PG]/g, '');
      if (raro) mal(i, `la fila y${y+1} usa símbolos desconocidos: "${raro}"`);
    });
    const txt = L.rows.join('');
    const cuenta = c => (txt.split(c).length - 1);
    if (cuenta('P') !== 1) mal(i, `tiene ${cuenta('P')} marcas de inicio (P)`);
    if (cuenta('G') !== 1) mal(i, `tiene ${cuenta('G')} metas (G)`);
    if (cuenta('*') > 1) mal(i, `tiene ${cuenta('*')} estrellas (el juego muestra una)`);
    const par = L.par || [];
    if (par.length !== 3 || !(par[0] < par[1] && par[1] < par[2]))
      mal(i, `los tiempos de medalla no van de menor a mayor: ${JSON.stringify(par)}`);
    const P = G.parseLevel(L);
    const enSolido = (x, y) => P.tiles[Math.floor(y/G.TS)*P.w + Math.floor(x/G.TS)] === G.T_SOLID;
    if (enSolido(P.spawn.x + 5, P.spawn.y + 7)) mal(i, 'el inicio está dentro de una pared');
    if (enSolido(P.goal.x + 8, P.goal.y + 8)) mal(i, 'la meta está dentro de una pared');
  });
  console.log(ok ? `PASS  estructura de los ${G.LEVELS.length} niveles` : '');
  return ok;
}

const only = process.argv.find(a => /^\d+$/.test(a));
const wantPar = process.argv.includes('--par');
const rapido = process.argv.includes('--rapido');
let allOk = revisarEstructura(G);
const rows = [];
const list = only ? [ +only - 1 ] : G.LEVELS.map((_, i) => i);

for (const i of list){
  const L = G.LEVELS[i];
  const t0 = Date.now();
  const r = solve(G, i, 900000);
  let line = `${String(i+1).padStart(2)}. ${L.n.padEnd(13)}`;
  if (!r.ok){
    allOk = false;
    console.log(`FAIL  ${line} — NO SE PUEDE TERMINAR (${r.why}, ${r.expanded} estados)`);
    continue;
  }
  const rp = replay(G, i, r.path);
  if (!rp.ok){
    allOk = false;
    console.log(`FAIL  ${line} — la repetición no coincide (${rp.why}) → la física dejó de ser determinista`);
    continue;
  }
  const bot = rp.frames / 60;
  const par = L.par;
  const okPar = par[2] >= bot;      // el bronce tiene que ser alcanzable
  if (!okPar) allOk = false;
  rows.push({ i, bot, par });
  console.log(`${okPar ? 'PASS' : 'FAIL'}  ${line} bot ${bot.toFixed(2)}s  ` +
    `medallas ${par.map(p => p.toFixed(1)).join('/')}  ` +
    `(${r.expanded} estados, ${((Date.now()-t0)/1000).toFixed(1)}s)`);

  // ── Segunda pasada: la estrella ──
  if (rapido || !L.rows.join('').includes('*')) continue;
  const t1 = Date.now();
  const e = solve(G, i, 3000000, { estrella:true });
  if (!e.ok){
    allOk = false;
    console.log(`FAIL  ${' '.repeat(line.length)} ★ LA ESTRELLA NO SE PUEDE JUNTAR ` +
      `(${e.why}, ${e.expanded} estados)`);
    continue;
  }
  const er = replay(G, i, e.path, { estrella:true });
  if (!er.ok){ allOk = false; console.log(`FAIL  ${' '.repeat(line.length)} ★ ${er.why}`); continue; }
  console.log(`PASS  ${' '.repeat(line.length)} ★ con estrella ${(er.frames/60).toFixed(2)}s ` +
    `(+${((er.frames - rp.frames)/60).toFixed(2)}s de desvío, ${((Date.now()-t1)/1000).toFixed(1)}s)`);
}

if (wantPar){
  // El bot juega casi perfecto (encadena rebotes sin dudar), así que su
  // tiempo NO sirve como oro: sirve como piso. La escala de abajo deja el
  // oro exigente pero humano, y el bronce al alcance de terminarlo una vez.
  // Si al jugarlo de verdad quedan mal, se toca acá y se copian los `par`.
  const ORO = t => t*2.0 + .5, PLATA = t => t*2.8 + 1, BRONCE = t => t*4 + 3;
  console.log('\nSugerencia de `par` (oro/plata/bronce) a partir del tiempo del bot:');
  for (const r of rows)
    console.log(`  ${String(r.i+1).padStart(2)}: par:[${ORO(r.bot).toFixed(1)}, ${PLATA(r.bot).toFixed(1)}, ${BRONCE(r.bot).toFixed(1)}],`);
}
console.log(allOk ? '\nOK — todos los niveles son terminables.' : '\nHAY NIVELES ROTOS.');
process.exit(allOk ? 0 : 1);

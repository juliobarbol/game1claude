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
// Además imprime el tiempo del bot por nivel: es el piso sobre el que se
// calibran los tiempos de las medallas (`par` en LEVELS).
//
// Uso:  node test/solver.test.cjs            (todos)
//       node test/solver.test.cjs 12         (solo el nivel 12)
//       node test/solver.test.cjs --par      (sugiere tiempos de medallas)

const { loadGame } = require('./_load.cjs');
const G = loadGame();

const { K, solve, replay } = require('./_bot.cjs');

const only = process.argv.find(a => /^\d+$/.test(a));
const wantPar = process.argv.includes('--par');
let allOk = true;
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

// tools/star-spots.cjs — probar dónde poner una estrella.
//
// El problema con las estrellas no es que no se puedan TOCAR: es que se
// tocan y después no hay dónde caer. Una estrella sirve solo si se puede
// juntar Y TERMINAR el nivel; eso es lo que mide esta herramienta.
//
// Para cada posición candidata mueve la estrella ahí, hace jugar al bot
// exigiéndole la estrella, y dice cuánto tiempo EXTRA le costó el desvío
// respecto de la vuelta directa. Lo que buscamos: entre +0,3 s y +3 s.
// Menos que eso es una estrella regalada (está sobre el camino óptimo);
// "imposible" es que no exista forma de juntarla y llegar viva.
//
// Uso:  node tools/star-spots.cjs 8 20,1 18,3 24,10
//       (nivel 8, candidatas en tile x,y)

const { loadGame } = require('../test/_load.cjs');
const { solve } = require('../test/_bot.cjs');
const G = loadGame();

const args = process.argv.slice(2);
const idx = (+args.shift()) - 1;
const L = G.LEVELS[idx];
if (!L){ console.error('nivel inexistente'); process.exit(2); }

const filas = L.rows.slice();
function ponerEstrella(tx, ty){
  // Saca la estrella de donde esté y la pone en la casilla pedida.
  L.rows = filas.map(r => r.replace(/\*/g, ' '));
  const y = ty - 1, x = tx - 1;
  if (y < 0 || y >= L.rows.length || x < 0 || x >= 28) return 'fuera de la sala';
  if (L.rows[y][x] !== ' ') return 'ocupado por "' + L.rows[y][x] + '"';
  L.rows[y] = L.rows[y].slice(0, x) + '*' + L.rows[y].slice(x + 1);
  return null;
}

console.log(`Nivel ${idx+1} · ${L.n}`);
L.rows = filas.map(r => r.replace(/\*/g, ' '));
const base = solve(G, idx, 900000);
if (!base.ok){ console.error('el nivel no se puede terminar ni sin estrella:', base.why); process.exit(1); }
console.log(`vuelta directa: ${(base.frames/60).toFixed(2)}s\n`);

for (const a of args){
  const [tx, ty] = a.split(',').map(Number);
  const err = ponerEstrella(tx, ty);
  if (err){ console.log(`  (${tx},${ty})  —  ${err}`); continue; }
  const t0 = Date.now();
  const r = solve(G, idx, 3000000, { estrella:true });
  const seg = ((Date.now()-t0)/1000).toFixed(0);
  if (!r.ok){ console.log(`  (${tx},${ty})  ✗ IMPOSIBLE (${r.why}, ${seg}s)`); continue; }
  const extra = (r.frames - base.frames)/60;
  const veredicto = extra < .25 ? 'regalada' : extra > 4 ? 'carísima' : 'BIEN';
  console.log(`  (${tx},${ty})  ✓ ${(r.frames/60).toFixed(2)}s  desvío +${extra.toFixed(2)}s  → ${veredicto}  (${seg}s)`);
}
L.rows = filas;

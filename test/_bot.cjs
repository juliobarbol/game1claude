// test/_bot.cjs — el bot que juega los niveles.
//
// Búsqueda en anchura sobre las entradas del mando, con la MISMA interfaz que
// usa una persona (x, y, salto, dash sostenidos). Cada acción se mantiene K
// frames; los estados se podan cuantizando posición y velocidad, así el árbol
// no explota. Encuentra el camino más corto EN SU RESOLUCIÓN (no el óptimo
// absoluto): sirve para demostrar que un nivel se puede terminar y para tener
// un piso de tiempo sobre el que calibrar las medallas.

const K = 4;                    // frames que dura cada acción
const MAX_FRAMES = 60 * 45;
const CELL = 6;                 // cuantización de la posición (px)

function actionsFor(level){
  const A = [];
  for (const x of [-1, 0, 1]) for (const j of [0, 1]){
    A.push({ x, y:0, jump:!!j, dash:false });
    if (level.dash) for (const y of [-1, 0, 1]) A.push({ x, y, jump:!!j, dash:true });
  }
  return A;
}
function keyOf(w, conEstrella){
  const p = w.p;
  // Las estrellas juntadas forman parte del estado: si no, la poda tiraría
  // el camino "pasé por la estrella" por parecerse al camino que no pasó.
  let st = '';
  if (conEstrella) for (let i = 0; i < w.starGot.length; i++) st += w.starGot[i];
  return ((p.x/CELL)|0) + ',' + ((p.y/CELL)|0) + ',' +
    (p.vx > 20 ? 1 : p.vx < -20 ? -1 : 0) + ',' + (p.vy > 40 ? 1 : p.vy < -40 ? -1 : 0) + ',' +
    (p.grounded ? 1 : 0) + (p.dashAvail ? 1 : 0) + (p.wall + 1) + st;
}
const conTodasLasEstrellas = w => {
  for (let i = 0; i < w.starGot.length; i++) if (!w.starGot[i]) return false;
  return true;
};
function runAction(G, w, a, frames){
  for (let i = 0; i < frames; i++){
    G.stepWorld(w, a);
    if (w.p.dead || w.p.win) return;
  }
}
// opts.estrella = true → no alcanza con llegar a la meta: hay que llegar
// CON la estrella. Tocar la bandera sin ella termina el nivel, así que esa
// rama se descarta (es un callejón sin salida, igual que morir).
function solve(G, idx, budget, opts){
  const conEstrella = !!(opts && opts.estrella);
  const A = actionsFor(G.LEVELS[idx]);
  const root = G.newWorld(idx);
  const seen = new Set([keyOf(root, conEstrella)]);
  let frontier = [{ w:root, path:null }];
  let expanded = 0;
  for (let d = 0, dmax = Math.ceil(MAX_FRAMES/K); d < dmax; d++){
    const next = [];
    for (const node of frontier){
      for (let ai = 0; ai < A.length; ai++){
        const w = G.cloneWorld(node.w);
        runAction(G, w, A[ai], K);
        expanded++;
        if (w.p.dead) continue;
        if (w.p.win){
          if (conEstrella && !conTodasLasEstrellas(w)) continue;
          return { ok:true, path:unroll({ p:node.path, a:ai }), frames:w.timer, expanded };
        }
        const k = keyOf(w, conEstrella);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ w, path:{ p:node.path, a:ai } });
      }
      if (expanded > (budget || 900000)) return { ok:false, why:'presupuesto agotado', expanded };
    }
    if (!next.length) return { ok:false, why:'sin estados nuevos (nivel cerrado)', expanded };
    frontier = next;
  }
  return { ok:false, why:'sin salida en ' + (MAX_FRAMES/60) + ' s', expanded };
}
function unroll(n){ const o = []; for (let c = n; c; c = c.p) o.push(c.a); return o.reverse(); }

// Repite la secuencia sobre un mundo nuevo: si acá también gana, el nivel es
// terminable de verdad y la física siguió siendo determinista.
function replay(G, idx, path, opts){
  const conEstrella = !!(opts && opts.estrella);
  const A = actionsFor(G.LEVELS[idx]);
  const w = G.newWorld(idx);
  for (const ai of path){
    runAction(G, w, A[ai], K);
    if (w.p.dead) return { ok:false, why:'murió en la repetición' };
    if (w.p.win){
      if (conEstrella && !conTodasLasEstrellas(w))
        return { ok:false, why:'llegó a la meta sin la estrella' };
      return { ok:true, frames:w.timer };
    }
  }
  return { ok:false, why:'no llegó a la meta en la repetición' };
}

module.exports = { K, solve, replay, actionsFor };

// test/_bot.cjs — el bot que juega los niveles.
//
// Búsqueda en anchura sobre las entradas del mando, con la MISMA interfaz que
// usa una persona (x, y, salto, dash sostenidos). Cada acción se mantiene K
// frames; los estados se podan cuantizando posición y velocidad, así el árbol
// no explota. Encuentra el camino más corto EN SU RESOLUCIÓN (no el óptimo
// absoluto): sirve para demostrar que un nivel se puede terminar y para tener
// un piso de tiempo sobre el que calibrar las medallas.
//
// NIVELES LARGOS (encadenado): la anchura pura crece exponencialmente con la
// duración. El nivel 17, de 3,13 s, ya gastaba 889k estados de los 900k de
// presupuesto: un nivel de 5 s no fallaba por imposible sino por quedarse sin
// aire. Dos cosas lo arreglan sin perder la garantía de que el camino existe
// (que la da la repetición, no la búsqueda):
//
//   1. No se prueban las acciones con DASH cuando el dash no está disponible.
//      Apretar dash sin tenerlo no cambia la física, solo `prev.dash`, que la
//      clave de poda ni mira: esos estados se descartaban igual, pero recién
//      DESPUÉS de simularlos. En un nivel de mundo 3 o 4 son 24 acciones por
//      estado en vez de 6.
//   2. El frente se limita a un HAZ (beam): en cada nivel de profundidad se
//      conservan los mejores ANCHO estados según la distancia hasta la meta
//      —inundando la sala por tiles, no en línea recta, así una valla o un
//      pozo cuentan lo que cuestan—. Con tope por casilla para que el haz no
//      se llene de variantes del mismo lugar.
//
// El haz hace la búsqueda INCOMPLETA: un "no encontré" ya no prueba que el
// nivel sea imposible. Por eso, cuando falla, el solver reintenta con el haz
// abierto (ver `ANCHOS`), y recién ahí se declara roto el nivel.

const K = 4;                    // frames que dura cada acción
const MAX_FRAMES = 60 * 45;
const CELL = 6;                 // cuantización de la posición (px)
const ANCHO = 2600;             // estados que sobreviven por profundidad (haz)
const POR_CASILLA = 40;         // …y cuántos como mucho en la misma casilla
const LEJOS = 1e6;              // distancia de un tile del que no se sale

function actionsFor(level){
  const A = [];
  for (const x of [-1, 0, 1]) for (const j of [0, 1]){
    A.push({ x, y:0, jump:!!j, dash:false });
    if (level.dash) for (const y of [-1, 0, 1]) A.push({ x, y, jump:!!j, dash:true });
  }
  return A;
}
// Índices de `A` que vale la pena probar desde este estado. Apretar dash sin
// tenerlo (o en pleno dash) es idéntico a no apretarlo: se descarta antes de
// simular, no después.
function indicesFor(A, w){
  const libre = w.p.dashAvail && w.p.dash === 0;
  if (libre) return null;                       // null = todas
  const idx = [];
  for (let i = 0; i < A.length; i++) if (!A[i].dash) idx.push(i);
  return idx;
}
function keyOf(w, conEstrella){
  const p = w.p;
  // Las estrellas juntadas forman parte del estado: si no, la poda tiraría
  // el camino "pasé por la estrella" por parecerse al camino que no pasó.
  let st = '';
  if (conEstrella) for (let i = 0; i < w.starGot.length; i++) st += w.starGot[i];
  return ((p.x/CELL)|0) + ',' + ((p.y/CELL)|0) + ',' +
    (p.vx > 20 ? 1 : p.vx < -20 ? -1 : 0) + ',' + (p.vy > 40 ? 1 : p.vy < -40 ? -1 : 0) + ',' +
    (p.grounded ? 1 : 0) + (p.dashAvail ? 1 : 0) + (p.wall + 1) + (w.grav > 0 ? 'd' : 'u') + st;
}
const conTodasLasEstrellas = w => {
  for (let i = 0; i < w.starGot.length; i++) if (!w.starGot[i]) return false;
  return true;
};

// ── Distancia por la sala ────────────────────────────────────────────
// Inundación por tiles (4 vecinos) desde un destino. NO es física: es una
// medida de "cuánto falta" que respeta la forma de la sala, que es lo único
// que necesita el haz para no tirar el frente que va por buen camino. Los
// pinchos se tratan como pared: un estado vivo nunca está adentro de uno, y
// así la cuenta no cruza por donde no se puede estar.
function distanciasHasta(G, L, tx0, ty0){
  const W = L.w, H = L.h, d = new Int32Array(W*H).fill(LEJOS);
  const pasable = i => {
    const t = L.tiles[i];
    return t !== G.T_SOLID && t !== G.T_SPRING &&
           t !== G.T_SP_U && t !== G.T_SP_D && t !== G.T_SP_L && t !== G.T_SP_R;
  };
  const i0 = ty0*W + tx0;
  if (tx0 < 0 || ty0 < 0 || tx0 >= W || ty0 >= H) return d;
  d[i0] = 0;
  let cola = [i0];
  while (cola.length){
    const sig = [];
    for (const i of cola){
      const x = i % W, y = (i - x)/W, nd = d[i] + 1;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny*W + nx;
        if (d[j] <= nd || !pasable(j)) continue;
        d[j] = nd; sig.push(j);
      }
    }
    cola = sig;
  }
  return d;
}
// La casilla que ocupa el jugador (el centro del cuerpo, no la esquina).
const casillaDe = (G, w) =>
  Math.floor((w.p.y + G.PH/2)/G.TS)*w.L.w + Math.floor((w.p.x + G.PW/2)/G.TS);

// Cuánto falta desde este estado: primero la estrella (si hace falta y no la
// tiene), después la meta. Sumar el tramo estrella→meta mantiene la escala
// comparable entre los dos tramos, así el haz no prefiere ir a la bandera.
function guiaDe(G, idx, conEstrella){
  const L = G.parseLevel(G.LEVELS[idx]);
  const dMeta = distanciasHasta(G, L, Math.floor(L.goal.x/G.TS), Math.floor(L.goal.y/G.TS));
  const s = conEstrella && L.stars.length ? L.stars[0] : null;
  if (!s) return w => dMeta[casillaDe(G, w)];
  const dEstrella = distanciasHasta(G, L, s.tx, s.ty);
  const resto = Math.min(dMeta[s.ty*L.w + s.tx], LEJOS);
  return w => {
    const c = casillaDe(G, w);
    return w.starGot[0] ? dMeta[c] : Math.min(LEJOS, dEstrella[c] + resto);
  };
}

// Recorta el frente al haz: primero un tope por casilla (para que no se
// llene de variantes del mismo rincón) y después los mejores por distancia.
function podarHaz(nodos, ancho, porCasilla){
  if (nodos.length <= ancho) return nodos;
  const cupo = new Map(), pasa = [];
  for (const n of nodos){
    const c = cupo.get(n.celda) || 0;
    if (c >= porCasilla) continue;
    cupo.set(n.celda, c + 1); pasa.push(n);
  }
  if (pasa.length <= ancho) return pasa;
  pasa.sort((a, b) => a.h - b.h);
  return pasa.slice(0, ancho);
}

function runAction(G, w, a, frames){
  for (let i = 0; i < frames; i++){
    G.stepWorld(w, a);
    if (w.p.dead || w.p.win) return;
  }
}
// opts.estrella = true → no alcanza con llegar a la meta: hay que llegar
// CON la estrella. Tocar la bandera sin ella termina el nivel, así que esa
// rama se descarta (es un callejón sin salida, igual que morir).
// opts.ancho    → tamaño del haz (Infinity = anchura pura, como antes).
// opts.alVer(w) → se llama con cada mundo vivo que se genera (lo usa
//                 tools/trace.cjs para pintar hasta dónde llega el bot).
function solve(G, idx, budget, opts){
  opts = opts || {};
  const conEstrella = !!opts.estrella;
  const ancho = opts.ancho == null ? ANCHO : opts.ancho;
  const alVer = opts.alVer;
  const A = actionsFor(G.LEVELS[idx]);
  const guia = guiaDe(G, idx, conEstrella);
  const root = G.newWorld(idx);
  const seen = new Set([keyOf(root, conEstrella)]);
  let frontier = [{ w:root, path:null }];
  let expanded = 0, podados = 0;
  for (let d = 0, dmax = Math.ceil(MAX_FRAMES/K); d < dmax; d++){
    const next = [];
    for (const node of frontier){
      const usar = indicesFor(A, node.w);
      const n = usar ? usar.length : A.length;
      for (let u = 0; u < n; u++){
        const ai = usar ? usar[u] : u;
        const w = G.cloneWorld(node.w);
        runAction(G, w, A[ai], K);
        expanded++;
        if (w.p.dead) continue;
        if (alVer) alVer(w);
        if (w.p.win){
          if (conEstrella && !conTodasLasEstrellas(w)) continue;
          return { ok:true, path:unroll({ p:node.path, a:ai }), frames:w.timer, expanded, podados };
        }
        const k = keyOf(w, conEstrella);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ w, path:{ p:node.path, a:ai }, h:guia(w), celda:casillaDe(G, w) });
      }
      if (expanded > (budget || 900000)) return { ok:false, why:'presupuesto agotado', expanded, podados };
    }
    if (!next.length) return { ok:false, why:'sin estados nuevos (nivel cerrado)', expanded, podados };
    const haz = podarHaz(next, ancho, POR_CASILLA);
    podados += next.length - haz.length;
    frontier = haz;
  }
  return { ok:false, why:'sin salida en ' + (MAX_FRAMES/60) + ' s', expanded, podados };
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

module.exports = { K, ANCHO, solve, replay, actionsFor, indicesFor };

// tools/trace.cjs — mirar un nivel y el camino que encuentra el bot.
//
// Es la herramienta de diseño de niveles: dibuja la sala en la terminal y,
// si el bot la resuelve, marca por dónde pasó. Cuando un nivel "no se puede
// terminar", acá se ve dónde se queda.
//
// Uso:  node tools/trace.cjs 3          → dibuja el nivel 3 y traza el bot
//       node tools/trace.cjs 3 --map    → solo el mapa (rápido)
//       node tools/trace.cjs --all      → mapas de todos
//
// Leyenda del trazado:  • camino del bot   ˙ dónde MÁS puede llegar (vivo)
//                       ★ estrella que se puede juntar   * estrella imposible
// Las casillas se marcan por donde pasa el CUERPO del jugador (no su esquina),
// que es lo que decide si toca una estrella.

const { loadGame } = require('../test/_load.cjs');
const G = loadGame();

const CH = { 0:'·', 1:'█', 2:'^', 3:'v', 4:'<', 5:'>', 6:'=', 7:'S', 8:'c' };

function mapOf(L){
  const g = [];
  for (let y = 0; y < L.h; y++){
    const row = [];
    for (let x = 0; x < L.w; x++){
      let c = CH[L.tiles[y*L.w + x]] || '?';
      if (L.cryAt[y*L.w + x] >= 0) c = 'o';
      if (L.stars.some(s => s.tx === x && s.ty === y)) c = '*';
      row.push(c);
    }
    g.push(row);
  }
  g[Math.floor(L.goal.y/16)][Math.floor(L.goal.x/16)] = 'G';
  g[Math.floor((L.spawn.y + 14)/16)][Math.floor(L.spawn.x/16)] = 'P';
  for (const m of L.movers){
    for (const t of [0, 1e6]){
      const r = G.moverRect(m, t === 0 ? 0 : 1e6);
      for (let x = Math.floor(r.x/16); x < Math.ceil((r.x + r.w)/16); x++){
        const y = Math.floor(r.y/16);
        if (g[y] && g[y][x] === '·') g[y][x] = '=';
      }
    }
  }
  for (const s of L.saws){
    for (const p of [{x:s.x,y:s.y}, {x:s.x2,y:s.y2}]){
      const y = Math.floor(p.y/16), x = Math.floor(p.x/16);
      if (g[y] && g[y][x] === '·') g[y][x] = 'x';
    }
  }
  return g;
}
function print(g, title){
  console.log('\n' + title);
  g.forEach((r, y) => console.log(String(y).padStart(2) + ' ' + r.join('')));
}

const args = process.argv.slice(2);
const all = args.includes('--all');
const mapOnly = args.includes('--map');
const idxs = all ? G.LEVELS.map((_, i) => i) : [ (+args.find(a => /^\d+$/.test(a)) || 1) - 1 ];

for (const i of idxs){
  const L = G.parseLevel(G.LEVELS[i]);
  const g = mapOf(L);
  if (mapOnly || all){ print(g, `#${i+1} ${L.name}  (pared:${L.ab.wall?'sí':'no'} dash:${L.ab.dash?'sí':'no'})`); continue; }

  // Trazar el bot reutilizando la búsqueda del test
  const K = 4;
  const A = [];
  for (const x of [-1,0,1]) for (const j of [0,1]){
    A.push({ x, y:0, jump:!!j, dash:false });
    if (G.LEVELS[i].dash) for (const y of [-1,0,1]) A.push({ x, y, jump:!!j, dash:true });
  }
  const key = w => ((w.p.x/6)|0)+','+((w.p.y/6)|0)+','+(w.p.vx>20?1:w.p.vx<-20?-1:0)+','+
    (w.p.vy>40?1:w.p.vy<-40?-1:0)+','+(w.p.grounded?1:0)+(w.p.dashAvail?1:0)+(w.p.wall+1);
  const seen = new Set(); let frontier = [{ w:G.newWorld(i), path:[] }];
  seen.add(key(frontier[0].w));
  let win = null, reach = new Set(), expanded = 0;
  for (let d = 0; d < 700 && !win && frontier.length; d++){
    const next = [];
    for (const n of frontier){
      for (let ai = 0; ai < A.length; ai++){
        const w = G.cloneWorld(n.w);
        for (let f = 0; f < K && !w.p.dead && !w.p.win; f++) G.stepWorld(w, A[ai]);
        expanded++;
        if (w.p.dead) continue;
        // Todas las casillas que toca el cuerpo, no solo la de la esquina:
        // una estrella se junta por superposición de cajas.
        for (let ty = Math.floor(w.p.y/16); ty <= Math.floor((w.p.y + G.PH - 1)/16); ty++)
          for (let tx = Math.floor(w.p.x/16); tx <= Math.floor((w.p.x + G.PW - 1)/16); tx++)
            reach.add(ty*100 + tx);
        if (w.p.win){ win = { w, path:n.path.concat(ai) }; break; }
        const k = key(w);
        if (seen.has(k)) continue;
        seen.add(k); next.push({ w, path:n.path.concat(ai) });
      }
      if (win || expanded > 900000) break;
    }
    if (win || expanded > 900000) break;
    frontier = next;
  }
  // Marcar lo alcanzado y el camino
  for (const v of reach){
    const y = Math.floor(v/100), x = v % 100;
    if (!g[y]) continue;
    if (g[y][x] === '·') g[y][x] = '˙';
    else if (g[y][x] === '*') g[y][x] = '★';     // estrella que sí se toca
  }
  const perdidas = L.stars.filter(s => g[s.ty][s.tx] === '*');
  if (win){
    const w = G.newWorld(i);
    for (const ai of win.path){
      for (let f = 0; f < K && !w.p.dead && !w.p.win; f++){
        G.stepWorld(w, A[ai]);
        const y = Math.floor((w.p.y + 7)/16), x = Math.floor((w.p.x + 5)/16);
        if (g[y] && (g[y][x] === '·' || g[y][x] === '˙')) g[y][x] = '•';
      }
    }
    print(g, `#${i+1} ${L.name} — RESUELTO en ${(win.w.timer/60).toFixed(2)}s (${expanded} estados)` +
      (perdidas.length ? `  ⚠ ESTRELLA FUERA DE ALCANCE en ${perdidas.map(s => '(' + s.tx + ',' + s.ty + ')').join(' ')}` : ''));
  } else {
    print(g, `#${i+1} ${L.name} — SIN SALIDA (${expanded} estados). '˙' = a dónde llega el bot`);
  }
}

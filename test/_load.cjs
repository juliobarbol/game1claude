// test/_load.cjs — carga el JS del juego en node, sin navegador.
//
// El juego vive todo en juego/index.html. Acá se extrae el <script> inline y se
// evalúa en un contexto con lo mínimo del DOM stubbeado, para poder correr
// la FÍSICA en node (que es pura a propósito: sin DOM, sin random, paso fijo).
//
// Devuelve el objeto de contexto: ahí están LEVELS, parseLevel, newWorld,
// stepWorld, cloneWorld, PHY, TS, etc.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadGame(){
  const html = fs.readFileSync(path.resolve(__dirname, '..', 'juego', 'index.html'), 'utf8');
  const parts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  // `const`/`let` de nivel superior no quedan en el objeto global del vm:
  // se exportan a mano al final (esta lista es el "contrato" con los tests).
  const EXPORTS = ['LEVELS','parseLevel','newWorld','stepWorld','cloneWorld','resetAttempt',
    'PHY','TS','PW','PH','DT','ROOM_W','ROOM_H','VIEW_W','VIEW_H','LS','OPTS','SAVE',
    'medalOf','fmtT','moverRect','sawPos','blocked','solidTile','tileAt','hurt',
    'T_SOLID','T_SP_U','T_SP_D','T_SP_L','T_SP_R','T_ONEWAY','T_SPRING','T_CRUMB'];
  const src = parts.join('\n;\n') +
    '\n;\nvar __EXPORTS__ = {' + EXPORTS.map(k => k + ':(typeof ' + k + '!=="undefined"?' + k + ':undefined)').join(',') + '};\n';

  const noop = () => {};
  const store = new Map();
  // Canvas 2D de mentira: cualquier método es un no-op. Alcanza para que el
  // juego arranque; en node solo nos interesa la física.
  const fakeCtx = new Proxy({}, {
    get: (t, k) => (k in t ? t[k] : (t[k] = (typeof k === 'string' && /^(createLinearGradient|createRadialGradient)$/.test(k))
      ? () => ({ addColorStop: noop }) : noop)),
    set: (t, k, v) => { t[k] = v; return true; },
  });
  const el = () => ({
    style:{ setProperty:noop, removeProperty:noop },
    classList:{ add:noop, remove:noop, toggle:noop, contains:()=>false },
    addEventListener:noop, setPointerCapture:noop, appendChild:noop, remove:noop,
    getContext:() => fakeCtx, getBoundingClientRect:() => ({ width:480, height:272, left:0, top:0 }),
    textContent:'', innerHTML:'', dataset:{}, children:[], parentNode:null,
    querySelectorAll:() => [], width:480, height:272,
  });
  const ctx = {
    console,
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: noop, cancelAnimationFrame: noop,
    addEventListener: noop, removeEventListener: noop,
    localStorage:{
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k,v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      clear: () => store.clear(),
    },
    navigator:{ getGamepads: () => [], vibrate: noop, serviceWorker:null, maxTouchPoints:0 },
    document:{
      getElementById: el, querySelector: el, querySelectorAll: () => [],
      createElement: el, addEventListener: noop, documentElement: el(),
      body:{ classList:{ add:noop, remove:noop, toggle:noop, contains:()=>false } },
    },
    location:{ protocol:'file:', href:'file:///index.html' },
    innerWidth:960, innerHeight:544, devicePixelRatio:1,
    matchMedia: () => ({ matches:false, addEventListener:noop }),
    performance:{ now: () => Date.now() },
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(src, { filename:'index.html<script>' }).runInContext(ctx);
  return Object.assign(ctx, ctx.__EXPORTS__);
}

module.exports = { loadGame };

// ════════════════════════════════════════════════════════════════════
// LA NUBE — borradores compartidos entre aparatos (Supabase)
//
// Reglas que no se negocian:
//   · La nube NUNCA hace falta. Sin internet o sin frase de acceso, el
//     editor anda exactamente igual contra localStorage.
//   · Nada de `await` en el camino de escribir: se guarda local primero
//     (instantáneo) y la nube se sincroniza detrás.
//   · Todo lo que toca la red va dentro de try/catch.
//   · La nube NUNCA pisa lo local sin preguntar. Si hay una versión más
//     nueva del otro lado, se avisa y decide la persona.
//
// La clave que está acá abajo es la PUBLICABLE, la que va en el HTML a
// propósito. La tabla no se toca directo: está cerrada con RLS y el único
// camino son las funciones `curso_*`, que piden la frase de acceso.
// ════════════════════════════════════════════════════════════════════

(function (raiz) {

  const URL_BASE = 'https://pibikqsitcbotxbqeymr.supabase.co';
  const CLAVE_PUB = 'sb_publishable_44vkb62Bky3ZVtb0RiolyQ_hMAuABmo';
  const LS_FRASE = 'curso-nube-frase';
  const LS_QUIEN = 'curso-nube-quien';

  let frase = null;
  let quien = '';
  try {
    frase = localStorage.getItem(LS_FRASE) || null;
    quien = localStorage.getItem(LS_QUIEN) || '';
  } catch (e) {}

  const conectada = () => !!frase;

  async function rpc(fn, cuerpo, ms){
    const corte = new AbortController();
    const reloj = setTimeout(() => corte.abort(), ms || 12000);
    try {
      const r = await fetch(URL_BASE + '/rest/v1/rpc/' + fn, {
        method: 'POST',
        headers: {
          'apikey': CLAVE_PUB,
          'Authorization': 'Bearer ' + CLAVE_PUB,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuerpo),
        signal: corte.signal,
      });
      if (r.status === 401 || r.status === 403) throw new Error('frase');
      if (!r.ok) throw new Error('http ' + r.status);
      const txt = await r.text();
      return txt ? JSON.parse(txt) : null;
    } finally { clearTimeout(reloj); }
  }

  // ─── Entrar y salir ───────────────────────────────────────────────
  // Entrar es simplemente probar la frase contra el servidor: si lista, sirve.
  async function entrar(f, nombre){
    f = String(f || '').trim();
    if (!f) throw new Error('Escribí la frase de acceso.');
    await rpc('curso_listar', { frase: f });      // tira si la frase está mal
    frase = f;
    quien = String(nombre || quien || '').trim().slice(0, 40);
    try {
      localStorage.setItem(LS_FRASE, frase);
      localStorage.setItem(LS_QUIEN, quien);
    } catch (e) {}
    return true;
  }

  function salir(){
    frase = null;
    try { localStorage.removeItem(LS_FRASE); } catch (e) {}
  }

  // ─── Operaciones ──────────────────────────────────────────────────
  // Todas devuelven null en vez de tirar cuando simplemente no hay nube:
  // quien llama no tiene que envolver cada uso en un try.
  async function listar(){
    if (!conectada()) return null;
    try { return await rpc('curso_listar', { frase: frase }); }
    catch (e){ return null; }
  }

  async function leer(id){
    if (!conectada()) return null;
    try { return await rpc('curso_leer', { frase: frase, p_id: id }); }
    catch (e){ return null; }
  }

  // Devuelve la marca de tiempo del servidor, o null si no se pudo.
  async function guardar(id, clase){
    if (!conectada()) return null;
    try {
      return await rpc('curso_guardar',
        { frase: frase, p_id: id, p_datos: clase, p_quien: quien });
    } catch (e){ return null; }
  }

  async function borrar(id){
    if (!conectada()) return null;
    try { return await rpc('curso_borrar', { frase: frase, p_id: id }); }
    catch (e){ return null; }
  }

  // ─── Ficha de una clase en la nube (sin bajar el contenido) ───────
  async function ficha(id){
    const todas = await listar();
    if (!todas) return null;
    return todas.find(x => x.id === id) || null;
  }

  raiz.NUBE = {
    conectada, entrar, salir, listar, leer, guardar, borrar, ficha,
    quien: () => quien,
    url: URL_BASE,
  };

})(typeof window !== 'undefined' ? window : globalThis);

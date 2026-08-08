// ════════════════════════════════════════════════════════════════════
// BORRADORES
//
// Mientras no haya nube (etapa 4), lo que se edita vive en ESTE navegador,
// en localStorage. Dos consecuencias que el editor tiene que dejar clarísimas:
//   · desde otra computadora no se ven;
//   · si se limpia el navegador, se pierden.
// Por eso el botón de EXPORTAR es el más importante del editor: baja un
// archivo listo para guardar en el repo, que es el archivo definitivo.
//
// Un borrador PISA a la clase publicada cuando existe. Así se puede corregir
// una clase ya armada y ver el cambio al instante, sin tocar archivos.
// ════════════════════════════════════════════════════════════════════

(function (raiz) {

  const PREFIJO = 'curso-borrador-';

  function claveDe(id){ return PREFIJO + id; }

  function leer(id){
    try {
      const crudo = localStorage.getItem(claveDe(id));
      if (!crudo) return null;
      const sobre = JSON.parse(crudo);
      return sobre && sobre.clase ? sobre.clase : null;
    } catch (e){ return null; }
  }

  function cuando(id){
    try {
      const crudo = localStorage.getItem(claveDe(id));
      if (!crudo) return null;
      return (JSON.parse(crudo) || {}).cuando || null;
    } catch (e){ return null; }
  }

  // `sincronizado` es la marca de tiempo del servidor de la ÚLTIMA vez que
  // este borrador y la nube estuvieron iguales. Es lo que permite saber si
  // los cambios de un lado ya viajaron al otro — y por lo tanto, si hay un
  // conflicto de verdad o simplemente hay que actualizar.
  function sincronizado(id){
    try {
      const crudo = localStorage.getItem(claveDe(id));
      if (!crudo) return null;
      return (JSON.parse(crudo) || {}).sincronizado || null;
    } catch (e){ return null; }
  }

  function marcarSincronizado(id, cuandoServidor){
    try {
      const crudo = localStorage.getItem(claveDe(id));
      if (!crudo) return false;
      const sobre = JSON.parse(crudo);
      sobre.sincronizado = cuandoServidor;
      localStorage.setItem(claveDe(id), JSON.stringify(sobre));
      return true;
    } catch (e){ return false; }
  }

  function guardar(id, clase, cuandoServidor){
    try {
      const antes = sincronizado(id);
      localStorage.setItem(claveDe(id), JSON.stringify({
        cuando: new Date().toISOString(),
        sincronizado: cuandoServidor || antes || null,
        clase: clase,
      }));
      return true;
    } catch (e){
      // Se llenó el almacenamiento del navegador. No es un detalle: si esto
      // pasa, lo que escribió NO se guardó y hay que decírselo.
      return false;
    }
  }

  function borrar(id){
    try { localStorage.removeItem(claveDe(id)); return true; }
    catch (e){ return false; }
  }

  function hay(id){ return leer(id) !== null; }

  function listar(){
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k || k.indexOf(PREFIJO) !== 0) continue;
        const id = k.slice(PREFIJO.length);
        const c = leer(id);
        if (c) out.push({ id: id, titulo: c.titulo || '(sin título)', cuando: cuando(id) });
      }
    } catch (e){}
    return out.sort((a, b) => String(b.cuando).localeCompare(String(a.cuando)));
  }

  // ─── Exportar: el archivo que va al repo ──────────────────────────
  function comoArchivo(clase){
    const fecha = new Date().toISOString().slice(0, 10);
    return `// ════════════════════════════════════════════════════════════════════\n` +
      `// Nivel ${clase.nivel} · Parte ${clase.parte} · Unidad ${clase.unidad} — ${clase.titulo}\n` +
      `//\n// Exportado desde el editor del curso el ${fecha}.\n` +
      `// Marcas de texto: **negrita**  //inglés//  {{resaltado}}  [[respuesta]]\n` +
      `// El contrato está en curso/ESQUEMA.md.\n` +
      `// ════════════════════════════════════════════════════════════════════\n\n` +
      `CLASES['${clase.id}'] = ${JSON.stringify(clase, null, 2)};\n`;
  }

  function descargar(clase){
    const blob = new Blob([comoArchivo(clase)], { type: 'text/javascript;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = clase.id + '.js';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  // ─── Importar ─────────────────────────────────────────────────────
  // Acepta el archivo que exporta el editor (JSON) y también los escritos
  // a mano, que usan comillas simples y comentarios. Para esos segundos hay
  // que ejecutar el texto: es un archivo propio, abierto a mano por quien
  // edita, en su propia máquina — no viene de la red.
  function desdeTexto(texto){
    const corte = texto.indexOf('=');
    const cuerpo = texto.slice(corte + 1).trim().replace(/;\s*$/, '');
    try { return JSON.parse(cuerpo); }
    catch (e){
      try {
        const bolsa = {};
        new Function('CLASES', texto)(bolsa);
        const claves = Object.keys(bolsa);
        if (claves.length) return bolsa[claves[0]];
      } catch (e2){}
      throw new Error('No se pudo leer el archivo. Tiene que ser un ' +
        'curso/data/<id>.js con CLASES[\'<id>\'] = { … }');
    }
  }

  // ─── ¿Quién cambió desde la última vez que estuvieron iguales? ─────
  // Devuelve qué hay que hacer, sin decidir nada por su cuenta:
  //   'nada'        los dos están igual
  //   'subir'       cambió solo lo de acá
  //   'actualizar'  cambió solo lo de la nube → se puede traer sin preguntar
  //   'conflicto'   cambiaron LOS DOS → hay que preguntar
  function comparar(id, fichaNube){
    const sinc  = sincronizado(id);
    const local = cuando(id);
    const nube  = fichaNube ? fichaNube.actualizado : null;

    const cambioAca  = !!local && (!sinc || new Date(local) > new Date(sinc));
    const cambioNube = !!nube  && (!sinc || new Date(nube)  > new Date(sinc));

    if (cambioAca && cambioNube) return 'conflicto';
    if (cambioNube) return 'actualizar';
    if (cambioAca)  return 'subir';
    return 'nada';
  }

  raiz.BORRADORES = {
    leer, guardar, borrar, hay, listar, cuando,
    sincronizado, marcarSincronizado, comparar,
    comoArchivo, descargar, desdeTexto,
  };

})(typeof window !== 'undefined' ? window : globalThis);

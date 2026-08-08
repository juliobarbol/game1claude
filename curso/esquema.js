// ════════════════════════════════════════════════════════════════════
// EL ESQUEMA DE UNA CLASE, DECLARADO
//
// Este archivo describe qué campos tiene una clase. De acá salen TRES
// cosas, y por eso vive en un solo lugar:
//   · el formulario del editor (curso/editor.html) se construye solo
//   · la validación que ve la profesora mientras escribe
//   · el test (test/curso.test.cjs) usa la misma validación
//
// Si se agrega un campo, se agrega ACÁ y aparece en los tres lados.
// Lo único que hay que tocar aparte es curso/render.js, que decide cómo
// se ve.
//
// Tipos de campo:
//   texto     una línea
//   parrafo   varias líneas
//   lista     varios textos sueltos           → ['a', 'b']
//   filas     varios objetos con subcampos    → [{quien, linea}]
//   matriz    una grilla de textos            → [['a','b'], ['c','d']]
//   numero    un número
// ════════════════════════════════════════════════════════════════════

(function (raiz) {

  const M = true;   // el campo admite marcas de texto (**, //, {{}}, [[]])

  // ─── Cabecera de la clase ─────────────────────────────────────────
  const CABECERA = [
    { clave:'codigo',  tipo:'texto',  etiqueta:'Código visible', ayuda:'Lo que ve el alumno: Unit 1.4' },
    { clave:'titulo',  tipo:'texto',  etiqueta:'Título',   ayuda:'En inglés. Tiene que coincidir con el índice.' },
    { clave:'promesa', tipo:'texto',  etiqueta:'Promesa',  ayuda:'Qué va a poder hacer al terminar la clase. En castellano.' },
    { clave:'ficha',   tipo:'filas',  etiqueta:'Tira de datos', ayuda:'La fila de arriba de todo.',
      campos:[
        { clave:'k', tipo:'texto', etiqueta:'Dato', ancho:'chico' },
        { clave:'v', tipo:'texto', etiqueta:'Valor' },
      ]},
  ];

  // ─── Para la profesora ────────────────────────────────────────────
  const PROFE = [
    { clave:'plan', tipo:'filas', etiqueta:'Plan de la clase',
      ayuda:'Cómo se reparten los minutos. Los tramos van en orden.',
      campos:[
        { clave:'min', tipo:'texto',   etiqueta:'Minuto', ancho:'chico' },
        { clave:'que', tipo:'parrafo', etiqueta:'Qué pasa', marcas:M },
      ]},
    { clave:'ojo', tipo:'lista', etiqueta:'Ojo con',
      ayuda:'Qué anticipar: el error que va a aparecer sí o sí, qué hacer cuando algo se traba, qué recortar si el tiempo aprieta.',
      marcas:M },
  ];

  // ─── Las 6 cajas del Grammar Book ─────────────────────────────────
  const GRAMMAR = [
    { clave:'inContext', etiqueta:'In context', color:'slate',
      ayuda:'El diálogo. La estructura nueva va entre {{ }} para que salga resaltada.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'dialogo', tipo:'filas', etiqueta:'Diálogo', campos:[
          { clave:'quien', tipo:'texto', etiqueta:'Quién', ancho:'chico' },
          { clave:'linea', tipo:'texto', etiqueta:'Lo que dice', marcas:M },
        ]},
        { clave:'nota', tipo:'parrafo', etiqueta:'Nota al pie', opcional:true, marcas:M },
      ]},

    { clave:'theRule', etiqueta:'The rule', color:'grammar',
      ayuda:'El cuadro de la forma. Sin prosa: la explicación va en la nota.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'cabecera', tipo:'lista', etiqueta:'Encabezados de columna', ayuda:'Tres.' },
        { clave:'filas', tipo:'filas', etiqueta:'Filas', campos:[
          { clave:'etiqueta', tipo:'texto', etiqueta:'Caso', ancho:'chico' },
          { clave:'larga', tipo:'texto', etiqueta:'Columna 2', marcas:M },
          { clave:'corta', tipo:'texto', etiqueta:'Columna 3', marcas:M },
        ]},
        { clave:'nota', tipo:'parrafo', etiqueta:'Nota', opcional:true, marcas:M },
      ]},

    { clave:'watchOut', etiqueta:'Watch out', color:'alert',
      ayuda:'El error típico del hispanohablante, con el ✗ y el ✓ enfrentados.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'items', tipo:'filas', etiqueta:'Errores', campos:[
          { clave:'mal',    tipo:'texto',   etiqueta:'✗ Mal', marcas:M },
          { clave:'bien',   tipo:'texto',   etiqueta:'✓ Bien', marcas:M },
          { clave:'porque', tipo:'parrafo', etiqueta:'Por qué', marcas:M },
        ]},
      ]},

    { clave:'practice', etiqueta:'Practice', color:'grammar',
      ayuda:'Siempre en este orden: completar → transformar → personalizar. La respuesta de un hueco va entre [[ ]].',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'pasos', tipo:'filas', etiqueta:'Pasos', campos:[
          { clave:'tipo',   tipo:'texto',  etiqueta:'Tipo', ancho:'chico',
            opciones:['huecos','renglones'] },
          { clave:'titulo', tipo:'texto',  etiqueta:'Título del paso' },
          { clave:'items',  tipo:'lista',  etiqueta:'Consignas (solo tipo huecos)', opcional:true, marcas:M },
          { clave:'renglones', tipo:'numero', etiqueta:'Renglones (solo tipo renglones)', opcional:true },
          { clave:'nota',   tipo:'parrafo', etiqueta:'Nota', opcional:true, marcas:M },
        ]},
      ]},

    { clave:'speaking', etiqueta:'Now you speak', color:'speak',
      ayuda:'La tarea comunicativa. Es la misma que la del Vocabulary Book.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'situacion', tipo:'parrafo', etiqueta:'La situación', marcas:M,
          ayuda:'Con quién, dónde y para qué. Concreto.' },
        { clave:'guion', tipo:'filas', etiqueta:'Guion', campos:[
          { clave:'quien', tipo:'texto', etiqueta:'Quién', ancho:'chico' },
          { clave:'linea', tipo:'texto', etiqueta:'Lo que dice', marcas:M },
        ]},
        { clave:'rondas', tipo:'filas', etiqueta:'Rondas', campos:[
          { clave:'n',     tipo:'texto',   etiqueta:'Ronda', ancho:'chico' },
          { clave:'texto', tipo:'parrafo', etiqueta:'Qué cambia', marcas:M },
        ]},
        { clave:'espejo', tipo:'texto', etiqueta:'Enlace al otro libro', opcional:true },
      ]},

    { clave:'iCan', etiqueta:'I can…', color:'slate',
      ayuda:'Autoevaluación en primera persona. Lo que puede HACER, no lo que sabe.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'items', tipo:'lista', etiqueta:'Puedo…', marcas:M },
      ]},
  ];

  // ─── Las 6 cajas del Vocabulary Book ──────────────────────────────
  const VOCABULARY = [
    { clave:'wordBank', etiqueta:'Word bank', color:'vocab',
      ayuda:'El léxico agrupado. Las tablas son para lo que no es par palabra–traducción.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'grupos', tipo:'filas', etiqueta:'Grupos', campos:[
          { clave:'titulo', tipo:'texto', etiqueta:'Título del grupo' },
          { clave:'items', tipo:'filas', etiqueta:'Palabras', campos:[
            { clave:'en', tipo:'texto', etiqueta:'Inglés', marcas:M },
            { clave:'es', tipo:'texto', etiqueta:'Castellano' },
          ]},
        ]},
        { clave:'tablas', tipo:'filas', etiqueta:'Tablas', opcional:true,
          ayuda:'País / nacionalidad / idioma, números que se confunden, etc.',
          campos:[
            { clave:'titulo',   tipo:'texto',  etiqueta:'Título' },
            { clave:'cabecera', tipo:'lista',  etiqueta:'Columnas' },
            { clave:'filas',    tipo:'matriz', etiqueta:'Filas', marcas:M },
          ]},
      ]},

    { clave:'chunks', etiqueta:'Chunks', color:'vocab',
      ayuda:'Frases hechas enteras, no palabras sueltas. Es lo que hace que suene natural.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'items', tipo:'filas', etiqueta:'Chunks', campos:[
          { clave:'c', tipo:'texto', etiqueta:'El chunk', marcas:M },
          { clave:'m', tipo:'texto', etiqueta:'Para qué sirve', marcas:M },
        ]},
        { clave:'nota', tipo:'parrafo', etiqueta:'Nota', opcional:true, marcas:M },
      ]},

    { clave:'sayItRight', etiqueta:'Say it right', color:'vocab',
      ayuda:'Pronunciación. La sílaba fuerte se marca con **asteriscos**.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'items', tipo:'filas', etiqueta:'Puntos', campos:[
          { clave:'etiqueta', tipo:'texto',   etiqueta:'Etiqueta', ancho:'chico' },
          { clave:'texto',    tipo:'parrafo', etiqueta:'Explicación', marcas:M },
        ]},
      ]},

    { clave:'useIt', etiqueta:'Use it', color:'vocab',
      ayuda:'Ejercicios de recuperación: decir de memoria. Nada de unir con flechas.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'pasos', tipo:'filas', etiqueta:'Pasos', campos:[
          { clave:'titulo', tipo:'texto',   etiqueta:'Título' },
          { clave:'texto',  tipo:'parrafo', etiqueta:'Consigna', marcas:M },
        ]},
      ]},

    { clave:'cards', etiqueta:'Speaking cards', color:'speak',
      ayuda:'Las tarjetas de roleplay. Son el puente con el Grammar Book.',
      campos:[
        { clave:'subtitulo', tipo:'texto', etiqueta:'Subtítulo', opcional:true },
        { clave:'items', tipo:'filas', etiqueta:'Tarjetas', campos:[
          { clave:'titulo', tipo:'texto',   etiqueta:'Título' },
          { clave:'texto',  tipo:'parrafo', etiqueta:'La consigna', marcas:M },
          { clave:'frases', tipo:'texto',   etiqueta:'Frases a mano', opcional:true, marcas:M },
        ]},
      ]},

    { clave:'myWords', etiqueta:'My words', color:'slate',
      ayuda:'El glosario personal: renglones en blanco.',
      campos:[
        { clave:'subtitulo', tipo:'texto',  etiqueta:'Subtítulo', opcional:true },
        { clave:'renglones', tipo:'numero', etiqueta:'Cuántos renglones' },
      ]},
  ];

  const ESQUEMA = { CABECERA, PROFE, GRAMMAR, VOCABULARY };

  // ─── Molde de clase vacía ─────────────────────────────────────────
  function vacio(campo){
    switch (campo.tipo){
      case 'lista':  return [];
      case 'filas':  return [];
      case 'matriz': return [];
      case 'numero': return campo.clave === 'renglones' ? 8 : 0;
      default:       return '';
    }
  }

  function molde(id, datos){
    datos = datos || {};
    const c = Object.assign({
      id: id, nivel: 1, parte: 1, unidad: 1, clase: 1,
      codigo: '', titulo: '', promesa: '', ficha: [],
      profe: { plan: [], ojo: [] },
      grammar: {}, vocabulary: { carga: '' },
    }, datos);

    for (const caja of GRAMMAR){
      c.grammar[caja.clave] = c.grammar[caja.clave] || {};
      for (const campo of caja.campos)
        if (c.grammar[caja.clave][campo.clave] === undefined)
          c.grammar[caja.clave][campo.clave] = vacio(campo);
    }
    for (const caja of VOCABULARY){
      c.vocabulary[caja.clave] = c.vocabulary[caja.clave] || {};
      for (const campo of caja.campos)
        if (c.vocabulary[caja.clave][campo.clave] === undefined)
          c.vocabulary[caja.clave][campo.clave] = vacio(campo);
    }
    return c;
  }

  // ─── Validación ───────────────────────────────────────────────────
  // Devuelve una lista de { nivel, donde, texto }.
  //   nivel 'error' → la clase no se puede publicar
  //   nivel 'aviso' → se puede, pero conviene mirarlo
  function textos(v, out){
    out = out || [];
    if (typeof v === 'string') out.push(v);
    else if (v && typeof v === 'object') for (const k of Object.keys(v)) textos(v[k], out);
    return out;
  }

  function vacia(v){
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object'){
      // una caja está vacía si TODOS sus campos con contenido lo están
      const claves = Object.keys(v).filter(k => k !== 'subtitulo');
      return claves.length === 0 || claves.every(k => vacia(v[k]));
    }
    return false;
  }

  function validar(c){
    const p = [];
    const err = (donde, texto) => p.push({ nivel:'error', donde, texto });
    const avi = (donde, texto) => p.push({ nivel:'aviso', donde, texto });

    if (!c || typeof c !== 'object'){ err('clase', 'No hay datos de clase.'); return p; }

    // cabecera
    for (const campo of CABECERA){
      if (vacia(c[campo.clave]))
        err('Cabecera', `Falta ${campo.etiqueta.toLowerCase()}.`);
    }
    if (!c.id) err('Cabecera', 'Falta el id.');
    if (!c.clase) err('Cabecera', 'Falta el número de clase.');

    // las 12 cajas
    for (const [libro, cajas, nombre] of [['grammar', GRAMMAR, 'Grammar'],
                                          ['vocabulary', VOCABULARY, 'Vocabulary']]){
      for (const caja of cajas){
        const d = (c[libro] || {})[caja.clave];
        if (vacia(d)){ err(`${nombre} · ${caja.etiqueta}`, 'La caja está vacía.'); continue; }
        for (const campo of caja.campos){
          if (campo.opcional) continue;
          if (vacia(d[campo.clave]))
            err(`${nombre} · ${caja.etiqueta}`, `Falta ${campo.etiqueta.toLowerCase()}.`);
        }
      }
    }

    // reglas del curso, no del formato
    const sp = (c.grammar || {}).speaking || {};
    if (vacia(sp.situacion) || vacia(sp.guion) || vacia(sp.rondas))
      err('Grammar · Now you speak',
        'Toda unidad termina hablando: hacen falta situación, guion y rondas.');

    const pasos = ((c.grammar || {}).practice || {}).pasos || [];
    if (pasos.length && pasos[pasos.length - 1].tipo !== 'renglones')
      err('Grammar · Practice',
        'La práctica va completar → transformar → personalizar: el último paso tiene que ser de renglones.');
    for (const paso of pasos){
      if (paso.tipo === 'huecos' && vacia(paso.items))
        err('Grammar · Practice', `El paso “${paso.titulo || '?'}” no tiene consignas.`);
      if (paso.tipo === 'huecos' && !(paso.items || []).some(t => /\[\[/.test(t)))
        avi('Grammar · Practice', `El paso “${paso.titulo || '?'}” no tiene ninguna respuesta entre [[ ]].`);
    }

    // marcas de texto cerradas
    const txt = textos(c).join('\n');
    for (const [a, b, nombre] of [['{{','}}','{{ }}'], ['[[',']]','[[ ]]']]){
      const na = txt.split(a).length - 1, nb = txt.split(b).length - 1;
      if (na !== nb) err('Marcas de texto', `Las marcas ${nombre} no cierran: ${na} abren y ${nb} cierran.`);
    }
    if ((txt.match(/\*\*/g) || []).length % 2)
      err('Marcas de texto', 'Hay un **negrita** sin cerrar.');
    if ((txt.match(/\/\//g) || []).length % 2)
      err('Marcas de texto', 'Hay un //inglés// sin cerrar.');

    // avisos de calidad
    if (!vacia(c.grammar?.inContext?.dialogo) &&
        !textos(c.grammar.inContext.dialogo).some(t => /\{\{/.test(t)))
      avi('Grammar · In context', 'El diálogo no resalta ninguna estructura con {{ }}.');
    if (vacia(c.profe))
      avi('Para la profesora', 'Sin plan de clase, la clase no se puede dar sin volver a prepararla.');

    return p;
  }

  raiz.ESQUEMA = ESQUEMA;
  raiz.ESQUEMA.molde = molde;
  raiz.ESQUEMA.validar = validar;
  raiz.ESQUEMA.vacia = vacia;

  if (typeof module !== 'undefined' && module.exports)
    module.exports = { ESQUEMA: raiz.ESQUEMA };

})(typeof window !== 'undefined' ? window : globalThis);

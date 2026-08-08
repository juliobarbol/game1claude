// ════════════════════════════════════════════════════════════════════
// ÍNDICE DEL CURSO — la estructura, no el contenido.
//
// Quién está acá manda: la portada y el navegador de clases se dibujan
// desde este archivo. Agregar una clase = agregar una entrada acá + su
// archivo en curso/data/<id>.js.
//
// estado: 'listo'      → la clase existe y se puede entrar
//         'pendiente'  → está en el temario pero todavía no armada
// ════════════════════════════════════════════════════════════════════

const CURSO = {
  niveles: [{
    nivel: 1,
    nombre: 'Foundations',
    cefr: 'A1',
    partes: [{
      parte: 1,
      nombre: 'First Contact',
      clases: 12,
      promesa: [
        'Presentarte, deletrear tu nombre y pedir que te repitan algo.',
        'Decir de dónde sos, a qué te dedicás y dar tus datos.',
        'Hablar de tu familia y de tus cosas.',
        'Describir tu ciudad y tu casa, y decir qué hay cerca.',
        'Decir qué sabés hacer y pedir ayuda.',
        'Decir la hora y la fecha, y coordinar un encuentro.',
      ],
      unidades: [
        { clase: 1,  id: 'n1p1u01', codigo: 'Unit 1.1',  titulo: "Hi, I'm…",
          resumen: 'El verbo BE · saludos y alfabeto · presentarte el primer día', estado: 'listo' },
        { clase: 2,  id: 'n1p1u02', codigo: 'Unit 1.2',  titulo: 'Where are you from?',
          resumen: 'BE en preguntas · países y nacionalidades · conocer gente en un viaje', estado: 'listo' },
        { clase: 3,  id: 'n1p1u03', codigo: 'Unit 1.3',  titulo: 'What do you do?',
          resumen: 'a / an y wh-questions · profesiones y números · networking', estado: 'listo' },
        { clase: 4,  id: 'n1p1u04', codigo: 'Unit 1.4',  titulo: 'This is my family',
          resumen: "Posesivos y genitivo 's · familia · mostrar fotos", estado: 'pendiente' },
        { clase: 5,  id: 'n1p1u05', codigo: 'Unit 1.5',  titulo: "What's this?",
          resumen: 'this / that / these / those · objetos y colores · objetos perdidos', estado: 'pendiente' },
        { clase: 6,  id: 'n1p1c01', tipo: 'checkpoint',  titulo: 'Checkpoint A — Your first conversation',
          resumen: 'Repaso hablando · Speaking Lab de 35 min · devolución', estado: 'pendiente' },
        { clase: 7,  id: 'n1p1u06', codigo: 'Unit 1.6',  titulo: "It's a great city",
          resumen: 'Adjetivos con BE · describir lugares y clima · tu ciudad', estado: 'pendiente' },
        { clase: 8,  id: 'n1p1u07', codigo: 'Unit 1.7',  titulo: "There's a café near here",
          resumen: 'there is / are · lugares de la ciudad · un turista te pregunta', estado: 'pendiente' },
        { clase: 9,  id: 'n1p1u08', codigo: 'Unit 1.8',  titulo: 'Where exactly?',
          resumen: 'Preposiciones de lugar · la casa y los muebles · videollamada', estado: 'pendiente' },
        { clase: 10, id: 'n1p1u09', codigo: 'Unit 1.9',  titulo: "I can, I can't",
          resumen: "can / can't · habilidades · armar un equipo", estado: 'pendiente' },
        { clase: 11, id: 'n1p1u10', codigo: 'Unit 1.10', titulo: "When's your birthday?",
          resumen: 'in / on / at · días, meses y la hora · coordinar un encuentro', estado: 'pendiente' },
        { clase: 12, id: 'n1p1c02', tipo: 'checkpoint',  titulo: 'Checkpoint B — My World',
          resumen: 'Proyecto oral de 3 min · roleplay evaluado · Can-do Passport', estado: 'pendiente' },
      ],
    }],
  }],
};

// Todas las unidades de todas las partes, en orden. Sirve para el
// anterior/siguiente del navegador de clases.
CURSO.todas = function (){
  const out = [];
  for (const n of CURSO.niveles)
    for (const p of n.partes)
      for (const u of p.unidades)
        out.push(Object.assign({ nivel:n.nivel, parte:p.parte }, u));
  return out;
};

CURSO.buscar = function (id){
  return CURSO.todas().find(u => u.id === id) || null;
};

if (typeof module !== 'undefined' && module.exports) module.exports = { CURSO };

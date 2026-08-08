// ════════════════════════════════════════════════════════════════════
// Nivel 1 · Parte 1 · Unidad 2 — "Where are you from?"
//
// Marcas de texto: **negrita**  //inglés//  {{resaltado}}  [[respuesta]]
// El contrato está en curso/ESQUEMA.md.
// ════════════════════════════════════════════════════════════════════

CLASES['n1p1u02'] = {
  id: 'n1p1u02',
  nivel: 1, parte: 1, unidad: 2, clase: 2,
  codigo: 'Unit 1.2',
  titulo: 'Where are you from?',
  promesa: 'Decir de dónde sos y preguntarle a otra persona de dónde es.',
  ficha: [
    { k: 'Duración',        v: '60 minutos' },
    { k: 'Gramática',       v: 'BE · he/she/it + preguntas' },
    { k: 'Palabras nuevas', v: '28 + 8 chunks' },
    { k: 'Hablás en',       v: 'minuto 10' },
  ],

  profe: {
    plan: [
      { min: '0–5',   que: 'Repaso relámpago de la 1.1: que se presente y deletree su apellido sin ayuda. Si todavía se come el sujeto, se marca **acá** y no se vuelve a marcar en toda la clase.' },
      { min: '5–12',  que: '**In context**. El diálogo dos veces. Antes de explicar nada, preguntar quién es de dónde — que lo saque del texto.' },
      { min: '12–22', que: '**The rule**: primero //he/she/it//, después la pregunta. El orden importa: la pregunta se arma dando vuelta lo que ya sabe, no aprendiendo algo nuevo.' },
      { min: '22–30', que: '**Watch out** + **Practice** A. Los tres errores se muestran juntos: son los tres de esta unidad y van a aparecer los tres.' },
      { min: '30–38', que: 'Word bank de países. La tabla se lee **en voz alta**: lo que se aprende acá es dónde cae el acento, no la ortografía.' },
      { min: '38–50', que: '**Now you speak**, las tres rondas. La 2 es la que importa: hablar de una tercera persona.' },
      { min: '50–57', que: 'Practice C y preguntas cruzadas reales, ya sin tarjeta.' },
      { min: '57–60', que: 'Cerrar con **I can…** y la tarea: cinco países con su nacionalidad, escritos.' },
    ],
    ojo: [
      'La pregunta se arma **dando vuelta el orden**, no agregando una palabra. Si dice //You are from Chile?// con entonación de pregunta, se entiende igual — pero insistí con el orden, porque es lo que después sostiene todas las preguntas del curso.',
      'Las nacionalidades y los idiomas llevan **mayúscula** en inglés, siempre, aunque estén en el medio de la frase. Es el error escrito más frecuente y no se corrige solo.',
      'El acento se corre entre el país y la nacionalidad: //**JA**pan// pero //japa**NESE**//. Marcalo cuando aparece; no des una regla, no la hay del todo.',
      'La respuesta corta es //Yes, I am//, **nunca** //Yes, I\'m//. Es contraintuitivo y hay que decirlo explícito una vez, con el porqué: la forma corta no puede quedar al final.',
      'Si no le sale una nacionalidad, que use //I\'m from…//, que ya lo tiene. No frenar una conversación por una palabra suelta.',
    ],
  },

  // ══════════════ GRAMMAR BOOK ══════════════
  grammar: {

    inContext: {
      subtitulo: 'el desayuno de un hostel',
      dialogo: [
        { quien: 'Ana',   linea: 'Hi! {{Are you}} Marco?' },
        { quien: 'Marco', linea: '{{Yes, I am.}} Are you from Spain?' },
        { quien: 'Ana',   linea: '{{No, I\'m not.}} I\'m from Argentina.' },
        { quien: 'Marco', linea: 'Oh! {{Is}} Lucía from Argentina too?' },
        { quien: 'Ana',   linea: 'No, {{she isn\'t}}. She\'s Chilean.' },
        { quien: 'Marco', linea: 'And your English teacher — {{is he}} American?' },
        { quien: 'Ana',   linea: 'No, he\'s British.' },
      ],
      nota: 'Fijate en dos cosas. En la pregunta el verbo va **primero**. Y la respuesta corta es //Yes, I am//, no //Yes, I\'m//.',
    },

    theRule: {
      subtitulo: 'preguntar es dar vuelta el orden',
      cabecera: ['', 'Afirmativo y negativo', 'Pregunta y respuesta corta'],
      filas: [
        { etiqueta: 'yo',
          larga: 'I\'m from Chile. / I\'m not from Chile.',
          corta: 'Are you from Chile? — Yes, I am. / No, I\'m not.' },
        { etiqueta: 'él / ella',
          larga: 'She\'s Italian. / She isn\'t Italian.',
          corta: 'Is she Italian? — Yes, she is. / No, she isn\'t.' },
        { etiqueta: 'ellos',
          larga: 'They\'re Brazilian. / They aren\'t Brazilian.',
          corta: 'Are they Brazilian? — Yes, they are. / No, they aren\'t.' },
      ],
      nota: '**Para preguntar, das vuelta el orden**: //You are// → //Are you//. No se agrega ninguna palabra. Y en la respuesta corta **nunca** va la forma corta: //Yes, I am//, no //Yes, I\'m//.',
    },

    watchOut: {
      subtitulo: 'los tres de esta unidad',
      items: [
        { mal: 'I\'m from the Argentina.',
          bien: 'I\'m from Argentina.',
          porque: 'Los países no llevan artículo. Las excepciones son un puñado y se aprenden de memoria: //the United States//, //the United Kingdom//.' },
        { mal: 'I\'m argentinian. I speak spanish.',
          bien: 'I\'m Argentinian. I speak Spanish.',
          porque: 'Nacionalidades e idiomas van con **mayúscula** siempre, aunque estén en el medio de la frase.' },
        { mal: 'Yes, I\'m. / No, she isn\'t not.',
          bien: 'Yes, I am. / No, she isn\'t.',
          porque: 'La forma corta no puede quedar al final de la frase. En el sí va entera; en el no, la contracción es la del negativo.' },
      ],
    },

    practice: {
      subtitulo: 'completar → transformar → personalizar',
      pasos: [
        { tipo: 'huecos', titulo: 'A · Completar — con la forma de BE que corresponde', items: [
          '[[Is]] she from Peru?',
          'Marco and Ana [[are]] Italian.',
          '— Are you Brazilian? — No, [[I\'m not]]. I\'m Portuguese.',
          'My teacher [[isn\'t]] American. He\'s Canadian.',
          '[[Are]] they from Japan?',
          '— Is Ana Chilean? — Yes, she [[is]].',
        ]},
        { tipo: 'huecos', titulo: 'B · Transformar — pasalo a pregunta', items: [
          'She\'s from Mexico. → [[Is she from Mexico?]]',
          'They\'re Italian. → [[Are they Italian?]]',
          'You\'re a student. → [[Are you a student?]]',
          'He\'s your teacher. → [[Is he your teacher?]]',
        ]},
        { tipo: 'renglones', titulo: 'C · Personalizar — tres preguntas para alguien que acabás de conocer',
          renglones: 3,
          nota: 'Arrancá con //Are you…?// o con //Is…?//. Tienen que ser preguntas que realmente harías.' },
      ],
    },

    speaking: {
      subtitulo: 'conocer gente en un viaje',
      situacion: '**La situación:** el desayuno de un hostel. Hay cuatro personas de países distintos y nadie se conoce. Tenés que averiguar de dónde es cada uno — y no podés preguntar dos veces lo mismo.',
      guion: [
        { quien: 'A', linea: 'Hi! Are you ___________ ?' },
        { quien: 'B', linea: 'Yes, I am. / No, I\'m not. I\'m ___________ .' },
        { quien: 'A', linea: 'Where are you from?' },
        { quien: 'B', linea: 'I\'m from ___________ . And you?' },
        { quien: 'A', linea: 'I\'m from ___________ . Is your friend from ___________ too?' },
        { quien: 'B', linea: 'No, she isn\'t. She\'s ___________ .' },
      ],
      rondas: [
        { n: 'Ronda 1', texto: 'Con el guion. Cada uno saca una identidad falsa: país y ciudad.' },
        { n: 'Ronda 2', texto: 'Sin guion, y ahora preguntás por una **tercera** persona: //Is she…?//' },
        { n: 'Ronda 3', texto: 'Uno miente en su nacionalidad. Los demás descubren quién, solo preguntando.' },
      ],
      espejo: '↔ Esta misma tarea está en el Vocabulary Book, con los países y las nacionalidades a mano.',
    },

    iCan: {
      subtitulo: 'marcá lo que ya podés hacer',
      items: [
        'Puedo decir de qué país y de qué ciudad soy.',
        'Puedo preguntarle a alguien de dónde es y entender la respuesta.',
        'Puedo hablar de una tercera persona con //he// y //she//.',
        'Puedo contestar //Yes, I am// y //No, I\'m not// sin pensarlo.',
      ],
    },
  },

  // ══════════════ VOCABULARY BOOK ══════════════
  vocabulary: {
    carga: '28 palabras · 8 chunks',

    wordBank: {
      subtitulo: 'la tabla se lee en voz alta: lo que importa es dónde cae el acento',
      grupos: [
        { titulo: 'De dónde sos', items: [
          { en: 'a country',  es: 'un país' },
          { en: 'a city',     es: 'una ciudad' },
          { en: 'a town',     es: 'un pueblo' },
          { en: 'the capital', es: 'la capital' },
          { en: 'my hometown', es: 'mi ciudad natal' },
        ]},
        { titulo: 'Idiomas', items: [
          { en: 'a language',       es: 'un idioma' },
          { en: 'a little English', es: 'un poco de inglés' },
          { en: 'both',             es: 'los dos' },
          { en: 'only',             es: 'solo' },
          { en: 'too',              es: 'también (al final)' },
        ]},
        { titulo: 'Para seguir la charla', items: [
          { en: 'And you?',   es: 'devolver la pregunta' },
          { en: 'Me too!',    es: 'cuando coincidís' },
          { en: 'Really?',    es: 'interés — y tiempo para pensar' },
          { en: 'Sorry, where?', es: 'pedir solo el dato que perdiste' },
          { en: 'Nice!',      es: 'reaccionar sin decir nada difícil' },
        ]},
      ],
      tablas: [
        { titulo: 'Países y nacionalidades — la nacionalidad va SIEMPRE con mayúscula',
          cabecera: ['País', 'Nacionalidad', 'Idioma'],
          filas: [
            ['Argentina',          'Argentinian', 'Spanish'],
            ['Brazil',             'Brazilian',   'Portuguese'],
            ['Chile',              'Chilean',     'Spanish'],
            ['Italy',              'Italian',     'Italian'],
            ['Spain',              'Spanish',     'Spanish'],
            ['France',             'French',      'French'],
            ['Germany',            'German',      'German'],
            ['Japan',              'Japanese',    'Japanese'],
            ['China',              'Chinese',     'Chinese'],
            ['the United States',  'American',    'English'],
            ['the United Kingdom', 'British',     'English'],
          ],
        },
      ],
    },

    chunks: {
      subtitulo: 'bloques enteros, no palabras sueltas',
      items: [
        { c: 'Where are you from?',   m: 'la pregunta de la unidad' },
        { c: 'I\'m from…',            m: 'la respuesta — sin artículo delante del país' },
        { c: 'Are you…?',             m: 'la pregunta cerrada: verbo primero' },
        { c: 'Yes, I am. / No, I\'m not.', m: 'nunca //Yes, I\'m//' },
        { c: 'And you?',              m: 'devolver la pregunta sin repetirla' },
        { c: 'Me too!',               m: 'cuando coincidís — sirve para todo' },
        { c: 'Really?',               m: 'muestra interés y te da un segundo para pensar' },
        { c: 'Sorry, where?',         m: 'pedir que repitan **solo** el dato que perdiste' },
      ],
      nota: 'Los dos últimos son los que hacen que una charla no se corte. Valen más que diez países.',
    },

    sayItRight: {
      subtitulo: 'la sílaba fuerte va en negrita',
      items: [
        { etiqueta: 'Se corre',  texto: '**JA**pan → japa**NESE** · **CHI**na → chi**NESE** · **AR**gentina → argen**TIN**ian' },
        { etiqueta: 'Regla útil', texto: 'Los que terminan en **-ese** y en **-ian** llevan el acento cerca del final. El país, casi nunca.' },
        { etiqueta: 'Ojo',       texto: '//Spain// y //Spanish// no empiezan igual: **/speɪn/** contra **/ˈspænɪʃ/**. La vocal cambia.' },
        { etiqueta: 'Entonación', texto: 'La pregunta **sube** al final: //Are you Brazilian?// ↗. Si baja, suena a afirmación y el otro no contesta.' },
      ],
    },

    useIt: {
      subtitulo: 'de memoria, no reconociendo',
      pasos: [
        { titulo: '1 · País → nacionalidad → idioma',
          texto: 'Tapá la tabla. En voz alta y seguido: //Brazil · Japan · Germany · France · China · Spain//. Los tres datos de cada uno.' },
        { titulo: '2 · Al revés',
          texto: 'Alguien te dice la nacionalidad y vos decís el país: //Chinese · German · Italian · British · American//.' },
        { titulo: '3 · 60 segundos',
          texto: 'Diez países en inglés sin parar. Si te trabás con uno, seguís con otro — lo importante es no frenar.' },
      ],
    },

    cards: {
      subtitulo: 'la misma tarea que en Grammar, con las palabras',
      items: [
        { titulo: 'Card 1 · El desayuno del hostel',
          texto: 'Cuatro identidades falsas, cada una con país y ciudad. Averiguá de dónde es cada uno sin repetir una pregunta.',
          frases: 'Are you…? / Where are you from? / And you? / Me too!' },
        { titulo: 'Card 2 · El impostor',
          texto: 'Uno de ustedes miente en su nacionalidad. Los demás tienen que descubrir quién, solo preguntando.',
          frases: 'Is she…? / Are you from…? / No, she isn\'t. / I think he\'s…' },
        { titulo: 'Card 3 · La tercera persona',
          texto: 'Hablá de alguien que no está: un amigo, tu jefe, un famoso. Los demás adivinan de dónde es.',
          frases: 'He\'s from… / She isn\'t… / Is he Italian?' },
      ],
    },

    myWords: { subtitulo: 'lo que salió en clase', renglones: 8 },
  },
};

// ════════════════════════════════════════════════════════════════════
// Nivel 1 · Parte 1 · Unidad 3 — "What do you do?"
//
// OJO: //What do you do?// y //I work at…// se dan como BLOQUES ENTEROS.
// Son present simple, que recién entra en la Parte 2. Está a propósito:
// sin esas dos frases no hay conversación de trabajo posible, y desarmarlas
// ahora obligaría a dar la -s de tercera persona en la clase 3.
// ════════════════════════════════════════════════════════════════════

CLASES['n1p1u03'] = {
  id: 'n1p1u03',
  nivel: 1, parte: 1, unidad: 3, clase: 3,
  codigo: 'Unit 1.3',
  titulo: 'What do you do?',
  promesa: 'Decir a qué te dedicás, dar tus datos y pedirle los datos a otra persona.',
  ficha: [
    { k: 'Duración',        v: '60 minutos' },
    { k: 'Gramática',       v: 'a / an · wh- con BE' },
    { k: 'Palabras nuevas', v: '30 + 8 chunks' },
    { k: 'Hablás en',       v: 'minuto 10' },
  ],

  profe: {
    plan: [
      { min: '0–5',   que: 'Repaso sin libro: tres preguntas con //Are you…?// entre ustedes. Treinta segundos cada una.' },
      { min: '5–12',  que: '**In context**. El diálogo del evento. Preguntar qué datos se intercambiaron los dos, no qué dijeron.' },
      { min: '12–20', que: '//What do you do?// **se da como bloque y no se analiza.** Si pregunta por qué lleva //do// dos veces: “es una frase hecha, la desarmamos en la Parte 2”. No abrir esa puerta hoy.' },
      { min: '20–28', que: '**a / an**. La regla es por **sonido**, no por letra. Se enseña con //an hour// y //a university// desde el principio, no como excepción al final.' },
      { min: '28–36', que: 'Wh- questions con BE. Se arman igual que las de sí/no, con la palabra pregunta adelante. No es material nuevo: es lo de la clase 2 con un agregado.' },
      { min: '36–44', que: 'Números 20–100 y edad. **Dictado de teléfonos** — es la única forma de que 13 y 30 se separen.' },
      { min: '44–56', que: '**Now you speak**: el evento con acreditación y ficha. Cronometrado, como es de verdad.' },
      { min: '56–60', que: '**I can…** y la tarea: escribir su propia ficha completa.' },
    ],
    ojo: [
      '//I have 30 years// va a aparecer sí o sí: es calco directo del castellano. La edad va con **BE** y **sin** la palabra //years//. Corregilo la primera vez con la explicación, después solo con el gesto.',
      '//I\'m teacher// es el otro calco garantizado. En inglés la profesión **siempre** lleva //a// o //an//. Sin artículo, suena a titular de diario.',
      '//a// o //an// se decide por el **sonido**, no por la letra. //an hour// (la h no suena), //a university// (empieza sonando //you//). Si das “vocal → an” a secas, después hay que desmentirlo.',
      'Los números 13/30, 14/40, 15/50 se confunden al escuchar, no al leer. El acento es lo único que los separa: //thir**TEEN**// contra //**THIR**ty//. Dictá teléfonos hasta que salga.',
      'El mail se dice //at// y //dot//, no “arroba” y “punto”. Parece obvio y no lo es: es de las primeras cosas que le van a pedir en un evento.',
    ],
  },

  // ══════════════ GRAMMAR BOOK ══════════════
  grammar: {

    inContext: {
      subtitulo: 'un evento de trabajo',
      dialogo: [
        { quien: 'Laura', linea: 'Hi, I\'m Laura. {{What do you do?}}' },
        { quien: 'Tom',   linea: 'I\'m {{an}} architect. And you?' },
        { quien: 'Laura', linea: 'I\'m {{a}} nurse. I\'m at the City Hospital.' },
        { quien: 'Tom',   linea: 'Nice! {{Where}} is it?' },
        { quien: 'Laura', linea: 'It\'s near the station. {{How old}} is your company?' },
        { quien: 'Tom',   linea: 'Six years. We\'re a small studio.' },
      ],
      nota: 'Tres cosas nuevas: el //a// y el //an// delante de la profesión, las preguntas que empiezan con //What//, //Where// y //How old//, y //What do you do?// — que por ahora se aprende **entera**, sin desarmar.',
    },

    theRule: {
      subtitulo: 'a / an y las preguntas abiertas',
      cabecera: ['', 'Cómo se arma', 'Ejemplo'],
      filas: [
        { etiqueta: 'a / an',
          larga: 'Por el **sonido**, no por la letra',
          corta: 'a teacher · an engineer · an hour · a university' },
        { etiqueta: 'La profesión',
          larga: 'BE + //a// o //an// — nunca sola',
          corta: 'I\'m a nurse. · She\'s an architect.' },
        { etiqueta: 'Pregunta sí/no',
          larga: 'Verbo primero (ya lo sabés)',
          corta: 'Are you a doctor? — Yes, I am.' },
        { etiqueta: 'Pregunta abierta',
          larga: 'Palabra pregunta + el **mismo** orden',
          corta: 'Where are you from? · How old are you?' },
        { etiqueta: 'La edad',
          larga: 'Con BE y **sin** //years//',
          corta: 'I\'m 30. · She\'s 25.' },
      ],
      nota: 'Las preguntas abiertas **no son material nuevo**: son la pregunta de sí/no de la clase pasada con una palabra adelante. //Are you…?// → //Where are you…?//',
    },

    watchOut: {
      subtitulo: 'los dos calcos más resistentes del castellano',
      items: [
        { mal: 'I have 30 years.',
          bien: 'I\'m 30.',
          porque: 'La edad va con BE y **sin** //years//. Es traducción literal de “tengo 30 años” y es el error más difícil de sacar del primer año.' },
        { mal: 'I\'m teacher.',
          bien: 'I\'m a teacher.',
          porque: 'La profesión **siempre** lleva //a// o //an//. Sin artículo suena a titular de diario, no a persona hablando.' },
        { mal: 'an university · a hour',
          bien: 'a university · an hour',
          porque: 'Se decide por el **sonido**: //university// empieza sonando //you//, que es consonante; en //hour// la h no suena y arranca en vocal.' },
      ],
    },

    practice: {
      subtitulo: 'completar → transformar → personalizar',
      pasos: [
        { tipo: 'huecos', titulo: 'A · Completar — con //a//, //an// o Ø (nada)', items: [
          'She\'s [[an]] engineer.',
          'I\'m [[a]] teacher at [[a]] language school.',
          'My sister is [[an]] artist.',
          'He\'s [[a]] university student.',
          'It\'s [[an]] hour from here.',
          'They\'re [[Ø]] doctors.',
        ]},
        { tipo: 'huecos', titulo: 'B · Transformar — escribí la pregunta para esta respuesta', items: [
          'I\'m a nurse. → [[What do you do?]]',
          'I\'m 32. → [[How old are you?]]',
          'It\'s near the station. → [[Where is it?]]',
          'My name\'s Tom. → [[What\'s your name?]]',
        ]},
        { tipo: 'renglones', titulo: 'C · Personalizar — completá tu propia ficha',
          renglones: 4,
          nota: 'Nombre, profesión con //a// o //an//, dónde trabajás y edad. Cuatro renglones, uno por dato.' },
      ],
    },

    speaking: {
      subtitulo: 'networking',
      situacion: '**La situación:** un evento de trabajo con acreditación. Cada uno tiene una tarjeta con un nombre y una profesión que **no son los suyos**. Hay que presentarse, completar la ficha del otro y despedirse — en tres minutos, como pasa de verdad.',
      guion: [
        { quien: 'A', linea: 'Hi, I\'m ___________ . What do you do?' },
        { quien: 'B', linea: 'I\'m ___________ . And you?' },
        { quien: 'A', linea: 'I\'m ___________ . Where\'s your office?' },
        { quien: 'B', linea: 'It\'s in ___________ .' },
        { quien: 'A', linea: 'What\'s your email?' },
        { quien: 'B', linea: 'It\'s ___________ at ___________ dot com.' },
        { quien: 'A', linea: 'Great. Nice to meet you!' },
      ],
      rondas: [
        { n: 'Ronda 1', texto: 'Con el guion. Solo llenás los huecos con la tarjeta que te tocó.' },
        { n: 'Ronda 2', texto: 'Sin guion, y anotás los datos del otro **sin** pedir que te los repita dos veces.' },
        { n: 'Ronda 3', texto: 'Tres personas en tres minutos. Al final contás quién era quién, de memoria.' },
      ],
      espejo: '↔ Esta misma tarea está en el Vocabulary Book, con las profesiones y los números a mano.',
    },

    iCan: {
      subtitulo: 'marcá lo que ya podés hacer',
      items: [
        'Puedo decir a qué me dedico, con //a// o //an// puesto.',
        'Puedo preguntar y decir la edad sin traducir del castellano.',
        'Puedo dar mi teléfono y mi mail en inglés, y entender los de otro.',
        'Puedo hacer preguntas con //What//, //Where// y //How old//.',
      ],
    },
  },

  // ══════════════ VOCABULARY BOOK ══════════════
  vocabulary: {
    carga: '30 palabras · 8 chunks',

    wordBank: {
      subtitulo: 'las profesiones se estudian CON el a/an pegado, nunca sueltas',
      grupos: [
        { titulo: 'Professions', items: [
          { en: 'a teacher',    es: 'docente' },
          { en: 'a nurse',      es: 'enfermero/a' },
          { en: 'an engineer',  es: 'ingeniero/a' },
          { en: 'an architect', es: 'arquitecto/a' },
          { en: 'a lawyer',     es: 'abogado/a' },
          { en: 'an accountant', es: 'contador/a' },
          { en: 'a designer',   es: 'diseñador/a' },
          { en: 'a student',    es: 'estudiante' },
        ]},
        { titulo: 'Dónde se trabaja', items: [
          { en: 'an office',  es: 'una oficina' },
          { en: 'a hospital', es: 'un hospital' },
          { en: 'a school',   es: 'una escuela' },
          { en: 'a shop',     es: 'un local' },
          { en: 'a company',  es: 'una empresa' },
          { en: 'a studio',   es: 'un estudio' },
          { en: 'at home',    es: 'desde casa' },
        ]},
        { titulo: 'Los datos', items: [
          { en: 'a phone number',   es: 'un teléfono' },
          { en: 'an email address', es: 'un mail' },
          { en: 'an address',       es: 'una dirección' },
          { en: 'a business card',  es: 'una tarjeta' },
          { en: 'How old…?',        es: '¿qué edad…?' },
        ]},
      ],
      tablas: [
        { titulo: 'Los números que se confunden al ESCUCHAR — mirá dónde cae el acento',
          cabecera: ['13–19 · el acento va al final', '20–100 · el acento va al principio'],
          filas: [
            ['thir**TEEN** · 13',   '**THIR**ty · 30'],
            ['four**TEEN** · 14',   '**FOR**ty · 40'],
            ['fif**TEEN** · 15',    '**FIF**ty · 50'],
            ['six**TEEN** · 16',    '**SIX**ty · 60'],
            ['seven**TEEN** · 17',  '**SEV**enty · 70'],
            ['eigh**TEEN** · 18',   '**EIGH**ty · 80'],
            ['nine**TEEN** · 19',   '**NINE**ty · 90'],
            ['—',                   '**HUN**dred · 100'],
          ],
        },
      ],
    },

    chunks: {
      subtitulo: 'bloques enteros, no palabras sueltas',
      items: [
        { c: 'What do you do?',        m: 'se aprende **entera** — se desarma en la Parte 2' },
        { c: 'I\'m a… / I\'m an…',     m: 'la profesión nunca va sola' },
        { c: 'I work at…',             m: 'otro bloque entero, tampoco se analiza todavía' },
        { c: 'How old are you?',       m: 'y se contesta //I\'m 30//, sin //years//' },
        { c: 'What\'s your email?',    m: 'la pregunta que más se usa en un evento' },
        { c: 'It\'s ___ at ___ dot com.', m: 'así se dice una dirección de mail' },
        { c: 'Sorry, can you repeat that?', m: 'de la unidad 1.1 — acá se usa en serio' },
        { c: 'Nice to meet you!',      m: 'el cierre, y da tiempo para irse' },
      ],
      nota: 'Los dos primeros bloques son present simple. Van enteros a propósito: sin ellos no hay charla de trabajo posible, y desarmarlos ahora obligaría a dar la //-s// de tercera persona en la clase 3.',
    },

    sayItRight: {
      subtitulo: 'la sílaba fuerte va en negrita',
      items: [
        { etiqueta: 'La trampa', texto: 'thir**TEEN** contra **THIR**ty. Si el acento cae al **final**, es el chico (13). Si cae al principio, es el grande (30).' },
        { etiqueta: 'El mail',   texto: 'La //@// se dice **at** y el punto se dice **dot**: //ana@gmail.com// → //ana **at** gmail **dot** com//.' },
        { etiqueta: 'Profesiones', texto: '**AR**chitect · engi**NEER** · ac**COUN**tant · de**SIGN**er. El acento casi nunca está donde uno lo pondría.' },
        { etiqueta: 'El //an//',  texto: 'Pegado a la palabra suena flojito, casi //ən//: //an engineer// sale como //ənen·gi·NEER//, todo junto.' },
      ],
    },

    useIt: {
      subtitulo: 'de memoria, no reconociendo',
      pasos: [
        { titulo: '1 · Ocho profesiones seguidas',
          texto: 'Tapá el word bank. En voz alta, **con el //a// o //an// puesto**. Si decís la profesión sola, volvés a empezar.' },
        { titulo: '2 · Dictado de teléfonos',
          texto: 'Que alguien te dicte cinco números de teléfono. Cuando dudes entre 13 y 30, escuchá **dónde cae el acento**, no la palabra entera.' },
        { titulo: '3 · Tu mail en voz alta',
          texto: 'Deletreá tu dirección de mail entera, con //at// y //dot//. Después la de otra persona, sin que te la repita.' },
      ],
    },

    cards: {
      subtitulo: 'la misma tarea que en Grammar, con las palabras',
      items: [
        { titulo: 'Card 1 · Acreditación',
          texto: 'Te dan una tarjeta con un nombre y una profesión que no son los tuyos. Tres minutos, tres personas, la ficha de cada una completa.',
          frases: 'Hi, I\'m… / What do you do? / Where\'s your office? / What\'s your email?' },
        { titulo: 'Card 2 · El dato que falta',
          texto: 'Cada uno tiene una ficha a medias. Hay que completarla preguntando, sin mostrarla.',
          frases: 'How old is she? / What\'s her job? / Sorry, can you repeat that?' },
        { titulo: 'Card 3 · Profesión imposible',
          texto: 'Te toca una profesión rara. Los demás la adivinan con preguntas de sí/no, y solo pueden hacer diez.',
          frases: 'Are you a doctor? / Is it an office job? / No, I\'m not.' },
      ],
    },

    myWords: { subtitulo: 'lo que salió en clase', renglones: 8 },
  },
};

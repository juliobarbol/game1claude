// ════════════════════════════════════════════════════════════════════
// Nivel 1 · Parte 1 · Unidad 1 — "Hi, I'm…"
//
// Esto es CONTENIDO, no presentación. Lo dibuja curso/clase.html.
// El formato está documentado en curso/ESQUEMA.md. Marcas de texto:
//   **negrita**   //inglés en cursiva//   {{resaltado}}   [[respuesta]]
// ════════════════════════════════════════════════════════════════════

CLASES['n1p1u01'] = {
  id: 'n1p1u01',
  nivel: 1, parte: 1, unidad: 1, clase: 1,
  codigo: 'Unit 1.1',
  titulo: "Hi, I'm…",
  promesa: 'Presentarte, deletrear tu nombre y pedir que te repitan.',
  ficha: [
    { k: 'Duración',        v: '60 minutos' },
    { k: 'Gramática',       v: 'BE · I / you' },
    { k: 'Palabras nuevas', v: '26 + 8 chunks' },
    { k: 'Hablás en',       v: 'minuto 12' },
  ],

  // ══════════════ GRAMMAR BOOK ══════════════
  grammar: {

    inContext: {
      subtitulo: 'leelo antes de que te expliquen nada',
      dialogo: [
        { quien: 'Marta',  linea: 'Hi! {{I\'m}} Marta.' },
        { quien: 'Daniel', linea: 'Hi, Marta. {{I\'m}} Daniel. Nice to meet you.' },
        { quien: 'Marta',  linea: 'Nice to meet you too. Sorry — how do you spell that?' },
        { quien: 'Daniel', linea: 'D–A–N–I–E–L.' },
        { quien: 'Marta',  linea: 'Thanks. {{You\'re}} in my English class!' },
        { quien: 'Daniel', linea: 'Yes! See you on Monday.' },
      ],
      nota: 'Fijate en lo resaltado. Son las tres formas que vas a usar hoy: //I\'m//, //you\'re// y el deletreo.',
    },

    theRule: {
      subtitulo: 'el verbo BE con I y you',
      cabecera: ['', 'Forma larga', 'Forma corta — la que se usa al hablar'],
      filas: [
        { etiqueta: 'yo',             larga: 'I am Marta.',       corta: 'I\'m Marta.' },
        { etiqueta: 'vos / usted',    larga: 'You are Daniel.',   corta: 'You\'re Daniel.' },
        { etiqueta: 'yo — negativo',  larga: 'I am not late.',    corta: 'I\'m not late.' },
        { etiqueta: 'vos — negativo', larga: 'You are not late.', corta: 'You\'re not late. / You aren\'t late.' },
      ],
      nota: '**La regla de oro:** en inglés el sujeto **nunca** se cae. En castellano decís “Soy Marta” sin el “yo”; en inglés el //I// tiene que estar sí o sí.',
    },

    watchOut: {
      subtitulo: 'los tres errores de siempre',
      items: [
        { mal: 'Am Marta.',
          bien: 'I\'m Marta.',
          porque: 'El sujeto no se omite nunca. Es el error número uno del primer mes.' },
        { mal: 'I am called Marta.',
          bien: 'I\'m Marta. / My name\'s Marta.',
          porque: 'Traducción literal de “me llamo”. Suena raro y viejo; nadie se presenta así.' },
        { mal: 'Hi, I\'m the Marta.',
          bien: 'Hi, I\'m Marta.',
          porque: 'Los nombres propios no llevan artículo. Chau “la Marta”.' },
      ],
    },

    practice: {
      subtitulo: 'completar → transformar → personalizar',
      pasos: [
        { tipo: 'huecos', titulo: 'A · Completar', items: [
          'Hi! [[I\'m]] Ana.',
          'Hello, Pablo. [[You\'re]] in my class.',
          '[[I\'m]] not a teacher — I\'m a student.',
          'Good morning! [[I\'m]] Laura, and [[you\'re]] Tom.',
          'Sorry, [[you\'re]] not Daniel. Daniel is over there.',
          'Nice to meet you. [[I\'m]] new here.',
        ]},
        { tipo: 'huecos', titulo: 'B · Transformar — pasalo a forma corta', items: [
          'I am Sofía. → [[I\'m Sofía.]]',
          'You are my teacher. → [[You\'re my teacher.]]',
          'I am not from here. → [[I\'m not from here.]]',
          'You are not late. → [[You\'re not late.]]',
        ]},
        { tipo: 'renglones', titulo: 'C · Personalizar — escribí tres frases verdaderas sobre vos',
          renglones: 3,
          nota: 'Arrancá cada una con //I\'m…// o //I\'m not…//' },
      ],
    },

    speaking: {
      subtitulo: 'primer día',
      situacion: '**La situación:** primer día de un curso. Se cruzan dos personas que no se conocen. Se presentan y uno de los dos no entiende bien el nombre del otro.',
      guion: [
        { quien: 'A', linea: 'Hi! I\'m ___________ .' },
        { quien: 'B', linea: 'Hi, ___________ . I\'m ___________ . Nice to meet you.' },
        { quien: 'A', linea: 'Nice to meet you too. Sorry — how do you spell that?' },
        { quien: 'B', linea: '___ – ___ – ___ – ___ – ___ .' },
        { quien: 'A', linea: 'Thanks! See you on ___________ .' },
      ],
      rondas: [
        { n: 'Ronda 1', texto: 'Con el guion a la vista. Solo cambiás los nombres.' },
        { n: 'Ronda 2', texto: 'Tapás el guion. Vale trabarse: lo importante es no cortar.' },
        { n: 'Ronda 3', texto: 'Te toca un nombre difícil de la tarjeta 2. Ahora el deletreo es en serio.' },
      ],
      espejo: '↔ Esta misma tarea está en el Vocabulary Book, con las palabras en vez de la estructura.',
    },

    iCan: {
      subtitulo: 'marcá lo que ya podés hacer',
      items: [
        'Puedo saludar y despedirme según la hora del día.',
        'Puedo decir mi nombre con //I\'m//, sin comerme el sujeto.',
        'Puedo deletrear mi nombre y mi apellido en inglés.',
        'Puedo pedir que me repitan o me deletreen algo sin cambiar al castellano.',
      ],
    },
  },

  // ══════════════ VOCABULARY BOOK ══════════════
  vocabulary: {
    carga: '26 palabras · 8 chunks',

    wordBank: {
      subtitulo: 'tapá la columna de la derecha y decilas en voz alta',
      grupos: [
        { titulo: 'Greetings', items: [
          { en: 'Hi',             es: 'hola (informal)' },
          { en: 'Hello',          es: 'hola' },
          { en: 'Good morning',   es: 'hasta el mediodía' },
          { en: 'Good afternoon', es: 'hasta las 6' },
          { en: 'Good evening',   es: 'al llegar, de noche' },
        ]},
        { titulo: 'Goodbyes', items: [
          { en: 'Bye',              es: 'chau' },
          { en: 'See you',          es: 'nos vemos' },
          { en: 'See you later',    es: 'hasta luego' },
          { en: 'Have a nice day',  es: 'que tengas buen día' },
          { en: 'Good night',       es: 'al irse, de noche' },
        ]},
        { titulo: 'Classroom language', items: [
          { en: 'Sorry?',             es: '¿perdón?' },
          { en: 'Again, please.',     es: 'otra vez' },
          { en: 'I don\'t understand.', es: 'no entiendo' },
          { en: 'What does it mean?', es: '¿qué significa?' },
          { en: 'How do you say…?',   es: '¿cómo se dice…?' },
        ]},
      ],
      alfabeto: {
        titulo: 'The alphabet — agrupado por cómo suena, no por orden',
        grupos: [
          { letras: 'A H J K',         son: '/eɪ/' },
          { letras: 'B C D E G P T V', son: '/iː/' },
          { letras: 'F L M N S X Z',   son: '/e/' },
          { letras: 'I Y',             son: '/aɪ/' },
          { letras: 'O',               son: '/əʊ/' },
          { letras: 'Q U W',           son: '/juː/' },
          { letras: 'R',               son: '/ɑː(r)/' },
        ],
      },
      numeros: {
        titulo: 'Numbers 0–20',
        items: ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
                'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
                'eighteen','nineteen','twenty'],
      },
    },

    chunks: {
      subtitulo: 'bloques enteros, no palabras sueltas',
      items: [
        { c: 'Hi, I\'m…',                         m: 'tu presentación de siempre' },
        { c: 'Nice to meet you.',                 m: 'solo la primera vez que ves a alguien' },
        { c: 'Nice to meet you too.',             m: 'la respuesta — no te olvides del //too//' },
        { c: 'How do you spell that?',            m: 'la frase que te salva en toda la Parte 1' },
        { c: 'Sorry, can you repeat that?',       m: 'pedir repetición sin volver al castellano' },
        { c: 'How do you say “___” in English?',  m: 'para seguir hablando cuando no sabés la palabra' },
        { c: 'See you on Monday.',                m: 'despedida con día' },
        { c: 'Have a nice day!',                  m: 'cierre amable, muy usado' },
      ],
      nota: 'Estos ocho se memorizan enteros, como una sola palabra larga. No se analizan todavía.',
    },

    sayItRight: {
      subtitulo: 'la sílaba fuerte va en negrita',
      items: [
        { etiqueta: 'Acento',    texto: 'he**LLO** · **GOOD** morning · **NICE** to **MEET** you' },
        { etiqueta: 'Se pegan',  texto: '“meet you” suena **/miː-tʃu/**, no “mit iu”. La **t** y la **y** se funden.' },
        { etiqueta: 'La H suena', texto: '**H**i · **H**ello · **H**ave — en inglés la H se sopla. No es muda.' },
        { etiqueta: 'Cuidado',   texto: '**G** /dʒiː/ vs **J** /dʒeɪ/ · **E** /iː/ vs **I** /aɪ/ — el 90 % de los deletreos se arruinan acá.' },
      ],
    },

    useIt: {
      subtitulo: 'de memoria, no reconociendo',
      pasos: [
        { titulo: '1 · Decilo en inglés',
          texto: 'Tapá el word bank. En voz alta y sin pensar: //buenos días · nos vemos · mucho gusto · ¿cómo se escribe? · ¿podés repetir? · que tengas buen día//.' },
        { titulo: '2 · Deletreá en voz alta',
          texto: 'Tu nombre · tu apellido · tu calle · tu ciudad · la palabra //ENGLISH//. Si dudás en la G o la E, volvé al cuadro del alfabeto.' },
        { titulo: '3 · 60 segundos',
          texto: 'Del 0 al 20 sin parar y sin mirar. Después, al revés: del 20 al 0.' },
      ],
    },

    cards: {
      subtitulo: 'la misma tarea que en Grammar, con las palabras',
      items: [
        { titulo: 'Card 1 · Coffee break',
          texto: 'Se cruzan en la cocina de la oficina. Se presentan, uno deletrea su nombre y se despiden con el día en que se vuelven a ver.',
          frases: 'Hi, I\'m… / Nice to meet you. / How do you spell that? / See you on…' },
        { titulo: 'Card 2 · Nombre imposible',
          texto: 'Cada uno saca un nombre de la lista y se presenta con ése. El otro //tiene// que pedir el deletreo.',
          frases: 'Siobhan · Xiomara · Krzysztof · Aoife · Ngozi · Jyoti' },
        { titulo: 'Card 3 · La cadena',
          texto: 'En grupo. Cada uno se presenta y antes repite el nombre del anterior. El último repite todos.',
          frases: 'This is… , and I\'m…' },
      ],
    },

    myWords: { subtitulo: 'lo que salió en clase', renglones: 8 },
  },
};

# El esquema de una clase

Una clase **es un archivo de datos**, no una página. `curso/clase.html` es el
único que sabe dibujarla. Si cambia cómo se ve una caja, se cambia ahí y
cambia en las 36 clases a la vez.

```
curso/data/indice.js       la estructura del curso (qué clases hay)
curso/data/<id>.js         el contenido de una clase
curso/render.js            EL renderizador — el único que sabe dibujar una caja
curso/clase.html?u=<id>    una clase en pantalla
curso/imprimir.html        varias clases seguidas, para imprimir o hacer PDF
```

## Las direcciones

| URL | Da |
|---|---|
| `clase.html?u=n1p1u01` | la clase, versión alumno |
| `clase.html?u=n1p1u01&v=profesor` | la misma, con respuestas puestas y plan de clase |
| `imprimir.html?u=n1p1u01` | esa clase sola, lista para PDF |
| `imprimir.html?parte=n1p1` | la parte entera, con portada e índice |
| `imprimir.html?parte=n1p1&libro=grammar` | solo el Grammar Book |
| `imprimir.html?parte=n1p1&v=profesor` | la parte entera, versión profesora |

## El id

`n<nivel>p<parte>u<unidad>` — por ejemplo `n1p1u01` es Nivel 1, Parte 1,
Unidad 1. Los checkpoints usan `c` en vez de `u`: `n1p1c01`.

El **código visible** (`Unit 1.1`) numera la unidad dentro del **nivel**, no
de la parte: la Parte 2 sigue en `Unit 1.11`. Así el alumno ve una sola
cuenta corrida por nivel.

## Marcas de texto

Se pueden usar dentro de **cualquier** texto del contenido. El renderizador
escapa el HTML primero, así que el contenido nunca puede inyectar markup.

| Marca | Da | Para qué |
|---|---|---|
| `**texto**` | negrita | énfasis, sílaba tónica |
| `//texto//` | cursiva | una palabra o frase en inglés dentro de prosa en castellano |
| `{{texto}}` | resaltado | la estructura nueva dentro del diálogo de `inContext` |
| `[[texto]]` | hueco con respuesta | los ejercicios de completar |

Las cuatro tienen que estar **balanceadas**; el test lo verifica.

## Esqueleto

```js
CLASES['n1p1u01'] = {
  id: 'n1p1u01',
  nivel: 1, parte: 1, unidad: 1, clase: 1,   // `clase` es el número dentro de la parte
  codigo: 'Unit 1.1',
  titulo: "Hi, I'm…",                        // tiene que coincidir con el índice
  promesa: 'Presentarte, deletrear tu nombre…',
  ficha: [ { k: 'Duración', v: '60 minutos' }, … ],   // la tira de datos de arriba
  grammar: { … },      // 6 cajas, ninguna vacía
  vocabulary: { … },   // 6 cajas, ninguna vacía
};
```

## `profe` — la versión profesora (opcional)

No va en el libro del alumno: se ve solo con `&v=profesor`. Una clase sin
`profe` funciona igual, pero conviene tenerlo — es lo que convierte la clase
en algo que se puede dar sin volver a prepararla.

```js
profe: {
  plan: [ { min: '0–5', que: 'Recibirla en inglés desde la puerta…' }, … ],
  ojo:  [ 'El sujeto omitido aparece en la primera frase. Marcalo **una vez**…', … ],
}
```

- **`plan`** — el reparto del tiempo de la clase. Los tramos van en orden y
  suman la duración de la ficha.
- **`ojo`** — qué anticipar: el error que va a aparecer sí o sí, qué hacer
  cuando algo se traba, y qué recortar si el tiempo aprieta.

En la versión profesora, además, **las respuestas de los ejercicios vienen
puestas** en vez de tapadas.

## Las 6 cajas del Grammar Book

Cada caja acepta `subtitulo` (el texto gris del encabezado). Es opcional.

| Clave | Forma |
|---|---|
| `inContext` | `{ dialogo: [{quien, linea}], nota }` — el diálogo. La estructura nueva va con `{{…}}` |
| `theRule` | `{ cabecera: [3 strings], filas: [{etiqueta, larga, corta}], nota }` |
| `watchOut` | `{ items: [{mal, bien, porque}] }` |
| `practice` | `{ pasos: [ … ] }` — ver abajo |
| `speaking` | `{ situacion, guion: [{quien, linea}], rondas: [{n, texto}], espejo }` |
| `iCan` | `{ items: [string] }` |

**Los pasos de `practice`** van siempre en este orden y el último es
`renglones` (el test lo exige — es la regla *completar → transformar →
personalizar*):

```js
{ tipo: 'huecos',     titulo: 'A · Completar', items: ['Hi! [[I\'m]] Ana.', …] }
{ tipo: 'renglones',  titulo: 'C · Personalizar…', renglones: 3, nota: '…' }
```

## Las 6 cajas del Vocabulary Book

| Clave | Forma |
|---|---|
| `wordBank` | `{ grupos: [{titulo, items:[{en, es}]}], alfabeto?, numeros? }` |
| `chunks` | `{ items: [{c, m}], nota }` — `c` es el chunk, `m` para qué sirve |
| `sayItRight` | `{ items: [{etiqueta, texto}] }` — la sílaba fuerte con `**…**` |
| `useIt` | `{ pasos: [{titulo, texto}] }` |
| `cards` | `{ items: [{titulo, texto, frases}] }` |
| `myWords` | `{ renglones: 8 }` |

`alfabeto` y `numeros` son opcionales y solo tienen sentido en la Unidad 1.1:

```js
alfabeto: { titulo: '…', grupos: [{letras: 'A H J K', son: '/eɪ/'}] }
numeros:  { titulo: 'Numbers 0–20', items: ['zero','one',…] }   // el índice es el número
```

Además, `vocabulary.carga` es el texto del encabezado del libro
(`'26 palabras · 8 chunks'`).

## Agregar una clase

1. Entrada en `curso/data/indice.js` con `estado: 'pendiente'`.
2. Archivo `curso/data/<id>.js` siguiendo este esquema.
3. Cambiar el estado a `'listo'`.
4. `node test/curso.test.cjs`.

No se toca ningún HTML. La portada, el navegador anterior/siguiente y el
título de la pestaña salen solos.

## Lo que el test no deja pasar

- Una caja faltante o vacía.
- Que el índice y los datos discrepen en id, número de clase o título.
- Una unidad sin situación de speaking con guion y rondas.
- Que la práctica no termine en `personalizar`.
- Marcas de texto sin cerrar.
- Un archivo de datos que no esté en el índice, o una clase marcada como
  `listo` sin archivo.

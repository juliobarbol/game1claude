# Curso de inglés — Guía del proyecto (para Claude Code)

> Material propio de ELT para adultos, y la plataforma para armarlo.
> Nada que ver con el juego, que vive en `juego/` y se sirve en `/juego/`.

## Qué se está construyendo

Un curso de inglés propietario, vendible **por partes**, para reemplazar el
parche de PDFs y libros de terceros. Tres niveles, tres partes por nivel,
**12 clases por parte** (36 por nivel). Cada clase son dos libros que se
hablan: **Grammar** y **Vocabulary**.

Y, alrededor, una plataforma para que la profesora arme, corrija y publique
clases sin tocar código.

## Arquitectura — lo que hay que entender antes de tocar nada

**Una clase es un archivo de DATOS, no una página.** Hay un solo
renderizador para todas.

```
index.html                 portada; dibuja la lista desde el índice
curso/estilo.css           el sistema visual entero (tokens + cajas)
curso/tema.js              claro/oscuro
curso/clase.html           EL renderizador — el único que sabe dibujar una clase
curso/data/indice.js       la estructura del curso (qué clases hay y su estado)
curso/data/<id>.js         el contenido de una clase
curso/ESQUEMA.md           el contrato de un archivo de clase  ← LEER ANTES DE AGREGAR UNA
curso/nivel-1/parte-1/syllabus.md    el temario, fuente de verdad del diseño
curso/nivel-1/parte-1/syllabus.html  el temario en versión visual
test/curso.test.cjs        esquema + coherencia + renderizado en navegador
```

Los datos se cargan con un `<script>` inyectado y **no con `fetch()`**: así
las páginas también andan abiertas con doble clic (`file://`), sin servidor.

## Reglas que NO se negocian

- **El contenido no vive en HTML.** Si te encontrás escribiendo una caja a
  mano en un `.html`, parás: va en `curso/data/<id>.js`.
- **`syllabus.md` manda sobre el diseño del curso.** Si cambia el contenido
  de una unidad, se cambia ahí primero y después en los datos.
- **Regla de oro de integración:** en el Vocabulary Book no puede aparecer
  una palabra que la gramática de esa unidad no permita usar en una frase
  completa. Y la gramática se practica con las palabras de **esa** unidad.
- **Toda unidad termina hablando.** Sin situación de uso real concreta (con
  quién, dónde, para qué), la unidad no está lista. El test lo exige.
- **La práctica va siempre completar → transformar → personalizar.**
- **El curso abre SIEMPRE en tema claro.** No se mira `prefers-color-scheme`:
  si la compu está en oscuro, el curso igual abre claro. El oscuro es una
  elección explícita con el botón, pensada para trabajar de noche, y se
  recuerda en el aparato (ver `curso/tema.js`). **No volver a meter un
  `@media (prefers-color-scheme: dark)`.**
- **Estética adulta.** Cuadros, color funcional y tipografía. **Cero
  ilustraciones infantiles.** Fotografía solo cuando el objeto *es* el
  contenido.
- **Cinco colores, un significado fijo cada uno.** No inventar colores
  nuevos ni reusar uno para otra cosa:

  | Color | Token | Significa |
  |---|---|---|
  | Azul marino | `--grammar` | Estructura: reglas, cuadros, tablas |
  | Verde profundo | `--vocab` | Léxico: word banks, chunks, pronunciación |
  | Ámbar | `--speak` | Hablar. Si es ámbar, se habla |
  | Granate | `--alert` | Cuidado: errores típicos, falsos amigos |
  | Gris pizarra | `--slate` | Referencia: contexto, autoevaluación, glosario |

- **El color nunca es la única señal.** Todo tiene que leerse impreso en
  blanco y negro: cada caja lleva además su etiqueta en versalitas.
- **El contenido nunca inyecta HTML.** El renderizador escapa todo y recién
  después aplica las marcas (`**`, `//`, `{{}}`, `[[]]`).
- **La promesa comercial es parte del producto.** Cada parte declara cuántas
  clases dura y qué va a poder decir el alumno. Si se agrega contenido, se
  ajusta la promesa; no se estira la parte en silencio.

## Anatomía fija de una unidad

**Grammar:** `IN CONTEXT` → `THE RULE` → `WATCH OUT` → `PRACTICE` →
`NOW YOU SPEAK` → `I CAN…`

**Vocabulary:** `WORD BANK` → `CHUNKS` → `SAY IT RIGHT` → `USE IT` →
`SPEAKING CARDS` → `MY WORDS`

Doce cajas, siempre en ese orden. Es lo que hace que el esquema de datos
exista, así que no se agregan ni se sacan cajas sin pensarlo dos veces.

## Cómo verificar cambios

```bash
# Datos, esquema, coherencia y renderizado en un navegador de verdad
NODE_PATH=/opt/node22/lib/node_modules node test/curso.test.cjs
```

Sin playwright el test corre igual, pero se saltea la parte del navegador y
lo avisa.

## Agregar una clase

Ver `curso/ESQUEMA.md`. Resumen: entrada en `indice.js`, archivo en
`data/<id>.js`, estado a `'listo'`, correr el test. **No se toca HTML.**

## Estado y qué sigue

- **Hecho:** contenido como datos + renderizador único + tema claro/oscuro +
  tests. Clase 01 armada.
- **Siguiente:** impresión y PDF (`@media print`), versión profesor/alumno,
  y después el editor para que la profesora arme clases sin tocar archivos.
- **Pendiente menor:** `syllabus.html` todavía tiene su CSS propio en vez de
  usar `curso/estilo.css`. Migrarlo la próxima vez que haya que tocarlo.

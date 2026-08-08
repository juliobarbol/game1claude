# Curso de inglés — Guía del proyecto (para Claude Code)

> Material propio de ELT para adultos: **dos libros por parte** (Grammar y
> Vocabulary) que comparten unidades, y un syllabus maestro por parte.
> Nada que ver con el juego que vive en la raíz del repo (`index.html`).

## Qué se está construyendo

Un curso de inglés propietario, vendible **por partes**, para reemplazar el
parche de PDFs y libros de terceros. Tres niveles, tres partes por nivel,
**12 clases por parte** (36 por nivel). Cada parte se entrega como dos libros:

- **Grammar Book** — la estructura, en cuadros.
- **Vocabulary Book** — el léxico y los *chunks*, en cuadros.

Los dos comparten numeración de unidad y **la misma tarea de speaking**.

## Estructura de archivos

```
curso/
  CLAUDE.md                       ← esto
  nivel-1/
    parte-1/
      syllabus.md                 ← FUENTE DE VERDAD del contenido
      syllabus.html               ← la versión visual del syllabus
```

Lo que viene después (mismo patrón por parte):
`grammar-book.html` · `vocabulary-book.html` · `speaking-cards.html`.

## Reglas que NO se negocian

- **`syllabus.md` manda.** Si cambia el contenido de una unidad, se cambia
  primero ahí y después se propaga al HTML y a los libros. Nunca al revés.
- **Regla de oro de integración:** en el Vocabulary Book no puede aparecer
  una palabra que la gramática de esa unidad no permita usar en una frase
  completa. Y la gramática se practica con las palabras de **esa** unidad.
- **Toda unidad termina hablando.** Si una unidad no tiene una situación de
  uso real concreta (con quién, dónde, para qué), la unidad no está lista.
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
- **La promesa comercial es parte del producto.** Cada parte declara cuántas
  clases dura y qué va a poder decir el alumno al terminar. Si se agrega
  contenido, se ajusta la promesa; no se estira la parte en silencio.

## Anatomía fija de una unidad

**Grammar:** `IN CONTEXT` → `THE RULE` → `WATCH OUT` → `PRACTICE`
(completar → transformar → personalizar) → `NOW YOU SPEAK` → `I CAN…`

**Vocabulary:** `WORD BANK` → `CHUNKS` → `SAY IT RIGHT` → `USE IT`
(recuperación, no reconocimiento) → `SPEAKING CARDS` → `MY WORDS`

## Cómo se ve el HTML

Sin build y sin frameworks: HTML + `<style>` inline en el mismo archivo, igual
que el resto del repo. Tokens CSS en `:root`, tema claro y oscuro, y
`@media print` cuando llegue el momento de imprimir. Se abre con doble clic.

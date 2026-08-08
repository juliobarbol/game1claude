# Curso de inglés — Guía del proyecto (para Claude Code)

> Material propio de ELT para adultos, y la plataforma para armarlo.
> Es lo único que hay en este repo: el curso se sirve en la raíz del sitio.

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
curso/esquema.js           EL ESQUEMA declarado + la validación  ← de acá sale el formulario
curso/render.js            EL renderizador — el único que sabe dibujar una caja
curso/borradores.js        lo que se edita, guardado en el navegador
curso/nube.js              los mismos borradores, compartidos (Supabase)
curso/clase.html           una clase en pantalla (alumno o profesora)
curso/editor.html          el editor: formulario + vista previa + qué falta
curso/imprimir.html        varias clases seguidas → imprimir / PDF
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

## Las tres piezas que no hay que confundir

| Archivo | Responde a |
|---|---|
| `esquema.js` | **qué campos tiene** una clase, y si está bien |
| `render.js` | **cómo se ve** |
| `data/<id>.js` | **qué dice** esta clase |

El formulario del editor **no está escrito**: se construye recorriendo
`esquema.js`. Agregar un campo ahí lo hace aparecer en el editor, en la
validación y en el test, los tres a la vez. Lo único que hay que tocar aparte
es `render.js`, que decide cómo se dibuja.

**La validación es una sola.** `ESQUEMA.validar()` la usan el editor (para
mostrarle a la profesora qué le falta) y `test/curso.test.cjs`. Si tuvieran
reglas propias se desincronizarían y el editor mentiría. El test además se
asegura de que la validación **detecte** los errores, rompiendo una clase a
propósito: si no, podría quedar ciega y todo seguiría en verde.

## Borradores y la nube

Lo que se edita se guarda **primero en este navegador** (instantáneo) y
**después en la nube** (Supabase), sin bloquear. Las reglas:

- **La nube nunca hace falta.** Sin internet o sin frase de acceso, el editor
  anda exactamente igual contra localStorage.
- **Nada de `await` en el camino de escribir.**
- **Se actualiza sola cuando no hay nada que preguntar** — que es casi siempre.
  Se guarda, junto a cada borrador, la marca de tiempo de la última vez que
  los dos lados estuvieron iguales (`sincronizado`). Con eso se sabe quién
  cambió desde entonces:

  | Cambió | Qué hace |
  |---|---|
  | nadie | nada |
  | solo acá | sube |
  | solo la nube | **trae y avisa**, sin preguntar |
  | **los dos** | **pregunta** |

  Preguntar cuando no hay conflicto es hacer trabajar a la persona al pedo.
  Preguntar cuando sí lo hay es lo único que evita perderle trabajo.
- **Nunca se pisa lo que está escribiendo.** Si el foco está en un campo del
  formulario, la actualización automática se saltea y se reintenta después.
- El editor revisa cada 20 s, así también alcanza a quien lo dejó abierto.

Un borrador **pisa** a la clase publicada cuando existe, así se corrige y se
ve el cambio al instante. `clase.html` lo avisa con una banda arriba.

**El archivo sigue siendo la verdad publicada.** La nube guarda trabajo en
curso, no publica: para publicar hay que **Exportar archivo** y guardarlo en
`curso/data/`. Por eso ese botón sigue siendo el más prominente del editor.

### Cómo está cerrada

Las tablas `curso_acceso` y `curso_borradores` tienen RLS **sin ninguna
política**: desde el navegador no se tocan nunca de forma directa. El único
camino son las funciones `curso_listar / curso_leer / curso_guardar /
curso_borrar`, que piden la frase de acceso.

De la frase solo se guarda el **hash** (bcrypt). `curso_ok`, que es la que
compara, **no está expuesta**: si lo estuviera, sería el camino más barato
para probar frases.

Un alumno nunca tiene frase guardada, así que su navegador **no habla con
Supabase nunca**. El test lo verifica.

### El proyecto de Supabase

El proyecto se llama `filo` (quedó de un proyecto anterior que vivía en este
mismo repo; el nombre es solo el del proyecto en Supabase, no hace falta
cambiarlo). La clave que está en `curso/nube.js` es la **publicable**, la que
va en el HTML a propósito. **La clave de servicio no entra al repo jamás.**

## Descartar

Descartar un borrador **no borra: mueve a la papelera**, que guarda los
últimos 10 y sobrevive a recargar. Se puede volver atrás de dos maneras: la
barra de **Deshacer** que aparece pegada al pie apenas descarta, y la lista de
descartados en la zona de riesgo.

El botón vive **al final del formulario**, después de las doce cajas, en un
recuadro rojo aparte. Antes estaba en la barra de arriba, al lado de botones
que se usan todo el tiempo: demasiado a mano para algo que tira trabajo.

Dos detalles que importan y se rompen fácil:

- La barra de Deshacer va **pegada al pie de la pantalla** (`position:fixed`),
  no arriba del documento. El botón que la dispara está abajo de todo; una
  barra arriba no se vería nunca.
- Descartar **no recarga la página**, porque recargar se llevaría puesta la
  barra de Deshacer. Se vuelve a la versión publicada rearmando el modelo.

## Impresión

El PDF sale del navegador: `imprimir.html` → Imprimir → destino **Guardar
como PDF**. No hay librería de PDF ni servidor: la hoja `@media print` de
`curso/estilo.css` es todo.

Dos cosas de esa hoja **no se tocan**:

- **Se fuerza el tema claro** aunque esté trabajando de noche en oscuro. Un
  PDF con fondo negro no se puede imprimir.
- **`print-color-adjust: exact`**, para que los cuadros de color salgan. El
  color es el sistema entero; igual todo se lee en blanco y negro porque
  cada caja lleva su etiqueta en versalitas.

Y una caja nunca se parte entre dos hojas (`break-inside: avoid`).

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

# Los borradores compartidos, con dos navegadores
NODE_PATH=/opt/node22/lib/node_modules node test/nube.test.cjs
```

`nube.test.cjs` corre en dos modos y avisa en cuál: **REAL** contra Supabase
(hay que pasarle `CURSO_FRASE=…`) o **DOBLE**, interceptando las llamadas con
un servidor de mentira. El doble prueba todo el lado del navegador —la URL,
las cabeceras, el cuerpo, los avisos, la mezcla— sin depender de la red; en el
sandbox de Claude Code el navegador no sale a internet, así que ahí corre
siempre así.

Sin playwright el test corre igual, pero se saltea la parte del navegador y
lo avisa.

## Agregar una clase

**A mano:** ver `curso/ESQUEMA.md`. Entrada en `indice.js`, archivo en
`data/<id>.js`, estado a `'listo'`, correr el test. **No se toca HTML.**

**Desde el editor:** `curso/editor.html`, elegir la clase en el desplegable
(las que están en el índice pero sin armar aparecen como *sin armar* y
arrancan con el título ya puesto), llenar, y **Exportar archivo** →
guardar en `curso/data/`. Después, estado a `'listo'` en el índice.

## Estado y qué sigue

- **Etapa 1 (hecha):** contenido como datos + renderizador único + tema
  claro/oscuro + tests. Clase 01 armada.
- **Etapa 2 (hecha):** impresión y PDF (`@media print`), versión
  profesora/alumno, impresión de una parte entera con portada e índice, y de
  un libro solo.
- **Etapa 3 (hecha):** el editor. Formulario generado desde el esquema, vista
  previa al lado, validación en vivo, exportar/importar, y borradores que
  pisan a la clase publicada.
- **Etapa 4 (hecha):** guardado en la nube. Los borradores se comparten entre
  aparatos y entre personas, con aviso de conflicto en vez de pisadas.
- **Pendiente del editor:** todavía no se pueden crear unidades nuevas fuera
  de las que ya están en `data/indice.js` (haría falta editar el índice desde
  la interfaz). Alcanza para armar las 12 de la Parte 1.
- **Pendiente menor:** `syllabus.html` todavía tiene su CSS propio en vez de
  usar `curso/estilo.css`. Migrarlo la próxima vez que haya que tocarlo.

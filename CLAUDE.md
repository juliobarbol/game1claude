# FILO — Guía del proyecto (para Claude Code)

> ⚠️ **Este repo tiene dos proyectos.** Esta guía es la del juego, que vive
> en **`juego/`** (+ `test/` y `tools/`) y se sirve en `/juego/`. El curso de
> inglés vive en **`curso/`** + el `index.html` de la raíz, y tiene su propia
> guía: `curso/CLAUDE.md`. Si el trabajo es del curso, no hace falta leer
> nada de acá.

> Juego de **plataformas de precisión** (PWA, se juega en el celu y en la
> compu). Esta guía es el mapa: leela antes de tocar el `juego/index.html`.

## Qué es

Un plataformero de precisión al estilo Celeste / Super Meat Boy, en chiquito:
salas de una pantalla, muerte instantánea, reintento inmediato, cronómetro,
**fantasma de tu mejor vuelta** y medallas por tiempo. La gracia no es
terminarlo: es **sentir que la mano te mejora**. Todo el diseño está al
servicio de eso.

- 15 niveles en 3 mundos. Cada mundo abre una habilidad: **salto** (1-5),
  **salto de pared** (6-10), **dash** (11-15).
- Se juega con teclado, con joystick/gamepad y **con los dedos** (joystick
  flotante + botones).
- Sin backend, sin cuentas: el progreso vive en `localStorage`.

## Arquitectura (importante)

- **Sin build, sin frameworks: JavaScript vanilla.** Todo el juego (HTML +
  CSS + JS) está en **un único `juego/index.html`**. Es deliberado: un archivo,
  deploy trivial, offline gratis.
- El JS está en **un solo `<script>` en ámbito global** (las funciones se
  llaman entre sí y algunas se usan desde `onclick`/tests). **No pasarlo a
  módulos ES.**
- Se publica como assets estáticos en **Cloudflare** (`wrangler.jsonc`).

## Estructura de archivos

- `juego/index.html` — **todo el juego** (markup + `<style>` + `<script>`).
- `juego/sw.js` — Service Worker (offline). **`CACHE` actual: `filo-v3`**.
- `juego/manifest.webmanifest`, `juego/icon-*.png` — PWA (instalación, iconos).
- `test/` — `_load.cjs` (carga el juego en node), `_bot.cjs` (el bot),
  `solver.test.cjs` (¿se pueden terminar los niveles?), `pwa.test.cjs`
  (navegador real: SW, offline, paridad de física, persistencia).
- `tools/trace.cjs` — dibuja una sala y el camino del bot en la terminal.
  **Es la herramienta de diseño de niveles.**
- `tools/star-spots.cjs` — prueba posiciones para la estrella de un nivel.
- `tools/make-icons.py` — genera los PNG de los iconos (sin dependencias).

## Mapa del código dentro de `juego/index.html`

Secciones marcadas con `// ===== js/<nombre>.js =====`. **Buscá esos
marcadores**, no los números de línea:

```bash
grep -n "===== js/" juego/index.html
```

| Sección | De qué se ocupa |
|---|---|
| `js/const.js` | Tamaño de sala/tile, **`PHY`** (todas las constantes de física), colores, claves de `localStorage` |
| `js/save.js` | Progreso (`SAVE`) y opciones (`OPTS`) en `localStorage`, con validación de lo que se lee |
| `js/audio.js` | Sonido sintetizado con WebAudio (cero archivos) |
| `js/input.js` | **Un solo mando virtual** para teclado + gamepad + táctil (`pollInput()` → `IN`) |
| `js/physics.js` | **El núcleo.** `parseLevel`, `newWorld`, `stepWorld`, `cloneWorld`. Sin DOM y sin `Math.random` |
| `js/levels.js` | Los 15 niveles en ASCII + `LEVELS`/`ABIL` (qué habilidad abre cada mundo) |
| `js/fx.js` | Partículas y sacudida (adorno; acá SÍ hay `Math.random`) |
| `js/render.js` | `layout()` (canvas, orientación, controles) y el dibujo de la sala |
| `js/ghost.js` | Grabar/reproducir la mejor vuelta |
| `js/game.js` | Máquina de estados, bucle de paso fijo, HUD, resultado |
| `js/ui.js` | Pantallas: menú, niveles, opciones, estadísticas, pausa, habilidad nueva |
| `js/core.js` | Arranque y registro del Service Worker |

## Reglas que NO se negocian

- **Paso fijo de 1/60 s.** `stepWorld` avanza siempre 1/60; el bucle acumula
  el tiempo real y da los pasos que hagan falta. **Nunca** meter delta-time
  variable en la física: un juego de precisión que no es repetible es un
  juego injusto (y el fantasma pasaría a mentir).
- **`js/physics.js` no toca el DOM ni usa `Math.random`.** Lo que la física
  quiere avisar lo deja en `w.events` (`jump`, `land`, `dash`, `die`,
  `goal`…); el sonido, las partículas y la vibración los maneja
  `handleEvents()`. Si esto se rompe, se cae el test del bot.
- **Todo estado del mundo tiene que ser clonable barato** (`cloneWorld`):
  arrays tipados + un objeto de jugador. Las plataformas móviles y las
  sierras son **funciones del tiempo** (`pathPos`), no estados acumulados,
  justamente por esto.
- **La sensación de mejora es la función del juego.** Antes de agregar algo,
  la pregunta es: *¿esto ayuda a que la persona note que mejoró?* El
  cronómetro, el fantasma, las medallas y el reintento instantáneo (sin
  castigo) están para eso. Nada de vidas, nada de penalizar la muerte.
- **Los controles táctiles son ciudadanos de primera.** Si un truco no se
  puede hacer con el pulgar, no va. El joystick es **digital de 8
  direcciones** a propósito: un analógico a medias arruina los saltos cortos.

## Cómo se diseñan y validan los niveles

Un nivel es una sala de 30x17 tiles: 15 filas de 28 caracteres (el marco lo
pone `parseLevel`). Leyenda: `#` pared, `^v<>` pinches, `=` plataforma
atravesable, `s` resorte, `c` bloque frágil, `o` cristal de dash, `*`
estrella, `P` inicio, `G` meta. Las plataformas móviles y las sierras van
aparte, en `movers`/`saws`, en coordenadas de tile.

**El error más caro es publicar un nivel imposible.** Por eso hay un bot:

```bash
node test/solver.test.cjs            # los 15 niveles (meta + estrella)
node test/solver.test.cjs 12         # uno solo
node test/solver.test.cjs --rapido   # saltea la pasada de estrellas (más rápido)
node test/solver.test.cjs --par      # + sugerencia de tiempos de medalla
node tools/trace.cjs 12              # dibuja la sala y el camino del bot
node tools/trace.cjs --all           # todos los mapas
node tools/star-spots.cjs 8 20,1 6,6 # prueba dónde poner la estrella
```

El test hace **dos pasadas por nivel**: llegar a la meta, y llegar a la meta
**con la estrella**. La segunda existe porque una estrella que no se puede
juntar es una promesa rota que no se detecta jugando: se ve, se intenta
veinte veces y no está.

**Ojo con las estrellas:** que se puedan TOCAR no alcanza. El error típico es
ponerlas colgadas sobre los pinchos: el jugador la toca... y se muere, o
queda sin lugar donde caer. La estrella tiene que estar donde se pueda
juntar **y seguir vivo hasta la meta** — eso es lo que mide
`tools/star-spots.cjs`, y por eso el bot es el que decide, no el ojo.

Como las salas son de una pantalla, el camino óptimo del bot barre casi todo
el aire: el "desvío en segundos" que informa la herramienta casi siempre da
cero y **no mide la dificultad para una persona**. Lo que hace buena a una
estrella es estar fuera de la línea obvia (un tile o dos más arriba del arco
natural, o cerca de los pinchos); el bot solo certifica que es posible.

El bot juega con **las mismas entradas que una persona** y busca en anchura;
cuando encuentra un camino lo **vuelve a jugar desde cero** para confirmar.
Si dice `SIN SALIDA`, `tools/trace.cjs` muestra con `˙` hasta dónde llega —
casi siempre el problema es el mismo: **una pared que llega hasta el piso
deja un sector inalcanzable**, o un salto de más de 3 tiles de alto.

Números útiles para diseñar (salen de `PHY`):

| Movimiento | Alcance |
|---|---|
| Salto parado | ~52 px = **3,2 tiles** de alto |
| Salto corriendo | ~**6 tiles** de largo (a la misma altura) |
| Salto de pared | ~2,8 tiles de alto por rebote |
| Dash | ~3,5 tiles (+ lo que ya traías) |
| Salto + dash | ~**9 tiles** de largo, ~6,7 de alto |
| Resorte | ~6 tiles de alto |

Regla práctica: escalones de **2 tiles** son cómodos, de **3** son al límite
(precisión), de **4 o más** son imposibles sin pared/dash/resorte.

**Medallas:** el bot es más rápido que cualquier persona, así que su tiempo
es el *piso*, no el oro. `--par` propone `oro = bot*2 + 0,5`,
`plata = bot*2,8 + 1`, `bronce = bot*4 + 3`; en los niveles donde el bot es
inhumano (cadenas de rebotes, esperar el ritmo de una sierra) los tiempos
están subidos a mano. El test **falla** si un bronce quedó por debajo del
tiempo del bot.

## Cómo verificar cambios

```bash
# 1) Sintaxis del <script> inline
python3 - <<'PY'
import re, subprocess, sys
html = open('juego/index.html', encoding='utf-8').read()
js = "\n;\n".join(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.S))
open('/tmp/filo_check.js','w',encoding='utf-8').write(js)
sys.exit(subprocess.run(['node','--check','/tmp/filo_check.js']).returncode)
PY

# 2) Los 15 niveles siguen siendo terminables (obligatorio si tocaste PHY o niveles)
node test/solver.test.cjs

# 3) Navegador real: SW, offline, paridad de física node↔navegador, persistencia
NODE_PATH=/opt/node22/lib/node_modules node test/pwa.test.cjs
```

**Si tocás una constante de `PHY`, corré el solver.** Bajar el salto 10 px
puede volver imposible un nivel del mundo 1 sin que se note jugando el 1.

## Deploy

Assets estáticos en Cloudflare (`wrangler.jsonc`, `assets.directory: "."`).
El juego se sirve en **`/juego/`**; la raíz del sitio es el curso.
**Mergear a `main` y listo**, Cloudflare despliega solo. La conexión del repo
con Cloudflare es un paso de una sola vez y está documentada en el README
("Publicar").

Al publicar, **subir `CACHE` en `juego/sw.js`** (`filo-vN`). Acá no es tan grave
como en otras apps —el HTML va network-first y el juego entero ES el HTML—
pero sin bump la cache vieja sigue sirviendo iconos y manifest.

Antes de mergear: sintaxis + `node test/solver.test.cjs` (obligatorio si
tocaste `PHY` o niveles) + `test/pwa.test.cjs`.

## Cosas que NO romper

- No pasar el JS a módulos ES.
- No meter DOM ni `Math.random` en `js/physics.js`.
- No cambiar las claves de `localStorage` (`LS`): se pierden récords y
  fantasmas ajenos.
- No olvidar subir `CACHE` en `juego/sw.js` al publicar.
- No penalizar la muerte (ni vidas, ni esperas, ni cortes): reintentar tiene
  que ser instantáneo.

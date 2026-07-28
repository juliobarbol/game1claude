# FILO — Guía del proyecto (para Claude Code)

> Juego de **plataformas de precisión** (PWA, se juega en el celu y en la
> compu). Esta guía es el mapa: leela antes de tocar el `index.html`.

## Qué es

Un plataformero de precisión al estilo Celeste / Super Meat Boy, en chiquito:
salas de una pantalla, muerte instantánea, reintento inmediato, cronómetro,
**fantasma de tu mejor vuelta** y medallas por tiempo. La gracia no es
terminarlo: es **sentir que la mano te mejora**. Todo el diseño está al
servicio de eso.

- 4 mundos que abren una habilidad cada uno: **salto** (1-5), **salto de
  pared** (6-10), **dash** (11-15), **gravedad invertible** (16-20)… y un
  **mundo 5 (21-25)** que no abre nada: pide las cuatro en la misma vuelta.
  **En construcción: hoy va solo el 21.**
- Se juega con teclado, con joystick/gamepad y **con los dedos** (joystick
  flotante + botones).
- Sin cuentas: el progreso vive en `localStorage`. Hay **una** cosa en la
  nube —la tabla de récords compartida (Supabase)— y es estrictamente
  opcional: sin nombre puesto o sin internet, el juego anda igual.
- Además del juego suelto hay **maratón** (un mundo o el juego entero de un
  tirón, con parciales, en dos relojes: normal y **extremo**) y **espejo**
  (las salas dadas vuelta).

## Arquitectura (importante)

- **Sin build, sin frameworks: JavaScript vanilla.** Todo el juego (HTML +
  CSS + JS) está en **un único `index.html`**. Es deliberado: un archivo,
  deploy trivial, offline gratis.
- El JS está en **un solo `<script>` en ámbito global** (las funciones se
  llaman entre sí y algunas se usan desde `onclick`/tests). **No pasarlo a
  módulos ES.**
- Se publica como assets estáticos en **Cloudflare** (`wrangler.jsonc`).

## Estructura de archivos

- `index.html` — **todo el juego** (markup + `<style>` + `<script>`).
- `sw.js` — Service Worker (offline). **`CACHE` actual: `filo-v11`**.
- `manifest.webmanifest`, `icon-*.png` — PWA (instalación, iconos).
- `test/` — `_load.cjs` (carga el juego en node), `_bot.cjs` (el bot),
  `solver.test.cjs` (¿se pueden terminar los niveles?), `pwa.test.cjs`
  (navegador real: SW, offline, paridad de física, persistencia),
  `modos.test.cjs` (maratón, espejo y tabla, también en navegador),
  `fisica.test.cjs` (los números de `PHY` medidos con regla, sin niveles).
- `tools/trace.cjs` — dibuja una sala y el camino del bot en la terminal.
  **Es la herramienta de diseño de niveles.**
- `tools/star-spots.cjs` — prueba posiciones para la estrella de un nivel.
- `tools/make-icons.py` — genera los PNG de los iconos (sin dependencias).
- `docs/encadenado.md` — nota de diseño de niveles largos por tramos
  encadenados: aplicada al mundo 4, pendiente en los mundos 1-3. **Leer
  antes de tocar niveles**; ahí están también los atajos que aparecieron.

## Mapa del código dentro de `index.html`

Secciones marcadas con `// ===== js/<nombre>.js =====`. **Buscá esos
marcadores**, no los números de línea:

```bash
grep -n "===== js/" index.html
```

| Sección | De qué se ocupa |
|---|---|
| `js/const.js` | Tamaño de sala/tile, **`PHY`** (todas las constantes de física), colores, claves de `localStorage` |
| `js/save.js` | Progreso (`SAVE`) y opciones (`OPTS`) en `localStorage`, con validación de lo que se lee |
| `js/audio.js` | Sonido sintetizado con WebAudio (cero archivos) |
| `js/input.js` | **Un solo mando virtual** para teclado + gamepad + táctil (`pollInput()` → `IN`) |
| `js/physics.js` | **El núcleo.** `parseLevel`, `newWorld`, `stepWorld`, `cloneWorld`. Sin DOM y sin `Math.random` |
| `js/levels.js` | Los niveles en ASCII + `LEVELS`/`ABIL` (qué habilidad abre cada mundo) |
| `js/fx.js` | Partículas y sacudida (adorno; acá SÍ hay `Math.random`) |
| `js/render.js` | `layout()` (canvas, orientación, controles) y el dibujo de la sala |
| `js/ghost.js` | Grabar/reproducir la mejor vuelta (la tuya y la del récord de la tabla) |
| `js/net.js` | Tabla de récords en Supabase (REST + realtime a mano). **Todo opcional y no bloqueante** |
| `js/game.js` | Máquina de estados, bucle de paso fijo, HUD, resultado |
| `js/ui.js` | Pantallas: menú, niveles, opciones, estadísticas, pausa, habilidad nueva |
| `js/core.js` | Arranque y registro del Service Worker |

## Reglas que NO se negocian

- **El cronómetro arranca con el primer movimiento, no al aparecer.**
  `w.started` se prende con la primera entrada (`inp.x`, salto o dash) y
  recién ahí corre `w.timer`. Podés mirar la sala y leer el ritmo de una
  sierra sin que te cueste tiempo; una vez que arrancaste, el reloj no para
  hasta la meta. El fantasma se graba con ese mismo reloj (si no, se
  desincroniza del cronómetro).
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
- **La red nunca puede hacer falta.** La tabla de récords es una vidriera:
  todo lo que la toca va dentro de `try/catch`, no hay `await` en el camino
  de jugar, y sin nombre puesto ni siquiera se intenta. Si Supabase se cae,
  el juego no se entera. El guardado de verdad sigue siendo `localStorage`.
  El fantasma del récord se pide **sin `await`** al entrar al nivel: si llega,
  aparece; si no, no pasa nada.
- **Las pantallas se centran con `justify-content:safe center`, no con
  `center`.** Un flex centrado que desborda se derrama por ARRIBA y esa parte
  no se alcanza ni con scroll. En un celu apaisado —que es como se juega— eso
  dejaba media pantalla de Opciones y de Maratón fuera de alcance. **Pantalla
  nueva: probala a 844x390**, no solo en escritorio.
- **El espejo tiene sus propios récords** (clave con `'m'` pegada, ver
  `modeSuf()`). Son dos juegos distintos: si compartieran casillero, el
  récord de un lado borraría el del otro y ninguno significaría nada. El
  desbloqueo de niveles, en cambio, se mira siempre contra el juego normal.
- **Los dos relojes del maratón miden cosas distintas** y por eso van a
  casilleros distintos (`runKey()` le pega una `'x'` al extremo). El normal
  suma pasos de física mientras jugás; el **extremo** es tiempo real desde
  que aparece la primera sala hasta que tocás la última bandera, y cuenta
  también lo que tardás en leer el nivel, el respiro entre uno y otro y la
  pausa. No mezclarlos: un tiempo extremo siempre es peor que el normal de
  la misma vuelta, así que compararlos no querría decir nada.

## Cómo se diseñan y validan los niveles

Un nivel es una sala de 30x17 tiles: 15 filas de 28 caracteres (el marco lo
pone `parseLevel`). Leyenda: `#` pared, `^v<>` pinches, `=` plataforma
atravesable, `s` resorte, `c` bloque frágil, `o` cristal de dash, `u`/`d`
baldosa de gravedad (arriba/abajo), `*` estrella, `P` inicio, `G` meta. Las
plataformas móviles y las sierras van aparte, en `movers`/`saws`, en
coordenadas de tile. `gravInicial:-1` arranca el nivel cabeza abajo.

### Gravedad invertible (mundo 4)

`w.grav` (1 abajo · -1 arriba) es **estado del mundo**, no una variable
global: se clona, el bot lo ve y el fantasma lo graba. En la física, todo lo
vertical se mide contra `gv = w.grav` — `p.vy*gv > 0` es "cayendo" y
`p.vy*gv < 0` es "subiendo"; el salto es `-PHY.JUMP*gv`, el piso se busca en
`p.y + gv` y la corrección de esquina se aplica del lado contra el que caés.
**Si agregás algo vertical, escribilo relativo a `gv` o se rompe cabeza
abajo.**

Las baldosas **fijan** la gravedad (no la alternan): tocar dos veces la misma
no hace nada. Es a propósito — un interruptor que alterna obliga a recordar
por dónde pasaste, y este juego se tiene que poder leer de un vistazo.

Reglas de diseño que salieron de mirar al bot:

- **Los pinchos no obligan a nada.** La primera versión de "Ida y vuelta"
  tenía pinchos en el piso y en el techo, y el bot los saltó a todos sin dar
  vuelta la gravedad ni una vez: un salto cruza 6 tiles. Lo que obliga a
  cambiar de lado es la GEOMETRÍA: una **valla** que sube del piso (≥7 tiles,
  no se cruza ni con salto+dash) o una **estalactita** que baja del techo,
  dejando libre solo el otro lado de la sala.
- **Las baldosas van a 2 tiles de la superficie** (`y10` desde el piso, `y5`
  desde el techo). A 1 tile las tocás caminando —sin querer— y a 4 no las
  alcanzás saltando.
- **Un techo macizo no es un nivel: es un pasillo.** La primera versión del
  mundo 4 era fácil porque equivocarse no costaba nada — piso y techo
  enteros, sin pozos. Lo que castiga el error del lado de arriba es un
  **agujero en el techo con pinchos (`v`) en la fila de encima**: caminando
  invertido, el hueco te chupa hacia arriba y te ensarta, igual que un pozo
  abajo. Un techo de bloques frágiles (nivel 20) hace lo mismo, pero pidiendo
  además que no frenes.
- **El borde de la sala también es piso cuando estás invertido.** Si el techo
  del nivel es el marco (y no una fila propia), el jugador puede caminar toda
  la sala colgado y saltearse el recorrido: el bot lo encontró en el nivel 20.
  O se llena esa franja de pinchos, o el techo tiene que ser una fila con
  agujeros.
- **La baldosa `u` va pegada al techo, no al piso.** Si el vuelco te agarra
  ocho tiles abajo, subís en DIAGONAL: con el envión que traías más un dash
  cruzás la sala entera sin pisar el techo ni una vez, y el tramo de arriba
  desaparece. La baldosa tiene que estar a un tile o dos del techo, y para
  llegar hasta ahí se sube por otro lado (escalones, chimenea).

### Los cuatro atajos que encontró el bot

Todos salieron de mirar `tools/trace.cjs` mientras se encadenaban los tramos.
Ninguno se ve leyendo el mapa; los cuatro convertían un nivel de tres tramos
en uno de medio:

1. **El sótano.** Un piso agujereado con espacio libre abajo es un pasillo:
   te caés por un agujero, dasheás por debajo y salís por el otro. Los
   pinchos van **pegados abajo del piso** (la fila de inmediatamente
   después), no al fondo de la sala.
2. **La trepada de 9 tiles.** Un salto de pared más un dash suben nueve tiles
   contra una pared sola —el marco de la sala cuenta como pared—. Una meta
   colgada del techo a menos de eso de una pared se toca desde el arranque.
   O se la aleja, o la pared muerde (`>`/`<` en la columna del marco).
3. **Bajar por la pared, cabeza abajo.** Invertido, el salto de pared empuja
   hacia abajo de la pantalla: se BAJA por una pared igual que se sube. Una
   meta al pie de un muro es alcanzable desde arriba del muro.
4. …pero **de costado no se camina**. Con la gravedad tirando para arriba, el
   piso solo se toca de paso: un dash da 3,5 tiles y después te chupa. Por eso
   una meta en el MEDIO del piso, a cinco o más tiles de las dos paredes, es
   inalcanzable hasta que des vuelta la gravedad. Es la forma más barata de
   cerrar los atajos 2 y 3.

**El espejo NO sale gratis.** La física es casi simétrica, pero la corrección
de esquina prueba primero hacia la derecha (`for (const sg of [1, -1])`), así
que un aterrizaje al límite tiene un empujoncito que te mete en la repisa
yendo hacia la derecha y te tira afuera yendo hacia la izquierda. El nivel 4
salía normal y era **imposible** espejado por exactamente eso; se arregló
dándole dos tiles de margen a la repisa, no tocando la física. **Un nivel
nuevo hay que pasarlo por el solver de los dos lados.**

**El error más caro es publicar un nivel imposible.** Por eso hay un bot:

```bash
node test/solver.test.cjs            # todos los niveles (meta + estrella)
node test/solver.test.cjs --espejo   # lo mismo, con las salas dadas vuelta
node test/solver.test.cjs 12         # uno solo
node test/solver.test.cjs --rapido   # saltea la pasada de estrellas (más rápido)
node test/solver.test.cjs --par      # + sugerencia de tiempos de medalla
node tools/trace.cjs 12              # dibuja la sala y el camino del bot
node tools/trace.cjs 12 --espejo     # …la misma sala, espejada
node tools/trace.cjs --all           # todos los mapas
node tools/star-spots.cjs 8 20,1 6,6 # prueba dónde poner la estrella
```

El test hace **dos pasadas por nivel**: llegar a la meta, y llegar a la meta
**con la estrella**. La corrida completa lleva ~30 s por nivel (la
segunda pasada es la cara); para iterar, `--rapido` o un nivel suelto. La
segunda existe porque una estrella que no se puede juntar es una promesa rota
que no se detecta jugando: se ve, se intenta veinte veces y no está.

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

**Cómo aguanta los niveles largos.** La anchura pura crece exponencialmente
con la duración: el nivel 17, de 3,13 s, gastaba 889k estados de los 900k de
presupuesto, así que un nivel encadenado habría fallado por quedarse sin aire,
no por imposible. Dos cambios en `test/_bot.cjs` lo arreglan:

- no se prueban las acciones con **dash cuando el dash no está disponible**
  (apretarlo sin tenerlo no cambia nada que la clave de poda mire);
- el frente se recorta a un **haz** (`ANCHO`) con los mejores estados según
  la distancia a la meta, medida **inundando la sala por tiles** — así una
  valla o un pozo cuestan lo que cuestan y no se poda el frente que va bien.

El haz hace la búsqueda **incompleta**: un "no encontré" ya no prueba que el
nivel sea imposible. Por eso el solver reintenta con el haz más abierto y,
al final, con anchura pura, y avisa (`haz x4`) cuándo hizo falta. Si un nivel
solo sale con el haz abierto, el camino es sospechosamente fino.

Números útiles para diseñar (salen de `PHY`):

| Movimiento | Alcance |
|---|---|
| Salto parado | ~52 px = **3,2 tiles** de alto |
| Salto corriendo | ~**6 tiles** de largo (a la misma altura) |
| Salto de pared | ~2,8 tiles de alto por rebote |
| Dash | ~3,5 tiles (+ lo que ya traías) |
| Salto + dash | ~**9 tiles** de largo, ~6,7 de alto |
| Resorte | ~6 tiles de alto |
| **Impulso** | ~**9,7 tiles** de largo, solo ~1,4 de alto |

(Con la gravedad invertida son los mismos números, para el otro lado.)

Regla práctica: escalones de **2 tiles** son cómodos, de **3** son al límite
(precisión), de **4 o más** son imposibles sin pared/dash/resorte.

### El impulso (el techo del juego)

Tocar el piso **en pleno dash** con el salto ya apretado no apaga el dash: lo
convierte en un salto largo y **bajo** que te deja a `IMP_X` (300 px/s contra
los 170 de correr), y ese sobrante se gasta despacio (`OVER_DEC`) en vez de
evaporarse. Hay que apretar dentro de la ventana del buffer (8 cuadros), así
que no sale sin querer.

Existe para que **suba el techo sin que suba el piso**: quien no lo conoce
juega igual que siempre y termina todos los niveles; quien lo practica saca
segundos. Por eso el salto del impulso es más BAJO que el normal — si fuera
igual de alto sería un salto mejor en todo, y no una elección.

Al diseñar: un pasillo bajo y largo es donde el impulso brilla; una repisa
alta lo anula. Si querés que un tramo NO se pueda impulsar, ponele techo.

**Largo de un nivel:** lo que sube la dificultad en este género no es el
movimiento más difícil sino el **largo de la cadena que hay que ejecutar sin
errar**. El mundo 4 (16-20) ya está rehecho así: dos o tres tramos por sala,
usando la sala en varias direcciones en vez de ir siempre de izquierda a
derecha. Los mundos 1-3 siguen siendo casi todos de un tramo y les cabe la
misma revisión. El razonamiento, los límites y lo que se aprendió están en
`docs/encadenado.md`.

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
html = open('index.html', encoding='utf-8').read()
js = "\n;\n".join(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.S))
open('/tmp/filo_check.js','w',encoding='utf-8').write(js)
sys.exit(subprocess.run(['node','--check','/tmp/filo_check.js']).returncode)
PY

# 2) Todos los niveles siguen siendo terminables (obligatorio si tocaste PHY o niveles)
node test/solver.test.cjs

# 3) Navegador real: SW, offline, paridad de física node↔navegador, persistencia
NODE_PATH=/opt/node22/lib/node_modules node test/pwa.test.cjs

# 4) Maratón, espejo y tabla (obligatorio si tocaste modos, guardado o red)
NODE_PATH=/opt/node22/lib/node_modules node test/modos.test.cjs

# 5) Si tocaste niveles o PHY, el solver TAMBIÉN espejado
node test/solver.test.cjs --espejo

# 6) La física mide lo que dice (obligatorio si tocaste PHY o stepWorld)
node test/fisica.test.cjs
```

**Si tocás una constante de `PHY`, corré el solver.** Bajar el salto 10 px
puede volver imposible un nivel del mundo 1 sin que se note jugando el 1.

## Deploy

Assets estáticos en Cloudflare (`wrangler.jsonc`, `assets.directory: "."`):
**mergear a `main` y listo**, Cloudflare despliega solo. La conexión del repo
con Cloudflare es un paso de una sola vez y está documentada en el README
("Publicar").

Al publicar, **subir `CACHE` en `sw.js`** (`filo-vN`). Acá no es tan grave
como en otras apps —el HTML va network-first y el juego entero ES el HTML—
pero sin bump la cache vieja sigue sirviendo iconos y manifest.

Antes de mergear: sintaxis + `node test/solver.test.cjs` (obligatorio si
tocaste `PHY` o niveles) + `test/pwa.test.cjs`.

## Cosas que NO romper

- No pasar el JS a módulos ES.
- No meter DOM ni `Math.random` en `js/physics.js`.
- No cambiar las claves de `localStorage` (`LS`): se pierden récords y
  fantasmas ajenos.
- No poner la red en el camino de jugar (ni un `await`, ni un spinner que
  frene un nivel). Y no meter la clave de servicio de Supabase en el HTML:
  la que va es la **publicable**, y la tabla se defiende con RLS + la función
  `enviar_record`, que es el único camino de escritura.
- No olvidar subir `CACHE` en `sw.js` al publicar.
- No penalizar la muerte (ni vidas, ni esperas, ni cortes): reintentar tiene
  que ser instantáneo.

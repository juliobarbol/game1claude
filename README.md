# FILO

**Plataformas de precisión.** Un juego chico y difícil: salas de una
pantalla, muerte instantánea, reintento inmediato y un cronómetro que no
perdona. Se juega en el celular y en la computadora, y anda **sin internet**.

No hay vidas ni castigo por morir. Se muere para aprender. Lo que el juego
mide es **cuánto mejoró tu mano**: cada nivel guarda tu mejor vuelta y la
vuelve a correr al lado tuyo como un fantasma. Cuando lo pasás, hiciste un
récord.

## Cómo se juega

| | Teclado | Celular | Joystick |
|---|---|---|---|
| Moverse | `←` `→` (o `A` `D`) | joystick izquierdo | palanca / cruceta |
| Apuntar el dash | `↑` `↓` (o `W` `S`) | joystick | palanca |
| Saltar | `Espacio`, `Z`, `K` | botón **SALTO** | A |
| Dash | `X`, `L`, `Shift` | botón **DASH** | B / gatillos |
| Reintentar | `R` | ↺ arriba | |
| Pausa | `Esc` / `P` | ❚❚ arriba | Start |

**Salto de pared:** en el aire, contra una pared, mantené apretada la
dirección de la pared y saltá.

**Impulso:** dasheá en diagonal contra el piso y apretá salto **justo** al
tocar. El dash no se apaga: se convierte en un salto largo y bajo que te deja
más rápido que corriendo. Se puede terminar el juego entero sin saberlo —
está para que el que practica pueda bajar sus récords. Cuando sale, suena
distinto.

## Los mundos

1. **Suelo** (1-5): solo salto. Medir la distancia, soltar el salto antes
   para saltar más bajo, bloques que se caen.
2. **Paredes** (6-10): salto de pared. Subir rebotando, chimeneas con
   pinchos.
3. **Dash** (11-15): un envión en la dirección que apuntás, que se recarga al
   tocar piso o un cristal.
4. **Gravedad** (16-20): las baldosas violetas dan vuelta la gravedad y el
   techo pasa a ser el piso. Saltar, rebotar y dashear funcionan igual… para
   el otro lado.
5. **Todo** (21-): no enseña nada nuevo. Pide las cuatro cosas en la misma
   vuelta, y ninguna es opcional. *En construcción.*

Cada nivel tiene tres tiempos: 🥇 🥈 🥉. El oro es exigente a propósito. Y hay
una **estrella** escondida en cada sala, para el que quiera más.

## Los otros modos

**Maratón.** Un mundo entero —o el juego completo— de un tirón, con un
cronómetro solo y sin apretar nada entre nivel y nivel. Al pasar cada uno te
dice cuánto vas adelante o atrás de tu mejor maratón. En los dos modos el
reloj **no se reinicia al morir**: reintentar sigue siendo instantáneo, pero
cuesta tiempo. Y hay dos relojes:

- **Normal:** suma el tiempo que estuviste jugando. Arranca con tu primer
  movimiento y la pausa lo frena, así que mirar cada sala sale gratis.
- **Extremo:** cronómetro de pared. Arranca cuando aparece la primera sala y
  para cuando tocás la última bandera. Cuenta todo —leer el nivel, el
  respiro entre uno y otro, la pausa—. No hay nada gratis.

**Espejo.** Las mismas salas dadas vuelta. No es contenido nuevo: es el mismo
nivel con las manos cambiadas, que es justo lo que el juego mide. Tiene sus
propios récords.

**Tabla.** Si le ponés un nombre en Opciones, tus récords aparecen en una
tabla compartida que se actualiza sola. Es opcional de punta a punta: sin
nombre o sin internet, el juego anda exactamente igual y tu progreso sigue
guardado en el aparato.

**Fantasma de la tabla.** Con el récord viaja también la vuelta grabada, así
que al entrar a un nivel corrés al lado del que está primero — en celeste, el
tuyo en blanco. Una tabla de números no te dice nada sobre *cómo*; el
fantasma sí.

**Dónde moriste.** Antes de arrancar, la sala se pinta con las casillas donde
te viene comiendo la vuelta. Se apaga sola en cuanto te movés: es para leer
el nivel, no para jugarlo.

## Instalarlo

Es una PWA: entrás con el navegador y le das "Agregar a la pantalla de
inicio". Queda como una app, abre a pantalla completa y funciona en modo
avión. El progreso se guarda en el aparato (no hay cuentas ni servidor).

## Publicar

Se sirve como assets estáticos en **Cloudflare** desde este repo: **todo lo
que llega a `main` se publica solo**, sin build ni pasos manuales.

Configuración por única vez (desde el panel de Cloudflare, con la cuenta de
Julio):

1. **Workers & Pages → Create → Workers → Import a repository** y elegir
   `juliobarbol/game1claude`.
2. Rama de producción: `main`. Build command: **vacío**. Directorio raíz: `/`.
   Cloudflare lee `wrangler.jsonc` y sirve la carpeta tal cual.
3. Queda en `https://filo.<cuenta>.workers.dev` (o el dominio que se le
   ponga).

Desde ahí, cada merge a `main` despliega. Los que ya tengan el juego
instalado reciben la versión nueva la próxima vez que lo abran con conexión:
el Service Worker pide el HTML a la red primero, y el juego entero ES el
HTML. Igual, al publicar conviene subir `CACHE` en `sw.js` (`filo-v1` →
`filo-v2`) para que se limpie la cache vieja de iconos y manifest.

## Para desarrollar

Todo el juego está en `index.html` (sin build, sin dependencias, JS vanilla).
Para probarlo alcanza con abrir el archivo en el navegador.

```bash
node test/solver.test.cjs         # un bot juega todos los niveles y demuestra que se terminan
node test/solver.test.cjs --espejo   # lo mismo con las salas dadas vuelta
node tools/trace.cjs 12           # dibuja una sala y el camino del bot (diseño de niveles)
NODE_PATH=/opt/node22/lib/node_modules node test/pwa.test.cjs     # navegador real
NODE_PATH=/opt/node22/lib/node_modules node test/modos.test.cjs   # maratón, espejo y tabla
```

La tabla de récords vive en un proyecto de **Supabase** (`filo`). El esquema
es una tabla y una función; se aplicó con migraciones y está comentado en el
propio SQL. El HTML solo lleva la clave **publicable**: escribir se puede
únicamente a través de `enviar_record`, que deja mejorar tu propia fila y
nada más.

El detalle de cómo está armado, cómo se diseñan los niveles y qué no hay que
romper está en [`CLAUDE.md`](CLAUDE.md).

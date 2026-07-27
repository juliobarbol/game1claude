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

## Los tres mundos

1. **Suelo** (1-5): solo salto. Medir la distancia, soltar el salto antes
   para saltar más bajo, bloques que se caen.
2. **Paredes** (6-10): salto de pared. Subir rebotando, chimeneas con
   pinchos.
3. **Dash** (11-15): un envión en la dirección que apuntás, que se recarga al
   tocar piso o un cristal.

Cada nivel tiene tres tiempos: 🥇 🥈 🥉. El oro es exigente a propósito. Y hay
una **estrella** escondida en cada sala, para el que quiera más.

## Instalarlo

Es una PWA: entrás con el navegador y le das "Agregar a la pantalla de
inicio". Queda como una app, abre a pantalla completa y funciona en modo
avión. El progreso se guarda en el aparato (no hay cuentas ni servidor).

## Para desarrollar

Todo el juego está en `index.html` (sin build, sin dependencias, JS vanilla).
Para probarlo alcanza con abrir el archivo en el navegador.

```bash
node test/solver.test.cjs      # un bot juega los 15 niveles y demuestra que se terminan
node tools/trace.cjs 12        # dibuja una sala y el camino del bot (diseño de niveles)
NODE_PATH=/opt/node22/lib/node_modules node test/pwa.test.cjs   # navegador real
```

El detalle de cómo está armado, cómo se diseñan los niveles y qué no hay que
romper está en [`CLAUDE.md`](CLAUDE.md).

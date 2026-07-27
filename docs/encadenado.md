# Nota de diseño — encadenar tramos

> Estado: **aplicado al mundo 4 (niveles 16-20)**. Charlado con Julio el
> 2026-07-27 después de jugar el mundo recién publicado; rehecho el mismo día.
> Los mundos 1-3 siguen pendientes.

## El problema

Julio jugó los cinco niveles del mundo 4 y el veredicto fue "súper fáciles".
La primera tanda de arreglos (pozos en el techo, pinchos en la superficie
invertida, techo de bloques frágiles) subió el **riesgo**, y eso ayudó. Pero
quedaba un problema de fondo que el riesgo no arregla:

**Cada nivel era UN SOLO TRAMO.** Una idea, ejecutada una vez, y listo. El 20
era "cruzá el techo frágil → date vuelta → dasheá al piso → meta": dos
segundos de bot, seis u ocho de una persona. Como es un tramo solo, cuando
entendés qué hay que hacer lo sacás en pocos intentos y el nivel se terminó.

En este género la dificultad NO es lo difícil que sea el movimiento más
difícil: es **el largo de la cadena que tenés que ejecutar sin equivocarte**.

## La idea

Meter **dos o tres desafíos distintos en la misma sala**, sin descanso entre
uno y otro. La sala sigue siendo de una pantalla: encadenar no es agrandarla,
es usarla en varias direcciones (bajar, cruzar, volver a subir) en vez de ir
siempre de izquierda a derecha.

## Por qué funciona

Si cada tramo lo sacás 1 de cada 2 veces, hacer los cuatro seguidos sale 1 de
cada 16. El nivel se vuelve difícil **por acumulación**, no porque tenga un
salto imposible.

Y es exactamente la dificultad que le sirve a este juego: morís en el tramo 3,
volvés al 1 — y descubrís que el 1 y el 2 ahora te salen sin pensar. Esa es la
sensación de "mejoré" que el juego promete (cronómetro, fantasma, medallas) y
que antes no terminaba de entregar, porque los niveles se acababan antes de
que llegaras a automatizar nada.

## Cómo quedó el mundo 4

| # | Nombre | Tramos | Bot |
|---|---|---|---|
| 16 | Al revés | escalera hasta la baldosa · techo entero con tres pozos · caída dirigida a la repisa | ~3,0 s |
| 17 | Ida y vuelta | (ya venía de dos tramos: vallas abajo, pozos arriba) | ~3,1 s |
| 18 | Colgado | piso izquierdo · techo cruzando el muro · piso derecho de vuelta | ~2,9 s |
| 19 | Doble filo | hueco del piso con salto+dash · hueco del techo con dos dashes y el cristal · pinchos colgantes hasta la meta | ~3,9 s |
| 20 | Cabeza abajo | carrera de frágiles en el techo · vuelco y caída dirigida · la misma carrera de frágiles en el piso | ~3,3 s |

El bot es más rápido que cualquier persona: multiplicá por tres para tener la
vuelta humana. Quedaron en 9-12 s, dentro de la ventana que buscábamos.

## Los límites (esto es lo que hay que cuidar)

- **Duración objetivo: 8 a 15 segundos de vuelta humana.** Como no hay puntos
  de control, cada muerte en el último tramo te hace rehacer todo. El género
  lo banca (Super Meat Boy son niveles de 5 a 20 s), pero pasado ese rango
  cansa en vez de enganchar. Si un nivel pide más, se parte en dos niveles.
- **No penalizar la muerte de ninguna otra forma.** El reintento sigue siendo
  instantáneo: la repetición del tramo fácil es el precio, y tiene que ser
  barata.
- **Recalibrar las medallas** con `node test/solver.test.cjs --par`. Los
  tiempos viejos quedan cortos apenas el nivel se hace más largo.

## Lo que costó de verdad: el bot

El límite real no fue el diseño, fue **verificar**. La búsqueda en anchura
crece exponencialmente con la duración del nivel, y el 17 —de 3,13 s— ya
gastaba 889k estados de los 900k de presupuesto. Un nivel encadenado habría
dado `SIN SALIDA` por quedarse sin aire, no por imposible.

`test/_bot.cjs` cambió en dos cosas: no prueba las acciones con dash cuando el
dash no está disponible (son estados que se descartaban igual, pero recién
después de simularlos), y recorta el frente a un **haz** guiado por la
distancia a la meta inundando la sala por tiles. Los mismos niveles dan los
mismos tiempos, en un tercio del tiempo de máquina. A cambio la búsqueda pasó
a ser incompleta, así que el solver reintenta con el haz abierto antes de dar
por roto un nivel. Está explicado en `CLAUDE.md`.

## Lo que costó lo segundo: los atajos

Encadenar tramos crea uniones, y en cada unión el bot busca la forma de
saltearse el tramo. De las cinco salas salieron cuatro atajos que ninguno se
ve leyendo el mapa —el sótano bajo el piso, la trepada de nueve tiles contra
el marco, bajar por una pared estando cabeza abajo, y el vuelco en diagonal
que cruza la sala sin pisar el techo—. Están anotados con su remedio en
`CLAUDE.md`, sección "Los cuatro atajos que encontró el bot". **Cada tramo
nuevo hay que mirarlo con `tools/trace.cjs`**: que el nivel se termine no
quiere decir que se termine por donde vos creías.

## El camino que NO tomamos

Apretar cada movimiento suelto: aterrizajes de un tile, márgenes de dos
píxeles, pinchos más cerca. Sube la dificultad pero sin sensación de
progreso — te frustrás veinte veces en el mismo salto y no hay nada que
automatizar. Sirve como condimento dentro de un tramo, no como plato
principal.

## Lo que sigue

Los mundos 1-3. Casi todos son de un tramo; los más largos, `Pozo` y
`Ascensor`, ya son de dos y se notan mejores. La receta es la misma y las
herramientas ya están: `tools/trace.cjs <n>` para ver el camino del bot tramo
por tramo, `tools/star-spots.cjs` para reubicar la estrella, y el solver para
confirmar que sigue siendo terminable **con la estrella**.

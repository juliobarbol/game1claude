# Nota de diseño — encadenar tramos (PENDIENTE)

> Estado: **decidido, sin implementar**. Charlado con Julio el 2026-07-27,
> después de jugar el mundo 4 recién publicado.

## El problema

Julio jugó los cinco niveles del mundo 4 y el veredicto fue "súper fáciles".
La primera tanda de arreglos (pozos en el techo, pinchos en la superficie
invertida, techo de bloques frágiles) subió el **riesgo**, y eso ayudó. Pero
queda un problema de fondo que el riesgo no arregla:

**Cada nivel es UN SOLO TRAMO.** Una idea, ejecutada una vez, y listo. El 20
es "cruzá el techo frágil → date vuelta → dasheá al piso → meta": dos
segundos de bot, seis u ocho de una persona. Como es un tramo solo, cuando
entendés qué hay que hacer lo sacás en pocos intentos y el nivel se terminó.

En este género la dificultad NO es lo difícil que sea el movimiento más
difícil: es **el largo de la cadena que tenés que ejecutar sin equivocarte**.

## La idea

Meter **dos o tres desafíos distintos en la misma sala**, sin descanso entre
uno y otro. La sala sigue siendo de una pantalla: encadenar no es agrandarla,
es usarla en varias direcciones (bajar, cruzar, volver a subir) en vez de ir
siempre de izquierda a derecha.

Ejemplo con el nivel 20 (`Cabeza abajo`), que hoy tiene los tramos 1 y 2:

```
1) techo de bloques frágiles (no podés frenar)          ← ya está
2) vuelco y caída con dash hasta el piso                ← ya está
3) chimenea de rebotes para volver a subir              ← nuevo
4) vuelco arriba y carrera por el techo con pozos       ← nuevo
```

## Por qué funciona

Si cada tramo lo sacás 1 de cada 2 veces, hacer los cuatro seguidos sale 1 de
cada 16. El nivel se vuelve difícil **por acumulación**, no porque tenga un
salto imposible.

Y es exactamente la dificultad que le sirve a este juego: morís en el tramo 4,
volvés al 1 — y descubrís que el 1 y el 2 ahora te salen sin pensar. Esa es la
sensación de "mejoré" que el juego promete (cronómetro, fantasma, medallas) y
que hoy no termina de entregar, porque los niveles se acaban antes de que
llegues a automatizar nada.

## Los límites (esto es lo que hay que cuidar)

- **Duración objetivo: 8 a 15 segundos de vuelta humana.** Como no hay puntos
  de control, cada muerte en el último tramo te hace rehacer todo. El género
  lo banca (Super Meat Boy son niveles de 5 a 20 s), pero pasado ese rango
  cansa en vez de enganchar. Si un nivel pide más, se parte en dos niveles.
- **No penalizar la muerte de ninguna otra forma.** El reintento sigue siendo
  instantáneo: la repetición del tramo fácil es el precio, y tiene que ser
  barata.
- **Recalibrar las medallas** con `node test/solver.test.cjs --par`. Los
  tiempos actuales quedan cortos apenas el nivel se hace más largo.
- **El bot tarda más** (búsqueda más profunda). Iterar con
  `node test/solver.test.cjs <n> --rapido` y dejar la corrida completa (con
  estrellas) para el final.

## El camino que NO tomamos

Apretar cada movimiento suelto: aterrizajes de un tile, márgenes de dos
píxeles, pinchos más cerca. Sube la dificultad pero sin sensación de
progreso — te frustrás veinte veces en el mismo salto y no hay nada que
automatizar. Sirve como condimento dentro de un tramo, no como plato
principal.

## Por dónde empezar

Reconstruir los cinco del mundo 4 (16-20) con dos o tres tramos encadenados
cada uno, apuntando a ~10 s de vuelta humana. Las reglas de geometría que ya
aprendimos (vallas, estalactitas, agujeros en el techo, el marco de la sala
como piso invertido) están en `CLAUDE.md`, sección "Gravedad invertible".

Herramientas: `tools/trace.cjs <n>` para ver el camino del bot tramo por
tramo, `tools/star-spots.cjs` para reubicar la estrella, y el solver para
confirmar que cada nivel sigue siendo terminable **con la estrella**.

Si funciona en el mundo 4, la misma revisión les cabe a los mundos 1-3: casi
todos son de un tramo (los más largos, `Pozo` y `Ascensor`, ya son de dos y
se notan mejores).

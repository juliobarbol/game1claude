# Curso de inglés

Material propio de **ELT para adultos**, y la plataforma para armarlo. En doce
clases el alumno sostiene su primera conversación en inglés: no hay etapa de
"primero la teoría", se habla desde la clase 1.

Cada clase son dos libros que se hablan: **Grammar** y **Vocabulary**. La misma
tarea de *speaking* aparece en los dos, y ahí es donde se juntan.

## Qué hay en el sitio

| URL | Qué es |
|---|---|
| `/` | La portada: la promesa, el temario y la lista de clases |
| `/curso/clase.html?u=…` | Una clase, tal como se da |
| `/curso/nivel-1/parte-1/syllabus.html` | El temario completo de la parte |
| `/curso/editor.html` | Armar o corregir una clase, con vista previa |
| `/curso/imprimir.html?parte=n1p1` | Imprimir / PDF (con `&v=profesor`, la versión de la profesora) |

## Estructura

- `index.html` — la portada, que se dibuja sola desde `curso/data/indice.js`.
- `curso/` — el curso entero: datos de las clases, el renderizador, el editor,
  el estilo y la sincronización con la nube.
- `test/` — `curso.test.cjs` (datos, esquema y renderizado en un navegador de
  verdad) y `nube.test.cjs` (los borradores compartidos).

Para agregar una clase no se toca el `index.html`: se agrega la entrada en el
índice y su archivo de datos.

## Probarlo

Alcanza con abrir `index.html` en el navegador.

```bash
node test/curso.test.cjs                                          # datos y esquema
NODE_PATH=/opt/node22/lib/node_modules node test/curso.test.cjs   # + navegador real
NODE_PATH=/opt/node22/lib/node_modules node test/nube.test.cjs    # los borradores
```

## Publicar

Se sirve como assets estáticos en **Cloudflare** desde este repo: **todo lo
que llega a `main` se publica solo**, sin build ni pasos manuales. Cloudflare
lee `wrangler.jsonc` y sirve la carpeta tal cual, en el Worker `game1claude`.

Configuración por única vez (desde el panel de Cloudflare, con la cuenta de
Julio):

1. **Workers & Pages → Create → Workers → Import a repository** y elegir
   `juliobarbol/game1claude`.
2. Rama de producción: `main`. Build command: **vacío**. Directorio raíz: `/`.

El detalle de cómo está armado el curso y qué no hay que romper está en
[`curso/CLAUDE.md`](curso/CLAUDE.md).

---

Antes acá vivía también **FILO**, un juego de plataformas, servido en
`/juego/`. Se borró; el código sigue en el historial de git
(`git checkout e2690b8 -- juego test tools docs CLAUDE.md` lo trae de vuelta).

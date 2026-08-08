// ════════════════════════════════════════════════════════════════════
// RENDERIZADOR DE CLASES
//
// El ÚNICO archivo que sabe cómo se dibuja una clase. Lo usan:
//   curso/clase.html     una clase en pantalla
//   curso/imprimir.html  varias clases seguidas, para imprimir o hacer PDF
//
// Si hay que cambiar cómo se ve una caja, se cambia acá y cambia en todas
// las clases a la vez.
//
// Opciones de RENDER.clase(c, opts):
//   libro:  'todo' (por defecto) · 'grammar' · 'vocabulary'
//   profe:  true → versión profesora: respuestas a la vista + caja de plan
//   botones true → dibuja los botones de mostrar/ocultar (no en impresión)
// ════════════════════════════════════════════════════════════════════

(function () {

  // ─── Formato de texto ─────────────────────────────────────────────
  // Marcas admitidas dentro de cualquier texto del contenido:
  //   **negrita**   //inglés en cursiva//   {{resaltado}}   [[respuesta]]
  // Se escapa el HTML PRIMERO: el contenido nunca puede inyectar markup.
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmt(s, opts){
    const tapado = (opts && opts.profe) ? '' : ' hidden';
    return esc(s)
      .replace(/\{\{([^}]+)\}\}/g, '<mark>$1</mark>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="gap' + tapado + '">$1</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\/\/([^/]+)\/\//g, '<span class="en">$1</span>');
  }

  // ─── Caja genérica ────────────────────────────────────────────────
  function caja(color, n, titulo, subtitulo, cuerpo){
    return `<section class="card ${color}">
      <h3><span class="n">${n}</span> ${esc(titulo)}${
        subtitulo ? ` <span class="es">— ${esc(subtitulo)}</span>` : ''}</h3>
      <div class="body">${cuerpo}</div>
    </section>`;
  }

  // ─── GRAMMAR BOOK ─────────────────────────────────────────────────
  function inContext(d, o){
    const filas = d.dialogo.map(l =>
      `<dt>${esc(l.quien)}</dt><dd>${fmt(l.linea, o)}</dd>`).join('');
    return caja('slate', 1, 'In context', d.subtitulo,
      `<dl class="dialog">${filas}</dl>` +
      (d.nota ? `<p class="note">${fmt(d.nota, o)}</p>` : ''));
  }

  function theRule(d, o){
    const th = d.cabecera.map(c => `<th>${esc(c)}</th>`).join('');
    const tr = d.filas.map(f => `<tr>
        <td class="lbl">${esc(f.etiqueta)}</td>
        <td class="form">${fmt(f.larga, o)}</td>
        <td class="short">${fmt(f.corta, o)}</td></tr>`).join('');
    return caja('grammar', 2, 'The rule', d.subtitulo,
      `<div class="tablewrap"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>` +
      (d.nota ? `<p>${fmt(d.nota, o)}</p>` : ''));
  }

  function watchOut(d, o){
    const items = d.items.map(e => `<div class="err">
        <span class="bad"><span class="x">✗</span> <span class="en">${fmt(e.mal, o)}</span></span>
        <span class="good">✓ <span class="en">${fmt(e.bien, o)}</span></span>
        <span class="why">${fmt(e.porque, o)}</span>
      </div>`).join('');
    return caja('alert', 3, 'Watch out', d.subtitulo, `<div class="errs">${items}</div>`);
  }

  function practice(d, o){
    const pasos = d.pasos.map(p => {
      if (p.tipo === 'huecos'){
        const li = p.items.map(t => `<li><span>${fmt(t, o)}</span></li>`).join('');
        return `<div class="step">
          <h4>${esc(p.titulo)}</h4>
          <ol class="items" data-answers>${li}</ol>
          ${o.botones ? `<button class="toggle" type="button" data-respuestas>${
            o.profe ? 'Ocultar respuestas' : 'Mostrar respuestas'}</button>` : ''}
        </div>`;
      }
      if (p.tipo === 'renglones'){
        return `<div class="step">
          <h4>${esc(p.titulo)}</h4>
          <div class="lines">${'<div></div>'.repeat(p.renglones || 3)}</div>
          ${p.nota ? `<p class="note">${fmt(p.nota, o)}</p>` : ''}
        </div>`;
      }
      return '';
    }).join('');
    return caja('grammar', 4, 'Practice', d.subtitulo, pasos);
  }

  function speaking(d, o){
    const guion = d.guion.map(l =>
      `<span class="who">${esc(l.quien)}</span><span>${fmt(l.linea, o)}</span>`).join('');
    const rondas = d.rondas.map(r =>
      `<div class="round"><b>${esc(r.n)}</b><span>${fmt(r.texto, o)}</span></div>`).join('');
    return caja('speak', 5, 'Now you speak', d.subtitulo,
      `<p>${fmt(d.situacion, o)}</p>
       <div class="script">${guion}</div>
       <div class="rounds">${rondas}</div>
       ${d.espejo ? `<p class="same">${esc(d.espejo)}</p>` : ''}`);
  }

  function iCan(d, o){
    const li = d.items.map(t => `<li><span>${fmt(t, o)}</span></li>`).join('');
    return caja('slate', 6, 'I can…', d.subtitulo, `<ul class="plain">${li}</ul>`);
  }

  // ─── VOCABULARY BOOK ──────────────────────────────────────────────
  function wordBank(d, o){
    const grupos = d.grupos.map(g => {
      const li = g.items.map(w =>
        `<li><span class="w">${fmt(w.en, o)}</span><span class="t">${esc(w.es)}</span></li>`).join('');
      return `<div class="bank"><h4>${esc(g.titulo)}</h4><ul>${li}</ul></div>`;
    }).join('');

    let extra = '';
    if (d.alfabeto){
      const cel = d.alfabeto.grupos.map(a =>
        `<div><b>${esc(a.letras)}</b><span>${esc(a.son)}</span></div>`).join('');
      extra += `<div class="bank"><h4>${esc(d.alfabeto.titulo)}</h4><div class="abc">${cel}</div></div>`;
    }
    if (d.numeros){
      const cel = d.numeros.items.map((w, i) => `<span><b>${i}</b>${esc(w)}</span>`).join('');
      extra += `<div class="bank"><h4>${esc(d.numeros.titulo)}</h4><div class="nums">${cel}</div></div>`;
    }

    return caja('vocab', 1, 'Word bank', d.subtitulo,
      `<div class="banks">${grupos}</div>
       ${o.botones ? '<button class="toggle v" type="button" data-traducciones>Ocultar traducciones</button>' : ''}
       ${extra}`);
  }

  function chunks(d, o){
    const li = d.items.map(c =>
      `<li><span class="c">${fmt(c.c, o)}</span><span class="m">${fmt(c.m, o)}</span></li>`).join('');
    return caja('vocab', 2, 'Chunks', d.subtitulo,
      `<ul class="chunklist">${li}</ul>` +
      (d.nota ? `<p class="note">${fmt(d.nota, o)}</p>` : ''));
  }

  function sayItRight(d, o){
    const rows = d.items.map(r =>
      `<div class="row"><b>${esc(r.etiqueta)}</b><span class="stress">${fmt(r.texto, o)}</span></div>`).join('');
    return caja('vocab', 3, 'Say it right', d.subtitulo, `<div class="say">${rows}</div>`);
  }

  function useIt(d, o){
    const pasos = d.pasos.map(p =>
      `<div class="step"><h4>${esc(p.titulo)}</h4><p class="note">${fmt(p.texto, o)}</p></div>`).join('');
    return caja('vocab', 4, 'Use it', d.subtitulo, pasos);
  }

  function speakingCards(d, o){
    const cards = d.items.map(c => `<div class="scard">
        <b>${esc(c.titulo)}</b>
        <p>${fmt(c.texto, o)}</p>
        ${c.frases ? `<p class="names">${fmt(c.frases, o)}</p>` : ''}
      </div>`).join('');
    return caja('speak', 5, 'Speaking cards', d.subtitulo, `<div class="cards">${cards}</div>`);
  }

  function myWords(d){
    return caja('slate', 6, 'My words', d.subtitulo,
      `<div class="lines">${'<div></div>'.repeat(d.renglones || 8)}</div>`);
  }

  // ─── Caja de la profesora (solo en la versión profesora) ──────────
  function paraLaProfe(d, o){
    if (!d) return '';
    const plan = (d.plan || []).map(p =>
      `<tr><td class="min">${esc(p.min)}</td><td>${fmt(p.que, o)}</td></tr>`).join('');
    const ojo = (d.ojo || []).map(t => `<li><span>${fmt(t, o)}</span></li>`).join('');
    return `<section class="card profe">
      <h3><span class="n">·</span> Para la profesora <span class="es">— no va en el libro del alumno</span></h3>
      <div class="body">
        ${plan ? `<div class="tablewrap plan-clase"><table><thead><tr>
            <th>Minuto</th><th>Qué pasa</th></tr></thead><tbody>${plan}</tbody></table></div>` : ''}
        ${ojo ? `<div class="step"><h4>Ojo con</h4><ul class="plain avisos">${ojo}</ul></div>` : ''}
      </div>
    </section>`;
  }

  // ─── La clase entera ──────────────────────────────────────────────
  function clase(c, opts){
    const o = Object.assign({ libro:'todo', profe:false, botones:false, encabezado:true }, opts || {});
    const g = c.grammar, v = c.vocabulary;
    const nn = String(c.clase).padStart(2, '0');

    const ficha = (c.ficha || []).map(f =>
      `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('');

    const cabeza = !o.encabezado ? '' : `<header class="top">
      <span class="eyebrow">Nivel ${c.nivel} · Parte ${c.parte} · Clase ${nn} — ${esc(c.codigo)}${
        o.profe ? ' · versión profesora' : ''}</span>
      <h1><span class="en">${esc(c.titulo)}</span><span class="es">${esc(c.promesa)}</span></h1>
      ${ficha ? `<dl class="plan">${ficha}</dl>` : ''}
    </header>`;

    const gram = (o.libro === 'todo' || o.libro === 'grammar') ? `
      <div class="bookhead g" id="grammar">
        <h2>Grammar Book — ${esc(c.codigo)}</h2><span>6 cajas</span>
      </div>
      ${inContext(g.inContext, o)}
      ${theRule(g.theRule, o)}
      ${watchOut(g.watchOut, o)}
      ${practice(g.practice, o)}
      <a id="speak"></a>
      ${speaking(g.speaking, o)}
      ${iCan(g.iCan, o)}` : '';

    const voc = (o.libro === 'todo' || o.libro === 'vocabulary') ? `
      <div class="bookhead v" id="vocabulary">
        <h2>Vocabulary Book — ${esc(c.codigo)}</h2><span>${esc(v.carga || '')}</span>
      </div>
      ${wordBank(v.wordBank, o)}
      ${chunks(v.chunks, o)}
      ${sayItRight(v.sayItRight, o)}
      ${useIt(v.useIt, o)}
      ${speakingCards(v.cards, o)}
      ${myWords(v.myWords)}` : '';

    return `<article class="clase" data-clase="${esc(c.id)}">
      ${cabeza}
      ${o.profe ? paraLaProfe(c.profe, o) : ''}
      ${gram}
      ${voc}
    </article>`;
  }

  // ─── Los botones, que solo tienen sentido en pantalla ─────────────
  function conectar(raiz){
    raiz = raiz || document;

    raiz.querySelectorAll('button[data-respuestas]').forEach(btn => {
      if (btn.dataset.listo) return;
      btn.dataset.listo = '1';
      const lista = btn.closest('.step').querySelector('[data-answers]');
      btn.addEventListener('click', () => {
        const visibles = !lista.querySelector('.gap.hidden');
        lista.querySelectorAll('.gap').forEach(x => x.classList.toggle('hidden', visibles));
        btn.textContent = visibles ? 'Mostrar respuestas' : 'Ocultar respuestas';
      });
    });

    raiz.querySelectorAll('button[data-traducciones]').forEach(btn => {
      if (btn.dataset.listo) return;
      btn.dataset.listo = '1';
      btn.addEventListener('click', () => {
        const tapar = !raiz.querySelector('.bank li .t.hidden');
        raiz.querySelectorAll('.bank li .t').forEach(x => x.classList.toggle('hidden', tapar));
        btn.textContent = tapar ? 'Mostrar traducciones' : 'Ocultar traducciones';
      });
    });
  }

  window.RENDER = { esc, fmt, clase, conectar };
})();

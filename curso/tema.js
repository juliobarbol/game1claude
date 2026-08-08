// ════════════════════════════════════════════════════════════════════
// TEMA CLARO / OSCURO
//
// Regla: **el curso abre SIEMPRE en claro.** No se mira el tema del
// sistema operativo — si la compu está en modo oscuro, el curso igual
// abre claro. El oscuro es una elección explícita, para trabajar de
// noche, y se recuerda en el aparato.
//
// Cómo se usa en una página:
//   1. <script src="…/tema.js"></script>  lo más arriba posible del
//      <head>, para que no haya un parpadeo blanco antes de pintar.
//   2. Poner en cualquier lado:  <button data-tema-boton type="button"></button>
//      El texto lo pone este archivo solo.
// ════════════════════════════════════════════════════════════════════

(function () {
  var CLAVE = 'curso-tema';

  // Se aplica ANTES de que se pinte la página (por eso el script va arriba
  // y no espera a DOMContentLoaded).
  var guardado = null;
  try { guardado = localStorage.getItem(CLAVE); } catch (e) {}
  if (guardado === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.setAttribute('data-theme', 'light');

  function actual() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function pintar() {
    var oscuro = actual() === 'dark';
    var botones = document.querySelectorAll('[data-tema-boton]');
    for (var i = 0; i < botones.length; i++) {
      var b = botones[i];
      b.textContent = oscuro ? '☀ Claro' : '☾ Oscuro';
      b.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
      b.setAttribute('title', oscuro ? 'Volver al tema claro' : 'Pasar al tema oscuro');
    }
  }

  function alternar() {
    var nuevo = actual() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    try { localStorage.setItem(CLAVE, nuevo); } catch (e) {}
    pintar();
    return nuevo;
  }

  function conectar() {
    var botones = document.querySelectorAll('[data-tema-boton]');
    for (var i = 0; i < botones.length; i++) {
      if (botones[i].dataset.temaListo) continue;
      botones[i].dataset.temaListo = '1';
      botones[i].addEventListener('click', alternar);
    }
    pintar();
  }

  // `conectar` es público porque las páginas que dibujan su HTML con
  // JavaScript (clase.html) tienen que volver a llamarlo después de pintar.
  window.TEMA = { actual: actual, alternar: alternar, conectar: conectar };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', conectar);
  else
    conectar();
})();

// Inicializacion comun de Materialize y registro del Service Worker.
// Se carga en TODAS las paginas: no depende de Firebase ni de elementos concretos.

document.addEventListener('DOMContentLoaded', function () {
  // Menu lateral (abre desde la derecha)
  M.Sidenav.init(document.querySelectorAll('.side-menu'), { edge: 'right' });

  // Formulario lateral de nuevo platillo (solo existe en index.html)
  M.Sidenav.init(document.querySelectorAll('.side-form'), { edge: 'left' });

  // Selects de Materialize. Los que llevan .browser-default se dejan nativos.
  M.FormSelect.init(document.querySelectorAll('select:not(.browser-default)'));
});

// El Service Worker solo existe en contexto seguro (https o localhost).
// Este archivo esta en /js/, asi que "../sw.js" apunta siempre a la raiz del
// sitio y su alcance cubre tambien /pages/. Con una ruta absoluta ("/sw.js")
// fallaba en GitHub Pages, donde la app cuelga de /UberEatsCUDEC/.
const RUTA_SW = new URL('../sw.js', document.currentScript.src).href;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(RUTA_SW).catch(function (error) {
      console.error('No se pudo registrar el Service Worker:', error);
    });
  });
}

// Service Worker de VentaPatito.
// Sube el numero de CACHE cuando cambies archivos para forzar la actualizacion.
const CACHE = 'ventapatito-v3';

const RECURSOS = [
  './',
  'index.html',
  'manifest.json',
  'pages/about.html',
  'pages/contact.html',
  'pages/pedidos.html',
  'css/materialize.min.css',
  'css/styles.css',
  'js/materialize.min.js',
  'js/ui.js',
  'js/firebase.js',
  'js/index.js',
  'js/db.js',
  'js/pedidos.js',
  'img/Comida_def.jpg',
  'iconos/icon-192x192.png',
  'iconos/icon-512x512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Se cachea uno por uno: con cache.addAll un solo 404 aborta toda la
      // instalacion y el Service Worker se queda sin nada guardado.
      return Promise.all(RECURSOS.map(function (recurso) {
        return cache.add(recurso).catch(function (error) {
          console.warn('No se pudo cachear', recurso, error);
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(nombres.map(function (nombre) {
        if (nombre !== CACHE) return caches.delete(nombre);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Sin este listener la cache nunca se consultaba y la app no funcionaba offline.
self.addEventListener('fetch', function (event) {
  const peticion = event.request;

  // Solo GET: los POST a Firestore no se pueden ni se deben cachear.
  if (peticion.method !== 'GET') return;

  // Solo mismo origen: el trafico a Firestore, Leaflet o Google Fonts pasa
  // directo a la red para no romper la sincronizacion en tiempo real.
  if (new URL(peticion.url).origin !== self.location.origin) return;

  // Paginas: red primero (contenido fresco), cache si no hay conexion.
  if (peticion.mode === 'navigate') {
    event.respondWith(
      fetch(peticion)
        .then(function (respuesta) {
          const copia = respuesta.clone();
          caches.open(CACHE).then(function (cache) { cache.put(peticion, copia); });
          return respuesta;
        })
        .catch(function () {
          return caches.match(peticion).then(function (guardada) {
            return guardada || caches.match('index.html');
          });
        })
    );
    return;
  }

  // Recursos estaticos: stale-while-revalidate.
  // Responde al instante con lo que hay en cache y, en paralelo, pide la version
  // nueva a la red y la guarda. Con "cache primero" a secas, editar un .js o un
  // .css no surtia efecto hasta subir el numero de CACHE a mano.
  event.respondWith(
    caches.match(peticion).then(function (guardada) {
      const desdeRed = fetch(peticion).then(function (respuesta) {
        if (respuesta && respuesta.status === 200) {
          const copia = respuesta.clone();
          caches.open(CACHE).then(function (cache) { cache.put(peticion, copia); });
        }
        return respuesta;
      }).catch(function (error) {
        if (guardada) return guardada; // sin red: se queda lo cacheado
        throw error;
      });

      return guardada || desdeRed;
    })
  );
});

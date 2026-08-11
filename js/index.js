// Renderizado de la lista de platillos y captura de foto con la camara.
// Solo se carga en index.html.

const FOTO_POR_DEFECTO = '/img/Comida_def.jpg';
const listado = document.querySelector('.recipes');

/* ------------------------------------------------------------------ */
/* Lista de platillos                                                   */
/* ------------------------------------------------------------------ */

function formatearPrecio(precio) {
  const numero = Number.parseFloat(precio);
  return Number.isFinite(numero)
    ? 'Precio: $' + numero.toFixed(2) + ' MXN'
    : 'Precio: no disponible';
}

function buscarTarjeta(id) {
  return listado ? listado.querySelector('.recipe[data-id="' + id + '"]') : null;
}

// Se construye con la API del DOM (no con innerHTML) para que el nombre o los
// ingredientes no puedan inyectar HTML en la pagina.
function crearTarjeta(platillo, id) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card-panel recipe white row';
  tarjeta.dataset.id = id;

  const imagen = document.createElement('img');
  imagen.src = platillo.foto || FOTO_POR_DEFECTO;
  imagen.alt = 'Foto del platillo';
  imagen.addEventListener('error', function () {
    imagen.src = FOTO_POR_DEFECTO;
  });

  const detalles = document.createElement('div');
  detalles.className = 'recipe-details';

  const titulo = document.createElement('div');
  titulo.className = 'recipe-title';
  titulo.textContent = platillo.nombre || 'Sin nombre';

  const ingredientes = document.createElement('div');
  ingredientes.className = 'recipe-ingredients';
  ingredientes.textContent = platillo.ingredientes || '';

  const precio = document.createElement('div');
  precio.className = 'recipe-precio';
  precio.textContent = formatearPrecio(platillo.precio);

  const contenedorBorrar = document.createElement('div');
  contenedorBorrar.className = 'recipe-delete';

  const iconoBorrar = document.createElement('i');
  iconoBorrar.className = 'material-icons';
  iconoBorrar.textContent = 'delete_outline';
  iconoBorrar.title = 'Eliminar platillo';

  contenedorBorrar.appendChild(iconoBorrar);
  detalles.appendChild(titulo);
  detalles.appendChild(ingredientes);
  detalles.appendChild(precio);
  detalles.appendChild(contenedorBorrar);
  tarjeta.appendChild(imagen);
  tarjeta.appendChild(detalles);

  return tarjeta;
}

function mostrarPlatillo(platillo, id) {
  if (!listado || buscarTarjeta(id)) return; // evita duplicados
  listado.appendChild(crearTarjeta(platillo, id));
}

function actualizarPlatillo(platillo, id) {
  const tarjeta = buscarTarjeta(id);
  if (!tarjeta) return;

  tarjeta.querySelector('.recipe-title').textContent = platillo.nombre || 'Sin nombre';
  tarjeta.querySelector('.recipe-ingredients').textContent = platillo.ingredientes || '';
  tarjeta.querySelector('.recipe-precio').textContent = formatearPrecio(platillo.precio);
  tarjeta.querySelector('img').src = platillo.foto || FOTO_POR_DEFECTO;
}

function borrarPlatillo(id) {
  const tarjeta = buscarTarjeta(id);
  if (tarjeta) tarjeta.remove();
}

// Aviso visible dentro de la lista, en lugar de un alert en cada carga.
function mostrarAviso(texto) {
  if (!listado) return;
  let aviso = listado.querySelector('.aviso');
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.className = 'aviso card-panel white';
    listado.prepend(aviso);
  }
  aviso.textContent = texto;
}

/* ------------------------------------------------------------------ */
/* Camara                                                               */
/* ------------------------------------------------------------------ */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const salida = document.getElementById('salida');
const foto = document.getElementById('foto');
const btnFoto = document.getElementById('btnFoto');
const btnCapturar = document.getElementById('btnCapturar');
const campoFoto = document.getElementById('fotoFinal');

// Si alguno falta es que no estamos en index.html: no se engancha nada.
if (video && canvas && salida && foto && btnFoto && btnCapturar && campoFoto) {
  const ANCHO = 320;
  let alto = 0;
  let streaming = false;
  let streamActual = null;

  video.setAttribute('playsinline', '');
  video.muted = true;

  function detenerCamara() {
    if (streamActual) {
      streamActual.getTracks().forEach(function (track) { track.stop(); });
      streamActual = null;
    }
    video.srcObject = null;
    streaming = false;
    alto = 0;
    btnCapturar.disabled = true;
    btnFoto.textContent = 'Imagen';
  }

  btnFoto.addEventListener('click', function () {
    if (streamActual) {
      detenerCamara();
      return;
    }

    // getUserMedia solo existe en contexto seguro (https o localhost).
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('La camara no esta disponible. Abre la app por https o desde localhost.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        streamActual = stream;
        video.srcObject = stream;
        btnFoto.textContent = 'Apagar camara';
        return video.play();
      })
      .catch(function (error) {
        console.error('No se pudo abrir la camara:', error);
        alert('No se pudo abrir la camara: ' + error.message);
        detenerCamara();
      });
  });

  video.addEventListener('canplay', function () {
    if (streaming || !video.videoWidth) return;

    alto = video.videoHeight / (video.videoWidth / ANCHO);
    video.setAttribute('width', ANCHO);
    video.setAttribute('height', alto);
    canvas.setAttribute('width', ANCHO);
    canvas.setAttribute('height', alto);
    streaming = true;
    btnCapturar.disabled = false;
  });

  btnCapturar.addEventListener('click', function () {
    if (!streaming || !alto) {
      alert('Primero enciende la camara con el boton "Imagen".');
      return;
    }

    canvas.width = ANCHO;
    canvas.height = alto;
    canvas.getContext('2d').drawImage(video, 0, 0, ANCHO, alto);

    // JPEG al 70%: unos 20 KB, muy por debajo del limite de 1 MiB por documento
    // de Firestore. Con PNG una sola foto podia pasar de 200 KB.
    const fotoFinal = canvas.toDataURL('image/jpeg', 0.7);
    foto.src = fotoFinal;
    campoFoto.value = fotoFinal;
    salida.style.display = 'block';
    detenerCamara();
  });

  btnCapturar.disabled = true;
  salida.style.display = 'none';

  // Permite que db.js limpie la vista previa despues de guardar.
  window.limpiarFoto = function () {
    campoFoto.value = '';
    foto.removeAttribute('src');
    salida.style.display = 'none';
    detenerCamara();
  };
} else {
  window.limpiarFoto = function () {};
}

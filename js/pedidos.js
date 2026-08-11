// Alta de pedidos y geolocalizacion de la direccion de entrega.
// Requiere firebase.js (define `db`). Solo se carga en pages/pedidos.html.

const selectPlatillo = document.getElementById('listaPlatillos');
const inputNombre = document.getElementById('nombre');
const inputDireccion = document.getElementById('direccion');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const btnUbicacion = document.getElementById('btnUbicacion');

/* ------------------------------------------------------------------ */
/* Lista desplegable de platillos                                       */
/* ------------------------------------------------------------------ */

function buscarOpcion(id) {
  return selectPlatillo.querySelector('option[value="' + id + '"]');
}

// Se agregan opciones una por una en vez de reescribir el innerHTML completo:
// asi no se borra el <option> "Seleccionar..." que sirve de placeholder.
function agregarALista(platillo, id) {
  if (buscarOpcion(id)) return;
  const opcion = document.createElement('option');
  opcion.value = id;
  opcion.textContent = platillo.nombre || 'Sin nombre';
  selectPlatillo.appendChild(opcion);
}

function actualizarEnLista(platillo, id) {
  const opcion = buscarOpcion(id);
  if (opcion) opcion.textContent = platillo.nombre || 'Sin nombre';
}

function quitarDeLista(id) {
  const opcion = buscarOpcion(id);
  if (opcion) opcion.remove();
}

if (!db) {
  console.error('Firestore no esta disponible: no se cargara la lista de platillos.');
} else if (selectPlatillo) {
  db.collection('platillos').onSnapshot(
    function (datos) {
      datos.docChanges().forEach(function (registro) {
        const platillo = registro.doc.data();
        const id = registro.doc.id;

        if (registro.type === 'added') agregarALista(platillo, id);
        if (registro.type === 'modified') actualizarEnLista(platillo, id);
        if (registro.type === 'removed') quitarDeLista(id);
      });
    },
    function (error) {
      console.error('Error al cargar los platillos:', error);
      const opcion = selectPlatillo.querySelector('option');
      if (opcion) {
        opcion.textContent = error.code === 'permission-denied'
          ? 'Sin acceso a los platillos (revisa firestore.rules)'
          : 'No se pudieron cargar los platillos';
      }
    }
  );
}

/* ------------------------------------------------------------------ */
/* Guardar el pedido                                                    */
/* ------------------------------------------------------------------ */

function limpiarFormulario() {
  selectPlatillo.value = '';
  inputNombre.value = '';
  inputDireccion.value = '';
  M.updateTextFields();
}

if (btnGuardar) {
  btnGuardar.addEventListener('click', function () {
    const platilloId = selectPlatillo.value;
    const opcion = selectPlatillo.selectedOptions[0];
    const nombre = inputNombre.value.trim();
    const direccion = inputDireccion.value.trim();

    if (!platilloId || !opcion || !nombre || !direccion) {
      alert('Por favor completa todos los campos.');
      return;
    }
    if (!db) {
      alert('No hay conexion con la base de datos.');
      return;
    }

    const pedidoNuevo = {
      platilloId: platilloId, // referencia estable al platillo
      platillo: opcion.textContent.trim(), // copia del nombre para mostrarlo
      nombre: nombre,
      direccion: direccion,
      creado: firebase.firestore.FieldValue.serverTimestamp()
    };

    btnGuardar.disabled = true;

    db.collection('pedidos').add(pedidoNuevo)
      .then(function () {
        limpiarFormulario();
        generarQR(pedidoNuevo);
        alert('Pedido guardado correctamente');
      })
      .catch(function (error) {
        console.error('Error al guardar el pedido:', error);
        alert('Error al guardar el pedido: ' + error.message);
      })
      .finally(function () {
        btnGuardar.disabled = false;
      });
  });
}

if (btnCancelar) {
  btnCancelar.addEventListener('click', function () {
    limpiarFormulario();
    borrarQR();
  });
}

/* ------------------------------------------------------------------ */
/* Codigo QR del pedido registrado                                      */
/* ------------------------------------------------------------------ */

const contenedorQR = document.getElementById('qrcode');
let qrcode = null;

// Solo el platillo y el cliente: la direccion que devuelve Nominatim pasa de
// 150 caracteres y con correctLevel H el codigo ya no cabe.
function generarQR(pedido) {
  if (!contenedorQR || typeof QRCode === 'undefined') return;

  borrarQR();

  // Generar codigo QR
  qrcode = new QRCode(contenedorQR, {
    text: 'Platillo: ' + pedido.platillo + ' - Cliente: ' + pedido.nombre,
    width: 128,
    height: 128,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
}

function borrarQR() {
  if (qrcode) {
    // Borrar el codigo QR
    qrcode.clear();
    contenedorQR.innerHTML = '';
    qrcode = null;
  }
}

/* ------------------------------------------------------------------ */
/* Ubicacion y mapa                                                     */
/* ------------------------------------------------------------------ */

let mapa = null;
let marcador = null;

function dibujarMapa(latitud, longitud) {
  if (typeof L === 'undefined') {
    console.warn('Leaflet no esta disponible: no se puede dibujar el mapa.');
    return;
  }

  if (!mapa) {
    mapa = L.map('mapa').setView([latitud, longitud], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
  } else {
    mapa.setView([latitud, longitud], 15);
  }

  // Se reutiliza el mismo marcador; antes se acumulaba uno por cada consulta.
  if (marcador) {
    marcador.setLatLng([latitud, longitud]);
  } else {
    marcador = L.marker([latitud, longitud]).addTo(mapa);
  }
}

function ubicacionObtenida(posicion) {
  const latitud = posicion.coords.latitude;
  const longitud = posicion.coords.longitude;

  dibujarMapa(latitud, longitud);

  // Nominatim pide identificarse. En el navegador la cabecera User-Agent no se
  // puede modificar (es un forbidden header), asi que se usa el parametro email.
  const url = 'https://nominatim.openstreetmap.org/reverse' +
    '?lat=' + encodeURIComponent(latitud) +
    '&lon=' + encodeURIComponent(longitud) +
    '&format=json&accept-language=es' +
    '&email=' + encodeURIComponent('mgm140902@gmail.com');

  fetch(url)
    .then(function (respuesta) {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      return respuesta.json();
    })
    .then(function (datos) {
      if (datos && datos.display_name) {
        inputDireccion.value = datos.display_name;
        M.updateTextFields();
      }
    })
    .catch(function (error) {
      console.error('No se pudo obtener la direccion:', error);
      alert('Se obtuvo la ubicacion pero no se pudo traducir a una direccion.');
    })
    .finally(function () {
      btnUbicacion.classList.remove('disabled');
    });
}

function ubicacionFallida(error) {
  console.error('Error de geolocalizacion:', error);
  alert('Error al obtener la ubicacion: ' + error.message);
  btnUbicacion.classList.remove('disabled');
}

if (btnUbicacion) {
  btnUbicacion.addEventListener('click', function () {
    // La geolocalizacion tambien exige contexto seguro (https o localhost).
    if (!navigator.geolocation) {
      alert('Tu navegador no permite geolocalizacion. Abre la app por https o desde localhost.');
      return;
    }

    btnUbicacion.classList.add('disabled');
    navigator.geolocation.getCurrentPosition(ubicacionObtenida, ubicacionFallida, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

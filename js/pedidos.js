let contenidoLista = '';

db.collection("platillos").onSnapshot((datos) => {
    datos.docChanges().forEach((registro) => {
        if (registro.type === "added") {
            agregarALista(registro.doc.data(), registro.doc.id);
        }
    });
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});

function agregarALista(platillo, id) {
    contenidoLista += `<option value='${id}'>
    ${platillo.nombre}
    </option>`;
    document.getElementById("listaPlatillos").innerHTML = contenidoLista;
}

// --- Guardar pedido en la colección "pedidos" ---
const selectPlatillo = document.getElementById("listaPlatillos");
const inputNombre = document.getElementById("nombre");
const inputDireccion = document.getElementById("direccion");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

btnGuardar.addEventListener("click", () => {
    const platillo = selectPlatillo.options[selectPlatillo.selectedIndex].text.trim();
    const nombre = inputNombre.value.trim();
    const direccion = inputDireccion.value.trim();

    if (!selectPlatillo.value || !nombre || !direccion) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const pedidoNuevo = { platillo, nombre, direccion };

    db.collection("pedidos").add(pedidoNuevo)
        .then(() => {
            alert("Pedido guardado correctamente");
            limpiarFormulario();
        })
        .catch((error) => {
            console.error("Error al guardar el pedido: ", error);
            alert("Error al guardar el pedido");
        });
});

btnCancelar.addEventListener("click", limpiarFormulario);

function limpiarFormulario() {
    selectPlatillo.selectedIndex = 0;
    inputNombre.value = "";
    inputDireccion.value = "";
    M.updateTextFields();
}

let mapa;

document.getElementById("btnUbicacion").addEventListener("click", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(exito, error);
    }
});

function exito(posicion) {
    let latitud = posicion.coords.latitude;
    let longitud = posicion.coords.longitude;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json`, {
        headers: {
            'User-Agent': 'UberEatsCUDECMauricio (mgm140902@gmail.com)'
        }
})
    .then(response => response.json())
    .then(data => {
        const inputDireccion = document.getElementById("direccion");
        if (inputDireccion) {
            inputDireccion.value = data.display_name;
            M.updateTextFields();
        }

        // Mostrar la ubicación en el mapa
        if (!mapa) {
            mapa = L.map('mapa').setView([latitud, longitud], 15);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapa);
        } else {
            mapa.setView([latitud, longitud], 15);
        }
        L.marker([latitud, longitud]).addTo(mapa);
    })
    .catch(error => console.error(error));

}

function error(error) {
    alert("Error al obtener la ubicación: " + error.message);
    console.log(error);
}


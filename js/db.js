db.collection("platillos").onSnapshot((coleccion) => {
    coleccion.docChanges().forEach((registro) => {
        if (registro.type === "added"){
            mostrarPlatillo(registro.doc.data(), registro.doc.id);
            agregarALista(registro.doc.data(), registro.doc.id);
        }
        if (registro.type === "modified"){
            actualizarPlatillo(registro.doc.data(), registro.doc.id);
        }
        if (registro.type === "removed"){
            borrarPlatillo(registro.doc.id);
        }
    });
});

const formularioAgregar = document.querySelector("form");
formularioAgregar.addEventListener("submit", (e) => {
    e.preventDefault();
    const platilloNuevo = {
        nombre: formularioAgregar.title.value,
        ingredientes: formularioAgregar.ingredientes.value,
        precio: formularioAgregar.price.value
    }
    db.collection("platillos").add(platilloNuevo)
    .catch((error) => {
        console.log(error);
        alert("Error al agregar platillo");
    }
    );

    formularioAgregar.title.value = "";
    formularioAgregar.ingredientes.value = "";
    formularioAgregar.price.value = "";
    alert("Platillo agregado");
});

const platilloBorrar = document.querySelector(".recipes");

platilloBorrar.addEventListener("click", (e) => {
    if (e.target.tagName === 'I') {

        const confirmacion = confirm("¿Desea eliminar el platillo?");
        if (confirmacion) {
            const id = e.target.getAttribute("data-id");
            db.collection("platillos").doc(id).delete()
            .then(() => {
                console.log("Platillo eliminado correctamente de la base de datos.");
            })
            .catch((error) => {
                console.error("Error al eliminar: ", error);
                alert("Hubo un error al intentar eliminar el platillo.");
            });
        }
    }
});
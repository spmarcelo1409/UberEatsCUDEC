db.collection("platillos").onSnapshot((coleccion) => {
    coleccion.forEach((registro) => {
        mostrarPlatillo(registro.data(), registro.id);
    });
});
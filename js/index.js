let contenido = "";

document.addEventListener('DOMContentLoaded', function() {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right'});
  // add recipe form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, {edge: 'left'});
});

function mostrarPlatillo(platillo, id) {
  contenido = `
    <div class='card-panel recipe white row' id='${id}' data-id='${id}'>
        <div class='recipe-details'>

          <div class='recipe-title'>${platillo.nombre}</div>
          <div class='recipe-ingredients'>${platillo.ingredientes}</div>
          <div class='recipe-precio'>Precio: $${platillo.precio} MXN</div>

          <div class="recipe-delete">
            <i class="material-icons" data-id='${id}'>
            delete_outline
            </i>
          </div>

        </div>
    </div>
  `;
    document.querySelector(".recipes").innerHTML += contenido;
};

function actualizarPlatillo(platillo,id){
  let tarjeta = document.getElementById(`${id}`);
  tarjeta.querySelector(".recipe-title").innerHTML = platillo.nombre;
  tarjeta.querySelector(".recipe-ingredientes").innerHTML = platillo.ingredientes;
  tarjeta.querySelector(".recipe-precio").innerHTML = platillo.precio;
}

const borrarPlatillo = (id) =>{
  const platillo = document.querySelector(`.recipe[data-id=${id}]`);
  platillo.remove();
};

function agregarALista(platillo, id) {
  contenidoLista = `
  <option value="${id}">${platillo}</option>
  `;

  document.getElementById("listaPlatillos").innerHTML += contenidoLista;
}
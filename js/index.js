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
  let fotoPlatillo;
  if (platillo.foto) {
    fotoPlatillo = platillo.foto;
  } else {
    fotoPlatillo = "img/Comida_def.jpg";
  }
  contenido = `
    <div class='card-panel recipe white row' id='${id}' data-id='${id}'>
        <img src="${fotoPlatillo}" alt="Foto del platillo">
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

    limpiarFoto();
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

let streaming = false;
const width = 320;
let height = 0;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const foto = document.getElementById('foto');
const btnFoto = document.getElementById('btnFoto');

btnFoto.addEventListener("click", function() {
  navigator.mediaDevices
    .getUserMedia({
        video: {
          facingMode: {
            ideal: "environment"
          }
        },
        audio: false
  })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((error) => {
    console.error(error);
  });
})

video.addEventListener('canplay', function() {
  if (!streaming) {
      // Calcula la proporción para que la foto no se vea estirada
      height = video.videoHeight / (video.videoWidth / width);

      video.setAttribute("width", width);
      video.setAttribute("height", height);
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      streaming = true;
  }
}, false);

const btnCapturar = document.getElementById('btnCapturar');
btnCapturar.addEventListener("click", tomarFoto);

function tomarFoto() {
  const contexto = canvas.getContext("2d");
  if (width && height) {
      canvas.width = width;
      canvas.height = height;
      contexto.drawImage(video, 0, 0, width, height);
      const fotoFinal = canvas.toDataURL("image/png");
      foto.setAttribute("src", fotoFinal);
      document.getElementById("fotoFinal").value = fotoFinal;
  } else {
      limpiarFoto();
  }
}

// Función de respaldo por si no hay cámara activa
function limpiarFoto() {
  const contexto = canvas.getContext('2d');
  contexto.fillStyle = "#AAA";
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  const data = canvas.toDataURL('image/png');
  foto.setAttribute('src', data);
}
// Configuracion de Firebase. Debe cargarse DESPUES del SDK
// (firebase-app-compat.js y firebase-firestore-compat.js) y ANTES de db.js / pedidos.js.

var db = null;

if (typeof firebase === 'undefined') {
  // Pasa si no hay internet o si el SDK no se cargo antes que este archivo.
  console.error('El SDK de Firebase no se cargo. Revisa las etiquetas <script> y tu conexion.');
} else {
  const firebaseConfig = {
    apiKey: "AIzaSyD3VElB14xeGkpTYT3FMwbtTSKnqccC4j8",
    authDomain: "appmovil-a6da0.firebaseapp.com",
    projectId: "appmovil-a6da0",
    storageBucket: "appmovil-a6da0.firebasestorage.app",
    messagingSenderId: "446171372745",
    appId: "1:446171372745:web:8758f7ca1eda980253c118",
    measurementId: "G-SCBEMMDRGD"
  };

  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}

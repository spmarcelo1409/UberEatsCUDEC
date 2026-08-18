// Configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AlzaSyD3VE1B14xeGkpTYT3FMwbTTsKnqccC4j8",
  authDomain: "appmovil-a6da0.firebaseapp.com",
  projectId: "appmovil-a6da0",
  storageBucket: "appmovil-a6da0.firebasestorage.app",
  messagingSenderId: "446171372745",
  appId: "1:446171372745:web:8758f7ca1eda980253c118",
  measurementId: "G-SCBEMMDRGD"
};

// Inicializar Firebase usando el objeto global cargado desde el HTML
firebase.initializeApp(firebaseConfig);

// Crear la variable global "db" (Firestore) que necesita tu archivo db.js
var db = firebase.firestore();
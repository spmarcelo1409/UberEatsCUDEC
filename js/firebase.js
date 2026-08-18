// 1. Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";

// Tu configuración
const firebaseConfig = {
  apiKey: "AlzaSyD3VE1B14xeGkpTYT3FMwbTTsKnqccC4j8",
  authDomain: "appmovil-a6da0.firebaseapp.com",
  projectId: "appmovil-a6da0",
  storageBucket: "appmovil-a6da0.firebasestorage.app",
  messagingSenderId: "446171372745",
  appId: "1:446171372745:web:8758f7ca1eda980253c118",
  measurementId: "G-SCBEMMDRGD"
};

// 2. Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportar la app por si la necesitas en db.js
export { app };
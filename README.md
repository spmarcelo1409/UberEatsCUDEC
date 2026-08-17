# VentaPatito

## 1. Título del proyecto

**Nombre de la aplicación:** VentaPatito
**Nombre del proyecto:** `VP_POS`
**Tipo de aplicación:** PWA (Progressive Web App)

> Catálogo de platillos con alta en tiempo real y registro de pedidos a domicilio,
> con captura de foto desde la cámara, geolocalización de la dirección de entrega y
> generación de código QR del pedido.

| Dato | Valor |
|---|---|
| **Alumno** | García Marcelo Mauricio |
| **Materia** | Taller de Programación Avanzada II |
| **Carrera** | Ingeniería en Sistemas Computacionales |
| **Grupo** | ISC182 |
| **Institución** | Universidad Multicultural CUDEC |
| **Repositorio** | https://github.com/spmarcelo1409/UberEatsCUDEC |
| **Sitio publicado** | https://spmarcelo1409.github.io/UberEatsCUDEC/ | 

> **¿Por qué esta sección?** Es la ficha de identificación del trabajo. Un lector
> (el docente, un compañero o un reclutador) debe saber en los primeros diez
> segundos *qué* es la aplicación, *quién* la hizo y *de qué materia* es, sin
> tener que abrir un solo archivo de código.

---

## 2. Descripción del proyecto

**VentaPatito** es una aplicación web progresiva que funciona como catálogo digital
de platillos y como punto de captura de pedidos a domicilio.

### Problema que resuelve

Los negocios pequeños de comida (fondas, cocinas económicas, ventas caseras) suelen
administrar su menú y sus pedidos con herramientas improvisadas: una libreta, un
grupo de WhatsApp o una hoja de cálculo. Eso provoca tres problemas concretos:

1. **El menú se desactualiza.** Si cambia un precio o se agota un platillo, cada
   persona que atiende tiene una versión distinta de la información.
2. **Los pedidos se pierden o se anotan mal.** Las direcciones dictadas por teléfono
   se transcriben con errores y el repartidor termina llamando al cliente.
3. **No hay un registro consultable.** Al no existir una base de datos, no se puede
   revisar qué se pidió, ni cuándo, ni a dónde se entregó.

VentaPatito ataca los tres: el menú vive en una base de datos en la nube y se
**sincroniza en tiempo real** en todos los dispositivos conectados; la dirección de
entrega se obtiene del **GPS del dispositivo** en lugar de dictarse; y cada pedido
queda **almacenado como documento** en la nube.

### Usuarios

| Perfil | Qué hace en la aplicación |
|---|---|
| **Encargado del negocio** | Da de alta platillos (nombre, ingredientes, precio, foto), corrige precios y elimina los que ya no se venden. |
| **Persona que toma pedidos** | Selecciona un platillo del catálogo, captura los datos del cliente, obtiene la dirección por GPS y guarda el pedido. |
| **Repartidor** | Escanea el código QR generado al cerrar el pedido para llevar consigo el platillo y el nombre del cliente. |

### Propósito

Además del propósito funcional, el proyecto tiene un propósito **académico**:
demostrar de forma integrada el manejo de las APIs modernas del navegador
(Service Worker, MediaDevices, Geolocation), el consumo de una base de datos NoSQL
en la nube y la construcción de una aplicación instalable sin recurrir a ningún
framework ni proceso de compilación.

> **¿Por qué esta sección?** Un README que solo dice *cómo* está hecho un proyecto
> obliga al lector a adivinar *para qué sirve*. Describir el problema real, el
> usuario y el propósito justifica cada decisión técnica de las secciones siguientes.

---

## 3. Objetivos

### Objetivo general

Desarrollar una aplicación web progresiva instalable que permita administrar un
catálogo de platillos y registrar pedidos a domicilio, empleando almacenamiento en
la nube con sincronización en tiempo real y las APIs nativas del navegador para
cámara y geolocalización.

### Objetivos específicos

1. **Implementar el CRUD del catálogo** sobre Cloud Firestore: alta, consulta,
   modificación reflejada en pantalla y baja de platillos.
2. **Sincronizar la interfaz en tiempo real** mediante escuchas `onSnapshot`, de modo
   que un cambio hecho en un dispositivo aparezca en los demás sin recargar la página.
3. **Convertir el sitio en PWA instalable**, con `manifest.json`, juego completo de
   iconos (16 px a 512 px, incluidos los *maskable*) y Service Worker registrado.
4. **Habilitar el funcionamiento sin conexión** cacheando el esqueleto de la
   aplicación con estrategias diferenciadas por tipo de recurso.
5. **Capturar fotografías del platillo** con la API `MediaDevices.getUserMedia()` y
   comprimirlas antes de guardarlas, respetando el límite de tamaño de Firestore.
6. **Obtener la dirección de entrega por GPS** con la API `Geolocation`, mostrarla en
   un mapa interactivo y traducir las coordenadas a una dirección legible mediante
   geocodificación inversa.
7. **Generar un código QR** con los datos del pedido registrado, para su verificación
   durante la entrega.
8. **Validar los datos en dos capas** —en el cliente y en las reglas de seguridad del
   servidor— para impedir que lleguen documentos malformados a la base de datos.
9. **Publicar la aplicación en GitHub Pages** bajo HTTPS, requisito indispensable para
   que Service Worker, cámara y geolocalización funcionen.

> **¿Por qué esta sección?** El objetivo general define el alcance y evita que el
> proyecto crezca sin control. Los específicos son **verificables uno por uno**: cada
> punto se puede marcar como cumplido o no cumplido, lo que convierte al README en
> una lista de comprobación para la evaluación.

---

## 4. Características principales

### Catálogo de platillos (`index.html`)

- **Alta de platillos** con nombre, ingredientes, precio y foto opcional.
- **Sincronización en tiempo real:** la lista escucha la colección con `onSnapshot()`
  y procesa los cambios por tipo (`added`, `modified`, `removed`), actualizando solo
  la tarjeta afectada en lugar de redibujar toda la lista.
- **Baja con confirmación** mediante `confirm()` antes de borrar.
- **Precio almacenado como número**, no como texto, para permitir sumas y ordenamientos
  posteriores; se muestra formateado a dos decimales en pesos mexicanos.
- **Imagen de respaldo:** si un platillo no tiene foto, o si la foto falla al cargar,
  se muestra `img/Comida_def.jpg`.
- **Avisos en pantalla:** si Firestore rechaza la lectura, la aplicación muestra un
  mensaje explicativo dentro de la lista en lugar de quedarse vacía sin explicación.

### Captura con cámara

- Encendido y apagado de la cámara con `getUserMedia()`.
- Captura del cuadro actual a un `<canvas>` con vista previa antes de guardar.
- **Compresión a JPEG al 70 % y ancho fijo de 320 px** (≈20 KB por imagen), muy por
  debajo del límite de 1 MiB por documento de Firestore.
- **Liberación explícita del hardware:** al capturar o cancelar se detienen todas las
  pistas del *stream*, de modo que el indicador de cámara del dispositivo se apaga.

### Pedidos (`pages/pedidos.html`)

- **Lista desplegable alimentada en vivo** desde la colección `platillos`.
- Captura de nombre del cliente y dirección de entrega.
- **Geolocalización:** obtiene las coordenadas del dispositivo, las dibuja en un mapa
  Leaflet con teselas de OpenStreetMap y rellena automáticamente el campo de dirección
  mediante geocodificación inversa con Nominatim.
- **Código QR** del pedido registrado (platillo + cliente), generado al guardar.
- **Doble referencia al platillo:** se guarda tanto el `platilloId` (referencia estable)
  como una copia del nombre, para que el pedido siga siendo legible aunque el platillo
  se elimine del catálogo más adelante.

### Progressive Web App

- **Instalable** en escritorio y móvil, en modo `standalone` y orientación vertical.
- **Service Worker con dos estrategias:**
  - *Network-first* para navegación entre páginas (contenido siempre fresco, caché
    como respaldo sin conexión).
  - *Stale-while-revalidate* para CSS, JS e imágenes (respuesta instantánea desde
    caché y actualización en segundo plano).
- **Caché tolerante a fallos:** los recursos se guardan uno por uno, de modo que un
  solo archivo faltante no aborta la instalación completa del Service Worker.
- **Limpieza de versiones anteriores** al activarse una nueva caché.

### Seguridad de la interfaz

- Las tarjetas se construyen con la **API del DOM** (`createElement` / `textContent`),
  nunca con `innerHTML`, de modo que el nombre o los ingredientes de un platillo no
  puedan inyectar HTML ni scripts en la página (prevención de XSS almacenado).
- Los botones de guardado se deshabilitan durante la escritura para evitar el envío
  duplicado por doble clic.

> **¿Por qué esta sección?** Es el inventario de lo que **realmente está implementado**
> y funciona. Sirve de evidencia directa frente a los objetivos específicos y permite
> al evaluador localizar cada funcionalidad sin leer todo el código.

---

## 5. Tecnologías utilizadas

| Tecnología | Versión | Uso en el proyecto | Origen |
|---|---|---|---|
| **HTML5** | — | Estructura de las 4 páginas | — |
| **CSS3** | — | Estilos propios con variables CSS y CSS Grid | `css/styles.css` |
| **JavaScript** | ES6+ | Toda la lógica de la aplicación | `js/` |
| **Materialize CSS** | 1.0.0 | Framework de UI: menú lateral, formularios, tarjetas | Local (`css/`, `js/`) |
| **Material Icons** | — | Iconografía | CDN Google Fonts |
| **Firebase Web SDK (compat)** | 10.12.2 | `firebase-app-compat.js` y `firebase-firestore-compat.js` | CDN `gstatic.com` |
| **Cloud Firestore** | — | Base de datos NoSQL en la nube | Firebase |
| **Leaflet** | 1.9.4 | Mapa interactivo de la ubicación de entrega | CDN unpkg (con SRI) |
| **OpenStreetMap** | — | Teselas del mapa | `tile.openstreetmap.org` |
| **Nominatim** | API v1 | Geocodificación inversa (coordenadas → dirección) | `nominatim.openstreetmap.org` |
| **QRCode.js** | *(davidshimjs, sin versión declarada en el archivo)* | Generación del código QR del pedido | Local (`js/qrcode.min.js`) |
| **Service Worker API** | — | Caché y funcionamiento sin conexión | Nativa del navegador |
| **MediaDevices API** | — | Acceso a la cámara | Nativa del navegador |
| **Geolocation API** | — | Coordenadas del dispositivo | Nativa del navegador |
| **GitHub Pages** | — | Hospedaje del sitio bajo HTTPS | GitHub |

### Requisitos de ejecución

La aplicación **no requiere compilación, Node.js ni instalación de dependencias**:
son archivos estáticos. Sin embargo, **no funciona abriendo `index.html` con doble
clic** (protocolo `file://`), porque Service Worker, cámara y geolocalización exigen
un *contexto seguro*. Debe servirse por **HTTPS o desde `localhost`**:

```bash
python -m http.server 8080
```

Después, abrir `http://localhost:8080`. La versión publicada ya cumple este requisito
por servirse desde GitHub Pages bajo HTTPS.

> **¿Por qué esta sección?** Declarar las versiones exactas hace el proyecto
> **reproducible**: quien lo retome dentro de un año sabrá contra qué versiones se
> probó. También justifica por qué Materialize y QRCode.js están *versionados dentro
> del repositorio* (para que la aplicación siga funcionando sin conexión) mientras
> que Firebase y Leaflet se cargan desde CDN.

---

## 6. Estructura del proyecto

```
UberEatsCUDEC/
├── index.html              # Pantalla de inicio: catálogo y alta de platillos
├── manifest.json           # Manifiesto PWA: nombre, iconos, colores, display
├── sw.js                   # Service Worker: caché y modo sin conexión
├── firestore.rules         # Reglas de seguridad de la base de datos
├── README.md               # Este documento
│
├── pages/
│   ├── pedidos.html        # Registro de pedidos, mapa y código QR
│   ├── about.html          # Acerca de la aplicación
│   └── contact.html        # Datos de contacto
│
├── js/
│   ├── ui.js               # Inicializa Materialize y registra el Service Worker
│   ├── firebase.js         # Configuración de Firebase; expone la variable `db`
│   ├── index.js            # Renderizado de tarjetas y control de la cámara
│   ├── db.js               # Sincronización y CRUD de la colección `platillos`
│   ├── pedidos.js          # Pedidos, geolocalización, mapa y código QR
│   ├── materialize.min.js  # Librería Materialize (local)
│   └── qrcode.min.js       # Librería QRCode.js (local)
│
├── css/
│   ├── styles.css          # Estilos propios del proyecto
│   └── materialize.min.css # Framework Materialize (local)
│
├── img/
│   ├── Comida_def.jpg      # Imagen por defecto cuando un platillo no tiene foto
│   ├── Logo.jpg            # Logotipo
│   ├── Supreme_pizza.jpg   # Imagen de muestra
│   └── dish.png            # Imagen de muestra
│
├── iconos/                 # 15 iconos PWA (16→512 px, incluidos 2 maskable)
│
└── capturas/               # Evidencias / capturas de pantalla (sección 7)
```

### Orden de carga de los scripts

El orden de las etiquetas `<script>` **no es intercambiable**:

```
SDK de Firebase  →  ui.js  →  firebase.js  →  [qrcode.min.js]  →  index.js / db.js / pedidos.js
```

`firebase.js` necesita que el SDK ya esté cargado para inicializar la aplicación, y
`db.js` y `pedidos.js` necesitan la variable `db` que aquel define. Alterar este orden
produce un error de `firebase is not defined` o deja la lista de platillos vacía.

### Separación de responsabilidades

- **`ui.js` se carga en las cuatro páginas** porque no depende de Firebase ni de
  ningún elemento concreto: solo inicializa componentes de Materialize y registra el
  Service Worker.
- **`index.js` y `db.js` solo se cargan en `index.html`**; `pedidos.js` solo en
  `pages/pedidos.html`. Cada archivo comprueba la existencia de los elementos que
  necesita antes de asociar eventos, para no fallar si se carga donde no corresponde.

> **¿Por qué esta sección?** Un mapa de archivos permite ubicar cualquier
> funcionalidad en segundos. El apartado del orden de carga documenta una dependencia
> **implícita y frágil** que no se deduce leyendo un solo archivo: es exactamente el
> tipo de información que un README debe preservar.

---

## 7. Evidencias / capturas de pantalla

> **Pendiente:** las imágenes deben agregarse en la carpeta `capturas/` con los
> nombres indicados abajo. Los enlaces ya están escritos, así que las capturas se
> mostrarán automáticamente en cuanto los archivos existan.

### 7.1 Inicio

Catálogo de platillos sincronizado desde Firestore, con imagen, nombre, ingredientes,
precio y botón de eliminación por tarjeta.

![Pantalla de inicio](capturas/01-inicio.png)

### 7.2 Registrar platillo

Formulario lateral con los campos de nombre, ingredientes y precio, junto con los
botones de cámara y la vista previa de la foto capturada.

![Registrar platillo](capturas/02-registrar-platillo.png)

### 7.3 Realizar pedido (al terminar de hacer el pedido)

Pantalla de pedidos después de guardar: código QR generado, mapa con la ubicación
marcada y dirección obtenida por geocodificación inversa.

![Pedido registrado](capturas/03-pedido-realizado.png)

### 7.4 Acerca

![Acerca](capturas/04-acerca.png)

### 7.5 Contacto

![Contacto](capturas/05-contacto.png)

### Capturas requeridas

| Archivo | Qué debe mostrar |
|---|---|
| `capturas/01-inicio.png` | `index.html` con al menos dos platillos en la lista |
| `capturas/02-registrar-platillo.png` | Menú lateral de alta abierto, con la foto ya capturada |
| `capturas/03-pedido-realizado.png` | `pedidos.html` tras guardar: QR visible y mapa con el marcador |
| `capturas/04-acerca.png` | `pages/about.html` |
| `capturas/05-contacto.png` | `pages/contact.html` |

> **¿Por qué esta sección?** Las capturas son la **evidencia de que la aplicación
> ejecuta**, no solo de que el código existe. Permiten evaluar el resultado sin
> instalar nada y dejan constancia del estado del proyecto en la fecha de entrega,
> algo especialmente valioso aquí, donde el sitio depende de un servicio en la nube
> que puede cambiar de configuración después.

---

## 8. Base de datos

### Motor

**Cloud Firestore** (Firebase), base de datos **NoSQL orientada a documentos**.

- **Proyecto Firebase:** `appmovil-a6da0`
- **Acceso:** SDK web *compat* 10.12.2, cargado por CDN
- **Configuración:** `js/firebase.js`
- **Modo de consulta:** escuchas en tiempo real (`onSnapshot`), no lecturas puntuales

Se eligió Firestore porque su modelo de **escucha en tiempo real** cubre directamente
el objetivo de mantener el menú sincronizado entre dispositivos, sin necesidad de
programar un servidor propio, un *endpoint* de API ni un mecanismo de sondeo.

### Colecciones

#### `platillos`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | `string` | Nombre del platillo (1–100 caracteres) |
| `ingredientes` | `string` | Lista de ingredientes (hasta 500 caracteres) |
| `precio` | `number` | Precio en MXN, mayor o igual a cero |
| `foto` | `string` | Imagen en *data URL* JPEG base64 (hasta 400 000 caracteres) |
| `creado` | `timestamp` | Fecha de alta (`serverTimestamp()`) |

#### `pedidos`

| Campo | Tipo | Descripción |
|---|---|---|
| `platilloId` | `string` | ID del documento del platillo pedido |
| `platillo` | `string` | Copia del nombre del platillo al momento del pedido |
| `nombre` | `string` | Nombre del cliente (1–100 caracteres) |
| `direccion` | `string` | Dirección de entrega (1–500 caracteres) |
| `creado` | `timestamp` | Fecha del pedido (`serverTimestamp()`) |

### Decisiones de diseño

- **La foto se guarda dentro del documento**, no en Firebase Storage. Por eso se
  comprime a JPEG al 70 % y 320 px de ancho: Firestore limita cada documento a 1 MiB,
  y las reglas refuerzan ese límite rechazando cadenas de más de 400 000 caracteres.
- **`pedidos` duplica el nombre del platillo a propósito.** Firestore no tiene *joins*
  ni integridad referencial; si solo se guardara el `platilloId` y el platillo se
  borrara del catálogo, el pedido quedaría ilegible. Guardar ambos preserva el
  histórico.
- **Los pedidos no se editan ni se borran** desde la aplicación: las reglas los
  declaran de solo escritura-una-vez (`allow update, delete: if false`), para que el
  registro histórico no pueda alterarse desde el cliente.

### Reglas de seguridad

El archivo **`firestore.rules`** contiene las reglas del proyecto. Validan el tipo y
la longitud de cada campo del lado del servidor, de modo que la validación no dependa
únicamente del JavaScript del navegador —que cualquiera puede saltarse—. La última
regla cierra todo lo que no esté declarado explícitamente.

> ### ⚠️ Estado actual de la base de datos
>
> **Las reglas de `firestore.rules` no están publicadas en la consola de Firebase.**
> Al momento de escribir este documento, la base de datos responde
> `PERMISSION_DENIED` a cualquier lectura de `platillos`, por lo que la aplicación
> publicada muestra el catálogo vacío con el aviso de error.
>
> **El archivo `firestore.rules` por sí solo no aplica nada.** Para activarlo:
>
> 1. Entrar a la [consola de Firebase](https://console.firebase.google.com/) → proyecto `appmovil-a6da0`
> 2. **Firestore Database → pestaña Reglas**
> 3. Pegar el contenido de `firestore.rules` y pulsar **Publicar**
>
> La causa habitual es que el *modo de prueba* de Firebase **caduca a los 30 días** y
> a partir de ese momento bloquea todas las lecturas y escrituras.

> ### 🔓 Limitación conocida: la aplicación no tiene autenticación
>
> Las reglas dejan el catálogo **abierto a cualquiera que conozca el `projectId`**:
> se puede leer, crear y **eliminar** platillos, y **leer todos los pedidos** —que
> incluyen nombre y dirección de clientes— sin identificarse.
>
> Es aceptable para una práctica de clase, pero **no debe usarse con datos reales**.
> El propio `firestore.rules` incluye, comentada al final, la versión recomendada con
> Firebase Auth (`request.auth != null`) para cuando se requiera un uso real.

> **¿Por qué esta sección?** La base de datos es la única parte del proyecto que
> **no vive en el repositorio**: se configura en un panel externo. Sin esta
> documentación, clonar el código no basta para que la aplicación funcione. Describir
> el esquema, las decisiones y el estado real de las reglas es lo que hace el proyecto
> reproducible.

---

## 9. Licencia

Este proyecto se distribuye bajo la **Licencia MIT** (ver el archivo [`LICENSE`](LICENSE)).

### Licencia

Este proyecto fue desarrollado con fines académicos como parte de la carrera de
**Ingeniería en Sistemas Computacionales**, para la materia de **Taller de
Programación Avanzada II**, del grupo **ISC182** en la **Universidad Multicultural
CUDEC**.

El código se ofrece **con fines educativos y sin garantía de ningún tipo**. Puede
reutilizarse y adaptarse libremente citando la autoría original. No está destinado a
un entorno de producción: carece de autenticación de usuarios y sus reglas de
seguridad son deliberadamente permisivas para fines demostrativos.

### ¿Por qué MIT y no una licencia Creative Commons?

Es una duda frecuente en los proyectos escolares. La razón es que **Creative Commons
desaconseja expresamente el uso de sus licencias para software**: están redactadas
para obras culturales (textos, imágenes, música) y no contemplan conceptos propios del
software como el código fuente, la vinculación de librerías o la exención de
responsabilidad por defectos.

Para un trabajo académico de programación, **MIT** es la opción estándar:

- Es **permisiva y muy breve** (unas 20 líneas), fácil de justificar en una entrega.
- **Exige conservar el aviso de autoría**, lo que protege el crédito del alumno.
- Incluye una **exención de garantía** explícita, importante en un proyecto que no
  está endurecido para producción.
- Es **compatible con Materialize CSS**, que ya se distribuye bajo MIT y forma parte
  de este repositorio.

Si el requisito fuera prohibir expresamente el uso comercial, la alternativa sería
**CC BY-NC 4.0**; se descarta aquí por lo explicado arriba y porque una cláusula
*NonCommercial* complica la reutilización del código con fines didácticos.

> **¿Por qué esta sección?** Sin una licencia declarada, el código queda por defecto
> bajo **todos los derechos reservados**: legalmente nadie podría reutilizarlo, ni
> siquiera un compañero de clase con fines de estudio. Declararla es lo que convierte
> el repositorio en material realmente consultable, y la nota académica deja claro que
> se trata de un trabajo escolar y no de un producto comercial.

---

## Créditos de terceros

- [Materialize CSS](https://materializecss.com/) — MIT License
- [Leaflet](https://leafletjs.com/) — BSD-2-Clause
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) — MIT License
- [OpenStreetMap](https://www.openstreetmap.org/copyright) — ODbL. Los datos del mapa
  y de la geocodificación inversa son © colaboradores de OpenStreetMap.
- [Firebase](https://firebase.google.com/) — SDK de Google, Apache 2.0

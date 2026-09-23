# Documentación de archivos de datos de hoteles

Esta carpeta (`src/data/`) contiene los tres archivos que gestionan toda la información de los hoteles del motor de agencias de GEH Suites. Cada archivo tiene un propósito distinto y juntos cubren todas las pantallas del sistema.

```
src/data/
├── hotelesConfig.js        ← fuente única de verdad para el motor de reservas
├── hoteles.json            ← contenido de las páginas de información de cada hotel
└── hoteles-destinos.json   ← listado de hoteles para la página de destinos (home)
```

---

---
# Explicación de hotelesConfig.js
---

## 1. `hotelesConfig.js`

### ¿Qué es?

La **fuente única de verdad** de todos los datos de los hoteles para el motor de reservas. Antes de este archivo, cada dato (imágenes, íconos, habitaciones, configuración de Booking Connect, etc.) estaba duplicado y disperso en seis o más componentes. Ahora esos componentes leen sus datos desde aquí, por lo que **añadir o modificar un hotel solo requiere editar este archivo**.

### Estructura del archivo

```
hotelesConfig.js
│
├── export const HOTELES = { ... }   ← objeto principal con los 17 hoteles
│
└── export function getHotelById(id)
    export function getHotelByNombre(nombre)
    export function getHotelIdByNombre(nombre)
    export function getHabitacionByRoomId(roomId)
    export function getImagenesCotizacion(hotelId)
```

### El objeto `HOTELES`

`HOTELES` es un objeto cuyas **claves son los IDs numéricos** de los hoteles y cuyos **valores son objetos con todos los datos** de cada hotel. Usar el ID como clave permite acceso directo en O(1): `HOTELES[4]` devuelve el Hotel Aixo.

```js
export const HOTELES = {
  1: { id: 1, nombre: "Hotel Azuan Suites", ... },
  4: { id: 4, nombre: "Hotel Aixo",         ... },
  // ...
};
```

### Campos de cada hotel

#### `id` — número
Identificador numérico del hotel. Es el mismo ID que usa RoomCloud/Booking Connect en sus respuestas de disponibilidad. **La clave del objeto y el campo `id` siempre deben coincidir.**

#### `nombre` — string
Nombre completo y oficial. Se usa en cotizaciones, modal de upgrade y cualquier texto donde se necesite el nombre completo.

#### `nombreCorto` — string
Versión abreviada del nombre para espacios reducidos (tarjetas de reserva, encabezados). A veces igual al `nombre`, a veces más corto:
```js
nombre:      "Hotel Azuan Suites"   →   nombreCorto: "Hotel Azuan"
nombre:      "Hotel Windsor House"  →   nombreCorto: "Hotel Windsor"
```

#### `nombreStorage` — string
Slug (minúsculas, sin espacios) que identifica al hotel en rutas de almacenamiento, `localStorage` y en el mapa de imágenes de `BookingConnectIA.jsx`.

#### `ciudad` — string (enum)
Ciudad del hotel. Solo acepta estos tres valores exactos:

| Valor | Ciudad |
|-------|--------|
| `"CARTAGENA"` | Cartagena de Indias |
| `"SANTA_MARTA"` | Santa Marta |
| `"BOGOTA"` | Bogotá |

#### `direccion` — string
Dirección física completa. Se muestra en disponibilidad y cotizaciones.

#### `descripcion` — string
Texto descriptivo largo. Se muestra en la pantalla de disponibilidad (`DisponibilidadH.jsx`).

#### `leermas` — string
Ruta relativa de la página de información del hotel (ej. `"/infoazuan"`). Se usa como enlace "Leer más" en disponibilidad.

#### `mapa` — string | `null`
URL de Google Maps. `null` cuando el hotel no tiene pin configurado (ej. Hotel Rodadero).

#### `imgBusqueda` — string (URL)
Imagen para las tarjetas de resultados de búsqueda (`Componentesearch.jsx`). Suele ser la fachada del hotel.

#### `imgDetalle` — string (URL)
Imagen para la pantalla de disponibilidad (`DisponibilidadH.jsx`). Puede ser igual a `imgBusqueda` o diferente.

#### `imgUpgrade` — string (URL) | `null`
Imagen para el modal de upgrade de habitación (`hotelUpgrades.js`). `null` indica que el hotel no participa del sistema de upgrade y es excluido automáticamente:
```js
export const HOTEL_FACADE_IMAGES = Object.fromEntries(
  Object.values(HOTELES).filter(h => h.imgUpgrade).map(h => [h.id, h.imgUpgrade])
);
```

#### `imgGestionar` — string (URL)
Imagen para la página de gestión de reservas (`GestionarReservas/InfoHoteles.js`).

#### `imgCotizacion` — objeto `{ main, secondary1, secondary2 }`
Tres imágenes para las páginas de cotización y el correo de cotización:
```js
imgCotizacion: {
  main:       "...",   // imagen principal
  secondary1: "...",   // imagen secundaria 1
  secondary2: "...",   // imagen secundaria 2
}
```

#### `iconos` — array de URLs
Íconos de servicios del hotel. Cada URL apunta a un ícono en DigitalOcean Spaces. Íconos disponibles:

| Archivo | Servicio |
|---------|----------|
| `iconplaya.png` | Acceso a playa |
| `iconcoffee.png` | Desayuno / café |
| `iconbuffet.png` | Buffet |
| `iconpool.png` | Piscina |
| `iconparking.png` | Parqueadero |
| `iconvan.png` | Transporte |
| `iconwind.png` | Aire acondicionado |
| `icongym.png` | Gimnasio |
| `pet-friendly-...png` | Pet friendly |

#### `habitaciones` — objeto `{ [roomId]: { url, name } }`
Mapa de habitaciones donde cada clave es el ID de RoomCloud:
```js
habitaciones: {
  68073: { url: "https://...", name: "Habitación Doble Estándar" },
  68074: { url: "https://...", name: "Habitación Triple" },
}
```
Hotels sin habitaciones activas usan `habitaciones: {}` (ej. Hotel Zulita).

#### `roomsMapName` — array de `{ roomId, mapName }` | `null`
Mapeo entre IDs de RoomCloud y los nombres internos de **Booking Connect**. `null` indica sin integración de Booking Connect o sin mapeo:
```js
roomsMapName: [
  { roomId: 68073, mapName: "Doble" },
  { roomId: 68074, mapName: "Triple" },
]
```
Hoteles con `roomsMapName: null`: Bocagrande (7), Hotel 1525 (2), Boquilla (56), Zulita (41).

#### `motivoId` — número | `null`
ID del "motivo" en Booking Connect. Valores actuales: `7` (Azuan, Madisson, Windsor) o `8` (la mayoría). `null` = no integrado con Booking Connect (Bocagrande, 1525, Zulita).

#### `quintuple` — boolean
`true` si el hotel ofrece habitaciones quíntuples (5 personas). Controla si el buscador muestra esa opción.

#### `planAlimentacionDisponibilidad` — boolean
`true` si se muestra el selector de plan de alimentación en la pantalla de disponibilidad.

#### `planAlimentacionFormulario` — boolean
`true` si se muestra el plan de alimentación en el formulario de reserva. **Deliberadamente separado del campo anterior** porque algunos hoteles los muestran en pantallas distintas.

#### `ubicacionGestionar` — string
Versión de la dirección con formato específico para la página de gestión de reservas.

#### `nombreVariants` — array de strings (todos en minúsculas)
Variantes del nombre para búsqueda flexible con `getHotelByNombre()`. Permite encontrar el hotel aunque el texto de entrada use nombres alternativos.

---

### Tabla resumen de los 17 hoteles

| ID | Nombre | Ciudad | motivoId | roomsMapName | quintuple |
|----|--------|--------|----------|:------------:|:---------:|
| 1 | Hotel Azuan Suites | CARTAGENA | 7 | ✓ | ✗ |
| 4 | Hotel Aixo | CARTAGENA | 2 | ✓ | ✗ |
| 5 | Hotel Abi | CARTAGENA | 8 | ✓ | ✗ |
| 6 | Hotel Avexi | CARTAGENA | 8 | ✓ | ✗ |
| 7 | Hotel Bocagrande | CARTAGENA | null | null | ✗ |
| 9 | Hotel Marina | CARTAGENA | 8 | ✓ | ✗ |
| 56 | Hotel Boquilla | CARTAGENA | 8 | null | ✗ |
| 164 | Hotel El Marques | CARTAGENA | 8 | ✓ | ✗ |
| 221 | Patio Corao Hotel Boutique | CARTAGENA | 8 | ✓ | ✗ |
| 2 | Hotel 1525 | SANTA_MARTA | null | null | ✗ |
| 8 | Hotel Rodadero | SANTA_MARTA | 8 | ✓ | ✓ |
| 44 | Hotel Sansiraka | SANTA_MARTA | 8 | ✓ | ✓ |
| 48 | Hotel Axis Inn | SANTA_MARTA | 8 | ✓ | ✓ |
| 123 | Playa Salguero Hotel | SANTA_MARTA | 8 | ✓ | ✗ |
| 3 | Hotel Madisson | BOGOTA | 7 | ✓ | ✗ |
| 10 | Hotel Windsor House | BOGOTA | 7 | ✓ | ✗ |
| 41 | Hotel Zulita | BOGOTA | null | null | ✗ |

---

### Funciones helper exportadas

#### `getHotelById(id)`
Devuelve el objeto completo del hotel por su ID, o `null` si no existe.
```js
getHotelById(1)   // → { id: 1, nombre: "Hotel Azuan Suites", ... }
getHotelById(999) // → null
```
Usado en `Cotizacion.jsx`, `CotizacionCreada.jsx`, `CotizacionPublica.jsx`:
```js
const nombreHotelId    = (id) => getHotelById(id)?.nombreCorto || "Hotel no encontrado";
const direccionHotelId = (id) => getHotelById(id)?.direccion   || "Dirección no disponible";
```

#### `getHotelByNombre(nombre)`
Devuelve el objeto completo del hotel buscando por nombre (case-insensitive). Busca en:
1. `nombreVariants[]`
2. `nombre`
3. `nombreCorto`

```js
getHotelByNombre("Hotel Azuan")         // ✓ por nombreCorto
getHotelByNombre("HOTEL AZUAN SUITES")  // ✓ por nombre (ignora mayúsculas)
getHotelByNombre("hotel azuan")         // ✓ por nombreVariants
getHotelByNombre("azuan")               // ✗ null (no es coincidencia exacta)
```
Usado en `GestionarReservas/InfoHoteles.js` para obtener imagen y ubicación del hotel.

#### `getHotelIdByNombre(nombre)`
Igual que `getHotelByNombre()` pero devuelve solo el ID. Retorna `undefined` si no hay coincidencia.
```js
getHotelIdByNombre("Hotel Sansiraka")  // → 44
```

#### `getHabitacionByRoomId(roomId)`
Busca una habitación por su ID en todos los hoteles. Retorna `{ url, name }` o `null`.
```js
getHabitacionByRoomId(68073) // → { url: "https://...", name: "Habitación Doble" }
```

#### `getImagenesCotizacion(hotelId)`
Devuelve `{ main, secondary1, secondary2 }` del hotel, o imágenes por defecto si no existen.

---

### Cómo cada componente usa los datos

| Componente | Campos de hotelesConfig que usa |
|------------|--------------------------------|
| `Componentesearch.jsx` | `imgBusqueda`, `iconos` |
| `DisponibilidadH.jsx` | `nombre`, `direccion`, `descripcion`, `imgDetalle`, `leermas`, `mapa`, `iconos`, `habitaciones`, `quintuple`, `nombreStorage`, `planAlimentacionDisponibilidad` |
| `FormularioReserva.jsx` | `planAlimentacionFormulario`, `motivoId`, `roomsMapName` |
| `Cotizacion.jsx` / `CotizacionCreada.jsx` / `CotizacionPublica.jsx` | `nombreCorto`, `direccion` |
| `hotelesImagenes.js` | `imgCotizacion` |
| `GestionarReservas/InfoHoteles.js` | `imgGestionar`, `ubicacionGestionar`, `habitaciones` |
| `hotelUpgrades.js` | `imgUpgrade`, `nombre` |

---

### Guía paso a paso: cómo añadir un nuevo hotel

**Paso 1 — Conseguir el ID del hotel**
El ID es el número que RoomCloud usa en sus respuestas de disponibilidad (campo `hotel.id` en el JSON de la API).

**Paso 2 — Subir las imágenes al CDN**
Sube todas las imágenes a DigitalOcean Spaces en el bucket `Agencias`. Necesitarás: `imgBusqueda`, `imgDetalle`, `imgUpgrade`, `imgGestionar`, y las tres de `imgCotizacion`.

**Paso 3 — Añadir la entrada en `HOTELES`**
Abre `src/data/hotelesConfig.js` y añade dentro del objeto `HOTELES`, en la sección de la ciudad correcta:

```js
300: {
  id: 300,
  nombre: "Hotel Nuevo",
  nombreCorto: "Hotel Nuevo",
  nombreStorage: "hotelnuevo",
  ciudad: "CARTAGENA",
  direccion: "Cra. 5 #10-20, Bocagrande, Cartagena",
  descripcion: "Descripción completa del hotel...",
  leermas: "/infohotelnuevo",
  mapa: "https://maps.google.com/...",
  imgBusqueda:  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo.jpg",
  imgDetalle:   "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo.jpg",
  imgUpgrade:   "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo.jpg",
  imgGestionar: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-gestionar.webp",
  imgCotizacion: {
    main:       "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-main.jpg",
    secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-sec1.jpg",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-sec2.jpg",
  },
  iconos: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
  ],
  habitaciones: {
    999001: { url: "https://...", name: "Habitación Doble" },
    999002: { url: "https://...", name: "Habitación Triple" },
  },
  roomsMapName: [
    { roomId: 999001, mapName: "Doble" },
    { roomId: 999002, mapName: "Triple" },
  ],
  // roomsMapName: null  ← si no usa Booking Connect
  motivoId: 8,       // 7 u 8 según el hotel. null si no usa Booking Connect
  quintuple: false,
  planAlimentacionDisponibilidad: false,
  planAlimentacionFormulario: false,
  ubicacionGestionar: "Bocagrande, Carrera 5 #10-20, Cartagena",
  nombreVariants: ["hotel nuevo"],
},
```

**Paso 4 — Verificar con `npm run build`**
Los errores de sintaxis (comas faltantes o sobrantes) aparecen aquí.

**Paso 5 — Actualizar `BookingConnectIA.jsx`** (si el hotel usa Booking Connect)
Añade las imágenes en `hotelImagesMap` usando `nombreStorage` como clave, y añade patrones en `detectHotelsInText()`.

**Paso 6 — Commit y push**
```bash
git add src/data/hotelesConfig.js
git commit -m "Añadir Hotel Nuevo (id: 300)"
git push
```

---

---
# Explicación de hoteles.json
---

## 2. `hoteles.json`

### ¿Qué es?

Contiene el **contenido completo de las páginas de información de cada hotel** (`/infoazuan`, `/info1525`, etc.). Estas son las páginas estáticas de marketing donde el huésped o la agencia puede conocer el hotel antes de reservar.

No se importa en los componentes del motor de reservas. Lo consume la capa de páginas Astro que genera las rutas `/info[hotel]`.

### Estructura del archivo

```json
{
  "estilos": [ ... ],
  "hoteles": [ ... ]
}
```

---

### Sección `estilos`

Array de 8 plantillas CSS (identificadas `g1` a `g8`). Cada hotel elige cuál plantilla usa mediante el campo `estilo`. Cada entrada tiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador de la plantilla (`"g1"`, `"g2"`, ..., `"g8"`) |
| `css` | string | Bloque CSS completo que se inyecta en la página del hotel |

Las plantillas más recientes (`g2`, `g3`) incluyen `@media` queries para mobile y tablet. Las antiguas (`g1`, `g5`, `g6`) solo tienen el breakpoint `480px`.

**Para cambiar el diseño de una página de hotel:** cambia el valor de `estilo` en la entrada del hotel (de `"g1"` a `"g3"`, por ejemplo), o edita el CSS dentro del estilo correspondiente.

---

### Sección `hoteles`

Array de 20 entradas (incluye hoteles activos y algunos en preparación como `danubio`, `jardines`, `sabana`). Cada entrada representa el contenido de una página de información.

#### `slug` — string
Identificador de la ruta. La página `/infoazuan` consume el hotel con `slug: "azuan"`. Debe coincidir con el segmento final de la ruta `leermas` en `hotelesConfig.js`.

#### `titulo` — string
Título de la página que se muestra en el encabezado (`<h1>`).

#### `tituloStyle` — string | `null`
CSS inline opcional para el título. `null` en la mayoría de los hoteles.

#### `estilo` — string
Qué plantilla CSS usar. Debe ser uno de los `id` del array `estilos` (`"g1"` a `"g8"`).

#### `carrusel` — array de strings (URLs)
Imágenes del carrusel principal de la página. Mínimo 1, habitualmente 3-5 imágenes.

```json
"carrusel": [
  "https://q-xx.bstatic.com/xdata/images/hotel/1280x964/276804084.webp?...",
  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/sala1525.jpg"
]
```

#### `galeria` — array | `null`
Galería adicional de imágenes. `null` si no se usa en ese hotel.

#### `introduccion` — array de strings
Párrafos de la descripción del hotel. Cada elemento es un párrafo independiente.

```json
"introduccion": [
  "Hotel 1525 By GEH Suites, está ubicado en el Centro Histórico...",
  "Segundo párrafo opcional..."
]
```

#### `destacados` — array de `{ icono, texto }`
Servicios destacados que aparecen prominentemente en la página (con ícono grande). Cada entrada:

| Campo | Descripción |
|-------|-------------|
| `icono` | URL del ícono (DigitalOcean Spaces) |
| `texto` | Texto descriptivo del servicio (ej. `"Cerca a la playa"`) |

```json
"destacados": [
  { "icono": "https://...iconplaya.png", "texto": "Cerca a la playa" },
  { "icono": "https://...iconwind.png",  "texto": "Aire acondicionado" }
]
```

#### `generales` — array de `{ icono, texto }`
Lista completa de servicios generales del hotel. Misma estructura que `destacados`. Suele usar el ícono `Iconcheck.png` para todos los ítems:

```json
"generales": [
  { "icono": "https://...Iconcheck.png", "texto": "Lavandería/Tintorería" },
  { "icono": "https://...Iconcheck.png", "texto": "Recepción 24 horas" },
  { "icono": "https://...Iconcheck.png", "texto": "Wifi gratuito" }
]
```

#### `contacto` — objeto `{ telefono, direccion, mapsUrl }`
Información de contacto que aparece en el footer de la página del hotel:

| Campo | Descripción |
|-------|-------------|
| `telefono` | Número de teléfono con código de país (ej. `"+57 3336025669"`) |
| `direccion` | Dirección física del hotel |
| `mapsUrl` | URL completa de Google Maps |

#### `habitaciones` — array de objetos
Descripción de las habitaciones del hotel para la página de información. Cada habitación tiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | string | Nombre de la habitación (ej. `"Habitación Doble Estándar"`) |
| `descripcion` | string | Descripción breve de la habitación |
| `imagenPrincipal` | string (URL) | Imagen principal de la habitación |
| `imagenesSecundarias` | array de URLs | Imágenes adicionales (galería) |
| `iconos` | array de strings | Características con emojis (ej. `"🛏 1 cama doble"`, `"📶 Wifi gratuito"`) |
| `instalaciones` | array de `{ titulo, items[] }` | Secciones de instalaciones con lista de texto |

Ejemplo completo de una habitación:
```json
{
  "nombre": "Habitación Doble Estándar",
  "descripcion": "Habitación acogedora con cama doble, ideal para parejas.",
  "imagenPrincipal": "https://cf.bstatic.com/...",
  "imagenesSecundarias": ["https://cf.bstatic.com/...", "https://cf.bstatic.com/..."],
  "iconos": ["🛏 1 cama doble", "📶 Wifi gratuito", "❄️ Aire acondicionado"],
  "instalaciones": [
    {
      "titulo": "Instalaciones",
      "items": ["Aire acondicionado", "Caja de seguridad", "Baño con ducha", "TV Satelital"]
    }
  ]
}
```

#### `proteccion` — boolean
`true` indica que la página tiene algún mecanismo de protección o restricción de acceso activo.

---

### Lista de hoteles en `hoteles.json`

| slug | Página de información |
|------|----------------------|
| `1525` | `/info1525` |
| `abi` | `/infoabi` |
| `aixo` | `/infoaixo` |
| `avexi` | `/infoavexi` |
| `axis` | `/infoaxis` |
| `azuan` | `/infoazuan` |
| `bocagrande` | `/infobocagrande` |
| `boquilla` | `/infoboquilla` |
| `patiocorao` | `/infopatiocorao` |
| `danubio` | `/infodanubio` *(en preparación)* |
| `jardines` | `/infojardines` *(en preparación)* |
| `madisson` | `/infomadisson` |
| `marina` | `/infomarina` |
| `marques` | `/infomarques` |
| `rodadero` | `/inforodadero` |
| `sabana` | `/infosabana` *(en preparación)* |
| `salguero` | `/infosalguero` |
| `sansiraka` | `/infosansiraka` |
| `windsor` | `/infowindsor` |
| `zulita` | `/infozulita` |

---

### Cómo añadir o modificar el contenido de una página de información

**Modificar texto de un hotel existente:** busca el hotel por su `slug` en el array `hoteles[]` y edita el campo que corresponda (`titulo`, `introduccion`, `descripcion` de una habitación, etc.).

**Añadir una habitación a un hotel:** añade un objeto nuevo al final del array `habitaciones[]` del hotel, con los campos `nombre`, `descripcion`, `imagenPrincipal`, `imagenesSecundarias`, `iconos` e `instalaciones`.

**Cambiar la plantilla visual:** cambia el campo `estilo` del hotel (ej. de `"g1"` a `"g3"`). Las plantillas más modernas con responsive son `g2` y `g3`.

**Añadir un nuevo hotel:** añade una entrada nueva al array `hoteles[]` con todos los campos. El `slug` debe coincidir con el segmento de la ruta (`leermas`) definida en `hotelesConfig.js`.

---

---
# Explicación de hoteles-destinos.json
---

## 3. `hoteles-destinos.json`

### ¿Qué es?

Contiene el **listado de hoteles que aparece en la página de destinos del home** (la sección donde se muestran los hoteles agrupados por ciudad). Es la tarjeta de presentación pública de cada hotel antes de que el usuario entre a buscar disponibilidad o leer más información.

### Estructura del archivo

```json
{
  "destinos": [
    { "id": "cartagenadeindias", "titulo": "...", "descripcion": "...", "hoteles": [...] },
    { "id": "bogota",            "titulo": "...", "descripcion": "...", "hoteles": [...] },
    { "id": "santamarta",        "titulo": "...", "descripcion": "...", "hoteles": [...] }
  ]
}
```

### Campos del objeto `destino`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único del destino (`"cartagenadeindias"`, `"bogota"`, `"santamarta"`) |
| `titulo` | string | Nombre del destino que se muestra en el encabezado de sección |
| `descripcion` | string | Texto introductorio de la sección del destino |
| `hoteles` | array | Lista de hoteles del destino (ver campos abajo) |

### Campos de cada hotel en `hoteles-destinos.json`

#### `nombre` — string
Nombre del hotel que se muestra en la tarjeta.

#### `nombreStyle` — string | `null`
CSS inline para ajustar el estilo del nombre (ej. reducir tamaño de fuente cuando el nombre es largo). `null` en la mayoría de los casos. Ejemplo de uso:
```json
"nombreStyle": "font-size: 15px;"
```

#### `alt` — string
Texto alternativo de la imagen principal. Importante para SEO y accesibilidad.

#### `img` — string (URL)
Imagen principal de la tarjeta del hotel en la página de destinos. Puede ser diferente a `imgBusqueda` de `hotelesConfig.js`.

#### `width` — número
Ancho sugerido para la imagen en píxeles (300 o 400). Controla el tamaño de renderizado.

#### `logo` — string (URL)
Imagen del logo del hotel. Todos los logos están en DigitalOcean Spaces con el patrón `logo[nombrehotel].png`:
```
https://space-img.sfo3.digitaloceanspaces.com/Agencias/logoazuan.png
https://space-img.sfo3.digitaloceanspaces.com/Agencias/logoaixo.png
```

#### `logoStyle` — string | `null`
CSS inline para ajustar el logo (ej. `"width: 100px;"`). `null` en la mayoría de los casos.

#### `especial` — objeto `{ src, clase }` | `null`
Badge o sello especial que aparece sobre la tarjeta del hotel. `null` si el hotel no tiene insignia especial. Cuando existe:

| Campo | Descripción |
|-------|-------------|
| `src` | URL de la imagen del badge |
| `clase` | Clase CSS que posiciona el badge (`"especial"` o `"especiall"`) |

Actualmente solo Boquilla y Axis tienen badge especial (el mismo archivo PNG).

#### `iconos` — array de strings
Lista de claves de íconos de servicios. A diferencia de `hotelesConfig.js` donde se usan URLs completas, aquí se usan **claves cortas** que la plantilla convierte a íconos:

| Clave | Servicio |
|-------|----------|
| `"playa"` | Acceso a playa |
| `"coffee"` | Desayuno / café |
| `"buffet"` | Buffet |
| `"pool"` | Piscina |
| `"parking"` | Parqueadero |
| `"van"` | Transporte |
| `"wind"` | Aire acondicionado |
| `"gym"` | Gimnasio |
| `"pet"` | Pet friendly |

#### `url` — string
Ruta relativa a la página de información del hotel (ej. `"/infoazuan"`). Debe coincidir con `leermas` en `hotelesConfig.js`.

---

### Hoteles por destino

**Cartagena de Indias (8 hoteles):** Aixo Suites, El Marqués, Avexi Suites, Azuan Suites, Abi Inn, Marina Suites, Boquilla Suites, Patio Corao

**Bogotá (2 hoteles):** Madisson Inn, Windsor House

**Santa Marta (4 hoteles):** Rodadero Inn, Axis Inn, Sansiraka, Playa Salguero

*Nota: Hotel Bocagrande, Hotel 1525 y Hotel Zulita no aparecen en `hoteles-destinos.json` (no tienen tarjeta en la página de destinos).*

---

### Cómo añadir un nuevo hotel a la página de destinos

1. Decide en qué destino va el hotel (`"cartagenadeindias"`, `"bogota"` o `"santamarta"`).
2. Sube el logo al CDN con el patrón `logo[nombrehotel].png`.
3. Añade una entrada nueva al array `hoteles[]` del destino correspondiente:

```json
{
  "nombre": "Hotel Nuevo",
  "nombreStyle": null,
  "alt": "Hotel Nuevo",
  "img": "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo.jpg",
  "width": 300,
  "logo": "https://space-img.sfo3.digitaloceanspaces.com/Agencias/logohotelnuevo.png",
  "logoStyle": null,
  "especial": null,
  "iconos": ["playa", "coffee", "pool", "parking", "pet"],
  "url": "/infohotelnuevo"
}
```

---

## Relación entre los tres archivos

```
hotelesConfig.js          hoteles.json             hoteles-destinos.json
─────────────────         ────────────             ─────────────────────
Motor de reservas    ←→   Páginas /info[hotel]     Listado de destinos
(disponibilidad,          (contenido estático       (home, tarjetas
 formulario,              de marketing)             de presentación)
 cotizaciones)
    ↕                          ↕                          ↕
 leermas: "/infoazuan"    slug: "azuan"             url: "/infoazuan"
```

Los tres archivos se conectan a través de la **ruta de la página de información** (`/infoazuan`, `/infoaixo`, etc.). Si añades un hotel nuevo, debes actualizar los tres archivos para que aparezca en todos los contextos.

# hotelesConfig.js — Documentación completa

## ¿Qué es este archivo?

`src/data/hotelesConfig.js` es la **única fuente de verdad** de todos los datos de los hoteles de GEH Suites dentro del motor de agencias. Antes de este archivo, cada dato (imágenes, íconos, habitaciones, nombres, configuración de Booking Connect, etc.) estaba duplicado y disperso en seis o más componentes distintos. Ahora esos componentes leen sus datos desde aquí mediante una derivación en tiempo de ejecución, por lo que **añadir o modificar un hotel solo requiere editar este archivo**.

---

## Estructura del archivo

```
src/data/hotelesConfig.js
│
├── export const HOTELES = { ... }   ← objeto principal con los 17 hoteles
│
└── export function getHotelById(id)
    export function getHotelByNombre(nombre)
    export function getHotelIdByNombre(nombre)
    export function getHabitacionByRoomId(roomId)
    export function getImagenesCotizacion(hotelId)
```

---

## El objeto `HOTELES`

`HOTELES` es un objeto plano cuyas **claves son los IDs numéricos** de los hoteles (1, 2, 3 …) y cuyos **valores son objetos con todos los datos** de cada hotel.

```js
export const HOTELES = {
  1: { id: 1, nombre: "Hotel Azuan Suites", ... },
  2: { id: 2, nombre: "Hotel 1525",         ... },
  // ...
};
```

Utilizar el ID como clave permite acceder a cualquier hotel en O(1): `HOTELES[4]` devuelve directamente el objeto de Hotel Aixo.

---

## Campos de cada entrada de hotel

A continuación se detalla cada campo, su tipo, su propósito y los valores posibles.

### `id` — número

El identificador numérico del hotel. Es el mismo ID que usa RoomCloud/Booking Connect en sus respuestas de disponibilidad. Este es el campo que conecta la respuesta de la API de disponibilidad con los datos del hotel.

```js
id: 1
```

**Regla importante:** la clave del objeto (`HOTELES[1]`) y el campo `id` siempre deben coincidir. Si agregas el hotel con ID 99, escribe `99: { id: 99, ... }`.

---

### `nombre` — string

Nombre completo y oficial del hotel. Es el que se muestra en cotizaciones, en el modal de upgrade y en cualquier texto donde el nombre completo sea necesario.

```js
nombre: "Hotel Azuan Suites"
```

---

### `nombreCorto` — string

Versión abreviada del nombre para usar en espacios reducidos (tarjetas de reserva, encabezados pequeños). Muchas veces es igual al `nombre`, pero en algunos casos difiere:

```js
// Hotel Azuan: nombre vs. nombreCorto
nombre:      "Hotel Azuan Suites"
nombreCorto: "Hotel Azuan"

// Hotel Windsor: nombre vs. nombreCorto
nombre:      "Hotel Windsor House"
nombreCorto: "Hotel Windsor"
```

Los componentes `Cotizacion.jsx`, `CotizacionCreada.jsx` y `CotizacionPublica.jsx` usan `nombreCorto` mediante `getHotelById(id)?.nombreCorto`.

---

### `nombreStorage` — string

Slug (identificador en minúsculas sin espacios) que identifica al hotel en rutas de almacenamiento de imágenes, en `localStorage` y en cualquier sistema que necesite una clave de texto única por hotel.

```js
nombreStorage: "azuan"        // Hotel Azuan Suites
nombreStorage: "hotel1525"    // Hotel 1525
nombreStorage: "playasalguero"// Playa Salguero Hotel
```

Este campo se usa en `DisponibilidadH.jsx` para construir el mapa `hotelNombreStoragePorId`:
```js
const hotelNombreStoragePorId = Object.fromEntries(
  Object.values(HOTELES).filter(h => h.nombreStorage).map(h => [h.id, h.nombreStorage])
);
```
Y también lo usa `BookingConnectIA.jsx` como clave en su mapa de imágenes de la IA.

---

### `ciudad` — string (enum)

Ciudad donde está ubicado el hotel. Solo puede tener uno de estos tres valores exactos:

| Valor | Ciudad |
|-------|--------|
| `"CARTAGENA"` | Cartagena de Indias |
| `"SANTA_MARTA"` | Santa Marta |
| `"BOGOTA"` | Bogotá |

Este campo no se usa directamente en los componentes actuales pero es la referencia oficial para filtros de ciudad cuando el motor los necesite.

---

### `direccion` — string

Dirección física completa del hotel. Se muestra en la pantalla de disponibilidad (`DisponibilidadH.jsx`) y en las páginas de cotización.

```js
direccion: "Cra. 3 #8-156, Bocagrande, Cartagena de Indias"
```

En `DisponibilidadH.jsx` el campo se deriva así:
```js
const hotelesData = Object.fromEntries(Object.values(HOTELES).map(h => [
  h.id,
  { direction: h.direccion, ... }
]));
```

---

### `descripcion` — string

Descripción larga del hotel que se muestra en la pantalla de disponibilidad como texto descriptivo del establecimiento.

```js
descripcion: "Hotel Azuan Suites By GEH Suites, está ubicado en el corazón de Bocagrande ..."
```

---

### `leermas` — string

Ruta relativa de la página de información del hotel (sin dominio). Se usa como enlace "Leer más" en la pantalla de disponibilidad.

```js
leermas: "/infoazuan"
leermas: "/info1525"
leermas: "/infopatiocorao"
```

---

### `mapa` — string | null

URL completa de Google Maps con la ubicación del hotel. Puede ser `null` cuando el hotel no tiene un pin de Maps configurado (como Hotel Rodadero, que tiene `mapa: null`).

---

### `imgBusqueda` — string (URL)

Imagen que se muestra en la tarjeta de resultados de búsqueda (`Componentesearch.jsx`). Suele ser la fachada del hotel o una foto representativa del exterior.

```js
imgBusqueda: "https://www.gehsuites.com/recursos/imagenes/hotels/hotel-azuan.jpg"
```

En `Componentesearch.jsx` se deriva así:
```js
const hotelImages = Object.fromEntries(
  Object.values(HOTELES).map(h => [h.id, h.imgBusqueda])
);
```

---

### `imgDetalle` — string (URL)

Imagen que se muestra en la pantalla de disponibilidad del hotel (`DisponibilidadH.jsx`). Puede ser la misma que `imgBusqueda` o una imagen diferente, más apropiada para una pantalla de detalle más grande.

```js
imgDetalle: "https://www.gehsuites.com/recursos/imagenes/hotels/hotel-azuan.jpg"
```

---

### `imgUpgrade` — string (URL) | `null`

Imagen que se muestra en el **modal de upgrade de habitación** (`hotelUpgrades.js`). Se usa cuando al huésped se le ofrece mejorar su habitación durante el proceso de reserva.

**Valor `null`:** indica que el hotel **no participa del sistema de upgrade**. Los hoteles con `imgUpgrade: null` son excluidos automáticamente del mapa de imágenes:

```js
// hotelUpgrades.js
export const HOTEL_FACADE_IMAGES = Object.fromEntries(
  Object.values(HOTELES).filter(h => h.imgUpgrade).map(h => [h.id, h.imgUpgrade])
);
```

Hoteles con `imgUpgrade: null`: **ninguno actualmente** (todos tienen imagen), aunque la lógica original reservaba este campo para excluir hoteles del upgrade modal.

---

### `imgGestionar` — string (URL)

Imagen que se muestra en la **página de gestión de reservas** (`GestionarReservas/InfoHoteles.js`). Suele ser una foto diferente a la de búsqueda, muchas veces con mejor composición para ese contexto.

---

### `imgCotizacion` — objeto `{ main, secondary1, secondary2 }`

Tres imágenes que se usan en las **páginas de cotización** (`Cotizacion.jsx`, `CotizacionCreada.jsx`, `CotizacionPublica.jsx`) y en el **correo de cotización**. Cada una corresponde a una posición en el layout visual de la cotización:

- `main`: imagen principal (la más prominente)
- `secondary1`: imagen secundaria 1
- `secondary2`: imagen secundaria 2

```js
imgCotizacion: {
  main:       "https://space-img.sfo3.digitaloceanspaces.com/Agencias/azuan1.jpg",
  secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/azuan2.jpg",
  secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/azuan3.jpg",
}
```

**Nota especial — Hotel Zulita (id: 41):** sus `imgCotizacion` tienen URLs genéricas (las mismas que las imágenes por defecto), porque este hotel aún no tiene imágenes específicas configuradas para cotizaciones.

Estas imágenes se obtienen mediante `getImagenesCotizacion(hotelId)` o directamente con `HOTELES[id]?.imgCotizacion`.

---

### `iconos` — array de strings (URLs)

Lista de iconos de servicios del hotel. Cada URL apunta a un ícono alojado en DigitalOcean Spaces (`space-img.sfo3.digitaloceanspaces.com/Agencias/`).

```js
iconos: [
  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
]
```

Los íconos disponibles en el CDN son:

| Archivo | Significado |
|---------|-------------|
| `iconplaya.png` | Acceso a playa |
| `iconcoffee.png` | Desayuno / café |
| `iconbuffet.png` | Buffet |
| `iconpool.png` | Piscina |
| `iconparking.png` | Parqueadero |
| `iconvan.png` | Transporte / van |
| `iconwind.png` | Aire acondicionado |
| `icongym.png` | Gimnasio |
| `pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png` | Pet friendly |

En `Componentesearch.jsx` y `DisponibilidadH.jsx` se renderizan así:
```js
{hotelIcons[tipo.hotel.id]?.map((iconUrl, index) => (
  <img key={index} src={iconUrl} alt={`Servicio ${index + 1}`} />
))}
```

---

### `habitaciones` — objeto `{ [roomId]: { url, name } }`

Mapa de habitaciones del hotel. Cada **clave** es el ID numérico de la habitación en RoomCloud, y cada **valor** es un objeto con:

- `url`: URL de la imagen de la habitación (Booking.com, DigitalOcean Spaces u otro CDN)
- `name`: nombre legible de la habitación

```js
habitaciones: {
  68073: { url: "https://cf.bstatic.com/...", name: "Habitacion Doble Estandar" },
  68074: { url: "https://cf.bstatic.com/...", name: "Habitacion Triple"         },
  68075: { url: "https://cf.bstatic.com/...", name: "Habitacion Cuadruple"      },
}
```

**Hoteles sin habitaciones configuradas:** Hotel Zulita (id: 41) tiene `habitaciones: {}` porque actualmente no tiene habitaciones activas en el sistema.

Este campo se usa en `DisponibilidadH.jsx` para construir el mapa de imágenes por roomId:
```js
const idRooms = Object.fromEntries(Object.values(HOTELES).map(h => [
  h.id,
  Object.fromEntries(Object.entries(h.habitaciones || {}).map(([id, d]) => [id, d.url]))
]));
```

Y en `GestionarReservas/InfoHoteles.js` para el mapa global de habitaciones:
```js
export const habitaciones = Object.fromEntries(
  Object.values(HOTELES).flatMap(h =>
    Object.entries(h.habitaciones || {}).map(([roomId, data]) => [roomId, data])
  )
);
```

---

### `roomsMapName` — array de `{ roomId, mapName }` | `null`

Mapeo entre IDs de habitaciones de RoomCloud y los nombres internos que usa **Booking Connect** en su integración. Se necesita porque Booking Connect maneja nombres de habitaciones distintos a los IDs numéricos.

```js
roomsMapName: [
  { roomId: 68073, mapName: "Doble Estandar" },
  { roomId: 68074, mapName: "Triple"          },
  { roomId: 68075, mapName: "Cuadruple"       },
]
```

**Valor `null`:** indica que el hotel **no tiene integración de Booking Connect** o que no tiene un mapeo de nombres configurado. Hoteles con `roomsMapName: null`:

| ID | Hotel |
|----|-------|
| 7  | Hotel Bocagrande |
| 2  | Hotel 1525 |
| 56 | Hotel Boquilla |
| 41 | Hotel Zulita |

En `FormularioReserva.jsx` se filtra automáticamente:
```js
const BOOKING_CONNECT_ROOM_MAPNAME_BY_HOTEL = Object.freeze(
  Object.fromEntries(
    Object.values(HOTELES).filter(h => h.roomsMapName).map(h => [
      h.id,
      Object.freeze(h.roomsMapName)
    ])
  )
);
```

---

### `motivoId` — número | `null`

ID del "motivo" (categoría de reserva) en **Booking Connect**. Este número indica con qué configuración tarifaria opera el hotel dentro del PMS. Los valores actuales son:

| motivoId | Hoteles que lo usan |
|----------|---------------------|
| `7` | Azuan (1), Madisson (3), Windsor (10) |
| `8` | Abi (5), Avexi (6), Marina (9), Boquilla (56), El Marques (164), Patio Corao (221), Rodadero (8), Sansiraka (44), Axis (48), Salguero (123) |
| `null` | Bocagrande (7), 1525 (2), Zulita (41) |

**Valor `null`:** el hotel **no tiene integración con Booking Connect**. El formulario de reserva los excluye automáticamente:
```js
const BOOKING_CONNECT_MOTIVO_ID_BY_HOTEL = Object.freeze(
  Object.fromEntries(
    Object.values(HOTELES).filter(h => h.motivoId != null).map(h => [h.id, h.motivoId])
  )
);
```

---

### `quintuple` — boolean

Indica si el hotel ofrece **habitaciones quíntuples** (para 5 personas). Cuando es `true`, el buscador muestra la opción de hasta 5 personas por habitación en ese hotel.

```js
quintuple: true   // Hotel Rodadero, Sansiraka, Axis Inn
quintuple: false  // La mayoría de los hoteles
```

En `DisponibilidadH.jsx`:
```js
const quintuple = Object.fromEntries(
  Object.values(HOTELES).map(h => [h.id, h.quintuple])
);
```

---

### `planAlimentacionDisponibilidad` — boolean

Indica si el hotel ofrece **plan de alimentación** en la pantalla de **disponibilidad** (paso 1, donde se ven los tipos de habitación y precios). Cuando es `true`, se muestra el selector de plan de alimentación en esa pantalla.

```js
planAlimentacionDisponibilidad: true   // Sansiraka, Axis, Madisson, Windsor
planAlimentacionDisponibilidad: false  // La mayoría
```

---

### `planAlimentacionFormulario` — boolean

Indica si el hotel ofrece **plan de alimentación** en el **formulario de reserva** (paso 2, donde el huésped completa sus datos). Este campo está **separado de `planAlimentacionDisponibilidad` intencionalmente**, porque algunos hoteles muestran el plan en disponibilidad pero no lo incluyen como opción editable en el formulario.

Ejemplo de diferencia real:
- Hotel Madisson (id: 3): `planAlimentacionDisponibilidad: true`, `planAlimentacionFormulario: false`
- Hotel Sansiraka (id: 44): ambos `true`

En `FormularioReserva.jsx`:
```js
const plan_alimentacion = Object.fromEntries(
  Object.values(HOTELES).map(h => [h.id, h.planAlimentacionFormulario])
);
```

---

### `ubicacionGestionar` — string

Dirección en formato ligeramente diferente que se muestra en la **página de gestión de reservas** (`GestionarReservas/InfoHoteles.js`). Puede ser más descriptiva o tener un formato distinto al campo `direccion`.

```js
// Hotel Azuan
direccion:          "Cra. 3 #8-156, Bocagrande, Cartagena de Indias"
ubicacionGestionar: "Bocagrande, Carrera 3 # 8 – 156, Cartagena de Indias"
```

---

### `nombreVariants` — array de strings

Lista de **variantes del nombre en minúsculas** que permiten encontrar el hotel con `getHotelByNombre()` aunque se use un nombre alternativo. Todos los valores deben estar en minúsculas.

```js
nombreVariants: ["hotel azuan", "hotel azuan suites"]
nombreVariants: ["hotel sansiraka", "hotel sansiraka inn"]
nombreVariants: ["playa salguero hotel", "hotel playa salguero"]
```

**Hotel Zulita tiene array vacío** (`[]`) porque solo se busca por `nombre` y `nombreCorto`.

Esta lista es la que consulta `getHotelByNombre()` para hacer búsqueda flexible por nombre de texto libre (por ejemplo, cuando el sistema de IA recibe el nombre del hotel escrito de distintas maneras).

---

## Tabla resumen de los 17 hoteles

| ID | Nombre | Ciudad | motivoId | roomsMapName | quintuple | planAl.Disp | planAl.Form |
|----|--------|--------|----------|--------------|-----------|-------------|-------------|
| 1 | Hotel Azuan Suites | CARTAGENA | 7 | ✓ | ✗ | ✗ | ✗ |
| 4 | Hotel Aixo | CARTAGENA | 2 | ✓ | ✗ | ✗ | ✗ |
| 5 | Hotel Abi | CARTAGENA | 8 | ✓ | ✗ | ✗ | ✗ |
| 6 | Hotel Avexi | CARTAGENA | 8 | ✓ | ✗ | ✗ | ✗ |
| 7 | Hotel Bocagrande | CARTAGENA | null | null | ✗ | ✗ | ✗ |
| 9 | Hotel Marina | CARTAGENA | 8 | ✓ | ✗ | ✗ | ✗ |
| 56 | Hotel Boquilla | CARTAGENA | 8 | null | ✗ | ✗ | ✗ |
| 164 | Hotel El Marques | CARTAGENA | 8 | ✓ | ✗ | ✗ | ✗ |
| 221 | Patio Corao Hotel Boutique | CARTAGENA | 8 | ✓ | ✗ | ✗ | ✗ |
| 2 | Hotel 1525 | SANTA_MARTA | null | null | ✗ | ✗ | ✗ |
| 8 | Hotel Rodadero | SANTA_MARTA | 8 | ✓ | ✓ | ✗ | ✗ |
| 44 | Hotel Sansiraka | SANTA_MARTA | 8 | ✓ | ✓ | ✓ | ✓ |
| 48 | Hotel Axis Inn | SANTA_MARTA | 8 | ✓ | ✓ | ✓ | ✓ |
| 123 | Playa Salguero Hotel | SANTA_MARTA | 8 | ✓ | ✗ | ✗ | ✗ |
| 3 | Hotel Madisson | BOGOTA | 7 | ✓ | ✗ | ✓ | ✗ |
| 10 | Hotel Windsor House | BOGOTA | 7 | ✓ | ✗ | ✓ | ✗ |
| 41 | Hotel Zulita | BOGOTA | null | null | ✗ | ✗ | ✗ |

---

## Funciones helper exportadas

### `getHotelById(id)`

Devuelve el objeto completo del hotel dado su ID numérico.

**Parámetros:**
- `id` — número o string numérico (se convierte con `Number(id)` internamente)

**Retorna:**
- El objeto del hotel (con todos sus campos) si existe
- `null` si no existe ningún hotel con ese ID

**Comportamiento interno:**
```js
export function getHotelById(id) {
  return HOTELES[Number(id)] || null;
}
```

**Uso en componentes:**
```js
// Cotizacion.jsx, CotizacionCreada.jsx, CotizacionPublica.jsx
const nombreHotelId  = (hotelId) => getHotelById(hotelId)?.nombreCorto || "Hotel no encontrado";
const direccionHotelId = (hotelId) => getHotelById(hotelId)?.direccion  || "Dirección no disponible";
```

---

### `getHotelByNombre(nombre)`

Devuelve el objeto completo del hotel buscando por nombre de texto (case-insensitive). La búsqueda se realiza en tres campos del hotel:
1. `nombreVariants` — array de variantes en minúsculas
2. `nombre` — nombre completo (comparación exacta, ignorando mayúsculas)
3. `nombreCorto` — nombre corto (comparación exacta, ignorando mayúsculas)

**Parámetros:**
- `nombre` — string con el nombre a buscar (puede estar en cualquier capitalización)

**Retorna:**
- El objeto del hotel si se encuentra
- `null` si no hay ninguna coincidencia o si `nombre` es falsy

**Comportamiento interno:**
```js
export function getHotelByNombre(nombre) {
  if (!nombre) return null;
  const lower = String(nombre).trim().toLowerCase();
  for (const h of Object.values(HOTELES)) {
    if (
      h.nombreVariants.includes(lower) ||
      h.nombre.toLowerCase() === lower ||
      h.nombreCorto.toLowerCase() === lower
    ) {
      return h;
    }
  }
  return null;
}
```

**Ejemplos de búsqueda:**
```js
getHotelByNombre("Hotel Azuan")         // ✓ encuentra por nombreCorto
getHotelByNombre("HOTEL AZUAN SUITES")  // ✓ encuentra por nombre (ignora mayúsculas)
getHotelByNombre("hotel azuan")         // ✓ encuentra por nombreVariants
getHotelByNombre("azuan")               // ✗ null — solo busca coincidencia exacta
```

**Uso en componentes:**
```js
// GestionarReservas/InfoHoteles.js
export const hoteles = (hotel) => {
  const h = getHotelByNombre(hotel);
  if (!h) return { error: true, msg: "No se encontró el tipo de habitación" };
  return { imgHotel: h.imgGestionar, ubicacion: h.ubicacionGestionar };
};
```

---

### `getHotelIdByNombre(nombre)`

Versión simplificada de `getHotelByNombre()` que solo devuelve el ID, no el objeto completo.

**Parámetros:**
- `nombre` — string con el nombre a buscar

**Retorna:**
- El ID numérico del hotel si se encuentra
- `undefined` si no hay coincidencia

**Comportamiento interno:**
```js
export function getHotelIdByNombre(nombre) {
  return getHotelByNombre(nombre)?.id;
}
```

**Uso en componentes:**
```js
// hotelesImagenes.js
export function getHotelIdByName(hotelName) {
  return getHotelIdByNombre(hotelName);
}
```

---

### `getHabitacionByRoomId(roomId)`

Busca una habitación por su ID en **todos los hoteles** y devuelve sus datos.

**Parámetros:**
- `roomId` — número o string numérico del ID de la habitación en RoomCloud

**Retorna:**
- `{ url: string, name: string }` con la imagen y nombre de la habitación
- `null` si ningún hotel tiene esa habitación

**Comportamiento interno:**
```js
export function getHabitacionByRoomId(roomId) {
  const id = Number(roomId);
  for (const hotel of Object.values(HOTELES)) {
    if (hotel.habitaciones?.[id]) return hotel.habitaciones[id];
  }
  return null;
}
```

**Cuándo usarlo:** cuando tienes solo el `roomId` de RoomCloud y necesitas saber el nombre o imagen de la habitación sin conocer de antemano a qué hotel pertenece.

---

### `getImagenesCotizacion(hotelId)`

Devuelve el set de imágenes de cotización del hotel, o un set de imágenes por defecto si el hotel no tiene imágenes configuradas.

**Parámetros:**
- `hotelId` — número o string numérico del ID del hotel

**Retorna:**
- `{ main: string, secondary1: string, secondary2: string }` del hotel
- O las imágenes por defecto si el hotel no existe o no tiene `imgCotizacion`

**Imágenes por defecto:**
```js
{
  main:       "https://www.gehsuites.com/images/fachada-azuan.jpg",
  secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
  secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
}
```

**Equivalente en `hotelesImagenes.js`:**
```js
export function getHotelImagesById(hotelId) {
  return HOTELES[Number(hotelId)]?.imgCotizacion || IMAGENES_POR_DEFECTO;
}
```

---

## Cómo cada componente usa los datos

### `Componentesearch.jsx` — Resultados de búsqueda

Deriva dos mapas al inicio del componente:

```js
const hotelImages = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.imgBusqueda]));
const hotelIcons  = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.iconos]));
```

Los usa para renderizar la imagen de fachada y los íconos de servicios en cada tarjeta de resultado.

---

### `DisponibilidadH.jsx` — Pantalla de disponibilidad

Es el componente que más campos usa. Deriva seis mapas al inicio:

```js
// Datos generales del hotel (nombre, dirección, descripción, imagen, mapa)
const hotelesData = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, {
  name:        h.nombre,
  direction:   h.direccion,
  description: h.descripcion,
  image:       h.imgDetalle,
  leermas:     h.leermas,
  mapa:        h.mapa,
}]));

// Íconos de servicios
const hotelIcons = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.iconos]));

// Imágenes de habitaciones por roomId
const idRooms = Object.fromEntries(Object.values(HOTELES).map(h => [
  h.id,
  Object.fromEntries(Object.entries(h.habitaciones||{}).map(([id,d]) => [id, d.url]))
]));

// Si el hotel tiene habitaciones quíntuples
const quintuple = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.quintuple]));

// Slug del hotel para rutas de imágenes
const hotelNombreStoragePorId = Object.fromEntries(
  Object.values(HOTELES).filter(h => h.nombreStorage).map(h => [h.id, h.nombreStorage])
);

// Si el hotel muestra plan de alimentación en esta pantalla
const plan_alimentacion = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.planAlimentacionDisponibilidad]));
```

---

### `FormularioReserva.jsx` — Formulario de reserva

Deriva tres mapas relacionados con Booking Connect:

```js
// Plan de alimentación en el formulario (puede diferir de disponibilidad)
const plan_alimentacion = Object.fromEntries(
  Object.values(HOTELES).map(h => [h.id, h.planAlimentacionFormulario])
);

// motivoId de Booking Connect (solo hoteles integrados)
const BOOKING_CONNECT_MOTIVO_ID_BY_HOTEL = Object.freeze(
  Object.fromEntries(
    Object.values(HOTELES).filter(h => h.motivoId != null).map(h => [h.id, h.motivoId])
  )
);

// roomsMapName de Booking Connect (solo hoteles con mapeo)
const BOOKING_CONNECT_ROOM_MAPNAME_BY_HOTEL = Object.freeze(
  Object.fromEntries(
    Object.values(HOTELES).filter(h => h.roomsMapName).map(h => [h.id, Object.freeze(h.roomsMapName)])
  )
);
```

---

### `hotelesImagenes.js` — Imágenes de cotización

Wrapper ligero sobre `hotelesConfig.js` para los componentes de cotización:

```js
export function getHotelImagesById(hotelId) {
  return HOTELES[Number(hotelId)]?.imgCotizacion || IMAGENES_POR_DEFECTO;
}

export function getHotelIdByName(hotelName) {
  return getHotelIdByNombre(hotelName);
}
```

---

### `GestionarReservas/InfoHoteles.js` — Gestión de reservas

Expone dos exports que consume la página de gestión:

```js
// Busca un hotel por nombre y devuelve imagen + ubicación para esa pantalla
export const hoteles = (hotel) => {
  const h = getHotelByNombre(hotel);
  if (!h) return { error: true, msg: "No se encontró el tipo de habitación" };
  return { imgHotel: h.imgGestionar, ubicacion: h.ubicacionGestionar };
};

// Mapa global de todas las habitaciones de todos los hoteles
export const habitaciones = Object.fromEntries(
  Object.values(HOTELES).flatMap(h =>
    Object.entries(h.habitaciones || {}).map(([roomId, data]) => [roomId, data])
  )
);
```

---

### `hotelUpgrades.js` — Modal de upgrade

Construye el mapa de imágenes para el modal de upgrade, **excluyendo** automáticamente los hoteles sin imagen de upgrade:

```js
export const HOTEL_FACADE_IMAGES = Object.fromEntries(
  Object.values(HOTELES).filter(h => h.imgUpgrade).map(h => [h.id, h.imgUpgrade])
);
```

---

### `Cotizacion.jsx` / `CotizacionCreada.jsx` / `CotizacionPublica.jsx`

Los tres usan la misma pareja de helpers:

```js
import { getHotelById } from '../data/hotelesConfig';

const nombreHotelId    = (hotelId) => getHotelById(hotelId)?.nombreCorto || "Hotel no encontrado";
const direccionHotelId = (hotelId) => getHotelById(hotelId)?.direccion   || "Dirección no disponible";
```

---

## Guía paso a paso: cómo añadir un nuevo hotel

Sigue exactamente este proceso. Solo debes editar **un archivo** (`hotelesConfig.js`) y, opcionalmente, el archivo de la IA.

### Paso 1 — Consigue el ID del hotel

El ID es el número que RoomCloud usa en sus respuestas de disponibilidad. Puedes encontrarlo:
- En la URL del panel de RoomCloud
- En la respuesta JSON de la API de disponibilidad (campo `hotel.id`)
- Preguntándole al equipo de operaciones

Supongamos que el nuevo hotel tiene ID **300**.

### Paso 2 — Sube las imágenes al CDN

Antes de crear la entrada, sube todas las imágenes necesarias a **DigitalOcean Spaces** en el bucket `Agencias`. Necesitarás:

1. `imgBusqueda` — fachada o foto exterior (para tarjetas de búsqueda)
2. `imgDetalle` — imagen para la pantalla de disponibilidad
3. `imgUpgrade` — imagen para el modal de upgrade (o `null` si no participa)
4. `imgGestionar` — imagen para la página de gestión de reservas
5. `imgCotizacion.main`, `.secondary1`, `.secondary2` — tres imágenes para cotizaciones
6. Una imagen por habitación para el campo `habitaciones`

Las URLs seguirán el patrón:
```
https://space-img.sfo3.digitaloceanspaces.com/Agencias/nombre-descriptivo.jpg
```

### Paso 3 — Añade la entrada en `HOTELES`

Abre `src/data/hotelesConfig.js` y añade el nuevo hotel dentro del objeto `HOTELES`, en la sección de la ciudad correspondiente (busca el comentario `// ─── CARTAGENA`, `// ─── SANTA MARTA` o `// ─── BOGOTÁ`):

```js
300: {
  id: 300,
  nombre: "Hotel Nuevo",
  nombreCorto: "Hotel Nuevo",
  nombreStorage: "hotelnuevo",
  ciudad: "CARTAGENA",  // "CARTAGENA" | "SANTA_MARTA" | "BOGOTA"
  direccion: "Cra. 5 #10-20, Bocagrande, Cartagena de Indias",
  descripcion: "Descripción completa del hotel...",
  leermas: "/infohotelnuevo",
  mapa: "https://maps.google.com/...",
  imgBusqueda:  "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-fachada.jpg",
  imgDetalle:   "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-fachada.jpg",
  imgUpgrade:   "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-fachada.jpg",
  imgGestionar: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-gestionar.webp",
  imgCotizacion: {
    main:       "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-main.jpg",
    secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-sec1.jpg",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-sec2.jpg",
  },
  iconos: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    // Añade los iconos que correspondan
  ],
  habitaciones: {
    // Añade cada habitación con su roomId de RoomCloud
    999001: { url: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-doble.jpg", name: "Habitación Doble" },
    999002: { url: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelnuevo-triple.jpg", name: "Habitación Triple" },
  },
  // Si el hotel usa Booking Connect, proporciona el mapeo de nombres de habitación:
  roomsMapName: [
    { roomId: 999001, mapName: "Doble" },
    { roomId: 999002, mapName: "Triple" },
  ],
  // Si no usa Booking Connect: roomsMapName: null
  motivoId: 8,      // 7, 8 según el hotel. null si no usa Booking Connect
  quintuple: false, // true si tiene habitaciones quíntuples
  planAlimentacionDisponibilidad: false, // true si ofrece plan de alimentación en disponibilidad
  planAlimentacionFormulario: false,     // true si ofrece plan de alimentación en el formulario
  ubicacionGestionar: "Bocagrande, Carrera 5 # 10 – 20, Cartagena de Indias",
  nombreVariants: ["hotel nuevo"],  // variantes del nombre en minúsculas
},
```

### Paso 4 — Crea la página de información (opcional)

Si pusiste `leermas: "/infohotelnuevo"`, crea el archivo de página correspondiente en `src/pages/infohotelnuevo.astro` siguiendo la estructura de las páginas existentes (por ejemplo, `infoazuan.astro`).

### Paso 5 — Verifica la compilación

Ejecuta:
```bash
npm run build
```

Si hay errores de sintaxis en `hotelesConfig.js`, aparecerán aquí. Los errores más comunes son:
- Coma faltante después de un campo
- Coma sobrante después del último campo de un objeto
- Olvido del `,` después del cierre `}` del último hotel en una sección

### Paso 6 — Actualiza `BookingConnectIA.jsx` (si aplica)

Si el hotel usa Booking Connect (`motivoId != null`), también actualiza `src/components/BookingConnectIA.jsx`:

1. Añade las imágenes del hotel en `hotelImagesMap` (el mapa usa `nombreStorage` como clave):
```js
hotelnuevo: {
  main: "https://...",
  extra1: "https://...",
  extra2: "https://...",
  extra3: "https://...",
  extra4: "https://...",
},
```

2. Añade patrones de texto en `detectHotelsInText()` para que la IA reconozca el hotel:
```js
if (/hotel nuevo|hotelnuevo/i.test(text)) hoteles.add("hotelnuevo");
```

### Paso 7 — Commit y push

```bash
git add src/data/hotelesConfig.js
git commit -m "Añadir Hotel Nuevo (id: 300) a hotelesConfig"
git push
```

---

## Errores frecuentes y cómo evitarlos

### El hotel no aparece en los resultados de búsqueda

**Causa probable:** el ID en `HOTELES` no coincide con el ID que devuelve la API de disponibilidad.

**Verificación:** haz una búsqueda de prueba y revisa en la consola del navegador el valor de `hotel.id` en la respuesta de la API. Ese valor debe ser exactamente la clave en `HOTELES`.

---

### Los íconos no se muestran

**Causa probable:** la URL del ícono está mal escrita o el archivo no existe en DigitalOcean Spaces.

**Verificación:** abre la URL del ícono en el navegador. Si devuelve error 404, el archivo no existe o el nombre está mal escrito.

---

### `getHotelByNombre()` devuelve `null` para el nuevo hotel

**Causa probable:** el nombre que llega como parámetro no coincide exactamente con `nombre`, `nombreCorto` ni ninguna entrada en `nombreVariants`.

**Solución:** añade más variantes a `nombreVariants`. Recuerda que todos los valores deben estar en **minúsculas**.

---

### Error en Booking Connect al procesar una reserva

**Causa probable:** `motivoId` o `roomsMapName` tienen valores incorrectos.

**Verificación:** consulta con el equipo de operaciones el `motivoId` correcto para el hotel y verifica que los `roomId` en `roomsMapName` coincidan exactamente con los IDs que devuelve RoomCloud.

---

### `planAlimentacionDisponibilidad: true` pero el plan no aparece en el formulario

**Comportamiento esperado:** es correcto. Cada campo controla una pantalla diferente. Si quieres que el plan también aparezca en el formulario, pon también `planAlimentacionFormulario: true`.

---

## Ubicación del archivo

```
motor-agencias/
└── src/
    └── data/
        └── hotelesConfig.js   ← edita este archivo para cambiar datos de hoteles
```

Los archivos que lo importan:

```
src/components/Componentesearch.jsx
src/components/DisponibilidadH.jsx
src/components/FormularioReserva.jsx
src/components/Cotizacion.jsx
src/components/CotizacionCreada.jsx
src/components/CotizacionPublica.jsx
src/utils/hotelesImagenes.js
src/utils/hotelUpgrades.js
src/components/GestionarReservas/InfoHoteles.js
```

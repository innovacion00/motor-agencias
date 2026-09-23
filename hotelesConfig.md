# Centralización de datos de hoteles — Documentación técnica

## Contexto

Antes de esta refactorización, los datos de cada hotel (imágenes, iconos, habitaciones, dirección, configuración de Booking Connect, etc.) estaban duplicados y hardcodeados en ~9 archivos distintos. Agregar un hotel nuevo obligaba a editar todos esos archivos manualmente, lo que generaba errores y datos inconsistentes entre pantallas.

**Objetivo:** crear una fuente única de verdad para que agregar un hotel nuevo solo requiera editar un solo archivo.

---

## Archivos creados / reescritos completamente

### 1. `src/data/hotelesConfig.js` ← archivo nuevo (fuente única de verdad)

Es el corazón de toda la refactorización. Contiene el objeto `HOTELES` con los 17 hoteles del sistema, y 5 funciones helper exportadas.

#### Estructura de cada hotel

```js
HOTELES = {
  [id]: {
    id: Number,               // ID numérico que devuelve la API (ej. 1, 221)
    nombre: String,           // Nombre completo para mostrar al usuario
    nombreCorto: String,      // Nombre corto usado en cotizaciones y PDFs
    nombreStorage: String,    // Slug sin espacios usado en rutas de imágenes (ej. "azuan")
    ciudad: String,           // "CARTAGENA" | "SANTA_MARTA" | "BOGOTA"
    direccion: String,        // Dirección física del hotel
    descripcion: String,      // Descripción larga para la ficha de disponibilidad
    leermas: String,          // Ruta interna a la página de info del hotel (ej. "/infoazuan")
    mapa: String,             // URL de Google Maps

    // Imágenes
    imgBusqueda: String,      // Foto de fachada — usada en el buscador (Componentesearch)
    imgDetalle: String,       // Foto principal — usada en la ficha de disponibilidad
    imgUpgrade: String|null,  // Foto para el modal de upgrade (null si el hotel no participa)
    imgGestionar: String,     // Foto usada en la página de gestión de reservas
    imgCotizacion: {          // Fotos para cotizaciones y PDFs
      main: String,
      secondary1: String,
      secondary2: String,
    },

    // Amenidades
    iconos: String[],         // URLs de los iconos de servicios (playa, parking, pool, etc.)

    // Habitaciones (Booking Connect)
    habitaciones: {           // Clave: roomId numérico de RoomCloud
      [roomId]: {
        url: String,          // Foto de la habitación
        name: String,         // Nombre de la habitación
      }
    },
    roomsMapName: Array|null, // Mapeo roomId→mapName para Booking Connect
                              // null si el hotel no usa Booking Connect
    // Ejemplo:
    // roomsMapName: [
    //   { roomId: 83533, mapName: "FAMILIAR" },
    //   { roomId: 83534, mapName: "MATRIMONIAL" },
    // ]

    motivoId: Number|null,    // ID de motivo para Booking Connect (null si no aplica)
    quintuple: Boolean,       // ¿El hotel ofrece habitación quíntuple?

    // Plan de alimentación (puede diferir entre pantallas)
    planAlimentacionDisponibilidad: Boolean,  // Usado en DisponibilidadH
    planAlimentacionFormulario: Boolean,      // Usado en FormularioReserva

    ubicacionGestionar: String,  // Texto de ubicación para la página de gestión
    nombreVariants: String[],    // Variantes del nombre en minúsculas para búsqueda flexible
                                 // (ej. ["hotel azuan", "hotel azuan suites"])
  }
}
```

#### Hoteles incluidos

| ID  | Nombre                       | Ciudad       | motivoId | roomsMapName |
|-----|------------------------------|--------------|----------|--------------|
| 1   | Hotel Azuan Suites           | CARTAGENA    | 7        | ✓            |
| 4   | Hotel Aixo Suites            | CARTAGENA    | 2        | ✓            |
| 5   | Hotel Abi Inn                | CARTAGENA    | 8        | ✓            |
| 6   | Hotel Avexi Suites           | CARTAGENA    | 8        | ✓            |
| 7   | Hotel Bocagrande Suites      | CARTAGENA    | null     | null         |
| 9   | Hotel Marina Suites          | CARTAGENA    | 8        | ✓            |
| 56  | Hotel Boquilla Suites        | CARTAGENA    | 8        | null         |
| 164 | Hotel El Marques Boutique    | CARTAGENA    | 8        | ✓            |
| 221 | Patio Corao Hotel Boutique   | CARTAGENA    | 8        | ✓            |
| 2   | Hotel 1525                   | SANTA_MARTA  | null     | null         |
| 8   | Hotel Rodadero               | SANTA_MARTA  | 8        | ✓            |
| 44  | Hotel Sansiraka              | SANTA_MARTA  | 8        | ✓            |
| 48  | Hotel Axis Inn               | SANTA_MARTA  | 8        | ✓            |
| 123 | Hotel Playa Salguero         | SANTA_MARTA  | 8        | ✓            |
| 3   | Hotel Madisson               | BOGOTA       | 7        | ✓            |
| 10  | Hotel Windsor House          | BOGOTA       | 7        | ✓            |
| 41  | Hotel Zulita                 | BOGOTA       | null     | null         |

#### Funciones helper exportadas

```js
// Busca por ID numérico. Devuelve el objeto hotel o null.
getHotelById(id)

// Busca por nombre (case-insensitive). Consulta nombre, nombreCorto y nombreVariants.
getHotelByNombre(nombre)

// Igual que getHotelByNombre pero devuelve solo el ID.
getHotelIdByNombre(nombre)

// Busca una habitación en todos los hoteles por su roomId. Devuelve { url, name } o null.
getHabitacionByRoomId(roomId)

// Devuelve { main, secondary1, secondary2 } del hotel, o imágenes por defecto.
getImagenesCotizacion(hotelId)
```

---

### 2. `src/utils/hotelesImagenes.js` ← reescrito completamente

**Antes:** ~130 líneas con dos objetos hardcodeados: `IMAGENES_POR_HOTEL` (imágenes por ID) e `ID_POR_NOMBRE` (ID por nombre de hotel).

**Después:** 18 líneas. Delega todo a `hotelesConfig.js`.

```js
import { HOTELES, getHotelIdByNombre } from '../data/hotelesConfig';

const IMAGENES_POR_DEFECTO = { main: "...", secondary1: "...", secondary2: "..." };

// Devuelve { main, secondary1, secondary2 } del hotel, o el juego por defecto.
export function getHotelImagesById(hotelId) {
  return HOTELES[Number(hotelId)]?.imgCotizacion || IMAGENES_POR_DEFECTO;
}

// Resuelve el ID de hotel a partir de su nombre.
export function getHotelIdByName(hotelName) {
  return getHotelIdByNombre(hotelName);
}
```

**Lo que resuelve:** antes, un hotel como Patio Corao (221) fallaba porque no estaba en `ID_POR_NOMBRE`, devolviendo siempre el ID 1 (Azuan) como fallback, lo que mostraba imágenes y dirección incorrectas en la cotización.

---

### 3. `src/components/GestionarReservas/InfoHoteles.js` ← reescrito completamente

**Antes:** ~340 líneas con una función `hoteles()` basada en `switch/case` por nombre de hotel, y un objeto `habitaciones` plano con todas las habitaciones hardcodeadas.

**Después:** 13 líneas.

```js
import { getHotelByNombre, HOTELES } from '../../data/hotelesConfig';

export const hoteles = (hotel) => {
  const h = getHotelByNombre(hotel);
  if (!h) return { error: true, msg: "No se encontró el tipo de habitación" };
  return { imgHotel: h.imgGestionar, ubicacion: h.ubicacionGestionar };
};

export const habitaciones = Object.fromEntries(
  Object.values(HOTELES).flatMap(h =>
    Object.entries(h.habitaciones || {}).map(([roomId, data]) => [roomId, data])
  )
);
```

**Lo que resuelve:** El Marques (164) y Patio Corao (221) no aparecían en la página de gestión de reservas porque no estaban en el `switch`. Ahora se incluyen automáticamente.

---

## Archivos modificados (no reescritos)

Estos archivos tenían objetos hardcodeados que fueron reemplazados por una sola línea calculada desde `HOTELES`:

| Archivo | Objetos reemplazados |
|---|---|
| `src/utils/hotelUpgrades.js` | `HOTEL_FACADE_IMAGES`, `HOTEL_DISPLAY_NAMES` |
| `src/components/Cotizacion.jsx` | `hotelMap` (nombres), `direccionMap` |
| `src/components/CotizacionCreada.jsx` | `hotelMap` (nombres), `direccionMap` |
| `src/components/CotizacionPublica.jsx` | `hotelMap` (nombres), `direccionMap` |
| `src/components/Componentesearch.jsx` | `hotelImages`, `hotelIcons` |
| `src/components/DisponibilidadH.jsx` | `hotelesData`, `hotelIcons`, `idRooms`, `quintuple`, `hotelNombreStoragePorId`, `plan_alimentacion` |
| `src/components/FormularioReserva.jsx` | `plan_alimentacion`, `BOOKING_CONNECT_MOTIVO_ID_BY_HOTEL`, `BOOKING_CONNECT_ROOM_MAPNAME_BY_HOTEL` |

---

## Cómo agregar un hotel nuevo

Solo hay que editar **`src/data/hotelesConfig.js`** y agregar una entrada al objeto `HOTELES`:

```js
999: {
  id: 999,                         // ← ID que devuelve la API de disponibilidad
  nombre: "Hotel Nuevo",
  nombreCorto: "Hotel Nuevo",
  nombreStorage: "nuevo",          // ← slug sin espacios, en minúsculas
  ciudad: "CARTAGENA",             // ← "CARTAGENA" | "SANTA_MARTA" | "BOGOTA"
  direccion: "Calle 1 #2-3, ...",
  descripcion: "...",
  leermas: "/infonuevo",
  mapa: "https://maps.google.com/...",
  imgBusqueda: "https://...",
  imgDetalle: "https://...",
  imgUpgrade: "https://...",       // ← null si no participa en el modal de upgrade
  imgGestionar: "https://...",
  imgCotizacion: {
    main: "https://...",
    secondary1: "https://...",
    secondary2: "https://...",
  },
  iconos: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    // ... más iconos
  ],
  habitaciones: {
    [roomId]: { url: "https://...", name: "Habitación Doble" },
  },
  roomsMapName: [
    { roomId: 12345, mapName: "DOBLE" },
  ],
  motivoId: 8,                     // ← null si no usa Booking Connect
  quintuple: false,
  planAlimentacionDisponibilidad: false,
  planAlimentacionFormulario: false,
  ubicacionGestionar: "Calle 1 #2-3 / Ciudad",
  nombreVariants: ["hotel nuevo"],
},
```

Todos los componentes del motor lo reconocerán automáticamente sin ningún cambio adicional.

---

## Nota sobre `planAlimentacion`

Algunos hoteles tienen valores distintos entre `planAlimentacionDisponibilidad` y `planAlimentacionFormulario`. Esto es intencional:

| Hotel | DisponibilidadH | FormularioReserva | Motivo |
|---|---|---|---|
| Abi Inn (5) | `false` | `true` | Problemas con reservas de pocos huéspedes |
| Aixo (4) | `true` | `true` | — |
| Madisson (3) | `true` | `false` | — |
| Windsor (10) | `true` | `false` | — |
| Boquilla (56) | `false` | `true` | — |

No unificar estos valores sin verificar primero con el equipo de operaciones.

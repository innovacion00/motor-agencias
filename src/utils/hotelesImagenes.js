/**
 * Fuente única de imágenes de hoteles para los módulos de cotización
 * (Cotizacion, CotizacionCreada y CotizacionPublica).
 *
 * Antes cada componente tenía su propia copia del mapa y se desincronizaban:
 * al agregar o corregir una foto hay que hacerlo aquí y en ningún otro lado.
 */

const IMAGENES_POR_DEFECTO = {
  main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
  secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
  secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
};

const IMAGENES_POR_HOTEL = {
  // Hoteles Cartagena
  1: {
    main: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244634659.jpg?k=becae71ed93bcf69535c2704fb02e0d97a3e078e017b9356a7a3fcc6d60ca4ee&o=&hp=1",
    secondary1: "https://media.staticontent.com/media/pictures/a623702c-3190-4110-9d27-79b099e71011/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
    secondary2: "https://media.staticontent.com/media/pictures/a36166a6-1d7a-4c79-aa28-7f2d3bb507e0/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
  },
  4: {
    main: "https://media.staticontent.com/media/pictures/223a5234-1faa-42b5-917d-ff767cb45395/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
    secondary1: "https://media.staticontent.com/media/pictures/78704123-88d2-449f-9f84-e1e0a7a2f083/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
    secondary2: "https://media.staticontent.com/media/pictures/e51fa841-77b8-4485-bb28-24820d002c37/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
  },
  5: {
    main: "https://media.staticontent.com/media/pictures/57649af0-f7fb-41ea-bf13-b46428d7f48c/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
    secondary1: "https://media.staticontent.com/media/pictures/74839094-092a-471c-9089-bbe30c0a51f1/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
    secondary2: "https://media.staticontent.com/media/pictures/bd238c58-1846-44f6-98ab-5d3b92388402/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
  },
  6: {
    main: "https://media.staticontent.com/media/pictures/bfa3a92f-1dc3-4750-9487-c2d1028df243/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1",
    secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Avexi-living.jpg",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/foodStanAvexi.jpg",
  },
  7: {
    main: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena4469.jpg",
    secondary1: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena2953.jpg",
    secondary2: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena14676.jpg",
  },
  9: {
    main: "https://media.staticontent.com/media/pictures/8ec9a39c-8af0-4aef-9832-b8fe38e6793f/1120x700?op=fit",
    secondary1: "https://media.staticontent.com/media/pictures/75489e46-d229-4612-bb4e-3d61064a063f/1120x700?op=fit",
    secondary2: "https://media.staticontent.com/media/pictures/c8356922-9841-4db7-bb6e-9628ad6863f0/1120x700?op=fit",
  },
  56: {
    main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/fachada_boquilla.jpg",
    secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada2_boquilla.jpg",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/desayuno_boquilla.jpg",
  },

  // Hoteles Santa Marta
  8: {
    main: "https://media.staticontent.com/media/pictures/324ab199-ba77-4d2e-b0c3-1a5be4fe0c9c/1120x700?op=fit",
    secondary1: "https://media.staticontent.com/media/pictures/80fc021d-b8ee-454a-afdd-0e7c17394131/1120x700?op=fit",
    secondary2: "https://media.staticontent.com/media/pictures/8e7ed4f5-5c4a-4f6f-a795-05a87cbecf33/1120x700?op=fit",
  },
  48: {
    main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Lobbyaxis.jpeg",
    secondary1: "https://media.staticontent.com/media/pictures/99935878-83d2-47d4-8655-7abcafb62319/1120x700?op=fit",
    secondary2: "https://media.staticontent.com/media/pictures/ab665892-ebc9-4ffe-bacf-4eef2181d1a2/1120x700?op=fit",
  },
  44: {
    main: "https://media.staticontent.com/media/pictures/94080fbb-8f02-4286-8534-97bfccce911e/1120x700?op=fit",
    secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/535990853.jpg?k=15f0dd4cc6a6e4d3eb35cae6b196c8bab43f3734514a24a24f5f29415e8575ce&o=&hp=1",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Buffet.jpeg",
  },
  41: {
    main: "https://www.gehsuites.com/images/fachada-azuan.jpg", // Imagen por defecto para Zulita
    secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
    secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
  },
  123: {
    main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/lobby_salguero.jpg",
    secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/cafeteria2_salguero.jpg",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/piscina_salguero.jpg",
  },

  // Hoteles Bogotá
  10: {
    main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/13HotelWindsorHouse140.jpg",
    secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/16238085.jpg?k=06a06c7743d80aaf15faeec73bff1276191de84cc145d21dfc65c779b921d47c&o=",
    secondary2: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/660491565.jpg?k=62868506b0ed36eed3746e554d19f223bc952c0b6bacbb948ca444d58be917d9&o=",
  },
  3: {
    main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison10238.jpg",
    secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison8955.jpg",
    secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison6250.jpg",
  },
};

// Mapa inverso: nombre -> id, para resolver imágenes cuando solo se tiene el nombre
const ID_POR_NOMBRE = {
  // Hoteles Cartagena (nombres nuevos y anteriores)
  "hotel azuan": 1,
  "hotel azuan suites": 1,
  "hotel aixo": 4,
  "hotel aixo suites": 4,
  "hotel abi": 5,
  "hotel abi inn": 5,
  "hotel avexi": 6,
  "hotel avexi suites": 6,
  "hotel bocagrande": 7,
  "hotel bocagrande suites": 7,
  "hotel marina": 9,
  "hotel marina suites": 9,
  "hotel boquilla": 56,
  "hotel boquilla suites": 56,
  // Hoteles Santa Marta
  "hotel rodadero": 8,
  "hotel 1525": 2,
  "hotel axis": 48,
  "hotel axis inn": 48,
  "hotel sansiraka": 44,
  "hotel sansiraka inn": 44,
  "playa salguero hotel": 123,
  "hotel playa salguero": 123,
  // Hoteles Bogotá
  "hotel windsor": 10,
  "hotel madisson": 3,
};

/** Devuelve { main, secondary1, secondary2 } del hotel, o el juego por defecto. */
export function getHotelImagesById(hotelId) {
  return IMAGENES_POR_HOTEL[hotelId] || IMAGENES_POR_DEFECTO;
}

/** Resuelve el id de hotel a partir de su nombre; undefined si no lo reconoce. */
export function getHotelIdByName(hotelName) {
  if (!hotelName) return undefined;
  return ID_POR_NOMBRE[String(hotelName).trim().toLowerCase()];
}

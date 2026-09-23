import { HOTELES, getHotelIdByNombre } from '../data/hotelesConfig';

const IMAGENES_POR_DEFECTO = {
  main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
  secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
  secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
};

/** Devuelve { main, secondary1, secondary2 } del hotel, o el juego por defecto. */
export function getHotelImagesById(hotelId) {
  return HOTELES[Number(hotelId)]?.imgCotizacion || IMAGENES_POR_DEFECTO;
}

/** Resuelve el id de hotel a partir de su nombre; undefined si no lo reconoce. */
export function getHotelIdByName(hotelName) {
  return getHotelIdByNombre(hotelName);
}

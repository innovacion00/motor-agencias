import { esFlujoVueloHotelActivo } from "./flightSearch";
import { getDescuentoHospedaje } from "../stores/preciosExtras";

/**
 * Las búsquedas de vuelo + hotel llevan un descuento sobre la tarifa de
 * habitación. El vuelo y los adicionales (tours, traslados, mascotas) se
 * cobran siempre completos.
 */
/**
 * Descuento vigente para flujos vuelo+hotel, leído del catálogo precios_extras.
 */
export const DESCUENTO_HOSPEDAJE_VUELO_HOTEL = getDescuentoHospedaje();

/** true si la búsqueda vigente es vuelo + hotel y por tanto el hospedaje lleva descuento. */
export const aplicaDescuentoHospedaje = () => esFlujoVueloHotelActivo();

/**
 * Aplica el descuento a una tarifa de habitación.
 *
 * @param {number|string} precio Tarifa base de la habitación.
 * @param {boolean} [aplica] Permite fijar la decisión una sola vez y reutilizarla
 *   dentro de bucles de render, en vez de releer localStorage por cada producto.
 * @returns {number|string} El precio con descuento, o el valor original si no aplica.
 */
export const conDescuentoHospedaje = (
  precio,
  aplica = aplicaDescuentoHospedaje()
) => {
  if (!aplica) return precio;
  const valor = parseFloat(precio);
  if (!Number.isFinite(valor)) return precio;
  return valor * (1 - getDescuentoHospedaje());
};

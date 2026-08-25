import { esFlujoVueloHotelActivo } from "./flightSearch";

/**
 * Las búsquedas de vuelo + hotel llevan un descuento sobre la tarifa de
 * habitación. El vuelo y los adicionales (tours, traslados, mascotas) se
 * cobran siempre completos.
 */
export const DESCUENTO_HOSPEDAJE_VUELO_HOTEL = 0.05;

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
  return valor * (1 - DESCUENTO_HOSPEDAJE_VUELO_HOTEL);
};

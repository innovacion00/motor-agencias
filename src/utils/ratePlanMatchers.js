/**
 * Los planes de Booking Connect no llegan con un nombre uniforme desde el PMS.
 * Ejemplos reales vistos en `product.roomName` / `product.rateDescription`:
 *
 *   "Doble estandar[Booking connect Neto]"          -> hoteles antiguos
 *   "Doble[Booking connect Mayorista PA]"           -> hoteles antiguos
 *   "Familiar[Booking Connect – Minorista ]"        -> El Marques (id 164)
 *
 * El Marques usa guion largo (–), la palabra "Minorista" en vez de "Neto" y
 * deja un espacio antes del corchete de cierre, por lo que las expresiones
 * fijas /\[Booking connect Neto\]/i no encontraban ningún producto y la
 * habitación quedaba sin precio ("Sin Disponibilidad").
 *
 * Estos matchers toleran esas variaciones sin aflojar la regla que separa
 * los planes de alimentación: el sufijo (PA / PAM) sigue siendo exacto.
 */

/** Separador entre "Booking Connect" y el nombre de la tarifa: espacios y/o guiones. */
const SEPARADOR = "[\\s\\u002D\\u2013\\u2014]*";

/** "Minorista" es el nombre nuevo de la tarifa neta/minorista. */
const ALIAS_TARIFA = {
  neto: "(?:Neto|Minorista)",
  mayorista: "(?:Mayorista)",
};

/** Sufijo del plan de alimentación dentro del corchete. */
const SUFIJO_PLAN = {
  solodesayuno: "",
  pensioncompleta: "PA",
  mediapension: "PAM",
};

const construirRegex = (tarifa, planDeAlimentacion) => {
  const alias = ALIAS_TARIFA[tarifa] || ALIAS_TARIFA.mayorista;
  const sufijo = SUFIJO_PLAN[planDeAlimentacion] ?? "";
  const patronSufijo = sufijo ? `\\s+${sufijo}` : "";

  return new RegExp(
    `\\[\\s*Booking${SEPARADOR}Connect${SEPARADOR}${alias}${patronSufijo}\\s*\\]`,
    "i"
  );
};

/**
 * Regex para filtrar los productos que corresponden a la tarifa de la agencia.
 *
 * @param {number|string|undefined} agencyCategory `0` = minorista/neto, resto = mayorista.
 * @param {"solodesayuno"|"mediapension"|"pensioncompleta"} [planDeAlimentacion]
 * @returns {RegExp}
 */
export const buildRatePlanRegex = (
  agencyCategory,
  planDeAlimentacion = "solodesayuno"
) =>
  construirRegex(
    Number(agencyCategory) === 0 ? "neto" : "mayorista",
    planDeAlimentacion
  );

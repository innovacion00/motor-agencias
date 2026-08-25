import { getAirlineLogo } from "./vueloCotizacion";
import { conDescuentoHospedaje } from "./descuentoHospedaje";

/** Hoteles que la lista de resultados no muestra. */
const HOTELES_EXCLUIDOS = [2, 41, 7];

/** Hoteles que no se sugieren como paquete, por ciudad. Ids según hotelNombreStoragePorId. */
const HOTELES_EXCLUIDOS_POR_CIUDAD = {
  CARTAGENA: [56], // Boquilla
  SANTA_MARTA: [8, 123], // Rodadero y Playa Salguero
  BOGOTA: [],
};

/** Ciudades donde la sugerencia rota entre hoteles en vez de fijarse en el más barato. */
const CIUDADES_CON_ROTACION = ["SANTA_MARTA"];

/**
 * Precio mínimo entre todos los productos de todas las habitaciones de un hotel.
 * Es la misma lógica que alimenta el "Desde:" de la lista de resultados.
 *
 * @param {boolean} [conDescuento] Aplica el descuento de vuelo + hotel al resultado.
 * @returns {{ amount: number, trm: number|null }|null} null si el hotel no tiene precios.
 */
export const findMinBaseRate = (availability, currentCurrency, conDescuento = false) => {
  let minAmount = Infinity;
  let trm = null;

  (availability || []).forEach((entry) => {
    (entry.available_rooms || []).forEach((room) => {
      (room.products || []).forEach((product) => {
        const amount =
          currentCurrency === "USD"
            ? product?.baseRate?.amountBeforeTaxUSD
            : product?.baseRate?.amountBeforeTax;
        const parsed = parseFloat(amount);
        if (Number.isFinite(parsed) && parsed < minAmount) {
          minAmount = parsed;
          const parsedTrm = parseFloat(product?.trm);
          trm = Number.isFinite(parsedTrm) && parsedTrm > 0 ? parsedTrm : null;
        }
      });
    });
  });

  if (minAmount === Infinity) return null;

  // El descuento es un porcentaje fijo, así que el mínimo con descuento es el
  // descuento del mínimo: basta aplicarlo una vez al final.
  return { amount: conDescuentoHospedaje(minAmount, conDescuento), trm };
};

/**
 * Hoteles que pueden sugerirse en la ciudad dada, ordenados de más barato a más caro.
 *
 * @returns {Array<{ hotel: object, precio: number, trm: number|null }>}
 */
export const getHotelesElegibles = (
  hoteles,
  currentCurrency,
  ciudad,
  conDescuento = false
) => {
  if (!Array.isArray(hoteles)) return [];
  const excluidosCiudad = HOTELES_EXCLUIDOS_POR_CIUDAD[ciudad] || [];

  return hoteles
    .filter(
      (tipo) =>
        !HOTELES_EXCLUIDOS.includes(tipo?.hotel?.id) &&
        !excluidosCiudad.includes(tipo?.hotel?.id)
    )
    .map((tipo) => {
      const min = findMinBaseRate(tipo.availability, currentCurrency, conDescuento);
      return min
        ? { hotel: tipo.hotel, precio: min.amount, trm: min.trm }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.precio - b.precio);
};

/**
 * Hotel a destacar en la card. Por defecto el de habitación más barata; en las
 * ciudades con rotación se avanza una posición por consulta para no recomendar
 * siempre el mismo hotel.
 *
 * @param {number} rotacion Contador de consultas, lo lleva el buscador.
 * @returns {{ hotel: object, precio: number, trm: number|null }|null}
 */
export const getHotelSugerido = (
  hoteles,
  currentCurrency,
  ciudad,
  rotacion = 0,
  conDescuento = false
) => {
  const elegibles = getHotelesElegibles(
    hoteles,
    currentCurrency,
    ciudad,
    conDescuento
  );
  if (elegibles.length === 0) return null;
  if (!CIUDADES_CON_ROTACION.includes(ciudad)) return elegibles[0];

  const total = elegibles.length;
  const indice = (((rotacion % total) + total) % total);
  return elegibles[indice];
};

/** Normaliza un tramo (outbound/inbound) al mínimo que necesita la card. */
const normalizarTramo = (tramo) => {
  const segments = tramo?.segments || [];
  if (segments.length === 0) return null;

  const primero = segments[0];
  const ultimo = segments[segments.length - 1];
  const escalas = tramo.connections || 0;

  return {
    origin: primero.departureCode,
    destination: ultimo.arrivalCode,
    departure: primero.departureTime,
    arrival: ultimo.arrivalTime,
    departureDate: primero.departureDate,
    type: escalas === 0 ? "Directo" : `${escalas} escala${escalas > 1 ? "s" : ""}`,
    airlineCode: primero.airlineCode,
    airlineName: primero.airlineName || primero.airlineCode,
    logo: getAirlineLogo(primero.airlineCode),
  };
};

/**
 * Primera oferta de la respuesta de disponibilidad aérea, que con
 * `search_mode: "SEARCH_BEST_DEAL"` es la más barata que devuelve el proveedor.
 *
 * @returns {{ flightId, totalPriceUsd, passengers, outbound, inbound }|null}
 */
export const getPrimerVuelo = (dataVuelo) => {
  const ofertas = [
    ...(dataVuelo?.recommendedFlights || []),
    ...(dataVuelo?.flights || []),
  ];
  const oferta = ofertas[0];
  if (!oferta) return null;

  const outbound = normalizarTramo(oferta.outbound);
  if (!outbound) return null;

  return {
    flightId: oferta.flightId,
    totalPriceUsd: parseFloat(oferta.totalPrice) || 0,
    passengers:
      oferta.pricePerPassenger?.length ||
      dataVuelo?.Passengers?.NumberOfAdults ||
      1,
    outbound,
    inbound: normalizarTramo(oferta.inbound),
  };
};

/**
 * Suma alojamiento + vuelo en la divisa seleccionada.
 * El hotel ya viene en esa divisa; el vuelo siempre llega en USD porque la
 * consulta de disponibilidad aérea fija `currency: "USD"`.
 *
 * @returns {{ total: number|null, porPersona: number|null, precioVuelo: number|null }}
 *   `total` es null cuando falta la TRM para convertir el vuelo a COP.
 */
export const calcularTotalPaquete = ({
  precioHotel,
  precioVueloUsd,
  currency,
  trm,
  personas = 1,
}) => {
  const sinTotal = { total: null, porPersona: null, precioVuelo: null };

  if (!Number.isFinite(precioHotel) || !Number.isFinite(precioVueloUsd)) {
    return sinTotal;
  }

  let precioVuelo;
  if (currency === "USD") {
    precioVuelo = precioVueloUsd;
  } else if (Number.isFinite(trm) && trm > 0) {
    precioVuelo = precioVueloUsd * trm;
  } else {
    return sinTotal;
  }

  const total = precioHotel + precioVuelo;
  const divisor = personas > 0 ? personas : 1;

  return { total, porPersona: total / divisor, precioVuelo };
};

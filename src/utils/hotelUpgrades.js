import { conDescuentoHospedaje } from "./descuentoHospedaje";
import { HOTELES } from '../data/hotelesConfig';

/** Habitaciones excluidas del cálculo de precio mínimo (misma regla que DisponibilidadH). */
const EXCLUDED_ROOM_IDS = new Set([164102]);

export const HOTEL_FACADE_IMAGES = Object.fromEntries(
  Object.values(HOTELES).filter(h => h.imgUpgrade).map(h => [h.id, h.imgUpgrade])
);

const HOTEL_DISPLAY_NAMES = Object.fromEntries(
  Object.values(HOTELES).map(h => [h.id, h.nombre])
);

/** Cartagena: Boquilla → Azuan/Avexi/Marina; Azuan/Avexi/Marina → Abi/Aixo */
const CARTAGENA_UPGRADE_TARGETS = {
  56: [1, 6, 9],
  1: [5, 4],
  6: [5, 4],
  9: [5, 4],
};

/** Santa Marta: Salguero → Rodadero/Axis; Rodadero/Axis → Sansiraka */
const SANTA_MARTA_UPGRADE_TARGETS = {
  123: [8, 48],
  8: [44],
  48: [44],
};

export function normalizeCity(city) {
  const value = String(city || "").toUpperCase().trim();
  if (value.includes("CARTAGENA")) return "CARTAGENA";
  if (value.includes("SANTA") || value.includes("MARTA")) return "SANTA_MARTA";
  if (value.includes("BOGOTA") || value.includes("BOGOT")) return "BOGOTA";
  return value;
}

export function getUpgradeTargetIds(hotelId, city) {
  const id = Number(hotelId);
  const normalized = normalizeCity(city);

  if (normalized === "BOGOTA") return [];
  if (normalized === "CARTAGENA") return CARTAGENA_UPGRADE_TARGETS[id] || [];
  if (normalized === "SANTA_MARTA") return SANTA_MARTA_UPGRADE_TARGETS[id] || [];
  return [];
}

/** Boquilla: de Azuan/Avexi/Marina, solo los 2 con mayor precio mínimo. */
export function pickTopPricedHotelIds(
  pool,
  allHotelsData,
  currency,
  regex,
  count = 2
) {
  const list = Array.isArray(allHotelsData) ? allHotelsData : [];

  const ranked = pool.map((targetId) => {
    const id = Number(targetId);
    const block = list.find((item) => Number(item?.hotel?.id) === id);
    const minPrice = block
      ? getCheapestRoomPrice(block.availability, currency, regex)
      : null;
    return { id, minPrice };
  });

  const withPrice = ranked
    .filter((item) => item.minPrice != null)
    .sort((a, b) => b.minPrice - a.minPrice);

  if (withPrice.length > 0) {
    return withPrice.slice(0, count).map((item) => item.id);
  }

  return ranked.slice(0, count).map((item) => item.id);
}

/**
 * IDs finales a mostrar en el modal (aplica reglas dinámicas, p. ej. Boquilla → top 2 por precio).
 */
export function resolveUpgradeTargetIds(
  hotelId,
  city,
  allHotelsData,
  { currency, regex }
) {
  const id = Number(hotelId);
  const normalized = normalizeCity(city);
  let targets = getUpgradeTargetIds(id, city);

  if (
    id === 56 &&
    normalized === "CARTAGENA" &&
    targets.length > 2
  ) {
    targets = pickTopPricedHotelIds(
      targets,
      allHotelsData,
      currency,
      regex,
      2
    );
  }

  return targets;
}

export function shouldShowUpgradeModal(hotelId, city) {
  return getUpgradeTargetIds(hotelId, city).length > 0;
}

/**
 * Precio mínimo de habitación según tarifa de agencia (regex) y divisa.
 * @returns {number|null}
 */
export function getCheapestRoomPrice(availability, currency, regex) {
  if (!availability?.length) return null;

  let min = Infinity;

  for (const entry of availability) {
    for (const room of entry.available_rooms || []) {
      if (EXCLUDED_ROOM_IDS.has(room.roomId)) continue;

      for (const product of room.products || []) {
        const roomName = product.roomName || "";
        const rateDescription = product.rateDescription || "";
        if (
          regex &&
          !regex.test(roomName) &&
          !regex.test(rateDescription)
        ) {
          continue;
        }

        const amount =
          currency === "USD"
            ? product?.baseRate?.amountBeforeTaxUSD
            : product?.baseRate?.amountBeforeTax;

        if (typeof amount === "number" && !Number.isNaN(amount) && amount < min) {
          min = amount;
        }
      }
    }
  }

  // Se aplica el descuento de vuelo + hotel para que el modal muestre el mismo
  // precio que el usuario verá al entrar al hotel. Es un porcentaje uniforme,
  // así que el orden relativo entre hoteles no cambia.
  return min === Infinity ? null : conDescuentoHospedaje(min);
}

export function buildUpgradeOptions(
  allHotelsData,
  targetIds,
  { currency, regex, formatCurrency }
) {
  const list = Array.isArray(allHotelsData) ? allHotelsData : [];

  return targetIds.map((targetId) => {
    const id = Number(targetId);
    const block = list.find((item) => Number(item?.hotel?.id) === id);
    const minPrice = block
      ? getCheapestRoomPrice(block.availability, currency, regex)
      : null;
    const name =
      block?.hotel?.name || HOTEL_DISPLAY_NAMES[id] || `Hotel ${id}`;

    return {
      id,
      name,
      image: HOTEL_FACADE_IMAGES[id] || block?.hotel?.image || "",
      priceLabel:
        minPrice != null
          ? `Desde: ${formatCurrency(minPrice)} ${currency}`
          : "Sin disponibilidad para estas fechas",
      hasAvailability: minPrice != null,
    };
  });
}

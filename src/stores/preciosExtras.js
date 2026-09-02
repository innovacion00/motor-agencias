/**
 * Cliente del catálogo `precios_extras` del backend (GET /precios-extras/public).
 *
 * La carga es perezosa y cacheada (memoria 10 min + sessionStorage). Cada
 * selector tiene fallbacks idénticos a los valores que estaban hardcodeados,
 * así el flujo funciona incluso con el backend caído y la migración es 1:1.
 * El metadata de los tours (imágenes, includes, qué llevar…) vive exclusivamente
 * en el backend (`informacion`); el front solo lo renderiza.
 */
const URL = import.meta.env.PUBLIC_API_URL ?? "";
const TTL_MS = 10 * 60 * 1000;
const SS_PREFIX = "preciosExtras:v1:";

const cache = new Map();

const FALLBACK = Object.freeze({
  mascota: { COP: 75000, USD: 21 },
  alimentacion: { COP: 30000 },
  descuentoHospedaje: 0.05,
  hotelesCartagenaPremium: new Set([1, 6, 9]),
  traslados: {
    CARTAGENA: {
      estandar: { p: [38000, 76000], u: [12, 21] },
      premium: { p: [45000, 90000], u: [14, 25] },
    },
    SANTA_MARTA: { p: [70000, 140000], u: [17, 34] },
    BOGOTA: { p: [73200, 146200], u: [17.7, 35.4] },
  },
});

const claveCache = (hotelId, currency) =>
  `${hotelId ?? ""}|${(currency ?? "COP").toUpperCase()}`;

const leerCache = (hotelId, currency) => {
  const k = claveCache(hotelId, currency);
  const e = cache.get(k);
  if (!e) return null;
  if (Date.now() - e.t > TTL_MS) {
    cache.delete(k);
    return null;
  }
  return e.rows;
};

const leerSessionStorage = (k) => {
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + k);
    if (raw) {
      const rows = JSON.parse(raw);
      if (Array.isArray(rows) && rows.length) return rows;
    }
  } catch {
    /* storage no disponible */
  }
  return null;
};

const guardarSessionStorage = (k, rows) => {
  try {
    sessionStorage.setItem(SS_PREFIX + k, JSON.stringify(rows));
  } catch {
    /* storage no disponible */
  }
};

/**
 * Carga (una vez por hotelId|currency) el catálogo completo: globales + los
 * overrides específicos del hotel. Devuelve siempre un arreglo.
 */
export async function cargarPreciosExtras({ hotelId = null, currency = "COP" } = {}) {
  const k = claveCache(hotelId, currency);
  const fresco = leerCache(hotelId, currency);
  if (fresco) return fresco;

  const params = new URLSearchParams({ currency: (currency ?? "COP").toUpperCase() });
  if (hotelId != null && !Number.isNaN(Number(hotelId))) {
    params.set("hotelId", String(hotelId));
  }

  try {
    const res = await fetch(`${URL}/agencias/v1/precios-extras/public?${params}`);
    if (!res.ok) throw new Error("precios-extras no disponible");
    const data = await res.json();
    const rows = Array.isArray(data?.data) ? data.data : [];
    cache.set(k, { t: Date.now(), rows });
    guardarSessionStorage(k, rows);
    return rows;
  } catch {
    const rows = leerSessionStorage(k);
    if (rows) return rows;
    return [];
  }
}

const itemsActuales = (hotelId, currency, opciones) =>
  opciones?.rows ?? leerCache(hotelId, currency) ?? [];

export function getMascotaPrecio(currency = "COP", opciones = {}) {
  const usd = (currency ?? "COP").toUpperCase() === "USD";
  const rows = itemsActuales(opciones.hotelId, currency, opciones);
  const item = rows.find((i) => i.concepto === "mascota");
  if (item) {
    const v = usd ? item.precioUSD : item.precioCOP;
    if (v != null && Number(v) >= 0) return Number(v);
  }
  return usd ? FALLBACK.mascota.USD : FALLBACK.mascota.COP;
}

export function getAlimentacionPrecio(detalle = "Cena", currency = "COP", opciones = {}) {
  const rows = itemsActuales(opciones.hotelId, currency, opciones);
  const norm = String(detalle || "").toLowerCase();
  const item = rows.find(
    (i) => i.concepto === "alimentacion" && i.detalle?.toLowerCase() === norm
  );
  if (item && item.precioCOP != null && Number(item.precioCOP) >= 0) {
    return Number(item.precioCOP);
  }
  return FALLBACK.alimentacion.COP;
}

export function getDescuentoHospedaje(opciones = {}) {
  const currency = opciones.currency ?? "COP";
  const rows = itemsActuales(opciones.hotelId, currency, opciones);
  const item = rows.find((i) => i.concepto === "descuento" && i.porcentaje != null);
  if (item) return Number(item.porcentaje);
  return FALLBACK.descuentoHospedaje;
}

/**
 * Tasa de IVA de hospedaje como fracción (0.19). Un item específico del hotel
 * (p. ej. exento con porcentaje 0) tiene prioridad sobre el global.
 */
export function getIvaPorcentaje(hotelId = null, opciones = {}) {
  const rows = itemsActuales(opciones.hotelId ?? hotelId, "COP", opciones);
  const impuestos = rows.filter((i) => i.concepto === "impuesto");
  const especifico = impuestos.find((i) => i.hotelId != null && i.hotelId === Number(hotelId));
  const global = especifico ?? impuestos.find((i) => i.hotelId == null);
  if (global?.porcentaje != null) return Number(global.porcentaje) / 100;
  return 0.19;
}

/**
 * Tarifas de traslado por ciudad (y hotel para Cartagena premium):
 * devuelve { 0: "1 vía", 1: "ida y regreso" } en la divisa pedida.
 */
export function getTarifasTraslado(ciudad, currency = "COP", hotelId = null, opciones = {}) {
  const c = (ciudad ?? "").trim().toUpperCase();
  const usd = (currency ?? "COP").toUpperCase() === "USD";
  const rows = itemsActuales(opciones.hotelId ?? hotelId, currency, opciones);

  const candidatos = rows.filter(
    (i) => i.concepto === "traslado" && (c === "" || !i.ciudad || i.ciudad.toUpperCase() === c)
  );
  const especificos = candidatos.filter((i) => i.hotelId != null && i.hotelId === Number(hotelId));
  const base = especificos.length
    ? especificos
    : candidatos.filter((i) => i.hotelId == null);

  if (base.length) {
    const pick = (orden) => {
      const item = base.find((i) => Number(i.orden) === orden);
      if (!item) return 0;
      const v = usd ? item.precioUSD : item.precioCOP;
      return v != null ? Number(v) : 0;
    };
    return { 0: pick(0), 1: pick(1) };
  }

  if (c === "CARTAGENA") {
    const tier = FALLBACK.hotelesCartagenaPremium.has(Number(hotelId)) ? "premium" : "estandar";
    const t = FALLBACK.traslados.CARTAGENA[tier];
    return usd
      ? { 0: t.u[0], 1: t.u[1] }
      : { 0: t.p[0], 1: t.p[1] };
  }
  if (FALLBACK.traslados[c]) {
    const t = FALLBACK.traslados[c];
    return usd ? { 0: t.u[0], 1: t.u[1] } : { 0: t.p[0], 1: t.p[1] };
  }
  return { 0: 0, 1: 0 };
}

const fmtCOP = (v) => `$ ${Number(v).toLocaleString("es-CO")} COP por persona`;
const fmtUSD = (v) =>
  `$ ${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })} USD por persona`;

/**
 * Catálogo de tours construido 100% desde el backend (`concepto: tour`).
 * El metadata (description, images, includes, toBring, notIncludes,
 * restrictions, cancellationPolicy, schedule, duration, meetingPoint)
 * viene en `informacion` y se aplana al objeto para consumo directo.
 * Sin backend devuelve un arreglo vacío (fuente única = backend).
 */
export function construirCatalogoTours(rows) {
  return rows
    .filter((i) => i.concepto === "tour")
    .map((i) => ({
      ...(i.informacion || {}),
      id: Number(i.orden) || 0,
      title: i.detalle,
      city: (i.ciudad || "").toUpperCase(),
      preciocol: i.precioCOP != null ? String(i.precioCOP) : "",
      preciousd: i.precioUSD != null ? String(i.precioUSD) : "",
      price: i.precioCOP != null ? fmtCOP(i.precioCOP) : "",
      priceUSD: i.precioUSD != null ? fmtUSD(i.precioUSD) : "",
      precioApi: i,
    }));
}

export async function obtenerCatalogoTours({ hotelId = null, currency = "COP" } = {}) {
  try {
    const rows = await cargarPreciosExtras({ hotelId, currency });
    return construirCatalogoTours(rows);
  } catch {
    return [];
  }
}

/** Precarga el catálogo para un contexto (hotel + divisa) sin bloquear el render. */
export function precargarPreciosExtras({ hotelId = null, currency = "COP" } = {}) {
  cargarPreciosExtras({ hotelId, currency }).catch(() => null);
}
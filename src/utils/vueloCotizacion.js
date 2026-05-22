/** Utilidades compartidas para vuelos en cotizaciones (payload, precio, UI). */

import { esFlujoVueloHotelActivo } from './flightSearch';

export function getLegFlightCode(leg) {
  if (!leg || typeof leg !== "object") return "—";
  if (leg.flightCode != null && leg.flightCode !== "") return String(leg.flightCode);
  if (leg.flightNumber != null && leg.flightNumber !== "") {
    const carrier = leg.carrierCode ?? leg.airlineCode ?? "";
    return `${carrier}${leg.flightNumber}`.trim() || String(leg.flightNumber);
  }
  const segs = leg.segments;
  if (Array.isArray(segs) && segs.length > 0) {
    const s = segs[0];
    const num = s.flightNumber ?? s.number ?? s.flight_num;
    const carrier = s.carrierCode ?? s.airlineCode ?? "";
    if (num != null && num !== "") return `${carrier}${num}`.trim() || String(num);
    if (s.flightCode != null && s.flightCode !== "") return String(s.flightCode);
  }
  return "—";
}

export function getLegRouteLine(leg) {
  if (!leg || typeof leg !== "object") return "—";
  const segs = leg.segments;
  if (Array.isArray(segs) && segs.length > 0) {
    const first = segs[0];
    const last = segs[segs.length - 1];
    const oCode = first.departureCode || first.origin || leg.origin || "—";
    const dCode = last.arrivalCode || last.destination || leg.destination || "—";
    const oCity = first.departureCityName || leg.originCity || "";
    const dCity = last.arrivalCityName || leg.destinationCity || "";
    if (oCity && dCity) return `${oCity} (${oCode}) → ${dCity} (${dCode})`;
    return `${oCode} → ${dCode}`;
  }
  const oCode = leg.origin || leg.departureCode || "—";
  const dCode = leg.destination || leg.arrivalCode || "—";
  const oCity = leg.originCity || leg.departureCityName || "";
  const dCity = leg.destinationCity || leg.arrivalCityName || "";
  if (oCity && dCity) return `${oCity} (${oCode}) → ${dCity} (${dCode})`;
  return `${oCode} → ${dCode}`;
}

export function getLegAirlineName(leg) {
  if (!leg || typeof leg !== "object") return "—";
  if (leg.airlineName != null && String(leg.airlineName).trim() !== "") {
    return String(leg.airlineName);
  }
  const segs = leg.segments;
  if (Array.isArray(segs) && segs.length > 0) {
    const s = segs[0];
    if (s.airlineName != null && String(s.airlineName).trim() !== "") {
      return String(s.airlineName);
    }
    const code = s.carrierCode ?? s.airlineCode;
    if (code) return String(code);
  }
  return "—";
}

export function getLegCarrierCode(leg) {
  if (!leg || typeof leg !== "object") return "";
  const segs = leg.segments;
  if (Array.isArray(segs) && segs.length > 0) {
    const s = segs[0];
    const code = s.carrierCode ?? s.airlineCode;
    if (code != null && String(code).trim() !== "") return String(code).trim();
  }
  const code = leg.carrierCode ?? leg.airlineCode;
  return code != null ? String(code).trim() : "";
}

export function getAirlineLogo(carrierCode) {
  const airlineLogos = {
    AV: "https://content.r9cdn.net/rimg/provider-logos/airlines/v/AV.png?crop=false&width=108&height=92&fallback=default2.png&_v=9da891fb64018166c1a5228d9c46e5ef",
    LA: "https://content.r9cdn.net/rimg/provider-logos/airlines/v/LA.png?crop=false&width=108&height=92&fallback=default1.png&_v=e2abb15ddcd9bf090836299b76d255e0",
    CM: "https://content.r9cdn.net/rimg/provider-logos/airlines/v/CM.png?crop=false&width=108&height=92&fallback=default1.png&_v=a61544cffd06cf2178b9a97659b98650",
    UA: "https://content.r9cdn.net/rimg/provider-logos/airlines/v/UA.png?crop=false&width=108&height=92&fallback=default1.png&_v=5549857010860b629834720579d831e5",
    B6: "https://s202.q4cdn.com/521076508/files/doc_downloads/logos/JetBlue-Logo_Blue.png",
    NH: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVvcvOq8qQLYp_o4IDIPXVVdHkLpgZLha6Fg&s",
    EK: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png",
    IB: "https://www.latamairlines.com/content/dam/latamxp/sites/alianzas/aerolineas-images_0011_iberia-Airlines.png",
    UX: "https://logodownload.org/wp-content/uploads/2019/10/air-europa-logo-0.png",
    JA: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyzD0GhR6Cb4t8ChiJwTz6QdgKQAHtsAhKjA&s",
    VB: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Nuevo_vivaaerobus_logotipo_original.jpg",
    P5: "https://imgproxy.domestika.org/unsafe/s:1200:1200/dpr:1/rs:fill/ex:true/el:true/plain/src://project-covers/000/508/871/508871-original.png?1558801782",
  };
  const code = (carrierCode || "").toUpperCase();
  return (
    airlineLogos[code] ||
    `https://via.placeholder.com/40x40/0066CC/FFFFFF?text=${encodeURIComponent(code || "?")}`
  );
}

export function obtenerTrmDesdeReserva(datosReserva) {
  if (!Array.isArray(datosReserva) || datosReserva.length === 0) return null;
  const trm = datosReserva.find((r) => r?.trm != null)?.trm ?? datosReserva[0]?.trm;
  const parsed = parseFloat(trm);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function aplicarTrmSiCop(precioUsd, divisaSelec, datosReserva) {
  const precio = parseFloat(String(precioUsd).replace(/,/g, "")) || 0;
  if (divisaSelec === "USD") return precio;
  const trm = obtenerTrmDesdeReserva(datosReserva);
  return trm ? precio * trm : precio;
}

/**
 * true solo si el usuario está en flujo vuelo+hotel (tipoBusqueda 3, fechas/origen)
 * y ya seleccionó un paquete de vuelo en dispoVuelos.
 */
export function tieneVueloEnCotizacion() {
  if (typeof window === "undefined") return false;
  if (!esFlujoVueloHotelActivo()) return false;
  try {
    const packageId = localStorage.getItem("flightPackageId");
    const packageData = JSON.parse(localStorage.getItem("flightPackageData") || "null");
    return !!(packageId || packageData?.packageId);
  } catch {
    return false;
  }
}

export function parsePrecioVueloPaquete(divisaSelec, datosReserva) {
  if (typeof window === "undefined" || !tieneVueloEnCotizacion()) return 0;
  try {
    const packageData = JSON.parse(localStorage.getItem("flightPackageData") || "null");
    const raw = packageData?.totalPrice ?? packageData?.flightBookPrice ?? 0;
    const parsed = parseFloat(String(raw).replace(/,/g, ""));
    return Number.isFinite(parsed) ? aplicarTrmSiCop(parsed, divisaSelec, datosReserva) : 0;
  } catch {
    return 0;
  }
}

export function getOrigenIataCotizacion() {
  if (typeof window === "undefined" || !esFlujoVueloHotelActivo()) return undefined;
  try {
    const datosDelVuelo = JSON.parse(localStorage.getItem("datosDelVuelo") || "{}");
    return datosDelVuelo?.originIata || undefined;
  } catch {
    return undefined;
  }
}

/** Construye respuestaMaarLab para el body de cotización desde localStorage. */
function buildRespuestaMaarLab(packageData, equipajeData) {
  const base = packageData ? { ...packageData } : {};
  if (equipajeData && typeof equipajeData === "object") {
    return { ...base, ...equipajeData };
  }
  return base;
}

export function buildVueloArrayParaCotizacion() {
  if (typeof window === "undefined" || !tieneVueloEnCotizacion()) return [];
  try {
    const packageId =
      localStorage.getItem("flightPackageId") ||
      JSON.parse(localStorage.getItem("flightPackageData") || "null")?.packageId;
    if (!packageId) return [];

    const packageData = JSON.parse(localStorage.getItem("flightPackageData") || "null");
    const equipajeData = JSON.parse(localStorage.getItem("dataVueloEquipaje") || "null");

    return [
      {
        packageId,
        createdAt: new Date().toISOString(),
        respuestaMaarLab: buildRespuestaMaarLab(packageData, equipajeData),
      },
    ];
  } catch {
    return [];
  }
}

/** Extrae tramos ida/vuelta de un item de cotización.vuelo[]. */
export function getTramosDesdeItemVuelo(item) {
  const r = item?.respuestaMaarLab || {};
  const f = r.flight || {};
  const outbound = f.outbound || f.Outbound || null;
  const inbound = f.inbound || f.Inbound || null;
  const segments = Array.isArray(r.segments) ? r.segments : [];
  return { r, f, outbound, inbound, segments };
}

export function getTotalVueloDisplay(item) {
  const { r, f } = getTramosDesdeItemVuelo(item);
  return r.totalPrice ?? r.total ?? f.totalPrice ?? "—";
}

export function getMonedaVueloDisplay(item) {
  const { r } = getTramosDesdeItemVuelo(item);
  return r.currency || "";
}

function formatTotalVueloCotizacion(item, divisaSelec, datosReserva) {
  const raw = getTotalVueloDisplay(item);
  const num = aplicarTrmSiCop(raw, divisaSelec, datosReserva);
  if (divisaSelec === "USD") {
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }
  return `$${Math.round(num).toLocaleString("es-CO")} COP`;
}

function renderTramoVueloPdf(etiqueta, leg) {
  if (!leg) return "";
  return `
    <div class="flight-leg">
      <span class="flight-leg-badge">${etiqueta}</span>
      <div class="flight-leg-body">
        <strong>${getLegFlightCode(leg)}</strong> · ${getLegAirlineName(leg)}
        <div class="flight-leg-route">${getLegRouteLine(leg)}</div>
      </div>
    </div>`;
}

/** HTML de sección vuelo para landingHtml (cotización PDF). */
export function generarHtmlVueloCotizacion(
  vueloArray,
  divisaSelec = "COP",
  datosReserva = []
) {
  if (!Array.isArray(vueloArray) || vueloArray.length === 0) return "";

  const itemsHtml = vueloArray
    .map((item, vIdx) => {
      const { r, outbound, inbound, segments } = getTramosDesdeItemVuelo(item);
      const pasajeros = Array.isArray(r.passengers) ? r.passengers : [];
      const totalFormateado = formatTotalVueloCotizacion(item, divisaSelec, datosReserva);

      let tramosHtml = "";
      if (outbound) tramosHtml += renderTramoVueloPdf("IDA", outbound);
      if (inbound) tramosHtml += renderTramoVueloPdf("VUELTA", inbound);
      if (!outbound && !inbound && segments.length > 0) {
        tramosHtml = segments
          .map(
            (s, i) =>
              renderTramoVueloPdf(`TRAMO ${i + 1}`, {
                origin: s.origin,
                destination: s.destination,
                flightNumber: s.flightNumber,
                airlineName: s.airlineName || s.carrierCode,
              })
          )
          .join("");
      }

      const metaParts = [];
      if (item.packageId) metaParts.push(`Ref. ${item.packageId}`);
      if (pasajeros.length > 0) metaParts.push(`${pasajeros.length} pasajero(s)`);

      return `
        <div class="flight-package${vIdx < vueloArray.length - 1 ? " flight-package--sep" : ""}">
          ${metaParts.length > 0 ? `<div class="flight-meta">${metaParts.join(" · ")}</div>` : ""}
          ${tramosHtml || '<div class="flight-meta">Itinerario no disponible</div>'}
          <div class="flight-summary">
            <span>Total vuelo</span>
            <strong>${totalFormateado}</strong>
          </div>
        </div>`;
    })
    .join("");

  return `
    <div class="flight-section">
      <h2>Vuelo incluido</h2>
      <div class="flight-box">
        ${itemsHtml}
      </div>
    </div>`;
}

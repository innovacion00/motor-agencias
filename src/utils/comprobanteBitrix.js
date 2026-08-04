import Cookies from "js-cookie";
import { refreshToken } from "../stores/authtoken";
import {
  cuentasBancarias,
  getHotelBitrixId,
} from "../components/GestionarReservas/CuentasBancarias";

const BITRIX_DEAL_URL =
  import.meta.env.PUBLIC_BITRIX_COMPROBANTE_DEAL_URL ??
  "https://gehsuites.bitrix24.com/rest/14/wb7mt7b8mf58q72d/crm.deal.add.json";

/** Valores fijos de los campos de lista de Bitrix. */
const TIPO_OPERACION_TRANSFERENCIA = 5328; // UF_CRM_1718394865311
const CANAL_VENTA_BOOKING_CONNECT = 13468; // UF_CRM_1718396737556

/** Tamaño máximo del comprobante antes de codificar a Base64. */
export const TAMANO_MAXIMO_COMPROBANTE = 10 * 1024 * 1024; // 10 MB

/**
 * Lee un File y devuelve su contenido en Base64 sin el prefijo `data:`.
 * Bitrix rechaza el prefijo y guarda el archivo corrupto si se envía.
 */
export function archivoABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = String(reader.result || "");
      const base64 = resultado.includes(",")
        ? resultado.slice(resultado.indexOf(",") + 1)
        : resultado;
      if (!base64) {
        reject(new Error("No se pudo leer el archivo"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Crea la negociación del comprobante en Bitrix24.
 * @returns {Promise<string>} ID de la negociación creada.
 */
export async function enviarComprobanteBitrix({
  reservas,
  grupoSeleccionado,
  monto,
  fechaConsignacion,
  archivo,
}) {
  const hotelBitrixId = getHotelBitrixId(reservas?.hotel);
  if (hotelBitrixId === null) {
    throw new Error(
      `El hotel "${reservas?.hotel}" no está configurado en Bitrix.`
    );
  }

  const grupo = cuentasBancarias[grupoSeleccionado];
  if (!grupo?.bitrixId) {
    throw new Error("La razón social seleccionada no está configurada.");
  }

  const base64 = await archivoABase64(archivo);
  const montoNumerico = Number(monto);
  const titular = `${reservas?.reservation?.firstName ?? ""} ${
    reservas?.reservation?.lastName ?? ""
  }`.trim();

  const body = {
    fields: {
      TITLE: titular || reservas?.reservaChatbotId || "Comprobante de pago",
      TYPE_ID: "SALE",
      STAGE_ID: "UC_D6ERFN",
      PROBABILITY: null,
      CURRENCY_ID: "COP",
      OPPORTUNITY: montoNumerico,
      CATEGORY_ID: "0",
      UF_CRM_1718636597: [hotelBitrixId], // Hoteles que reservó (múltiple)
      UF_CRM_1719335914: grupo.bitrixId, // Razón social
      UF_CRM_1718394865311: TIPO_OPERACION_TRANSFERENCIA, // Tipo de operación
      UF_CRM_1730321299: montoNumerico, // Monto
      UF_CRM_1718396297448: fechaConsignacion, // Fecha de consignación
      UF_CRM_1718396737556: CANAL_VENTA_BOOKING_CONNECT, // Canal de venta
      UF_CRM_1718739671: reservas?.reservation?.checkin ?? "", // Fecha de check-in
      UF_CRM_1755027828331: reservas?.reservaChatbotId ?? "", // Localizador
      UF_CRM_1718393278: [{ fileData: [archivo.name, base64] }], // Comprobante (múltiple)
    },
  };

  const response = await fetch(BITRIX_DEAL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* respuesta no JSON */
  }

  if (!response.ok || data.error) {
    const message =
      data.error_description || data.error || `Error Bitrix (${response.status})`;
    throw new Error(message);
  }

  if (!data.result) {
    throw new Error("Bitrix no devolvió el identificador de la negociación.");
  }

  return String(data.result);
}

const getApiBaseUrl = () =>
  (import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000")
    .trim()
    .replace(/\/+$/, "");

async function fetchWithToken(url, options = {}) {
  let token = Cookies.get("accessToken");
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });
    }
  }

  return response;
}

/**
 * Avisa a la API que ya se registró el comprobante en Bitrix para que deje la
 * reserva "En proceso", igual que hace generar un link de pago.
 */
export async function registrarComprobanteEnReserva({
  reservaId,
  bitrixDealId,
  monto,
  fechaConsignacion,
  razonSocial,
}) {
  const response = await fetchWithToken(
    `${getApiBaseUrl()}/agencias/v1/reservas/comprobante-enviado/${reservaId}`,
    {
      method: "POST",
      body: JSON.stringify({
        bitrixDealId,
        monto: Number(monto),
        fechaConsignacion,
        razonSocial,
      }),
    }
  );

  if (!response.ok) {
    let mensaje = "No se pudo actualizar el estado de la reserva.";
    try {
      const data = await response.json();
      mensaje = data.message || data.error || mensaje;
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(mensaje);
  }

  return response.json();
}

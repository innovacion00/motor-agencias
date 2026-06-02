import Cookies from "js-cookie";
import { refreshToken } from "../stores/authtoken";

export const ENCUESTA_SESSION_KEY = "mostrarEncuestaPostLogin";

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
        },
      });
    }
  }

  return response;
}

const BITRIX_DEAL_URL =
  import.meta.env.PUBLIC_BITRIX_ENCUESTA_DEAL_URL ??
  "https://gehsuites.bitrix24.com/rest/10/zutaj6s11aos5hm4/crm.deal.add.json";

export async function enviarEncuestaApi() {
  const url = `${getApiBaseUrl()}/agencias/v1/auth/encuesta`;
  return fetchWithToken(url, { method: "PATCH" });
}

/**
 * Registra la encuesta como negocio en Bitrix24 CRM.
 * @param {{ experiencia: number, capacitaciones: number, reservas: number, comentarios: string }} survey
 */
export async function enviarEncuestaBitrix(survey) {
  const datos = getDatosUsuario();
  const agenciaNombre = datos?.agencia?.fullName ?? "";
  const usuarioNombre = datos?.fullName ?? "";

  const body = {
    fields: {
      TITLE: "Encuesta de satisfacción de agencia " + agenciaNombre,
      TYPE_ID: "SALE",
      STAGE_ID: "C60:NEW",
      PROBABILITY: null,
      CATEGORY_ID: "60",
      UF_CRM_1780414640860: survey.experiencia,
      UF_CRM_1780415071413: survey.capacitaciones,
      UF_CRM_1780415102764: survey.reservas,
      UF_CRM_1780419336104: usuarioNombre,
      COMMENTS: survey.comentarios,
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
      data.error_description ||
      data.error ||
      `Error Bitrix (${response.status})`;
    throw new Error(message);
  }

  return data;
}
export function getDatosUsuario() {
  try {
    const raw = localStorage.getItem("datosUsuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Primera validación: solo usuarios con firstLog === true. */
export function cumpleFirstLog(datos = getDatosUsuario()) {
  return datos != null && datos.firstLog === true;
}

export function debeMostrarEncuesta() {
  const datos = getDatosUsuario();
  if (!cumpleFirstLog(datos)) return false;
  return datos.encuesta === false;
}

export function debeProgramarEncuestaPostLogin(datos) {
  if (!cumpleFirstLog(datos)) return false;
  return datos.encuesta === false;
}

export function programarEncuestaPostLogin() {
  sessionStorage.setItem(ENCUESTA_SESSION_KEY, "1");
}

export function consumirEncuestaPostLogin() {
  const pendiente = sessionStorage.getItem(ENCUESTA_SESSION_KEY) === "1";
  if (pendiente) {
    sessionStorage.removeItem(ENCUESTA_SESSION_KEY);
  }
  return pendiente;
}

export function marcarEncuestaCompletadaLocal() {
  const datos = getDatosUsuario();
  if (!datos) return;

  const updated = { ...datos, encuesta: true };
  localStorage.setItem("datosUsuario", JSON.stringify(updated));
  Cookies.set("datosUsuario", JSON.stringify(updated), { expires: 7, path: "/" });
}

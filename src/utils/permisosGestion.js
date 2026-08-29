import Cookies from "js-cookie";
import { refreshToken } from "../stores/authtoken";

const getApiBaseUrl = () =>
  (import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000")
    .trim()
    .replace(/\/+$/, "");

let cache = null;

/**
 * Permisos de gestión del usuario autenticado. Se calculan en el backend
 * (los correos autorizados viven en variables de entorno del servidor, no en
 * el bundle público). Reemplaza al antiguo PermisosExclusivos.js.
 */
async function fetchPermisosGestion() {
  const url = `${getApiBaseUrl()}/agencias/v1/auth/permisos-gestion`;
  const token = Cookies.get("accessToken");
  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
    }
  }

  if (!response.ok) {
    throw new Error("No se pudieron cargar los permisos del usuario");
  }

  const data = await response.json();
  return {
    puedeGestionarFechasPago: !!data.puedeGestionarFechasPago,
    puedeCambiarEstadoReserva: !!data.puedeCambiarEstadoReserva,
  };
}

export async function getPermisosGestion({ force = false } = {}) {
  if (!force && cache) return cache;
  cache = await fetchPermisosGestion();
  return cache;
}

export function clearPermisosGestionCache() {
  cache = null;
}
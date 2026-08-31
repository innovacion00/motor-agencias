import { atom } from "nanostores";

import Cookies from 'js-cookie';

export const tokenglobal = atom(null);

// --- Protección contra rotación encadenada (single-flight + lock entre pestañas) ---
// El backend rota el refresh token en cada uso (invalida el anterior y emite
// uno nuevo). Si dos peticiones de refresh ocurren "en paralelo" con el mismo
// refresh token, la primera rota el token y la segunda recibe 401 y mata la
// sesión, aunque el refresh tenga días de validez.
// Para evitarlo:
//   1) single-flight: dentro de la misma pestaña solo una rotación queda en
//      vuelo y las llamadas concurrentes reutilizan el mismo resultado.
//   2) lock compartido en localStorage: evita que DOS pestañas del mismo
//      navegador roten a la vez con el mismo token (las cookies son
//      compartidas entre pestañas). Al liberarse el lock, la pestaña que
//      esperaba relee el token ya rotado de la cookie.
let refreshPromise = null;

const LOCK_KEY = "tokenRefreshLock";
const LOCK_TTL = 15000; // expira solo si la pestaña dueña muere a mitad
const LOCK_POLL = 120; // ms entre intentos de adquirir el lock

// Adquiere el lock compartido entre pestañas. Devuelve una función release()
// o null si no se pudo adquirir a tiempo o si localStorage no está disponible.
const adquirirLock = async () => {
  const deadline = Date.now() + LOCK_TTL;
  while (Date.now() < deadline) {
    const ahora = Date.now();
    const miClave = `${ahora}-${Math.random().toString(36).slice(2)}`;
    let adquirido = false;
    try {
      const actual = localStorage.getItem(LOCK_KEY);
      if (!actual || ahora - Number(actual.split("-")[0]) > LOCK_TTL) {
        localStorage.setItem(LOCK_KEY, miClave);
        if (localStorage.getItem(LOCK_KEY) === miClave) adquirido = true;
      }
    } catch {
      // localStorage no disponible (SSR/privacy): no usar lock
      return () => {};
    }
    if (adquirido) {
      return () => {
        try {
          if (localStorage.getItem(LOCK_KEY) === miClave) {
            localStorage.removeItem(LOCK_KEY);
          }
        } catch {}
      };
    }
    await new Promise((r) => setTimeout(r, LOCK_POLL));
  }
  return null;
};

const aplicarTiempoCookie = (nombre, valor) =>
  Cookies.set(nombre, valor, { expires: 7, path: "/" });

const limpiarCookies = () => {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  Cookies.remove("datosUsuario", { path: "/" });
};

const irAlogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const validateToken = async () => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      irAlogin();
      return null;
    }

    const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/agencias/v1/auth/validate-access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ accessToken })
    });

    const data = await response.json();

    if (data.valid) {
      // Actualizar datos del usuario si es necesario
      if (data.user) {
        Cookies.set('datosUsuario', JSON.stringify(data.user));
      }
      return true;
    }

    // Manejar diferentes casos de token inválido
    switch (data.code) {
      case 'TOKEN_EXPIRED':
        // Intentar refresh token
        const newToken = await refreshToken();
        return !!newToken;
      
      case 'USER_INACTIVE':
      case 'AGENCY_INACTIVE':
      case 'USER_NOT_FOUND':
      case 'TOKEN_INVALID':
        // Casos donde debemos cerrar sesión
        limpiarCookies();
        irAlogin();
        return false;
        
      default:
        return false;
    }

  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const refreshToken = async () => {
  // Si ya hay una rotación en curso, la reutilizamos (single-flight).
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    // Adquirir el lock compartido para no chocar con otras pestañas.
    const release = await adquirirLock();
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      // Releer el refresh token de la cookie: otra pestaña pudo rotarlo
      // mientras esperábamos el lock.
      const refreshTokenValue = Cookies.get("refreshToken");
      if (!refreshTokenValue) {
        limpiarCookies();
        irAlogin();
        return null;
      }

      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/auth/refresh-token`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({ token: refreshTokenValue }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Actualizar cookies con los nuevos tokens (rotados por el backend)
        if (data.accessToken) aplicarTiempoCookie("accessToken", data.accessToken);
        if (data.refreshToken) aplicarTiempoCookie("refreshToken", data.refreshToken);
        if (data.accessToken) return data.accessToken;
        return null;
      }

      limpiarCookies();
      irAlogin();
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      limpiarCookies();
      irAlogin();
      return null;
    } finally {
      // Liberar el lock compartido y el de memoria para la próxima rotación.
      try {
        if (release) release();
      } catch {}
      setTimeout(() => { refreshPromise = null; }, 0);
    }
  })();

  return refreshPromise;
};

// Función auxiliar para verificar sesión
export const checkSession = async () => {
  const isValid = await validateToken();
  if (!isValid) {
    const newToken = await refreshToken();
    return !!newToken;
  }
  return true;
};


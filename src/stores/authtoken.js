import { atom } from "nanostores";

import Cookies from 'js-cookie';

export const tokenglobal = atom(null);

// --- Protección contra rotación encadenada (single-flight) ---
// El backend rota el refresh token en cada uso (invalida el anterior y emite
// uno nuevo). Si dos peticiones de refresh ocurren "en paralelo" con el mismo
// refresh token, la primera rota el token y la segunda recibe 401 y mata la
// sesión, aunque el refresh tenga días de validez.
// Para evitarlo, una sola rotación queda "en vuelo" a la vez: las llamadas
// concurrentes esperan el mismo resultado en lugar de rotar de nuevo.
let refreshPromise = null;

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
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

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
      // Liberar el lock para la próxima rotación.
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


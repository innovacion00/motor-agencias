import { atom } from "nanostores";

import Cookies from 'js-cookie';

export const tokenglobal = atom(null);

export const validateToken = async () => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      window.location.href = '/login';
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
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
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
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const refreshTokenValue = Cookies.get('refreshToken');
    if (!refreshTokenValue) {
      window.location.href = '/login';
      return null;
    }

    const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/agencias/v1/auth/refresh-token`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        token: (refreshTokenValue),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Actualizar cookies con los nuevos tokens
      Cookies.set('accessToken', data.accessToken, { expires: 7 });
      Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
      console.log(data);
      return data.accessToken;
    } else if (response.status === 401) {
      // Si el refreshToken también está vencido, redirigir al login
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    window.location.href = '/login';
    return null;
  }
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


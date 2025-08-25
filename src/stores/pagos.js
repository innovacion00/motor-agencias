import Cookies from "js-cookie";
import { atom } from "nanostores";
import { refreshToken } from "./authtoken";

export const linkPago = atom({});

const fetchWithToken = async (url, options = {}) => {
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
};

export const generarLinkPago = async (id, booleano) => {
  try {
    const response = await fetchWithToken(
      `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/generate-link`,
      {
        method: "POST",
        body: JSON.stringify({
          reservaId: id,
          pagoTotal: booleano,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      linkPago.set(data.linkInfo);
      return data.linkInfo;
    } else {
      throw new Error("Error al generar link");
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    return null;
  }
};

export const generarLinkPagoBilletera = async (id, booleano) => {
  try {
    const response = await fetchWithToken(
      `${
        import.meta.env.PUBLIC_API_URL
      }/agencias/v1/reservas/pago-billetera-compuesto`,
      {
        method: "POST",
        body: JSON.stringify({
          reservaId: id,
          pagoTotal: booleano,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      linkPago.set(data.linkInfo);
      return data.linkInfo;
    } else {
      throw new Error("Error al generar link");
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    return null;
  }
};

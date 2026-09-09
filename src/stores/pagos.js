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
  let response;
  try {
    response = await fetchWithToken(
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
  } catch (error) {
    console.error("Error en la petición:", error);
    return {
      ok: false,
      message:
        "No se pudo conectar con el servidor, verifique su conexión e intente nuevamente.",
    };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const rawMsg =
      (data && (data.msg || data.message)) ||
      "No se pudo realizar el pago con Mi saldo, verifique su saldo o intente nuevamente más tarde.";

    // Autocore devuelve "Error http: 404" cuando el saldo no alcanza para el
    // pago; se reemplaza por un mensaje general enfocado en la billetera.
    const esErrorTecnico = /http\s*:|404/.test(rawMsg) || !rawMsg.trim();
    const msg = esErrorTecnico
      ? "No se pudo realizar el pago, verifique el saldo de su billetera e intente nuevamente."
      : rawMsg;

    console.error("Error en el pago con billetera:", msg);
    return { ok: false, message: msg };
  }

  linkPago.set(data);
  return {
    ok: true,
    data: data || {},
    message:
      (data && (data.msg || data.message)) || "Pago procesado correctamente",
  };
};

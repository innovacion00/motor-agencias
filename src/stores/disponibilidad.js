import { atom } from "nanostores";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { refreshToken } from "./authtoken";
const token = Cookies.get("accessToken");
// Crear una store para almacenar la disponibilidad
export const disponibilidad = atom([]);
export const reservasNano = atom([]);

// Store para almacenar las noches
export const nightsStore = atom(0);
const URL = import.meta.env.PUBLIC_API_URL;
export const getdisponibility = async (objetohotel) => {
  const objetoprueba = JSON.stringify({
    checkingDate: objetohotel.checkin,
    ciudad: objetohotel.city,
    nights: objetohotel.nights,
    layout: objetohotel.layout,
  });

  const fetchDisponibilidad = async (accessToken) => {
    const url = `${URL}/agencias/v1/reservas/disponibilidad`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: objetoprueba,
    });
    return response;
  };

  try {
    let response = await fetchDisponibilidad(token);

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await fetchDisponibilidad(newToken);
      }
    }

    if (response.ok) {
      const data = await response.json();
      disponibilidad.set(data);
      localStorage.setItem("data", JSON.stringify(data));
      console.log("Disponibilidad obtenida:", disponibilidad.get());
    } else {
      throw new Error("Error al consultar la API");
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error en la búsqueda",
      text: "No se pudo obtener la disponibilidad. Por favor, intenta nuevamente más tarde.",
    });
    console.error("Error al obtener disponibilidad:", error);
  }
};

export const getReservas = async ( datosUsuario) => {
  const rol = () => {
    if (datosUsuario.includes("super-admin")) {
      return `${URL}/agencias/v1/reservas`;
    } else if (datosUsuario.includes("admin")) {
      return `${URL}/agencias/v1/reservas/reservas-by-agencia`;
    } else {
      return `${URL}/agencias/v1/reservas/reservas-by-user`;
    }
  };

  const urlrol = rol();
  const fetchReservas = async (accessToken) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(urlrol, {
      method: "GET",
      headers: myHeaders,
    });
    return response;
  };

  try {
    console.log(token);
    let response = await fetchReservas((token));

    if (response.status === 401) {
      // Intentar renovar el token
      const newToken = await refreshToken();
      if (newToken) {
        // Reintentar la petición con el nuevo token
        response = await fetchReservas(newToken);
      }
      // Si newToken es null, refreshToken ya se encargó de la redirección
    }

    if (response.ok) {
      const data = await response.json();
      if (data.reservas) {
        reservasNano.set(data.reservas);
      } else {
        reservasNano.set(data);
      }
      return data;
    } else {
      console.log("Error al obtener los datos de la reserva");
      return null;
    }
  } catch (error) {
    console.log("Error en la peticion obtener reservas:", error);
    return null;
  }
};

export const getReservasServer = async (token, role) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  
  const getUrl = (role) => {
    if (role.includes("super-admin")) {
      return `${URL}/agencias/v1/reservas`;
    } else if (role.includes("admin")) {
      return `${URL}/agencias/v1/reservas/reservas-by-agencia`;
    }
    return `${URL}/agencias/v1/reservas/reservas-by-user`;
  };

  try {
    const response = await fetch(getUrl(role), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.reservas || data;
  } catch (error) {
    console.error("Error servidor:", error);
    return null;
  }
};

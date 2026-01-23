import { atom } from "nanostores";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { refreshToken } from "./authtoken";
const token = Cookies.get("accessToken");
// Crear una store para almacenar la disponibilidad
export const disponibilidad = atom([]);
export const reservasNano = atom([]);
export const reservasMeta = atom({
  total: 0,
  page: 1,
  pageSize: 25,
  totalPages: 1,
});

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
      text: "No se pudo obtener la disponibilidad. Por favor, intenta nuevamente más tarde o comunicate con reservas.",
    });
    console.error("Error al obtener disponibilidad:", error);
    // Propagar el error para que el componente llamante pueda manejar el flujo (e.g., evitar navegación)
    throw error;
  }
};

export const getReservas = async (rolUsuario, page = 1, pageSize = 15) => {
  const buildUrl = () => {
    if (rolUsuario?.includes("super-admin")) {
      return `${URL}/agencias/v1/reservas`;
    }
    if (rolUsuario?.includes("admin")) {
      return `${URL}/agencias/v1/reservas/reservas-by-agencia`;
    }
      return `${URL}/agencias/v1/reservas/reservas-by-user`;
  };

  const urlBase = buildUrl();
  const separator = urlBase.includes("?") ? "&" : "?";
  const urlWithPagination = `${urlBase}${separator}page=${page}&pageSize=${pageSize}`;

  const fetchReservas = async (accessToken) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(urlWithPagination, {
      method: "GET",
      headers: myHeaders,
    });
    return response;
  };

  try {
    let response = await fetchReservas(token);

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await fetchReservas(newToken);
      }
    }

    if (response.ok) {
      const data = await response.json();
      
      const reservasData =
        data?.data ?? data?.reservas ?? (Array.isArray(data) ? data : []);
      
      // Si el servidor envía meta, usarla pero recalcular totalPages basándose en el total
      let metaData;
      if (data?.meta) {
        metaData = {
          ...data.meta,
          // Recalcular totalPages basándose en el total que viene del servidor
          // Esto corrige casos donde el backend calcula mal totalPages
          totalPages: Math.max(1, Math.ceil((data.meta.total || 0) / (data.meta.pageSize || pageSize)))
        };
      } else {
        // Fallback si no viene meta del servidor
        const total = Array.isArray(reservasData) ? reservasData.length : 0;
        metaData = {
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
      }

      reservasNano.set(Array.isArray(reservasData) ? reservasData : []);
      reservasMeta.set(metaData);

      return { data: reservasNano.get(), meta: metaData };
    }

      console.log("Error al obtener los datos de la reserva");
    return { data: [], meta: null };
  } catch (error) {
    console.log("Error en la peticion obtener reservas:", error);
    return { data: [], meta: null };
  }
};

export const getReservasServer = async (token, role, page = 1, pageSize = 25) => {
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
    const urlBase = getUrl(role);
    const separator = urlBase.includes("?") ? "&" : "?";
    const urlWithPagination = `${urlBase}${separator}page=${page}&pageSize=${pageSize}`;
    
    const response = await fetch(urlWithPagination, {
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
    // Manejar la nueva estructura paginada: {data: [...], meta: {...}}
    const reservasData = data?.data ?? data?.reservas ?? (Array.isArray(data) ? data : []);
    const metaData = data?.meta ?? null;
    
    return {
      data: Array.isArray(reservasData) ? reservasData : [],
      meta: metaData
    };
  } catch (error) {
    console.error("Error servidor:", error);
    return null;
  }
};

// Función auxiliar para buscar una reserva específica usando el endpoint de búsqueda por código
// Esto es mucho más eficiente que iterar por todas las páginas
export const getReservaByIdServer = async (token, role, reservaChatbotId) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const url = `${URL}/agencias/v1/reservas/buscar/chatbot-id?reservaChatbotId=${encodeURIComponent(reservaChatbotId)}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      // Si el endpoint de búsqueda falla, intentar búsqueda por páginas como fallback
      // pero limitando a las primeras 10 páginas para evitar sobrecarga
      console.log("Búsqueda por código falló, intentando búsqueda por páginas (limitada)...");
      return await getReservaByIdServerFallback(token, role, reservaChatbotId);
    }

    const responseData = await response.json();
    
    // Extraer la reserva de la respuesta
    let reserva = null;
    if (responseData?.data) {
      if (Array.isArray(responseData.data)) {
        reserva = responseData.data.find((r) => r.reservaChatbotId == reservaChatbotId) || responseData.data[0];
      } else {
        reserva = responseData.data;
      }
    } else if (responseData) {
      reserva = responseData;
    }
    
    return reserva;
  } catch (error) {
    console.error("Error al buscar reserva por código:", error);
    // Fallback a búsqueda por páginas limitada
    return await getReservaByIdServerFallback(token, role, reservaChatbotId);
  }
};

// Función de fallback que busca en las primeras páginas (limitada para evitar sobrecarga)
const getReservaByIdServerFallback = async (token, role, reservaChatbotId) => {
  const MAX_PAGES_TO_SEARCH = 10; // Limitar a las primeras 10 páginas
  const pageSize = 25;
  
  for (let page = 1; page <= MAX_PAGES_TO_SEARCH; page++) {
    const result = await getReservasServer(token, role, page, pageSize);
    
    if (!result || !result.data || result.data.length === 0) {
      break;
    }
    
    // Buscar la reserva en la página actual
    const reserva = result.data.find((dato) => dato.reservaChatbotId == reservaChatbotId);
    if (reserva) {
      return reserva;
    }
  }
  
  return null;
};

// Función auxiliar para procesar la respuesta de búsqueda y extraer datos
const extraerDatosDeRespuesta = (responseData) => {
  let reservasData = [];
  
  if (responseData?.data) {
    // Si data existe, verificar si es un array o un objeto único
    if (Array.isArray(responseData.data)) {
      reservasData = responseData.data;
    } else {
      // Si es un objeto único, convertirlo a array
      reservasData = [responseData.data];
    }
  } else if (Array.isArray(responseData)) {
    reservasData = responseData;
  } else if (responseData) {
    // Si responseData es un objeto directo, convertirlo a array
    reservasData = [responseData];
  }
  
  return reservasData;
};

// Función genérica para buscar UNA página específica (lazy loading)
const buscarUnaPagina = async (urlBase, accessToken, refreshTokenFn, pageNum = 1, pageSize = 15) => {
  const fetchBusqueda = async (accessToken, pageNum) => {
    const separator = urlBase.includes("?") ? "&" : "?";
    const url = `${urlBase}${separator}page=${pageNum}&pageSize=${pageSize}`;
    
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(url, {
      method: "GET",
      headers: myHeaders,
    });
    return response;
  };

  try {
    let response = await fetchBusqueda(accessToken, pageNum);

    if (response.status === 401) {
      const newToken = await refreshTokenFn();
      if (newToken) {
        accessToken = newToken;
        response = await fetchBusqueda(accessToken, pageNum);
      }
    }

    if (!response.ok) {
      console.log("Error en la búsqueda");
      return { data: [], meta: null, page: pageNum };
    }

    const responseData = await response.json();
    const pageData = extraerDatosDeRespuesta(responseData);
    
    // Obtener metadata
    let metaData = null;
    if (responseData?.meta) {
      const total = responseData.meta.total || 0;
      const pageSizeFromServer = responseData.meta.pageSize || pageSize;
      const totalPages = Math.max(1, Math.ceil(total / pageSizeFromServer));
      
      metaData = {
        total: total,
        page: pageNum,
        pageSize: pageSizeFromServer,
        totalPages: totalPages,
      };
    } else {
      metaData = {
        total: pageData.length,
        page: pageNum,
        pageSize: pageSize,
        totalPages: 1,
      };
    }

    // Actualizar stores con la página actual
    reservasNano.set(pageData);
    reservasMeta.set(metaData);
    
    return { 
      data: pageData, 
      meta: metaData,
      page: pageNum 
    };
  } catch (error) {
    console.log("Error en la búsqueda:", error);
    return { data: [], meta: null, page: pageNum };
  }
};

// Función para buscar reservas por código de reserva (chatbot-id) - Lazy loading
export const buscarReservaPorCodigo = async (reservaChatbotId, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const urlBase = `${URL}/agencias/v1/reservas/buscar/chatbot-id?reservaChatbotId=${encodeURIComponent(reservaChatbotId)}`;
  
  return await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
};

// Función para buscar reservas por nombre de huésped - Lazy loading
export const buscarReservaPorHuesped = async (nombre, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const urlBase = `${URL}/agencias/v1/reservas/buscar/huesped?nombre=${encodeURIComponent(nombre)}`;
  
  return await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
};

// Función para buscar reservas por nombre de agente - Lazy loading
export const buscarReservaPorAgente = async (nombre, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const urlBase = `${URL}/agencias/v1/reservas/buscar/agente?nombre=${encodeURIComponent(nombre)}`;
  
  return await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
};

// Función para buscar reservas por hotel - Lazy loading
export const buscarReservaPorHotel = async (hotel, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const urlBase = `${URL}/agencias/v1/reservas?hotel=${encodeURIComponent(hotel)}`;
  
  return await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
};

// Función para buscar reservas por nombre de agencia - Lazy loading
export const buscarReservaPorAgencia = async (nombreAgencia, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const urlBase = `${URL}/agencias/v1/reservas?nombreAgencia=${encodeURIComponent(nombreAgencia)}`;
  
  return await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
};

// Función para buscar reservas por fecha desde - Lazy loading
export const buscarReservaPorFecha = async (fechaDesde, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  
  // Formatear la fecha como YYYY-MM-DD usando la zona horaria local
  // Esto evita problemas con toISOString() que puede cambiar la fecha por la zona horaria
  let fechaFormateada;
  if (fechaDesde instanceof Date) {
    const year = fechaDesde.getFullYear();
    const month = String(fechaDesde.getMonth() + 1).padStart(2, '0');
    const day = String(fechaDesde.getDate()).padStart(2, '0');
    fechaFormateada = `${year}-${month}-${day}`;
  } else {
    fechaFormateada = fechaDesde;
  }
  
  const urlBase = `${URL}/agencias/v1/reservas?fechaDesde=${encodeURIComponent(fechaFormateada)}`;
  
  console.log('🔍 Búsqueda por fecha - URL:', urlBase);
  console.log('📅 Fecha formateada:', fechaFormateada);
  
  const result = await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
  
  console.log('📦 Respuesta del endpoint (búsqueda por fecha):', {
    url: urlBase,
    fechaBuscada: fechaFormateada,
    pagina: page,
    totalResultados: result?.meta?.total || 0,
    resultadosEnPagina: Array.isArray(result?.data) ? result.data.length : (result?.data ? 1 : 0),
    data: result?.data,
    meta: result?.meta
  });
  
  return result;
};

// Función para buscar reservas por estado de pago - Lazy loading
export const buscarReservaPorEstado = async (status, page = 1) => {
  const URL = import.meta.env.PUBLIC_API_URL;
  const urlBase = `${URL}/agencias/v1/reservas/buscar/estado?status=${encodeURIComponent(status)}`;
  
  return await buscarUnaPagina(urlBase, token, refreshToken, page, 15);
};
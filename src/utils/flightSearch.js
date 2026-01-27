import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { refreshToken } from '../stores/authtoken';

/**
 * Realiza la consulta de disponibilidad de vuelos
 * @returns {Promise<boolean>} - true si la consulta fue exitosa, false si falló
 */
export const searchFlights = async () => {
  let loadingSwal = null;
  
  try {
    // Obtener datos del localStorage
    const datosDelVuelo = JSON.parse(localStorage.getItem('datosDelVuelo'));
    const cantAdultos = parseInt(localStorage.getItem('cantAdultos')) || 1;
    const cantNinos = parseInt(localStorage.getItem('cantNinos')) || 0;
    const selectedCurrency = (localStorage.getItem('selectedCurrency') || 'COP').toUpperCase();

    // Validar que existan los datos necesarios
    if (!datosDelVuelo) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontraron los datos del vuelo. Por favor, complete la búsqueda de vuelos primero.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#26547B'
      });
      return false;
    }

    if (!datosDelVuelo.originIata || !datosDelVuelo.destinationIata) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Faltan datos de origen o destino del vuelo.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#26547B',
        showClass: {
          popup: "animate__animated animate__fadeInDown animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp animate__faster",
        },
      });
      return false;
    }

    if (!datosDelVuelo.dateRange || !datosDelVuelo.dateRange.startDate || !datosDelVuelo.dateRange.endDate) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Faltan las fechas del vuelo.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#26547B',
        showClass: {
          popup: "animate__animated animate__fadeInDown animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp animate__faster",
        },
      });
      return false;
    }

    // Mostrar indicador de carga
    loadingSwal = Swal.fire({
      title: 'Buscando vuelos...',
      text: 'Por favor espere mientras consultamos la disponibilidad de vuelos',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Formatear fechas a AAAA-MM-DD
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    // Nuevo body según el formato requerido
    const requestBody = {
      origin: datosDelVuelo.originIata,
      destination: datosDelVuelo.destinationIata,
      departureDate: formatDate(datosDelVuelo.dateRange.startDate),
      returnDate: formatDate(datosDelVuelo.dateRange.endDate),
      adults: cantAdultos,
      canarian_resident: false,
      balear_resident: false,
      ceuta_melilla_resident: false,
      search_mode: "SEARCH_BEST_DEAL",
      currency: selectedCurrency === "USD" ? "USD" : "COP"
    };

    console.log('Consultando vuelos con:', requestBody);

    // Realizar la consulta usando variable de entorno como base URL
    const baseUrl = import.meta.env.PUBLIC_API_URL;
    
    // Función para realizar la petición con token
    const fetchWithToken = async (token) => {
      return await fetch(`${baseUrl}/agencias/v1/vuelos/maarlab/disponibilidad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
    };

    let token = Cookies.get('accessToken');
    let response = await fetchWithToken(token);

    // Si el token expiró, intentar refrescarlo
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await fetchWithToken(newToken);
      } else {
        throw new Error('No se pudo autenticar. Por favor, inicia sesión nuevamente.');
      }
    }

    if (!response.ok) {
      throw new Error(`Error en la consulta: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cerrar el indicador de carga
    if (loadingSwal) {
      await Swal.close();
    }
    
    // Guardar la respuesta en localStorage
    localStorage.setItem('dataVuelo', JSON.stringify(data));
    
    console.log('Respuesta de vuelos guardada:', data);
    
    await Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Redirigiendo a los vuelos disponibles...',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      timerProgressBarColor: "#26547B",
      showClass: {
        popup: "animate__animated animate__fadeInDown animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp animate__faster",
      },
    });

    return true;

  } catch (error) {
    console.error('Error en la consulta de vuelos:', error);
    
    // Cerrar el indicador de carga si está abierto
    if (loadingSwal) {
      await Swal.close();
    }
    
    await Swal.fire({
      icon: 'error',
      title: 'Error en la consulta',
      text: `No se pudo realizar la consulta de vuelos: ${error.message}`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: "#26547B",
      showClass: {
        popup: "animate__animated animate__fadeInDown animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp animate__faster",
      },

    });
    
    return false;
  }
};


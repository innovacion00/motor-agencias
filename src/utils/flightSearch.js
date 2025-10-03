import Swal from 'sweetalert2';

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

    // Crear el array de viajeros
    const travelers = [];
    for (let i = 1; i <= cantAdultos; i++) {
      travelers.push({
        id: i.toString(),
        travelerType: "ADULT"
      });
    }

    // Agregar niños si existen en localStorage
    if (cantNinos > 0) {
      const startIdForChildren = travelers.length + 1;
      for (let j = 0; j < cantNinos; j++) {
        travelers.push({
          id: (startIdForChildren + j).toString(),
          travelerType: "CHILD"
        });
      }
    }

    // Body de la consulta (Con validacion)
    const requestBodyvalid ={
      currencyCode: selectedCurrency === "USD" ? "USD" : "COP",
      originDestinations: [
        {
          id:"1",
          originLocationCode: datosDelVuelo.originIata,
          destinationLocationCode:datosDelVuelo.destinationIata,
          departureDate: formatDate(datosDelVuelo.dateRange.startDate)
        },
        {
          id:"2",
          originLocationCode: datosDelVuelo.destinationIata,
          destinationLocationCode:datosDelVuelo.originIata,
          departureDate:formatDate(datosDelVuelo.dateRange.endDate)
        }
      ],
      travelers: travelers,
      sources:["GDS"],
      searchCriteria:{
        maxFlightOffers:60,
        flightFilters:{
          maxNumberOfConnections:2
        }
        }
      };

    // Body de la consulta (Sin validacion)
    const requestBody = {
      currencyCode: selectedCurrency === "USD" ? "USD" : "COP",
      originDestinations: [
        {
          id: "1",
          originLocationCode:datosDelVuelo.originIata,
          destinationLocationCode: datosDelVuelo.destinationIata,
          departureDateTimeRange: {
            date: formatDate(datosDelVuelo.dateRange.startDate)
          }
        },
        {
          id: "2",
          originLocationCode: datosDelVuelo.originIata,
          destinationLocationCode: datosDelVuelo.destinationIata,
          departureDateTimeRange: {
            date: formatDate(datosDelVuelo.dateRange.endDate)
          }
        }
      ],
      travelers: travelers,
      sources: ["GDS"],
      searchCriteria: {
        maxFlightOffers: 60,
        flightFilters: {
          maxNumberOfConnections: 2
        }
      }
    };

    console.log('Consultando vuelos con:', requestBody);

    // Realizar la consulta usando variable de entorno como base URL
    const baseUrl = import.meta.env.PUBLIC_API_URL;
    const response = await fetch(`${baseUrl}/agencias/v1/vuelos/disponibilidad`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBodyvalid)
    });

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


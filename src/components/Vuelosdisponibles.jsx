import React, { useState, useEffect } from "react";
import styles from "../../public/styles/VuelosDisponibles.module.css";
import DropdownSearch from "./DropdownSearch";
import IATA_CITY_NAMES from "../utils/iataCityNames";


const VuelosDisponibles = () => {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dictionaries, setDictionaries] = useState(null);
  const [originalFlightOffers, setOriginalFlightOffers] = useState([]);
  const ITEMS_PER_PAGE = 6;
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [hotelReservationData, setHotelReservationData] = useState(null);
  
  // Mapeo de IDs de hotel a nombres
  const hotelNames = {
    9: "Hotel Marina Suites",
    5: "Hotel Abi Inn", 
    6: "Hotel Avexi Suites",
    1: "Hotel Azuan Suites",
    4: "Hotel Aixo Suites",
    56: "Hotel Boquilla Suites",
    7: "Hotel Bocagrande Suites",
    3: "Hotel Madisson Inn Luxury Suites",
    10: "Hotel Windsor House",
    48: "Hotel Axis Inn",
    44: "Hotel Rodadero Inn",
    8: "Hotel Sansiraka"
  };

  // Función para formatear duración ISO 8601 a formato legible
  const formatDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return "0h 0m";
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const timeString = date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return timeString;
  };

  // Función para formatear fecha completa
  const formatDate = (dateTimeString) => {
    // Manejar tanto formato ISO como formato "YYYY-MM-DD HH:mm:ss"
    let date;
    if (typeof dateTimeString === 'string' && dateTimeString.includes(' ')) {
      // Formato "YYYY-MM-DD HH:mm:ss"
      const [datePart] = dateTimeString.split(' ');
      date = new Date(datePart + 'T00:00:00');
    } else {
      date = new Date(dateTimeString);
    }
    
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName} ${day} ${month} ${year}`;
  };

  // Función para formatear precio según divisa seleccionada
  const formatPrice = (price) => {
    const selectedCurrency = (typeof window !== 'undefined' && localStorage.getItem('selectedCurrency')) || 'COP';
    const currency = selectedCurrency === 'USD' ? 'USD' : 'COP';
    const locale = currency === 'USD' ? 'en-US' : 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  // Función para obtener el nombre de la aerolínea
  const getAirlineName = (carrierCode, dictionaries) => {
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  };

  // Función para obtener el logo de la aerolínea
  const getAirlineLogo = (carrierCode) => {
    const airlineLogos = {
      'AV': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/AV.png?crop=false&width=108&height=92&fallback=default2.png&_v=9da891fb64018166c1a5228d9c46e5ef',
      'LA': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/LA.png?crop=false&width=108&height=92&fallback=default1.png&_v=e2abb15ddcd9bf090836299b76d255e0',
      'CM': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/CM.png?crop=false&width=108&height=92&fallback=default1.png&_v=a61544cffd06cf2178b9a97659b98650',
      'UA': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/UA.png?crop=false&width=108&height=92&fallback=default1.png&_v=5549857010860b629834720579d831e5',
      'B6':'https://s202.q4cdn.com/521076508/files/doc_downloads/logos/JetBlue-Logo_Blue.png',
      'NH':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVvcvOq8qQLYp_o4IDIPXVVdHkLpgZLha6Fg&s',
      'EK':'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png',
      'IB':'https://www.latamairlines.com/content/dam/latamxp/sites/alianzas/aerolineas-images_0011_iberia-Airlines.png',
      'UX':'https://logodownload.org/wp-content/uploads/2019/10/air-europa-logo-0.png',
      'JA':'https://dgital.com/images/blogs/2020-11-22_js-behind-the-scene/main.png',
      'VB':'https://upload.wikimedia.org/wikipedia/commons/b/bf/Nuevo_vivaaerobus_logotipo_original.jpg',
      // Agregar más aerolíneas aquí en el futuro
      // 'XX': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/XX.png?crop=false&width=108&height=92&fallback=default1.png&_v=...',
    };
    
    return airlineLogos[carrierCode] || `https://via.placeholder.com/40x40/0066CC/FFFFFF?text=${carrierCode}`;
  };

  // Función para obtener el nombre de la ciudad
  const getCityName = (iataCode, dictionaries) => {
    const code = (iataCode || "").toUpperCase();
    // 1) Primero intenta con el diccionario local editable
    if (IATA_CITY_NAMES[code]) return IATA_CITY_NAMES[code];
    // 2) Fallback con dictionaries: muestra al menos el cityCode si existe
    const location = dictionaries?.locations?.[code];
    if (location?.cityCode) return location.cityCode;
    // 3) Último recurso: retorna el mismo IATA
    return code;
  };

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const loadFlightData = () => {
      try {
        const dataVuelo = JSON.parse(localStorage.getItem('dataVuelo'));
        const datosDelVuelo = JSON.parse(localStorage.getItem('datosDelVuelo'));
        const datosReserva = JSON.parse(localStorage.getItem('datosreserva'));
        
        // Verificar si la respuesta tiene la nueva estructura
        const hasNewStructure = dataVuelo && (dataVuelo.recommendedFlights || dataVuelo.flights);
        
        // Guardar datos de reserva del hotel en estado para usos futuros (opcional)
        const hotelReservation = (datosReserva && datosReserva.length > 0) ? datosReserva[0] : null;
        if (hotelReservation) {
          setHotelReservationData(hotelReservation);
        }

        // Obtener información del hotel
        const hotelInfo = hotelReservation ? {
          name: hotelNames[hotelReservation.hotelidAutocore] || `Hotel ID: ${hotelReservation.hotelidAutocore}`,
          dates: `${hotelReservation.checkin} -> ${hotelReservation.checkout}`,
          room: {
            type: hotelReservation.NombreH,
            meal: hotelReservation.plandealimentacion,
            dates: `${hotelReservation.checkin} - ${hotelReservation.checkout}`,
            nights: `${hotelReservation.nights} noches, ${hotelReservation.huespedes} huéspedes`,
            pets: typeof hotelReservation.mascotas === 'number' ? hotelReservation.mascotas : parseInt(hotelReservation.mascotas || 0, 10),
            transferIncluded: !!hotelReservation.incluirTraslado,
            transferText: hotelReservation.incluirTraslado
              ? (hotelReservation.tipoTraslado === 'aeropuerto_hotel'
                  ? 'Aeropuerto al hotel'
                  : hotelReservation.tipoTraslado === 'hotel_aeropuerto'
                    ? 'Hotel al aeropuerto'
                    : hotelReservation.tipoTraslado === 'ambos'
                      ? 'Aeropuerto al hotel y Hotel al aeropuerto'
                      : 'Incluido')
              : 'No incluido'
          },
          price: formatPrice(hotelReservation.precio),
          includesTaxes: true
        } : {
          name: "Hotel Seleccionado",
          dates: datosDelVuelo?.dateRange ? 
            `${formatDate(datosDelVuelo.dateRange.startDate)} -> ${formatDate(datosDelVuelo.dateRange.endDate)}` : 
            "Fechas no disponibles",
          room: {
            type: "Habitación seleccionada",
            meal: "Plan seleccionado",
            payment: "Pago: Inmediato",
            dates: datosDelVuelo?.dateRange ? 
              `${formatDate(datosDelVuelo.dateRange.startDate)} - ${formatDate(datosDelVuelo.dateRange.endDate)}` : 
              "Fechas no disponibles",
            nights: datosDelVuelo?.dateRange ? 
              `${Math.ceil((new Date(datosDelVuelo.dateRange.endDate) - new Date(datosDelVuelo.dateRange.startDate)) / (1000 * 60 * 60 * 24))} noches` : 
              "Noches no disponibles",
            pets: 0,
            transferIncluded: false,
            transferText: 'No incluido'
          },
          price: "$0",
          includesTaxes: true
        };

        if (hasNewStructure) {
          // Combinar recommendedFlights y flights
          const allFlights = [
            ...(dataVuelo.recommendedFlights || []),
            ...(dataVuelo.flights || [])
          ];
          
          if (allFlights.length > 0) {
            // Guardar las ofertas originales para futuras referencias
            setOriginalFlightOffers(allFlights);

            // Procesar las ofertas de vuelo con la nueva estructura
            const processedFlights = allFlights.map((offer, index) => {
              const outbound = offer.outbound;
              const returnFlight = offer.inbound; // Nota: en la nueva estructura es "inbound" no "return"
              
              // Seleccionar precio en divisa acorde a la búsqueda
              const selectedCurrency = (typeof window !== 'undefined' && localStorage.getItem('selectedCurrency')) || 'COP';
              const totalPrice = parseFloat(offer.totalPrice || 0);
              const passengers = offer.pricePerPassenger?.length || dataVuelo.Passengers?.NumberOfAdults || 1;
              const pricePerPerson = totalPrice / passengers;

               // Función para procesar segmentos con la nueva estructura
               const processSegments = (flightData) => {
                 const segments = flightData.segments || [];
                 
                 // Procesar cada segmento para incluir el nombre de la aerolínea
                 const processedSegments = segments.map(seg => ({
                   ...seg,
                   airlineName: seg.airlineName || seg.airlineCode,
                   carrierCode: seg.airlineCode
                 }));
                 
                 if (segments.length === 1) {
                   // Vuelo directo
                   const segment = segments[0];
                   return {
                     date: formatDate(`${segment.departureDate} ${segment.departureTime}`),
                     airline: segment.airlineName || segment.airlineCode,
                     logo: getAirlineLogo(segment.airlineCode),
                     origin: segment.departureCode,
                     originCity: segment.departureCityName || segment.departureCode,
                     destination: segment.arrivalCode,
                     destinationCity: segment.arrivalCityName || segment.arrivalCode,
                     departure: segment.departureTime,
                     arrival: segment.arrivalTime,
                     duration: formatDuration(segment.duration),
                     type: flightData.connections === 0 ? "Directo" : `${flightData.connections} escala${flightData.connections > 1 ? 's' : ''}`,
                     baggage: {
                       carryOn: offer.cabin_luggage_include || false,
                       checked: offer.luggage_include || false,
                       underseat: offer.underseat_luggage_include || false
                     },
                     segments: processedSegments,
                     carrierCode: segment.airlineCode,
                     airlineName: segment.airlineName || segment.airlineCode,
                     numberOfStops: flightData.connections || 0
                   };
                 } else {
                   // Vuelo con escalas
                   const firstSegment = segments[0];
                   const lastSegment = segments[segments.length - 1];
                   
                   return {
                     date: formatDate(`${firstSegment.departureDate} ${firstSegment.departureTime}`),
                     airline: firstSegment.airlineName || firstSegment.airlineCode,
                     logo: getAirlineLogo(firstSegment.airlineCode),
                     origin: firstSegment.departureCode,
                     originCity: firstSegment.departureCityName || firstSegment.departureCode,
                     destination: lastSegment.arrivalCode,
                     destinationCity: lastSegment.arrivalCityName || lastSegment.arrivalCode,
                     departure: firstSegment.departureTime,
                     arrival: lastSegment.arrivalTime,
                     duration: formatDuration(flightData.duration),
                     type: `${flightData.connections} escala${flightData.connections > 1 ? 's' : ''}`,
                     baggage: {
                       carryOn: offer.cabin_luggage_include || false,
                       checked: offer.luggage_include || false,
                       underseat: offer.underseat_luggage_include || false
                     },
                     segments: processedSegments,
                     carrierCode: firstSegment.airlineCode,
                     airlineName: firstSegment.airlineName || firstSegment.airlineCode,
                     numberOfStops: flightData.connections || 0
                   };
                 }
               };

              return {
                id: index + 1,
                flightId: offer.flightId,
                outbound: processSegments(outbound),
                return: processSegments(returnFlight),
                pricing: {
                  perPerson: formatPrice(pricePerPerson),
                  total: formatPrice(totalPrice),
                  passengers: passengers,
                  includesTaxes: true,
                  currency: offer.CurrencyCode || selectedCurrency
                },
                bestDeal: offer.bestDeal || false
              };
            });

            setFlightData({
              hotel: hotelInfo,
              flights: processedFlights
            });
          } else {
            // Si no hay vuelos en la nueva estructura
            setFlightData({
              hotel: hotelInfo,
              flights: []
            });
          }
        } else if (dataVuelo && dataVuelo.data && dataVuelo.data.length > 0) {
          // Mantener compatibilidad con estructura antigua si existe
          const flightOffers = dataVuelo.data;
          const dictionariesData = dataVuelo.dictionaries;
          
          // Guardar dictionaries en el estado para usar en el renderizado
          setDictionaries(dictionariesData);
          // Mantener una copia de las ofertas originales para futuras referencias
          setOriginalFlightOffers(flightOffers);

          // Procesar las ofertas de vuelo (estructura antigua)
          const processedFlights = flightOffers.map((offer, index) => {
            const itineraries = offer.itineraries;
            const outbound = itineraries[0];
            const returnFlight = itineraries[1];
            
            // Seleccionar precio en divisa acorde a la búsqueda
            const selectedCurrency = (typeof window !== 'undefined' && localStorage.getItem('selectedCurrency')) || 'COP';
            const totalPrice = parseFloat(selectedCurrency === 'USD' ? (offer.price?.total || offer.price?.base) : (offer.price?.base));
            const passengers = offer.travelerPricings.length;
            const pricePerPerson = totalPrice / passengers;

             // Función para procesar múltiples segmentos (escalas)
             const processSegments = (segments) => {
               // Procesar cada segmento para incluir el nombre de la aerolínea
               const processedSegments = segments.map(seg => ({
                 ...seg,
                 airlineName: getAirlineName(seg.carrierCode, dictionariesData) || seg.carrierCode,
                 carrierCode: seg.carrierCode
               }));
               
               if (segments.length === 1) {
                 // Vuelo directo
                 const segment = segments[0];
                 const airlineName = getAirlineName(segment.carrierCode, dictionariesData) || segment.carrierCode;
                 return {
                   date: formatDate(segment.departure.at),
                   airline: airlineName,
                   logo: getAirlineLogo(segment.carrierCode),
                   origin: segment.departure.iataCode,
                   originCity: getCityName(segment.departure.iataCode, dictionariesData),
                   destination: segment.arrival.iataCode,
                   destinationCity: getCityName(segment.arrival.iataCode, dictionariesData),
                   departure: formatDateTime(segment.departure.at),
                   arrival: formatDateTime(segment.arrival.at),
                   duration: formatDuration(segment.duration),
                   type: segment.numberOfStops === 0 ? "Directo" : `${segment.numberOfStops} escala${segment.numberOfStops > 1 ? 's' : ''}`,
                   baggage: {
                     carryOn: true,
                     checked: true
                   },
                   segments: processedSegments,
                   carrierCode: segment.carrierCode,
                   airlineName: airlineName,
                   numberOfStops: segment.numberOfStops || 0
                 };
               } else {
                 // Vuelo con escalas - procesar todos los segmentos
                 const firstSegment = segments[0];
                 const lastSegment = segments[segments.length - 1];
                 const airlineName = getAirlineName(firstSegment.carrierCode, dictionariesData) || firstSegment.carrierCode;
                 const totalDuration = segments.reduce((total, seg) => {
                   const duration = seg.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
                   const hours = duration[1] ? parseInt(duration[1]) : 0;
                   const minutes = duration[2] ? parseInt(duration[2]) : 0;
                   return total + (hours * 60 + minutes);
                 }, 0);
                 
                 const totalHours = Math.floor(totalDuration / 60);
                 const totalMinutes = totalDuration % 60;
                 const formattedDuration = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

                 return {
                   date: formatDate(firstSegment.departure.at),
                   airline: airlineName,
                   logo: getAirlineLogo(firstSegment.carrierCode),
                   origin: firstSegment.departure.iataCode,
                   originCity: getCityName(firstSegment.departure.iataCode, dictionariesData),
                   destination: lastSegment.arrival.iataCode,
                   destinationCity: getCityName(lastSegment.arrival.iataCode, dictionariesData),
                   departure: formatDateTime(firstSegment.departure.at),
                   arrival: formatDateTime(lastSegment.arrival.at),
                   duration: formattedDuration,
                   type: `${segments.length - 1} escala${segments.length - 1 > 1 ? 's' : ''}`,
                   baggage: {
                     carryOn: true,
                     checked: true
                   },
                   segments: processedSegments,
                   carrierCode: firstSegment.carrierCode,
                   airlineName: airlineName,
                   numberOfStops: segments.length - 1
                 };
               }
             };

            return {
              id: index + 1,
              outbound: processSegments(outbound.segments),
              return: processSegments(returnFlight.segments),
              pricing: {
                perPerson: formatPrice(pricePerPerson),
                total: formatPrice(totalPrice),
                passengers: passengers,
                includesTaxes: true
              }
            };
          });

          setFlightData({
            hotel: hotelInfo,
            flights: processedFlights
          });
        } else {
          // Si no hay datos, usar datos de ejemplo
          setFlightData({
            hotel: hotelInfo || {
              name: "Hotel Avexi Suites",
              dates: "6 sep -> 10 sep (3 noches)",
              room: {
                type: "Doble estándar",
                meal: "Media pensión",
                payment: "Pago: Inmediato",
                dates: "6 sep - 10 sep | Cambiar",
                nights: "4 noches, 2 huéspedes"
              },
              price: "$1.000.000",
              includesTaxes: true
            },
            flights: []
          });
        }
      } catch (error) {
        console.error('Error al cargar datos de vuelos:', error);
        setFlightData({
          hotel: {
            name: "Error al cargar datos",
            dates: "No disponible",
            room: {
              type: "No disponible",
              meal: "No disponible",
              payment: "No disponible",
              dates: "No disponible",
              nights: "No disponible"
            },
            price: "$0",
            includesTaxes: false
          },
          flights: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadFlightData();
  }, []);

  // Reiniciar a la primera página cuando cambie la cantidad de vuelos
  useEffect(() => {
    if (flightData?.flights) {
      setCurrentPage(1);
    }
  }, [flightData?.flights?.length]);

  // Hacer scroll al inicio cuando cambia la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Reiniciar a la primera página cuando cambia el filtro de aerolínea
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCarrier]);

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Cargando vuelos disponibles...</h2>
        </div>
      </div>
    );
  }

  // Si no hay datos de vuelos
  if (!flightData || !flightData.flights || flightData.flights.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noFlights}>
          <h2>No se encontraron vuelos disponibles</h2>
          <p>Por favor, intente con otros criterios de búsqueda.</p>
        </div>
      </div>
    );
  }

  // Si no hay dictionaries disponibles (solo para estructura antigua), no bloquear
  // La nueva estructura no requiere dictionaries

   // Construir listado de aerolíneas presentes y filtrar por aerolínea seleccionada
   const carriersMap = new Map(); // Map para guardar código -> nombre
   flightData.flights.forEach((f) => {
     f.outbound.segments.forEach((s) => {
       const carrierCode = s.carrierCode || s.airlineCode;
       const airlineName = s.airlineName || getAirlineName(carrierCode, dictionaries) || carrierCode;
       if (carrierCode) {
         carriersMap.set(carrierCode, airlineName);
       }
     });
     f.return.segments.forEach((s) => {
       const carrierCode = s.carrierCode || s.airlineCode;
       const airlineName = s.airlineName || getAirlineName(carrierCode, dictionaries) || carrierCode;
       if (carrierCode) {
         carriersMap.set(carrierCode, airlineName);
       }
     });
   });
   const carriersInResults = Array.from(carriersMap.keys());

   const filteredFlights = selectedCarrier
     ? flightData.flights.filter((f) =>
         f.outbound.segments.some((s) => (s.carrierCode || s.airlineCode) === selectedCarrier) ||
         f.return.segments.some((s) => (s.carrierCode || s.airlineCode) === selectedCarrier)
       )
     : flightData.flights;

  // Paginación sobre la lista filtrada
  const totalFlights = filteredFlights.length;
  const totalPages = Math.max(1, Math.ceil(totalFlights / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleFlights = filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const selectedFlightData = selectedFlight ? flightData.flights.find((f) => f.id === selectedFlight) : null;

  // Divisa seleccionada para mostrar sufijo (COP/USD)
  const selectedCurrencyDisplay = (typeof window !== 'undefined' && localStorage.getItem('selectedCurrency')) || 'COP';
  const currencySuffix = selectedCurrencyDisplay === 'USD' ? 'USD' : 'COP';

  const handleFlightSelect = (flightId) => {
    setSelectedFlight(flightId);
    try {
      // flightId empieza en 1, el índice del array en 0
      const selectedOffer = originalFlightOffers?.[flightId - 1];
      if (selectedOffer) {
        localStorage.setItem('datosReservaVuelos', JSON.stringify(selectedOffer));
      }
    } catch (e) {
      console.error('No se pudo guardar la oferta seleccionada en localStorage', e);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext= () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <br />
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Sección de vuelos disponibles */}
        <div className={styles.flightsSection}>
          {/* Filtro de aerolínea */}
          <div className={styles.pagination}>
            <label htmlFor="carrierFilter">Aerolíneas disponibles:&nbsp;</label>
            <select
              id="carrierFilter"
              className={styles.pageBtn}
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
            >
               <option value="">Todas</option>
               {carriersInResults.map((code) => {
                 const airlineName = carriersMap.get(code) || getAirlineName(code, dictionaries) || code;
                 return (
                   <option key={code} value={code}>
                     {airlineName}
                   </option>
                 );
               })}
            </select>
          </div>
          <br />
          {visibleFlights.map((flight, index) => (
            <div key={flight.id} className={styles.flightOption}>
              {/* Ida */}
              <div className={styles.flightSegment}>
                <div className={styles.segmentHeader}>
                  <span className={styles.segmentLabel}>Ida</span>
                  <span className={styles.segmentDate}>{flight.outbound.date}</span>
                </div>
                
                 {/* Mostrar todos los segmentos de ida */}
                 {flight.outbound.segments.map((segment, segmentIndex) => {
                   // Manejar tanto la estructura nueva como la antigua
                   const isNewStructure = segment.departureCode !== undefined;
                   const carrierCode = segment.carrierCode || segment.airlineCode;
                   // Priorizar airlineName del segmento, luego usar getAirlineName si no existe
                   const airlineName = segment.airlineName || getAirlineName(carrierCode, dictionaries) || carrierCode;
                   const originCode = isNewStructure ? segment.departureCode : segment.departure?.iataCode;
                   const destinationCode = isNewStructure ? segment.arrivalCode : segment.arrival?.iataCode;
                   const departureTime = isNewStructure ? segment.departureTime : formatDateTime(segment.departure?.at);
                   const arrivalTime = isNewStructure ? segment.arrivalTime : formatDateTime(segment.arrival?.at);
                   const duration = isNewStructure ? segment.duration : segment.duration;
                   const numberOfStops = segment.numberOfStops || flight.outbound.numberOfStops || 0;
                   
                   return (
                     <div key={segmentIndex} className={styles.flightDetails}>
                       <div className={styles.airlineInfo}>
                         <img src={getAirlineLogo(carrierCode)} alt={airlineName} className={styles.airlineLogo} />
                         <span className={styles.airlineName}>{airlineName}</span>
                       </div>
                      <div className={styles.routeInfo}>
                        <div className={styles.origin}>
                          <span className={styles.cityCode}>{originCode}</span>
                          <span className={styles.cityName}>{getCityName(originCode, dictionaries)}</span>
                        </div>
                        <div className={styles.flightTime}>
                          <span className={styles.departureTime}>{departureTime}</span>
                          <span className={styles.flightType}>
                            {numberOfStops === 0 ? "Directo" : `${numberOfStops} escala${numberOfStops > 1 ? 's' : ''}`}
                          </span>
                          <span className={styles.arrivalTime}>{arrivalTime}</span>
                        </div>
                        <div className={styles.destination}>
                          <span className={styles.cityCode}>{destinationCode}</span>
                          <span className={styles.cityName}>{getCityName(destinationCode, dictionaries)}</span>
                        </div>
                      </div>
                      <div className={styles.flightDuration}>
                        <span>{formatDuration(duration)}</span>
                      </div>
                      <div className={styles.baggageInfo}>
                        <i className="fas fa-suitcase-rolling"></i>
                        <i className="fas fa-suitcase"></i>
                        <i className="fas fa-info-circle"></i>
                      </div>
                      
                      {/* Mostrar información de escala si no es el último segmento */}
                      {segmentIndex < flight.outbound.segments.length - 1 && (
                        <div className={styles.connectionInfo}>
                          <div className={styles.connectionLine}></div>
                          <div className={styles.connectionText}>
                            <img src="https://space-img.sfo3.digitaloceanspaces.com/Logos/Avion.png" alt="Avión" />
                            <span>Escala en {getCityName(destinationCode, dictionaries)} ({destinationCode})</span>
                          </div>
                          <div className={styles.connectionLine}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Información resumida del vuelo completo de ida */}
                <div className={styles.flightSummary}>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryRoute}>
                      {flight.outbound.origin} → {flight.outbound.destination}
                    </span>
                    <span className={styles.summaryDuration}>
                      Duración total: {flight.outbound.duration}
                    </span>
                    <span className={styles.summaryType}>
                      {flight.outbound.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Regreso */}
              <div className={styles.flightSegment}>
                <div className={styles.segmentHeader}>
                  <span className={styles.segmentLabel}>Regreso</span>
                  <span className={styles.segmentDate}>{flight.return.date}</span>
                </div>
                
                 {/* Mostrar todos los segmentos de regreso */}
                 {flight.return.segments.map((segment, segmentIndex) => {
                   // Manejar tanto la estructura nueva como la antigua
                   const isNewStructure = segment.departureCode !== undefined;
                   const carrierCode = segment.carrierCode || segment.airlineCode;
                   // Priorizar airlineName del segmento, luego usar getAirlineName si no existe
                   const airlineName = segment.airlineName || getAirlineName(carrierCode, dictionaries) || carrierCode;
                   const originCode = isNewStructure ? segment.departureCode : segment.departure?.iataCode;
                   const destinationCode = isNewStructure ? segment.arrivalCode : segment.arrival?.iataCode;
                   const departureTime = isNewStructure ? segment.departureTime : formatDateTime(segment.departure?.at);
                   const arrivalTime = isNewStructure ? segment.arrivalTime : formatDateTime(segment.arrival?.at);
                   const duration = isNewStructure ? segment.duration : segment.duration;
                   const numberOfStops = segment.numberOfStops || flight.return.numberOfStops || 0;
                   
                   return (
                     <div key={segmentIndex} className={styles.flightDetails}>
                       <div className={styles.airlineInfo}>
                         <img src={getAirlineLogo(carrierCode)} alt={airlineName} className={styles.airlineLogo} />
                         <span className={styles.airlineName}>{airlineName}</span>
                       </div>
                      <div className={styles.routeInfo}>
                        <div className={styles.origin}>
                          <span className={styles.cityCode}>{originCode}</span>
                          <span className={styles.cityName}>{getCityName(originCode, dictionaries)}</span>
                        </div>
                        <div className={styles.flightTime}>
                          <span className={styles.departureTime}>{departureTime}</span>
                          <span className={styles.flightType}>
                            {numberOfStops === 0 ? "Directo" : `${numberOfStops} escala${numberOfStops > 1 ? 's' : ''}`}
                          </span>
                          <span className={styles.arrivalTime}>{arrivalTime}</span>
                        </div>
                        <div className={styles.destination}>
                          <span className={styles.cityCode}>{destinationCode}</span>
                          <span className={styles.cityName}>{getCityName(destinationCode, dictionaries)}</span>
                        </div>
                      </div>
                      <div className={styles.flightDuration}>
                        <span>{formatDuration(duration)}</span>
                      </div>
                      <div className={styles.baggageInfo}>
                        <i className="fas fa-suitcase-rolling"></i>
                        <i className="fas fa-suitcase"></i>
                        <i className="fas fa-info-circle"></i>
                      </div>
                      
                      {/* Mostrar información de escala si no es el último segmento */}
                      {segmentIndex < flight.return.segments.length - 1 && (
                        <div className={styles.connectionInfo}>
                          <div className={styles.connectionLine}></div>
                          <div className={styles.connectionText}>
                          <img src="https://space-img.sfo3.digitaloceanspaces.com/Logos/Avion.png" alt="Avión" />
                            <span>Escala en {getCityName(destinationCode, dictionaries)} ({destinationCode})</span>
                          </div>
                          <div className={styles.connectionLine}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Información resumida del vuelo completo de regreso */}
                <div className={styles.flightSummary}>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryRoute}>
                      {flight.return.origin} → {flight.return.destination}
                    </span>
                    <span className={styles.summaryDuration}>
                      Duración total: {flight.return.duration}
                    </span>
                    <span className={styles.summaryType}>
                      {flight.return.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Opción de equipaje */}
              <div className={styles.baggageUpgrade}>
                <div className={styles.baggageUpgradeContent}>
                  <i className="fas fa-suitcase"></i>
                  <span>Lleva más equipaje con una mejor categoría</span>
                  <button className={styles.addBaggageBtn}>+ Agregar equipaje</button>
                </div>
              </div>

              {/* Precios */}
              <div className={styles.pricing}>
                <div className={styles.pricePerPerson}>
                  <span className={styles.priceLabel}>Valor por persona</span>
                  <span className={styles.priceValue}>{flight.pricing.perPerson} {currencySuffix}</span>
                </div>
                <div className={styles.totalPrice}>
                  <span className={styles.totalLabel}>Total {flight.pricing.passengers} personas</span>
                  <span className={styles.totalValue}>{flight.pricing.total} {currencySuffix}</span>
                </div>
                <div className={styles.taxesInfo}>
                  <span>Incluye impuestos</span>
                </div>
              </div>

              {/* Botón de selección */}
              <div className={styles.selectionButton}>
                <button 
                  name='confirmarvuelo'
                  className={`${styles.selectBtn} ${selectedFlight === flight.id ? styles.selected : ''}`}
                  onClick={() => handleFlightSelect(flight.id)}
                >
                  {selectedFlight === flight.id ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}


          {/* Navegación */}
          <div className={styles.navigation}>
            <button className={styles.exitBtn}>Salir</button>
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn} 
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                &lt; Anterior
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button 
                className={styles.pageBtn} 
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Siguiente &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar de reserva */}
      <div className={styles.sidebar}>
        <div className={styles.reservationSummary}>
          <h2 className={styles.reservationTitle}>Reserva</h2>
          
          {/* Información del hotel */}
          <div className={styles.hotelInfo}>
            <div className={styles.hotelHeader}>
              <img src="https://space-img.sfo3.digitaloceanspaces.com/Logos/VectorHotel.png" alt="Hotel" />
              <span className={styles.hotelName}>{flightData.hotel.name}</span>
            </div>
            <div className={styles.hotelDates}>{flightData.hotel.dates}</div>
            
            <div className={styles.roomInfo}>
              <div className={styles.roomTitle}>Habitación 1</div>
              <div className={styles.roomDetails}>
                <div>{flightData.hotel.room.type}</div>
                <div>Plan de alimentacion: {flightData.hotel.room.meal}</div>
                {flightData.hotel.room && typeof flightData.hotel.room.pets === 'number' && flightData.hotel.room.pets > 0 && (
                  <div>Mascotas: {flightData.hotel.room.pets}</div>
                )}
                <div>Tipo de traslado: {flightData.hotel.room.transferIncluded ? flightData.hotel.room.transferText : 'No incluido'}</div>
                <div>{flightData.hotel.room.payment}</div>
                <div>{flightData.hotel.room.dates}</div>
                <div>{flightData.hotel.room.nights}</div>
              </div>
            </div>
            
            <div className={styles.hotelPrice}>
              <span className={styles.priceValue}>{flightData.hotel.price}</span>
              {flightData.hotel.includesTaxes && <span className={styles.taxesLabel}>Incluye impuestos</span>}
            </div>
          </div>

          {/* Información del vuelo (se muestra solo tras confirmar selección) */}
          {selectedFlightData && (
            <div className={styles.flightInfo}>
              <div className={styles.flightHeader}>
              <img src="https://space-img.sfo3.digitaloceanspaces.com/Logos/Avion.png" alt="Avión" />
                <span className={styles.flightRoute}>
                  {selectedFlightData.outbound.originCity} - {selectedFlightData.outbound.destinationCity}
                </span>
              </div>
              <div className={styles.flightPassengers}>
                Ida y vuelta, {selectedFlightData.pricing.passengers} adultos
              </div>
              
              {/* Vuelo de ida */}
              <div className={styles.flightSegmentSummary}>
                <div className={styles.segmentTitle}>Ida</div>
                <div className={styles.segmentDate}>{selectedFlightData.outbound.date}</div>
                <div className={styles.segmentDetails}>
                  <div className={styles.airlineName}>{selectedFlightData.outbound.airline}</div>
                  <div className={styles.route}>
                    {selectedFlightData.outbound.origin} → {selectedFlightData.outbound.destination}
                  </div>
                  <div className={styles.times}>
                    {selectedFlightData.outbound.departure} {selectedFlightData.outbound.type} {selectedFlightData.outbound.arrival}
                  </div>
                  <div className={styles.duration}>{selectedFlightData.outbound.duration}</div>
                  <div className={styles.baggageIcons}>
                    <i className="fas fa-suitcase-rolling"></i>
                    <i className="fas fa-suitcase"></i>
                  </div>
                </div>
              </div>

              {/* Vuelo de regreso */}
              <div className={styles.flightSegmentSummary}>
                <div className={styles.segmentTitle}>Vuelta</div>
                <div className={styles.segmentDate}>{selectedFlightData.return.date}</div>
                <div className={styles.segmentDetails}>
                  <div className={styles.airlineName}>{selectedFlightData.return.airline}</div>
                  <div className={styles.route}>
                    {selectedFlightData.return.origin} → {selectedFlightData.return.destination}
                  </div>
                  <div className={styles.times}>
                    {selectedFlightData.return.departure} {selectedFlightData.return.type} {selectedFlightData.return.arrival}
                  </div>
                  <div className={styles.duration}>{selectedFlightData.return.duration}</div>
                  <div className={styles.baggageIcons}>
                    <i className="fas fa-suitcase-rolling"></i>
                    <i className="fas fa-suitcase"></i>
                  </div>
                </div>
              </div>

              <div className={styles.flightPricing}>
                <div className={styles.pricePerPerson}>
                  <span>Valor por persona: {selectedFlightData.pricing.perPerson} {currencySuffix}</span>
                </div>
                <div className={styles.totalPrice}>
                  <span>Total {selectedFlightData.pricing.passengers} personas: {selectedFlightData.pricing.total} {currencySuffix}</span>
                </div>
                <div className={styles.taxesInfo}>
                  <span>Incluye impuestos</span>
                </div>
              </div>
            </div>
          )}

          {/* Total (se muestra solo tras confirmar selección) */}
          {selectedFlightData && (
            <div className={styles.totalSummary}>
              <div className={styles.totalLabel}>Total</div>
              <div className={styles.totalAmount}>{selectedFlightData.pricing.total} {currencySuffix}</div>
              <div className={styles.totalTaxes}>Incluye impuestos</div>
            </div>
          )}
  
          {/* Botón de acción */}
          {selectedFlight ? (
            <a href="/reservas" rel="noopener noreferrer">
              <button className={styles.actionButton}>Continuar</button>
            </a>
          ) : (
            <button 
              className={styles.actionButton} 
              disabled={true}
              title="Debe seleccionar un vuelo para continuar"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default VuelosDisponibles;
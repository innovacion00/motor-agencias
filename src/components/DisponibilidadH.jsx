import React, { useEffect, useState } from "react";
import styles from "../../public/styles/DisponibilidadH.module.css";
import DropdownSearch from "./DropdownSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { disponibilidad } from "../stores/disponibilidad";
import { currency } from "../stores/divisas"; //  store de divisa
import { useStore } from "@nanostores/react";
import {
  getIvaPorcentaje,
  getMascotaPrecio,
  getTarifasTraslado,
  obtenerCatalogoTours,
  precargarPreciosExtras,
} from "../stores/preciosExtras";
import ToursCs from "./ToursCs";
import { Tooltip } from 'react-tooltip';
import Swal from 'sweetalert2';
import {
  searchFlights,
  esFlujoVueloHotelActivo,
  esModoBusquedaVueloHotel,
  limpiarDatosPaqueteVuelo,
} from '../utils/flightSearch';
import UpgradeModal from './UpgradeModal';
import {
  buildUpgradeOptions,
  resolveUpgradeTargetIds,
} from '../utils/hotelUpgrades';
import { buildRatePlanRegex } from '../utils/ratePlanMatchers';
import { aplicaDescuentoHospedaje, conDescuentoHospedaje } from '../utils/descuentoHospedaje';
import { HOTELES } from '../data/hotelesConfig';

const hotelesData = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, { name: h.nombre, direction: h.direccion, description: h.descripcion, image: h.imgDetalle, leermas: h.leermas, mapa: h.mapa }]));

const hotelIcons = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.iconos]));

const idRooms = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, Object.fromEntries(Object.entries(h.habitaciones||{}).map(([id,d]) => [id, d.url]))]));

const quintuple = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.quintuple]));

// Función para normalizar el nombre del hotel
const getHotelName = (hotel) => {
  if (hotel?.id === 123) {
    return "Hotel Playa Salguero";
  }
  return hotel?.name || "Hotel no encontrado";
};

const hotelNombreStoragePorId = Object.fromEntries(Object.values(HOTELES).filter(h => h.nombreStorage).map(h => [h.id, h.nombreStorage]));

const plan_alimentacion = Object.fromEntries(Object.values(HOTELES).map(h => [h.id, h.planAlimentacionDisponibilidad]));

// Utilidad para formatear fechas cortas en el stepper
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};

// UseState

export const Cid = ({ id }) => {
  const [tooltipActivo, setTooltipActivo] = useState(null);
  const currentCurrency = useStore(currency); // COP o USD
  const [divisaSelec, setdivisaSelec] = useState("COP");
  const hotel = hotelesData[id];
  const [habitaciones, setHabitaciones] = useState({});
  const [rangosfechas, setfechas] = useState({});
  const [ninos, setninos] = useState(0);
  const [adultos, setadultos] = useState(0);
  const [datohabitacion, setDatohabitacion] = useState([]);
  const [categoria, setcategoria] = useState();
  const [mostrarseccion, setocultarseccion] = useState(plan_alimentacion[id]);
  const [mostrarToures, setmostrarToures] = useState(false);
  const [mostrarTraslados, setmostrarTraslados] = useState(false);
  const [planDeAlimentacion, setplanDeAlimentacion] = useState("solodesayuno");
  const [contadorHabitaciones, setcontadorHabitaciones] = useState(0);
  const [infoToures, setinfoToures] = useState({});
  const [selectedTours, setSelectedTours] = useState([]);
  const [tipoTraslado, setTipoTraslado] = useState(null);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [filteredTours, setFilteredTours] = useState([]);
  const [toursCatalogo, setToursCatalogo] = useState([]);
  const [mostrarMascotas, setMostrarMascotas] = useState(false);
  const [cantidadMascotas, setCantidadMascotas] = useState(0);
  const [infoVuelo, setinfoVuelo] = useState(null);
  const [descuentoHospedaje, setDescuentoHospedaje] = useState(false);
  const [nochesyedades1, setnochesyedades] = useState({
    nights: 0,
    dateRange: {},
    layout: [],
  });
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [upgradeOptionsList, setUpgradeOptionsList] = useState([]);
  const hotelIdNumero = Number(habitaciones?.hotel?.id ?? id);
  const esHotelExentoIVA = getIvaPorcentaje(hotelIdNumero) === 0;

  function openModal(tour) {
    setIsOpen(true);
    setinfoToures(tour);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const waitForNextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(resolve));

  const navigateWithViewTransition = async (url) => {
    await waitForNextFrame();
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = url;
      });
      return;
    }
    window.location.href = url;
  };

  const ejecutarFlujoReserva = async () => {
    if (esModoBusquedaVueloHotel()) {
      if (!esFlujoVueloHotelActivo()) {
        await Swal.fire({
          icon: 'warning',
          title: 'Datos de vuelo incompletos',
          text: 'Vuelve al buscador, selecciona origen, destino y fechas en modo Vuelo + Hotel y realiza la búsqueda antes de continuar.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#26547B',
        });
        return;
      }
    } else {
      limpiarDatosPaqueteVuelo();
      enviardatos();
      await navigateWithViewTransition("/reservas");
      return;
    }

    setIsSearchingFlights(true);
    try {
      const success = await searchFlights();
      if (success) {
        enviardatos();
        localStorage.removeItem('modoCotizacion');
        await navigateWithViewTransition("/dispoVuelos");
      }
    } catch (error) {
      console.error('Error en la búsqueda de vuelos:', error);
    } finally {
      setIsSearchingFlights(false);
    }
  };

  const ejecutarFlujoCotizacion = async () => {
    if (esModoBusquedaVueloHotel()) {
      if (!esFlujoVueloHotelActivo()) {
        await Swal.fire({
          icon: 'warning',
          title: 'Datos de vuelo incompletos',
          text: 'Vuelve al buscador, selecciona origen, destino y fechas en modo Vuelo + Hotel y realiza la búsqueda antes de continuar.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#26547B',
        });
        return;
      }
    } else {
      limpiarDatosPaqueteVuelo();
      enviardatos();
      await navigateWithViewTransition("/cotizacionpagina");
      return;
    }

    setIsSearchingFlights(true);
    try {
      const success = await searchFlights();
      if (success) {
        enviardatos();
        localStorage.setItem('modoCotizacion', 'true');
        await navigateWithViewTransition("/dispoVuelos");
      }
    } catch (error) {
      console.error('Error en la búsqueda de vuelos:', error);
    } finally {
      setIsSearchingFlights(false);
    }
  };

  const [planDeAlimentacionFormateado, setPlanDeAlimentacionFormateado] =
    useState("");

  // console.log(selectedTours);

  const habitacionesRestringidas = [
    //Hotel Abi/Rodadero
    "Familiar quintuple",
    "Cuadruple estandar ",
    "Triple estandar",
    "Doble estandar ",
    "Doble estándar",
    //Hotel Axis
    "Doble estandar", 
    "Quíntuple",
    "Cuádruple",
    "Triple estándar",
    //Hotel Sansiraka
    "QUINTUPLE",
    "CUADRUPLE",
    "TRIPLE",
    "DOBLE",
    "TWIN",
    "JUNIOR SUITE",
    //Hotel avexi/azuan/Marina
    "Habitacion Doble Standard",
    "Habitacion Cuadruple Standard",
    ,
    //Hotel Bocagrande
    "Doble ",
    "Triple ",
    "Cuadruple ",
    "Quintuple",
    // Hotel Aixo
    "Habitacion Doble Standard con vista al mar ",
    "Habitacion Cuadruple standard con vista a la ciudad",
    "Habitación Doble Standard con Vista a la Ciudad",
    "Habitacion cuadruple superior con vista al mar ",
    // Hotel Madison
    "ESTANDAR",
    "SUPERIOR CON TERRAZA",
    "FAMILIAR 3PAX",
    "SUITE BUSINESS",
    "EJECUTIVA TWIN",
    "FAMILIAR",
    // Hotel Windsor
    // "Doble Superior ",
    // "Doble estandar twin",
    "Triple estandar altillo con escaleras",
    // "Doble junior Suites",
    // "Doble junior twin",
    "Suite matrimonial ",
    //Hotel boquilla
    "Habtiacion Doble Standard ",
    "Habitacion Sextuple",
  ];

  // Habitaciones que tienen un límite especial: count + 3
  const habitacionesConLimiteEspecial = [
    "Doble estandar",
    "Doble estandar ",
    "Doble estándar",
    "DOBLE",
    "Habitacion Doble Standard",
    "Doble ",
    "Habitacion Doble Standard con vista al mar ",
    "Habitacion Doble Standard con vista al mar ",
    "Habitación Doble Standard con Vista a la Ciudad",
    "Doble Superior ",
    "Doble estandar twin",
    "Doble junior Suites",
    "Doble junior twin",
    "Habtiacion Doble Standard ",
  ];

  // Función para obtener el límite de habitaciones según el tipo
  const obtenerLimiteHabitaciones = (roomName, count) => {
    if (habitacionesConLimiteEspecial.includes(roomName)) {
      return count ;
    }
    return count;
  };

  //console.log("numero de camas:"camas)
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateTransferPrice = (
    city,
    currency,
    transferType,
    totalGuests,
    hotelId
  ) => {
    if (!transferType) return 0;

    // Tarifas por ciudad/hotel desde el catálogo precios_extras (con fallback)
    const precios = getTarifasTraslado(city, currency, hotelId);

    // Determinar el índice basado en el tipo de traslado
    const priceIndex = transferType === "ambos" ? 1 : 0;

    const precioBase = precios?.[priceIndex];
    if (!precioBase) return 0;

    // Calcular número de vehículos necesarios (cada vehículo lleva 4 personas)
    const vehiculosNecesarios = Math.ceil(totalGuests / 4);
    return parseFloat(precioBase) * vehiculosNecesarios;
  };

  // Modify the calculateTotalPrice function
  const calculateTotalPrice = (basePrice, tours, currency, totalGuests, city, tipoTraslado, numMascotas = 0, hotelId = hotelIdNumero) => {
    const toursPrice = tours.reduce((total, tour) => {
      const tourPrice =
        currency === "USD"
          ? parseFloat(tour.preciousd)
          : parseFloat(tour.preciocol);
      return total + tourPrice * totalGuests;
    }, 0);
  
    const transferPrice = calculateTransferPrice(city, currency, tipoTraslado, totalGuests, hotelId);
    
    // Add pet price calculation
    const mascotasPrice = numMascotas * getMascotaPrecio(currency);
  
    return parseFloat(basePrice) + toursPrice + transferPrice + mascotasPrice;
  };

  //Enviar datos de reserva
  const enviardatos = () => {
    const huespedesG = ninos + adultos;
    const ciudadG = habitaciones?.hotel?.city;
    const catActualizado = datohabitacion.map((hab) => ({
      ...hab,
      tourSeleccionado: selectedTours,
      tipoTraslado: mostrarTraslados ? tipoTraslado : null,
      mascotas: mostrarMascotas ? cantidadMascotas : 0,
      precioToursHabitacion: (selectedTours || []).reduce((total, tour) => {
        const precioTourG = parseFloat(
          currentCurrency === "USD" ? tour.preciousd : tour.preciocol
        );
        return total + (Number.isFinite(precioTourG) ? precioTourG : 0) * huespedesG;
      }, 0),
      precioTrasladoHabitacion:
        mostrarTraslados && tipoTraslado != null
          ? calculateTransferPrice(ciudadG, currentCurrency, tipoTraslado, huespedesG, hotelIdNumero)
          : 0,
      precioMascotasHabitacion:
        (mostrarMascotas ? cantidadMascotas : 0) * getMascotaPrecio(currentCurrency),
    }));
    setDatohabitacion(catActualizado);
    localStorage.setItem("datosreserva", JSON.stringify(catActualizado));
    const hotelActual = habitaciones?.hotel || {};
    const hotelId = Number(hotelActual.id ?? id);
    const hotelSeleccionado = {
      id: hotelId,
      nombre: hotelNombreStoragePorId[hotelId] || getHotelName(hotelActual),
      ciudad: hotelActual.city ?? selectedCity ?? "",
      imagen: hotelActual.image ?? hotel?.image ?? "",
    };
    localStorage.setItem("hotelSeleccionado", JSON.stringify(hotelSeleccionado));
  };

  //Use effect selectedCity
  useEffect(() => {
    const city = localStorage.getItem("selectedCity");
    if (city) {
      setSelectedCity(city);
    }
    
    // Load flight and date data for stepper
    const datosVuelo = JSON.parse(localStorage.getItem("datosDelVuelo"));
    setinfoVuelo(datosVuelo);
    const nochesyedades = JSON.parse(localStorage.getItem("nochesyedades"));
    setnochesyedades(nochesyedades);
    setDescuentoHospedaje(aplicaDescuentoHospedaje());
  }, []);

  // Precargar precios de extras y tours desde el catálogo del backend
  useEffect(() => {
    precargarPreciosExtras({
      hotelId: Number(habitaciones?.hotel?.id ?? id ?? null) || null,
      currency: currentCurrency,
    });
    obtenerCatalogoTours({ currency: currentCurrency })
      .then(setToursCatalogo)
      .catch(() => null);
  }, [currentCurrency]);

  // Filtrar tours cada vez que cambie la ciudad seleccionada
  useEffect(() => {
    if (selectedCity) {
      // Filtra los tours que coincidan con la ciudad seleccionada (ignorando mayúsculas/minúsculas)
      const tours = toursCatalogo.filter(
        (tour) => tour.city.toUpperCase() === selectedCity.toUpperCase()
      );
      setFilteredTours(tours);
    } else {
      setFilteredTours([]);
    }
  }, [selectedCity, toursCatalogo]);

  // Función para abrir el modal con la información del tour seleccionado
  const openTourDetails = (tour) => {
    setSelectedTours(tour);
    setIsOpen(true);
  };

  // UseEffect
  useEffect(() => {
    const formatearPlan = (plan) => {
      switch (plan) {
        case "solodesayuno":
          return "Solo desayuno";
        case "mediapension":
          return "Media Pension";
        case "pensioncompleta":
          return "Pension completa";
        default:
          return plan;
      }
    };

    setPlanDeAlimentacionFormateado(formatearPlan(planDeAlimentacion));

    const category = JSON.parse(localStorage.getItem("datosUsuario"));
    const disponibilidad = JSON.parse(localStorage.getItem("data"));
    const rangosdefechas = JSON.parse(localStorage.getItem("nochesyedades"));
    // Obtener el número real de habitaciones del layout
    rangosdefechas.numRooms = rangosdefechas.layout ? rangosdefechas.layout.length : 1;
    
    const resultado = disponibilidad.find((vaina) => vaina.hotel.id == id);
    const adultos = Number(localStorage.getItem("cantNinos"));
    const ninos = Number(localStorage.getItem("cantAdultos"));
    setcategoria(category);
    setninos(ninos);
    setadultos(adultos);
    setfechas(rangosdefechas);
    setHabitaciones(resultado);
    setocultarseccion(plan_alimentacion[id]);
    //limpiar los datos de habitaciones
    setDatohabitacion([]);
  }, [id, planDeAlimentacion]);

  console.log("Disponibilidad total", habitaciones);

  // const regex =categoria?.agencia?.category == 0? /\[Booking connect Neto\]/i : /\[Booking connect Mayorista\]/i; // Expresión regular para validar el roomName

  const valorDelRadioTraslados = (event) => {
    setmostrarTraslados(event.target.value === "si");
  };

  const valorDelRadio = (event) => {
    setplanDeAlimentacion(event.target.value); //valor del radiobutton
  };

  const valorDelRadioToures = (event) => {
    setmostrarToures(event.target.value === "si"); //valor del radiobutton
  };

  const handleSeleccionTraslado = (opcion) => {
    setTipoTraslado(opcion);
  };

  const handleTourSelection = (event, tour) => {
    if (event.target.checked) {
      // Si el checkbox está marcado, agregar el tour al array de seleccionados
      setSelectedTours([...selectedTours, tour]);
    } else {
      // Si se desmarca, quitarlo del array de seleccionados
      setSelectedTours(selectedTours.filter((item) => item.id !== tour.id));
    }
  };

  const valorDelRadioMascotas = (event) => {
    const seleccionSi = event.target.value === "si";
    setMostrarMascotas(seleccionSi);
    if (seleccionSi) {
      setCantidadMascotas(1); // Iniciar en 1 cuando se selecciona "si"
    } else {
      setCantidadMascotas(0);
    }
  };

  const handleCantidadMascotas = (operacion) => {
    const numHabitaciones = rangosfechas.layout ? rangosfechas.layout.length : 1;
    if (operacion === "incremento" && cantidadMascotas < numHabitaciones) {
      setCantidadMascotas(prev => prev + 1);
    } else if (operacion === "decremento" && cantidadMascotas > 1) { // Cambiado de 0 a 1
      setCantidadMascotas(prev => prev - 1);
    }
  };

  console.log("Plan de alimentación:", planDeAlimentacionFormateado);
  // console.log(planDeAlimentacion)

  const categoriagencia = categoria?.agencia?.category; //categoria de la agencia
  console.log("categoria de la agencia:", categoriagencia);

  // Tolera las variantes de nombre del plan entre hoteles
  // (p. ej. "[Booking Connect – Minorista ]" en El Marques, id 164).
  const regexSeleccionado = buildRatePlanRegex(
    categoriagencia,
    planDeAlimentacion
  );

  const resolveCityForUpgrade = () =>
    habitaciones?.hotel?.city ||
    selectedCity ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("selectedCity")
      : "") ||
    "";

  const tryOpenUpgradeModal = (action) => {
    const city = resolveCityForUpgrade();

    let disponibilidadData = [];
    try {
      disponibilidadData = JSON.parse(localStorage.getItem("data") || "[]");
    } catch {
      disponibilidadData = [];
    }

    const targets = resolveUpgradeTargetIds(
      hotelIdNumero,
      city,
      disponibilidadData,
      { currency: currentCurrency, regex: regexSeleccionado }
    );
    if (!targets.length) return false;

    const options = buildUpgradeOptions(disponibilidadData, targets, {
      currency: currentCurrency,
      regex: regexSeleccionado,
      formatCurrency,
    });

    setUpgradeOptionsList(options);
    setPendingAction(action);
    setShowUpgradeModal(true);
    return true;
  };

  const handleReservarClick = async () => {
    if (tryOpenUpgradeModal("reservar")) return;
    await ejecutarFlujoReserva();
  };

  const handleCotizarClick = async () => {
    if (!puedeReservar || isSearchingFlights) return;
    if (tryOpenUpgradeModal("cotizar")) return;
    await ejecutarFlujoCotizacion();
  };

  const handleUpgradeSelect = (newHotelId) => {
    navigateWithViewTransition(`/hoteles/${newHotelId}`);
  };

  const handleUpgradeContinue = async () => {
    const action = pendingAction;
    setShowUpgradeModal(false);
    setPendingAction(null);

    if (action === "cotizar") {
      await ejecutarFlujoCotizacion();
    } else {
      await ejecutarFlujoReserva();
    }
  };

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false);
    setPendingAction(null);
  };

  const checkin = new Date(
    rangosfechas?.dateRange?.startDate
  ).toLocaleDateString();
  const checkout = new Date(
    rangosfechas?.dateRange?.endDate
  ).toLocaleDateString();

  const renderIcons = () => {
    const icons = hotelIcons[id] || []; // Obtiene los íconos del hotel actual o un arreglo vacío
    return icons.map((iconUrl, index) => (
      <img
        key={index}
        src={iconUrl}
        alt={`Ícono ${index + 1}`}
        className={styles.icon}
      />
    ));
  };

  const handleDelete = (index) => {
    setDatohabitacion((prevHabitaciones) => {
      const nuevasHabitaciones = [...prevHabitaciones];
      nuevasHabitaciones.splice(index, 1); //Elimina el elemento en el índice dado
      return nuevasHabitaciones;
    });
  };
  console.log(mostrarTraslados);

  const obtenerBedsPorTipoHabitacion = (roomName = "") => {
    const nombre = roomName.toLowerCase();

    if (nombre.includes("sextuple") || nombre.includes("séxtuple")) return 6;
    if (nombre.includes("quintuple") || nombre.includes("quíntuple")) return 5;
    if (
      nombre.includes("cuadruple") ||
      nombre.includes("cuádruple") ||
      nombre.includes("cuadrúple")
    )
      return 4;
    if (nombre.includes("familiar")) return 3;
    if (nombre.includes("triple")) return 3;
    if (
      nombre.includes("doble") ||
      nombre.includes("double") ||
      nombre.includes("twin") ||
      nombre.includes("junior") ||
      nombre.includes("matrimonial")
    ) {
      return 2;
    }
    // Valor por defecto para no bloquear el flujo si el tipo no coincide.
    return 2;
  };

  // Cálculo de camas totales seleccionadas vs número de adultos
  const totalBedsSeleccionadas = datohabitacion.reduce(
    (acumulado, habitacion) => acumulado + (Number(habitacion.beds) || 0),
    0
  );
  // OJO: en este componente, por cómo se cargan los datos desde localStorage,
  // la variable "ninos" contiene realmente la cantidad de adultos.
  const totalAdultos = Number(ninos) || 0;
  const puedeReservar =
    datohabitacion.length > 0 && totalBedsSeleccionadas >= totalAdultos;

  // Hoteles deshabilitados temporalmente (por id numérico de la plataforma).
  // Madisson = 3.
  const HOTELES_DESHABILITADOS = new Set([3]);
  if (HOTELES_DESHABILITADOS.has(Number(id))) {
    return (
      <>
        <div className={styles.search_form_wrapper}>
          <DropdownSearch client:load />
        </div>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ color: "#1C3D5A" }}>{hotel?.name || "Este hotel"}</h2>
            <p style={{ fontSize: "18px", marginTop: "12px" }}>
              Hotel deshabilitado temporalmente. Estamos en proceso de
              renovación de servicios y volverá muy pronto. 🏖️
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        #tooltip-generar-cotizacion {
          background-color: white !important;
          color: #1C3D5A !important;
          border: 2px solid #1C3D5A !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          max-width: 350px !important;
          line-height: 1.5 !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          opacity: 1 !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className={styles.search_form_wrapper}>
        <DropdownSearch client:load />
      </div>

      <div className={styles.container}>
        {/* Detalles del hotel */}
        <div className={styles.breadcrumb}>
          <a href="/">Inicio</a> / <a href="#">Resultados de búsqueda</a> /{" "}
          {getHotelName(habitaciones?.hotel)}
        </div>

       
        <br />
        <div className={styles.hotel_title}>
          {getHotelName(habitaciones?.hotel)}
        </div>
        <div className={styles.hotel_info}>
          <img
            alt={hotel.name}
            height={"300"}
            src={hotel.image}
            width={"300"}
          />
          <div className={styles.hotel_details}>
            <div className={styles.description}>
              <h2>{getHotelName(habitaciones?.hotel)}</h2>
             
              <p>
                <i className={"fas fa_map_marke_alt"}></i> {hotel.direction} ||
                <a href={hotel.mapa} target="_blank" rel="noopener noreferrer">
                  Ver mapa
                </a>
              </p>
              <br />
              <p>
                {hotel.description}
                <a
                  href={hotel.leermas}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leer más
                </a>
              </p>
              <br />
              <div className={styles.icons}>{renderIcons()}</div>
            </div>
            <div className={styles.more_info}>
              <a href={hotel.leermas} target="_blank" rel="noopener noreferrer">
                <button>Ver más sobre el hotel</button>
              </a>
            </div>
          </div>
        </div>
        <div className={styles.available_rooms}>Habitaciones disponibles</div>
        <div className={styles.search_criteria}>
          <div>
            <p>Check-in</p>
            <strong>{checkin}</strong>
          </div>
          <div>
            <p>Check-out</p>
            <strong>{checkout}</strong>
          </div>
          <div>
            <p>Noches</p>
            <strong>{rangosfechas.nights}</strong>
          </div>
          <div>
            <p>Húespedes</p>
            <strong>{ninos + adultos}</strong>
          </div>
          {/* <div>  <p>Habitaciones disponibles</p>
            <strong>
              {habitaciones?.availability?.map(
                (tipo) => tipo.available_rooms?.length
              )}
            </strong>
          </div> */}
          {/* <button>Modificar búsqueda</button> */}
        </div>
        {esHotelExentoIVA && (
          <div
            style={{
              backgroundColor: "#e0f0ff",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "#1f3b64",
              marginTop: "16px",
              fontWeight: 500,
            }}
          >
            Este hotel está exento del cobro de IVA.
          </div>
        )}
        {/* Sección de Plan de Alimentación */}
        {mostrarseccion && (
          <div className={styles.plan_alimentacion}>
            <div className={styles.planes}>
              <h3>Selecciona el plan de alimentación para tu grupo</h3>
              <p>
                Todas las habitaciones de la reserva tendrán el mismo plan de
                alimentación.
              </p>
              <div>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value="solodesayuno"
                    defaultChecked
                    className={styles.radioInput}
                    onChange={valorDelRadio}
                  />
                  <span>
                    <strong>Solo desayuno</strong> (Incluye desayuno)
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value="mediapension"
                    className={styles.radioInput}
                    onChange={valorDelRadio}
                  />
                  <span>
                    <strong>Media pensión</strong> (Incluye desayuno + almuerzo
                    o cena)
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value="pensioncompleta"
                    className={styles.radioInput}
                    onChange={valorDelRadio}
                  />
                  <span>
                    <strong>Pensión completa</strong> (Incluye desayuno +
                    almuerzo + cena)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className={styles.plan_alimentacion}>
          <div className={styles.planes}>
            <h3>¿Desea añadir mascotas a su reserva?</h3>
            <p>Puede añadir máximo 1 mascota por habitación</p>
            <input
              type="radio"
              name="mascotas"
              value="si"
              className={styles.radioInput}
              onChange={valorDelRadioMascotas}
            />{" "}
            <span style={{ paddingRight: "10px" }}> Si</span>
            <input
              type="radio"
              name="mascotas"
              value="no"
              defaultChecked
              className={styles.radioInput}
              onChange={valorDelRadioMascotas}
            />{" "}
            <span style={{ paddingRight: "10px" }}> No</span>

            {mostrarMascotas && (
              <div className={styles.mascotasSection} style={{ marginTop: "15px" }}>
                <h4 style={{ color: "#1f3b64", marginBottom: "10px" }}>
                  Seleccione la cantidad de mascotas:
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button 
                    onClick={() => handleCantidadMascotas("decremento")}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#26547B",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    -
                  </button>
                  <span>{cantidadMascotas}</span>
                  <button 
                    onClick={() => handleCantidadMascotas("incremento")}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#26547B",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                    disabled={cantidadMascotas >= (rangosfechas.layout?.length || 1)}
                  >
                    +
                  </button>
                  <span style={{ marginLeft: "10px" }}>
                    (Máximo {rangosfechas.layout?.length || 1} {(rangosfechas.layout?.length || 1) === 1 ? 'mascota' : 'mascotas'})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.plan_alimentacion}>
          <div className={styles.planes}>
            {/* Mostrar trasladoss y tours solo para CARTAGENA o SANTA_MARTA */}
            {(selectedCity === 'CARTAGENA' || selectedCity === 'SANTA_MARTA' ) && (
              <>
                {/* --------------------------- TRASLADOS --------------------------- */}
                <h3>¿Desea añadir traslados a su reserva?</h3>
                <input
                  type="radio"
                  name="traslados"
                  value="si"
                  className={styles.radioInput}
                  onChange={() => setmostrarTraslados(true)}
                />{" "}
                <span style={{ paddingRight: "10px" }}> Si</span>
                <input
                  type="radio"
                  name="traslados"
                  value="no"
                  defaultChecked
                  onChange={() => {
                    setmostrarTraslados(false);
                    setTipoTraslado(null);
                  }}
                  className={styles.radioInput}
                />{" "}
                <span style={{ paddingRight: "10px" }}> No</span>
                {mostrarTraslados && (
                  <div className={styles.touresSection}>
                    <h4 style={{ color: "#1f3b64" }}>
                      Selecciona la opcion de traslado deseada:
                    </h4>
                    <div className={styles.tour_item}>
                      <input
                        type="radio"
                        name="tipoTraslado"
                        value="aeropuerto_hotel"
                        onChange={() =>
                          handleSeleccionTraslado("aeropuerto_hotel")
                        }
                      />
                       <label htmlFor="A a H">
                        {" "}
                        {/* datos de persona en traslados bogota ah/ha */}
                        Aeropuerto al hotel{" "}
                        {selectedCity === 'CARTAGENA' ||
                        selectedCity === 'SANTA_MARTA' ||
                        selectedCity === 'BOGOTA'
                          ? `($${getTarifasTraslado(selectedCity, currentCurrency, hotelIdNumero)[0]} ${currentCurrency}`
                          : ''
                        } cada 4 personas) <span style={{ 
                         color: 'gray',  
                          fontSize: '0.85em', 
                          display: 'block',
                          marginTop: '5px'
                        }}>
                          Nota: Para llegadas entra 10:00pm y 6:00am no es posible realizar el traslado.
                        </span>
                      </label>
                    </div>
                    <div className={styles.tour_item}>
                      <input
                        type="radio"
                        name="tipoTraslado"
                        value="hotel_aeropuerto"
                        onChange={() =>
                          handleSeleccionTraslado("hotel_aeropuerto")
                        }
                      />
                      <label htmlFor="H a A">
                        {" "}
                         {/* datos de persona en traslados bogota ah/ha */}
                        Hotel al Aeropuerto{" "}
                        {selectedCity === 'CARTAGENA' ||
                        selectedCity === 'SANTA_MARTA' ||
                        selectedCity === 'BOGOTA'
                          ? `($${getTarifasTraslado(selectedCity, currentCurrency, hotelIdNumero)[0]} ${currentCurrency}`
                          : ''
                        } cada 4 personas) <span style={{ 
                          color: 'gray', 
                          fontSize: '0.85em', 
                          display: 'block',
                          marginTop: '5px'
                        }}>
                          Nota: Para llegadas entra 10:00pm y 6:00am no es posible realizar el traslado.
                        </span>
                      </label>
                    </div>
                    <div className={styles.tour_item}>
                      <input
                        type="radio"
                        name="tipoTraslado"
                        value="ambos"
                        onChange={() => handleSeleccionTraslado("ambos")}
                      />
                      <label htmlFor="A a H Y H a A">
                        {" "}
                         {/* datos de persona en traslados bogota ah/ha */}
                        Aeropuerto al hotel | Hotel al aeropuerto{" "}
                        {selectedCity === 'CARTAGENA' ||
                        selectedCity === 'SANTA_MARTA' ||
                        selectedCity === 'BOGOTA'
                          ? `($${getTarifasTraslado(selectedCity, currentCurrency, hotelIdNumero)[1]} ${currentCurrency}`
                          : ''
                        } cada 4 personas) <span style={{ 
                         color: 'gray', 
                          fontSize: '0.85em', 
                          display: 'block',
                          marginTop: '5px'
                        }}>
                         Nota: Para llegadas entra 10:00pm y 6:00am no es posible realizar el traslado.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
                <br />
                {/*---------------------- TOURES -------------------*/}
                <h3>¿Desea añadir tours a su reserva?</h3>
                <input
                  type="radio"
                  name="tours"
                  value="si"
                  onChange={valorDelRadioToures}
                  className={styles.radioInput}
                />{" "}
                <span style={{ paddingRight: "10px" }}> Si</span>
                <input
                  type="radio"
                  name="tours"
                  value="no"
                  defaultChecked
                  className={styles.radioInput}
                  onChange={valorDelRadioToures}
                />{" "}
                <span style={{ paddingRight: "10px" }}> No</span>
                
                {mostrarToures && (
                  <div className={styles.touresSection}>
                    <br />
                    <h4 style={{ color: "#1f3b64" }}>
                      Opciones de toures disponibles
                      {selectedCity ? ` en ${selectedCity}` : ""}:
                    </h4>
                    <ToursCs
                      isOpen={modalIsOpen}
                      onRequest={closeModal}
                      infoToures={infoToures}
                    />
                    {selectedCity ? (
                      <>
                        {filteredTours.length > 0 ? (
                          filteredTours.map((tour, index) => (
                            <div
                              className={styles.tour_item}
                              key={tour.id || index}
                            >
                              <input
                                type="checkbox"
                                id={`tour-${tour.id || index}`}
                                name={`tour-${tour.id || index}`}
                                onChange={(e) => handleTourSelection(e, tour)}
                              />
                              <label htmlFor={`tour-${tour.id || index}`}>
                                {tour.title}
                              </label>
                              <button
                                className={styles.btn_underline_anim}
                                onClick={() => openModal(tour)}

                              >
                                Ver detalle
                              </button>
                            </div>
                          ))
                        ) : (
                          <p>No hay tours disponibles para {selectedCity}.</p>
                        )}
                      </>
                    ) : (
                      <p>
                        Por favor, seleccione una ciudad para ver los tours
                        disponibles.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* habitaciones?.availability?.map((cam)=>cam.available_rooms?.map((camas)=>(dato.beds))) */}
        <div className={styles.room_section}>
          <div className={styles.cards}>
            {(() => {
              // Consolidar todas las habitaciones de todos los elementos de availability
              const todasLasHabitaciones = habitaciones?.availability?.flatMap(
                (tipo) => tipo.available_rooms || []
              ) || [];
              
              // Eliminar duplicados basándose en roomId Y roomName (mantener la primera ocurrencia)
              // Esto permite mostrar habitaciones con el mismo roomId pero diferente roomName
              const habitacionesUnicas = todasLasHabitaciones.filter(
                (dato, index, self) =>
                  dato.roomId != 164102 && // Filtrar el roomId específico
                  index === self.findIndex((h) => 
                    h.roomId === dato.roomId && h.roomName === dato.roomName
                  )
              );
              
              return habitacionesUnicas.map((dato, index) => (
                <div className={styles.room_card} key={`${dato.roomId}-${dato.roomName}-${index}`}>
                  <img
                    alt="Standard double room with a double bed, TV, and modern decor"
                    height="200"
                    src={idRooms[habitaciones.hotel.id][dato.roomId]}
                    width="250"
                  />
                  <div className={styles.room_details}>
                    <h2>{dato.roomName}</h2>
                    <a
                      href={hotel.leermas}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver habitación
                    </a>
                    <p>
                      <i className="fas fa-check-circle"></i>
                      Para pagos antes del check-in
                    </p>
                    <p>
                      <i className="fas fa-bed"></i>{" "}
                      {obtenerBedsPorTipoHabitacion(dato.roomName)} personas
                    </p>
                    <p className="price"></p>
                    <p className="price">
                      {(() => {
                        // Primero filtrar productos que coinciden con el regex seleccionado
                        // Verificar tanto en roomName como en rateDescription
                        const productosFiltrados = dato.products?.filter((product) => {
                          return regexSeleccionado?.test(product.roomName) || 
                                 regexSeleccionado?.test(product.rateDescription);
                        });

                        // Luego filtrar productos únicos basándose en el roomName base (sin sufijos de booking)
                        const productosUnicos = productosFiltrados?.filter((product, idx, arr) => {
                          // Obtener el texto del campo que contiene el sufijo (roomName o rateDescription)
                          const textoCompleto = product.roomName || product.rateDescription || '';
                          // Extraer el nombre base de la habitación (sin los sufijos de booking)
                          const roomNameBase = textoCompleto.split('[')[0].trim();
                          
                          // Verificar si es el primer producto con este nombre base en el array filtrado
                          return arr.findIndex(p => {
                            const textoP = p.roomName || p.rateDescription || '';
                            return textoP.split('[')[0].trim() === roomNameBase;
                          }) === idx;
                        });

                        return productosUnicos?.map((product, idx) => {
                          const price = conDescuentoHospedaje(
                            currentCurrency === "USD"
                              ? product?.baseRate?.amountBeforeTaxUSD
                              : product?.baseRate?.amountBeforeTax,
                            descuentoHospedaje
                          );

                          return (
                            <span key={idx}>
                              {currency == "USD"
                                ? null
                                : formatCurrency(
                                    price || "Sin precio disponible"
                                  )}

                              <span> {currentCurrency}</span>
                            </span>
                          );
                        });
                      })()}
                    </p>

                    {/* Mostrar "Habitaciones disponibles" solo si la habitación está en la lista restringida */}
                    {habitacionesRestringidas.includes(dato.roomName) && (
                      <b style={{ marginTop: "100px", color: "red" }}>
                        Habitaciones disponibles: {obtenerLimiteHabitaciones(dato.roomName, dato.count)}
                      </b>
                    )}
                    <br />

                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <button
                        className={styles.select_room}
                        data-room="Doble Estándar"
                        data-price="#Valor"
                        onClick={() => {
                          // Contar cuántas habitaciones de este tipo específico ya están seleccionadas
                          const habitacionesDelMismoTipo = datohabitacion.filter(
                            (hab) => hab.roomId === dato.roomId
                          ).length;
                          
                          const limiteHabitaciones = habitacionesRestringidas.includes(dato.roomName)
                            ? obtenerLimiteHabitaciones(dato.roomName, dato.count)
                            : Infinity;
                          if (
                            !(
                              quintuple[habitaciones?.hotel?.id] &&
                              habitacionesRestringidas.includes(dato.roomName)
                            ) ||
                            habitacionesDelMismoTipo < limiteHabitaciones // Verifica el límite de habitaciones de este tipo específico
                          ) {
                            const productoSeleccionado = dato.products?.find((product) =>
                              regexSeleccionado.test(product.roomName) ||
                              regexSeleccionado.test(product.rateDescription)
                            );
                            const baseRate = productoSeleccionado?.baseRate?.[
                              currentCurrency == "USD"
                                ? "amountBeforeTaxUSD"
                                : "amountBeforeTax"
                            ];
                            const precioHabitacionTotal = conDescuentoHospedaje(
                              baseRate,
                              descuentoHospedaje
                            );
                            const basePrecioValido =
                              typeof precioHabitacionTotal === "number" &&
                              !Number.isNaN(precioHabitacionTotal);
                            const nochesHabitacion = rangosfechas.nights || 1;
                            const precioNocheHabitacion = basePrecioValido
                              ? precioHabitacionTotal / nochesHabitacion
                              : 0;
                            const huespedesHabitacion = ninos + adultos;
                            const precioToursHabitacion = (selectedTours || []).reduce(
                              (total, tour) => {
                                const tourPrice = parseFloat(
                                  currentCurrency === "USD"
                                    ? tour.preciousd
                                    : tour.preciocol
                                );
                                return (
                                  total +
                                  (Number.isFinite(tourPrice) ? tourPrice : 0) *
                                    huespedesHabitacion
                                );
                              },
                              0
                            );
                            const precioTrasladoHabitacion =
                              mostrarTraslados && tipoTraslado != null
                                ? calculateTransferPrice(
                                    habitaciones?.hotel?.city,
                                    currentCurrency,
                                    tipoTraslado,
                                    huespedesHabitacion,
                                    hotelIdNumero
                                  )
                                : 0;
                            const precioMascotasHabitacion =
                              (mostrarMascotas ? cantidadMascotas : 0) *
                              getMascotaPrecio(currentCurrency);
                            setDatohabitacion((prevState) => [
                              ...prevState,
                              {
                                exentoIVA: esHotelExentoIVA,
                                incluirTraslado: mostrarTraslados, // Booleano que indica si se seleccionó traslado
                                tipoTraslado: mostrarTraslados
                                  ? tipoTraslado
                                  : null, // El tipo específico de traslado
                                tourSeleccionado: selectedTours,
                                plandealimentacion:
                                  planDeAlimentacionFormateado,
                                roomId: dato.roomId,
                                checkin: checkin,
                                checkout: checkout,
                                nights: rangosfechas.nights,
                                imgH: idRooms[habitaciones.hotel.id][
                                  dato.roomId
                                ],
                                huespedes: adultos + ninos,
                                precio: calculateTotalPrice(
                                  conDescuentoHospedaje(
                                    dato.products?.find((product) =>
                                      regexSeleccionado.test(product.roomName) ||
                                      regexSeleccionado.test(product.rateDescription)
                                    )?.baseRate?.[
                                      currentCurrency == "USD"
                                        ? "amountBeforeTaxUSD"
                                        : "amountBeforeTax"
                                    ],
                                    descuentoHospedaje
                                  ) || "Sin precio disponible",
                                  selectedTours,
                                  currentCurrency,
                                  ninos + adultos,
                                  habitaciones?.hotel?.city,
                                  tipoTraslado,
                                  cantidadMascotas // Add this parameter
                                ),
                                precioBase: conDescuentoHospedaje(
                                  dato.products?.find((product) =>
                                    regexSeleccionado.test(product.roomName) ||
                                    regexSeleccionado.test(product.rateDescription)
                                  )?.baseRate?.[
                                    currentCurrency == "USD"
                                      ? "amountBeforeTaxUSD"
                                      : "amountBeforeTax"
                                  ],
                                  descuentoHospedaje
                                ) || "Sin precio disponible",
                                NombreH: dato.roomName,
                                beds: obtenerBedsPorTipoHabitacion(dato.roomName),
                                hotelid: habitaciones?.hotel?.roomcloud_id,
                                ciudad: habitaciones?.hotel?.city,
                                hotelidAutocore: habitaciones?.hotel?.id,
                                rateId: dato.products?.find((product) =>
                                  regexSeleccionado.test(product.roomName) || 
                                  regexSeleccionado.test(product.rateDescription)
                                )?.rateId,
                                trm: dato.products?.find((product) =>
                                  regexSeleccionado.test(product.roomName) ||
                                  regexSeleccionado.test(product.rateDescription)
                                )?.trm,
                                mascotas: mostrarMascotas ? cantidadMascotas : 0,
                                precioBaseHabitacion: basePrecioValido
                                  ? precioHabitacionTotal
                                  : 0,
                                precioNocheHabitacion: basePrecioValido
                                  ? precioNocheHabitacion
                                  : 0,
                                precioHabitacion: basePrecioValido
                                  ? precioHabitacionTotal
                                  : 0,
                                precioToursHabitacion,
                                precioTrasladoHabitacion,
                                precioMascotasHabitacion,
                              },
                            ]);
                            setcontadorHabitaciones(
                              (prevCount) => prevCount + 1
                            );
                          }
                        }}
                        disabled={
                          quintuple[habitaciones?.hotel?.id] &&
                          habitacionesRestringidas.includes(dato.roomName) &&
                          (() => {
                            // Contar cuántas habitaciones de este tipo específico ya están seleccionadas
                            const habitacionesDelMismoTipo = datohabitacion.filter(
                              (hab) => hab.roomId === dato.roomId
                            ).length;
                            return habitacionesDelMismoTipo >= obtenerLimiteHabitaciones(dato.roomName, dato.count);
                          })()
                        }
                        onMouseOver={() => {
                          if (
                            quintuple[habitaciones?.hotel?.id] &&
                            habitacionesRestringidas.includes(dato.roomName) &&
                            (() => {
                              // Contar cuántas habitaciones de este tipo específico ya están seleccionadas
                              const habitacionesDelMismoTipo = datohabitacion.filter(
                                (hab) => hab.roomId === dato.roomId
                              ).length;
                              return habitacionesDelMismoTipo >= obtenerLimiteHabitaciones(dato.roomName, dato.count);
                            })()
                          ) {
                            setTooltipActivo(dato.roomId); // Activa el tooltip solo para este botón
                          }
                        }}
                        onMouseOut={() => setTooltipActivo(null)} // Desactiva el tooltip al salir
                      >
                        Seleccionar
                      </button>

                      {/* Tooltip SOLO para este botón */}
                      {tooltipActivo === dato.roomId && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "120%", // Posiciona el tooltip arriba del botón
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "black",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            fontSize: "12px",
                            whiteSpace: "nowrap",
                            zIndex: 1000,
                          }}
                        >
                          Límite de habitaciones alcanzado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
          <div
            className={`${styles.reservation} ${styles.reservationLayout}`}
          >
            <div className={styles.reservationHeader}>
              <h3>Reserva</h3>
              <hr />
              <br />
              <h3>{getHotelName(habitaciones?.hotel)}</h3>
              <p>
                {checkin} <i className={"fas fa-arrow-right"}></i> {checkout}
              </p>
              <h4> ({rangosfechas.nights} noches )</h4>
              <br />
              <hr />
            </div>

            <div className={styles.reservationCount}>
              <h3>Habitaciones a reservar: {contadorHabitaciones}</h3>
            </div>

            <div className={styles.reservationSelectedList}>
            {datohabitacion.map((dato, index) => {
              return (
              <div key={index} style={{ position: "relative" }}>
                {" "}
                {/* Contenedor relativo para posicionar el botón */}
                <ul id="selected-rooms">
                  <br />
                  <p>{dato.NombreH}</p>

                  <h5>
                    {checkin} - {checkout}
                  </h5>
                  <h5>
                    {rangosfechas.nights} noches, {ninos + adultos} huespedes
                  </h5>

                  <h5>Tipo de plan: {planDeAlimentacionFormateado}</h5>
                  {ninos + adultos > 16 && (
                    <h5>
                      El beneficio de tourconductor aplica cuando el número de
                      habitaciones es igual o mayor a 15.
                    </h5>
                  )}
                  {dato.exentoIVA && (
                    <h5>Este hotel está exento del cobros de IVA.</h5>
                  )}

                  {tipoTraslado && (
                    <h5>
                      Traslado seleccionado: {" "}
                      {tipoTraslado === 'aeropuerto_hotel'
                        ? 'Aeropuerto al hotel'
                        : tipoTraslado === 'hotel_aeropuerto'
                        ? 'Hotel al aeropuerto'
                        : 'Aeropuerto al hotel | Hotel al aeropuerto'}
                    </h5>
                  )}
                  <h5>
                    {selectedTours.length > 0 && ""}
                    {selectedTours.map((tour, i) => (
                      <span key={i}>
                        {i > 0 && ", "}
                        {tour.title}
                      </span>
                    ))}
                  </h5>
                  <h5>Numero de mascotas: {cantidadMascotas}</h5>
                  <div style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                    <p style={{ margin: 0 }}>
                      Hospedaje ({rangosfechas.nights} {rangosfechas.nights === 1 ? "noche" : "noches"}):{" "}
                      {currentCurrency == "USD"
                        ? `${formatCurrency(dato.precioHabitacion)} USD`
                        : `${formatCurrency(dato.precioHabitacion)} COP`}
                    </p>
                  </div>
                  <h2 style={{ marginTop: "6px" }}>
                    {formatCurrency(Number(dato.precioHabitacion) || 0)}{" "}
                    {currentCurrency == "USD" ? "USD" : "COP"}
                  </h2>
                  <button
                    style={{
                      position: "absolute",
                      bottom: "80px", // Ajusta la posición vertical
                      left: "145px", // Ajusta la posición horizontal
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={(index) => {
                      handleDelete(index);
                      setcontadorHabitaciones((prevCount) =>
                        prevCount > 0 ? prevCount - 1 : 0
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ color: "#26547B" }}
                    />{" "}
                    {/* Icono de la caneca */}
                  </button>

                  <hr />
                </ul>
              </div>
            );
            })}
            {(() => {
              const huespedesMap = ninos + adultos;
              const precioToursRender = (selectedTours || []).reduce((total, tour) => {
                const precioTourRender = parseFloat(
                  currentCurrency === "USD" ? tour.preciousd : tour.preciocol
                );
                return total + (Number.isFinite(precioTourRender) ? precioTourRender : 0) * huespedesMap;
              }, 0);
              const precioTrasladoRender =
                mostrarTraslados && tipoTraslado != null
                  ? calculateTransferPrice(habitaciones?.hotel?.city, currentCurrency, tipoTraslado, huespedesMap, hotelIdNumero)
                  : 0;
              const precioMascotasRender =
                (mostrarMascotas ? cantidadMascotas : 0) * getMascotaPrecio(currentCurrency);
              if (
                precioToursRender <= 0 &&
                precioTrasladoRender <= 0 &&
                precioMascotasRender <= 0
              ) {
                return null;
              }
              return (
                <div
                  style={{
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                    border: "1px solid #d5dbe0",
                    borderRadius: "5px",
                    padding: "10px",
                    marginTop: "10px",
                  }}
                >
                  <strong style={{ color: "#26547B" }}>Extras de la reserva</strong>
                  {precioToursRender > 0 && (
                    <p style={{ margin: "4px 0 0 0" }}>
                      Tours:{" "}
                      {currentCurrency == "USD"
                        ? `${formatCurrency(precioToursRender)} USD`
                        : `${formatCurrency(precioToursRender)} COP`}
                    </p>
                  )}
                  {precioTrasladoRender > 0 && (
                    <p style={{ margin: "4px 0 0 0" }}>
                      Traslado:{" "}
                      {currentCurrency == "USD"
                        ? `${formatCurrency(precioTrasladoRender)} USD`
                        : `${formatCurrency(precioTrasladoRender)} COP`}
                    </p>
                  )}
                  {precioMascotasRender > 0 && (
                    <p style={{ margin: "4px 0 0 0" }}>
                      Mascotas ({cantidadMascotas}):{" "}
                      {currentCurrency == "USD"
                        ? `${formatCurrency(precioMascotasRender)} USD`
                        : `${formatCurrency(precioMascotasRender)} COP`}
                    </p>
                  )}
                </div>
              );
            })()}
            </div>

            <div className={styles.reservationFooter}>
            <button
              type="button"
              onClick={handleReservarClick}
              disabled={!puedeReservar || isSearchingFlights}
              data-tooltip-id="tooltip-generar-cotizacion"
              data-tooltip-content={
                !puedeReservar
                  ? datohabitacion.length === 0
                    ? "Selecciona las habitaciones que deseas reservar"
                    : "Selecciona más habitaciones hasta cubrir el número de adultos."
                  : "Crear una reserva personalizada para el cliente."
              }
              data-tooltip-place="left"
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                backgroundColor: (!puedeReservar || isSearchingFlights) ? "#d3d3d3" : "#26547B",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: (!puedeReservar || isSearchingFlights) ? "not-allowed" : "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease, transform 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#0056b3";
                  e.target.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#26547B";
                  e.target.style.transform = "scale(1)";
                }
              }}
              onMouseDown={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#003f7f";
                }
              }}
              onMouseUp={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#0056b3";
                }
              }}
            >
              {isSearchingFlights && (
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              )}
              {isSearchingFlights ? "Buscando vuelos..." : "Reservar ahora"}
            </button>
            <button
              type="button"
              onClick={handleCotizarClick}
              disabled={!puedeReservar || isSearchingFlights}
              data-tooltip-id="tooltip-generar-cotizacion"
              data-tooltip-content={
                !puedeReservar
                  ? datohabitacion.length === 0
                    ? "Selecciona habitaciones para generar una cotización"
                    : "Selecciona más habitaciones hasta cubrir el número de adultos."
                  : "Crear y enviar una cotización personalizada al cliente. El cliente podrá revisar todos los detalles, aceptar o rechazar la oferta directamente desde el enlace que recibirá."
              }
              data-tooltip-place="left"
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                backgroundColor: (!puedeReservar || isSearchingFlights) ? "#d3d3d3" : "#26547B",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: (!puedeReservar || isSearchingFlights) ? "not-allowed" : "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease, transform 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#0056b3";
                  e.target.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#26547B";
                  e.target.style.transform = "scale(1)";
                }
              }}
              onMouseDown={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#003f7f";
                }
              }}
              onMouseUp={(e) => {
                if (!(!puedeReservar || isSearchingFlights)) {
                  e.target.style.backgroundColor = "#0056b3";
                }
              }}
            >
              {isSearchingFlights && (
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              )}
              {isSearchingFlights ? "Buscando vuelos..." : "Generar cotización"}
            </button>
            <Tooltip
              id="tooltip-generar-cotizacion"
              className="custom-tooltip"
            />
            <UpgradeModal
              isOpen={showUpgradeModal}
              onClose={handleUpgradeClose}
              upgrades={upgradeOptionsList}
              onSelectUpgrade={handleUpgradeSelect}
              onContinue={handleUpgradeContinue}
            />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cid;
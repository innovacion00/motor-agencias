import { useState, useEffect, useMemo } from "react";
import { disponibilidad } from "../stores/disponibilidad";
import Swal from "sweetalert2";
import styles from "../../public/styles/componentesearch.module.css";
import DropdownSearch from "./DropdownSearch";
import PaqueteVueloHotelCard from "./PaqueteVueloHotelCard";
import { nightsStore } from "../stores/disponibilidad";
import { currency } from "../stores/divisas";
import { useStore } from "@nanostores/react";
import CurrencySelector from "./Cambiardivisas";
import {
  findMinBaseRate,
  getHotelSugerido,
  getPrimerVuelo,
  calcularTotalPaquete,
} from "../utils/paqueteVueloHotel";
import { aplicaDescuentoHospedaje } from "../utils/descuentoHospedaje";

//UseState
const BusquedaCartagena = () => {
  
  const [hotelesDisponibles, setHotelesDisponibles] = useState([]);
  const currentCurrency = useStore(currency); // COP o USD
  const [nochesyedades1, setnochesyedades] = useState({});
  const [infoVuelo, setinfoVuelo] = useState()
  const [dataVuelo, setDataVuelo] = useState(null);
  const [categoria, setcategoria] = useState();
  const [Ciudad, setCiudad] = useState("Cartagena de Indias");
  const [codigoCiudad, setCodigoCiudad] = useState(null);
  const [rotacionHotel, setRotacionHotel] = useState(0);
  const [descuentoHospedaje, setDescuentoHospedaje] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  //Objeto de imagenes  para las fachadas
  const hotelImages = {
    9: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelMarina.webp", //marina
    1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/fachada-azuan.jpg",
    6: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotelavexi.jpg", //avexi
    7: "https://www.gehsuites.com/images/fachada_hotel_boagrande.jpg", //bocagrande
    4: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_aixo.jpg", //aixo
    5: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_abi.jpg", //abi
    3: "https://www.gehsuites.com/recursos/imagenes/hotels/hotel-madisson-inn.jpg", //madison
    10: "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill", //windsor
    8: "https://www.gehsuites.com/recursos/imagenes/hotels/hotel-rodadero-inn.jpg", //rodadero
    2: "https://www.gehsuites.com/images/fachada_1525.jpg", //1525
    48: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg", //axis
    44: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/hotel_sansiraka.jpg", //sansiraka
    41: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachadazulita.jpg", //Zulita
    56: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/fachada_boquilla.jpg", // Boquilla,
    123:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/card_salguero.jpg", //Salguero
    124:"",
    164:"https://space-img.sfo3.digitaloceanspaces.com/Agencias/lobby_marques.jpg"//Marquez
  };

  //Objeto con los arreglos de los iconos
  const hotelIcons = {
    9: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    1: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    6: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    7: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    4: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    5: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    3: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    10: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    8: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    2: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    ],
    48: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    44: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    41: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    56: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    123: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
    164: [
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
    ],
  };

  const cityMap = {
    CARTAGENA: "Cartagena de Indias",
    BOGOTA: "Bogotá",
    SANTA_MARTA: "Santa marta",
  };

  // Función para normalizar el nombre del hotel
  const getHotelName = (hotel) => {
    if (hotel.id === 123) {
      return "Hotel Playa Salguero";
    }
    return hotel.name;
  };

  // Función para formatear valores como moneda colombiana
  const formatToCurrency = (amount) => {
    if (typeof amount !== "number") return "N/A";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Función para saber si aplica el descuento especial del 5% en Axis (id: 48)
  const hasAxisDecemberDiscount = (hotelId, dateRange) => {
    if (hotelId !== 48 || !dateRange?.startDate) return false;

    const checkIn = new Date(dateRange.startDate);
    const month = checkIn.getMonth(); // 0 = enero, 11 = diciembre
    const day = checkIn.getDate();

    // Fechas válidas: 4, 5, 6, 11 y 14 de diciembre (cualquier año)
    const validDays = [4, 5, 6, 11, 14];

    return month === 11 && validDays.includes(day);
  };

  // Precio mínimo del hotel, ya formateado. El cálculo vive en el util para que la
  // card de paquete y esta lista nunca muestren precios distintos del mismo hotel.
  const findMinBaseRateFormateado = (data) => {
    const min = findMinBaseRate(data, currentCurrency, descuentoHospedaje);
    return min ? formatToCurrency(min.amount) : "*Sin Disponibilidad*";
  };

  //Funcion para almacenar la cantidad de adultos
  const cantAdultos = (data) => {
    const adult =
      data.reduce((acumulador, tAdults) => acumulador + tAdults.adults, 0) || 0;

    if (typeof window !== 'undefined') {
      localStorage.setItem("cantAdultos", adult);
    }
    return adult;
  };

  //Funcion para almacenar la cantidad de Niños
  const cantNinos = (data) => {
    const ninos =
      data.reduce((acumulador, tChildren) => {
        if (tChildren.children_ages) {
          return acumulador + tChildren.children_ages.split(",").length;
        }
        return acumulador;
      }, 0) || 0;

    if (typeof window !== 'undefined') {
      localStorage.setItem("cantNinos", ninos);
    }
    return ninos;
  };

  // Función para verificar si la fecha está entre el 01 y 11 de enero de 2026
  const isDateInRange = (date) => {
    if (!date) return false;
    const checkDate = new Date(date);
    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-01-11");
    // Verificar si la fecha está en el rango (incluyendo los límites)
    return checkDate >= startDate && checkDate <= endDate;
  };

  // Usar useEffect para cargar datos de localStorage y la store
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const category = JSON.parse(localStorage.getItem("datosUsuario"));
    setcategoria(category);
    const storedCity = localStorage.getItem("selectedCity");
    if (storedCity) {
      const transformedCity = cityMap[storedCity] || "Ciudad desconocida";
      setCiudad(transformedCity);
      setCodigoCiudad(storedCity);
    }

    const rotacion = parseInt(localStorage.getItem("rotacionHotelSugerido"), 10);
    setRotacionHotel(Number.isFinite(rotacion) ? rotacion : 0);
    setDescuentoHospedaje(aplicaDescuentoHospedaje());
    const datosVuelo = JSON.parse(localStorage.getItem("datosDelVuelo"));
    setinfoVuelo(datosVuelo);

    // Solo se usa la disponibilidad aérea si corresponde a esta búsqueda: el buscador
    // guarda en dataVueloBusquedaId el timestamp del datosDelVuelo con el que consultó.
    const busquedaVueloId = localStorage.getItem("dataVueloBusquedaId");
    if (busquedaVueloId && datosVuelo?.timestamp === busquedaVueloId) {
      setDataVuelo(JSON.parse(localStorage.getItem("dataVuelo")));
    }

    const disponibilidadLocal = JSON.parse(localStorage.getItem("data"));
    const nochesyedades = JSON.parse(localStorage.getItem("nochesyedades"));
    setnochesyedades(nochesyedades);
    if (disponibilidadLocal) {
      disponibilidad.set(disponibilidadLocal);
      setHotelesDisponibles(disponibilidadLocal);
    }
  }, []);
  console.log(hotelesDisponibles);

  const regex =
    categoria?.agencia.category == 0
      ? /\[Booking connect Neto\]/i
      : /\[Booking connect Mayorista\]/i; // Expresión regular para validar el roomName

  const esVueloHotel = infoVuelo?.active === true || infoVuelo?.activado === true;

  // Paquete destacado: el hotel sugerido para la ciudad + el primer vuelo de la
  // respuesta. Se recalcula al cambiar de divisa porque el total mezcla ambos precios.
  const paquete = useMemo(() => {
    if (!esVueloHotel || hotelesDisponibles.length === 0) return null;

    const hotelBarato = getHotelSugerido(
      hotelesDisponibles,
      currentCurrency,
      codigoCiudad,
      rotacionHotel,
      descuentoHospedaje
    );
    const vuelo = getPrimerVuelo(dataVuelo);
    if (!hotelBarato || !vuelo) return null;

    const personas = (nochesyedades1?.layout || []).reduce(
      (total, room) =>
        total + (room.adults || 0) + (room.children_ages?.length || 0),
      0
    );

    const precios = calcularTotalPaquete({
      precioHotel: hotelBarato.precio,
      precioVueloUsd: vuelo.totalPriceUsd,
      currency: currentCurrency,
      trm: hotelBarato.trm,
      personas,
    });

    return {
      hotel: hotelBarato.hotel,
      vuelo,
      personas: personas || 1,
      precios: { ...precios, precioHotel: hotelBarato.precio },
    };
  }, [
    esVueloHotel,
    hotelesDisponibles,
    dataVuelo,
    currentCurrency,
    nochesyedades1,
    codigoCiudad,
    rotacionHotel,
    descuentoHospedaje,
  ]);

  return (
    <>
      <div className={styles.search_form_wrapper}>
        <DropdownSearch client:load />
      </div>
      <br />
      <div className={styles.container}>    
        <div className={styles.breadcrumb}>
          <a href="/">Inicio</a> / <a href="/">Resultados de búsqueda</a>
        </div>

     
<br />
        {esVueloHotel &&
          (paquete ? (
            <PaqueteVueloHotelCard
              hotelId={paquete.hotel.id}
              hotelNombre={getHotelName(paquete.hotel)}
              hotelImagen={hotelImages[paquete.hotel.id]}
              nights={nochesyedades1.nights}
              vuelo={paquete.vuelo}
              precios={paquete.precios}
              currency={currentCurrency}
              personas={paquete.personas}
              formatPrecio={formatToCurrency}
            />
          ) : (
            <div className={styles.aviso_sin_vuelo}>
              No encontramos vuelos para estas fechas. Puedes continuar reservando
              solo el alojamiento.
            </div>
          ))}

        <div className={styles.title} id="resultados">Resultados {Ciudad}</div>
        {/* <div className={styles.filter}>
          <select>
            <option>Menor precio</option>
          </select>
        </div> */}

        {/* Mostrar los hoteles disponibles */}
        {hotelesDisponibles.length > 0 ? (
          hotelesDisponibles
            .filter(hotel => hotel.hotel.id !== 2 && hotel.hotel.id !== 41 && hotel.hotel.id !== 7) // Filter out hotels with IDs 2, 45 and 77
            .map((tipo) => (
            <div className={styles.hotel} key={tipo.hotel.id}>
              {hasAxisDecemberDiscount(tipo.hotel.id, nochesyedades1?.dateRange) && (
                <div className={styles.discount}>
                  5%
                </div>
              )}
              <img
                alt="Imagen del hotel"
                height="200"
                src={hotelImages[tipo.hotel.id]} //imagen fachada del hotel
                width="300"
              />
              <div className={styles.hotel_info}>
                <h3>
                  {getHotelName(tipo.hotel)}{" "}
                  <a href={`/hoteles/${tipo.hotel.id}`}>Ver detalle de hotel</a>
                </h3>
                <div className={styles.icons}>
                  {hotelIcons[tipo.hotel.id]?.map((iconUrl, index) => (
                    <img //imagenes iconos
                      key={index}
                      src={iconUrl}
                      alt={`Servicio ${index + 1}`}
                      className={styles.icon_image}
                    />
                  ))}
                </div>
                <div className={styles.specs}>
                  {" "}
                  {nochesyedades1.nights} Noches{" "}
                  {cantAdultos(tipo.availability)} Adultos{" "}
                  {cantNinos(tipo.availability) || 0} Niños
                </div>
                  {hasAxisDecemberDiscount(tipo.hotel.id, nochesyedades1?.dateRange) && (
                    <span style={{ color: "#a0522d", fontSize: "14px", fontWeight: "bold" }}>
                      Descuento especial del 5% en estas fechas
                    </span>
                  )}
                <div className={styles.price}>
                  Desde:{" "}
                  {`${findMinBaseRateFormateado(tipo.availability)} ${currentCurrency}`}{" "}
                  | Incluye desayuno y seguro
                </div>
                {/* Mensaje especial para Bocagrande (id: 7) entre el 01 y 11 de enero de 2026 */}
                {/* Para eliminar este mensaje, simplemente elimina o comenta el siguiente bloque condicional */}
                {(tipo.hotel.id === 7 || tipo.hotel.id === 9 || tipo.hotel.id === 1 || tipo.hotel.id === 6) && 
                 nochesyedades1?.dateRange?.startDate && 
                 isDateInRange(nochesyedades1.dateRange.startDate) && (
                  <div style={{ 
                    marginTop: "8px", 
                    color: "#d32f2f", 
                    fontSize: "14px",
                    fontStyle: "italic"
                  }}>
                    Estas habitaciones solo están disponibles para dos noches o más
                  </div>
                )}
                <a href={`/hoteles/${tipo.hotel.id}`}>
                  <button>Ver disponibilidad</button>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div>No hay hoteles disponibles en este momento.</div>
        )}
      </div>
    </>
  );
};

export default BusquedaCartagena;

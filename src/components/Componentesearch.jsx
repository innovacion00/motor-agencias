import { useState, useEffect } from "react";
import { disponibilidad } from "../stores/disponibilidad";
import Swal from "sweetalert2";
import styles from "../../public/styles/componentesearch.module.css";
import DropdownSearch from "./DropdownSearch";
import { nightsStore } from "../stores/disponibilidad";
import { currency } from "../stores/divisas";
import { useStore } from "@nanostores/react";
import CurrencySelector from "./Cambiardivisas";

//UseState
const BusquedaCartagena = () => {
  
  const [hotelesDisponibles, setHotelesDisponibles] = useState([]);
  const currentCurrency = useStore(currency); // COP o USD
  const [nochesyedades1, setnochesyedades] = useState({});
  const [infoVuelo, setinfoVuelo] = useState()
  const [categoria, setcategoria] = useState();
  const [Ciudad, setCiudad] = useState("Cartagena de Indias");
  
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
    124:""
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

  // Función existente modificada
  const findMinBaseRate = (data) => {
    let minAmount = Infinity;

    data.forEach((entry) => {
      entry.available_rooms.forEach((room) => {
        room.products.forEach((product) => {
          const amount =
            currentCurrency == "USD"
              ? product.baseRate.amountBeforeTaxUSD // Antes de impuestos USD
              : product.baseRate.amountBeforeTax; // Antes de impuestos COP
          if (amount < minAmount) {
            minAmount = amount;
          }
        });
      });
    });

    return minAmount === Infinity
      ? "*Sin Disponibilidad*"
      : formatToCurrency(minAmount); // Formatear como moneda colombiana
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
    }
    const datosVuelo = JSON.parse(localStorage.getItem("datosDelVuelo"));
    setinfoVuelo(datosVuelo);
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

      {(infoVuelo?.active === true || infoVuelo?.activado === true) && (
      <div className={styles.stepper}>
  <div className={styles.step}>
    <div className={styles.stepnumberActive}>1</div>
    <div className={styles.steptitleActive}>Alojamiento</div>
    <div className={styles.stepcontentActive}>
      Seleccione el alojamiento <br />
      {nochesyedades1.nights} noches, {hotelesDisponibles[0]?.availability[0]?.adults || 0} adultos, {cantNinos(hotelesDisponibles[0]?.availability || [])} niños
    </div>
  </div>
  <div className={styles.step}>
    <div className={styles.stepnumber}>2</div>
    <div className={styles.steptitle}>Vuelo</div>
    <div className={styles.stepcontent}>
      {infoVuelo?.origin} ⇆ {infoVuelo?.destinationName}<br/>
      {nochesyedades1?.dateRange ? 
        `${formatDate(nochesyedades1.dateRange.startDate)} - ${formatDate(nochesyedades1.dateRange.endDate)}` : 
        'Fechas no seleccionadas'}
    </div>
  </div>
  <div className={styles.step}>
    <div className={styles.stepnumber}>3</div>
    <div className={styles.steptitle}>Adicionales</div>
    <div className={styles.stepcontent}>
      ¡Disfruta al máximo tu viaje!
      Incluye opciones de traslado, tours, y planes de alimentación entre otros adicionales
    </div>
  </div>
</div>
      )}
<br />
        <div className={styles.title}>Resultados {Ciudad}</div>
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
                  {`${findMinBaseRate(tipo.availability) !== Infinity
                    ? findMinBaseRate(tipo.availability)
                    : "Sin Disponibilidad"} ${currentCurrency}`}{" "}
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

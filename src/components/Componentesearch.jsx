import { useState, useEffect } from "react";
import { disponibilidad } from "../stores/disponibilidad";
import Swal from "sweetalert2";
import styles from "../../public/styles/componentesearch.module.css";
import DropdownSearch from "./DropdownSearch";
import { nightsStore } from "../stores/disponibilidad";

const BusquedaCartagena = () => {
  const [hotelesDisponibles, setHotelesDisponibles] = useState([]);
  const [nochesyedades1, setnochesyedades] = useState({});
  const [Ciudad, setCiudad] = useState("Cartagena de Indias");

  const hotelImages = {
    9: "https://www.gehsuites.com/images/portada_marian_suites.jpg", //marina
    6: "https://www.gehsuites.com/images/fachada_avexi.jpg", //avexi
    7: "https://www.gehsuites.com/images/fachada_hotel_boagrande.jpg", //bocagrande
    4: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_aixo.jpg", //aixo
    5: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_abi.jpg", //abi
    3: "https://www.gehsuites.com/images/fachada-madison.jpg", //madison
    10: "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill", //windsor
    8: "https://www.gehsuites.com/images/fachada_rodadero_1.jpg", //rodadero
    2: "https://www.gehsuites.com/images/fachada_1525.jpg", //1525
    100: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg", //axis
    101: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg", //sansiraka
  };

  const hotelIcons = {
    9: ["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",],
    6: ["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
    7: ["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png" ],
    4:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
    5:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
    3:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
    10:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
    8:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",],
    2:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",],
    100:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",],
    101:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",]
  };

  // Usar useEffect para cargar datos de localStorage y la store
  useEffect(() => {
    // Recuperar la ciudad desde el localStorage
    const storedCity = localStorage.getItem("selectedCity");
    if (storedCity) {
      setCiudad(storedCity);
    }
    if (typeof window !== "undefined") {
      
      const disponibilidadLocal = JSON.parse(localStorage.getItem("data"));
      const nochesyedades = JSON.parse(localStorage.getItem("nochesyedades"));
      setnochesyedades(nochesyedades);
      if (disponibilidadLocal) {
        disponibilidad.set(disponibilidadLocal);
        setHotelesDisponibles(disponibilidadLocal);
        console.log("Datos recuperados de LocalStorage:", disponibilidadLocal);
      } else {
        console.log("No hay datos disponibles en LocalStorage.");
      }
    }
  }, []);

  return (
    <>
      <title>Resultados Cartagena de Indias</title>

      <div className={styles.search_form_wrapper}>
        <DropdownSearch client:load />
      </div>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <a href="/Bookingconnect">Inicio</a> / <a href="#">Resultados de búsqueda</a>
        </div>

        <div className={styles.title}>Resultados {Ciudad}</div>
        <div className={styles.filter}>
          <select>
            <option>Menor precio</option>
          </select>
        </div>

        {/* Mostrar los hoteles disponibles */}
        {hotelesDisponibles.length > 0 ? (
          hotelesDisponibles.map((tipo) => (
            <div className={styles.hotel} key={tipo.hotel.id}>
              <img
                alt="Imagen del hotel"
                height="200"
                src={hotelImages[tipo.hotel.id]}  //imagen fachada del hotel 
                width="300"
              />
              <div className={styles.hotel_info}>
                <h3>
                  {tipo.hotel.name}{" "}
                  <a href={`/hoteles/${tipo.hotel.id}`}>Ver detalle de hotel</a>
                </h3>
              <div className={styles.icons}>
                  {hotelIcons[tipo.hotel.id]?.map((iconUrl, index) => (
                    <img                      //imagenes iconos 
                      key={index}
                      src={iconUrl}
                      alt={`Servicio ${index + 1}`}
                      className={styles.icon_image}
                    />
                  ))}
                </div>
                <div className={styles.specs}> {nochesyedades1.nights} Noches {" "}
                  {tipo.availability.reduce(
                    (acumulador, tAdults) => acumulador + tAdults.adults,0) || 0}{" "} Adultos {" "}{" "}
                    {tipo.children_ages || 0} Niños
                </div>
                <div className={styles.price}>
                  Desde: $$$ | Incluye impuestos
                </div>
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

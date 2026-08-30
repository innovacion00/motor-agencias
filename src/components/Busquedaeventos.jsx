import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../public/styles/BusquedaeventosB.css";
import DropdownSearchEventos from "./DropdownSearchEventos";

const hotelesBogota = [
  {
    nombre: "Hotel Windsor House",
    direccion: "Chapinero, Calle 95 #9-97, Bogotá, Colombia",
    imagen:
      "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
    habitaciones: "118",
    salones: "9",
    capacidadPersonas: "250",
    id: 1,
    ciudad: "Bogota",
  },
  {
    nombre: "Hotel Madisson Inn",
    direccion: "Barrio el Chico , Cra 18 #93 - 97, Bogotá, Colombia.",
    imagen: "https://www.gehsuites.com/images/fachada-madison.jpg",
    habitaciones: "60",
    salones: "6",
    capacidadPersonas: "90",
    id: 2,
    ciudad: "Bogota",
  },
];

const hotelesSantaMarta = [
  {
    nombre: "Hotel Axis",
    direccion: "Cra. 3 #10-14, El Rodadero, Gaira, Santa Marta, Magdalena",
    imagen: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg",
    habitaciones: "98",
    salones: "1",
    capacidadPersonas: "100",
    id: 1,
    ciudad: "SantaMarta",
  },
  {
    nombre: "Hotel Sansiraka",
    direccion: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena",
    imagen: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
    habitaciones: "60",
    salones: "1",
    capacidadPersonas: "120",
    id: 2,
    ciudad: "SantaMarta",
  },
];

const CIUDADES = {
  Bogota: {
    hoteles: hotelesBogota,
    titulo: "Resultados Bogotá",
    rutaResultados: "/eventosbogota",
    rutaDetalle: "/infowindsor",
  },
  SantaMarta: {
    hoteles: hotelesSantaMarta,
    titulo: "Resultados Santa Marta",
    rutaResultados: "/eventosSantamarta",
    rutaDetalle: "/infosansiraka",
  },
};

const ResultadosCartagena = ({ ciudad = "Bogota" }) => {
  const config = CIUDADES[ciudad] || CIUDADES.Bogota;
  const [datoshotel, setdatoshotel] = useState([]);

  useEffect(() => {
    setdatoshotel([]);
  }, []);

  //FUNCION PARA ENVIAR DATOS AL LOCALSTORAGE Y REDIRECCIONAR

  const handleSeleccionar = (hotel) => {
    const nuevoDatoHotel = {
      nombrehotel: hotel.nombre,
      imagendelhotel: hotel.imagen,
      direccionhotel: hotel.direccion,
      saloneshotel: hotel.salones,
      habitacion: hotel.habitaciones,
      personas: hotel.capacidadPersonas,
      ciudad: hotel.ciudad,
    };

    localStorage.setItem("infohotel", JSON.stringify(nuevoDatoHotel));

    window.location.href = "/solicitudpresupuesto";
  };

  return (
    <>
      <div className="search-form-warpper">
        <DropdownSearchEventos client:load />
      </div>
      <div className="container">
        <div className="breadcrumb">
          <a href="/eventos">Inicio</a> / <a href={config.rutaResultados}>Resultados de búsqueda</a>
        </div>
        <h1>{config.titulo}</h1>
        {config.hoteles.map((hotel, index) => (
          <div key={index} className="hotel-card">
            <img
              src={hotel.imagen}
              alt={hotel.nombre}
              width="300"
              height="200"
            />
            <div className="hotel-info">
              <h2>{hotel.nombre}</h2>
              <p>{hotel.direccion}</p>
              <div className="details">
                <div className="detail-box">
                  <i className="fas fa-bed"></i> {hotel.habitaciones}{" "}
                  Habitaciones
                </div>
                <div className="detail-box">
                  <i className="fas fa-door-open"></i> {hotel.salones} Salones
                </div>
                <div className="detail-box">
                  <i className="fas fa-users"></i> {hotel.capacidadPersonas}{" "}
                  pers capacidad máxima
                </div>
              </div>
              <div className="links">
                <a href={config.rutaDetalle}>Ver detalle</a>
                <button
                  className="quote-btn"
                  onClick={() => handleSeleccionar(hotel)}
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ResultadosCartagena;
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../public/styles/BusquedaeventosB.css"; // Asegúrate de tener los estilos en un archivo separado
import DropdownSearchEventos from "./DropdownSearchEventos";

const hoteles = [
  {
    nombre: "Hotel Windsor House",
    direccion: "Chapinero, Calle 95 #9-97, Bogotá, Colombia",
    imagen:
      "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
    habitaciones: "118",
    salones: "9",
    capacidadPersonas: "250",
    id: 1,
    ciudad:"Bogota"
  },
  {
    nombre: "Hotel Madisson Inn",
    direccion: "Barrio el Chico , Cra 18 #93 - 97, Bogotá, Colombia.",
    imagen: "https://www.gehsuites.com/images/fachada-madison.jpg",
    habitaciones: "60",
    salones: "6",
    capacidadPersonas: "90",
    id: 2,
    ciudad:"Bogota"
  },
];

export const ResultadosCartagena = () => {
  const [datoshotel, setdatoshotel] = useState([]);

  useEffect(() => {
    setdatoshotel([]);
  }, []);

  //FUNCION PARA ENVIAR DATOS AL LOCALSTORAGE Y REDIRECCIONAR

  const handleSeleccionar = (hotel) => {
    // Crear el objeto con la info del hotel
    const nuevoDatoHotel = {
      nombrehotel: hotel.nombre,
      imagendelhotel: hotel.imagen,
      direccionhotel: hotel.direccion,
      saloneshotel: hotel.salones,
      habitacion: hotel.habitaciones,
      personas: hotel.capacidadPersonas,
      ciudad: hotel.ciudad,
    };

    // Guardar en el localStorage
    localStorage.setItem("infohotel", JSON.stringify(nuevoDatoHotel));

    // Redireccionar
    window.location.href = "/solicitudpresupuesto";
  };

  return (
    <>
      <div className="search-form-warpper">
        <DropdownSearchEventos client:load />
      </div>
      <div className="container">
        <div className="breadcrumb">
          <a href="/eventos">Inicio</a> / <a href="/eventosbogota">Resultados de búsqueda</a>
        </div>
        <h1>Resultados Bogotá</h1>
        {hoteles.map((hotel, index) => (
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
                <a href="#">Ver detalle</a>
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

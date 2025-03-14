import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../public/styles/BusquedaeventosB.css"; // Asegúrate de tener los estilos en un archivo separado
import DropdownSearchEventos from "./DropdownSearchEventos";
const hoteles = [
  {
    nombre: "Hotel Axis",
    direccion: "Cra. 3 #10-14, El Rodadero, Gaira, Santa Marta, Magdalena",
    imagen: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg",
    habitaciones:"98",
    salones: "1",
    capacidadPersonas:"100",
    id: 1,
    ciudad:"SantaMarta"
  },
  {
    nombre: "Hotel Sansiraka",
    direccion: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena",
    imagen: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
    habitaciones:"60",
    salones: "1",
    capacidadPersonas:"120",
    id: 2,
    ciudad:"SantaMarta"
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
          <a href="#">Inicio</a> / <a href="#">Resultados de búsqueda</a>
        </div>
        <h1>Resultados Santa Marta</h1>
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

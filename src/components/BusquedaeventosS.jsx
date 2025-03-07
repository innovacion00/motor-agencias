import React from "react";
import "../../public/styles/BusquedaeventosB.css"; // Asegúrate de tener los estilos en un archivo separado
import DropdownSearch from "./DropdownSearch";

const hoteles = [
  {
    nombre: "Hotel Axis",
    direccion: "Cra. 3 #10-14, El Rodadero, Gaira, Santa Marta, Magdalena",
    imagen: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg",
    habitaciones:"98",
    salones: "1",
    capacidadPersonas:"100",
  },
  {
    nombre: "Hotel Sansiraka",
    direccion: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena",
    imagen: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
    habitaciones:"60",
    salones: "1",
    capacidadPersonas:"120",
},
  
];

const ResultadosCartagena = () => {
  return (
  <>
  <div className="search-form-warpper">
    <DropdownSearch client:load/>
  </div>
    <div className="container">
      <div className="breadcrumb">
        <a href="#">Inicio</a> / <a href="#">Resultados de búsqueda</a>
      </div>
      <h1>Resultados Santa marta</h1>
      {hoteles.map((hotel, index) => (
        <div key={index} className="hotel-card">
          <img src={hotel.imagen} alt={hotel.nombre} width="300" height="200" />
          <div className="hotel-info">
            <h2>{hotel.nombre}</h2>
            <p>{hotel.direccion}</p>
            <div className="details">
              <div className="detail-box">
                <i className="fas fa-bed"></i> {hotel.habitaciones} Habitaciones
              </div>
              <div className="detail-box">
                <i className="fas fa-door-open"></i> {hotel.salones} Salones
              </div>
              <div className="detail-box">
                <i className="fas fa-users"></i> {hotel.capacidadPersonas} pers Capacidad máxima
              </div>
            </div>
            <div className="links">
              <a href="#">Ver detalle</a>
              <button className="quote-btn">Seleccionar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default ResultadosCartagena;

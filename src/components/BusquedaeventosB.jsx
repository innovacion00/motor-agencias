import React from "react";
import "../../public/styles/BusquedaeventosB.css"; // Asegúrate de tener los estilos en un archivo separado
import DropdownSearch from "./DropdownSearch";

const hoteles = [
  {
    nombre: "Hotel Windsor",
    direccion: "Chapinero, Calle 95 #9-97, Bogotá, Colombia",
    imagen: "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
  },
  {
    nombre: "Hotel Madisson Inn",
    direccion: "Barrio el Chico , Cra 18 #93 - 97, Bogotá, Colombia.",
    imagen: "https://www.gehsuites.com/images/fachada-madison.jpg",
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
      <h1>Resultados Bogotá</h1>
      {hoteles.map((hotel, index) => (
        <div key={index} className="hotel-card">
          <img src={hotel.imagen} alt={hotel.nombre} width="300" height="200" />
          <div className="hotel-info">
            <h2>{hotel.nombre}</h2>
            <p>{hotel.direccion}</p>
            <div className="details">
              <div className="detail-box">
                <i className="fas fa-bed"></i> 200 Habitaciones
              </div>
              <div className="detail-box">
                <i className="fas fa-door-open"></i> 2 Salones
              </div>
              <div className="detail-box">
                <i className="fas fa-users"></i> 200 pers Capacidad máxima
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

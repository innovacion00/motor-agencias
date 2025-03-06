import React, { useEffect, useState, useRef } from "react";

import "../../public/styles/UserDashboardEventos.css"; // Archivo CSS externo para mantener el código limpio

const UserDashboard = () => {
  return (
    <div className="main-container">
      <div className="top-bar">
        <h1>Tablero de usuario</h1>
      </div>
      <div className="navigation-tabs">
        <div className="nav-item active">Gestión de solicitudes</div>
        <div className="nav-item">Configuración</div>
      </div>
      <div className="actions">
        {/* <h3>Gestion de solicitudes</h3> */}
        <button className="btn create">
          <i className="fas fa-plus"></i> Crear nueva cotización
        </button>
        <button className="btn filter">
          <i className="fas fa-filter"></i> Filtros
        </button>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="Buscar" />
        <i className="fas fa-search"></i>
      </div>
      <div className="content-section">
        {["Pendientes", "En proceso", "Enviadas"].map((category, index) => (
          <div key={index} className="column">
            <h2>{category}</h2>
            <div className="count"></div>
            {/* {[...Array(1)].map((_, idx) => (
              
            ))} */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
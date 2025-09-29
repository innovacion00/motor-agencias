import React, { useEffect, useState } from "react";
import "../components/styles/cotizaciones.css"

const Cotizaciones = () => {

    return(
        <div className="stats-container">
        <div className="container">
      <div className="header">
        <h2>Gestión de cotizaciones</h2>
        <div className="search-bar">
        </div>
      </div>
      <div className="search-bar">
          <input type="text" placeholder="Buscar" className="search" />
        <br />
        <button className="filter-btn">Filtros</button>
        </div>
      <div className="columns">
        {/* Columna Pendientes */}
        <div className="column">
          <div className="column-header">
            <span>Pendientes</span>
            <span className="count">1</span>
          </div>
<br />
          <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Avexi Suites</p>
            <p className="date">Fecha de creación: 30 Ene 2026</p>
          </div>

          {/* <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de creación: 30 Ene 2025</p>
          </div>

          <div className="card">
            <span className="badge green">Aceptada por el cliente</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de aceptación: 30 Ene 2025</p>
          </div>

          <div className="card">
            <span className="badge red">Rechazada por el cliente</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de rechazo: 30 Ene 2025</p>
          </div> */}
        </div>

        {/* Columna En proceso */}
        <div className="column">
          <div className="column-header">
            <span>En proceso</span>
            <span className="count"></span>
          </div>

          {/* <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de creación: 30 Ene 2025</p>
          </div>

          <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de creación: 30 Ene 2025</p>
          </div> */}
        </div>

        {/* Columna Generadas */}
        <div className="column">
          <div className="column-header">
            <span>Generadas</span>
            <span className="count"></span>
          </div>

          {/* <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de generación: 30 Ene 2025</p>
          </div>

          <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de generación: 30 Ene 2025</p>
          </div>

          <div className="card">
            <span className="badge blue">Recibida por chat</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de generación: 30 Ene 2025</p>
          </div>

          <div className="card">
            <span className="badge red">Rechazada por el cliente</span>
            <p className="client">Cliente: Nombre del cliente</p>
            <p className="hotel">Hotel: Hotel Awai Suites</p>
            <p className="date">Fecha de generación: 30 Ene 2025</p>
          </div> */}
        </div>
      </div>
    </div>
    </div>
    );
};

export default Cotizaciones;
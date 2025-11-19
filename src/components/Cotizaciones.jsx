import React, { useEffect, useState } from "react";
import "../components/styles/cotizaciones.css"

const Cotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);

    // Función para obtener el token de las cookies
    const getTokenFromCookies = () => {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => 
            cookie.trim().startsWith('accessToken=')
        );
        if (tokenCookie) {
            return tokenCookie.split('=')[1];
        }
        return null;
    };

    // Función para traer todas las cotizaciones
    const fetchCotizaciones = async () => {
        try {
            const token = getTokenFromCookies();
            
            if (!token) {
                console.log('No se encontró el token de acceso en las cookies');
                return;
            }

            const url = import.meta.env.PUBLIC_API_URL;
            const response = await fetch(`${url}/agencias/v1/cotizaciones/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Cotizaciones obtenidas:', data);
                setCotizaciones(data);
            } else {
                console.error('Error al obtener las cotizaciones:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error en la consulta de cotizaciones:', error);
        }
    };

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    // Función para filtrar cotizaciones por status
    const getCotizacionesByStatus = (status) => {
        return cotizaciones.filter(cotizacion => cotizacion.status === status);
    };

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Función para obtener el nombre completo del cliente
    const getClientName = (reservation) => {
        if (reservation && reservation.firstName && reservation.lastName) {
            return `${reservation.firstName} ${reservation.lastName}`;
        }
        return 'Cliente no especificado';
    };

    // Función para navegar a la cotización creada
    const navigateToCotizacion = (cotizacionId) => {
        window.location.href = `/cotizaciones/${cotizacionId}`;
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 0:
                return { label: 'Pendiente', color: 'blue' };
            case 1:
                return { label: 'Aceptada', color: 'green' };
            case 2:
                return { label: 'Rechazada', color: 'red' };
            case 3:
                return { label: 'Convertida en reserva', color: 'purple' };
            default:
                return { label: 'Estado no identificado', color: 'gray' };
        }
    };

    // Función para renderizar las cards de cotizaciones
    const renderCotizacionesCards = (cotizacionesList) => {
        return cotizacionesList.map((cotizacion, index) => {
            const { label, color } = getStatusInfo(cotizacion.status);
            return (
            <div 
                key={cotizacion._id || index} 
                className="card clickable-card"
                onClick={() => navigateToCotizacion(cotizacion._id)}
                style={{ cursor: 'pointer' }}
            >
                <span className={`badge ${color}`}>
                    {label}
                </span>
                <p className="client">Cliente: {getClientName(cotizacion.reservation)}</p>
                <p className="hotel">Hotel: {cotizacion.hotel}</p>
                <p className="date">Fecha de creación: {formatDate(cotizacion.createdAt)}</p>
            </div>
        )});
    };

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
            <span className="count">{getCotizacionesByStatus(0).length}</span>
          </div>
          <br />
          {renderCotizacionesCards(getCotizacionesByStatus(0))}
        </div>

        {/* Columna Aceptadas */}
        <div className="column">
          <div className="column-header">
            <span>Aceptadas (Sin Dispo)</span>
            <span className="count">{getCotizacionesByStatus(1).length}</span>
          </div>
          {renderCotizacionesCards(getCotizacionesByStatus(1))}
        </div>

        {/* Columna Rechazadas */}
        <div className="column">
          <div className="column-header">
            <span>Rechazadas</span>
            <span className="count">{getCotizacionesByStatus(2).length}</span>
          </div>
          {renderCotizacionesCards(getCotizacionesByStatus(2))}
        </div>

        {/* Columna Convertidas en reserva */}
        <div className="column">
          <div className="column-header">
            <span>Convertidas en reserva</span>
            <span className="count">{getCotizacionesByStatus(3).length}</span>
          </div>
          {renderCotizacionesCards(getCotizacionesByStatus(3))}
        </div>
      </div>
    </div>
    </div>
    );
};

export default Cotizaciones;
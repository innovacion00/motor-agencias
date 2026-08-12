import React, { useEffect, useState } from "react";
import "../components/styles/cotizaciones.css"

const Cotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [agencyNames, setAgencyNames] = useState({});
    const [isLoading, setIsLoading] = useState(true);

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

    // Función para cargar todas las páginas de cotizaciones
    const fetchAllCotizaciones = async (token, totalPages) => {
        try {
            const url = import.meta.env.PUBLIC_API_URL;
            const allCotizaciones = [];
            
            // Cargar todas las páginas
            for (let page = 1; page <= totalPages; page++) {
                const response = await fetch(`${url}/agencias/v1/cotizaciones/?page=${page}&pageSize=25`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const responseData = await response.json();
                    if (responseData.data && Array.isArray(responseData.data)) {
                        allCotizaciones.push(...responseData.data);
                    }
                } else {
                    console.error(`Error al obtener la página ${page}:`, response.status);
                }
            }
            
            setCotizaciones(allCotizaciones);
            console.log(`Total de cotizaciones cargadas: ${allCotizaciones.length}`);
        } catch (error) {
            console.error('Error al cargar todas las cotizaciones:', error);
            setCotizaciones([]);
        }
    };

    // Función para traer todas las cotizaciones
    const fetchCotizaciones = async () => {
        setIsLoading(true);
        try {
            const token = getTokenFromCookies();
            
            if (!token) {
                console.log('No se encontró el token de acceso en las cookies');
                return;
            }

            const url = import.meta.env.PUBLIC_API_URL;
            const response = await fetch(`${url}/agencias/v1/cotizaciones/?page=1&pageSize=25`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Cotizaciones obtenidas:', responseData);
                
                // Manejar respuesta paginada: {data: [...], meta: {...}}
                if (responseData.data && Array.isArray(responseData.data)) {
                    // Si hay metadata y más páginas, cargar todas las páginas
                    if (responseData.meta && responseData.meta.totalPages > 1) {
                        await fetchAllCotizaciones(token, responseData.meta.totalPages);
                    } else {
                        setCotizaciones(responseData.data);
                    }
                } else if (Array.isArray(responseData)) {
                    // Fallback: si la respuesta es un array directo (compatibilidad hacia atrás)
                    setCotizaciones(responseData);
                } else {
                    console.error('Formato de respuesta no reconocido:', responseData);
                    setCotizaciones([]);
                }
            } else {
                console.error('Error al obtener las cotizaciones:', response.status, response.statusText);
                setCotizaciones([]);
            }
        } catch (error) {
            console.error('Error en la consulta de cotizaciones:', error);
            setCotizaciones([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    const fetchAgencyName = async (agencyId, token) => {
        const url = import.meta.env.PUBLIC_API_URL;
        const response = await fetch(`${url}/agencias/v1/agencias/${agencyId}/nombre`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data?.nombre || data?.name || '';
    };

    useEffect(() => {
        const loadAgencyNames = async () => {
            const token = getTokenFromCookies();

            if (!token) {
                console.log('No se encontró el token de acceso en las cookies');
                return;
            }

            // Asegurarse de que cotizaciones sea un array antes de usar map
            if (!Array.isArray(cotizaciones)) {
                return;
            }
            
            const agenciesInData = cotizaciones
                .map(cotizacion => cotizacion?.agenciaId?._id)
                .filter(Boolean);

            const uniqueIds = [...new Set(agenciesInData)]
                .filter(id => !agencyNames[id]);

            if (!uniqueIds.length) {
                return;
            }

            try {
                const entries = await Promise.all(
                    uniqueIds.map(async (agencyId) => {
                        try {
                            const name = await fetchAgencyName(agencyId, token);
                            return [agencyId, name];
                        } catch (error) {
                            console.error(`Error al obtener el nombre de la agencia ${agencyId}:`, error);
                            return [agencyId, ''];
                        }
                    })
                );

                setAgencyNames(prev => {
                    const next = { ...prev };
                    entries.forEach(([id, name]) => {
                        if (name) {
                            next[id] = name;
                        }
                    });
                    return next;
                });
            } catch (error) {
                console.error('Error al consultar nombres de agencias:', error);
            }
        };

        if (cotizaciones.length) {
            loadAgencyNames();
        }
    }, [cotizaciones, agencyNames]);

    // Función para filtrar cotizaciones por status
    const getCotizacionesByStatus = (status) => {
        // Asegurarse de que cotizaciones sea un array antes de usar filter
        if (!Array.isArray(cotizaciones)) {
            return [];
        }
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
                return { label: 'Aceptada', color: 'purple' };
            case 2:
                return { label: 'Rechazada', color: 'red' };
            case 3:
                return { label: 'Convertida en reserva', color: 'green' };
            default:
                return { label: 'Estado no identificado', color: 'gray' };
        }
    };

    // Card de carga (skeleton loader) mientras se consultan las cotizaciones
    const SkeletonCard = () => (
        <div className="card cotizacion-skeleton">
            <div className="cotizacion-skeleton-badge" />
            <div className="cotizacion-skeleton-line" />
            <div className="cotizacion-skeleton-line short" />
            <div className="cotizacion-skeleton-line medium" />
        </div>
    );

    // Muestra varias cards de skeleton por columna
    const renderSkeletonCards = (cantidad = 3) => (
        [...Array(cantidad)].map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
        ))
    );

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
                {cotizacion?.agenciaId?._id && agencyNames[cotizacion.agenciaId._id] && (
                    <p className="agency-name"> Agencia: {agencyNames[cotizacion.agenciaId._id]}</p>
                )}
            </div>
        )});
    };

    return(
        <div className="stats-container">
        <div className="container">
      <div className="header">
        <h2>Gestión de cotizaciones</h2>
        {isLoading && (
          <div className="cotizaciones-loading" role="status" aria-live="polite">
            <span className="cotizaciones-spinner" aria-hidden="true" />
            <span>Cargando cotizaciones...</span>
          </div>
        )}
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
            <span className="count">{isLoading ? '-' : getCotizacionesByStatus(0).length}</span>
          </div>
          <br />
          {isLoading ? renderSkeletonCards(4) : renderCotizacionesCards(getCotizacionesByStatus(0))}
        </div>

        {/* Columna Aceptadas */}
        <div className="column">
          <div className="column-header">
            <span>Aceptadas (Sin Dispo)</span>
            <span className="count">{isLoading ? '-' : getCotizacionesByStatus(1).length}</span>
          </div>
          {isLoading ? renderSkeletonCards(3) : renderCotizacionesCards(getCotizacionesByStatus(1))}
        </div>

        {/* Columna Rechazadas */}
        <div className="column">
          <div className="column-header">
            <span>Rechazadas</span>
            <span className="count">{isLoading ? '-' : getCotizacionesByStatus(2).length}</span>
          </div>
          {isLoading ? renderSkeletonCards(3) : renderCotizacionesCards(getCotizacionesByStatus(2))}
        </div>

        {/* Columna Convertidas en reserva */}
        <div className="column">
          <div className="column-header">
            <span>Convertidas en reserva</span>
            <span className="count">{isLoading ? '-' : getCotizacionesByStatus(3).length}</span>
          </div>
          {isLoading ? renderSkeletonCards(3) : renderCotizacionesCards(getCotizacionesByStatus(3))}
        </div>
      </div>
    </div>
    </div>
    );
};

export default Cotizaciones;
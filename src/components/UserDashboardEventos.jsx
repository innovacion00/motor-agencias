import React, { useEffect, useState } from "react";
import "../../public/styles/UserDashboardEventos.css";

const UserDashboard = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cotizacionesFiltradas, setCotizacionesFiltradas] = useState([]);
  const [usuarioDatos, setUsuarioDatos] = useState(null);
  const [datosHotel, setDatosHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos del localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("infohotel"));
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUsuarioDatos(datosdelusuario.token);
    setDatosHotel(data);
  }, []);
  // Función para consultar las cotizaciones
  const obtenerCotizaciones = async () => {
    setIsLoading(true);
    try {
      if (!usuarioDatos) {
        throw new Error('No hay token de autorización');
      }

      const response = await fetch("https://gehsuitesapps.com/agencias/v1/eventos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${usuarioDatos}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }

      const data = await response.json();
      setCotizaciones(data);
      setCotizacionesFiltradas(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error al obtener cotizaciones:", err);
      setError("No se pudieron cargar las cotizaciones. Por favor, intente más tarde.");
      setIsLoading(false);
    }
  };
  // Consultar API al cargar el componente y cuando el token esté disponible
  useEffect(() => {
    if (usuarioDatos) {
      obtenerCotizaciones();
    }
  }, [usuarioDatos]);

  // Manejar la búsqueda
  useEffect(() => {
    if (busqueda.trim() === "") {
      setCotizacionesFiltradas(cotizaciones);
    } else {
      const termino = busqueda.toLowerCase();
      const resultados = cotizaciones.filter(
        (cotizacion) =>
          cotizacion.nameEvento.toLowerCase().includes(termino) ||
          cotizacion.nombreOrganizador.toLowerCase().includes(termino) ||
          cotizacion.emailOrganizador.toLowerCase().includes(termino)
      );
      setCotizacionesFiltradas(resultados);
    }
  }, [busqueda, cotizaciones]);

  // Función para formatear fechas
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Función para ver detalles de una cotización
  const verDetalles = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setMostrarDetalles(true);
  };

  // Función para cerrar la vista de detalles
  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setCotizacionSeleccionada(null);
  };

  // Función para obtener el nombre del tipo de evento
  const obtenerTipoEvento = (tipo) => {
    const tiposEvento = {
      1: "Corporativo",
      2: "Social",
      3: "Académico",
      4: "Cultural",
      5: "Deportivo",
    };
    return tiposEvento[tipo] || "Otro";
  };

  // Función para obtener el nombre del tipo de acomodación
  const obtenerTipoAcomodacion = (tipo) => {
    const tiposAcomodacion = {
      1: "Auditorio",
      2: "Escuela",
      3: "Mesa redonda",
      4: "Herradura",
      5: "Imperial",
    };
    return tiposAcomodacion[tipo] || "Otro";
  };

  return (
    <div className="main-container">
      <div className="top-bar">
        <h1>Tablero de eventos</h1>
      </div>
      <div className="navigation-tabs">
        <div className="nav-item active">Gestión de solicitudes</div>
      </div>
      <div className="actions">
        <a href="eventosbogota">
          <button className="btn create">
            <i className="fas fa-plus"></i> Crear nueva cotización
          </button>
        </a>
        <button className="btn refresh" onClick={obtenerCotizaciones}>
          <i className="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre de evento, organizador o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <i className="fas fa-search"></i>
      </div>

      {isLoading ? (
        <div className="loading">
          <p>Cargando cotizaciones...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : cotizacionesFiltradas.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron cotizaciones.</p>
        </div>
      ) : (
        <div className="cotizaciones-tabla">
          <table>
            <thead>
              <tr>
                <th>Nombre del evento</th>
                <th>Tipo</th>
                <th>Organizador</th>
                <th>Asistentes</th>
                <th>Fecha inicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map((cotizacion) => (
                <tr key={cotizacion._id}>
                  <td>{cotizacion.nameEvento}</td>
                  <td>{obtenerTipoEvento(cotizacion.tipoEvento)}</td>
                  <td>{cotizacion.nombreOrganizador}</td>
                  <td>{cotizacion.cantidadAsistentes}</td>
                  <td>{formatearFecha(cotizacion.fechaInicioEvento)}</td>
                  <td>                    <a
                      href={`/evento/${cotizacion._id}`}
                      className="btn-action view"
                    >
                      <i className="fas fa-eye"></i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles de cotización */}
      {mostrarDetalles && cotizacionSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detalles de la cotización</h2>
              <button className="btn-close" onClick={cerrarDetalles}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detalle-seccion">
                <h3>Información general</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Nombre del evento:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.nameEvento}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Tipo de evento:</span>
                    <span className="detalle-valor">
                      {obtenerTipoEvento(cotizacionSeleccionada.tipoEvento)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>Organizador</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Nombre:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.nombreOrganizador}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Teléfono:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.telefonoOrganizador}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Email:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.emailOrganizador}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>Detalles del evento</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha inicio:</span>
                    <span className="detalle-valor">
                      {formatearFecha(cotizacionSeleccionada.fechaInicioEvento)}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha final:</span>
                    <span className="detalle-valor">
                      {formatearFecha(cotizacionSeleccionada.fechaFinalEvento)}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Total asistentes:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.cantidadAsistentes}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Tipo de acomodación:</span>
                    <span className="detalle-valor">
                      {obtenerTipoAcomodacion(cotizacionSeleccionada.tipoAcomodacion)}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Flexibilidad:</span>
                    <span className="detalle-valor">
                      {cotizacionSeleccionada.flexibilidadEvento ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>Horarios por día</h3>
                <div className="horarios-lista">
                  {cotizacionSeleccionada.horarioEvento.map((horario, index) => (
                    <div key={index} className="horario-item">
                      <p>
                        <strong>Día {index + 1}:</strong> {formatearFecha(horario.fechaInicio)} - 
                        Asistentes: {horario.cantidadAsistenteDia}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>Alimentación y servicios</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Alimentación:</span>
                    <span className="detalle-valor">
                      {cotizacionSeleccionada.alimentacion ? "Sí" : "No"}
                    </span>
                  </div>
                  {cotizacionSeleccionada.alimentacion && (
                    <>
                      <div className="detalle-item">
                        <span className="detalle-label">Estación de café:</span>
                        <span className="detalle-valor">
                          {cotizacionSeleccionada.alimentosBebidas.estacionCafe ? "Sí" : "No"}
                        </span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-label">Coffee Break:</span>
                        <span className="detalle-valor">
                          {cotizacionSeleccionada.alimentosBebidas.coffeBreak ? "Sí" : "No"}
                        </span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-label">Desayuno:</span>
                        <span className="detalle-valor">
                          {cotizacionSeleccionada.alimentosBebidas.desayuno ? "Sí" : "No"}
                        </span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-label">Almuerzo:</span>
                        <span className="detalle-valor">
                          {cotizacionSeleccionada.alimentosBebidas.almuerzo ? "Sí" : "No"}
                        </span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-label">Cena:</span>
                        <span className="detalle-valor">
                          {cotizacionSeleccionada.alimentosBebidas.cena ? "Sí" : "No"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {cotizacionSeleccionada.audiovisuales && (
                <div className="detalle-seccion">
                  <h3>Audiovisuales</h3>
                  <div className="servicios-lista">
                    {cotizacionSeleccionada.itemsAudiovisuales.map((item, index) => (
                      <div key={index} className="servicio-item">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cotizacionSeleccionada.observaciones && (
                <div className="detalle-seccion">
                  <h3>Observaciones</h3>
                  <p>{cotizacionSeleccionada.observaciones}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn primary" onClick={cerrarDetalles}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
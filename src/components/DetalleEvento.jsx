import React, { useEffect, useState } from "react";
import "../../public/styles/UserDashboardEventos.css";

const DetalleEvento = ({ id }) => {
  const [evento, setEvento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioDatos, setUsuarioDatos] = useState(null);

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUsuarioDatos(datosdelusuario.token);
  }, []);

  useEffect(() => {
    const obtenerDetalleEvento = async () => {
      if (!usuarioDatos) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://gehsuitesapps.com/agencias/v1/eventos/${id}`, {
          headers: {
            'Authorization': `Bearer ${usuarioDatos}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los detalles del evento');
        }

        const data = await response.json();
        setEvento(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && usuarioDatos) {
      obtenerDetalleEvento();
    }
  }, [id, usuarioDatos]);

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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

  if (isLoading) return <div className="loading">Cargando detalles del evento...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!evento) return <div className="error">No se encontró el evento</div>;

  return (
    <div className="detalle-evento-container">
      <div className="detalle-header">
        <h1>{evento.nameEvento}</h1>
        <div className="evento-meta">
          <span>Tipo: {obtenerTipoEvento(evento.tipoEvento)}</span>
          <span>Fecha de creación: {formatearFecha(evento.createdAt)}</span>
        </div>
      </div>

      <div className="detalle-seccion">
        <h2>Información del Organizador</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Nombre:</label>
            <span>{evento.nombreOrganizador}</span>
          </div>
          <div className="info-item">
            <label>Teléfono:</label>
            <span>{evento.telefonoOrganizador}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{evento.emailOrganizador}</span>
          </div>
        </div>
      </div>

      <div className="detalle-seccion">
        <h2>Detalles del Evento</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Fecha de inicio:</label>
            <span>{formatearFecha(evento.fechaInicioEvento)}</span>
          </div>
          <div className="info-item">
            <label>Fecha de finalización:</label>
            <span>{formatearFecha(evento.fechaFinalEvento)}</span>
          </div>
          <div className="info-item">
            <label>Cantidad de asistentes:</label>
            <span>{evento.cantidadAsistentes}</span>
          </div>
          <div className="info-item">
            <label>Tipo de acomodación:</label>
            <span>{obtenerTipoAcomodacion(evento.tipoAcomodacion)}</span>
          </div>
          <div className="info-item">
            <label>Flexibilidad de evento:</label>
            <span>{evento.flexibilidadEvento ? "Sí" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="detalle-seccion">
        <h2>Horarios del Evento</h2>
        <div className="horarios-lista">
          {evento.horarioEvento.map((horario, index) => (
            <div key={index} className="horario-item">
              <h3>Día {index + 1}</h3>
              <p>Inicio: {formatearFecha(horario.fechaInicio)}</p>
              <p>Fin: {formatearFecha(horario.fechaFinal)}</p>
              <p>Asistentes: {horario.cantidadAsistenteDia}</p>
            </div>
          ))}
        </div>
      </div>

      {evento.alimentacion && (
        <div className="detalle-seccion">
          <h2>Servicios de Alimentación</h2>
          <div className="servicios-grid">
            <div className="servicio-item">
              <label>Estación de café:</label>
              <span>{evento.alimentosBebidas.estacionCafe ? "Sí" : "No"}</span>
            </div>
            <div className="servicio-item">
              <label>Coffee Break:</label>
              <span>{evento.alimentosBebidas.coffeBreak ? "Sí" : "No"}</span>
            </div>
            <div className="servicio-item">
              <label>Desayuno:</label>
              <span>{evento.alimentosBebidas.desayuno ? "Sí" : "No"}</span>
            </div>
            <div className="servicio-item">
              <label>Almuerzo:</label>
              <span>{evento.alimentosBebidas.almuerzo ? "Sí" : "No"}</span>
            </div>
            <div className="servicio-item">
              <label>Cena:</label>
              <span>{evento.alimentosBebidas.cena ? "Sí" : "No"}</span>
            </div>
          </div>
        </div>
      )}

      {evento.audiovisuales && (
        <div className="detalle-seccion">
          <h2>Servicios Audiovisuales</h2>
          <ul className="audiovisuales-lista">
            {evento.itemsAudiovisuales.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {evento.decoracion && (
        <div className="detalle-seccion">
          <h2>Decoración</h2>
          <p>{evento.decoracionDescripcion}</p>
        </div>
      )}

      {evento.observaciones && (
        <div className="detalle-seccion">
          <h2>Observaciones</h2>
          <p>{evento.observaciones}</p>
        </div>
      )}

      <div className="acciones">
        <a href="/tableroeventos" className="btn-volver">Volver al listado</a>
      </div>
    </div>
  );
};

export default DetalleEvento;

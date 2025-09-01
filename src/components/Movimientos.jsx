import React, { useEffect, useState } from "react";
import "./styles/Estadisticas.css";
import { getReservas, reservasNano } from "../stores/disponibilidad";

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [userData, setUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [todosLosMovimientos, setTodosLosMovimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const movimientosPorPagina = 15;

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUserData(datosdelusuario);
    ObtenerReservas(datosdelusuario.token, datosdelusuario.role[0]);
  }, []);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SkeletonRow = () => (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      {[...Array(8)].map((_, index) => (
        <td key={index} style={{ padding: "12px" }}>
          <div style={{
            height: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            animation: "pulse 1.5s infinite",
          }}></div>
        </td>
      ))}
    </tr>
  );

  const ObtenerReservas = async (token, nombreAgencia) => {
    setIsLoading(true);
    try {
      await getReservas(nombreAgencia);
      const reservasObtenidas = reservasNano.get();
      
      const reservasOrdenadas = [...reservasObtenidas].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      const movimientosProcesados = reservasOrdenadas.flatMap(reserva => {
        console.log("Procesando reserva:", reserva); // Debug 3
        console.log("Links history:", reserva.linksHistory); // Debug 4

        // Movimiento principal de la reserva
        const movimientoPrincipal = {
          id: reserva._id,
          fecha: formatearFecha(reserva.createdAt), // Usar función formatearFecha
          agencia: reserva.agenciaId?.fullName || "Sin agencia",
          metodoPago: reserva.linkInfo?.paymentMethod || "Pendiente",
          reservaId: reserva.reservaChatbotId,
          monto: reserva.status === 5 && reserva.pagadoPrimeraMitad ? reserva.totalMitad : reserva.total,
          hotel: reserva.hotel,
          estado: getEstadoReserva(reserva.status, reserva.pagadoPrimeraMitad),
          detalleReserva: `${reserva.reservation.nights} noches, ${reserva.cantidadHabitaciones} habitación(es)`,
          esIntentoPago: false
        };

        // Procesar historial de links si existe
        const intentosDePago = reserva.linksHistory?.map((link, index) => {
          const fechaGeneracionLink = formatearFecha(link.fecha); // Usar función formatearFecha

          return ({
            id: `${reserva._id}-${index}`,
            fecha: fechaGeneracionLink,
            agencia: reserva.agenciaId?.fullName || "Sin agencia",
            metodoPago: link.typeOfPayment || "Intento de pago",
            reservaId: reserva.reservaChatbotId,
            monto: link.amount || reserva.total,
            hotel: reserva.hotel,
            estado: "Intento de pago",
            detalleReserva: `ID de pago: ${link.id || 'No disponible'} | Generado: ${fechaGeneracionLink}`,
            esIntentoPago: true
          })
        }) || [];

        // Combina la reserva principal con todos sus intentos de pago
        return [movimientoPrincipal, ...intentosDePago];
      });

      setTodosLosMovimientos(movimientosProcesados);
      actualizarPaginaActual(1, movimientosProcesados);
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarPaginaActual = (pagina, movimientos = todosLosMovimientos) => {
    const indexInicial = (pagina - 1) * movimientosPorPagina;
    const indexFinal = indexInicial + movimientosPorPagina;
    setMovimientos(movimientos.slice(indexInicial, indexFinal));
    setCurrentPage(pagina);
  };

  const totalPaginas = Math.ceil(todosLosMovimientos.length / movimientosPorPagina);

  const getEstadoReserva = (status, pagadoPrimeraMitad) => {
    const estados = {
      0: "Pendiente de pago",
      1: "En proceso",
      2: pagadoPrimeraMitad ? "Pago total rechazado" : "Pago rechazado primer abono",
      3: "Pago aprobado",
      4: "Cancelado",
      5: "Pagado primera mitad"
    };
    return estados[status] || "Estado desconocido";
  };

  const getEstadoStyle = (estado) => {
    const styles = {
      "Pendiente de pago": { backgroundColor: "#FFC107", color: "black" },
      "En proceso": { backgroundColor: "#2196F3", color: "white" },
      "Pago rechazado primer abono": { backgroundColor: "#f44336", color: "white" },
      "Pago total rechazado": { backgroundColor: "#f44336", color: "white" },
      "Pago aprobado": { backgroundColor: "#4CAF50", color: "white" },
      "Cancelado": { backgroundColor: "#607d8b", color: "white" },
      "Pagado primera mitad": { backgroundColor: "#ff9800", color: "white" },
      "Intento de pago": { backgroundColor: "#9C27B0", color: "white" }
    };
    return styles[estado] || {};
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "$ 0";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);
  };


  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1 style={{ fontSize: "20px" }}>Tablero de usuario</h1>
        <h1 style={{
          fontSize: "18px",
          paddingBottom: "10px",
          fontFamily: "Roboto"
        }}>
          Historial de Movimientos
        </h1>
      </div>

      <div className="stats-navigation">
        <a href="/tablerousuario">Mi perfíl</a>
        <a href="/misreservas">Gestionar reservas</a>
        <a href="/estadisticas">Análisis de datos</a>
        <a className="active" href="/ultimosmovimientos">Movimientos</a>
        <a href="/configuracion">Configuración</a>
      </div>

      <div className="movements-container" style={{ padding: "20px" }}>
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}
        </style>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Agencia</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Método de Pago</th>
              <th style={{ padding: "12px", textAlign: "left" }}>ID Reserva</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Hotel</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Monto</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Mostrar 5 filas de skeleton loader
              [...Array(15)].map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : (
              movimientos.map((movimiento) => (
                <tr key={movimiento.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{movimiento.fecha}</td>
                  <td style={{ padding: "12px" }}>{movimiento.agencia}</td>
                  <td style={{ padding: "12px" }}>{movimiento.metodoPago}</td>
                  <td style={{ padding: "12px" }}>{movimiento.reservaId}</td>
                  <td style={{ padding: "12px" }}>{movimiento.hotel}</td>
                  <td style={{ padding: "12px" }}>{formatCurrency(movimiento.monto)}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      ...getEstadoStyle(movimiento.estado)
                    }}>
                      {movimiento.estado}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {movimiento.esIntentoPago ? (
                      <span style={{ color: "#666", fontSize: "0.9em" }}>
                        {movimiento.detalleReserva}
                      </span>
                    ) : (
                      movimiento.detalleReserva
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mostrar la paginación solo cuando no está cargando */}
        {!isLoading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px',
            gap: '10px'
          }}>
            <button
              onClick={() => actualizarPaginaActual(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                backgroundColor: currentPage === 1 ? '#ddd' : '#2196F3',
                color: currentPage === 1 ? '#666' : 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Anterior
            </button>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center',
              margin: '0 10px'
            }}>
              Página {currentPage} de {totalPaginas}
            </span>
            <button
              onClick={() => actualizarPaginaActual(currentPage + 1)}
              disabled={currentPage === totalPaginas}
              style={{
                padding: '8px 16px',
                cursor: currentPage === totalPaginas ? 'not-allowed' : 'pointer',
                backgroundColor: currentPage === totalPaginas ? '#ddd' : '#2196F3',
                color: currentPage === totalPaginas ? '#666' : 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movimientos;



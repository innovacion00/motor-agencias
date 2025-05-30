import React, { useEffect, useState } from "react";
import "./styles/Estadisticas.css";
import { getReservas, reservasNano } from "../stores/disponibilidad";

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUserData(datosdelusuario);
    ObtenerReservas(datosdelusuario.token, datosdelusuario.role[0]);
  }, []);

  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(token, nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    
    // Ordenar por fecha de creación (más recientes primero)
    const reservasOrdenadas = [...reservasObtenidas].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Procesar todas las reservas y sus intentos de pago
    const todosLosMovimientos = reservasOrdenadas.flatMap(reserva => {
      // Movimiento principal de la reserva
      const movimientoPrincipal = {
        id: reserva._id,
        fecha: new Date(reserva.createdAt).toLocaleDateString(),
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
        const fechaGeneracionLink = new Date(link.createdAt).toLocaleDateString();
        return ({
          id: `${reserva._id}-${index}`,
          fecha: new Date(link.createdAt).toLocaleDateString(),
          agencia: reserva.agenciaId?.fullName || "Sin agencia",
          metodoPago: "Intento de pago",
          reservaId: reserva.reservaChatbotId,
          monto: link.amount || reserva.total,
          hotel: reserva.hotel,
          estado: "Intento de pago",
          detalleReserva: `ID de pago: ${link.idLinkPago || 'No disponible'} | Generado: ${fechaGeneracionLink}`,
          esIntentoPago: true
        })
      }) || [];

      // Combina la reserva principal con todos sus intentos de pago
      return [movimientoPrincipal, ...intentosDePago];
    });
    // Tomar los últimos 5 movimientos
    setMovimientos(todosLosMovimientos.slice(0, 5));
  };

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
        <a className="active" href="/movimientos">Movimientos</a>
        <a href="/configuracion">Configuración</a>
      </div>

      <div className="movements-container" style={{ padding: "20px" }}>
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
            {movimientos.map((movimiento) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Movimientos;



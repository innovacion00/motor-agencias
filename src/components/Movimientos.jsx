import React, { useEffect, useState } from "react";
import "./styles/Estadisticas.css";

const Movimientos = () => {
  const [movimientos] = useState([
    {
      id: 1,
      fecha: "2024-03-15",
      agencia: "Agencia #1",
      metodoPago: "Tarjeta de Crédito",
      reservaId: "RES-001",
      monto: "$$$",
      hotel: "Hotel Windsor",
      estado: "Pendiente",
      detalleReserva: "2 noches, Suite Ejecutiva"
    },
    {
      id: 2,
      fecha: "2024-03-14",
      agencia: "Agencia #2",
      metodoPago: "Transferencia Bancaria",
      reservaId: "RES-002",
      monto: "$$$",
      hotel: "Hotel Madisson",
      estado: "Pendiente",
      detalleReserva: "3 noches, Habitación Deluxe"
    },
    {
      id: 3,
      fecha: "2024-03-13",
      agencia: "Agencia #3",
      metodoPago: "PSE",
      reservaId: "RES-003",
      monto: "$$$",
      hotel: "Hotel Axis",
      estado: "Pendiente",
      detalleReserva: "4 noches, Habitación Estándar"
    }
  ]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);
  };

  const getEstadoStyle = (estado) => {
    const styles = {
      Aprobado: { backgroundColor: "#4CAF50", color: "white" },
      Pendiente: { backgroundColor: "#FFC107", color: "black" },
      Procesando: { backgroundColor: "#2196F3", color: "white" }
    };
    return styles[estado] || {};
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
                <td style={{ padding: "12px" }}>{movimiento.detalleReserva}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Movimientos;



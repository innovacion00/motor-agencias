import React, { useState } from "react";
import {
  getTramosDesdeItemVuelo,
  getLegFlightCode,
  getLegRouteLine,
  getLegAirlineName,
  getLegCarrierCode,
  getAirlineLogo,
  formatTotalVueloDisplay,
  getMonedaVueloDisplay,
} from "../utils/vueloCotizacion";

const VueloCotizacionDetalle = ({ vueloArray, collapsible = true, style = {} }) => {
  const [abierto, setAbierto] = useState(!collapsible);

  if (!Array.isArray(vueloArray) || vueloArray.length === 0) return null;

  const contenido = (
    <div style={{ marginTop: collapsible && abierto ? "10px" : 0, ...style }}>
      {vueloArray.map((item, vIdx) => {
        const { r, outbound, inbound, segments } = getTramosDesdeItemVuelo(item);
        const pasajeros = Array.isArray(r.passengers) ? r.passengers : [];
        const totalVuelo = formatTotalVueloDisplay(item);
        const moneda = getMonedaVueloDisplay(item);

        return (
          <div
            key={item?._id || item?.packageId || vIdx}
            style={{
              marginBottom: vIdx < vueloArray.length - 1 ? "16px" : 0,
              paddingBottom: vIdx < vueloArray.length - 1 ? "16px" : 0,
              borderBottom:
                vIdx < vueloArray.length - 1 ? "1px solid #e2e8f0" : "none",
            }}
          >
            {item.packageId && (
              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>
                Paquete: {item.packageId}
              </p>
            )}

            {outbound && (
              <>
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                  Ida — Código: {getLegFlightCode(outbound)}
                </p>
                <p
                  style={{
                    margin: "0 0 4px",
                    paddingLeft: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={getAirlineLogo(getLegCarrierCode(outbound))}
                    alt=""
                    width={24}
                    height={24}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                  />
                  <span>
                    <strong>Aerolínea:</strong> {getLegAirlineName(outbound)}
                  </span>
                </p>
                <p style={{ margin: "0 0 10px", paddingLeft: "4px" }}>
                  {getLegRouteLine(outbound)}
                </p>
              </>
            )}

            {inbound && (
              <>
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                  Vuelta — Código: {getLegFlightCode(inbound)}
                </p>
                <p
                  style={{
                    margin: "0 0 4px",
                    paddingLeft: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={getAirlineLogo(getLegCarrierCode(inbound))}
                    alt=""
                    width={24}
                    height={24}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                  />
                  <span>
                    <strong>Aerolínea:</strong> {getLegAirlineName(inbound)}
                  </span>
                </p>
                <p style={{ margin: "0 0 10px", paddingLeft: "4px" }}>
                  {getLegRouteLine(inbound)}
                </p>
              </>
            )}

            {!outbound && !inbound && segments.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                {segments.map((s, sIdx) => (
                  <p key={sIdx} style={{ margin: "4px 0", fontSize: "0.95em" }}>
                    {s.origin || "—"} → {s.destination || "—"} ·{" "}
                    {s.flightNumber || "—"}
                  </p>
                ))}
              </div>
            )}

            <p style={{ margin: "4px 0" }}>
              <strong>Total vuelo:</strong> {totalVuelo} {moneda}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Estado:</strong> {r.status || "—"}
              {r.stage ? ` (${r.stage})` : ""}
            </p>

            {pasajeros.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Pasajeros ({pasajeros.length})</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px" }}>
                  {pasajeros.map((p, pIdx) => (
                    <li key={p.passengerId ?? pIdx} style={{ marginBottom: "6px" }}>
                      {p.name || p.first_name} {p.surname || p.last_name}
                      {p.document_type || p.type_passenger
                        ? ` — ${p.document_type || p.type_passenger}`
                        : ""}
                      {p.id_number || p.documento
                        ? `: ${p.id_number || p.documento}`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (!collapsible) {
    return (
      <div>
        <h4 style={{ margin: "0 0 8px", color: "#1C3D5A" }}>Información de vuelo</h4>
        {contenido}
      </div>
    );
  }

  return (
    <div style={{ marginTop: "12px", width: "100%" }}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#f0f4f8",
          border: "1px solid #c5d4e0",
          borderRadius: "6px",
          padding: "8px 12px",
          cursor: "pointer",
          fontWeight: "600",
          color: "#1C3D5A",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <span>Información de vuelo</span>
        <span aria-hidden>{abierto ? "▲" : "▼"}</span>
      </button>
      {abierto && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px",
            background: "#fafbfc",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "0.95rem",
          }}
        >
          {contenido}
        </div>
      )}
    </div>
  );
};

export default VueloCotizacionDetalle;

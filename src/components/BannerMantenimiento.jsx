import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  mantenimientoActivo,
  iniciarMonitoreoMantenimiento,
} from "../stores/mantenimiento";

const esSuperAdmin = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem("datosUsuario"));
    return Array.isArray(usuario?.role) && usuario.role.includes("super-admin");
  } catch {
    return false;
  }
};

const BannerMantenimiento = () => {
  const activo = useStore(mantenimientoActivo);
  const [superAdmin, setSuperAdmin] = useState(false);

  useEffect(() => {
    setSuperAdmin(esSuperAdmin());
  }, []);

  useEffect(() => {
    const detener = iniciarMonitoreoMantenimiento();
    return detener;
  }, []);

  useEffect(() => {
    document.body.style.overflow = activo && !superAdmin ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activo, superAdmin]);

  if (!activo) return null;

  if (superAdmin) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          backgroundColor: "#d9534f",
          color: "#fff",
          textAlign: "center",
          padding: "10px 16px",
          fontFamily: "Roboto, sans-serif",
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        Plataforma en mantenimiento
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "rgba(20, 30, 50, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "40px 32px",
          maxWidth: "480px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          color: "#1C3D5A",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>
          <i className="fas fa-tools" aria-hidden="true" />
        </div>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
          Plataforma en mantenimiento
        </h2>
        <p style={{ marginTop: "12px", fontSize: "16px", lineHeight: 1.6 }}>
          Estamos realizando mejoras en nuestro sistema. En unos momentos
          podrás continuar con tu reserva.
        </p>
        <div
          style={{
            marginTop: "20px",
            width: "36px",
            height: "36px",
            marginLeft: "auto",
            marginRight: "auto",
            border: "4px solid #d7e1ec",
            borderTopColor: "#1C3D5A",
            borderRadius: "50%",
            animation: "bc-mnt-spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes bc-mnt-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default BannerMantenimiento;
import { atom } from "nanostores";

const POLL_INTERVAL = 20000;

export const mantenimientoActivo = atom(false);

export const consultarEstadoMantenimiento = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.PUBLIC_API_URL}/agencias/v1/app-config/estado`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) throw new Error(`estado ${res.status}`);
    const data = await res.json();
    const activo = data?.mantenimiento === true;
    mantenimientoActivo.set(activo);
    return activo;
  } catch {
    return false;
  }
};

export const iniciarMonitoreoMantenimiento = (
  intervaloMs = POLL_INTERVAL
) => {
  consultarEstadoMantenimiento();
  const id = setInterval(() => {
    consultarEstadoMantenimiento();
  }, intervaloMs);
  return () => clearInterval(id);
};
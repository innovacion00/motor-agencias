import { defineMiddleware } from "astro:middleware";
import HOTELES from "./data/hoteles.json";

const DIAS_VALIDEZ = 7 * 24 * 60 * 60;

const API_URL = (import.meta.env.PUBLIC_API_URL ?? "")
  .toString()
  .trim()
  .replace(/\/+$/, "");

type ResultadoSesion = "ok" | "invalid";

// Si no existe el hotel o tiene proteccion:true → requiere sesión.
function infoHotelProtegida(pathname: string): boolean {
  if (!pathname.startsWith("/info")) return false;
  const clave = pathname.slice("/info".length).split("/")[0];
  const hotel = (HOTELES as any).hoteles.find((h: any) => h.slug === clave);
  return !hotel || hotel.proteccion === true;
}

function limpiarSesion(context: any): void {
  const opciones = { path: "/" };
  context.cookies.delete("accessToken", opciones);
  context.cookies.delete("refreshToken", opciones);
  context.cookies.delete("datosUsuario", opciones);
}

async function validarToken(context: any): Promise<ResultadoSesion> {
  const accessToken = context.cookies.get("accessToken")?.value;
  if (!accessToken) return "invalid";

  try {
    const respuesta = await fetch(
      `${API_URL}/agencias/v1/auth/validate-access-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      }
    );
    const data = await respuesta.json().catch(() => ({}));

    if (data.valid) {
      if (data.user) {
        context.cookies.set("datosUsuario", JSON.stringify(data.user), {
          path: "/",
          maxAge: DIAS_VALIDEZ,
        });
      }
      return "ok";
    }

    if (data.code === "TOKEN_EXPIRED") {
      return intentarRefresh(context);
    }

    // USER_INACTIVE, AGENCY_INACTIVE, USER_NOT_FOUND, TOKEN_INVALID, ...
    limpiarSesion(context);
    return "invalid";
  } catch (error) {
    // Si la API de validación no responde, dejar pasar para no encerrar
    // a sesiones válidas durante una caída del backend.
    return "ok";
  }
}

async function intentarRefresh(context: any): Promise<ResultadoSesion> {
  const refreshToken = context.cookies.get("refreshToken")?.value;
  if (!refreshToken) return "invalid";

  try {
    const respuesta = await fetch(
      `${API_URL}/agencias/v1/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      }
    );

    if (respuesta.ok) {
      const data = await respuesta.json();
      context.cookies.set("accessToken", data.accessToken, {
        path: "/",
        maxAge: DIAS_VALIDEZ,
      });
      context.cookies.set("refreshToken", data.refreshToken, {
        path: "/",
        maxAge: DIAS_VALIDEZ,
      });
      return "ok";
    }
  } catch (error) {
    // Backend inalcanzable: no bloquear, el resto de la app dará el error.
    return "ok";
  }

  limpiarSesion(context);
  return "invalid";
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Públicas: login, recuperación, cotización pública y archivos estáticos.
  if (pathname === "/login" || pathname === "/recuperarcontrasena")
    return next();
  if (pathname.startsWith("/cotizacion-publica")) return next();
  if (pathname.includes(".")) return next();

  // Info de hoteles con proteccion:false son públicas; el resto privadas.
  if (pathname.startsWith("/info") && !infoHotelProtegida(pathname))
    return next();

  const sesion = await validarToken(context);
  if (sesion !== "ok") {
    return context.redirect("/login");
  }

  return next();
});
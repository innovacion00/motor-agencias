/** Correos con permisos exclusivos de super-admin en Gestionar reservas */

const normalizarEmail = (email) => (email ?? "").toLowerCase().trim();

const incluyeCorreo = (lista, email) => {
  const normalizado = normalizarEmail(email);
  return normalizado !== "" && lista.includes(normalizado);
};

export const CORREOS_FECHAS_PAGO = [
  "carlosdceballos30@gmail.com",
  "innovacion@gehsuites.com",
  "yltamara21@gmail.com",
  "angelicavreservas@gmail.com",
  "briannyscassare2@gmail.com",
  "orozcosuarez97@gmail.com",
  "eyleenjimenez18@gmail.com",
].map(normalizarEmail);

export const CORREOS_CAMBIAR_ESTADO = [
  ...CORREOS_FECHAS_PAGO,
  "reservasgeh.moreno@gmail.com",
];

const esSuperAdmin = (usuario) =>
  usuario?.role?.includes?.("super-admin") ?? false;

export const puedeGestionarFechasPago = (usuario) =>
  esSuperAdmin(usuario) && incluyeCorreo(CORREOS_FECHAS_PAGO, usuario?.email);

export const puedeCambiarEstadoReserva = (usuario) =>
  esSuperAdmin(usuario) && incluyeCorreo(CORREOS_CAMBIAR_ESTADO, usuario?.email);

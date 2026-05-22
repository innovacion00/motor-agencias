/** Agencias autorizadas para ver y usar la búsqueda Vuelo + Hotel */
export const CORREOS_VUELO_HOTEL = [
"aljornastravelcoop@gmail.com",
"escapateagencia@gmail.com",
"viajayparchateve@gmail.com",
"infoasesoras2022@gmail.com",
"Xpresstours.cucuta@gmail.com",
"asistentedegerencia2@orangetravelyturismo.com",
"VIAJAPASTO@GMAIL.COM",
"wowtripco@gmail.com",
"migfratravelcoop@gmail.com",
"marypaseos1@gmail.com",
"innovacion@gehsuites.com",
"reservas@gehsuites.com",
"angelicavreservas@gmail.com",
"malejadigital97@gmail.com",
"alejandrodussan@gmail.com",
"carlosdceballos30@gmail.com",
"sekelbi99@hotmail.com",
].map((correo) => correo.toLowerCase());

export const puedeAccederVueloHotel = (email) => {
  const normalizado = (email ?? "").toLowerCase().trim();
  return normalizado !== "" && CORREOS_VUELO_HOTEL.includes(normalizado);
};

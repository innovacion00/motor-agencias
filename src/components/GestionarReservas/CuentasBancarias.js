// Helpers de mapeo para el modal de "Subir comprobante".
// Las cuentas bancarias (números, NIT, razón social) ya NO viven aquí:
// se cargan desde el backend para no exponerlas en el bundle público.
// Ver GET /agencias/v1/reservas/cuentas-bancarias (JWT).

// Traduce el nombre de hotel de la reserva (reservas?.hotel) al grupo de cuentas correspondiente.
const HOTEL_A_GRUPO_CUENTA = {
  'Hotel Aixo': 'aixo',
  'Hotel Marina': 'marina_madisson',
  'Hotel Madisson': 'marina_madisson',
  'Hotel Azuan': 'azuan_avexi_rodadero_axis',
  'Hotel Avexi': 'azuan_avexi_rodadero_axis',
  'Hotel Rodadero': 'azuan_avexi_rodadero_axis',
  'Hotel Axis': 'azuan_avexi_rodadero_axis',
  'Hotel Abi': 'abi_sansiraka',
  'Hotel Sansiraka': 'abi_sansiraka',
  'Hotel Windsor': 'windsor',
  'Hotel Boquilla': 'boquilla',
  'Playa Salguero Hotel': 'playa_salguero',
};

export function getGrupoCuentasPorHotel(hotelNombre) {
  return HOTEL_A_GRUPO_CUENTA[hotelNombre] || null;
}

// ID del ítem en el campo UF_CRM_1718636597 ("Hoteles que reservo") de Bitrix.
// Hotel 1525 no tiene ítem en esa lista: mientras no exista, no se puede enviar
// su comprobante (ver puedeEnviarComprobante).
const HOTEL_A_BITRIX_ID = {
  'Hotel Marina': 5272,
  'Hotel Avexi': 5274,
  'Hotel Azuan': 5276,
  'Hotel Bocagrande': 5278,
  'Hotel Abi': 5280,
  'Hotel Aixo': 5282,
  'Hotel Boquilla': 5284,
  'Hotel Madisson': 5290,
  'Hotel Windsor': 5292,
  'Hotel Rodadero': 5294,
  'Hotel Axis': 12644,
  'Hotel Sansiraka': 12740,
  'Playa Salguero Hotel': 13676,
};

export function getHotelBitrixId(hotelNombre) {
  return HOTEL_A_BITRIX_ID[hotelNombre] ?? null;
}

/** Solo se puede enviar comprobante si el hotel existe en la lista de Bitrix. */
export function puedeEnviarComprobante(hotelNombre) {
  return getHotelBitrixId(hotelNombre) !== null;
}

// IDs del campo UF_CRM_1718396464904 ("Bank") de Bitrix.
const BANCO_BITRIX_OTROS = 5210;
const BANCOS_BITRIX = [
  { clave: 'bancolombia', id: 5206 },
  { clave: 'davivienda', id: 5208 },
  { clave: 'colpatria', id: 5216 },
  { clave: 'paypal', id: 5212 },
  { clave: 'payu', id: 5214 },
  { clave: 'cobre', id: 12604 },
];

/**
 * Traduce el nombre del banco de una cuenta al ID de la lista de Bitrix.
 * Busca por coincidencia parcial para tolerar "Bancolombia" y "Banco Bancolombia".
 * Si el banco no está en la lista, cae en "Otros" para no bloquear el envío.
 */
export function getBancoBitrixId(nombreBanco) {
  const normalizado = (nombreBanco ?? '').toLowerCase();
  const encontrado = BANCOS_BITRIX.find(({ clave }) =>
    normalizado.includes(clave)
  );
  return encontrado ? encontrado.id : BANCO_BITRIX_OTROS;
}
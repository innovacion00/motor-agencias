// Cuentas bancarias por grupo de hoteles, usadas en el modal de "Subir comprobante".
// `bitrixId` es el ID del ítem en el campo UF_CRM_1719335914 (Razón social) de Bitrix.
export const cuentasBancarias = {
  aixo: {
    label: 'Econo Hotel Group',
    bitrixId: 6142,
    accounts: [
      { banco: 'Banco Davivienda', titular: 'Econo Hotel Group', tipo: 'Cuenta Corriente', numero: '057169988813', nit: '901116843-1' },
      { banco: 'Banco Bancolombia', titular: 'Econo Hotel Group', tipo: 'Cuenta Corriente', numero: '09800001143', nit: '901116843-1' },
    ],
  },
  marina_madisson: {
    label: 'Dt Hoteles & Inn s.a.s',
    bitrixId: 6146,
    accounts: [
      { banco: 'Banco Davivienda', titular: 'DT HOTELES & INN S.A.S', tipo: 'Cuenta Corriente', numero: '0571-6999 0330', nit: '900.725.984-9' },
      { banco: 'Banco Bancolombia', titular: 'DT HOTELES & INN SAS', tipo: 'Cuenta Corriente', numero: '098-000011-52', nit: '900.725.984-9' },
    ],
  },
  azuan_avexi_rodadero_axis: {
    label: 'Caribe Hoteles & Suites s.a.s',
    bitrixId: 6144,
    accounts: [
      { banco: 'Banco Davivienda', titular: 'Caribe Hoteles & suites S.A.S', tipo: 'Cuenta Corriente', numero: '057169989969', nit: '900 801 256-0' },
      { banco: 'Banco Bancolombia', titular: 'Caribe Hoteles & suites S.A.S', tipo: 'Cuenta Corriente', numero: '098-0000-1054', nit: '900 801 256-0' },
    ],
  },
  abi_sansiraka: {
    label: 'Smart Stay s.a.s',
    bitrixId: 6148,
    accounts: [
      { banco: 'Banco Bancolombia', titular: 'SMART STAY SAS', tipo: 'Cuenta Corriente', numero: '08500008723', nit: '901691840-2' },
      { banco: 'Banco Davivienda', titular: 'SMART STAY SAS', tipo: 'Cuenta Corriente', numero: '057169987054', nit: '901691840-2' },
    ],
  },
  windsor: {
    label: 'Sociedad Hotelera Fam sas',
    bitrixId: 7106,
    accounts: [
      { banco: 'Banco Bancolombia', titular: 'SOCIEDAD HOTELERA FAM SAS', tipo: 'Cuenta Corriente', numero: '085-000088-34', nit: '901718424' },
      // { banco: 'Banco Davivienda', titular: 'SOCIEDAD HOTELERA FAM SAS', tipo: 'Cuenta Corriente', numero: '108969947457', nit: '901718424' },
    ],
  },
  boquilla: {
    label: 'Jarsy Eslyn Barboza Calvo',
    bitrixId: 13416,
    accounts: [
      { banco: 'Bancolombia', titular: 'JARSY ESLYN BARBOZA CALVO', tipo: 'Cuenta de Ahorros', numero: '09800008957' },
    ],
  },
  playa_salguero: {
    label: 'Evelyn Rios',
    bitrixId: 13680,
    accounts: [
      { banco: 'Bancolombia', titular: 'EVELYN RIOS', tipo: 'Cuenta de Ahorros', numero: '098-0000-19-82' },
    ],
  },
};

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

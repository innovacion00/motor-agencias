import React, { useEffect, useState, useRef, useMemo } from "react";
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';
import DropdownSearch from "./DropdownSearch";
import FormularioRetenciones from "./desglose/FormularioRetenciones";
import "./FormularioReserva.css";
import Swal from "sweetalert2";
import { format } from "@formkit/tempo";
import TablaDesglose from "./desglose/TablaDesglose";
import { currency } from "../stores/divisas";
import { useStore } from "@nanostores/react";
import ToursCs from "./ToursCs";
import { refreshToken } from "../stores/authtoken";
import Cookies from "js-cookie";
import {
  getBookingConnectCategoriesForHotel,
  getBookingConnectRatePlansForHotel,
} from "../constants/bookingConnectRatePlans";
import { getAlimentacionPrecio, getIvaPorcentaje } from "../stores/preciosExtras";

const plan_alimentacion = {
  9: false, //marina
  1: false, //azuan
  6: false, //avexi
  7: false, //bocagrande ( proximamente )
  4: true, //aixo
  5: true, //abi
  3: false, //madison
  10: false, //windsor
  8: false, //rodadero
  2: false, //1525
  48: true, //axis
  44: true, //sansiraka
  41: false, //Zulita
  56: true, // Boquilla,
};

/** Reservas vía endpoint legacy `/reservas/reservar` (no mytool). */
const FORCE_LEGACY_RESERVAS = true;
const LEGACY_RESERVA_HOTEL_AUTOCORE_IDS = new Set([48, 56]); // Axis, Boquilla

/**
 * Construye el desglose de precios (snapshot) que acompaña a la reserva.
 * La suma de ítems cuadra con el `total` enviado al backend.
 * Conceptos: hospedaje, tour, transporte, mascotas, alimentacion, impuestos,
 * retencion (negativo), vuelo.
 */
const construirDesglosePrecios = ({
  reserva,
  totalHuespedes,
  divisaSelec,
  valorIVA,
  tasaIVA,
  marcadoCena,
  marcadoAlmuerzo,
  cantnoches,
  DatosRetenciones,
  RetencionesPorcentaje,
  precioVueloPaquete,
  vuelosActivados,
}) => {
  const items = [];

  reserva.forEach((dato, index) => {
    const base = Number(dato.precioBaseHabitacion) || 0;
    if (base > 0) {
      items.push({
        concepto: "hospedaje",
        detalle: `Habitación ${dato.NombreH || `#${index + 1}`}`,
        cantidad: 1,
        precioUnitario: base,
        total: base,
      });
    }
  });

  const tourSeleccionados = reserva[0]?.tourSeleccionado || [];
  tourSeleccionados.forEach((tour) => {
    const tourPrice = parseFloat(
      divisaSelec === "USD" ? tour.preciousd : tour.preciocol
    );
    const precioTour = Number.isFinite(tourPrice) ? tourPrice : 0;
    const totalTour = precioTour * totalHuespedes;
    if (totalTour > 0) {
      items.push({
        concepto: "tour",
        detalle: tour.title,
        cantidad: totalHuespedes,
        precioUnitario: precioTour,
        total: totalTour,
      });
    }
  });

  const totalTraslado = reserva.reduce(
    (t, d) => t + (Number(d.precioTrasladoHabitacion) || 0),
    0
  );
  if (totalTraslado > 0) {
    items.push({
      concepto: "transporte",
      detalle: "Traslado aeropuerto - hotel",
      total: totalTraslado,
    });
  }

  const numeroMascotas = reserva.reduce(
    (t, d) => t + (Number(d.mascotas) || 0),
    0
  );
  const totalMascotas = reserva.reduce(
    (t, d) => t + (Number(d.precioMascotasHabitacion) || 0),
    0
  );
  if (totalMascotas > 0) {
    items.push({
      concepto: "mascotas",
      detalle: "Mascotas",
      cantidad: numeroMascotas,
      precioUnitario: numeroMascotas > 0 ? totalMascotas / numeroMascotas : 0,
      total: totalMascotas,
    });
  }

  if (marcadoCena > 0) {
    items.push({
      concepto: "alimentacion",
      detalle: "Cena",
      cantidad: totalHuespedes * cantnoches,
      precioUnitario: getAlimentacionPrecio("Cena"),
      total: marcadoCena,
    });
  }
  if (marcadoAlmuerzo > 0) {
    items.push({
      concepto: "alimentacion",
      detalle: "Almuerzo",
      cantidad: totalHuespedes * cantnoches,
      precioUnitario: getAlimentacionPrecio("Almuerzo"),
      total: marcadoAlmuerzo,
    });
  }

  if (valorIVA > 0) {
    items.push({
      concepto: "impuestos",
      detalle: `IVA ${Math.round(tasaIVA * 100)}%`,
      total: valorIVA,
    });
  }

  if (DatosRetenciones != null) {
    const retenciones = [
      {
        etiqueta: "ReteFuente",
        valor: DatosRetenciones.calculo_rtf_fte,
        porcentaje: RetencionesPorcentaje?.reteFuente,
      },
      {
        etiqueta: "ReteIca",
        valor: DatosRetenciones.calculo_rtf_ica,
        porcentaje: RetencionesPorcentaje?.reteIca,
      },
      {
        etiqueta: "ReteIva",
        valor: DatosRetenciones.calculo_rtf_iva,
        porcentaje: RetencionesPorcentaje?.reteIva,
      },
    ];
    retenciones.forEach((r) => {
      const valor = Number(r.valor) || 0;
      if (valor > 0) {
        items.push({
          concepto: "retencion",
          detalle: r.porcentaje ? `${r.etiqueta} ${r.porcentaje}%` : r.etiqueta,
          total: -valor,
        });
      }
    });
  }

  if (vuelosActivados && precioVueloPaquete > 0) {
    items.push({
      concepto: "vuelo",
      detalle: "Paquete de vuelo",
      total: precioVueloPaquete,
    });
  }

  return items.map((item) => ({
    concepto: item.concepto,
    ...(item.detalle ? { detalle: String(item.detalle) } : {}),
    ...(item.cantidad ? { cantidad: item.cantidad } : {}),
    ...(item.precioUnitario != null
      ? { precioUnitario: item.precioUnitario }
      : {}),
    total: Math.round(item.total * 100) / 100,
  }));
};

const BOOKING_CONNECT_MOTIVO_ID_BY_HOTEL = Object.freeze({
  1: 7, // Azuan
  3: 7, // Madisson
  4: 2, // Aixo
  5: 8, // Abi
  6: 8, // Avexi
  8: 8, // Rodadero
  9: 8, // Marina
  10: 7, // Windsor
  44: 8, // Sansiraka
  48: 8, // Axis
  56: 8, // Boquilla
  123: 8, // Playa Salguero
  164: 8, // El Marques
});

const BOOKING_CONNECT_ROOM_MAPNAME_BY_HOTEL = Object.freeze({
  4: Object.freeze([
    { roomId: 83422, mapName: "DBSuperior" },
    { roomId: 83420, mapName: "DBEstandart" },
    { roomId: 83421, mapName: "FMEstandart" },
    { roomId: 83419, mapName: "FMSuperior" },
  ]),
  9: Object.freeze([
    { roomId: 83527, mapName: "St.Triple" },
    { roomId: 83528, mapName: "St. Doble" },
    { roomId: 83527, mapName: "St. Cuadruple" },
  ]),
  6: Object.freeze([
    { roomId: 83532, mapName: "St. Doble" },
    { roomId: 83529, mapName: "St. Cuadruple" },
    { roomId: 83529, mapName: "St. Doble2" },
  ]),
  1: Object.freeze([
    { roomId: 83533, mapName: "FAMILIAR " },
    { roomId: 83534, mapName: "MATRIMONIAL" },
  ]),
  5: Object.freeze([
    { roomId: 125839, mapName: "Familiar 5pax" },
    { roomId: 125838, mapName: "Cuadruple" },
    { roomId: 125837, mapName: "Triple" },
    { roomId: 125836, mapName: "Doble Estandar" },
  ]),
  48: Object.freeze([
    { roomId: 145577, mapName: "Quintuple" },
    { roomId: 145576, mapName: "Cuadruple" },
    { roomId: 145573, mapName: "Triple" },
    { roomId: 145571, mapName: "Doble" },
  ]),
  44: Object.freeze([
    { roomId: 104184, mapName: "Quintuple" },
    { roomId: 104183, mapName: "Cuadruple" },
    { roomId: 104182, mapName: "Triple" },
    { roomId: 104181, mapName: "Junior Suite" },
    { roomId: 104179, mapName: "Doble" },
    { roomId: 104979, mapName: "Twin" },
  ]),
  8: Object.freeze([
    { roomId: 121966, mapName: "Doble" },
    { roomId: 125832, mapName: "Triple" },
    { roomId: 125833, mapName: "Cuadruple" },
  ]),
  123: Object.freeze([
    { roomId: 164099, mapName: "Doble" },
    { roomId: 164101, mapName: "Cuadruple" },
    { roomId: 164100, mapName: "Triple" },
  ]),
  3: Object.freeze([
    { roomId: 109452, mapName: "ESTANDAR" },
    { roomId: 109509, mapName: "FAMILIAR" },
    { roomId: 109508, mapName: "EJECUTIVA TWIN" },
    { roomId: 109507, mapName: "SUITE BUSINESS" },
    { roomId: 109505, mapName: "SUPERIOR CON TERRAZA" },
    { roomId: 116068, mapName: "FAMILIAR3PAX" },
  ]),
  10: Object.freeze([
    { roomId: 129037, mapName: "SUITE MATRIMONIAL" },
    { roomId: 129036, mapName: "JUNIOR SUITE TWIN" },
    { roomId: 129035, mapName: "JUNIOR SUITE DOBLE" },
    { roomId: 129034, mapName: "TRIPLE ESTANDAR" },
    { roomId: 129033, mapName: "DOBLE ESTANDAR TWIN" },
    { roomId: 128299, mapName: "DOBLE SUPERIOR" },
  ]),
  // El Marques
  164: Object.freeze([
    { roomId: 168468, mapName: "Familiar" },
    { roomId: 168467, mapName: "Delux" },
    { roomId: 168465, mapName: "Junior Suite" },
  ]),
});

//#region UseState
const FormularioReserva = () => {
  const [reserva, setReserva] = useState([]);
  const [agencia, setagencia] = useState();

  const [cena, setCena] = useState(false);
  const [almuerzo, setAlmuerzo] = useState(false);
  const hotelIdsPermitidos = [
    // "13633", //Aixo
    // "17644", //Abi
    // "13677", //Boquilla
    // "18004", //Windsor
    // "16255", //Madisson
    // "19629", //Axis
    // "15740", //Sansiraka
  ];

  const [datosreserva, setDatosreserva] = useState([]);
  const [mostrarTexto, setMostrarTexto] = useState(false); // Estado para controlar la visibilidad del texto //false para mas de 72h
  const [mostrarBoton, setmostrarBoton] = useState(false);
  const [fechasreserva, setfechasreserva] = useState();
  const currentCurrency = useStore(currency); //USD O COP
  const [cantadultos, setcantadultos] = useState();
  const [cantninos, setcantninos] = useState();
  const [botondesactivado, setbotondesactivado] = useState(false); //controlar el boton de reserva
  const [esExtranjero, setesExtranjero] = useState(false);
  // Factura electrónica obligatoria: siempre activa, el usuario solo elige a quién se factura
  const [facturaE, setfacturaE] = useState(true);
  const [facturaTipo, setfacturaTipo] = useState(""); // "cliente" | "agencia"
  const [planDeAlimentacion, setplanDeAlimentacion] = useState();
  const [divisaSelec, setdivisaSelec] = useState("COP");
  // Modo vuelo+hotel (formularios dinámicos por pasajero)
  const [vuelosActivados, setVuelosActivados] = useState(false);
  const [numPasajeros, setNumPasajeros] = useState(1);
  const [flightData, setFlightData] = useState(null);
  const [baggageData, setBaggageData] = useState(null);
  const CEDULA_DOCUMENT_EXPIRATION = "2060-09-08";
  const tiposDocumentoMap = {
    cedulaC: "CC",
    cedulaE: "CE",
    pasaporte: "PA",
    nit: "NIT",
    otro: "CC",
    CC: "CC",
    CE: "CE",
    PA: "PA",
    NIT: "NIT",
  };

  const normalizarTipoDocumento = (tipoDocumento = "") => {
    return tiposDocumentoMap[tipoDocumento] || tipoDocumento;
  };

  const requiresDocumentExpirationDate = (tipoDocumento) =>
    normalizarTipoDocumento(tipoDocumento) === "PA";

  const getDocumentExpiration = (passenger) => {
    const tipo = normalizarTipoDocumento(passenger?.tipoDocumento || "");
    if (tipo === "CC" || tipo === "CE") {
      return CEDULA_DOCUMENT_EXPIRATION;
    }
    if (requiresDocumentExpirationDate(tipo)) {
      return passenger?.fechaCaducidadDocumento || "";
    }
    return "";
  };

  const createEmptyPassenger = () => ({
    tipoDocumento: "",
    numeroDocumento: "",
    fechaCaducidadDocumento: "",
    nombreCompleto: "",
    apellidos: "",
    fechaNacimiento: "",
    email: "",
    celular: "",
    telefonotraslado: "",
    numeroVuelo: "",
    numeroVueloSalida: "",
    aereolinea: "",
    esExtranjero: false,
  });
  const [formDataList, setFormDataList] = useState([createEmptyPassenger()]);
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    numeroDocumento: "",
    fechaCaducidadDocumento: "",
    nombreCompleto: "",
    apellidos: "",
    fechaNacimiento: "",
    email: "",
    celular: "",
    nombreEmpresa: "",
    nit: "",
    emailEmpresa: "",
    telefonoF: "",
    telefonotraslado: "",
    numeroVuelo: "",
    numeroVueloSalida: "",
    aereolinea: "",

    // esExtranjero:false
  });

  //#region UseEffect
  useEffect(() => {
    const divisa = localStorage.getItem("selectedCurrency");
    setdivisaSelec(divisa);
    const data = JSON.parse(localStorage.getItem("nochesyedades"));
    if (data && data.dateRange?.startDate) {
      const startDate = new Date(data.dateRange.startDate); // Convertir a objeto Date
      const now = new Date(); // Fecha actual

      // Calcular la diferencia en horas
      const diffInHours = (startDate - now) / (1000 * 60 * 60);

      //mostrar boton
      if (diffInHours < 72) {
        setmostrarBoton(true);
      }

      // mostrar texto
      if (diffInHours < 72) {
        setMostrarTexto(true);
      }
    }
    const reservas = JSON.parse(localStorage.getItem("datosreserva")) || [];
    const informacion = JSON.parse(localStorage.getItem("datosreserva"));
    const adultos = JSON.parse(localStorage.getItem("cantAdultos"));
    const ninos = JSON.parse(localStorage.getItem("cantNinos"));
    const fechas = JSON.parse(localStorage.getItem("nochesyedades"));
    const token = JSON.parse(localStorage.getItem("datosUsuario"));
    setDatosreserva(reservas);
    setReserva(informacion);
    setcantadultos(adultos);
    setcantninos(ninos);
    setfechasreserva(fechas);
    setagencia(token);
    // Activación formularios de pasajeros por vuelo
    try {
      const datosDelVuelo = JSON.parse(localStorage.getItem("datosDelVuelo"));
      const activado = datosDelVuelo?.activado === true;
      setVuelosActivados(activado);

      // Intentar obtener número de huéspedes desde datosreserva.huespedes o sumar adultos+ninos
      const reservasLS = informacion || [];
      let huespedesLS = 0;
      if (Array.isArray(reservasLS) && reservasLS.length > 0) {
        // Si huespedes es numérico, usar suma; si es string, intentar parsear dígitos
        huespedesLS = reservasLS.reduce((acc, item) => {
          if (typeof item?.huespedes === "number") return acc + item.huespedes;
          if (typeof item?.huespedes === "string") {
            const nums = item.huespedes.match(/\d+/g);
            const suma = nums?.map(Number).reduce((a, b) => a + b, 0) || 0;
            return acc + (suma || 0);
          }
          return acc;
        }, 0);
      }
      const calculado = Number(huespedesLS) > 0 ? Number(huespedesLS) : (Number(adultos || 0) + Number(ninos || 0) || 1);
      setNumPasajeros(calculado);
      if (activado) {
        setFormDataList(Array.from({ length: calculado }, () => createEmptyPassenger()));
      }
    } catch (e) {
      // fallback seguro
      const calculado = (Number(adultos || 0) + Number(ninos || 0) || 1);
      setNumPasajeros(calculado);
      setVuelosActivados(false);
    }

    // Cargar datos del vuelo seleccionado (sin procesar aún)
    try {
      const datosReservaVuelos = JSON.parse(localStorage.getItem('datosReservaVuelos'));
      const dataVueloEquipaje = JSON.parse(localStorage.getItem('dataVueloEquipaje'));
      
      if (datosReservaVuelos) {
        setFlightData(datosReservaVuelos);
      }
      
      if (dataVueloEquipaje) {
        setBaggageData(dataVueloEquipaje);
      }
    } catch (e) {
      console.error('Error al cargar datos del vuelo:', e);
    }
  }, []);

  // Autocompletar los datos de factura electrónica con los del titular cuando se factura al cliente
  useEffect(() => {
    if (!facturaE || facturaTipo !== "cliente") return;
    const titularCliente = vuelosActivados ? formDataList[0] : formData;
    const nombreFactura = `${titularCliente?.nombreCompleto || ""} ${titularCliente?.apellidos || ""}`.trim();
    const nitFactura = titularCliente?.numeroDocumento || "";
    const telefonoFactura = titularCliente?.celular || "";
    const emailFactura = agencia?.email || "";

    setFormData((prev) => {
      if (
        prev.nombreEmpresa === nombreFactura &&
        prev.nit === nitFactura &&
        prev.telefonoF === telefonoFactura &&
        prev.emailEmpresa === emailFactura
      ) {
        return prev;
      }
      return {
        ...prev,
        nombreEmpresa: nombreFactura,
        nit: nitFactura,
        telefonoF: telefonoFactura,
        emailEmpresa: emailFactura,
      };
    });
  }, [
    facturaE,
    facturaTipo,
    vuelosActivados,
    agencia,
    formData.nombreCompleto,
    formData.apellidos,
    formData.numeroDocumento,
    formData.celular,
    formDataList[0]?.nombreCompleto,
    formDataList[0]?.apellidos,
    formDataList[0]?.numeroDocumento,
    formDataList[0]?.celular,
  ]);

  const mostrarCheckboxes =
    divisaSelec !== "USD" &&
    datosreserva.some(
      (reserva) =>
        hotelIdsPermitidos.includes(reserva.hotelid) &&
        reserva.plandealimentacion === "Solo desayuno"
    );

  const hotelExentoIVA = getIvaPorcentaje(reserva[0]?.hotelidAutocore) === 0;

  const [RetencionesPorcentaje, setRetencionesPorcentaje] = useState(null);
  const [DatosRetenciones, setDatosRetenciones] = useState(null);
  //convertir esExtranjero
  const valorextranjero =
    esExtranjero == true ? "es extranjero" : "NO es extanjero";

  // PARSEA NUMEROS DE BODY A STRING
  const totalHuespedes = cantadultos + cantninos;
  const adults = JSON.stringify(cantadultos);
  const ninos = JSON.stringify(cantninos);
  const ninos1 = cantninos === 0 ? "" : JSON.stringify(cantninos);
  const noches = JSON.stringify(reserva[0]?.nights);
  const habitaciones = JSON.stringify(reserva.length);
  const cantnoches = reserva[0]?.nights;

  // FORMATEA CORRECTAMENTE LAS FECHAS
  const checkin = format(
    fechasreserva?.dateRange?.startDate,
    "YYYY-MM-DD",
    "es"
  );
  const checkout = format(
    fechasreserva?.dateRange?.endDate,
    "YYYY-MM-DD",
    "es"
  );

  //CONVETIR EDADES EN STRING Y SEPARARLOS POR COMA
  const childrenAgesString =
    fechasreserva?.layout
      .flatMap((room) => room.children_ages || [])
      .join(",") || "";

  //ARREGLO CON EL RANGO DE EDADES DE LOS NIÑOS
  const edadesninos = fechasreserva?.layout.map((dato) =>
    dato.children_ages.join(",")
  );
  // CONSOLE.LOG("EDADES NIÑOS",EDADESNINOS)

  const manejarDatos = (datosHijo, rtePorcentajes) => {
    //  console.log("Datos recibidos del hijo:", datosHijo);
    setDatosRetenciones(datosHijo);
    setRetencionesPorcentaje(rtePorcentajes);
  };

  //#region tipo de translado
  const tipodetraslado = (() => {
    const tipoTraslado = reserva[0]?.tipoTraslado;

    if (tipoTraslado === "aeropuerto_hotel") return 0;
    if (tipoTraslado === "hotel_aeropuerto") return 1;
    if (tipoTraslado === "ambos") return 2;
    return null;
  })();

  //CALCULO DEL IVA
  const marcadoAlmuerzo = almuerzo
    ? totalHuespedes * cantnoches * getAlimentacionPrecio("Almuerzo")
    : 0;
  const marcadoCena = cena
    ? totalHuespedes * cantnoches * getAlimentacionPrecio("Cena")
    : 0;
  const totalConAdiciones = marcadoCena + marcadoAlmuerzo;
  const totalPrecio = reserva.reduce((total, data) => total + data.precio, 0); //Calcular valor total de las habitaciones
  const tasaIVA = getIvaPorcentaje(reserva[0]?.hotelidAutocore);
  const valorIVA = esExtranjero || hotelExentoIVA ? 0 : totalPrecio * tasaIVA;
  const totalConIVA = totalPrecio + valorIVA + totalConAdiciones; //Calcular valor total + IVA + las adiciones
  // console.log(totalConIVA);
  // let totalRetenciones = DatosRetenciones == null ? (totalConIVA) : (totalConIVA - (DatosRetenciones.calculo_rtf_fte + DatosRetenciones.calculo_rtf_ica + DatosRetenciones.calculo_rtf_iva))

  const totalRetencionesF = () => {
    if (DatosRetenciones == null) {
      return totalConIVA;
    } else {
      return (
        totalConIVA -
        (DatosRetenciones.calculo_rtf_fte +
          DatosRetenciones.calculo_rtf_ica +
          DatosRetenciones.calculo_rtf_iva)
      );
    }
  };

  const totalRetenciones = totalRetencionesF();

  const obtenerTrm = (reservas) => {
    if (!Array.isArray(reservas) || reservas.length === 0) return null;
    const trm = reservas.find((r) => r?.trm != null)?.trm ?? reservas[0]?.trm;
    const parsed = parseFloat(trm);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const aplicarTrmSiCop = (precioUsd) => {
    const precio = parseFloat(String(precioUsd).replace(/,/g, "")) || 0;
    if (divisaSelec === "USD") return precio;
    const trm = obtenerTrm(datosreserva);
    return trm ? precio * trm : precio;
  };

  const parseFlightPackageTotalPrice = () => {
    try {
      const packageData = JSON.parse(localStorage.getItem("flightPackageData") || "null");
      const raw = packageData?.totalPrice ?? packageData?.flightBookPrice ?? 0;
      const parsed = parseFloat(String(raw).replace(/,/g, ""));
      return Number.isFinite(parsed) ? aplicarTrmSiCop(parsed) : 0;
    } catch {
      return 0;
    }
  };

  const precioVueloPaquete = vuelosActivados ? parseFlightPackageTotalPrice() : 0;
  const totalReservaConVuelo = totalRetenciones + precioVueloPaquete;
  // console.log(totalRetenciones)
  //  console.log(checkin);
  const {
    tipoDocumento,
    numeroDocumento,
    fechaNacimiento,
    nombreCompleto,
    apellidos,
    email,
    celular,
  } = formData;

  const enviartraslado = reserva[0]?.incluirTraslado === true;
  console.log(enviartraslado);
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setFormData((prev) => {
      const next = { ...prev, [id]: nextValue };
      if (id === "tipoDocumento" && !requiresDocumentExpirationDate(nextValue)) {
        next.fechaCaducidadDocumento = "";
      }
      return next;
    });
  };

  // Manejador por índice para formularios de pasajeros
  const handleChangeIndexed = (index, e) => {
    const { id, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setFormDataList((prev) => {
      const next = [...prev];
      const updated = {
        ...next[index],
        [id]: nextValue,
      };
      if (id === "tipoDocumento" && !requiresDocumentExpirationDate(nextValue)) {
        updated.fechaCaducidadDocumento = "";
      }
      next[index] = updated;
      return next;
    });
  };

  const normalizeMealPlan = (mealPlan) => {
    const normalized = String(mealPlan || "").toLowerCase();
    if (normalized.includes("media")) return "PAM";
    if (normalized.includes("pension completa")) return "PA";
    return "";
  };

  const getRatePlanMapName = (agencyCategory, mealPlan) => {
    const isNeto = Number(agencyCategory) === 0;
    const base = isNeto ? "Booking Connect Neto" : "Booking Connect Mayorista";
    const mealSuffix = normalizeMealPlan(mealPlan);
    return mealSuffix ? `${base} ${mealSuffix}` : base;
  };

  const mapDocumTypeId = (documentType) => {
    const map = {
      cedulaC: 1,
      pasaporte: 3,
      cedulaE: 5,
      otro: 31,
    };
    return map[documentType] || 31;
  };

  const buildDayPrice = (startDate, endDate, basePrice) => {
    const prices = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    const safePrice = Number(basePrice) || 0;

    while (current < end) {
      prices.push({
        fecha: current.toISOString().slice(0, 10),
        precioBase: safePrice,
      });
      current.setDate(current.getDate() + 1);
    }
    return prices;
  };

  const normalizeCategoryName = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const resolveCategoryId = (hotelAutocoreId, roomName, roomId) => {
    const numericHotelId = Number(hotelAutocoreId);
    const numericRoomId = Number(roomId);
    const categories = getBookingConnectCategoriesForHotel(numericHotelId) || [];
    const roomMappings = BOOKING_CONNECT_ROOM_MAPNAME_BY_HOTEL[numericHotelId] || [];

    const mappedByRoomId = roomMappings.filter((item) => Number(item.roomId) === numericRoomId);
    const targetMapName =
      mappedByRoomId.find(
        (item) => normalizeCategoryName(item.mapName) === normalizeCategoryName(roomName)
      )?.mapName ||
      mappedByRoomId[0]?.mapName ||
      roomName;

    const byMappedName = categories.find(
      (item) => normalizeCategoryName(item.mapName) === normalizeCategoryName(targetMapName)
    );

    if (byMappedName?.mapCode) return Number(byMappedName.mapCode);
    return 1;
  };

  const fetchWithToken = async (url, options = {}) => {
    let token = Cookies.get('accessToken');
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    return response;
  };

  const mapDocumentTypeForFlight = (tipoDocumento) => {
    if (normalizarTipoDocumento(tipoDocumento) === "PA") return "PASSPORT";
    return "IDENTITY_CARD";
  };

  const formatPhoneWithCountrySpace = (rawPhone = "") => {
    const value = String(rawPhone || "").trim();
    if (!value.startsWith("+")) return value;

    const normalized = value.replace(/\s+/g, " ");
    const withSpaceMatch = normalized.match(/^(\+\d{1,4})\s+(.+)$/);
    if (withSpaceMatch) {
      const code = withSpaceMatch[1];
      const number = withSpaceMatch[2].replace(/\s+/g, "");
      return `${code} ${number}`;
    }

    const digits = normalized.replace(/\D/g, "");
    if (!digits) return value;

    // Inferir longitud del código país usando teléfono local de 10 dígitos (caso principal del negocio).
    const inferredCodeLen = digits.length - 10;
    const countryCodeLen =
      inferredCodeLen >= 1 && inferredCodeLen <= 3 ? inferredCodeLen : 2;

    const countryCode = digits.slice(0, countryCodeLen);
    const number = digits.slice(countryCodeLen);
    return number ? `+${countryCode} ${number}` : `+${countryCode}`;
  };

  const buildFlightPassengersPayload = (passengers = []) => {
    return passengers.map((passenger, index) => ({
      passengerId: String(index),
      type_passenger: "adult",
      title: "Mr",
      name: passenger.nombreCompleto || "",
      surname: passenger.apellidos || "",
      email: passenger.email || "",
      contact_number: formatPhoneWithCountrySpace(passenger.celular || ""),
      date_of_birth: passenger.fechaNacimiento || "",
      document_type: mapDocumentTypeForFlight(passenger.tipoDocumento),
      document_number: passenger.numeroDocumento || "",
      document_issuance: "CO",
      document_issuance_date: "2020-01-15",
      document_expiration: getDocumentExpiration(passenger),
      document_residence: "ARONA",
      country_id: "CO",
      address: "Calle Noname 7",
      province: "BOLIVAR",
      city: "CARTAGENA",
      postalcode: "130002",
      residence_type: "DNI",
      residence: "ARONA",
      frequent_flyer_number: "43234512",
      frequent_flyer_type: "IBERIA",
    }));
  };

  const createFlightReservation = async ({ reservaChatbotId, passengers }) => {
    const packageIdFromStorage = localStorage.getItem("flightPackageId");
    const packageDataFromStorage = JSON.parse(localStorage.getItem("flightPackageData") || "null");
    const packageId = packageIdFromStorage || packageDataFromStorage?.packageId || "";

    if (!packageId) {
      throw new Error("No se encontró el packageId para finalizar la reserva de vuelos.");
    }

    const flightPayload = {
      reservaChatbotId,
      packageId,
      hotel_id: "",
      partner_id: "20317285-8045-4336-92f4-efdd24aab67f",
      passengers: buildFlightPassengersPayload(passengers),
      payment: {
        payment_type: "FLIGHT_ONLY",
      },
    };

    const flightUrl = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/vuelos/maarlab/reservar?info=all`;
    const flightResponse = await fetchWithToken(flightUrl, {
      method: "POST",
      body: JSON.stringify(flightPayload),
    });

    if (!flightResponse.ok) {
      const errorText = await flightResponse.text();
      throw new Error(
        `No se pudo crear la reserva de vuelos: ${flightResponse.status} ${flightResponse.statusText}${errorText ? ` - ${errorText}` : ""}`
      );
    }

    return await flightResponse.json();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      tipoDocumento.trim() == "" ||
      numeroDocumento.trim() == "" ||
      fechaNacimiento.trim() == "" ||
      nombreCompleto.trim() == "" ||
      apellidos.trim() == "" ||
      email.trim() == "" ||
      celular.trim() == ""
    ) {
      Swal.fire({
        //Alerta de datos de incio de sesion incorrectos
        icon: "error",
        title: "Complete la información",
        text: "Todos los campos del titular son obligatorios",
        showConfirmButton: false,
        timer: 3500,
      });
      return;
    }
    if (facturaTipo === "") {
      Swal.fire({
        icon: "error",
        title: "Complete la información",
        text: "Seleccione si la factura electronica es para el cliente o para la agencia",
        showConfirmButton: false,
        timer: 3500,
      });
      return;
    }
    if (
      facturaTipo === "agencia" &&
      (formData.nombreEmpresa.trim() === "" ||
        formData.nit.trim() === "" ||
        formData.emailEmpresa.trim() === "" ||
        formData.telefonoF.trim() === "")
    ) {
      Swal.fire({
        icon: "error",
        title: "Complete la información",
        text: "Todos los campos de la factura electronica son obligatorios",
        showConfirmButton: false,
        timer: 3500,
      });
      return;
    }
    const enviardatos = async () => {
      const filtrarRetenciones = (retenciones) => {
        return Object.fromEntries(
          Object.entries(retenciones).filter(([_, value]) => {
            return value.resultado !== 0 || value.porcentaje !== 0;
          })
        );
      };
      const facturaTexto = !facturaE
        ? ""
        : facturaTipo === "cliente"
          ? ` Se ha solicitado generar factura electronica a nombre de cliente con correo de la agencia ${agencia?.email || ""}. `
          : ` Se ha solicitado generar factura electronica. Nombre de la empresa: ${formData.nombreEmpresa}. Nit: ${formData.nit}. Correo de la empresa:${formData.emailEmpresa}. Telefono de la empresa: ${formData.telefonoF} `;
      const hotelIdAutocore = Number(reserva[0]?.hotelidAutocore);
      const isLegacyReservation =
        FORCE_LEGACY_RESERVAS ||
        LEGACY_RESERVA_HOTEL_AUTOCORE_IDS.has(hotelIdAutocore);

      let informacionD;
      let url;

      if (isLegacyReservation) {
        const retencionesLegacy = filtrarRetenciones({
          reteFuente: {
            resultado: Math.round(DatosRetenciones?.calculo_rtf_fte) || 0,
            porcentaje: Number(RetencionesPorcentaje?.reteFuente) || 0,
          },
          reteIca: {
            resultado: Math.round(DatosRetenciones?.calculo_rtf_ica) || 0,
            porcentaje: Number(RetencionesPorcentaje?.reteIca) || 0,
          },
          reteIva: {
            resultado: Math.round(DatosRetenciones?.calculo_rtf_iva) || 0,
            porcentaje: Number(RetencionesPorcentaje?.reteIva) || 0,
          },
        });

        const r0 = reserva[0];
        const notesSinRetenciones =
          `Creada por la agencia: ${agencia?.agencia?.fullName ?? ""}. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto} ${formData.apellidos}. ${valorextranjero == "es extranjero" ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia." : ""} Tipo de traslado:  ${r0?.tipoTraslado} ${cena ? "El huésped ha solicitado cena." : ""} ${almuerzo ? "El huésped ha solicitado almuerzo." : ""}${facturaTexto}${r0?.tourSeleccionado && r0.tourSeleccionado.length > 0 ? ` Tours seleccionados: ${r0.tourSeleccionado.map((tour) => tour.title).join(", ")}.` : ""}${r0?.mascotas && r0.mascotas > 0 ? ` Se han enviado ${r0.mascotas} mascota(s).` : ""}  `;

        const notesConRetenciones =
          `Creada por la agencia: ${agencia?.agencia?.fullName ?? ""}. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto} ${formData.apellidos}, la agencia marcó que aplica retenciones, verificar en la plataforma Booking Connect porcentajes y valores. ${valorextranjero == "es extranjero" ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia." : ""} Tipo de traslado: ${r0?.tipoTraslado} ${cena ? "La agencia marco la casilla de solicitar cena." : ""} ${almuerzo ? "La agencia marco la casilla de solicitar almuerzo." : ""}${facturaTexto}${r0?.tourSeleccionado && r0.tourSeleccionado.length > 0 ? ` Tours seleccionados: ${r0.tourSeleccionado.map((tour) => tour.title).join(", ")}.` : ""}${r0?.mascotas && r0.mascotas > 0 ? ` Se han enviado ${r0.mascotas} mascota(s).` : ""}`;

        const legacyPayload = {
          total: Math.round(totalRetenciones),
          mascotasNumber: reserva[0]?.mascotas || null,
          adicionAlmuerzo: almuerzo,
          adicionCena: cena,
          titularInfo: {
            firstName: formData.nombreCompleto,
            lastName: formData.apellidos,
            tipoDocumento: normalizarTipoDocumento(formData.tipoDocumento),
            documento: formData.numeroDocumento,
            fechaNacimiento: formData.fechaNacimiento,
          },
          infoTransporte:
            reserva[0]?.incluirTraslado === true
              ? {
                  numeroVuelo: formData.numeroVuelo,
                  ...((reserva[0]?.tipoTraslado === "hotel_aeropuerto" ||
                    reserva[0]?.tipoTraslado === "ambos") && {
                    numeroVueloSalida: formData.numeroVueloSalida,
                  }),
                  firstContactNumber: formData.telefonotraslado,
                  aerolinea: formData.aereolinea,
                  tipoRecogida: tipodetraslado,
                  cantidadPersonas: totalHuespedes,
                }
              : null,
          infoToures:
            reserva[0]?.tourSeleccionado?.length > 0
              ? {
                  nombres: reserva[0].tourSeleccionado.map((tour) => tour.title),
                  firstContactNumber: formData.celular,
                  secondContacNumber:
                    formData.telefonotraslado || formData.celular,
                }
              : null,
          ...retencionesLegacy,
          planAlimentario: reserva[0]?.plandealimentacion,
          exentoIva: esExtranjero,
          reservaInfo: {
            agency: {
              is_agency: true,
              agency_type: agencia?.agencia?.category,
              external_ref_id: "666222",
            },
            reservation: {
              adults,
              checkin,
              checkout,
              children: ninos,
              children_ages: childrenAgesString,
              city: reserva[0]?.ciudad,
              country: "COL",
              currency: divisaSelec || "COP",
              email: formData.email,
              firstName: formData.nombreCompleto,
              lastName: formData.apellidos,
              nights: noches,
              notes:
                DatosRetenciones == null
                  ? notesSinRetenciones
                  : notesConRetenciones,
              rooms: habitaciones,
              roomsData: reserva.map((dato, index) => {
                const roomConfig = fechasreserva?.layout?.[index] || {};
                return {
                  nombreHabitacion: dato.NombreH,
                  adults: JSON.stringify(roomConfig.adults || 0),
                  children_ages: roomConfig.children_ages?.join(",") || "",
                  children: roomConfig.children_ages
                    ? JSON.stringify(roomConfig.children_ages.length)
                    : "",
                  checkin,
                  checkout,
                  currency: currentCurrency,
                  id: dato.roomId,
                  quantity: "1",
                  rateId: dato.rateId,
                  unitaryPrice: dato.precio,
                  precioBase: Number.isFinite(Number(dato.precioBase))
                    ? Number(dato.precioBase)
                    : undefined,
                };
              }),
              telephone: `${formData.celular}`,
            },
          },
          desglosePrecios: construirDesglosePrecios({
            reserva,
            totalHuespedes,
            divisaSelec,
            valorIVA,
            tasaIVA,
            marcadoCena,
            marcadoAlmuerzo,
            cantnoches,
            DatosRetenciones,
            RetencionesPorcentaje,
            precioVueloPaquete,
            vuelosActivados,
          }),
        };

        const legacyMissing = [];
        if (reserva[0]?.hotelid == null || reserva[0]?.hotelid === "")
          legacyMissing.push("hotelid (roomcloud)");
        if (!checkin || !checkout) legacyMissing.push("checkin/checkout");
        if (!agencia?.agencia) legacyMissing.push("agencia");

        if (legacyMissing.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Faltan datos para crear la reserva",
            text: `No se puede enviar la reserva. Campos faltantes: ${legacyMissing.join(", ")}`,
          });
          setbotondesactivado(false);
          return;
        }

        informacionD = JSON.stringify(legacyPayload);
        url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/reservar?hotelId=${reserva[0].hotelid}`;
      } else {
      const hotelSeleccionado = JSON.parse(localStorage.getItem("hotelSeleccionado") || "{}");
      const hotelSlug = hotelSeleccionado?.nombre;
      const hotelId = hotelIdAutocore;
      const hotelRatePlans = getBookingConnectRatePlansForHotel(hotelId) || [];
      const expectedRatePlanName = getRatePlanMapName(
        agencia?.agencia?.category,
        reserva[0]?.plandealimentacion
      );
      const mappedRatePlan = hotelRatePlans.find(
        (item) =>
          String(item.mapName || "").toLowerCase() === expectedRatePlanName.toLowerCase()
      );
      const ratePlan = mappedRatePlan ? String(mappedRatePlan.mapCode) : "";
      const motivoId = BOOKING_CONNECT_MOTIVO_ID_BY_HOTEL[hotelId] ?? 8;

      const [name = "", ...otherNames] = String(formData.nombreCompleto || "").trim().split(" ");
      const [firstLastName = "", secondLastName = ""] = String(formData.apellidos || "")
        .trim()
        .split(" ");

      const rooms = reserva.map((dato, index) => {
        const roomConfig = fechasreserva?.layout?.[index] || {};
        const roomAdults = Number(roomConfig.adults || dato?.huespedes || 0);
        const roomChilds = Array.isArray(roomConfig.children_ages)
          ? roomConfig.children_ages.length
          : 0;
        const categoriaId = resolveCategoryId(
          hotelId,
          dato?.NombreH,
          dato?.roomId
        );
        return {
          categoriaId,
          nombreHabitacion: String(dato?.NombreH || ""),
          room_id: String(dato?.roomId || ""),
          paxAdultos: roomAdults,
          paxChilds: roomChilds,
          dayPrice: buildDayPrice(checkin, checkout, dato?.precioBase),
          guest: [],
        };
      });
      const acomodaciones = reserva
        .map((dato) => String(dato?.NombreH || "").trim())
        .filter(Boolean)
        .join(", ");

      const nochesNum = Number(reserva[0]?.nights) || 0;
      const divisorNoches = nochesNum > 0 ? nochesNum : 1;
      const textoPreciosPorDia = reserva
        .map((dato) => {
          const nombreH = String(dato?.NombreH || "").trim() || "Habitación";
          let numerador = Number(dato?.precio);
          if (!Number.isFinite(numerador) || numerador <= 0) {
            numerador = Number(dato?.precioBase);
          }
          if (!Number.isFinite(numerador) || numerador <= 0) return null;
          const precioDia = numerador / divisorNoches;
          if (!Number.isFinite(precioDia) || precioDia < 0) return null;
          const monto =
            divisaSelec === "USD"
              ? `${precioDia} USD`
              : `${formatCurrency(Math.round(precioDia))} COP`;
          return `${nombreH}: ${monto}`;
        })
        .filter(Boolean)
        .join(", ");
      const sufijoPrecioPorDia =
        textoPreciosPorDia.length > 0
          ? ` Precio por día: ${textoPreciosPorDia}.`
          : "";

      const acuerdos = DatosRetenciones == null
        ? `Creada por la agencia: ${agencia.agencia.fullName
        }. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto
        } ${formData.apellidos}. Acomodación: ${acomodaciones}.${sufijoPrecioPorDia} ${valorextranjero == "es extranjero"
          ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia."
          : ""
        } Tipo de traslado:  ${reserva[0].tipoTraslado} ${cena ? "El huésped ha solicitado cena." : ""
        } ${almuerzo ? "El huésped ha solicitado almuerzo." : ""}${facturaTexto}${reserva[0].tourSeleccionado && reserva[0].tourSeleccionado.length > 0
          ? ` Tours seleccionados: ${reserva[0].tourSeleccionado.map(tour => tour.title).join(', ')}.`
          : ""
        }${reserva[0].mascotas && reserva[0].mascotas > 0
          ? ` Se han enviado ${reserva[0].mascotas} mascota(s).`
          : ""
        } El total de la reserva es: ${Math.round(totalRetenciones)} `
        : `Creada por la agencia: ${agencia.agencia.fullName
        }. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto
        } ${formData.apellidos
        }. Acomodación: ${acomodaciones
        }${sufijoPrecioPorDia}, la agencia marcó que aplica retenciones, verificar en la plataforma Booking Connect porcentajes y valores. ${valorextranjero == "es extranjero"
          ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia."
          : ""
        } Tipo de traslado: ${reserva[0].tipoTraslado} ${cena ? "La agencia marco la casilla de solicitar cena." : ""
        } ${almuerzo
          ? "La agencia marco la casilla de solicitar almuerzo."
          : ""
        }${facturaTexto}${reserva[0].tourSeleccionado && reserva[0].tourSeleccionado.length > 0
          ? ` Tours seleccionados: ${reserva[0].tourSeleccionado.map(tour => tour.title).join(', ')}.`
          : ""
        }${reserva[0].mascotas && reserva[0].mascotas > 0
          ? ` Se han enviado ${reserva[0].mascotas} mascota(s).`
          : ""
        } El total de la reserva es: ${Math.round(totalRetenciones)}`;

      const retencionesPayload = filtrarRetenciones({
        reteFuente: {
          resultado: Math.round(DatosRetenciones?.calculo_rtf_fte) || 0,
          porcentaje: Number(RetencionesPorcentaje?.reteFuente) || 0,
        },
        reteIca: {
          resultado: Math.round(DatosRetenciones?.calculo_rtf_ica) || 0,
          porcentaje: Number(RetencionesPorcentaje?.reteIca) || 0,
        },
        reteIva: {
          resultado: Math.round(DatosRetenciones?.calculo_rtf_iva) || 0,
          porcentaje: Number(RetencionesPorcentaje?.reteIva) || 0,
        },
      });

      const mytoolPayload = {
        hotelId,
        checkIn: checkin,
        checkOut: checkout,
        usuario: "Agente",
        maquinaId: 1,
        bookData: {
          solicitante: {
            titular: `${formData.nombreCompleto} ${formData.apellidos}`.trim(),
            telefono: String(formData.celular || ""),
            email: formData.email,
          },
          canalVentaId: 101,
          ratePlan,
          paisCode: "CO",
          monedaCode: divisaSelec || "COP",
          comision: 0,
          siAgregaImpto: !esExtranjero,
          acuerdos,
          motivoId,
          subSegmentoId: 4,
          segmentoId: 1,
          agenciaId:0,
          agenteId:0,
        },
        rooms,
        titularInfo: {
          firstName: formData.nombreCompleto,
          lastName: formData.apellidos,
          tipoDocumento: normalizarTipoDocumento(formData.tipoDocumento),
          documento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento,
        },
        total: Math.round(totalRetenciones),
        notes: acuerdos,
        planAlimentario: String(reserva[0]?.plandealimentacion || ""),
        adicionCena: Boolean(cena),
        adicionAlmuerzo: Boolean(almuerzo),
        mascotasNumber: Number(reserva[0]?.mascotas || 0),
        origenIata: String(reserva[0]?.origenIata || "BOG"),
        ...retencionesPayload,
         exentoIva: Boolean(esExtranjero || hotelExentoIVA || reserva[0]?.exentoIVA),
        infoTransporte:
          reserva[0]?.incluirTraslado === true
            ? {
              numeroVuelo: formData.numeroVuelo,
              ...((reserva[0]?.tipoTraslado === "hotel_aeropuerto" ||
                reserva[0]?.tipoTraslado === "ambos") && {
                numeroVueloSalida: formData.numeroVueloSalida,
              }),
              firstContactNumber: formData.telefonotraslado,
              aerolinea: formData.aereolinea,
              tipoRecogida: tipodetraslado,
              cantidadPersonas: totalHuespedes,
            }
            : null,
        infoToures:
          reserva[0]?.tourSeleccionado?.length > 0
            ? {
              nombres: reserva[0].tourSeleccionado.map((tour) => tour.title),
              firstContactNumber: formData.celular,
              secondContacNumber: formData.telefonotraslado || formData.celular,
            }
            : null,
        asistentes: [],
        desglosePrecios: construirDesglosePrecios({
          reserva,
          totalHuespedes,
          divisaSelec,
          valorIVA,
          tasaIVA,
          marcadoCena,
          marcadoAlmuerzo,
          cantnoches,
          DatosRetenciones,
          RetencionesPorcentaje,
          precioVueloPaquete,
          vuelosActivados,
        }),
      };

      const missingFields = [];
      if (!hotelSlug) missingFields.push("hotelSlug (hotelSeleccionado.nombre)");
      if (!hotelId) missingFields.push("hotelId");
      if (!mytoolPayload.checkIn || !mytoolPayload.checkOut) missingFields.push("checkIn/checkOut");
      if (!ratePlan) missingFields.push("ratePlan (mapeo bookingConnectRatePlans)");
      if (!rooms.length) missingFields.push("rooms");
      if (rooms.some((room) => !room.categoriaId)) missingFields.push("categoriaId");

      if (missingFields.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Faltan datos para crear la reserva",
          text: `No se puede enviar la reserva. Campos faltantes: ${missingFields.join(", ")}`,
        });
        setbotondesactivado(false);
        return;
      }

      informacionD = JSON.stringify(mytoolPayload);
      const hotelSeleccionadoUrl = JSON.parse(
        localStorage.getItem("hotelSeleccionado") || "{}"
      );
      const hotelSlugEncoded = encodeURIComponent(
        hotelSeleccionadoUrl?.nombre || ""
      );
      url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/mytool/${hotelSlugEncoded}`;
      }

      try {
        // error409
        setbotondesactivado(true);

        const response = await fetchWithToken(url, {
          method: "POST",
          body: informacionD,
        });

        if (response.ok) {
          const data = await response.json();

          // NOTIFICACIÓN DE ÉXITO
          (data);
          Swal.fire({
            icon: "success",
            title: "Reserva realizada",
            text: "Se ha confirmado su reserva con éxito.",
          });
          setTimeout(() => {
            window.location.href = "/misreservas"; //REDIRECCION HACIA LA PAGINA DE RESERVA PAGADA
          }, 2500);
        } else if (response.status === 409) {
          // Manejo del error 409
          Swal.fire({
            icon: "error",
            title: "Sin disponibilidad",
            text: "No se pudo completar la reserva porque una de las habitaciones ya no se encuentra disponible. Pruebe con otra acomodacion",
          });
        } else {
          throw new Error("Error al consultar la API");
        }
      } catch (error) {
        // MANEJO DE ERRORES CON SWEETALERT
        Swal.fire({
          icon: "error",
          title: "Error al realizar la reserva",
          text: `No se pudo realizar la reserva. Por favor, Verifica los datos ingresados o intenta hacer la reserva mas tarde. ${error.message}`,
        });
        console.error("Error al obtener disponibilidad:", error);
      } finally {
        setbotondesactivado(false);
      }
      console.log(informacionD); //QUITAR CONSOLE.LOG CUANDO QUEDE LISTO
    };
    enviardatos(); //QUITAR CONSOLE.LOG CUANDO QUEDE LISTO
  };

  // Envío cuando hay múltiples pasajeros (vuelo activado)
  const handleSubmitMulti = (e) => {
    e.preventDefault();
    // Validar todos los pasajeros
    for (let i = 0; i < formDataList.length; i++) {
      const p = formDataList[i];
      if (
        !p.tipoDocumento?.trim() ||
        !p.numeroDocumento?.trim() ||
        !p.fechaNacimiento?.trim() ||
        !p.nombreCompleto?.trim() ||
        !p.apellidos?.trim() ||
        !p.email?.trim() ||
        !p.celular?.trim()
      ) {
        Swal.fire({
          icon: "error",
          title: "Complete la información",
          text: `Todos los campos del pasajero #${i + 1} son obligatorios`,
          showConfirmButton: false,
          timer: 3500,
        });
        return;
      }
      if (
        requiresDocumentExpirationDate(p.tipoDocumento) &&
        !p.fechaCaducidadDocumento?.trim()
      ) {
        Swal.fire({
          icon: "error",
          title: "Complete la información",
          text: `Ingrese la fecha de caducidad del documento del pasajero #${i + 1}`,
          showConfirmButton: false,
          timer: 3500,
        });
        return;
      }
    }

    if (facturaTipo === "") {
      Swal.fire({
        icon: "error",
        title: "Complete la información",
        text: "Seleccione si la factura electronica es para el cliente o para la agencia",
        showConfirmButton: false,
        timer: 3500,
      });
      return;
    }
    if (
      facturaTipo === "agencia" &&
      (formData.nombreEmpresa.trim() === "" ||
        formData.nit.trim() === "" ||
        formData.emailEmpresa.trim() === "" ||
        formData.telefonoF.trim() === "")
    ) {
      Swal.fire({
        icon: "error",
        title: "Complete la información",
        text: "Todos los campos de la factura electronica son obligatorios",
        showConfirmButton: false,
        timer: 3500,
      });
      return;
    }

    const packageIdFromStorage = localStorage.getItem("flightPackageId");
    const packageDataFromStorage = JSON.parse(localStorage.getItem("flightPackageData") || "null");
    const packageId = packageIdFromStorage || packageDataFromStorage?.packageId || "";
    if (!packageId) {
      Swal.fire({
        icon: "error",
        title: "Falta información del vuelo",
        text: "No se encontró el packageId. Regresa a vuelos, selecciona y continúa de nuevo.",
      });
      return;
    }

    // Guardar lista de pasajeros para uso posterior
    try {
      localStorage.setItem("pasajerosVuelo", JSON.stringify(formDataList));
    } catch {}

    // Usar el primer pasajero como titular para la reserva actual
    const titular = formDataList[0];
    const facturaTexto = !facturaE
      ? ""
      : facturaTipo === "cliente"
        ? ` Se ha solicitado generar factura electronica a nombre de cliente con correo de la agencia ${agencia?.email || ""}. `
        : ` Se ha solicitado generar factura electronica. Nombre de la empresa: ${formData.nombreEmpresa}. Nit: ${formData.nit}. Correo de la empresa:${formData.emailEmpresa}. Telefono de la empresa: ${formData.telefonoF} `;

    const filtrarRetenciones = (retenciones) => {
      return Object.fromEntries(
        Object.entries(retenciones).filter(([_, value]) => {
          return value.resultado !== 0 || value.porcentaje !== 0;
        })
      );
    };

    const totalVueloPaquete = aplicarTrmSiCop(
      packageDataFromStorage?.totalPrice ?? packageDataFromStorage?.flightBookPrice ?? 0
    );
    const totalConVuelo = Math.round(
      totalRetenciones + (Number.isFinite(totalVueloPaquete) ? totalVueloPaquete : 0)
    );

    const informacionD = JSON.stringify({
      total: totalConVuelo,
      mascotasNumber: reserva[0]?.mascotas || null,
      adicionAlmuerzo: almuerzo,
      adicionCena: cena,
      titularInfo: {
        firstName: titular.nombreCompleto,
        lastName: titular.apellidos,
        tipoDocumento: normalizarTipoDocumento(titular.tipoDocumento),
        documento: titular.numeroDocumento,
        fechaNacimiento: titular.fechaNacimiento,
      },
      infoTransporte:
        reserva[0].incluirTraslado === true
          ? {
            numeroVuelo: titular.numeroVuelo,
            ...((reserva[0].tipoTraslado === "hotel_aeropuerto" ||
              reserva[0].tipoTraslado === "ambos") && {
              numeroVueloSalida: titular.numeroVueloSalida,
            }),
            firstContactNumber: titular.telefonotraslado,
            aerolinea: titular.aereolinea,
            tipoRecogida: tipodetraslado,
            cantidadPersonas: totalHuespedes,
          }
          : null,
      infoToures:
        reserva[0].tourSeleccionado?.length > 0
          ? {
            nombres: reserva[0].tourSeleccionado.map((tour) => tour.title),
            firstContactNumber: titular.celular,
            secondContacNumber: titular.telefonotraslado || titular.celular,
          }
          : null,
      ...filtrarRetenciones({
        reteFuente: {
          resultado: Math.round(DatosRetenciones?.calculo_rtf_fte) || 0,
          porcentaje: Number(RetencionesPorcentaje?.reteFuente) || 0,
        },
        reteIca: {
          resultado: Math.round(DatosRetenciones?.calculo_rtf_ica) || 0,
          porcentaje: Number(RetencionesPorcentaje?.reteIca) || 0,
        },
        reteIva: {
          resultado: Math.round(DatosRetenciones?.calculo_rtf_iva) || 0,
          porcentaje: Number(RetencionesPorcentaje?.reteIva) || 0,
        },
      }),
      planAlimentario: reserva[0].plandealimentacion,
      exentoIva: titular.esExtranjero,
      reservaInfo: {
        agency: {
          is_agency: true,
          agency_type: agencia.agencia.category,
          external_ref_id: "666222",
        },
        reservation: {
          adults: adults,
          checkin: checkin,
          checkout: checkout,
          children: ninos,
          children_ages: childrenAgesString,
          city: reserva[0].ciudad,
          country: "COL",
          currency: divisaSelec || "COP",
          email: titular.email,
          firstName: titular.nombreCompleto,
          lastName: titular.apellidos,
          nights: noches,
          notes:
            DatosRetenciones == null
              ? `Creada por la agencia: ${agencia.agencia.fullName}. Reserva de ${noches} noches a nombre de ${titular.nombreCompleto} ${titular.apellidos}. ${titular.esExtranjero ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia." : ""} Tipo de traslado:  ${reserva[0].tipoTraslado} ${cena ? "El huésped ha solicitado cena." : ""} ${almuerzo ? "El huésped ha solicitado almuerzo." : ""}${facturaTexto}  `
              : `Creada por la agencia: ${agencia.agencia.fullName}. Reserva de ${noches} noches a nombre de ${titular.nombreCompleto} ${titular.apellidos}, la agencia marcó que aplica retenciones, verificar en la plataforma Booking Connect porcentajes y valores. ${titular.esExtranjero ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia." : ""} Tipo de traslado: ${reserva[0].tipoTraslado} ${cena ? "La agencia marco la casilla de solicitar cena." : ""} ${almuerzo ? "La agencia marco la casilla de solicitar almuerzo." : ""}${facturaTexto}`,
          rooms: habitaciones,
          roomsData: reserva.map((dato, index) => {
            const roomConfig = fechasreserva.layout[index] || {};
            return {
              nombreHabitacion: dato.NombreH,
              adults: JSON.stringify(roomConfig.adults || 0),
              children_ages: roomConfig.children_ages?.join(",") || "",
              children: roomConfig.children_ages ? JSON.stringify(roomConfig.children_ages.length) : "",
              checkin: checkin,
              checkout: checkout,
              currency: currentCurrency,
              id: dato.roomId,
              quantity: "1",
              rateId: dato.rateId,
              unitaryPrice: dato.precio,
              precioBase: Number.isFinite(Number(dato.precioBase))
                ? Number(dato.precioBase)
                : undefined,
            };
          }),
          telephone: `${titular.celular}`,
        },
      },
      desglosePrecios: construirDesglosePrecios({
        reserva,
        totalHuespedes,
        divisaSelec,
        valorIVA,
        tasaIVA,
        marcadoCena,
        marcadoAlmuerzo,
        cantnoches,
        DatosRetenciones,
        RetencionesPorcentaje,
        precioVueloPaquete,
        vuelosActivados,
      }),
    });

    const enviar = async () => {
      // Guarda el código si el hotel alcanzó a crearse. La reserva de vuelo se hace
      // después y necesita ese código, así que un fallo suyo deja el hospedaje creado.
      let hotelYaReservado = null;

      try {
        setbotondesactivado(true);
        const url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/reservar?hotelId=${reserva[0].hotelid}`;
        const response = await fetchWithToken(url, {
          method: "POST",
          body: informacionD,
        });
        if (response.ok) {
          const data = await response.json();
          const reservaChatbotId = data?.reservaChatbotId;

          if (!reservaChatbotId) {
            throw new Error("La reserva de hotel no retornó reservaChatbotId.");
          }

          hotelYaReservado = reservaChatbotId;

          await createFlightReservation({
            reservaChatbotId,
            passengers: formDataList,
          });

          Swal.fire({
            icon: "success",
            title: "Reserva realizada",
            text: "Se ha confirmado su reserva de hotel y vuelos con éxito.",
          });
          setTimeout(() => {
            window.location.href = "/misreservas";
          }, 2500);
        } else if (response.status === 409) {
          Swal.fire({
            icon: "error",
            title: "Sin disponibilidad",
            text: "No se pudo completar la reserva porque una de las habitaciones ya no se encuentra disponible. Pruebe con otra acomodacion",
          });
        } else {
          throw new Error("Error al consultar la API");
        }
      } catch (error) {
        if (hotelYaReservado) {
          Swal.fire({
            icon: "warning",
            title: "Reserva de hotel creada, vuelo pendiente",
            html:
              `Tu reserva de <b>hospedaje quedó registrada</b> con el código <b>${hotelYaReservado}</b>, ` +
              `pero no se pudo emitir el vuelo.<br><br>` +
              `<b>No vuelvas a reservar</b>: se duplicaría el hospedaje y se cobraría dos veces.<br><br>` +
              `Comunícate con reservas@gehsuites.com indicando ese código para completar o ajustar el vuelo.<br><br>` +
              `<small>Detalle técnico: ${error.message}</small>`,
            confirmButtonText: "Ir a mis reservas",
            confirmButtonColor: "#26547B",
            allowOutsideClick: false,
          }).then(() => {
            window.location.href = "/misreservas";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al realizar la reserva",
            text: `No se pudo realizar la reserva. Por favor, Verifica los datos ingresados o intenta hacer la reserva mas tarde. ${error.message}`,
          });
        }
        console.error("Error al obtener disponibilidad:", error);
      } finally {
        setbotondesactivado(false);
      }
    };
    enviar();
  };

  //FUNCION PARA FORMATEAR EL LOS VALORES DE DINERO
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatearMontoDisplay = (monto) => {
    const precio = parseFloat(monto) || 0;
    if (divisaSelec === "USD") {
      return `$${precio.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return formatCurrency(precio);
  };

  const formatearPrecioVueloUsd = (precioUsd) =>
    formatearMontoDisplay(aplicarTrmSiCop(precioUsd));

  // Función para obtener el logo de la aerolínea
  const getAirlineLogo = (carrierCode) => {
    const airlineLogos = {
      'AV': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/AV.png?crop=false&width=108&height=92&fallback=default2.png&_v=9da891fb64018166c1a5228d9c46e5ef',
      'LA': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/LA.png?crop=false&width=108&height=92&fallback=default1.png&_v=e2abb15ddcd9bf090836299b76d255e0',
      'CM': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/CM.png?crop=false&width=108&height=92&fallback=default1.png&_v=a61544cffd06cf2178b9a97659b98650',
      'UA': 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/UA.png?crop=false&width=108&height=92&fallback=default1.png&_v=5549857010860b629834720579d831e5',
      'B6':'https://s202.q4cdn.com/521076508/files/doc_downloads/logos/JetBlue-Logo_Blue.png',
      'NH':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVvcvOq8qQLYp_o4IDIPXVVdHkLpgZLha6Fg&s',
      'EK':'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png',
      'IB':'https://www.latamairlines.com/content/dam/latamxp/sites/alianzas/aerolineas-images_0011_iberia-Airlines.png',
      'UX':'https://logodownload.org/wp-content/uploads/2019/10/air-europa-logo-0.png',
      'JA':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyzD0GhR6Cb4t8ChiJwTz6QdgKQAHtsAhKjA&s',
      'VB':'https://upload.wikimedia.org/wikipedia/commons/b/bf/Nuevo_vivaaerobus_logotipo_original.jpg',
    };
    
    return airlineLogos[carrierCode] || `https://via.placeholder.com/40x40/0066CC/FFFFFF?text=${carrierCode}`;
  };

  // Función para formatear duración ISO 8601 a formato legible
  const formatDuration = (isoDuration) => {
    if (!isoDuration) return "0h 0m";
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return "0h 0m";
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // Función para formatear fecha
  const formatFlightDate = (dateString) => {
    if (!dateString) return "";
    try {
      // Manejar formato YYYY-MM-DD
      const date = new Date(dateString + 'T00:00:00');
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${dayName} ${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Procesar datos del vuelo desde datosReservaVuelos o dataVueloEquipaje
  const processedFlightData = useMemo(() => {
    const monedaDisplay = divisaSelec || "COP";

    // Primero intentar con dataVueloEquipaje si existe
    if (baggageData && baggageData.flight) {
      const flightFromEquipaje = baggageData.flight;
      const pasajerosPrecio = flightFromEquipaje.pricePerPassenger?.map((p) => ({
        ...p,
        total: aplicarTrmSiCop(p.total),
        currency: monedaDisplay,
      }));
      return {
        flightId: flightFromEquipaje.flightId,
        outbound: {
          origin: flightFromEquipaje.outbound?.origin,
          originCity: flightFromEquipaje.outbound?.segments?.[0]?.departureCityName || flightFromEquipaje.outbound?.origin,
          destination: flightFromEquipaje.outbound?.destination,
          destinationCity: flightFromEquipaje.outbound?.segments?.[flightFromEquipaje.outbound?.segments?.length - 1]?.arrivalCityName || flightFromEquipaje.outbound?.destination,
          departure: flightFromEquipaje.outbound?.departureTime,
          arrival: flightFromEquipaje.outbound?.arrivalTime,
          date: formatFlightDate(flightFromEquipaje.outbound?.departureDate),
          duration: formatDuration(flightFromEquipaje.outbound?.duration),
          type: flightFromEquipaje.outbound?.connections === 0 ? "Directo" : `${flightFromEquipaje.outbound?.connections} escala${flightFromEquipaje.outbound?.connections > 1 ? 's' : ''}`,
          airline: flightFromEquipaje.outbound?.segments?.[0]?.airlineName || flightFromEquipaje.outbound?.segments?.[0]?.airlineCode,
          logo: getAirlineLogo(flightFromEquipaje.outbound?.segments?.[0]?.airlineCode),
        },
        return: {
          origin: flightFromEquipaje.inbound?.origin,
          originCity: flightFromEquipaje.inbound?.segments?.[0]?.departureCityName || flightFromEquipaje.inbound?.origin,
          destination: flightFromEquipaje.inbound?.destination,
          destinationCity: flightFromEquipaje.inbound?.segments?.[flightFromEquipaje.inbound?.segments?.length - 1]?.arrivalCityName || flightFromEquipaje.inbound?.destination,
          departure: flightFromEquipaje.inbound?.departureTime,
          arrival: flightFromEquipaje.inbound?.arrivalTime,
          date: formatFlightDate(flightFromEquipaje.inbound?.departureDate),
          duration: formatDuration(flightFromEquipaje.inbound?.duration),
          type: flightFromEquipaje.inbound?.connections === 0 ? "Directo" : `${flightFromEquipaje.inbound?.connections} escala${flightFromEquipaje.inbound?.connections > 1 ? 's' : ''}`,
          airline: flightFromEquipaje.inbound?.segments?.[0]?.airlineName || flightFromEquipaje.inbound?.segments?.[0]?.airlineCode,
          logo: getAirlineLogo(flightFromEquipaje.inbound?.segments?.[0]?.airlineCode),
        },
        pricing: {
          total: aplicarTrmSiCop(baggageData.totalPrice || baggageData.flightBookPrice),
          totalWithoutLuggage: aplicarTrmSiCop(baggageData.flightBookPrice),
          perPerson: aplicarTrmSiCop(
            flightFromEquipaje.pricePerPassenger?.[0]?.total ||
              (parseFloat(baggageData.totalPrice || 0) /
                (flightFromEquipaje.pricePerPassenger?.length || 1))
          ),
          pricePerPassenger: pasajerosPrecio,
          passengers: flightFromEquipaje.pricePerPassenger?.length || 1,
          currency: monedaDisplay,
          includesTaxes: true,
        },
      };
    }
    
    // Si no hay dataVueloEquipaje, procesar datosReservaVuelos
    if (flightData && flightData.outbound) {
      const processFlightSegment = (segment) => {
        if (!segment) return null;
        
        // Obtener información de los segmentos si existen
        const segments = segment.segments || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1] || firstSegment;
        
        return {
          origin: segment.origin,
          originCity: firstSegment?.departureCityName || segment.origin,
          destination: segment.destination,
          destinationCity: lastSegment?.arrivalCityName || segment.destination,
          departure: segment.departureTime,
          arrival: segment.arrivalTime,
          date: formatFlightDate(segment.departureDate),
          duration: formatDuration(segment.duration),
          type: segment.connections === 0 ? "Directo" : `${segment.connections} escala${segment.connections > 1 ? 's' : ''}`,
          airline: firstSegment?.airlineName || firstSegment?.airlineCode || "Aerolínea",
          logo: getAirlineLogo(firstSegment?.airlineCode),
          connections: segment.connections || 0
        };
      };
      
      return {
        flightId: flightData.flightId,
        outbound: processFlightSegment(flightData.outbound),
        return: processFlightSegment(flightData.inbound),
        pricing: {
          total: aplicarTrmSiCop(
            flightData.totalPrice || flightData.TotalPriceWithoutLuggage
          ),
          totalWithoutLuggage: aplicarTrmSiCop(flightData.TotalPriceWithoutLuggage),
          perPerson: aplicarTrmSiCop(
            flightData.pricePerPassenger?.[0]?.total ||
              parseFloat(flightData.totalPrice || 0) /
                (flightData.pricePerPassenger?.length || 1)
          ),
          pricePerPassenger: flightData.pricePerPassenger?.map((p) => ({
            ...p,
            total: aplicarTrmSiCop(p.total),
            currency: monedaDisplay,
          })),
          passengers: flightData.pricePerPassenger?.length || 1,
          currency: monedaDisplay,
          includesTaxes: true,
        },
        baggage: {
          cabin: flightData.cabin_luggage_include || false,
          checked: flightData.luggage_include || false,
          underseat: flightData.underseat_luggage_include || false
        }
      };
    }
    
    return null;
  }, [flightData, baggageData, divisaSelec, datosreserva]);

  const onSubmit = (data) => {
    console.log("Datos enviados:", data);
    Swal.fire({
      //Alerta de datos de incio de sesion incorrectos
      icon: "success",
      text: "Se ha realizado la reserva con exito",
      showConfirmButton: false,
      timer: 4000,
    });
    setTimeout(() => {
      window.location.href = "/reservapagada"; //Redireccion hacia la pagina de reserva pagada
    }, 1500);
  };

  return (
    <>
      <div className="search_form_wrapper">
        <DropdownSearch client:load />
      </div>

      <div className="formulario-reserva-root">
        <h2>¡Falta poco! Termina de completar la información</h2>
        <div
          style={{
            background: "#FFE4B5",
            padding: "10px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#1C3D5A", fontWeight: "500" }}>
            <strong>Completa la información obligatoria</strong>
          </p>
          {mostrarTexto && (
            <p style={{ color: "#1C3D5A", fontWeight: "500" }}>
              Para reservas con menos de 72 horas de anticipación, requerimos el
              pago inmediato.
            </p>
          )}
        </div>

        <h3>Datos de la reserva</h3>

        {reserva?.map((data, index) => (
          <div
            key={`${data.roomId}-${index}`}
            className="formulario-reserva-room-card"
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <img
              src={data.imgH}
              alt=""
              className="formulario-reserva-room-img"
              style={{
                width: "200px",
              }}
            />
            <h4>{data.NombreH}</h4>
            <p>
              <strong>Check-in:</strong> {data.checkin}{" "}
              <strong>Check-out:</strong> {data.checkout}
            </p>
            <p>
              <strong>Noches: </strong> {data.nights}{" "}
              <strong>Huéspedes:</strong> {data.huespedes}
            </p>
            <p>
              <strong>Capacidad de habitacion :</strong> Para {data.beds}{" "}
              personas
            </p>
            <p>
              <strong>Plan de alimentacion: </strong>
              {data.plandealimentacion}
            </p>
            <p>
              <strong>Tipo de traslado: </strong>
              {data.tipoTraslado === "aeropuerto_hotel"
                ? "Aeropuerto al hotel"
                : data.tipoTraslado === "hotel_aeropuerto"
                  ? "Hotel al aeropuerto"
                  : data.tipoTraslado === "ambos"
                    ? "Aeropuerto al hotel y Hotel al aeropuerto"
                    : "No se seleccionó traslado"}
            </p>

            {data.tourSeleccionado && data.tourSeleccionado.length > 0 && (
              <p>
                <strong>Tours seleccionados: </strong>
                {data.tourSeleccionado.map((tour, index) => (
                  <span key={tour.id}>
                    {index > 0 ? ", " : ""}
                    {tour.title}
                  </span>
                ))}
              </p>
            )}

            <p><strong>Numero de mascotas:</strong> {data.mascotas}</p>

            <p style={{ fontWeight: "bold", color: "#2c3e50" }}>
              <strong>Total a pagar:</strong>{" "}
              {divisaSelec == "USD"
                ? `${data.precio} USD`
                : `${formatCurrency(data.precio)} COP`}
            </p>

            <br />

            {mostrarCheckboxes && (
              <div className="formulario-reserva-check-row">
                <strong>¿Desea adicionar almuerzo?</strong>
                <input
                  type="checkbox"
                  checked={almuerzo}
                  onChange={(e) => setAlmuerzo(e.target.checked)}
                  style={{
                    width: "15px", // Tamaño más claro y consistente
                    height: "15px",
                    marginTop: "10px",
                    marginLeft: "40px",
                    // gap:"1rem",
                    marginRight: "20px",
                    cursor: "pointer", // Cambia el cursor al pasar sobre el checkbox
                    accentColor: "#007BFF", // Color del checkbox (moderno y llamativo)
                  }}
                />
                <br />
                <strong style={{ marginLeft: "25px" }}>
                  ¿Desea adicionar cena ?
                </strong>
                <input
                  type="checkbox"
                  checked={cena}
                  onChange={(e) => setCena(e.target.checked)}
                  style={{
                    width: "15px", // Tamaño más claro y consistente
                    height: "15px",
                    marginTop: "10px",
                    marginLeft: "40px",
                    // gap:"1rem",
                    marginRight: "20px",
                    cursor: "pointer", // Cambia el cursor al pasar sobre el checkbox
                    accentColor: "#007BFF", // Color del checkbox (moderno y llamativo)
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {/* Sección de Datos del Vuelo */}
        {processedFlightData && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
              Datos del vuelo
            </h3>

            {/* Vuelo de ida */}
            {processedFlightData.outbound && (
              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                <h4 style={{ marginTop: 0, marginBottom: "15px", color: "#1C3D5A" }}>
                  Vuelo de ida
                </h4>
                <div style={{ display: "flex", alignItems: "cent er", gap: "15px", marginBottom: "10px" }}>
                  {processedFlightData.outbound.logo && (
                    <img
                      src={processedFlightData.outbound.logo}
                      alt={processedFlightData.outbound.airline}
                      style={{ width: "50px", height: "50px", objectFit: "contain" }}
                    />
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", color: "#1C3D5A" }}>
                      {processedFlightData.outbound.airline || processedFlightData.outbound.airlineName || "Aerolínea"}
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                      {processedFlightData.outbound.date}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "15px" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "18px", color: "#1C3D5A" }}>
                      {processedFlightData.outbound.origin}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      {processedFlightData.outbound.originCity || processedFlightData.outbound.origin}
                    </p>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#2cac3d", fontWeight: "500" }}>
                      {processedFlightData.outbound.type || "Directo"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      {processedFlightData.outbound.duration || "Duración no disponible"}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "18px", color: "#1C3D5A" }}>
                      {processedFlightData.outbound.destination}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      {processedFlightData.outbound.destinationCity || processedFlightData.outbound.destination}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    <strong>Salida:</strong> {processedFlightData.outbound.departure}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    <strong>Llegada:</strong> {processedFlightData.outbound.arrival}
                  </p>
                </div>
                {/* Información de equipaje incluido */}
                {processedFlightData.baggage && (
                  <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#fff", borderRadius: "5px" }}>
                    <p style={{ margin: 0, marginBottom: "8px", fontWeight: "600", color: "#1C3D5A" }}>
                      Equipaje incluido:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {processedFlightData.baggage.underseat && (
                        <span style={{ fontSize: "12px", color: "#28a745", fontWeight: "500" }}>✓ Equipaje de mano</span>
                      )}
                      {processedFlightData.baggage.cabin && (
                        <span style={{ fontSize: "12px", color: "#28a745", fontWeight: "500" }}>✓ Equipaje de cabina</span>
                      )}
                      {processedFlightData.baggage.checked && (
                        <span style={{ fontSize: "12px", color: "#28a745", fontWeight: "500" }}>✓ Equipaje facturado</span>
                      )}
                      {!processedFlightData.baggage.underseat && !processedFlightData.baggage.cabin && !processedFlightData.baggage.checked && (
                        <span style={{ fontSize: "12px", color: "#666" }}>Sin equipaje incluido</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Información de equipaje adicional */}
                {baggageData?.luggage && baggageData.luggage.length > 0 && (
                  <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "5px", border: "1px solid #ffc107" }}>
                    <p style={{ margin: 0, marginBottom: "8px", fontWeight: "600", color: "#1C3D5A" }}>
                      Equipaje adicional:
                    </p>
                    {baggageData.luggage.map((luggage, idx) => (
                      <p key={idx} style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                        Pasajero {parseInt(luggage.passengerId) + 1}: {luggage.baggageName} - {formatearPrecioVueloUsd(luggage.pricingDetail)} {divisaSelec || "COP"}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vuelo de regreso */}
            {processedFlightData.return && (
              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                <h4 style={{ marginTop: 0, marginBottom: "15px", color: "#1C3D5A" }}>
                  Vuelo de regreso
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                  {processedFlightData.return.logo && (
                    <img
                      src={processedFlightData.return.logo}
                      alt={processedFlightData.return.airline}
                      style={{ width: "50px", height: "50px", objectFit: "contain" }}
                    />
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", color: "#1C3D5A" }}>
                      {processedFlightData.return.airline || processedFlightData.return.airlineName || "Aerolínea"}
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                      {processedFlightData.return.date}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "15px" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "18px", color: "#1C3D5A" }}>
                      {processedFlightData.return.origin}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      {processedFlightData.return.originCity || processedFlightData.return.origin}
                    </p>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#2cac3d", fontWeight: "500" }}>
                      {processedFlightData.return.type || "Directo"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      {processedFlightData.return.duration || "Duración no disponible"}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "18px", color: "#1C3D5A" }}>
                      {processedFlightData.return.destination}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                      {processedFlightData.return.destinationCity || processedFlightData.return.destination}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    <strong>Salida:</strong> {processedFlightData.return.departure}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                    <strong>Llegada:</strong> {processedFlightData.return.arrival}
                  </p>
                </div>
              </div>
            )}

            {/* Precio del vuelo */}
            {processedFlightData.pricing && (
              <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#fff", borderRadius: "5px", border: "1px solid #e0e0e0" }}>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1C3D5A" }}>
                  Precio del vuelo
                </p>
                {processedFlightData.pricing.pricePerPassenger && Array.isArray(processedFlightData.pricing.pricePerPassenger) && (
                  <div style={{ marginTop: "10px" }}>
                    {processedFlightData.pricing.pricePerPassenger.map((passenger, idx) => (
                      <p key={idx} style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                        Pasajero {parseInt(passenger.passenger_id) + 1} ({passenger.passenger_type}): {formatearMontoDisplay(passenger.total)} {divisaSelec || "COP"}
                      </p>
                    ))}
                  </div>
                )}
                {processedFlightData.pricing.perPerson && !processedFlightData.pricing.pricePerPassenger && (
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                    Por persona: {typeof processedFlightData.pricing.perPerson === "string"
                      ? processedFlightData.pricing.perPerson
                      : formatearMontoDisplay(processedFlightData.pricing.perPerson)}{" "}
                    {divisaSelec || "COP"}
                  </p>
                )}
                {processedFlightData.pricing.totalWithoutLuggage && processedFlightData.pricing.total && parseFloat(processedFlightData.pricing.total) > parseFloat(processedFlightData.pricing.totalWithoutLuggage) && (
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
                    Precio sin equipaje: {formatearMontoDisplay(processedFlightData.pricing.totalWithoutLuggage)} {divisaSelec || "COP"}
                  </p>
                )}
                <p style={{ margin: "5px 0", fontSize: "16px", fontWeight: "600", color: "#2c3e50" }}>
                  Total {processedFlightData.pricing.passengers || 1} persona(s): {typeof processedFlightData.pricing.total === "string"
                    ? processedFlightData.pricing.total
                    : formatearMontoDisplay(processedFlightData.pricing.total)}{" "}
                  {divisaSelec || "COP"}
                </p>
                {processedFlightData.pricing.includesTaxes && (
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#28a745" }}>
                    Incluye impuestos
                  </p>
                )}
              </div>
            )}

            {/* Precio total con equipaje si existe */}
            {baggageData && (
              <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "5px", border: "1px solid #c8e6c9" }}>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1C3D5A" }}>
                  Precio total con equipaje
                </p>
                <p style={{ margin: "5px 0", fontSize: "18px", fontWeight: "700", color: "#2c3e50" }}>
                  {formatearPrecioVueloUsd(baggageData.totalPrice || baggageData.flightBookPrice || 0)}{" "}
                  {divisaSelec || "COP"}
                </p>
                {baggageData.flightBookPrice && baggageData.totalPrice && parseFloat(baggageData.totalPrice) > parseFloat(baggageData.flightBookPrice) && (
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
                    Precio base: {formatearPrecioVueloUsd(baggageData.flightBookPrice)} {divisaSelec || "COP"}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

{parseInt(habitaciones, 10) >= 9 && (
          <div
            style={{
              border: "1px solid #26547B",
              background: "#F5FAFF",
              padding: "10px 12px",
              borderRadius: "8px",
              marginTop: "10px",
              marginBottom: "20px",
            }}
          >
            <p style={{ margin: 0, color: "#26547B", fontWeight: 700 }}>
              Nota
            </p>
            <p style={{ margin: "6px 0 0 0", color: "#2c3e50" }}>
              El beneficio de tourconductor aplica cuando el número de
              habitaciones es igual o mayor a 15. De 15 a 19 habitaciones se
              otorga 1 habitación gratuita y de 20 en adelante 2 habitaciones
              gratuitas.
            </p>
          </div>
        )}
        <div
          className="formulario-reserva-total-box"
          style={{
            border: "1px solid #ddd",
            borderRadius: "5px",
            padding: "15px",
            marginBottom: "20px",
            display: "flex",
            gap: "1rem",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3>Valor total</h3>

            <p>
              Precio total a pagar:{" "}
              <strong>
                {divisaSelec == "USD"
                  ? `${formatCurrency(totalReservaConVuelo)} USD `
                  : `${formatCurrency(totalReservaConVuelo)} COP `}
              </strong>
            </p>
            <p>
              (Hospedaje + A&B {!hotelExentoIVA ? "+ Impuestos incluidos" : ""} + Paquetes y servicios
              adicionales)
            </p>
            {/* {!hotelExentoIVA && (
            )} */}
            {/* formuario desglose */}
            <TablaDesglose precio={totalConIVA} adults={cantadultos} ninos={cantninos} fechasreserva={fechasreserva} totalRetenciones={totalRetenciones} />
          </div>
          {divisaSelec == "USD" ||
            totalRetenciones < 199000 ? (
            ""
          ) : (
            ""
          )}
        </div>
        {divisaSelec == "USD" ||
          totalRetenciones < 199000 ? null : (
          <div>
            <FormularioRetenciones
              precio={totalConIVA}
              adults={adults}
              ninos={ninos}
              fechasreserva={fechasreserva}
              manejarDatos={manejarDatos}
            />
          </div>
        )}

        {/*-------------- SECCION INFORMACION DEL TITULAR DE LA RESERVA -------------- */}

        <h3>Información de los pasajeros</h3>

        {/* Formulario único (hotel) oculto si vuelosActivados === true */}
        {!vuelosActivados && (
        <form name={"formularioHotel"} onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <fieldset
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <legend>Informacion del titular #1 (Titular)</legend>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              {/*-------------- INPUT CHECKBOX HUESPED -------------- */}
              <div className="formulario-reserva-check-row">
                <label htmlFor="esExtranjero" style={{ marginLeft: "10px" }}>
                  ¿El huésped es extranjero? marque la casilla para indicar si
                </label>
                <input
                  style={{
                    width: "15px", // Tamaño más claro y consistente
                    height: "15px",
                    marginLeft: "40px",
                    cursor: "pointer", // Cambia el cursor al pasar sobre el checkbox
                    accentColor: "#007BFF", // Color del checkbox (moderno y llamativo)
                  }}
                  type="checkbox"
                  id="esExtranjero"
                  checked={esExtranjero}
                  onChange={(e) => setesExtranjero(e.target.checked)}
                />

              </div>
              <strong>
                Nota: <a href="https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_3522_2025.htm" target="_blank" className="migracion">Condiciones para estar exento del iva.</a>{" "}
              </strong>
              {/*-------------- INPUT TIPO DE DOCUMENTO -------------- */}
              <label htmlFor="tipoDocumento">
                Tipo de documento <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Selecciona una opción</option>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
              {requiresDocumentExpirationDate(formData.tipoDocumento) && (
                <>
                  <label htmlFor="fechaCaducidadDocumento">
                    Fecha de caducidad del documento <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="fechaCaducidadDocumento"
                    type="date"
                    value={formData.fechaCaducidadDocumento}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </>
              )}
            </div>
            
            {/*-------------- INPUT NUMERO DE DOCUMENTO -------------- */}
            <div>
              <label htmlFor="numeroDocumento">
                Número de documento <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="numeroDocumento"
                type="text"
                placeholder="Ingrese el número de documento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            {/*-------------- INPUT NOMBRE TITULAR -------------- */}
            <div>
              <label htmlFor="nombreCompleto">
                Nombre del titular <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="nombreCompleto"
                type="text"
                placeholder="Ingrese el nombre"
                value={formData.nombreCompleto}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            {/*-------------- INPUT APELLIDOS DEL TITULAR -------------- */}
            <div>
              <label htmlFor="apellidos">
                Apellidos del titular <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="apellidos"
                type="text"
                placeholder="Ingrese los apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            {/*-------------- INPUT FECHA DE NACIMIENTO -------------- */}
            <div>
              <label htmlFor="fechaNacimiento">
                Fecha de nacimiento <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            {/*-------------- INPUT CORREO ELECTRONICO TITULAR -------------- */}
            <div>
              <label htmlFor="email">
                Correo electrónico <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Ingrese el correo electronico "
                value={formData.email}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            {/*-------------- INPUT NUMERO CELULAR DEL TITULAR -------------- */}
            <div>
              <label htmlFor="celular">
                Celular <span style={{ color: "red" }}>*</span>
              </label>
              <input
                // ref={phoneInputRef}
                type="tel"
                id="celular"
                placeholder="Ingrese el numero de celular"
                value={formData.celular}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />

              {/*-------------- LABEL IDENTIFICADOR -------------- */}
              <label
                htmlFor="identificador"
                style={{ color: "red", fontWeight: "light", fontSize: "12px" }}
              >
                Incluir código de área (+57,+55, etc.) eje:+573002215487
              </label>
            </div>

            
            {reserva[0]?.incluirTraslado === true ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <h3>Datos del viajero para el traslado</h3>
                <form style={{ marginTop: "20px" }}>
                  <fieldset
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      padding: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <legend> Informacion del traslado</legend>

                    {/*-------------- INPUT TELEFONO TRASLADO -------------- */}
                    <div>
                      <label htmlFor="telefonotraslado">
                        Telefono del viajero:{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="telefonotraslado"
                        type="tel"
                        placeholder="Ingrese el telefono del viajero"
                        value={formData.telefonotraslado}
                        onChange={handleChange}
                        maxLength={20}
                        autoComplete="off"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                    <label
                      htmlFor="identificador"
                      style={{ fontWeight: "light", fontSize: "12px" }}
                    >
                      Se debe escribir el identificador(+)
                    </label>
                    {/*-------------- INPUT NUMERO DE VUELO -------------- */}
                    <div>
                      <label htmlFor="numeroVuelo">
                        Número del vuelo:{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="numeroVuelo"
                        type="text"
                        placeholder="Ingrese el numero de vuelo"
                        maxLength={30}
                        value={formData.numeroVuelo}
                        onChange={handleChange}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>

                    {/* Mostrar número de vuelo de salida solo si es traslado al aeropuerto o ambos */}
                    {reserva[0]?.incluirTraslado &&
                      (reserva[0]?.tipoTraslado === "hotel_aeropuerto" ||
                        reserva[0]?.tipoTraslado === "ambos") && (
                        <div>
                          <label htmlFor="numeroVueloSalida">
                            Número del vuelo Salida :{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="numeroVueloSalida"
                            type="text"
                            placeholder="Ingrese el numero de vuelo de regreso"
                            maxLength={30}
                            value={formData.numeroVueloSalida}
                            onChange={handleChange}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px",
                              marginBottom: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                            }}
                          />
                        </div>
                      )}

                    {/*-------------- INPUT AEREOLINIA FACTURA -------------- */}
                    <div>
                      <label htmlFor="aereoliniaViajero">
                        Aereolinia del viajero:{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="aereolinea"
                        type="text"
                        placeholder="Ingrese la aereolinia"
                        value={formData.aereolinea}
                        onChange={handleChange}
                        maxLength={15}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                  </fieldset>
                </form>
              </div>
            ) : (
              ""
            )}

            <div className="formulario-reserva-check-row">
                <label
                  htmlFor="facturaelectronica"
                  style={{ marginLeft: "10px" }}
                >
                  ¿Desea factura electronica?{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
              <input
                style={{
                  width: "15px", // Tamaño más claro y consistente
                  height: "15px",
                  marginLeft: "40px",
                  cursor: "pointer", // Cambia el cursor al pasar sobre el checkbox
                  accentColor: "#007BFF", // Color del checkbox (moderno y llamativo)
                }}
                type="checkbox"
                id="facturaElectronica"
                checked
                disabled
                onChange={(e) => {
                  setfacturaE(true);
                  if (!e.target.checked) setfacturaTipo("");
                }}
              />
            </div>
            <br />
            {/*-------------- SELECTOR TIPO DE FACTURACION -------------- */}
            {facturaE && (
              <div style={{ gridColumn: "1 / -1", marginBottom: "10px" }}>
                <label htmlFor="facturaTipo">
                  ¿A quién se factura? <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="facturaTipo"
                  value={facturaTipo}
                  onChange={(e) => setfacturaTipo(e.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="cliente">Facturar a cliente</option>
                  <option value="agencia">Facturar a agencia</option>
                </select>
              </div>
            )}
            {/*-------------- RESUMEN FACTURA A CLIENTE -------------- */}
            {facturaE && facturaTipo === "cliente" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <h3>Datos factura electronica</h3>
                <p>Se facturará con los datos del titular de la reserva:</p>
                <p><strong>Nombre:</strong> {formData.nombreEmpresa || "-"}</p>
                <p><strong>NIT:</strong> {formData.nit || "-"}</p>
                <p><strong>Teléfono:</strong> {formData.telefonoF || "-"}</p>
                <p><strong>Correo:</strong> {formData.emailEmpresa || "-"}</p>
              </div>
            )}
            {/*-------------- SECCION DATOS DE FACTURA ELECTRONICA -------------- */}
            {facturaE && facturaTipo === "agencia" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <h3>Datos factura electronica</h3>
                <form style={{ marginTop: "20px" }}>
                  <fieldset
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      padding: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <legend> Informacion de la factura electronica</legend>

                    {/*-------------- INPUT NOMBRE FACTURA -------------- */}
                    <div>
                      <label htmlFor="nombreEmpresa">
                        Nombre: <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="nombreEmpresa"
                        type="text"
                        placeholder="Ingrese el nombre"
                        value={formData.nombreEmpresa}
                        onChange={handleChange}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                    {/*-------------- INPUT NIT -------------- */}
                    <div>
                      <label htmlFor="NIT">
                        NIT: <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="nit"
                        type="number"
                        placeholder="Ingrese el numero de nit"
                        value={formData.nit}
                        onChange={handleChange}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>

                    {/*-------------- INPUT EMAIL FACTURA -------------- */}
                    <div>
                      <label htmlFor="emailEmpresa">
                        Correo electrónico:{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="emailEmpresa"
                        type="email"
                        placeholder="Ingrese el email"
                        value={formData.emailEmpresa}
                        onChange={handleChange}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                    {/*-------------- INPUT TELEFONO FACTURA -------------- */}
                    <div>
                      <label htmlFor="celular">
                        Telefono: <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="telefonoF"
                        type="tel"
                        placeholder="Ingrese el telefono"
                        value={formData.telefonoF}
                        onChange={handleChange}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                  </fieldset>
                </form>
              </div>
            )}
            </div>
            <button
              disabled={botondesactivado}
              type="submit"
              style={{
                fontWeight: "500",
                backgroundColor: "#26547B",
                color: "white",
                padding: "10px 20px ",
                border: "none",
                borderRadius: "5px",
                cursor: botondesactivado ? "not-allowed" : "pointer", // Cambiar el cursor según el estado
                alignSelf: "flex-end",
                marginRight: "20px",
              }}
            >
              {botondesactivado ? "Procesando..." : "Finalizar Reserva"}
            </button>
          </fieldset>
        </form>
        )}

        {/* Formularios múltiples de pasajeros cuando vuelo está activado */}
        {vuelosActivados && (
          <form onSubmit={handleSubmitMulti} style={{ marginTop: "20px" }}>
            {formDataList.map((pax, idx) => (
              <fieldset
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "15px",
                  marginBottom: "20px",
                }}
              >
                <legend>Informacion del pasajero #{idx + 1}</legend>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <label htmlFor="esExtranjero" style={{ marginLeft: "10px" }}>
                      ¿El huésped es extranjero? marque la casilla para indicar si
                    </label>
                    <input
                      style={{
                        width: "15px",
                        height: "15px",
                        marginLeft: "40px",
                        cursor: "pointer",
                        accentColor: "#007BFF",
                      }}
                      type="checkbox"
                      id="esExtranjero"
                      checked={!!pax.esExtranjero}
                      onChange={(e) => handleChangeIndexed(idx, e)}
                    />
                  </div>
                  <strong>
                    Nota: <a href="https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_3522_2025.htm" target="_blank" className="migracion">Condiciones para estar exento del iva.</a>{" "}
                  </strong>
                  <label htmlFor="tipoDocumento">
                    Tipo de documento <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    id="tipoDocumento"
                    value={pax.tipoDocumento}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                  {requiresDocumentExpirationDate(pax.tipoDocumento) && (
                    <>
                      <label htmlFor="fechaCaducidadDocumento">
                        Fecha de caducidad del documento <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        id="fechaCaducidadDocumento"
                        type="date"
                        value={pax.fechaCaducidadDocumento}
                        onChange={(e) => handleChangeIndexed(idx, e)}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="numeroDocumento">
                    Número de documento <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="numeroDocumento"
                    type="text"
                    placeholder="Ingrese el número de documento"
                    value={pax.numeroDocumento}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="nombreCompleto">
                    Nombre del titular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="nombreCompleto"
                    type="text"
                    placeholder="Ingrese el nombre"
                    value={pax.nombreCompleto}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="apellidos">
                    Apellidos del titular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="apellidos"
                    type="text"
                    placeholder="Ingrese los apellidos"
                    value={pax.apellidos}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid " + "#ccc",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="fechaNacimiento">
                    Fecha de nacimiento <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="fechaNacimiento"
                    type="date"
                    value={pax.fechaNacimiento}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="email">
                    Correo electrónico <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ingrese el correo electronico "
                    value={pax.email}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="celular">
                    Celular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="celular"
                    placeholder="Ingrese el numero de celular"
                    value={pax.celular}
                    onChange={(e) => handleChangeIndexed(idx, e)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <label
                    htmlFor="identificador"
                    style={{ color: "red", fontWeight: "light", fontSize: "12px" }}
                  >
                    Incluir código de área (+57,+55, etc.) eje:+573002215487
                  </label>
                </div>

                
                {reserva[0]?.incluirTraslado === true ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <h3>Datos del viajero para el traslado</h3>
                    <form style={{ marginTop: "20px" }}>
                      <fieldset
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          padding: "15px",
                          marginBottom: "20px",
                        }}
                      >
                        <legend> Informacion del traslado</legend>

                        <div>
                          <label htmlFor="telefonotraslado">
                            Telefono del viajero: <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="telefonotraslado"
                            type="tel"
                            placeholder="Ingrese el telefono del viajero"
                            value={pax.telefonotraslado}
                            onChange={(e) => handleChangeIndexed(idx, e)}
                            maxLength={20}
                            autoComplete="off"
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px",
                              marginBottom: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                            }}
                          />
                        </div>
                        <label
                          htmlFor="identificador"
                          style={{ fontWeight: "light", fontSize: "12px" }}
                        >
                          Se debe escribir el identificador(+)
                        </label>
                        <div>
                          <label htmlFor="numeroVuelo">
                            Número del vuelo: <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="numeroVuelo"
                            type="text"
                            placeholder="Ingrese el numero de vuelo"
                            maxLength={30}
                            value={pax.numeroVuelo}
                            onChange={(e) => handleChangeIndexed(idx, e)}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px",
                              marginBottom: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                            }}
                          />
                        </div>

                        {reserva[0]?.incluirTraslado &&
                          (reserva[0]?.tipoTraslado === "hotel_aeropuerto" ||
                            reserva[0]?.tipoTraslado === "ambos") && (
                            <div>
                              <label htmlFor="numeroVueloSalida">
                                Número del vuelo Salida : <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                id="numeroVueloSalida"
                                type="text"
                                placeholder="Ingrese el numero de vuelo de regreso"
                                maxLength={30}
                                value={pax.numeroVueloSalida}
                                onChange={(e) => handleChangeIndexed(idx, e)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "8px",
                                  marginBottom: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                }}
                              />
                            </div>
                          )}

                        <div>
                          <label htmlFor="aereolinea">
                            Aereolinia del viajero: <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="aereolinea"
                            type="text"
                            placeholder="Ingrese la aereolinia"
                            value={pax.aereolinea}
                            onChange={(e) => handleChangeIndexed(idx, e)}
                            maxLength={15}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px",
                              marginBottom: "10px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                            }}
                          />
                        </div>
                      </fieldset>
                    </form>
                  </div>
                ) : (
                  ""
                )}

                {/* Eliminado checkbox y datos de factura por pasajero para usar un único control global */}
                </div>
              </fieldset>
            ))}

            {/* Sección única de factura electrónica (global) */}
            <div style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "20px",
              marginTop: "10px",
            }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <label
                  htmlFor="facturaElectronica"
                  style={{ marginLeft: "10px" }}
                >
                  ¿Desea factura electronica?{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  style={{
                    width: "15px",
                    height: "15px",
                    marginLeft: "40px",
                    cursor: "pointer",
                    accentColor: "#007BFF",
                  }}
                  type="checkbox"
                  id="facturaElectronica"
                  checked
                  disabled
                  onChange={(e) => {
                    setfacturaE(true);
                    if (!e.target.checked) setfacturaTipo("");
                  }}
                />
              </div>
              <br />
              {facturaE && (
                <div>
                  <label htmlFor="facturaTipo">
                    ¿A quién se factura? <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    id="facturaTipo"
                    value={facturaTipo}
                    onChange={(e) => setfacturaTipo(e.target.value)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="cliente">Facturar a cliente</option>
                    <option value="agencia">Facturar a agencia</option>
                  </select>
                </div>
              )}
              {facturaE && facturaTipo === "cliente" && (
                <div>
                  <h3>Datos factura electronica</h3>
                  <p>Se facturará con los datos del titular de la reserva:</p>
                  <p><strong>Nombre:</strong> {formData.nombreEmpresa || "-"}</p>
                  <p><strong>NIT:</strong> {formData.nit || "-"}</p>
                  <p><strong>Teléfono:</strong> {formData.telefonoF || "-"}</p>
                  <p><strong>Correo:</strong> {formData.emailEmpresa || "-"}</p>
                </div>
              )}
              {facturaE && facturaTipo === "agencia" && (
                <div>
                  <h3>Datos factura electronica</h3>
                  <form style={{ marginTop: "20px" }}>
                    <fieldset
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        padding: "15px",
                        marginBottom: "20px",
                      }}
                    >
                      <legend> Informacion de la factura electronica</legend>
                      <div>
                        <label htmlFor="nombreEmpresa">
                          Nombre: <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          id="nombreEmpresa"
                          type="text"
                          placeholder="Ingrese el nombre"
                          value={formData.nombreEmpresa}
                          onChange={handleChange}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="nit">
                          NIT: <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          id="nit"
                          type="number"
                          placeholder="Ingrese el numero de nit"
                          value={formData.nit}
                          onChange={handleChange}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="emailEmpresa">
                          Correo electrónico: <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          id="emailEmpresa"
                          type="email"
                          placeholder="Ingrese el email"
                          value={formData.emailEmpresa}
                          onChange={handleChange}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="telefonoF">
                          Telefono: <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          id="telefonoF"
                          type="tel"
                          placeholder="Ingrese el telefono"
                          value={formData.telefonoF}
                          onChange={handleChange}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                    </fieldset>
                  </form>
                </div>
              )}
            </div>

            <button
              disabled={botondesactivado}
              type="submit"
              style={{
                fontWeight: "500",
                backgroundColor: "#26547B",
                color: "white",
                padding: "10px 20px ",
                border: "none",
                borderRadius: "5px",
                cursor: botondesactivado ? "not-allowed" : "pointer",
                alignSelf: "flex-end",
                marginRight: "20px",
              }}
            >
              {botondesactivado ? "Procesando..." : "Finalizar Reserva"}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default FormularioReserva;
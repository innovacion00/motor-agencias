import React, { useEffect, useState, useRef } from "react";
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

const HOTELES_EXENTOS_IVA = new Set([56, 123]);

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
  const [facturaE, setfacturaE] = useState(false);
  const [planDeAlimentacion, setplanDeAlimentacion] = useState();
  const [divisaSelec, setdivisaSelec] = useState("COP");
  // Modo vuelo+hotel (formularios dinámicos por pasajero)
  const [vuelosActivados, setVuelosActivados] = useState(false);
  const [numPasajeros, setNumPasajeros] = useState(1);
  const createEmptyPassenger = () => ({
    tipoDocumento: "",
    numeroDocumento: "",
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
  }, []);

  const mostrarCheckboxes =
    divisaSelec !== "USD" &&
    datosreserva.some(
      (reserva) =>
        hotelIdsPermitidos.includes(reserva.hotelid) &&
        reserva.plandealimentacion === "Solo desayuno"
    );

  const hotelExentoIVA = HOTELES_EXENTOS_IVA.has(reserva[0]?.hotelidAutocore);

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
  const marcadoAlmuerzo = almuerzo ? totalHuespedes * cantnoches * 30000 : 0;
  const marcadoCena = cena ? totalHuespedes * cantnoches * 30000 : 0;
  const totalConAdiciones = marcadoCena + marcadoAlmuerzo;
  const totalPrecio = reserva.reduce((total, data) => total + data.precio, 0); //Calcular valor total de las habitaciones
  const tasaIVA = 0.19; // Tasa del IVA
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
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  // Manejador por índice para formularios de pasajeros
  const handleChangeIndexed = (index, e) => {
    const { id, value, type, checked } = e.target;
    setFormDataList((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [id]: type === "checkbox" ? checked : value,
      };
      return next;
    });
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
    const enviardatos = async () => {
      const filtrarRetenciones = (retenciones) => {
        return Object.fromEntries(
          Object.entries(retenciones).filter(([_, value]) => {
            return value.resultado !== 0 || value.porcentaje !== 0;
          })
        );
      };
      const informacionD = JSON.stringify({
        total: Math.round(totalRetenciones),
        mascotasNumber: reserva[0]?.mascotas || null, // Changed from mascotas to mascotasNumber
        adicionAlmuerzo: almuerzo,
        adicionCena: cena,
        titularInfo: {
          firstName: formData.nombreCompleto,
          lastName: formData.apellidos,
          tipoDocumento: formData.tipoDocumento,
          documento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento,
        },

        infoTransporte:
          reserva[0].incluirTraslado === true
            ? {
              numeroVuelo: formData.numeroVuelo,
              ...((reserva[0].tipoTraslado === "hotel_aeropuerto" ||
                reserva[0].tipoTraslado === "ambos") && {
                numeroVueloSalida: formData.numeroVueloSalida,
              }),
              firstContactNumber: formData.telefonotraslado,
              aerolinea: formData.aereolinea,
              tipoRecogida: tipodetraslado,
              cantidadPersonas: totalHuespedes,
            }
            : null,
        infoToures:
          reserva[0].tourSeleccionado?.length > 0
            ? {
              nombres: reserva[0].tourSeleccionado.map((tour) => tour.title),
              firstContactNumber: formData.celular,
              secondContacNumber:
                formData.telefonotraslado || formData.celular
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
        planAlimentario: reserva[0].plandealimentacion, //TIPO DE PLAN DE ALIMENTACION
        exentoIva: esExtranjero, // HUESPED EXTRANJERO O COLOMBIANO
        reservaInfo: {
          agency: {
            is_agency: true,
            agency_type: agencia.agencia.category, //TOKEN
            external_ref_id: "666222",
          },
          reservation: {
            adults: adults, //N°ADULTOS
            checkin: checkin, //FECHA DE CHECKIN
            checkout: checkout, // FECHA DE CHEKOUT
            children: ninos, // N°NIÑOS
            children_ages: childrenAgesString, // STRING DE EDADES NIÑOS
            city: reserva[0].ciudad, // CIUDAD SELECCIONADA
            country: "COL", //PAIS
            currency: divisaSelec || "COP", //TIPO DE MONEDA A ENVIAR (ACTUALMENTE USD//COP)
            email: formData.email, //FORMDATA INPUT EMAIL
            firstName: formData.nombreCompleto, // FORMDATA INPUT NOMBRECOMPLETO
            lastName: formData.apellidos, //FORMDATA INPUT APELLIDOS
            nights: noches, //N° DE NOCHES
            notes:
              DatosRetenciones == null
                ? `Creada por la agencia: ${agencia.agencia.fullName
                }. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto
                } ${formData.apellidos}. ${valorextranjero == "es extranjero"
                  ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia."
                  : ""
                } Tipo de traslado:  ${reserva[0].tipoTraslado} ${cena ? "El huésped ha solicitado cena." : ""
                } ${almuerzo ? "El huésped ha solicitado almuerzo." : ""}${facturaE
                  ? ` Se ha solicitado generar factura electronica. Nombre de la empresa: ${formData.nombreEmpresa}. Nit: ${formData.nit}. Correo de la empresa:${formData.emailEmpresa}. Telefono de la empresa: ${formData.telefonoF} `
                  : ""
                }${reserva[0].tourSeleccionado && reserva[0].tourSeleccionado.length > 0
                  ? ` Tours seleccionados: ${reserva[0].tourSeleccionado.map(tour => tour.title).join(', ')}.`
                  : ""
                }${reserva[0].mascotas && reserva[0].mascotas > 0
                  ? ` Se han enviado ${reserva[0].mascotas} mascota(s).`
                  : ""
                }  `
                : `Creada por la agencia: ${agencia.agencia.fullName
                }. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto
                } ${formData.apellidos
                }, la agencia marcó que aplica retenciones, verificar en la plataforma Booking Connect porcentajes y valores. ${valorextranjero == "es extranjero"
                  ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia."
                  : ""
                } Tipo de traslado: ${reserva[0].tipoTraslado} ${cena ? "La agencia marco la casilla de solicitar cena." : ""
                } ${almuerzo
                  ? "La agencia marco la casilla de solicitar almuerzo."
                  : ""
                }${facturaE
                  ? `    Se ha solicitado generar factura electronica. Nombre de la empresa:${formData.nombreEmpresa}. Nit: ${formData.nit}. Correo de la empresa:${formData.emailEmpresa}. Telefono de la empresa: ${formData.telefonoF} `
                  : ""
                }${reserva[0].tourSeleccionado && reserva[0].tourSeleccionado.length > 0
                  ? ` Tours seleccionados: ${reserva[0].tourSeleccionado.map(tour => tour.title).join(', ')}.`
                  : ""
                }${reserva[0].mascotas && reserva[0].mascotas > 0
                  ? ` Se han enviado ${reserva[0].mascotas} mascota(s).`
                  : ""
                }`,
            rooms: habitaciones, // TIPO DE HABITACIONES
            roomsData: reserva.map((dato, index) => {
              const roomConfig = fechasreserva.layout[index] || {}; // ASEGÚRATE DE OBTENER EL LAYOUT CORRESPONDIENTE A LA HABITACIÓN.
              return {
                nombreHabitacion: dato.NombreH, //NOMBRE DE LA HABITACION
                adults: JSON.stringify(roomConfig.adults || 0), // ADULTOS ESPECÍFICOS POR HABITACIÓN.
                children_ages: roomConfig.children_ages?.join(",") || "", //EDADES DE LOS NIÑOS POR HABITACION [ARRAY]
                children: roomConfig.children_ages // NIÑOS ESPECIFICOS POR HABITACION [ARRAY]
                  ? JSON.stringify(roomConfig.children_ages.length)
                  : "",
                checkin: checkin, //TIPO CHECKIN
                checkout: checkout, //TIPO CHECKOUT
                currency: currentCurrency, //TIPO DE MONEDA ACTUALMENTE (USD//COP)
                id: dato.roomId, //  ROOMID DE LA HABITACION
                quantity: "1", // QUANTITY ??
                rateId: dato.rateId, //RATEID = HABITACION DEPENDIENDO DEL TIPO DE ALIMENTACION
                unitaryPrice: dato.precio, //PRECIO POR HABITACION
              };
            }),
            telephone: `${formData.celular}`, //NUMERO DE CELULAR
          },
        },
      }); //JSON.STRINGIFY

      try {
        // error409
        setbotondesactivado(true);
        const url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/reservar?hotelId=${reserva[0].hotelid}`;

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
    }
    // Guardar lista de pasajeros para uso posterior
    try {
      localStorage.setItem("pasajerosVuelo", JSON.stringify(formDataList));
    } catch {}

    // Usar el primer pasajero como titular para la reserva actual
    const titular = formDataList[0];

    const filtrarRetenciones = (retenciones) => {
      return Object.fromEntries(
        Object.entries(retenciones).filter(([_, value]) => {
          return value.resultado !== 0 || value.porcentaje !== 0;
        })
      );
    };

    const informacionD = JSON.stringify({
      total: Math.round(totalRetenciones),
      mascotasNumber: reserva[0]?.mascotas || null,
      adicionAlmuerzo: almuerzo,
      adicionCena: cena,
      titularInfo: {
        firstName: titular.nombreCompleto,
        lastName: titular.apellidos,
        tipoDocumento: titular.tipoDocumento,
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
              ? `Creada por la agencia: ${agencia.agencia.fullName}. Reserva de ${noches} noches a nombre de ${titular.nombreCompleto} ${titular.apellidos}. ${titular.esExtranjero ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia." : ""} Tipo de traslado:  ${reserva[0].tipoTraslado} ${cena ? "El huésped ha solicitado cena." : ""} ${almuerzo ? "El huésped ha solicitado almuerzo." : ""}${facturaE ? ` Se ha solicitado generar factura electronica. Nombre de la empresa: ${formData.nombreEmpresa}. Nit: ${formData.nit}. Correo de la empresa:${formData.emailEmpresa}. Telefono de la empresa: ${formData.telefonoF} ` : ""}  `
              : `Creada por la agencia: ${agencia.agencia.fullName}. Reserva de ${noches} noches a nombre de ${titular.nombreCompleto} ${titular.apellidos}, la agencia marcó que aplica retenciones, verificar en la plataforma Booking Connect porcentajes y valores. ${titular.esExtranjero ? "El huésped es Extranjero. Favor verificar en recepción si cumple con los requisitos de migración Colombia." : ""} Tipo de traslado: ${reserva[0].tipoTraslado} ${cena ? "La agencia marco la casilla de solicitar cena." : ""} ${almuerzo ? "La agencia marco la casilla de solicitar almuerzo." : ""}${facturaE ? `    Se ha solicitado generar factura electronica. Nombre de la empresa:${formData.nombreEmpresa}. Nit: ${formData.nit}. Correo de la empresa:${formData.emailEmpresa}. Telefono de la empresa: ${formData.telefonoF} ` : ""}`,
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
            };
          }),
          telephone: `${titular.celular}`,
        },
      },
    });

    const enviar = async () => {
      try {
        setbotondesactivado(true);
        const url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/reservar?hotelId=${reserva[0].hotelid}`;
        const response = await fetchWithToken(url, {
          method: "POST",
          body: informacionD,
        });
        if (response.ok) {
          await response.json();
          Swal.fire({
            icon: "success",
            title: "Reserva realizada",
            text: "Se ha confirmado su reserva con éxito.",
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
        Swal.fire({
          icon: "error",
          title: "Error al realizar la reserva",
          text: `No se pudo realizar la reserva. Por favor, Verifica los datos ingresados o intenta hacer la reserva mas tarde. ${error.message}`,
        });
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
      <div
        style={{
          backgroundColor: "#F29C38",
          padding: "20px",
          borderRadius: "8px",
          display: "flexbox justify-content center",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <DropdownSearch client:load />
      </div>

      <div style={{ fontFamily: "Roboto, sans-serif", padding: "20px" }}>
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

        {reserva?.map((data) => (
          <div
            key={data.roomId || index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <img
              src={data.imgH}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center", // Alinea verticalmente el checkbox con el texto
                  justifyContent: "flex-start", // Alinea el contenido a la izquierda
                }}
              >
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

        <div
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
                  ? `${formatCurrency(totalRetenciones)} USD `
                  : `${formatCurrency(totalRetenciones)} COP `}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center", // Alinea verticalmente el checkbox con el texto
                  justifyContent: "flex-start", // Alinea el contenido a la izquierda
                }}
              >
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
                <option value="cedulaC">Cédula de ciudadanía</option>
                <option value="cedulaE">Cédula de extranjería</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="otro">Otro</option>
              </select>
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

            <div
              style={{
                display: "flex",
                alignItems: "center", // Alinea verticalmente el checkbox con el texto
                justifyContent: "flex-start", // Alinea el contenido a la izquierda
              }}
            >
              {/*-------------- INPUT LABEL Y CHECKBOX FACTURA ELECTRONICA -------------- */}
              <label
                htmlFor="facturaelectronica"
                style={{ marginLeft: "10px" }}
              >
                ¿Desea factura electronica?
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
                checked={facturaE}
                onChange={(e) => setfacturaE(e.target.checked)}
              />
            </div>
            <br />
            {/*-------------- SECCION DATOS DE FACTURA ELECTRONICA -------------- */}
            {facturaE && (
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
                    <option value="cedulaC">Cédula de ciudadanía</option>
                    <option value="cedulaE">Cédula de extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="otro">Otro</option>
                  </select>
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
                  ¿Desea factura electronica?
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
                  checked={facturaE}
                  onChange={(e) => setfacturaE(e.target.checked)}
                />
              </div>
              <br />
              {facturaE && (
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
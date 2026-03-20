import React, { useEffect, useState, useRef } from "react";
import { refreshToken } from "../stores/authtoken";
import Cookies from "js-cookie";
import "./styles/Estadisticas.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import { getReservas, reservasNano } from "../stores/disponibilidad";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryPie,
  VictoryLabel,
} from "victory";
import { useHover } from "@uidotdev/usehooks";

import Swal from "sweetalert2";

const Estadisticas = () => {
  // Paleta unificada para gráficas
  const chartPalette = [
    "#e1c16f",
    "#625631",
    "#ebdba8",
    "#eee2bb",
    "#a69058",
    "#ccb577",
  ];
  const [reservasPorHotel, setReservasPorHotel] = useState([]);
  const [reservasPorMes, setReservasPorMes] = useState([]);
  const [reservasPorCiudad, setReservasPorCiudad] = useState([]);
  const [reservasCanceladas, setReservasCanceladas] = useState();
  const [userData, setUserData] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [terminosaceptados, setterminosaceptados] = useState(false);
  const [amount, setAmount] = useState("");
  const [availableAmount, setAvailableAmount] = useState(null);
  const [profileImage, setprofileImage] = useState(
    userData?.imageUrl ||
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Icono%20avatar.png"
  );
  const [ref, hovering] = useHover();
  const fileInputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(""); // Guardamos el valor formateado
  const dataejem = [
    { month: "Enero", reservas: 30 },
    { month: "Febrero", reservas: 45 },
    { month: "Marzo", reservas: 50 },
  ];
  const [agenciasRegistradas, setAgenciasRegistradas] = useState(0);
  const [estadosPago, setEstadosPago] = useState([]);
  const [agenciasNuevas, setAgenciasNuevas] = useState(0);
  const [reservasCompletadas24h, setReservasCompletadas24h] = useState(0);
  const [reservasUltimas24h, setReservasUltimas24h] = useState(0);
  const [promedioHuespedes, setPromedioHuespedes] = useState(0);
  const [tasaConversion, setTasaConversion] = useState(0);
  const [promedioEstadia, setPromedioEstadia] = useState(0);
  const [bookingWindow, setBookingWindow] = useState(0);
  const [reservasPorAgencia, setReservasPorAgencia] = useState([]);
  const [reservasUltimos30Dias, setReservasUltimos30Dias] = useState([]); // Nuevo estado para reservas de últimos 30 días
  const [reservasAprobadas, setReservasAprobadas] = useState([]);
  const [reservasCanceladasPorAgencia, setReservasCanceladasPorAgencia] = useState([]);

  const [isChartsLoading, setIsChartsLoading] = useState(true);

  // Filtro global de reservas para TODO el tablero (Enero–Marzo)
  // CHECKPOINT: para volver a "todas las reservas", reemplaza el return por `return reservas;`
  const filtrarReservasEneMar = (reservas) => {
    // return reservas; // CHECKPOINT (revertir)
    return (Array.isArray(reservas) ? reservas : []).filter((r) => {
      const fecha = new Date(r?.createdAt);
      const mes = fecha.getMonth(); // 0=Ene, 1=Feb, 2=Mar
      return mes >= 0 && mes <= 2;
    });
  };
  //#region Use effect general
  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosdelusuario.token, datosdelusuario.role[0]);
    setUserData(datosdelusuario);
    obtenerSaldo(datosdelusuario.token); // Obtener saldo de la agencia
    // setciudadSeleccionada(Ciudad)
    // settokenusuario(token)
  }, []);

  //#region reservas por mes
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const ahora = new Date();
      const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000); // Resta 24h

      // Filtrar reservas canceladas en las últimas 24h
      const canceladasUltimas24h = reservasObtenidas.filter((reserva) => {
        const fechaReserva = new Date(reserva.createdAt);
        return reserva.status === 4 && fechaReserva >= hace24Horas;
      });

      setReservasCanceladas(canceladasUltimas24h.length);
    }

    if (reservasObtenidas.length > 0) {
      // Mapeo de meses en orden correcto
      const mesesOrdenados = [
        "Ene",
        "Feb",
        "Mar",
        "Abril",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      // Contar reservas por mes
      const conteoPorMes = reservasObtenidas.reduce((acc, reserva) => {
        const fecha = new Date(reserva.createdAt);
        const mes = fecha.getMonth(); // Devuelve un número de 0 (enero) a 11 (diciembre)

        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
      }, {});

      // Convertir a formato compatible con Victory y ordenar por meses
      const datosFormateados = mesesOrdenados.map((mes, index) => ({
        mes,
        reservas: conteoPorMes[index] || 0, // Si no hay reservas en un mes, poner 0
      }));

      setReservasPorMes(datosFormateados);
    }
  }, [reservasNano.get()]);

  //#region reservas por hotel
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      // Lista de hoteles en orden
      const hotelesOrdenados = [
        "Hotel Azuan",
        "Hotel Avexi",
        "Hotel Axis",
        "Hotel Aixo",
        "Hotel Bocagrande",
        "Hotel Rodadero",
        "Hotel Boquilla",
        "Hotel Sansiraka",
        "Hotel Abi",
        "Hotel Marina",
        "Hotel Windsor",
        "Hotel Madisson",
      ];

      // Contar reservas por hotel
      const conteoPorHotel = reservasObtenidas.reduce((acc, reserva) => {
        const nombreHotel = reserva.hotel;
        acc[nombreHotel] = (acc[nombreHotel] || 0) + 1;
        return acc;
      }, {});

      // Convertir datos a formato de Victory
      const datosFormateados = hotelesOrdenados.map((hotel) => ({
        hotel,
        reservas: conteoPorHotel[hotel] || 0,
      }));

      setReservasPorHotel(datosFormateados);
    }
  }, [reservasNano.get()]);

  // #region Reservas por ciudad

  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      // Mapeo para normalizar los nombres de las ciudades
      const ciudadFormato = {
        CARTAGENA: "Cartagena",
        BOGOTA: "Bogotá",
        SANTA_MARTA: "Santa Marta",
      };

      // Inicializar conteo de reservas por ciudad
      const conteoPorCiudad = { Cartagena: 0, Bogotá: 0, "Santa Marta": 0 };

      // Contar reservas por ciudad
      reservasObtenidas.forEach((reserva) => {
        const ciudad = reserva.reservation.city.toUpperCase(); // Normalizar a mayúsculas
        const ciudadFormateada = ciudadFormato[ciudad] || ciudad; // Convertir a formato correcto
        if (conteoPorCiudad[ciudadFormateada] !== undefined) {
          conteoPorCiudad[ciudadFormateada] += 1;
        }
      });

      // Convertir datos a formato compatible con VictoryPie
      const datosFormateados = Object.entries(conteoPorCiudad).map(
        ([ciudad, reservas]) => ({
          x: ciudad,
          y: reservas,
        })
      );

      if (reservasObtenidas.length > 0) {
        const ahora = new Date();
        const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000); // Resta 24h

        // Filtrar reservas canceladas en las últimas 24h
        const canceladasUltimas24h = reservasObtenidas.filter((reserva) => {
          const fechaReserva = new Date(reserva.createdAt);
          return reserva.status === 4 && fechaReserva >= hace24Horas;
        });

        setReservasCanceladas(canceladasUltimas24h.length);
      }
      setReservasPorCiudad(datosFormateados);
    }
  }, [reservasNano.get()]);

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

  useEffect(() => {
    const obtenerAgencias = async () => {
      try {
        const response = await fetchWithToken(
          `${import.meta.env.PUBLIC_API_URL}/agencias/v1/agencias/`
        );

        if (!response.ok) {
          throw new Error("Error al obtener agencias");
        }

        const json = await response.json();
        const agencias = Array.isArray(json?.data) ? json.data : [];
        const totalAgencias =
          typeof json?.meta?.total === "number" ? json.meta.total : agencias.length;
        setAgenciasRegistradas(totalAgencias);

        // Calcular agencias nuevas en las últimas 24h
        const ahora = new Date();
        const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

        const agenciasRecientes = agencias.filter((agencia) => {
          const fechaCreacion = new Date(agencia.createdAt);
          return fechaCreacion >= hace24Horas;
        });

        setAgenciasNuevas(agenciasRecientes.length);
      } catch (error) {
        console.error("Error obteniendo agencias:", error);
      }
    };

    obtenerAgencias();
  }, []);

  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const estadosLabel = {
        0: "Pendiente de pago",
        1: "En proceso",
        2: "Pago rechazado", // Changed from "Pago recibido" to "Pago rechazado"
        3: "Pago aprobado",
        4: "Cancelado",
        5: "Pagado primera mitad",
      };

      // Inicializar conteo
      const conteoEstados = reservasObtenidas.reduce((acc, reserva) => {
        const estado = reserva.status;
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      // Formatear datos para Victory
      const datosFormateados = Object.entries(conteoEstados).map(
        ([estado, cantidad]) => ({
          x: estadosLabel[estado],
          y: cantidad,
          label: `${cantidad}`,
        })
      );

      setEstadosPago(datosFormateados);
    }
  }, [reservasNano.get()]);
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const ahora = new Date();
      const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

      // Filtrar reservas completadas (status 3) en las últimas 24h
      const completadasUltimas24h = reservasObtenidas.filter((reserva) => {
        const fechaReserva = new Date(reserva.createdAt);
        return reserva.status === 3 && fechaReserva >= hace24Horas;
      });

      setReservasCompletadas24h(completadasUltimas24h.length);
    }
  }, [reservasNano.get()]);
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const ahora = new Date();
      const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

      const reservasRecientes = reservasObtenidas.filter((reserva) => {
        const fechaReserva = new Date(reserva.createdAt);
        return fechaReserva >= hace24Horas;
      });

      setReservasUltimas24h(reservasRecientes.length);
    }
  }, [reservasNano.get()]);
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const totalHuespedes = reservasObtenidas.reduce((acc, reserva) => {
        return (
          acc +
          (Number(reserva.reservation.adults) +
            Number(reserva.reservation.children))
        );
      }, 0);

      const promedio = (totalHuespedes / reservasObtenidas.length).toFixed(1);
      setPromedioHuespedes(promedio);
    }
  }, [reservasNano.get()]);
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const reservasCompletadas = reservasObtenidas.filter(
        (reserva) => reserva.status === 3
      ).length;

      const tasa = (
        (reservasCompletadas / reservasObtenidas.length) *
        100
      ).toFixed(1);
      setTasaConversion(tasa);
    }
  }, [reservasNano.get()]);
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const totalNoches = reservasObtenidas.reduce((acc, reserva) => {
        return acc + Number(reserva.reservation.nights);
      }, 0);

      const promedio = (totalNoches / reservasObtenidas.length).toFixed(1);
      setPromedioEstadia(promedio);
    }
  }, [reservasNano.get()]);
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas.length > 0) {
      const totalDias = reservasObtenidas.reduce((acc, reserva) => {
        const fechaCreacion = new Date(reserva.createdAt);
        const fechaCheckin = new Date(reserva.reservation.checkin);
        const diferenciaDias = Math.ceil(
          (fechaCheckin - fechaCreacion) / (1000 * 60 * 60 * 24)
        );
        return acc + diferenciaDias;
      }, 0);

      const promedio = (totalDias / reservasObtenidas.length).toFixed(1);
      setBookingWindow(promedio);
    }
  }, [reservasNano.get()]);

  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());
    console.log("Reservas obtenidas:", reservasObtenidas); // Debug

    if (reservasObtenidas && reservasObtenidas.length > 0) {
      // Contar reservas por agencia
      const conteoAgencias = reservasObtenidas.reduce((acc, reserva) => {
        // Acceder al nombre de la agencia desde reservation.agencyData
        const nombreAgencia =
          reserva.reservation?.agencyData?.name || "Sin agencia";
        console.log("Nombre agencia encontrado:", nombreAgencia); // Debug
        acc[nombreAgencia] = (acc[nombreAgencia] || 0) + 1;
        return acc;
      }, {});

      console.log("Conteo de agencias:", conteoAgencias); // Debug

      // Convertir a array y filtrar agencias con reservas
      const datosFormateados = Object.entries(conteoAgencias)
        .filter(([agencia]) => agencia !== "Sin agencia")
        .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
        .map(([agencia, cantidad]) => ({
          agencia,
          reservas: cantidad,
        }));

      console.log("Datos formateados finales:", datosFormateados); // Debug
      setReservasPorAgencia(datosFormateados);
    }
  }, [reservasNano.get()]);

  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());
    console.log("Reservas obtenidas:", reservasObtenidas);

    if (reservasObtenidas?.length > 0) {
      // Contar reservas por agencia
      const conteoAgencias = reservasObtenidas.reduce((acc, reserva) => {
        // Acceder al nombre correcto de la agencia desde agenciaId.fullName
        const nombreAgencia = reserva.agenciaId?.fullName || "Sin agencia";
        acc[nombreAgencia] = (acc[nombreAgencia] || 0) + 1;
        return acc;
      }, {});

      console.log("Conteo de agencias:", conteoAgencias);

      // Convertir a array y filtrar agencias con reservas
      const datosFormateados = Object.entries(conteoAgencias)
        .filter(([agencia]) => agencia !== "Sin agencia")
        .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
        .map(([agencia, cantidad]) => ({
          agencia,
          reservas: cantidad,
        }));

      console.log("Datos formateados finales:", datosFormateados);
      setReservasPorAgencia(datosFormateados);
    }
  }, [reservasNano.get()]);

  // Nuevo useEffect para procesar reservas de los últimos 30 días
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas?.length > 0) {
      const ahora = new Date();
      const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Filtrar reservas de los últimos 30 días
      const reservasRecientes = reservasObtenidas.filter(reserva => {
        const fechaReserva = new Date(reserva.createdAt);
        return fechaReserva >= hace30Dias;
      });

      // Contar reservas por agencia
      const conteoAgencias = reservasRecientes.reduce((acc, reserva) => {
        const nombreAgencia = reserva.agenciaId?.fullName || "Sin agencia";
        acc[nombreAgencia] = (acc[nombreAgencia] || 0) + 1;
        return acc;
      }, {});

      // Convertir a array y ordenar por cantidad de reservas
      const datosFormateados = Object.entries(conteoAgencias)
        .filter(([agencia]) => agencia !== "Sin agencia")
        .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
        .map(([agencia, cantidad]) => ({
          agencia,
          reservas: cantidad
        }));

      setReservasUltimos30Dias(datosFormateados);
    }
  }, [reservasNano.get()]);

  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas?.length > 0) {
      // Filtrar solo las reservas con status 3 (aprobadas)
      const reservasAprobadasFiltradas = reservasObtenidas.filter(
        reserva => reserva.status === 3
      );

      // Contar reservas por agencia
      const conteoAgencias = reservasAprobadasFiltradas.reduce((acc, reserva) => {
        const nombreAgencia = reserva.agenciaId?.fullName || "Sin agencia";
        acc[nombreAgencia] = (acc[nombreAgencia] || 0) + 1;
        return acc;
      }, {});

      // Convertir a array y ordenar por cantidad de reservas
      const datosFormateados = Object.entries(conteoAgencias)
        .filter(([agencia]) => agencia !== "Sin agencia")
        .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
        .map(([agencia, cantidad]) => ({
          agencia,
          reservas: cantidad
        }));

      setReservasAprobadas(datosFormateados);
    }
  }, [reservasNano.get()]);

  // Nuevo useEffect para procesar reservas canceladas por agencia
  useEffect(() => {
    const reservasObtenidas = filtrarReservasEneMar(reservasNano.get());

    if (reservasObtenidas?.length > 0) {
      // Filtrar solo las reservas canceladas (status 4)
      const reservasCanceladasFiltradas = reservasObtenidas.filter(
        reserva => reserva.status === 4
      );

      // Contar reservas por agencia
      const conteoAgencias = reservasCanceladasFiltradas.reduce((acc, reserva) => {
        const nombreAgencia = reserva.agenciaId?.fullName || "Sin agencia";
        acc[nombreAgencia] = (acc[nombreAgencia] || 0) + 1;
        return acc;
      }, {});

      // Convertir a array y ordenar por cantidad de reservas
      const datosFormateados = Object.entries(conteoAgencias)
        .filter(([agencia]) => agencia !== "Sin agencia")
        .sort(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
        .map(([agencia, cantidad]) => ({
          agencia,
          reservas: cantidad
        }));

      setReservasCanceladasPorAgencia(datosFormateados);
    }
  }, [reservasNano.get()]);

  const formatBookingWindow = (dias) => {
    if (!dias) return "0 días";

    const diasNum = parseFloat(dias);

    if (diasNum < 30) {
      return `${diasNum} días`;
    } else {
      const meses = Math.floor(diasNum / 30);
      const diasRestantes = Math.round(diasNum % 30);

      if (diasRestantes === 0) {
        return meses === 1 ? "1 mes" : `${meses} meses`;
      } else {
        return meses === 1
          ? `1 mes y ${diasRestantes} días`
          : `${meses} meses y ${diasRestantes} días`;
      }
    }
  };

  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem("authToken");

    // Redirigir al usuario a la página de login
    window.location.href = "https://www.gehsuites.com/es";
  };

  //#region Reservas obtenidas (todas las reservas usando all=true)
  const ObtenerReservas = async (token, rolUsuario) => {
    try {
      setIsChartsLoading(true);
      const baseUrl = import.meta.env.PUBLIC_API_URL;

      // Construir la URL según el rol del usuario
      const buildUrlBase = () => {
        if (rolUsuario?.includes("super-admin")) {
          return `${baseUrl}/agencias/v1/reservas?all=true`;
        }
        if (rolUsuario?.includes("admin")) {
          return `${baseUrl}/agencias/v1/reservas/reservas-by-agencia?all=true`;
        }
        return `${baseUrl}/agencias/v1/reservas/reservas-by-user?all=true`;
      };

      const url = buildUrlBase();
      const response = await fetchWithToken(url);

      if (!response.ok) {
        throw new Error("Error al obtener todas las reservas para estadísticas");
      }

      const data = await response.json();
      
      // Extraer las reservas de la respuesta (puede venir en data.data o directamente como array)
      const todasLasReservas = data?.data ?? data?.reservas ?? (Array.isArray(data) ? data : []);

      // Actualizar el store de nanostores con todas las reservas
      reservasNano.set(Array.isArray(todasLasReservas) ? todasLasReservas : []);
      
      // También actualizar el estado local por si acaso
      setReservas(Array.isArray(todasLasReservas) ? todasLasReservas : []);
    } catch (error) {
      console.error("Error obteniendo todas las reservas para estadísticas:", error);
      reservasNano.set([]);
      setReservas([]);
    } finally {
      setIsChartsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // Adjunta el archivo
    //#region Envio de imagen
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/files/user-profile`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${userData.token}`, // Se envía el token para autenticación
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();

      if (data.url) {
        // 1️⃣ Actualiza la imagen en el estado
        setprofileImage(data.url);
        // 2️⃣ Actualiza el localStorage
        const updatedUserData = { ...userData, imageUrl: data.url };
        localStorage.setItem("datosUsuario", JSON.stringify(updatedUserData));

        // 3️⃣ Refresca el estado global de userData si se usa con useContext o un store
        setUserData(updatedUserData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //#region Obtener saldo
  const obtenerSaldo = async () => {
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/agencias/obtener-saldo`
      );

      if (!response.ok) {
        throw new Error("Error al obtener el saldo");
      }

      const data = await response.json();
      setAvailableAmount(data.available_amount);
    } catch (error) {
      console.error("Error obteniendo saldo:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo obtener el saldo disponible.",
        icon: "error",
        confirmButtonColor: "#26547B",
      });
    }
  };

  //#region formatear mienstras escribes
  const formatCurrencyl = (value) => {
    if (!value) return "";

    // Convertir a número entero y formatear como moneda colombiana
    let numericValue = parseInt(value.replace(/\D/g, ""), 10) || 0;
    // Aplicar límite de 50.000.000
    if (numericValue > 50000000) {
      numericValue = 50000000;
    }

    // Guardamos el número sin puntos en el estado
    setAmount(numericValue.toString());

    // Retornamos el valor con formato
    return new Intl.NumberFormat("es-CO").format(numericValue);
  };

  const handleChangedinero = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatCurrencyl(rawValue);
    setDisplayValue(formattedValue);
  };
  //#region formatear el los valores de dinero
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "$ 0";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0, // Mínimo de decimales (0)
      maximumFractionDigits: 0, // Máximo de decimales (0)
    }).format(value);
  };

  const handleRecharge = async () => {
    const amountInt = parseInt(amount, 10);

    if (!terminosaceptados) {
      Swal.fire({
        title: "¡Atención!",
        text: "Debe aceptar los términos y condiciones para recargar saldo.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }

    if (!amountInt || amountInt < 50000) {
      Swal.fire({
        title: "¡Atención!",
        text: "El monto debe ser un número entero mayor o igual a $50,000 COP.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }

    //#region Recargar saldo
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/agencias/recharge-wallet`,
        {
          method: "POST",
          body: JSON.stringify({
            amount: amountInt,
            currency: "COP",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          Swal.fire({
            title: "¡Exito!",
            text: "Redirigiendo al link de pago",
            icon: "success",
            confirmButtonColor: "#26547B",
          }).then(() => {
            window.location.href = data.url; // Redirige al URL proporcionado
          });
        } else {
          Swal.fire({
            title: "Error",
            text: `No se pudo hacer la redireccion al link de pago.${data.msg}`,
            icon: "error",
            confirmButtonColor: "#26547B",
          });
        }
      } else {
        Swal.fire({
          title: "Error",
          text: "Error en la recarga. Intentalo nuevamente",
          icon: "error",
          confirmButtonColor: "#26547B",
        });
      }
    } catch (error) {
      console.error("Error en la recarga:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema con la recarga.",
        icon: "error",
        confirmButtonColor: "#26547B",
      });
    }
  };
// -----------------------------------------------------------------------------------------------------------------------
  // Reservas por mes (Enero–Marzo)
  // CHECKPOINT: para volver a mostrar todos los meses, usa la línea de abajo y comenta el filtro.
  // const reservasPorMesFiltradas = reservasPorMes;
  const reservasPorMesFiltradas = (reservasPorMes || []).filter((d) =>
    ["Ene", "Feb", "Mar"].includes(d.mes)
  );

  // Paleta específica para estados de pago (independiente de la paleta general)
  const paymentStatusColorMap = {
    "Pago rechazado": "#F56C51",
    "Pago aprobado": "#62A672",
    "Cancelado": "#9e9e9e",
    "Pagado primera mitad": "#6C9BF5",
    "Pendiente de pago": "#FFE77D",
    "En proceso": "#8d6e63",
  };

  const getPaymentStatusColor = (status) =>
    paymentStatusColorMap[status] || "#bdbdbd";

  // Número de reservas realizadas (desde enero hasta la actualidad)
  // CHECKPOINT: para volver a contar todas, descomenta la línea de abajo y comenta el filtro.
  // const reservasRealizadasCount = reservas?.length ?? 0;
  const reservasRealizadasCount = (reservas || []).filter((r) => {
    const fecha = new Date(r?.createdAt);
    const ahora = new Date();
    return (
      fecha.getFullYear() === ahora.getFullYear() &&
      fecha.getMonth() <= ahora.getMonth()
    );
  }).length;

  const SkeletonRow = ({ height = 280 }) => (
    <div className="stats-chart-skeleton">
      <div className="stats-chart-skeleton-line" />
      <div className="stats-chart-skeleton-rect" style={{ height }} />
    </div>
  );

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1 style={{ fontSize: "20px" }}>Tablero de usuario</h1>
        <h1
          style={{
            fontSize: "18px",
            paddingBottom: "10px",
            fontFamily: "Roboto",
          }}
        >
          Análisis de datos
        </h1>
      </div>
      <div className="stats-navigation">
        <a href="/tablerousuario">
          Mi perfíl
        </a>
        <a href="/misreservas">Gestionar reservas</a>
        <a className="active" href="/estadisticas">Análisis de datos</a>
        <a href="/configuracion">Configuración</a>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {/* Indicadores numéricos - Movidos fuera de stats-content */}
      <div className="indicators-grid">
        <div className="stats-indicator">
          <h2>Numero de reservas realizadas</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {reservasRealizadasCount}
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Agencias Registradas</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {agenciasRegistradas}
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Reservas Canceladas en las Últimas 24h</h2>
          <p style={{ color: "#AD884E" }}>{reservasCanceladas}</p>
        </div>
        <div className="stats-indicator">
          <h2>Agencias Nuevas (Últimas 24h)</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {agenciasNuevas}
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Reservas garantizadas en las Últimas 24h</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {reservasCompletadas24h}
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Reservas Realizadas (Últimas 24h)</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {reservasUltimas24h}
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Promedio de Huéspedes por Reserva</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {promedioHuespedes}
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Tasa de reservas garantizadas </h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {tasaConversion}%
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Travel Window</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {promedioEstadia} noches
          </p>
        </div>
        <div className="stats-indicator">
          <h2>Booking Window</h2>
          <p style={{ fontSize: "27px", fontWeight: "bold", color: "#AD884E" }}>
            {formatBookingWindow(bookingWindow)}
          </p>
        </div>
      </div>

      <div className="stats-content">
        {/* ----------Gráficas--------- */}
        <div className="chart-wrapper">
          {/* -------------------- Gráfico de reservas por mes ------------------------ */}
          <h2 style={{ textAlign: "center" }}>Reservas por Mes</h2>
          {isChartsLoading ? (
            <SkeletonRow height={280} />
          ) : (
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              width={480} // Reducido de 400
              height={300} // Reducido de 300
              padding={{ left: 80, right: 20, top: 20, bottom: 50 }}
            >
              <VictoryAxis
                tickFormat={reservasPorMesFiltradas.map((d) => d.mes)}
                style={{
                  tickLabels: {
                    fontSize: 11,
                    padding: 5,
                    fontFamily: "Roboto",
                  },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(x) => `${x} reservas`}
                style={{
                  tickLabels: {
                    fontSize: 11,
                    padding: 5,
                    fontFamily: "Roboto",
                  },
                }}
              />
              <VictoryBar
                data={reservasPorMesFiltradas}
                x="mes"
                y="reservas"
                style={{ data: { fill: chartPalette[0] } }}
                labels={({ datum }) => `${datum.reservas}`}
              />
            </VictoryChart>
          )}
        </div>

        {/* ------------------- Gráfica de Reservas por Hotel ----------------------*/}
        <div className="chart-wrapper">
          <h2 style={{ textAlign: "center" }}>Reservas por hotel</h2>
          {isChartsLoading ? (
            <SkeletonRow height={340} />
          ) : (
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              width={600}
              height={400}
              padding={{ left: 100, right: 30, top: 20, bottom: 100 }}
            >
              <VictoryAxis
                tickFormat={reservasPorHotel?.map((d) => d.hotel)}
                style={{
                  tickLabels: {
                    angle: -45,
                    fontSize: 12,
                    textAnchor: "end",
                  },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(x) => `${x} reservas`}
                style={{ tickLabels: { fontSize: 12 } }}
              />
              <VictoryBar
                data={reservasPorHotel}
                x="hotel"
                y="reservas"
                style={{ data: { fill: chartPalette[2] } }}
                labels={({ datum }) => `${datum.reservas}`}
              />
            </VictoryChart>
          )}
        </div>

        {/* Gráfica de Reservas por Ciudad */}
        <div className="chart-wrapper">
          <h2 style={{ textAlign: "center" }}>Número de reservas por Ciudad</h2>
          {isChartsLoading ? (
            <SkeletonRow height={320} />
          ) : (
            <VictoryPie
              data={reservasPorCiudad}
              colorScale={chartPalette}
              labels={({ datum }) => `${datum.x}: ${datum.y} reservas`}
              style={{
                labels: {
                  fontSize: 10,
                  fontWeight: "bold",
                  fill: "#333",
                  fontFamily: "Roboto",
                },
              }}
              padAngle={2}
              innerRadius={80}
              labelRadius={80}
            />
          )}
        </div>

        {/* Gráfica de Estados de Pago (con leyenda al lado) */}
        <div className="chart-wrapper">
          <h2 style={{ textAlign: "center" }}>
            Estados de pago en tiempo real
          </h2>
          {isChartsLoading ? (
            <SkeletonRow height={380} />
          ) : (
            <div className="payment-status-row">
              <div className="payment-status-chart">
                <VictoryPie
                  data={estadosPago}
                  width={520}
                  height={360}
                  radius={145}
                  innerRadius={70}
                  padAngle={2}
                  labels={() => ""}
                  style={{
                    data: {
                      fill: ({ datum }) => getPaymentStatusColor(datum.x),
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    },
                  }}
                  animate={{ duration: 1000 }}
                />
              </div>

              <div className="payment-status-legend">
                {(estadosPago || []).map((item, idx) => (
                  <div className="legend-item" key={`${item.x}-${idx}`}>
                    <span
                      className="legend-swatch"
                      style={{
                        backgroundColor: getPaymentStatusColor(item.x),
                      }}
                    />
                    <span className="legend-label">{item.x}</span>
                    <span className="legend-value">{item.y}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tables-grid">
        {/* Tabla de Reservas por Agencia */}
        <div className="agencies-table-container">
          <h2 className="table-title">Reservas por Agencia</h2>
          <div className="agencies-table">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre de Agencia</th>
                  <th>Número de Reservas</th>
                </tr>
              </thead>
              <tbody>
                {reservasPorAgencia.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.agencia}</td>
                    <td>{item.reservas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Reservas últimos 30 días */}
        <div className="agencies-table-container">
          <h2 className="table-title">Reservas por agencias 30 días</h2>
          <div className="agencies-table">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre de agencias</th>
                  <th>Número de reservas</th>
                </tr>
              </thead>
              <tbody>
                {reservasUltimos30Dias.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.agencia}</td>
                    <td>{item.reservas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Reservas garantizadas */}
        <div className="agencies-table-container">
          <h2 className="table-title">Reservas garantizadas por agencia</h2>
          <div className="agencies-table">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre de Agencia</th>
                  <th>Reservas Aprobadas</th>
                </tr>
              </thead>
              <tbody>
                {reservasAprobadas.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.agencia}</td>
                    <td>{item.reservas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Reservas Canceladas */}
        <div className="agencies-table-container">
          <h2 className="table-title">Reservas Canceladas por Agencia</h2>
          <div className="agencies-table">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre de Agencia</th>
                  <th>Reservas Canceladas</th>
                </tr>
              </thead>
              <tbody>
                {reservasCanceladasPorAgencia.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.agencia}</td>
                    <td>{item.reservas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;


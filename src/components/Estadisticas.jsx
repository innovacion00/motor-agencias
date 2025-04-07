import React, { useEffect, useState, useRef } from "react";
import "../../public/styles/UserDashboard.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import { getReservas, reservasNano } from "../stores/disponibilidad";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryPie } from "victory";
import { useHover } from "@uidotdev/usehooks";

import Swal from "sweetalert2";

const Estadisticas = () => {
  const [reservasPorHotel, setReservasPorHotel] = useState()
  const [reservasPorMes, setReservasPorMes] = useState([]);
  const [reservasPorCiudad, setReservasPorCiudad] = useState();
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
    const reservasObtenidas = reservasNano.get();

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
        "Ene", "Feb", "Mar", "Abril", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
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
        mes ,
        reservas: conteoPorMes[index] || 0, // Si no hay reservas en un mes, poner 0
      }));

      setReservasPorMes(datosFormateados);
    }
  }, [reservasNano.get()]);

    //#region reservas por hotel
    useEffect(() => {
      const reservasObtenidas = reservasNano.get();
    
      if (reservasObtenidas.length > 0) {
        // Lista de hoteles en orden
        const hotelesOrdenados = [
         "Hotel Azuan", "Hotel Avexi","Hotel Axis","Hotel Aixo", "Hotel Bocagrande","Hotel Rodadero",
          "Hotel Boquilla", "Hotel Sansiraka", "Hotel Abi",   "Hotel 1525", "Hotel Windsor", "Hotel Madisson", 
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
  const reservasObtenidas = reservasNano.get();

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
    const datosFormateados = Object.entries(conteoPorCiudad).map(([ciudad, reservas]) => ({
      x: ciudad,
      y: reservas,
    }));

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
    
  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem("authToken");

    // Redirigir al usuario a la página de login
    window.location.href = "https://www.gehsuites.com/es";
  };

  //#region Reservas obtenidas
  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(token, nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setReservas(reservasObtenidas);
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
      const response = await fetch(
        "https://gehsuitesapps.com/agencias/v1/files/user-profile",
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
  const obtenerSaldo = async (token) => {
    try {
      const response = await fetch(
        "https://gehsuitesapps.com/agencias/v1/agencias/obtener-saldo",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
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
      const response = await fetch(
        "https://gehsuitesapps.com/agencias/v1/agencias/recharge-wallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
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
          text: "Error en la recarga. Intentalo nuevamente (Internal Back error)",
          icon: "error",
          confirmButtonColor: "#26547B",
        });
      }
    } catch (error) {
      console.error("Error en la recarga:", error);
      alert("Hubo un problema con la recarga.");
    }
  };

  return (
    <div className="container">
    <h1 style={{fontSize:"20px"}}>Tablero de usuario</h1>
    <br />
  <div className="header">
    
  <h1 style={{fontSize:"18px", paddingBottom:"10px", fontFamily:"Roboto"}}>Análisis de datos</h1>
  </div>
  <div className="nav-tabs">
    <a className="active" href="/tablerousuario"> Mi perfíl </a>
    <a href="/misreservas">Gestionar reservas</a>
    <a href="/estadisticas">Análisis de datos</a> 
    <a href="/configuracion">Configuración</a>
    <button onClick={handleLogout}>
      Cerrar sesión
    </button>
  </div>
      <div className="content">
      <div style={{ width: "80%", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Reservas por Mes</h2>
      <VictoryChart theme={VictoryTheme.material} domainPadding={20} width={500} height={350}  padding={{ left: 100, right: 20, top: 20, bottom: 50 }}>
  {/* Eje X con nombres de meses */}
  <VictoryAxis tickFormat={reservasPorMes?.map((d) => d.mes)} style={{ 
        tickLabels: { fontSize: 11, padding: 5, fontFamily:"Roboto" } // Reducimos tamaño y ajustamos padding
      }} />

  {/* Eje Y con valores numéricos seguidos de "reservas" */}
  <VictoryAxis dependentAxis tickFormat={(x) => `${x} reservas`} style={{ 
        tickLabels: { fontSize: 11, padding: 5, fontFamily:"Roboto" } // Reducimos tamaño y ajustamos padding
      }} />

  {/* Gráfico de barras */}
  <VictoryBar
    data={reservasPorMes}
    x="mes"
    y="reservas"
    style={{ data: { fill: "#4CAF50" } }}
    labels={({ datum }) => `${datum.reservas}`} // Muestra las etiquetas en las barras
  />
</VictoryChart>
    </div>

    {/* ------------ NUMERO DE RESERVAS POR HOTEL ------------ */}
    <div style={{ width: "80%", maxWidth: "750px", margin: "0 auto" }}>
    <h2 style={{ textAlign: "center" }}>Reservas por hotel</h2>
  <VictoryChart 
    theme={VictoryTheme.material} 
    domainPadding={20} 
    width={700} 
    height={400}
    padding={{ left: 100, right: 30, top: 20, bottom: 100 }} // Más espacio para nombres largos
  >
    {/* Eje X con nombres de hoteles */}
    <VictoryAxis 
      tickFormat={reservasPorHotel?.map((d) => d.hotel)}
      style={{
        tickLabels: { angle: -45, fontSize: 12, textAnchor: "end" } // Rotar nombres para mejor visibilidad
      }}
    />

    {/* Eje Y con número de reservas */}
    <VictoryAxis 
      dependentAxis 
      tickFormat={(x) => `${x} reservas`}
      style={{ tickLabels: { fontSize: 12 } }}
    />

    {/* Barras con número de reservas por hotel */}
    <VictoryBar
      data={reservasPorHotel}
      x="hotel"
      y="reservas"
      style={{ data: { fill: "#FF5733" } }}
      labels={({ datum }) => `${datum.reservas} `}
    />
  </VictoryChart>
</div>

{/* ------------ NUMERO DE RESERVAS POR CIUDAD ------------ */}
<div style={{ width: "80%", maxWidth: "500px", margin: "0 auto" }}>
  <h2 style={{ textAlign:"center" }}>Número de reservas por Ciudad</h2>
  <VictoryPie
    data={reservasPorCiudad}
    colorScale={["#85c1e9", "#a2d9ce", "#d7bde2"]} // Colores personalizados
    labels={({ datum }) => `${datum.x}: ${datum.y} reservas`}
    style={{
      labels: { fontSize: 13, fontWeight: "bold", fill: "#333" }, // Estilos de etiquetas
    }}
    innerRadius={80} // Hace la torta tipo "dona"
    labelRadius={80} // Ubica mejor los textos fuera del centro
  />
</div>
<div style={{ textAlign: "center", margin: "20px" }}>
  <h2 style={{fontSize:"15px"}}>Reservas Canceladas en las Últimas 24h</h2>
  <p style={{ fontSize: "20px", fontWeight: "bold", color: "#E74C3C" }}>
    {reservasCanceladas}
  </p>
  <div style={{ textAlign: "center", margin: "20px" }}>
<h2 style={{fontSize:"15px"}}>Numero de reservas realizadas</h2>
  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#E74C3C" }}>
    
    {reservas.length}
  </p>
</div>
</div>



      </div>
    </div>
    
  );
};

export default Estadisticas;



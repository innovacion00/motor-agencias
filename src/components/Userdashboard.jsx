import React, { useEffect, useState, useRef } from "react";
import "../../public/styles/UserDashboard.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import { getReservas, reservasNano } from "../stores/disponibilidad";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryPie } from "victory";
import { useHover } from "@uidotdev/usehooks";

import Swal from "sweetalert2";

const UserDashboard = () => {
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
  // useEffect(() => {
  //   const reservasObtenidas = reservasNano.get();

  //   if (reservasObtenidas.length > 0) {
  //     // Mapeo de meses en orden correcto
  //     const mesesOrdenados = [
  //       "Ene", "Feb", "Mar", "Abril", "May", "Jun",
  //       "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  //     ];

  //     // Contar reservas por mes
  //     const conteoPorMes = reservasObtenidas.reduce((acc, reserva) => {
  //       const fecha = new Date(reserva.createdAt);
  //       const mes = fecha.getMonth(); // Devuelve un número de 0 (enero) a 11 (diciembre)

  //       acc[mes] = (acc[mes] || 0) + 1;
  //       return acc;
  //     }, {});

  //     // Convertir a formato compatible con Victory y ordenar por meses
  //     const datosFormateados = mesesOrdenados.map((mes, index) => ({
  //       mes ,
  //       reservas: conteoPorMes[index] || 0, // Si no hay reservas en un mes, poner 0
  //     }));

  //     setReservasPorMes(datosFormateados);
  //   }
  // }, [reservasNano.get()]);

    // //#region reservas por hotel
    // useEffect(() => {
    //   const reservasObtenidas = reservasNano.get();
    
    //   if (reservasObtenidas.length > 0) {
    //     // Lista de hoteles en orden
    //     const hotelesOrdenados = [
    //      "Hotel Azuan", "Hotel Avexi","Hotel Axis","Hotel Aixo", "Hotel Bocagrande","Hotel Rodadero",
    //       "Hotel Boquilla", "Hotel Sansiraka", "Hotel Abi",   "Hotel 1525", "Hotel Windsor", "Hotel Madisson", 
    //     ];
    
    //     // Contar reservas por hotel
    //     const conteoPorHotel = reservasObtenidas.reduce((acc, reserva) => {
    //       const nombreHotel = reserva.hotel;
    //       acc[nombreHotel] = (acc[nombreHotel] || 0) + 1;
    //       return acc;
    //     }, {});
    
    //     // Convertir datos a formato de Victory
    //     const datosFormateados = hotelesOrdenados.map((hotel) => ({
    //       hotel,
    //       reservas: conteoPorHotel[hotel] || 0,
    //     }));
    
    //     setReservasPorHotel(datosFormateados);
    //   }
    // }, [reservasNano.get()]);
    
// #region Reservas por ciudad

// useEffect(() => {
//   const reservasObtenidas = reservasNano.get();

//   if (reservasObtenidas.length > 0) {
//     // Mapeo para normalizar los nombres de las ciudades
//     const ciudadFormato = {
//       CARTAGENA: "Cartagena",
//       BOGOTA: "Bogotá",
//       SANTA_MARTA: "Santa Marta",
//     };

//     // Inicializar conteo de reservas por ciudad
//     const conteoPorCiudad = { Cartagena: 0, Bogotá: 0, "Santa Marta": 0 };

//     // Contar reservas por ciudad
//     reservasObtenidas.forEach((reserva) => {
//       const ciudad = reserva.reservation.city.toUpperCase(); // Normalizar a mayúsculas
//       const ciudadFormateada = ciudadFormato[ciudad] || ciudad; // Convertir a formato correcto
//       if (conteoPorCiudad[ciudadFormateada] !== undefined) {
//         conteoPorCiudad[ciudadFormateada] += 1;
//       }
//     });

//     // Convertir datos a formato compatible con VictoryPie
//     const datosFormateados = Object.entries(conteoPorCiudad).map(([ciudad, reservas]) => ({
//       x: ciudad,
//       y: reservas,
//     }));

//     if (reservasObtenidas.length > 0) {
//       const ahora = new Date();
//       const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000); // Resta 24h
  
//       // Filtrar reservas canceladas en las últimas 24h
//       const canceladasUltimas24h = reservasObtenidas.filter((reserva) => {
//         const fechaReserva = new Date(reserva.createdAt);
//         return reserva.status === 4 && fechaReserva >= hace24Horas;
//       });
  
//       setReservasCanceladas(canceladasUltimas24h.length);
//     }
//     setReservasPorCiudad(datosFormateados);
//   }
// }, [reservasNano.get()]);
    
  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem("authToken");

    // Redirigir al usuario a la página de login
    window.location.href = "/login";
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
        
      <h1 style={{fontSize:"18px", paddingBottom:"10px"}}>Mi perfil</h1>
      </div>
      <div className="nav-tabs">
        <a className="active" href="/tablerousuario">
          Mi perfil
        </a>
        <a href="/misreservas">Gestionar reservas</a>
        {userData && userData?.role && userData?.role.includes("super-admin")&&(
        <a href="/estadisticas">Análisis de datos</a>
      )} 
        {/* Mostrar el enlace de configuración solo si el usuario tiene rol de admin */}
        {userData && userData?.role && (userData?.role.includes("admin") || userData?.role.includes("super-admin")) && (
        <a href="/configuracion">Configuración</a>
      )}
        <button onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
      <div className="content">
        <div className="card profile-card">
          <img
            ref={ref} // Se conecta el hook useHover a la imagen
            alt="Profile picture"
            src={userData?.imageUrl || profileImage}
            className={`profile-image ${hovering ? "hover-effect" : ""}`}
            onClick={handleClick} // Clic en la imagen activa el input oculto
          />
          <legend style={{ fontSize: "10px" }}>
            Presione el icono para subir una foto
          </legend>
          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }} // Oculta el input
          />
          <h2>{userData?.agencia.fullName}</h2>
          <p>Correo: {userData?.email}</p>
          <p>Celular:{userData?.telefono}</p>
          <p>
            Tipo de usuario:{" "}
            <span style={{ fontWeight: "bold", color: "#1C3D5A" }}>
              {userData?.role[0]}
            </span>
          </p>
          {/* <button>Gestionar mi cuenta</button> */}
        </div>
        {/*--------------------------- Balance de Mi saldo ---------------------------*/}
        <div className="card wallet-card">
          <h3>Mi saldo</h3>
          <div className="balance">{formatCurrency(availableAmount)}</div>
          <br />
          <h2
            style={{
              fontSize: "13px",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            Ingrese un monto superior a $50.000 COP
          </h2>
          <input
            type="text"
            value={displayValue}
            onChange={handleChangedinero}
            placeholder="$0"
            className="recharge-input"
          />
          <br />
          <br />
          <button onClick={handleRecharge}>Recargar saldo</button>
          <br />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "10px",
            }}
          >
            <input
              type="checkbox"
              checked={terminosaceptados}
              onChange={(e) => setterminosaceptados(e.target.checked)}
            />
            Para utilizar este apartado debe aceptar los{" "}
            <a
              href="https://space-img.sfo3.digitaloceanspaces.com/Agencias/POLI%CC%81TICA%20Y%20CONDICIONES%20DE%20USO%20DEL%20PROGRAMA%20DE%20PREPAGOS%20Y%20CASHBACK.pdf%20BC.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              términos y condiciones
            </a>
          </label>
        </div>

        {/* <div className="card agency-card">
          <h3>Agencia: #nombre-agencia</h3>
          <div className="discount">
            <p>-8%</p>
            <p>15 min de Spa (Solo Windsor)</p>
            <p>Salida tardía: Sujeto a disponibilidad</p>
          </div>
        </div> */}
        <div className="card pending-payments-card">
          <h3 className="Ultimasreservas">Ultimas reservas</h3>

          <div className="pending-payments-list">
            <div className="pending-payment-item">
              <div>
                
                {reservas.slice(0, 3).map((dato, index) => (
                  <tr className="estadopago" key={index}>
                    <tr>
                      {dato.status == "0" &&
                      dato.pagadoPrimeraMitad == false ? (
                        <span className="status pending">Pago pendiente</span>
                      ) : dato.status == "1" &&
                        dato.pagadoPrimeraMitad == false ? (
                        <span className="status proces">Pago en Proceso</span>
                      ) : dato.status == "2" &&
                        dato.pagadoPrimeraMitad == false ? (
                        <span className="status denied">
                          Pago rechazado primer abono
                        </span>
                      ) : dato.status == "3" &&
                        dato.pagadoPrimeraMitad == true ? (
                        <span className="status clomplete">Pago aprobado</span>
                      ) : dato.status == "4" ? (
                        <span className="status cancel">Reserva cancelada</span>
                      ) : dato.status == "2" &&
                        dato.pagadoPrimeraMitad == true ? (
                        <span className="status denied">
                          Pago rechazado segundo abono
                        </span>
                      ) : dato.status == "5" &&
                        dato.pagadoPrimeraMitad == true ? (
                        <span className="status abonado">
                          Abonado primera mitad
                        </span>
                      ) : dato.status == "1" &&
                        dato.pagadoPrimeraMitad == true ? (
                        <span className="status proces">
                          Pago total en proceso
                        </span>
                      ) : (
                        <p>Estado no valido</p>
                      )}
                    </tr>
                    <tr className="nombrehotel">Hotel: {dato.hotel}</tr>
                    <tr className="fechalimit">
                      Fecha limite de pago: {dato.reservation.checkin}
                    </tr>

                    <div className="pending-payment-item">
                      <div>Total:{formatCurrency(dato.total)} COP</div>
                    </div>
                    <hr style={{ marginBottom: "10px", color: "green" }} />
                  </tr>
                ))}
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
    
  );
};

export default UserDashboard;



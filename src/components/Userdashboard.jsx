import React, { useEffect, useState, useRef } from "react";
import "../../public/styles/UserDashboard.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import { getReservas, reservasNano } from "../stores/disponibilidad";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryPie } from "victory";
import { useHover } from "@uidotdev/usehooks";
import { refreshToken } from "../stores/authtoken";
import Cookies from "js-cookie";

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


    
  const handleLogout = () => {
    // Eliminar el token de autenticación
      Cookies.remove('accessToken');

    // Redirigir al usuario a la página de login
    window.location.href = "/login";
  };

  //#region Reservas obtenidas
  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setReservas(reservasObtenidas);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const fetchWithToken = async (url, options = {}) => {
    let token = Cookies.get('accessToken');
    
    // Determinar si es FormData para no establecer Content-Type
    const isFormData = options.body instanceof FormData;
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    
    // Solo establecer Content-Type si no es FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        
        // Solo establecer Content-Type si no es FormData
        if (!isFormData) {
          retryHeaders['Content-Type'] = 'application/json';
        }
        
        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    }
    return response;
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
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.log(data)
        throw new Error(data.message);
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
      setAvailableAmount(data.total_available_amount);
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
          text: "Error en la recarga. Intentalo nuevamente (Internal Back error)",
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

  return (
    <div className="container">
        <h1 style={{fontSize:"25px"}}>Tablero de usuario</h1>
        <br />
      <div className="header">
        
      {/* <h1 style={{fontSize:"18px", paddingBottom:"10px"}}>Mi perfil</h1> */}
      </div>
      <div className="nav-tabs">
        <a className="active" href="/tablerousuario">
          Mi perfil
        </a>
        <a href="/misreservas">Gestionar reservas</a>
        {userData && userData?.role && userData?.role.includes("super-admin")&&(
        <a href="/estadisticas">Análisis de datos</a>
      )} 
      
      <a href="/ultimosmovimientos" target="_blank" rel="noopener noreferrer">Ultimo movimientos</a>
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
              Términos y condiciones</a>
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



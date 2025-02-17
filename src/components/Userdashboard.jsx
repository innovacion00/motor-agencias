import React, { useEffect, useState } from "react";
import "../../public/styles/UserDashboard.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import { getReservas, reservasNano } from "../stores/disponibilidad";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [mostrarConfigOption, setmostrarConfigOption] = useState()
  const available_amount = null;

  //-------------------User effect--------------------

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosdelusuario.token, datosdelusuario.role[0]);
    setUserData(datosdelusuario);
    // setciudadSeleccionada(Ciudad)
    // settokenusuario(token)
  }, []);

  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(token, nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setReservas(reservasObtenidas);
  };

  //funcion para formatear el los valores de dinero
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0, // Mínimo de decimales (0)
      maximumFractionDigits: 0, // Máximo de decimales (0)
    }).format(value);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Tablero de usuario</h1>
      </div>
      <div className="nav-tabs">
        <a className="active" href="#">
          Mi perfil
        </a>
        <a href="/misreservas">Gestionar reservas</a>
        {/* <a href="#">Análisis de datos</a> */}
        <a href="#">Configuración</a>
      </div>
      <div className="content">
        <div className="card profile-card">
          <img alt="Profile picture" src="https://placehold.co/100x100" />
          <h2>{userData?.agencia.fullName}</h2>
          <p>Correo: {userData?.email}</p>
          <p>Celular:{userData?.telefono}</p>
          <p>Tipo de usuario: {userData?.role[0]}</p>
          {/* <button>Gestionar mi cuenta</button> */}
        </div>
        <div className="card wallet-card">
          <h3>Mi saldo</h3>
          <div className="balance">{available_amount || "$0.00"}</div>{" "}
          {/*Balance de Mi saldo */}
          <button>Recargar</button>
          <div className="transaction-list">
            {/* <div className="transaction-item">
              <div>
                Pago reserva #Hotel
                <br />
                <small>03/05/2023 - 10:00 a.m</small>
              </div>
              <div className="amount">#$pago-reserva</div>
            </div> */}
          </div>
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
                      {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                        <span className="status pending" >
                          Pago pendiente
                        </span>
                      ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                        <span className="status proces">
                          Pago en Proceso
                        </span>
                      ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                        <span className="status denied">
                          Pago rechazado primer abono
                        </span>
                      ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                        <span className="status clomplete">
                          Pago aprobado
                        </span>
                      ) : dato.status == "4" ? (
                        <span className="status cancel">
                          Reserva cancelada
                        </span>
                      ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                        <span className="status denied">
                          Pago rechazado segundo abono
                        </span>
                      ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                        <span className="status abonado">
                          Abonado primera mitad
                        </span>
                      ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                        <span className="status proces">
                          Pago en proceso segundo abono
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
                      <div>Total:{formatCurrency(dato.total)}</div>
                    </div>
                    <hr style={{marginBottom: "10px", color:"green"}} />
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

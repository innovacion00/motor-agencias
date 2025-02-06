import React, { useEffect, useState } from "react";
import "../../public/styles/UserDashboard.css"; // Asegúrate de tener este archivo CSS con los estilos adecuados
import { getReservas, reservasNano } from "../stores/disponibilidad";

const UserDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [reservas, setReservas] = useState([]);
    const available_amount= null



  //-------------------User effect--------------------

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosdelusuario.token, datosdelusuario.role[0])
    setUserData(datosdelusuario);
    // setciudadSeleccionada(Ciudad)
    // settokenusuario(token)
  }, []);

   const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas (token,nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setReservas(reservasObtenidas);
   }

//funcion para formatear el los valores de dinero
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
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
        <a href="#">Gestionar reservas</a>
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
          <button>Gestionar mi cuenta</button>
        </div>
        <div className="card wallet-card">
          <h3>Mi saldo</h3>
          <div className="balance">{available_amount|| "$0.00"}</div> {/*Balance de Mi saldo */}
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
          <h3>Pagos pendientes</h3>

          <div className="pending-payments-list">
            <div className="pending-payment-item">
              <div>
                {reservas.slice(0,3).map((dato,index)=> (
                    <tr key ={index}>
                        <br />
                        <tr>Hotel: {dato.hotel}</tr>
                        <tr>Fecha limite de pago: {dato.reservation.checkin}</tr>
                        <tr>Estado de pago: {dato.status}</tr>
                        <tr>Valor:{ formatCurrency(dato.total)}</tr>
                        
                    </tr>
                )
                
                )}
                {/* Pago pendiente */}
                <br />
                {/* <small>
                  Tipo de reserva:
                  <br />
                  Hotel: #nombre-hotel
                  <br />
                  Plazo: #$pago-reserva
                </small> */}
              </div>
              
            </div>
            {/* <div className="pending-payment-item">
              <div>
                Pago rechazado
                <br />
                <small>
                  Tipo de reserva:
                  <br />
                  Hotel: #nombre-hotel
                  <br />
                  Plazo: #
                </small>
              </div>
              <div>Valor: #$000.000</div>
            </div>
            <div className="pending-payment-item">
              <div>
                Pago pendiente
                <br />
                <small>
                  Tipo de reserva:
                  <br />
                  Hotel: #nombre-hotel
                  <br />
                  Plazo: #
                </small>
              </div>
              <div>Valor: #$000.000</div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

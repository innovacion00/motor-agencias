import React, { useEffect, useState } from "react";
import styles from "./styles/gestionar.module.css";
import { format } from "@formkit/tempo";
import { hoteles, habitaciones } from "./InfoHoteles";
import Cookies from "js-cookie";
import { generarLinkPago, linkPago } from "../../stores/pagos";
import Swal from "sweetalert2";

//UseState
const Gestionar = ({ reservas }) => {
  console.log(reservas) // Datos de la reserva
  const checkin = format(reservas?.reservation.checkin, "D MMM", "es");
  const checkout = format(reservas?.reservation.checkout, "D MMM", "es");
  const [isLoading, setisLoading] = useState(false)
  const datosReserva = JSON.parse(localStorage.getItem("datosreserva")) || [];
  const primerPlan = datosReserva[0]?.plandealimentacion;
// Verificar si hay datos y acceder al plan de alimentación
if (Array.isArray(datosReserva) && datosReserva.length > 0) {
  datosReserva.forEach((reserva) => {
    console.log("Plan de alimentación:", reserva.plandealimentacion);
  });
} else {
  console.log("No hay datos de reserva en el localStorage.");
}
  const sumaHuespe =
    Number(reservas?.reservation.children) +
    Number(reservas?.reservation.adults);

  let contador = 1;
  // // console.log(sumaHuespe)
  const infoHoteles = hoteles(reservas?.hotel);
  // console.log(hoteles(reservas.hotel))

  const cancelarReserva = async (reservas) => {
    try {
      // Obtener los datos del usuario desde localStorage
      const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));

      // Extraer el token
      const token = datosUsuario.token;

      // Hacer la solicitud DELETE
      const response = await fetch(
        "https://gehsuitesapps.com/agencias/v1/reservas/cancelar-reserva",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
          },
          body: JSON.stringify({
            reservaId: reservas, // Pasar el ID de la reserva
          }),
        }
      );

      // Validar la respuesta de la API
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al cancelar la reserva:", errorData);
        Swal.fire(
          "Error",
          "No se pudo cancelar la reserva. Intente nuevamente.",
          "error"
        );
        return;
      }

      // Éxito al cancelar la reserva
      const data = await response.json();
      console.log("Reserva cancelada exitosamente:", data);
      Swal.fire("¡Éxito!", "Reserva cancelada exitosamente.", "success").then(
        () => {
          window.location.href = "/misreservas";
        }
      );
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error al cancelar la reserva. Intenta nuevamente.",
        "error"
      );
    }
  };

  const confirmarCancelacion = (reservaId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar esta reserva? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        cancelarReserva(reservaId); // Llama a la función de cancelación
      }
    });
  };

  const generarLink = async (id, booleano) => {
    setisLoading(true); // Deshabilitar el botón
    try {
      const linkP = await generarLinkPago(id, booleano); // Llamada a la API
      console.log(linkP);
      if (linkP.link) {
        window.location.href = linkP.link; // Redireccionar al link generado
      } else {
        alert("No se pudo generar el link de pago.");
      }
    } catch (error) {
      console.error("Error al generar el link:", error);
      alert("Hubo un error al generar el link de pago.");
    } finally {
      setisLoading(false); // Habilitar el botón nuevamente
    }
  };
  const onClick = async (id, booleano) => {
    if (reservas?.status == "1" || reservas?.status == "3" || reservas?.status == "4") {
      return
    }
    await generarLink(id, booleano);
  };

  const onClickTotal = async (id, booleano) => {
    if (reservas?.status == "1" || reservas?.status == "3" || reservas?.status == "4" || reservas?.status == "5") {
      return
    }
    await generarLink(id, booleano);
  };

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
    <div className={styles.containerGestionar}>
      <p className={styles.title}>Consultar y gestionar reservas</p>

      {reservas.status == "0" && reservas.pagadoPrimeraMitad == false ? (
        <p className={`${styles.estadoPago} ${styles.pending}`}>
          Pago pendiente 
        </p>
      ) : reservas.status == "1" && reservas.pagadoPrimeraMitad == false ? (
        <p className={`${styles.estadoPago} ${styles.proces}`}>
          Pago en proceso 
        </p>
      ) : reservas.status == "2" && reservas.pagadoPrimeraMitad == false ? (
        <p className={`${styles.estadoPago} ${styles.denied}`}>
          Pago rechazado primer abono
        </p>
      ) : reservas.status == "3" && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.clomplete}`}>
          Pago aprobado
        </p>
      ) : reservas.status == "4" ? (
        <p className={`${styles.estadoPago} ${styles.cancel}`}>
          Reserva cancelada
        </p>
      ) : reservas.status == "2" && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.denied}`}>
          Pago rechazado segundo abono
        </p>
      ) : reservas.status == "5" && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.abonado}`}>
          Abonado primera mitad
        </p>
      ) : reservas.status == "1" && reservas.pagadoPrimeraMitad == true ?
        (<p className={`${styles.estadoPago} ${styles.proces}`}>
          Pago en proceso segundo abono
        </p>) : (<p>Estado no valido</p>)
      }

      <div className={styles.card}>
        <div className={styles.hotelInfo}>
          <p>Datos de la reserva</p>
          <div className={styles.img}>
            <img src={infoHoteles?.imgHotel} alt="img" />
          </div>
        </div>

        <div className={styles.infoHabitaciones}>
          <p className={styles.idReserva}>
            Cod. Reserva: <span>{reservas?.reservaChatbotId}</span>
          </p>
          <div className={styles.infoHotelHabitaciones}>
            <p className={styles.NombreHotel}>{reservas?.hotel}</p>
            <p>
              <img
                src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Icono_ubicacion.png"
                alt="logo_ubicacion"
              />{" "}
              <span>{infoHoteles.ubicacion} |</span>{" "}
              <img
                src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Icono_telefono.png"
                alt="logo_telefono"
              />{" "}
              <span>+57 3336025021</span>
            </p>

            <div className={styles.infoFechas}>
              <div className={styles.flex}>
                <div className={styles.flexCol}>
                  <p>Check-in</p>
                  <p>{checkin}</p>
                </div>
                <div className={styles.flexCol}>
                  <p>Check-out</p>
                  <p>{checkout}</p>
                </div>
              </div>
              <hr />
              <div className={styles.flex}>
                <div className={styles.flexCol}>
                  <p>Noches</p>
                  <p>{reservas?.reservation.nights}</p>
                </div>
                <div className={styles.flexCol}>
                  <p>Huéspedes</p>
                  <p>{sumaHuespe}</p>
                </div>
                <div className={styles.flexCol}>
                  <p>Habitaciones</p>
                  <p>{reservas?.cantidadHabitaciones}</p>
                </div>
                <div className={styles.flexCol}>
                  <p>Tipo de plan de alimentacion</p>
                  <p>{primerPlan}</p>
                </div>
              </div>
            </div>
            <br />
            <div className={styles.habitaciones}>
              {reservas?.reservation.roomsData.map((dato, index) => (
                <div className={styles.cardHabi} key={index}>
                  <div className={styles.contenHabi}>
                    <div className={styles.imgHabi}>
                      <img src={habitaciones[dato.id].url} alt="habita" />
                    </div>
                    <div className={styles.infoHabitaciones}>
                      <p className={styles.titleHabi}>
                        {habitaciones[dato.id].name}
                      </p>
                      <p>
                        Check-in: {checkin} - Check-out: {checkout}
                      </p>
                      <p>
                        {reservas.reservation.nights} noches, {Number(dato.adults) + Number(dato.children)}{" "}
                        huéspedes, 1 habitación
                      </p>
                    </div>
                  </div>
                  <p className={styles.totalCard}>{formatCurrency(dato.unitaryPrice)} COP</p>
                </div>
              ))}
            </div>
            <br />
            <div className={styles.infoTotal}>
              <div className={styles.titleTotal}>
                <p>Valor a pagar + impuestos</p>
                <p className={styles.plazoPago}>Tienes plazo de pagar hasta el {reservas.fechaLimitePago}</p>
              </div>
              <p className={styles.total}>{formatCurrency(reservas?.total)} COP</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentHusped_pago}>
        <div className={styles.containerHuesped}>
          <p className={styles.titleHuespe}>Información de los huéspedes</p>
          <div className={styles.habitacionesForm}>
            <p className={styles.titleForm}>Numero de Habitaciones: {reservas?.cantidadHabitaciones}</p>
            <p className={styles.checkin}>Check-in: {checkin}</p>
            <div className={styles.cardHuesped}>
              <p className={styles.titleTitular}>Huésped 1 (Titular)</p>
              <div className={styles.flexHuespe}>
                <p className={styles.infoH}>Cédula de ciudadanía:</p>
                <p>{reservas?.titularInfo?.documento}</p>
              </div>
              <div className={styles.flexHuespe}>
                <p className={styles.infoH}>Nombre completo:</p>
                <p>
                  {reservas?.reservation.firstName}{" "}
                  {reservas?.reservation.lastName}
                </p>
              </div>
              <div className={styles.flexHuespe}>
                <p className={styles.infoH}>Fecha de nacimiento:</p>
                <p>{reservas?.titularInfo?.fechaNacimiento}</p>
              </div>
              <div className={styles.flexHuespe}>
                <p className={styles.infoH}>Correo electrónico:</p>
                <p>{reservas?.reservation.email}</p>
              </div>
              <div className={styles.flexHuespe}>
                <p className={styles.infoH}>Celular:</p>
                <p>{reservas?.reservation.telephone}</p>
              </div>
            </div>
            <br />
            <div className={styles.acuerdos}>
                <p>Tener en cuenta:</p>
                    <br />
                    <p>* La cadena hotelera Geh Suites protege a los niños, niñas y adolescentes de la explotación sexual y comercial Ley 679 de 2001.</p>
                    <br />
                    <p> * Recuerde: todo niño que viaje debe contar con su documento de identidad (Registro civil o tarjeta de identidad).</p>
                    <br />
                    <p>* Si los niños que viajan no son hijos de los adultos que los representan deben contar con un permiso de los padres, autenticado en una notaría.</p>
                    </div>
          </div>
          <div className={styles.Retenciones}>
            <p>Información sobre las retenciones en caso de que aplique</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rte Fuente</th>
                  <th>Rte Ica</th>
                  <th>Rte Iva</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Porcentaje %</strong></td>
                  <td>{reservas?.reteFuente?.porcentaje}%</td>
                  <td>{reservas?.reteIca?.porcentaje}%</td>
                  <td>{reservas?.reteIva?.porcentaje}%</td>
                </tr>
                <tr>
                  <td><strong>Valor $</strong></td>
                  <td>{formatCurrency(reservas?.reteFuente?.resultado)}</td>
                  <td>{formatCurrency(reservas?.reteIca?.resultado)}</td>
                  <td>{formatCurrency(reservas?.reteIva?.resultado)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className={styles.pagar}>
            <p className={`${styles.infoH} ${styles.titlePagar}`}>
              Pagar reserva
            </p>
            <div className={styles.hotelR}>
              <p className={styles.infoH}>{reservas?.hotel}</p>
              <div className={styles.nochesR}>
                <p>
                  {checkin} - {checkout} ({reservas?.reservation.nights} noches)
                </p>
              </div>
            </div>
            {reservas?.reservation.roomsData.map((dato, index) => (
              <div className={styles.cardHabitacionesPago} key={index}>
                <p>Habitación {contador++}:</p>
                <p>{primerPlan}</p>
                <p>{habitaciones[dato.id].name}</p>
                {/* <p>Medía pensión</p> */}
                <p>
                  {checkin} - {checkout}
                </p>
                <p>
                  {reservas.reservation.nights} noches, {Number(dato.adults) + Number(dato.children)} huéspedes
                </p>
                <p>{formatCurrency(dato.unitaryPrice)}</p>
              </div>
            ))}
            <div className={styles.pagos}>
              {reservas.status == "0" && reservas.pagadoPrimeraMitad == false ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.totalMitad)}</p>
                </div>
              ) : reservas.status == "1" && reservas.pagadoPrimeraMitad == false ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.totalMitad)}</p>
                </div>
              ) : reservas.status == "2" && reservas.pagadoPrimeraMitad == false ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.totalMitad)}</p>
                </div>
              ) : reservas.status == "3" && reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Total + impuestos</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.total)}</p>
                </div>
              ) : reservas.status == "4" ? (
                <div className={styles.totalPago}>
                  <p>Total + impuestos</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.total)}</p>
                </div>
              ) : reservas.status == "2" && reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.totalMitad)}</p>
                </div>
              ) : reservas.status == "5" && reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.totalMitad)}</p>
                </div>
              ) : reservas.status == "1" && reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>{formatCurrency(reservas?.totalMitad)}</p>
                </div>
              ) : (<p>Monto no valido</p>)
              }
              <button
                onClick={() => onClick(reservas._id, false)}
                disabled={reservas?.status == "1" || reservas?.status == "3" || reservas?.status == "4" ||  (isLoading)}
                className={`${styles.pagarButton} ${reservas?.status == "1" || reservas?.status == "3" || reservas?.status == "4"  ? styles.disabledButtonp : ""}`}
              >{isLoading ? "Generando link..." : "Pagar el 50%"}</button>
              <br />
              <button
              onClick={()=>onClickTotal(reservas._id, true)}
                disabled={reservas?.status == "1" || reservas?.status == "3" || reservas?.status == "4" || reservas?.status == "5" || reservas?.pagadoPrimeraMitad || (isLoading)}
                className={`${styles.pagarButton} ${reservas?.status == "1" || reservas?.status == "3" || reservas?.status == "4" || reservas?.status == "5" || reservas?.pagadoPrimeraMitad ? styles.disabledButtonp : ""}`}>
                {isLoading ? "Generando link..." : "Pagar Total"}
              </button>

            </div>
          </div>

          <div className={styles.gestionarReserv}>
            <p>Gestionar reserva</p>
            <div className={styles.acciones}>
              {/* <a>Modificar reserva</a> */}

              <button
                onClick={() => confirmarCancelacion(reservas._id)}
                disabled={reservas?.status == "4"}
                className={`${styles.cancelarButton} ${reservas?.status == "4" ? styles.disabledButtonc : ""}`}
              >
                Cancelar reserva
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gestionar;

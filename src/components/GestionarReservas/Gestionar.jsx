import React, { useEffect, useState } from "react";
import styles from "./styles/gestionar.module.css";
import { format } from "@formkit/tempo";
import { currency } from "../../stores/divisas"; //  store de divisa
import { useStore } from "@nanostores/react";
import { hoteles, habitaciones } from "./InfoHoteles";
import Cookies from "js-cookie";
import {
  generarLinkPago,
  generarLinkPagoBilletera,
  linkPago,
} from "../../stores/pagos";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import TablaDesglose from "../desglose/TablaDesglose";
import { refreshToken } from "../../stores/authtoken";

//UseState
const Gestionar = ({ reservas }) => {
  // console.log(reservas); // Datos de la reserva
  const checkin = format(reservas?.reservation.checkin, "D MMM", "es");
  const checkout = format(reservas?.reservation.checkout, "D MMM", "es");
  const [isLoading, setisLoading] = useState(false);
  const [nota, setNota] = useState(reservas?.notasSuperAdmin || "");
  const [mostrarnota1, setmostrarnota1] = useState(false);
  const [mostrarnota2, setmostrarnota2] = useState(false);
  const [AvailableAmount, setAvailableAmount] = useState(null);
  const [datosDelUsuario, setdatosDelUsuario] = useState();
  const [mostrarExtranjero, setmostrarExtranjero] = useState(false);
  const [mostrarAdicionalA, setmostrarAdicionalA] = useState(false);
  const [mostrarAdicionalC, setmostrarAdicionalC] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mostrarMascotas, setMostrarMascotas] = useState(false);
  const [mostrarBeneficio, setMostrarBeneficio] = useState(false);
  const currentCurrency = useStore(currency); // COP o USD
  const sumaHuespe =
    Number(reservas?.reservation.children) +
    Number(reservas?.reservation.adults);

  let contador = 1;

  const [isEditingTitular, setIsEditingTitular] = useState(false);
  const [titularData, setTitularData] = useState({
    documento: "",
    firstName: "",
    lastName: "",
    fechaNacimiento: "",
    email: "",
    telephone: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUserData(datosdelusuario);
    if (reservas?.titularInfo && reservas?.reservation) {
      setTitularData({
        documento: reservas.titularInfo.documento || "",
        firstName: reservas.reservation.firstName || "",
        lastName: reservas.reservation.lastName || "",
        fechaNacimiento: reservas.titularInfo.fechaNacimiento || "",
        email: reservas.reservation.email || "",
        telephone: reservas.reservation.telephone || "",
      });
    }
  }, [reservas]);

  const handleTitularChange = (e) => {
    const { name, value } = e.target;
    setTitularData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //#region Editar datos titular

  const guardarCambiosTitular = async () => {
    try {
      setIsSaving(true);

      // Show loading state with Swal
      Swal.fire({
        title: "Guardando cambios...",
        text: "Por favor espere",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/editar-reserva/${reservas._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            documento: titularData.documento,
            firstName: titularData.firstName,
            lastName: titularData.lastName,
            email: titularData.email,
            telephone: titularData.telephone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar datos");
      }

      Swal.fire({
        title: "¡Éxito!",
        text: "Datos del titular actualizados correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#26547B",
      }).then(() => {
        window.location.reload();
      });

      setIsEditingTitular(false);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron actualizar los datos del titular",
        icon: "error",
        confirmButtonColor: "#26547B",
      });
    } finally {
      setIsSaving(false);
    }
  };

  //#region UseEffect general
  useEffect(() => {
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setdatosDelUsuario(datosdelusuario); //Seteo de datos de el usuario
    obtenerSaldo(datosdelusuario.token); // Obtener saldo de la agencia por token

    if (reservas?.mascotas) {
      setMostrarMascotas(true);
    } else {
      setMostrarMascotas(false);
    }

    if (reservas?.exentoIva) {
      setmostrarExtranjero(true);
    } else {
      setmostrarExtranjero(false);
    }

    if (reservas?.adicionCena) {
      setmostrarAdicionalC(true);
    } else {
      setmostrarAdicionalC(false);
    }

    if (reservas?.adicionAlmuerzo) {
      setmostrarAdicionalA(true);
    } else {
      setmostrarAdicionalA(false);
    }

    if (reservas.status == "2" || reservas.status == "0") {
      setmostrarnota1(true);
      setmostrarnota2(false);
    } else if (reservas.status == "1") {
      setmostrarnota1(false);
      setmostrarnota2(true);
    }

    // Nueva validación para mostrarBeneficio
    if (reservas?.cantidadHabitaciones >= 10) {
      setMostrarBeneficio(true);
    } else {
      setMostrarBeneficio(false);
    }
  }, [reservas?.status, reservas?.cantidadHabitaciones]);

  const infoHoteles = hoteles(reservas?.hotel);

  //#region Texto del textarea
  const handleChange = (event) => {
    setNota(event.target.value); // Guarda el valor del textarea en el estado
  };

  //#region Obtener MI Saldo
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

  //#region Link total-mitad
  const generarLink = async (id, booleano) => {
    setisLoading(true); // Deshabilitar el botón
    try {
      const linkP = await generarLinkPago(id, booleano); // Llamada a la API
      console.log(linkP);
      if (linkP.link) {
        window.location.href = linkP.link; // Redireccionar al link generado
        window.history.replaceState(null, "", "/misreservas");
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

  //#region Link mi saldo
  const generarLinkBilletera = async (id, booleano) => {
    setisLoading(true); // Deshabilitar el botón
    try {
      const linkP = await generarLinkPagoBilletera(id, booleano); // Llamada a la API
      console.log(linkP);
      if (linkP.link) {      
        window.location.href = linkP.link; // Redireccionar al link generado
      } else {
        alert("No se pudo generar el link de pago.");
      }
    } catch (error) {
      console.error("Error al generar el link:", error);

      Swal.fire({
        title: "Error",
        text: `No se pudo realizar el pago con Mi saldo, Verifique su saldo o intente nuevamente mas tarde`,
        icon: "error",
        confirmButtonColor: "#26547B",
      });
    } finally {
      setisLoading(false); // Habilitar el botón nuevamente
    }
  };

  //#region Boton pagar mitad
  const onClick = async (id, booleano) => {
    if (
      reservas?.status == "1" ||
      reservas?.status == "3" ||
      reservas?.status == "4"
    ) {
      return;
    }
    await generarLink(id, booleano);
  };
  //#region Boton pagar total
  const onClickTotal = async (id, booleano) => {
    if (
      reservas?.status == "1" ||
      reservas?.status == "3" ||
      reservas?.status == "4" ||
      reservas?.status == "5"
    ) {
      return;
    }
    await generarLink(id, booleano);
  };

  //#region Boton pagar billetera
  const onClickBilletera = async (id, booleano) => {
    if (
      reservas?.status == "1" ||
      reservas?.status == "3" ||
      reservas?.status == "4" ||
      reservas?.status == "5"
    ) {
      return;
    }
    await generarLinkBilletera(id, booleano);
  };

  //#region Formatear dinero
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  //#region editar reserva(nota)

  const editarnota = async (reservaId) => {
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/editar-reserva/${reservaId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            notasSuperAdmin: nota,
          }),
        }
      );

      // //#region Noti erro editar reserva
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al cancelar la reserva:", errorData);
        Swal.fire(
          "Error",
          "No se pudo guardar la nota. Intente nuevamente.",
          "error"
        );
        return;
      }

      //#region Exito editar reserva
      const data = await response.json();
      console.log("Nota guardada exitosamente:", data);
      Swal.fire({
        title: "¡Éxito!",
        text: "Nota guardada exitosamente.",
        icon: "success",
        timer: 1000, // La alerta se cierra automáticamente en 2 segundos
        showConfirmButton: false, // Ocultar botón de confirmación
        confirmButtonColor: "#26547B",
      }).then(() => {
        window.location.reload(); // Recargar la página
      });
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      //#region Noti fallo en la api de editar reserva
      Swal.fire(
        "Error",
        "Ocurrió un error al cancelar la reserva. Intenta nuevamente.",
        "error"
      );
    }
  };
  /*method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,*/

  //#region Cancelar reservas
  const cancelarReserva = async (reservaId) => {
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/reservas/cancelar-reserva`,
        {
          method: "DELETE",
          body: JSON.stringify({
            reservaId: reservaId,
          }),
        }
      );

      //#region Validar respuesta api
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

      //#region Noti exito al cancelar la reserva
      const data = await response.json();
      console.log("Reserva cancelada exitosamente:", data);

      Swal.fire({
        title: "¡Éxito!",
        text: "Reserva cancelada exitosamente.",
        icon: "success",
        confirmButtonColor: "#26547B",
      }).then(() => {
        window.location.href = "/misreservas";
      });
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);

      Swal.fire(
        "Error",
        "Ocurrió un error al cancelar la reserva. Intenta nuevamente.",
        "error"
      );
    }
  };

  //#region Modal Pago mi saldo

  const confirmarPago = (id) => {
    Swal.fire({
      title: "Seleccione el tipo de pago",
      text: "¿Qué porcentaje del valor total desea pagar?",
      icon: "question",
      showDenyButton: true,
      confirmButtonText: "Pagar Total",
      denyButtonText: "Pagar 50%",
      confirmButtonColor: "#26547B",
      denyButtonColor: "#4B70B2",
      showClass: {
        popup: "animate__animated animate__fadeInDown animate__slowest",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp animate__slowest",
      },
    }).then((result) => {
      if (result.isConfirmed || result.isDenied) {
        const isPagoCompleto = result.isConfirmed;

        Swal.fire({
          title: "¿Está seguro?",
          text: `Se procederá al pago con 'Mi saldo' que es ${formatCurrency(
            AvailableAmount
          )}. ${isPagoCompleto
              ? `Pagará el total del valor`
              : "Pagará el 50% del valor"
            }`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#26547B",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, pagar",
          cancelButtonText: "Cancelar",
          showClass: {
            popup: "animate__animated animate__fadeInDown slowest",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp animate__slowest",
          },
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            onClickBilletera(id, isPagoCompleto);
          }
        });
      }
    });
  };

  //#region Modal cancelar reservas
  const confirmarCancelacion = (reservaId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar esta reserva? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#26547B",
      cancelButtonColor: "#b22",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        cancelarReserva(reservaId); // Llama a la función de cancelación
      }
    });
  };

  const imprimirVoucher = () => {
    Swal.fire({
      title: "Porcentaje de incremento",
      text: "Ingrese el porcentaje a incrementar en los valores (0-100):",
      input: "number",
      inputAttributes: {
        min: 0,
        max: 100,
        step: 1,
      },
      showCancelButton: true,
      confirmButtonColor: "#26547B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Imprimir",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value || value < 0 || value > 100) {
          return "Por favor ingrese un número válido entre 0 y 100";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading mientras se genera el PDF
        Swal.fire({
          title: "Generando PDF",
          text: "Por favor espere...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const incremento = 1 + Number(result.value) / 100;
        const doc = new jsPDF();
        const margin = 20;
        let yPos = margin;

        // Función para crear el contenido del PDF
        const generarContenidoPDF = () => {
          // Título principal
          doc.setFontSize(20);
          doc.setTextColor(38, 84, 124);
          doc.text("VOUCHER DE RESERVA", margin, yPos);

          // Línea decorativa
          yPos += 5;
          doc.setDrawColor(38, 84, 124);
          doc.line(margin, yPos, 190, yPos);
          yPos += 15;

          // Información básica
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Código de Reserva: ${reservas?.reservaChatbotId}`,
            margin,
            yPos
          );
          yPos += 10;
          doc.text(`Hotel: ${reservas?.hotel}`, margin, yPos);
          yPos += 10;
          doc.text(
            `Check-in: ${checkin} - Check-out: ${checkout}`,
            margin,
            yPos
          );
          yPos += 10;
          doc.text(`Noches: ${reservas?.reservation.nights}`, margin, yPos);
          yPos += 10;
          doc.text(`Huéspedes totales: ${sumaHuespe}`, margin, yPos);
          yPos += 10;
          doc.text(
            `Habitaciones: ${reservas?.cantidadHabitaciones}`,
            margin,
            yPos
          );
          yPos += 10;
          doc.text(
            `Plan de alimentación: ${reservas?.planAlimentario}`,
            margin,
            yPos
          );

          // Separador
          yPos += 15;
          doc.line(margin, yPos, 190, yPos);
          yPos += 15;

          // Información del titular
          doc.setFontSize(14);
          doc.setTextColor(38, 84, 124);
          doc.text("INFORMACIÓN DEL TITULAR", margin, yPos);
          yPos += 10;
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Nombre: ${reservas?.reservation.firstName} ${reservas?.reservation.lastName}`,
            margin,
            yPos
          );
          yPos += 10;
          doc.text(
            `Documento: ${reservas?.titularInfo?.documento}`,
            margin,
            yPos
          );
          yPos += 10;
          doc.text(`Email: ${reservas?.reservation.email}`, margin, yPos);
          yPos += 10;
          doc.text(
            `Teléfono: ${reservas?.reservation.telephone}`,
            margin,
            yPos
          );

          // Separador
          yPos += 15;
          doc.line(margin, yPos, 190, yPos);
          yPos += 15;

          // Detalle de valores
          doc.setFontSize(14);
          doc.setTextColor(38, 84, 124);
          doc.text("DETALLE DE VALORES", margin, yPos);
          yPos += 10;
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);

          // Valores de habitaciones
          reservas?.reservation.roomsData.forEach((dato) => {
            const precioIncrementado = dato.unitaryPrice * incremento;
            doc.text(
              `${habitaciones[dato.id].name}: ${reservas.reservation.currency == "USD"
                ? `$${Math.round(precioIncrementado)} USD`
                : `${formatCurrency(Math.round(precioIncrementado))} COP`
              }`,
              margin,
              yPos
            );
            yPos += 10;
          });

          // Total
          yPos += 10;
          const totalIncrementado = reservas.total * incremento;
          doc.setFillColor(38, 84, 124);
          doc.rect(margin, yPos, 170, 10, "F");
          doc.setTextColor(255, 255, 255);
          doc.text(
            `Total a pagar: ${reservas.reservation.currency == "USD"
              ? `$${Math.round(totalIncrementado)} USD`
              : `${formatCurrency(Math.round(totalIncrementado))} COP`
            }`,
            margin + 2,
            yPos + 7
          );

          // Pie de página
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            "Este documento es un comprobante de reserva. Preséntelo al momento del check-in.",
            margin,
            280
          );

          // Guardar PDF
          doc.save(`voucher-${reservas?.reservaChatbotId}.pdf`);

          // Cerrar el loading
          Swal.close();
        };

        // Generar el PDF
        generarContenidoPDF();
      }
    });
  };

  // Agregar esta función para verificar si la fecha de check-in es futura
  const isCancellationDisabled = () => {
    const currentDate = new Date();
    const checkinDate = new Date(reservas?.reservation.checkin);
    currentDate.setHours(0, 0, 0, 0); // Resetear hora a medianoche para comparar solo fechas
    return currentDate > checkinDate || reservas?.status == "4";
  };

  return (
    <div className={styles.containerGestionar}>
      <p className={styles.title}>Consultar y gestionar reservas</p>

      {reservas?.status == 0 && reservas.pagadoPrimeraMitad == false ? (
        <p className={`${styles.estadoPago} ${styles.pending}`}>
          Pago pendiente
        </p>
      ) : reservas?.status == 1 && reservas.pagadoPrimeraMitad == false ? (
        <p className={`${styles.estadoPago} ${styles.proces}`}>
          Pago en proceso
        </p>
      ) : reservas?.status == 2 && reservas.pagadoPrimeraMitad == false ? (
        <p className={`${styles.estadoPago} ${styles.denied}`}>
          Pago rechazado primer abono
        </p>
      ) : reservas?.status == 3 && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.clomplete}`}>
          Pago aprobado
        </p>
      ) : reservas?.status == 4 ? (
        <p className={`${styles.estadoPago} ${styles.cancel}`}>
          Reserva cancelada
        </p>
      ) : reservas?.status == 2 && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.denied}`}>
          Pago total rechazado
        </p>
      ) : reservas?.status == 5 && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.abonado}`}>
          Abonado primera mitad
        </p>
      ) : reservas?.status == 1 && reservas.pagadoPrimeraMitad == true ? (
        <p className={`${styles.estadoPago} ${styles.proces}`}>
          Pago total en proceso
        </p>
      ) : (
        <p>Estado no valido</p>
      )}

      <div className={styles.card}>
        <div className={styles.hotelInfo}>
          <p>Datos de la reserva</p>
          <div className={styles.img}>
            <img src={infoHoteles?.imgHotel} alt="img" />
          </div>
        </div>

        <div className={styles.infoHabitaciones}>
          <p className={styles.idReserva}>
            Cod. Reserva: <span>
              {reservas?.reservaChatbotId}
              {userData?.agencia?._id === "677d771d155954115cea20a3" && (
                <span> || {reservas?.linkInfo.idLinkPago}</span>
              )}
            </span>
            <br />

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
                  {<p>{reservas?.planAlimentario}</p>}
                </div>
              </div>
            </div>
            <br />
            <div className={styles.habitaciones}>
              {reservas?.reservation.roomsData.map((dato, index) => (
                <div className={styles.cardHabi} key={index}>
                  <div className={styles.contenHabi}>
                    <div className={styles.imgHabi}>
                      <img
                        src={habitaciones[dato.id]?.url}
                        alt='habita'
                      />
                    </div>
                    <div className={styles.infoHabitaciones}>
                      <p className={styles.titleHabi}>
                        {dato.nombreHabitacion}
                      </p>
                      <p>
                        Check-in: {checkin} - Check-out: {checkout}
                      </p>
                      <p>
                        {reservas.reservation.nights} noches,{" "}
                        {Number(dato.adults) || 0} Adultos, {Number(dato.children) || 0} Niños, 1 habitación
                        {/* {Number(dato.adults) + Number(dato.children)} huéspedes, */}
                      </p>
                    </div>
                  </div>
                  <p className={styles.totalCard}>
                    {reservas?.reservation.currency == "USD"
                      ? `$${dato.unitaryPrice} USD`
                      : `${formatCurrency(dato.unitaryPrice)} COP`}
                  </p>
                </div>
              ))}
            </div>
            <br />
            <div className={styles.infoTotal}>
              <div className={styles.titleTotal}>
                <p>Valor a pagar + impuestos</p>

                {reservas?.infoToures && (
                  <div className={styles.tourInfo}>
                    <h4>Información del Tour</h4>
                    {reservas.infoToures.nombres && (
                      <p>
                        Tours seleccionados:{" "}
                        {reservas.infoToures.nombres.join(", ")}
                      </p>
                    )}
                    <p>
                      Contacto principal:{" "}
                      {reservas.infoToures.firstContactNumber}
                    </p>
                  </div>
                )}

                {reservas?.infoTransporte && (
                  <div className={styles.transportInfo}>
                    <h4>Información del Transporte</h4>
                    <p>
                      Número de vuelo: {reservas.infoTransporte.numeroVuelo}
                    </p>
                    <p>Aerolínea: {reservas.infoTransporte.aerolinea}</p>
                    <p>
                      Tipo de recogida:{" "}
                      {reservas.infoTransporte.tipoRecogida == 0
                        ? "Aeropuerto - Hotel"
                        : reservas.infoTransporte.tipoRecogida == 1
                          ? "Hotel - Aeropuerto"
                          : "Aeropuerto - Hotel || Hotel - Aeropuerto"}
                    </p>
                    <p>
                      Contacto: {reservas.infoTransporte.firstContactNumber}
                    </p>
                    <p>
                      Cantidad de personas:{" "}
                      {reservas.infoTransporte.cantidadPersonas}
                    </p>
                  </div>
                )}
                {reservas?.mascotasNumber > 0 && (
                  <div>
                    <b>
                      El huésped llevará {reservas.mascotasNumber}
                      {reservas.mascotasNumber === 1 ? " mascota" : " mascotas"}
                    </b>
                  </div>
                )}
                {mostrarExtranjero && (
                  <div>
                    <b>El huesped es extranjero </b>
                  </div>
                )}
                {mostrarAdicionalA && (
                  <div>
                    <b>Se adicionó almuerzo</b>
                  </div>
                )}
                {mostrarAdicionalC && (
                  <div>
                    <b>Se adicionó cena</b>
                  </div>
                )}

                <p className={styles.plazoPago}>
                  Tienes plazo de pagar hasta el {reservas?.fechaLimitePago}
                </p>
              </div>

              <p className={styles.total}>
                {reservas?.reservation.currency == "USD"
                  ? `$${reservas?.total} USD`
                  : `${formatCurrency(reservas?.total)} COP`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentHusped_pago}>
        <div className={styles.containerHuesped}>
          <p className={styles.titleHuespe}>Información de los huéspedes</p>
          <div className={styles.habitacionesForm}>
            <p className={styles.titleForm}>
              Numero de Habitaciones: {reservas?.cantidadHabitaciones}
            </p>
            <p className={styles.checkin}>Check-in: {checkin}</p>
            <div className={styles.cardHuesped}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p className={styles.titleTitular}>Huésped 1 (Titular)</p>
                <button
                  onClick={() => setIsEditingTitular(!isEditingTitular)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  ✎
                </button>
              </div>

              {!isEditingTitular ? (
                <>
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
                </>
              ) : (
                <div className={styles.editForm}>
                  <div className={styles.inputGroup}>
                    <p className={styles.infoH}>Cédula de ciudadanía:</p>
                    <input
                      type="text"
                      name="documento"
                      value={titularData.documento}
                      onChange={handleTitularChange}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <p className={styles.infoH}>Nombres:</p>
                    <input
                      type="text"
                      name="firstName"
                      value={titularData.firstName}
                      onChange={handleTitularChange}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <p className={styles.infoH}>Apellidos:</p>
                    <input
                      type="text"
                      name="lastName"
                      value={titularData.lastName}
                      onChange={handleTitularChange}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <p className={styles.infoH}>Fecha de nacimiento:</p>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={titularData.fechaNacimiento}
                      onChange={handleTitularChange}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <p className={styles.infoH}>Correo electrónico:</p>
                    <input
                      type="email"
                      name="email"
                      value={titularData.email}
                      onChange={handleTitularChange}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <p className={styles.infoH}>Celular:</p>
                    <input
                      type="tel"
                      name="telephone"
                      value={titularData.telephone}
                      onChange={handleTitularChange}
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.editButtons}>
                    <button
                      onClick={() => setIsEditingTitular(false)}
                      className={styles.cancelButton}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarCambiosTitular}
                      className={styles.saveButton}
                      disabled={isSaving}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <br />
            <div className={styles.acuerdos}>
              {mostrarBeneficio && (
                <p>
                  <b style={{}}>
                    Se le aplicara bonificacion de Tour Conductor{" "}
                  </b>
                  <br />
                  Por cada 10 habitaciones reservadas se le obsequiará una
                  habitación y por cada 20 reservadas seran 2 habitaciones
                  obsequiadas
                </p>
              )}

              {mostrarExtranjero && (
                <p>
                  {" "}
                  Todo huesped extranjero sera exento de iva pero debe mostrar
                  su pasaporte al momento de hacer check-in en la recepción{" "}
                </p>
              )}
              <br />
              <p>Tener en cuenta:</p>
              <br />
              <p>
                * La cadena hotelera Geh Suites protege a los niños, niñas y
                adolescentes de la explotación sexual y comercial Ley 679 de
                2001.
              </p>
              <br />
              <p>
                {" "}
                * Recuerde: todo niño que viaje debe contar con su documento de
                identidad (Registro civil o tarjeta de identidad).
              </p>
              <br />
              <p>
                * Si los niños que viajan no son hijos de los adultos que los
                representan deben contar con un permiso de los padres,
                autenticado en una notaría.
              </p>
              <br />
              {/* <b style={{fontSize:"16px"}}>Politicas de cancelacion de BookingConnect</b>
              <p style={{fontFamily:"Roboto"}}>
                <br />
                Las facturas serán emitidas a su empresa Reservas sin garantías
                o con garantías vencidas serán canceladas .
                En caso de ser viajeros con nacionalidad colombiana o extranjeros con
                residencia en Colombia, o en su defecto, si han pasado más de 3
                meses en el país, deberán abonar adicional el IVA del 19% en la
                recepción al momento de su check-in. PDT: No- shows: Todo
                pasajero que por cualquier motivo no se presente el día de su
                viaje será considerado como “NO SHOW” y se le aplicará
                penalidad, valor 1 noche. No dude en contactarnos a través de
                llamadas y WhatsApp a la línea +57 3336025021.
              </p> */}
              <br />
              <p>
                <b>Política de mascotas: </b>
                <br />
                {"º"} Se permite el ingreso de mascotas con un peso máximo de 8
                kg.
                <br />
                {"º"} Solo se permite una mascota por habitación.
                <br />
                {"º"} No se permite dejar a la mascota sola en la habitación en
                ningún momento.
              </p>
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
                  <td>
                    <strong>Porcentaje %</strong>
                  </td>
                  <td>{reservas?.reteFuente?.porcentaje}%</td>
                  <td>{reservas?.reteIca?.porcentaje}%</td>
                  <td>{reservas?.reteIva?.porcentaje}%</td>
                </tr>
                <tr>
                  <td>
                    <strong>Valor $</strong>
                  </td>
                  <td>{formatCurrency(reservas?.reteFuente?.resultado)}</td>
                  <td>{formatCurrency(reservas?.reteIca?.resultado)}</td>
                  <td>{formatCurrency(reservas?.reteIva?.resultado)}</td>
                </tr>
              </tbody>
            </table>

            {/* <TablaDesglose precio={reservas?.total}/> */}
            <br />
            {datosDelUsuario?.role.includes("super-admin") ? (
              <div className={styles.textAreaNotas}>
                <h3>Nota:</h3>

                <p
                  style={{
                    fontStyle: "normal",
                    color: "black",
                    fontSize: "14px",
                  }}
                >
                  {reservas.notasSuperAdmin}
                </p>

                <h3 style={{ fontSize: "14px" }}>Ingrese la nota que desee:</h3>
                <textarea
                  name="notas"
                  id="notaspropias"
                  value={nota}
                  placeholder="Escriba sus notas aquí"
                  onChange={handleChange}
                  maxLength={200}
                ></textarea>

                <button onClick={() => editarnota(reservas._id)}>
                  Acualizar nota{" "}
                </button>

                <p>
                  Atención: Estas notas solo son visibles para uso interno y no
                  la podra ver las agencias que realizaron la reserva
                </p>
              </div>
            ) : (
              <></>
            )}
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
                {/* <p>{primerPlan}</p> */}
                <p>{dato?.nombreHabitacion}</p>
                {/* <p>Medía pensión</p> */}
                <p>
                  {checkin} - {checkout}
                </p>
                <p>
                  {reservas.reservation.nights} noches,{" "}
                  {Number(dato.adults) + Number(dato.children)} huéspedes
                </p>
                <p>{formatCurrency(dato.unitaryPrice)}</p>
              </div>
            ))}
            <div className={styles.pagos}>
              {reservas?.status == "0" &&
                reservas.pagadoPrimeraMitad == false ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.totalMitad)}
                  </p>
                </div>
              ) : reservas?.status == "1" &&
                reservas.pagadoPrimeraMitad == false ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.totalMitad)}
                  </p>
                </div>
              ) : reservas?.status == "2" &&
                reservas.pagadoPrimeraMitad == false ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.totalMitad)}
                  </p>
                </div>
              ) : reservas?.status == "3" &&
                reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Total + impuestos</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.total)}
                  </p>
                </div>
              ) : reservas?.status == "4" ? (
                <div className={styles.totalPago}>
                  <p>Total + impuestos</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.total)}
                  </p>
                </div>
              ) : reservas?.status == "2" &&
                reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.totalMitad)}
                  </p>
                </div>
              ) : reservas?.status == "5" &&
                reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.totalMitad)}
                  </p>
                </div>
              ) : reservas?.status == "1" &&
                reservas.pagadoPrimeraMitad == true ? (
                <div className={styles.totalPago}>
                  <p>Pago del 50%</p>
                  <p className={styles.totalP}>
                    {formatCurrency(reservas?.totalMitad)}
                  </p>
                </div>
              ) : (
                <p>Monto no valido</p>
              )}
              <button
                onClick={() => onClick(reservas._id, false)}
                disabled={
                  reservas?.status == "1" ||
                  reservas?.status == "3" ||
                  reservas?.status == "4" ||
                  isLoading
                }
                className={`${styles.pagarButton} ${reservas?.status == "1" ||
                    reservas?.status == "3" ||
                    reservas?.status == "4"
                    ? styles.disabledButtonp
                    : ""
                  }`}
              >
                {isLoading ? "Generando link..." : "Pagar el 50%"}
              </button>
              <br />
              <button
                onClick={() => onClickTotal(reservas._id, true)}
                disabled={
                  reservas?.status == "1" ||
                  reservas?.status == "3" ||
                  reservas?.status == "4" ||
                  reservas?.status == "5" ||
                  reservas?.pagadoPrimeraMitad ||
                  isLoading
                }
                className={`${styles.pagarButton} ${reservas?.status == "1" ||
                    reservas?.status == "3" ||
                    reservas?.status == "4" ||
                    reservas?.status == "5" ||
                    reservas?.pagadoPrimeraMitad
                    ? styles.disabledButtonp
                    : ""
                  }`}
              >
                {isLoading ? "Generando link..." : "Pagar Total"}
              </button>
              <button
                onClick={() => confirmarPago(reservas._id)}
                disabled={
                  reservas?.status == "1" ||
                  reservas?.status == "3" ||
                  reservas?.status == "4" ||
                  reservas?.status == "5" ||
                  reservas?.pagadoPrimeraMitad ||
                  isLoading
                }
                className={`${styles.pagarButton} ${reservas?.status == "1" ||
                    reservas?.status == "3" ||
                    reservas?.status == "4" ||
                    reservas?.status == "5" ||
                    reservas?.pagadoPrimeraMitad
                    ? styles.disabledButtonp
                    : ""
                  }`}
              >
                {isLoading ? "Generando link..." : "Pagar con Mi saldo"}
              </button>
            </div>
            <div className={styles.noticeContainer}>
              {mostrarnota1 && (
                <p className={styles.notice} disabled={mostrarnota1 == true}>
                  Nota: Si el estado es rechazado, podras intentar nuevamente en
                  el boton de pagar
                </p>
              )}
              {mostrarnota2 && (
                <p className={styles.notice} disabled={mostrarnota2 == true}>
                  Nota: Si el pago está en proceso, podra intentar pagar
                  nuevamente dentro de 30 min
                </p>
              )}
            </div>
          </div>

          <div className={styles.gestionarReserv}>
            <p>Gestionar reserva</p>
            <div className={styles.acciones}>
              {/* <a>Modificar reserva</a> */}

              <button
                onClick={() => confirmarCancelacion(reservas._id)}
                disabled={isCancellationDisabled()}
                className={`${styles.cancelarButton} ${isCancellationDisabled() ? styles.disabledButtonc : ""
                  }`}
              >
                Cancelar reserva
              </button>
              {/* <button
                onClick={imprimirVoucher}
                disabled={reservas?.status == "4"}
                className={`${styles.cancelarButton} ${
                  reservas?.status == "4" ? styles.disabledButtonc : ""
                }`}
              >
                Imprimir voucher
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gestionar;

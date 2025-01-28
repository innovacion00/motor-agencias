import React, { useEffect, useState } from "react";
import DropdownSearch from "./DropdownSearch";
import FormularioRetenciones from './FormularioRetenciones'
import "./FormularioReserva.css";
import Swal from "sweetalert2";
import { format } from "@formkit/tempo";
import TablaDesglose from "./TablaDesglose";

//UseState
const FormularioReserva = () => {
  const [reserva, setReserva] = useState([]);
  const [agencia, setagencia] = useState();
  const [huespedes, sethuespedes] = useState();
  const [mostrarTexto, setMostrarTexto] = useState(false); // Estado para controlar la visibilidad del texto //false para mas de 72h
  const [mostrarBoton, setmostrarBoton] = useState(false);
  const [fechasreserva, setfechasreserva] = useState();
  const [cantadultos, setcantadultos] = useState();
  const [cantninos, setcantninos] = useState();
  const [botondesactivado, setbotondesactivado] = useState(false); //controlar el boton de reserva
  const [esExtranjero, setesExtranjero] = useState(false)
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    numeroDocumento: "",
    nombreCompleto: "",
    apellidos: "",
    fechaNacimiento: "",
    email: "",
    celular: "",
    // esExtranjero:false
  });
  //convertir esExtranjero
  const valorextranjero = esExtranjero == true ? ("Extranjero") : ("NO es extanjero")


  // Parsea numeros de body a string
  const adults = JSON.stringify(cantadultos);
  const ninos = JSON.stringify(cantninos);
  const ninos1 = cantninos === 0 ? "" : JSON.stringify(cantninos);
  //console.log(ninos);
  const noches = JSON.stringify(reserva[0]?.nights);
  const habitaciones = JSON.stringify(reserva.length);

  // Formatea correctamente las fechas
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


  //Convetir edades en string y separarlos por coma
  const childrenAgesString = fechasreserva?.layout
    .flatMap((room) => room.children_ages || [])
    .join(",") || "";

  //Arreglo con el rango de edades de los niños
  const edadesninos = fechasreserva?.layout.map((dato) =>
    dato.children_ages.join(",")
  );
  // console.log("edades niños",edadesninos)

  //Calculo del IVA
  const totalPrecio = reserva.reduce((total, data) => total + data.precio, 0); //Calcular valor total de las habitaciones
  const tasaIVA = 0.19; // Tasa del IVA
  const valorIVA = esExtranjero == true ? (totalPrecio * 0) : (totalPrecio * tasaIVA)      //totalPrecio * tasaIVA; 
  const totalConIVA = totalPrecio + valorIVA; //Calcular valor total + IVA

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

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
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
      const informacionD = JSON.stringify({
        total: totalConIVA,
        titularInfo: {
          firstName: formData.nombreCompleto,
          lastName: formData.apellidos,
          tipoDocumento: formData.tipoDocumento,
          documento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento,
        },
        exentoIva: esExtranjero,
        reservaInfo: {
          agency: {
            is_agency: true,
            agency_type: agencia.agencia.category, //token
            external_ref_id: "666222",
          },
          reservation: {
            adults: adults,
            checkin: checkin,
            checkout: checkout,
            children: ninos,
            children_ages: childrenAgesString, //
            city: reserva[0].ciudad,
            country: "COL",
            currency: "COP",
            email: formData.email, //
            firstName: formData.nombreCompleto,
            lastName: formData.apellidos,
            nights: noches,
            notes: `Reserva de ${noches} noches a nombre de ${formData.nombreCompleto} ${formData.apellidos}. El huesped ${valorextranjero}. ${valorextranjero == "es extranjero" ? "Favor verificar en recepcion si cumple con los requisitos de migracion colombia" : ""}`,
            rooms: habitaciones,
            roomsData: reserva.map((dato, index) => {
              const roomConfig = fechasreserva.layout[index] || {}; // Asegúrate de obtener el layout correspondiente a la habitación.
              return {
                nombreHabitacion: dato.NombreH,
                adults: JSON.stringify(roomConfig.adults || 0), // Adultos específicos por habitación.
                children_ages: roomConfig.children_ages?.join(",") || "",
                children: roomConfig.children_ages
                  ? JSON.stringify(roomConfig.children_ages.length)
                  : "",
                checkin: checkin,
                checkout: checkout,
                currency: "COP",
                id: dato.roomId,
                quantity: "1",
                rateId: dato.rateId,
                unitaryPrice: dato.precio,
              };
            }),

            telephone: `+57${formData.celular}`,
          },
        },
      }); //JSON.STRINGIFY

      try {
        // error409
        setbotondesactivado(true);
        const url = `https://gehsuitesapps.com/agencias/v1/reservas/reservar?hotelId=${reserva[0].hotelid}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${agencia.token}`,
          },
          body: informacionD,
        });

        console.log(response);

        if (response.ok) {
          const data = await response.json();

          // Notificación de éxito
          console.log(data);
          Swal.fire({
            icon: "success",
            title: "Reserva realizada",
            text: "Se ha confirmado su reserva con exito.",
          });
          setTimeout(() => {
            window.location.href = "/misreservas"; //Redireccion hacia la pagina de reserva pagada
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
        // Manejo de errores con SweetAlert
        Swal.fire({
          icon: "error",
          title: "Error al realizar la reserva",
          text: "No se pudo realizar la reserva. Por favor, Verifica los datos ingresados o intenta hacer la reserva con otra organizacion ",
        });
        console.error("Error al obtener disponibilidad:", error);
      } finally {
        botondesactivado(false);
      }
      console.log(informacionD); //QUITAR CONSOLE.LOG CUANDO QUEDE LISTO
    };
    enviardatos(); //QUITAR CONSOLE.LOG CUANDO QUEDE LISTO
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

  //UseEffect
  useEffect(() => {
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
    const informacion = JSON.parse(localStorage.getItem("datosreserva"));
    const adultos = JSON.parse(localStorage.getItem("cantAdultos"));
    const ninos = JSON.parse(localStorage.getItem("cantNinos"));
    const fechas = JSON.parse(localStorage.getItem("nochesyedades"));
    const token = JSON.parse(localStorage.getItem("datosUsuario"));
    setReserva(informacion);
    setcantadultos(adultos);
    setcantninos(ninos);
    setfechasreserva(fechas);
    setagencia(token);
  }, []);

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
              <strong>Numero de camas:</strong> {data.beds}
            </p>
            <p style={{ fontWeight: "bold", color: "#2c3e50" }}>
              <strong>Total a pagar:</strong> {formatCurrency(data.precio)}
            </p>
          </div>
        ))}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "5px",
            padding: "15px",
            marginBottom: "20px",
            display: 'flex',
            gap: '1rem',
            width:'100%',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3>Valor total</h3>

            <p>
              Precio total a pagar:{" "}
              <strong> {formatCurrency(totalConIVA)} </strong>
            </p>
            <p>(Hospedaje + Desayuno + Impuestos)</p>
            <strong>Nota: En caso de que el titular de la reserva sea de nacionalidad colombiana {/*y cumpla con los requisitos de migración colombia,*/} se debe asumir el impuesto del iva del 19%. </strong>
          </div>
          <div>
            <h3>Detallado</h3>
            <TablaDesglose precio={totalConIVA} adults={adults} ninos={ninos} fechasreserva={fechasreserva} />
          </div>
        </div>
        <FormularioRetenciones precio={totalConIVA} adults={adults} ninos={ninos} fechasreserva={fechasreserva} />
        <h3>Información de los huéspedes</h3>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>


          <fieldset
            style={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <legend>Informacion del titular</legend>

            <div>
              {/* Checkbox De huesped o no  */}
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
                <option value="cedula">Cédula de ciudadanía</option>
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

            <div>
              <label htmlFor="nombreCompleto">
                Nombre del titular <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="nombreCompleto"
                type="text"
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

            <div>
              <label htmlFor="apellidos">
                Apellidos del titular <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="apellidos"
                type="text"
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

            <div>
              <label htmlFor="email">
                Correo electrónico <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="email"
                type="email"
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

            <div>
              <label htmlFor="celular">
                Celular <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="celular"
                type="tel"
                value={formData.celular}
                onChange={handleChange}
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
          </fieldset>
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
        </form>
      </div>
    </>
  );
};

export default FormularioReserva;

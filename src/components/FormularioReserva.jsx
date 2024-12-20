import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./FormularioReserva.css";
import Swal from "sweetalert2";
import { format } from "@formkit/tempo";

//UseState
const FormularioReserva = () => {
  const [reserva, setReserva] = useState([]);
  const [fechasreserva, setfechasreserva] = useState();
  const [cantadultos, setcantadultos] = useState();
  const [cantninos, setcantninos] = useState();
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    numeroDocumento: "",
    nombreCompleto: "",
    fechaNacimiento: "",
    email: "",
    celular: "",
  });

  // console.log(fechasreserva)

  // const transformarfechacheckin = new Date(reserva[0]?.checkin)

  const checkin = format(fechasreserva?.dateRange?.startDate  , "YYYY-MM-DD", "es")
  const checkout = format(fechasreserva?.dateRange?.endDate  , "YYYY-MM-DD", "es")
  
  const edadesninos = fechasreserva?.layout.map((dato)=>(
    dato.children_ages.join(",")
  ))
  console.log(edadesninos)

  //  console.log(checkin);
  const {
    tipoDocumento,
    numeroDocumento,
    fechaNacimiento,
    nombreCompleto,
    email,
    celular,
  } = formData;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      tipoDocumento.trim() == "" ||
      numeroDocumento.trim() == "" ||
      fechaNacimiento.trim() == "" ||
      nombreCompleto.trim() == "" ||
      email.trim() == "" ||
      celular.trim() == ""
    ) {
      Swal.fire({
        //Alerta de datos de incio de sesion incorrectos
        icon: "error",
        text: "Todos los campos del titular son obligatorios",
        showConfirmButton: false,
        timer: 2800,
      });
      return;
    }

    const enviardatos = async () => {
      const informacionD = {
        total: 7000000,
        reservaInfo: {
          agency: {
            is_agency: true,
            agency_type: 1, //token
            external_ref_id: "666222",
          },
          reservation: {
            adults: cantadultos,
            checkin: checkin ,
            checkout: checkout,
            children: cantninos,
            children_ages: "", //
            city: reserva[0].ciudad,
            country: "COL",
            currency: "COP",
            email: "rous@gmail.com",
            firstName: "El Rous",
            lastName: "Overestaing",
            nights: reserva[0].nights,
            notes: `Reserva de ${reserva[0].nights}`,
            rooms: reserva.length,
            roomsData: reserva.map((dato)=>({
              
              adults: cantadultos,
              children: cantninos,
              checkin: checkin,
              checkout: checkout,
              currency: "COP",
              id: dato.roomId,
              quantity: "1",
              rateId: dato.rateId[0],
              unitaryPrice: dato.precio,
            })) 
              
            ,
            telephone: "+573002226417",
          },
        },
      };

      try {
        const url = `http://206.189.199.124:3000/agencias/v1/reservas/reservar?hotelId=${reserva.hotelid}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: objetoprueba,
        });
        console.log(response);
        if (response.ok) {
          const data = await response.json();

          // Guardar los datos en la store
          disponibilidad.set(data);

          localStorage.setItem("data", JSON.stringify(data));

          // Notificación de éxito
          // Swal.fire({
          //     icon: "success",
          //     title: "Búsqueda exitosa",
          //     text: "Los datos de disponibilidad se han obtenido correctamente.",
          // });

          console.log("Disponibilidad obtenida:", disponibilidad.get());
        } else {
          throw new Error("Error al consultar la API");
        }
      } catch (error) {
        // Manejo de errores con SweetAlert
        Swal.fire({
          icon: "error",
          title: "Error en la búsqueda",
          text: "No se pudo obtener la disponibilidad. Por favor, verifica los datos ingresados o intenta nuevamente más tarde.",
        });
        console.error("Error al obtener disponibilidad:", error);
      }
      console.log(informacionD)
    };
    enviardatos()
  };

  // const [datosreserva, setdatosreserva] = useState([]);

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
    const informacion = JSON.parse(localStorage.getItem("datosreserva"));
    const adultos = JSON.parse(localStorage.getItem("cantAdultos"));
    const ninos = JSON.parse(localStorage.getItem("cantNinos"));
    const fechas = JSON.parse(localStorage.getItem("nochesyedades"));
    setfechasreserva(fechas);
    setReserva(informacion);
    setcantninos(ninos);
    setcantadultos(adultos);
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
    <div style={{ fontFamily: "Roboto, sans-serif", padding: "20px" }}>
      <h2>¡Falta poco! Termina de completar la información</h2>
      <div
        style={{ background: "#FFE4B5", padding: "10px", marginBottom: "20px" }}
      >
        <p style={{ color: "#C65D21" }}>
          <strong>Completa la información obligatoria</strong>
        </p>
        <p>
          Para reservas con menos de 72 horas de anticipación, requerimos el
          pago inmediato.
        </p>
      </div>

      <h3>Datos de la reserva</h3>
      {reserva?.map((data) => (
        <div
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
            <strong>Noches: </strong> {data.nights} <strong>Huéspedes:</strong>{" "}
            {data.huespedes}
          </p>
          <p>
            <strong>Numero de camas:</strong> {data.beds}
          </p>
          <p style={{ fontWeight: "bold", color: "#2c3e50" }}>
            <strong>Total a pagar:</strong> {formatCurrency(data.precio)}
          </p>
        </div>
      ))}
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
          <legend>Habitación 1: Doble estándar</legend>

          <div>
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
              Nombre completo <span style={{ color: "red" }}>*</span>
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
          type="submit"
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Confirmar Reserva
        </button>
      </form>
    </div>
  );
};

export default FormularioReserva;

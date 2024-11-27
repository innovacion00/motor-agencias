import React from "react";
import { useForm } from "react-hook-form";
import './FormularioReserva.css';
import Swal from "sweetalert2";

const FormularioReserva = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    
    console.log("Datos enviados:", data);
    Swal.fire({                 //Alerta de datos de incio de sesion incorrectos
      icon: "success",
      text: "Datos de inicio de sesion incorrectos",
      showConfirmButton: false,
      timer: 4000
      
    });setTimeout(() => {
      window.location.href = '/reservapagada'; //Redireccion hacia la pagina de reserva pagada
    },1500);
    
  };

  return (
    <div style={{ fontFamily: "Roboto, sans-serif", padding: "20px" }}>
      <h2>¡Falta poco! Termina de completar la información</h2>
      <div style={{ background: "#FFE4B5", padding: "10px", marginBottom: "20px" }}>
        <p style={{ color: "#C65D21" }}>
          <strong>Completa la información obligatoria</strong>
        </p>
        <p>
          Para reservas con menos de 72 horas de anticipación, requerimos el pago inmediato.
        </p>
      </div>

      <h3>Datos de la reserva</h3>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h4>Hotel Avexi Suites</h4>
        <p>
          <strong>Check-in:</strong> 6 sep <strong>Check-out:</strong> 10 sep
        </p>
        <p>
          <strong>Noches:</strong> 4 <strong>Huéspedes:</strong> 1
        </p>
        <p>
          <strong>Habitaciones:</strong> 1
        </p>
        <p style={{ fontWeight: "bold", color: "#2c3e50" }}>
          <strong>Total a pagar:</strong> $180.000
        </p>
      </div>

      <h3>Información de los huéspedes</h3>
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: "20px" }}>
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
              {...register("tipoDocumento", { required: "Este campo es obligatorio" })}
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
            {errors.tipoDocumento && (
              <p style={{ color: "red" }}>{errors.tipoDocumento.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="numeroDocumento">
              Número de documento <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="numeroDocumento"
              type="text"
              {...register("numeroDocumento", { required: "Este campo es obligatorio" })}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            {errors.numeroDocumento && (
              <p style={{ color: "red" }}>{errors.numeroDocumento.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="nombreCompleto">
              Nombre completo <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="nombreCompleto"
              type="text"
              {...register("nombreCompleto", { required: "Este campo es obligatorio" })}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            {errors.nombreCompleto && (
              <p style={{ color: "red" }}>{errors.nombreCompleto.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="fechaNacimiento">
              Fecha de nacimiento <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="fechaNacimiento"
              type="date"
              {...register("fechaNacimiento", { required: "Este campo es obligatorio" })}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            {errors.fechaNacimiento && (
              <p style={{ color: "red" }}>{errors.fechaNacimiento.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email">
              Correo electrónico <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Este campo es obligatorio" })}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="celular">
              Celular <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="celular"
              type="tel"
              {...register("celular", { required: "Este campo es obligatorio" })}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            {errors.celular && <p style={{ color: "red" }}>{errors.celular.message}</p>}
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

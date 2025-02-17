import React from "react";
import { useState } from "react";
import "../../public/styles/SolicitudPresupuesto.css";

//#region useState
const SolicitudPresupuesto = () => {
  const [tipoAcomodacion, settipoAcomodacion] = useState("Auditorio");
  const [radioAlimBebida, setradioAlimBebida] = useState(true);
  const accommodation = [
    {
      name: "Auditorio",
      image:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Auditorio.png",
    },
    { name: "Aula o salon", icon: "fas fa-chalkboard-teacher" },
    { name: "Cuadrada", icon: "fas fa-th-large" },
    { name: "Mesa redonda", icon: "fas fa-th-large" },
    { name: "U", icon: "fas fa-th-large" },
  ];

  const handleRadioChangeA = (event) => {
    setradioAlimBebida(event.target.value == "no");
  };

  return (
    <div>
      <div className="container">
        <nav className="breadcrumb">
          <a href="#">Eventos</a> /{" "}
          <a href="#">Crea tu solicitud de presupuesto</a>
        </nav>
        <h1>Crea tu solicitud de presupuesto</h1>
        
        <p>
          Tu solicitud de presupuesto nos ayudará a ofrecerte una propuesta
          personalizada con detalles sobre el espacio, los servicios y los
          costos para tu evento.
        </p>
        <section className="section">
          <h2>Hotel seleccionado</h2>
          <div>
            <p>Hotel Windsor House (8 salones disponibles)</p>
            <div className="radio-group">
              <label>
                <input type="radio" name="hotel" value="si" /> Sí, quiero
                seleccionar los salones.
              </label>
              <label>
                <input type="radio" name="hotel" value="no" defaultChecked />{" "}
                No, prefiero que el asesor elija el mejor salón para mi evento.
              </label>
            </div>
          </div>
        </section>
        <section className="section">
          <h2>Información general</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre_evento">
                Nombre del evento <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="nombre_evento"
                placeholder="Escribe el nombre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_evento">
                Tipo de evento <span style={{ color: "red" }}>*</span>
              </label>
              <select id="tipo_evento">
                <option value="">Selecciona una opción</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numero_asistentes">
                Número de asistentes <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                id="numero_asistentes"
                placeholder="N° de asistentes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_evento">
                Fecha de incio del evento{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <input type="datetime-local" id="fechayhorainicio" />
            </div>
            <div className="form-group">
              <label htmlFor="fecha_evento">
                Fecha final del evento <span style={{ color: "red" }}>*</span>
              </label>
              <input type="datetime-local" id="fechayhorafinal" />
            </div>
          </div>
          <br />
          <label htmlFor="flexible">¿Tus fechas son flexibles?</label>
          <div className="radio-group">
            <label>
              <input type="radio" name="flexibles" value="si" /> Sí
            </label>
            <label>
              <input type="radio" name="flexibles" value="no" defaultChecked />{" "}
              No
            </label>
          </div>
          <br />
          <label>
            Tipo de acomodación <span style={{ color: "red" }}>*</span>
          </label>
          <div className="accommodation-type">
            {accommodation.map((type) => (
              <button
                key={type.name}
                className={`accommodation-btn ${
                  tipoAcomodacion === type.name ? "active" : ""
                }`}
                onClick={() => settipoAcomodacion(type.name)}
              >
                <img
                  src={type.image}
                  alt={type.name}
                  className="accommodation-icon"
                />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="section">
          <h2>Servicios</h2>
          <label htmlFor="reqAlimentacionBebidas">
            ¿Requieres Alimentos y Bebidas?{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div className="radio-group">
            <label>
              <input type="radio" name="alimbebid" value="si" onChange={handleRadioChangeA} /> Sí
            </label>
            <label>
              <input type="radio" name="alimbebid" value="no" onChange={handleRadioChangeA} defaultChecked />{" "}
              No
            </label>
          </div>

          <div className={`checkbox-group ${radioAlimBebida ?"disabled":""}`}>
            <label className="title-label" >
              Selecciona las opciones que deseas incluir para tu solicitud
            </label>
            <label htmlFor="alimensi">
              <input
                type="checkbox"
                name="estacionDeCafe"
                value="coffebreakvalue"
                disabled={radioAlimBebida}
              />
              Estación de café
            </label>
            <label htmlFor="coffebreak">
              <input
                type="checkbox"
                name="coffebreak"
                value="coffebreakvalue"
                disabled={radioAlimBebida}
              />
              Coffee break
            </label>
            <label htmlFor="desayuno">
              <input type="checkbox" name="desayuno" value="desayunovalue" disabled={radioAlimBebida} />
              Desayuno
            </label>
            <label htmlFor="almuerzo">
              <input type="checkbox" name="almuerzo" value="almuerzovalue" disabled={radioAlimBebida} />
              Almuerzo
            </label>
            <label htmlFor="cena">
              <input type="checkbox" name="cena" value="cenavalue" disabled={radioAlimBebida} />
              Cena
            </label>
          </div>

          <br />
          <hr />
          <br />
          <label htmlFor="reqAudiovisuales">
            ¿Requieres audiovisuales? <span style={{ color: "red" }}>*</span>
          </label>
          <div className="radio-group">
            <label>
              <input type="radio" name="audiovisuales" value="si" /> Sí
            </label>
            <label>
              <input
                type="radio"
                name="audiovisuales"
                value="no"
                defaultChecked
              />{" "}
              No
            </label>
          </div>
          <hr />
          <br />
          <label htmlFor="reqDecoracion">
            ¿Requieres decoracion? <span style={{ color: "red" }}>*</span>
          </label>
          <div className="radio-group">
            <label>
              <input type="radio" name="decoracion" value="si" /> Sí
            </label>
            <label>
              <input type="radio" name="decoracion" value="no" defaultChecked />{" "}
              No
            </label>
          </div>
          <hr />
          <br />
          <label htmlFor="reqAlojamiento">
            ¿Requieres alojamiento? <span style={{ color: "red" }}>*</span>
          </label>
          <div className="radio-group">
            <label>
              <input type="radio" name="alojamiento" value="si" /> Sí
            </label>
            <label>
              <input
                type="radio"
                name="alojamiento"
                value="no"
                defaultChecked
              />{" "}
              No
            </label>
          </div>
        </section>
        <section className="section">
          <h2>Observaciones</h2>
          <textarea
            className="observaciones-textarea"
            id="Observaciones"
            placeholder="Escribe las observaciones"
          />

          <div className="terms">
            <input type="checkbox" id="terms" className="termscheck" />
            <label htmlFor="terms">Acepta los términos y condiciones</label>
          </div>

          <div className="buttons-container">
            <button className="btn btn-secondary">Salir</button>
            <button className="btn btn-primary">Enviar solicitud</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SolicitudPresupuesto;

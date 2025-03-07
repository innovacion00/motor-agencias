import React, { useEffect } from "react";
import { useState } from "react";
import "../../public/styles/SolicitudPresupuesto.css";

//#region useState
const SolicitudPresupuesto = () => {
  const [tipoAcomodacion, settipoAcomodacion] = useState("Auditorio");
  const [radioAlimBebida, setradioAlimBebida] = useState(true);
  const [mostrarTextarea, setMostrarTextarea] = useState(false);
  const [infohotel, setinfohotel] = useState(null); // <-- asegúrate de iniciar en null o {}
  const [mostrarTextareaDecoracion, setMostrarTextareaDecoracion] = useState(false);


  const handleRadioChangeA = (event) => {
    setradioAlimBebida(event.target.value == "no");
  };

  const handleAudiovisualesChange = (event) => {
    setMostrarTextarea(event.target.value === "si");
  };
  
  const handleDecoracionChange = (event) => {
    setMostrarTextareaDecoracion(event.target.value === "si");
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("infohotel"));
    setinfohotel(data);
  }, []);

  console.log(infohotel);

  const accommodation = [
    {
      name: "Auditorio",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/auditorio-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Auditorio-blanco.png",
    },
    {
      name: "Aula o salon",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/salon-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/salon-blanco.png",
    },
    {
      name: "Cuadrada",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/cudrada-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/cudrada-blanco.png",
    },
    {
      name: "Mesa redonda",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/mesa-redonda-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/mesa-redonda-blanco.png",
    },
    {
      name: "U",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/U-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/U-blanco.png",
    },
  ];

 

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
          <h2>Hotel seleccionado: {infohotel?.nombrehotel}</h2>
          <div>
            <p>
              Numero de salones disponibles: <b>{infohotel?.saloneshotel}</b>
            </p>
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
              <select id="tipo_evento" placeholder="Selecciona una opción">
                <option value="">Selecciona una opción</option>
                <option value="1">Eventos Corporativos</option>
                <option value="2">Eventos Sociales</option>
                <option value="3">Eventos Culturales</option>
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
                min={5}
                max={200}
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
                  src={
                    tipoAcomodacion === type.name
                      ? type.imageActive
                      : type.imagedefault
                  }
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
              <input
                type="radio"
                name="alimbebid"
                value="si"
                onChange={handleRadioChangeA}
              />{" "}
              Sí
            </label>
            <label>
              <input
                type="radio"
                name="alimbebid"
                value="no"
                onChange={handleRadioChangeA}
                defaultChecked
              />{" "}
              No
            </label>
          </div>

          <div
            className={`checkbox-group ${radioAlimBebida ? "disabled" : ""}`}
          >
            <label className="title-label">
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
              <input
                type="checkbox"
                name="desayuno"
                value="desayunovalue"
                disabled={radioAlimBebida}
              />
              Desayuno
            </label>
            <label htmlFor="almuerzo">
              <input
                type="checkbox"
                name="almuerzo"
                value="almuerzovalue"
                disabled={radioAlimBebida}
              />
              Almuerzo
            </label>
            <label htmlFor="cena">
              <input
                type="checkbox"
                name="cena"
                value="cenavalue"
                disabled={radioAlimBebida}
              />
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
          <input
            type="radio"
            name="audiovisuales"
            value="si"
            onChange={handleAudiovisualesChange}
          />{" "}
          Sí
        </label>
        <label>
          <input
            type="radio"
            name="audiovisuales"
            value="no"
            defaultChecked
            onChange={handleAudiovisualesChange}
          />{" "}
          No
        </label>
      </div>
      {/* Mostrar textarea solo si selecciona "Sí" */}
      {mostrarTextarea && (
        <div>
          <label htmlFor="detallesAudiovisuales">
            Escribe los detalles de los audiovisuales que necesitas:
          </label>
          <textarea
            id="detallesAudiovisuales"
            placeholder="Describe qué audiovisuales necesitas..."
            rows="4"
            cols="50"
            style={{ width: "100%", marginTop: "10px" }}
          />
        </div>
      )}
          <hr />
          <br />
          <label htmlFor="reqDecoracion">
        ¿Requieres decoración? <span style={{ color: "red" }}>*</span>
      </label>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            name="decoracion"
            value="si"
            onChange={handleDecoracionChange}
          />{" "}
          Sí
        </label>
        <label>
          <input
            type="radio"
            name="decoracion"
            value="no"
            defaultChecked
            onChange={handleDecoracionChange}
          />{" "}
          No
        </label>
        
          </div>
          {/* Mostrar el textarea solo si selecciona "Sí" */}
      {mostrarTextareaDecoracion && (
        <div>
          <label htmlFor="detallesDecoracion">
            Escribe los detalles de la decoración que necesitas:
          </label>
          <textarea
            id="detallesDecoracion"
            placeholder="Describe qué tipo de decoración necesitas..."
            rows="4"
            cols="50"
            style={{ width: "100%", marginTop: "10px" }}
          />
        </div>
      )}  
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

import React, { useEffect, useRef } from "react";
import { useState } from "react";
import "../../public/styles/SolicitudPresupuesto.css";
import Swal from "sweetalert2";
import { format, differenceInDays, addDays } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

//#region useState
const SolicitudPresupuesto = () => {
  const [audiovisuales, setAudiovisuales] = useState(false);
  const [itemsAudiovisuales, setItemsAudiovisuales] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [nombreEvento, setNombreEvento] = useState("");
  const [tipoEvento, setTipoEvento] = useState(null);
  const [cantidadAsistentes, setCantidadAsistentes] = useState(0);
  const [nombreOrganizador, setNombreOrganizador] = useState("");
  const [telefonoOrganizador, setTelefonoOrganizador] = useState("");
  const [emailOrganizador, setEmailOrganizador] = useState("");
  const [flexibilidadEvento, setFlexibilidadEvento] = useState(false);
  const [botondesactivado, setbotondesactivado] = useState(true);
  const [userData, setUserData] = useState();
  const [salones, setSalones] = useState([]);
  const [mostrarSalones, setMostrarSalones] = useState(false);
  const [tipoAcomodacion, settipoAcomodacion] = useState("Auditorio");
  const [radioAlimBebida, setradioAlimBebida] = useState(true);
  const [decoracion, setDecoracion] = useState(false);
  const [decoracionDescripcion, setDecoracionDescripcion] = useState("");
  const [Observaciones, setObservaciones] = useState("")
  const [infohotel, setinfohotel] = useState(null); // <-- asegúrate de iniciar en null o {}
  

  const dateRangeRef = useRef(null);
  const dropdownRef = useRef(null);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
  });

  const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);

  // Manejar cambios en el DateRange
  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRange({ startDate, endDate });

    // Calcular los días seleccionados
    const numDias = differenceInDays(endDate, startDate) + 1;

    // Generar valores por defecto para cada día
    setHorariosSeleccionados(
      Array.from({ length: numDias }).map((_, index) => {
        const fecha = format(addDays(startDate, index), "yyyy-MM-dd");
        return {
          fechaInicio: `${fecha}T12:00`,
          fechaFinal: `${fecha}T23:59`,
        };
      })
    );
  };

  // Calculamos la diferencia de días entre la fecha inicial y final
  const diasSeleccionados = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;

  const handleNombreChange = (e) => {
    setNombreEvento(e.target.value);
  };

  // Manejar cambios en los inputs de datetime-local
  const handleHorarioChange = (index, tipo, value) => {
    setHorariosSeleccionados((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [tipo]: value } : item))
    );
  };

  const handleTipoEventoChange = (e) => {
    setTipoEvento(parseInt(e.target.value, 10) || null); // Convierte a número o null si es vacío
  };

  const handleCantidadAsistentesChange = (e) => {
    setCantidadAsistentes(parseInt(e.target.value, 10)); // Convierte a número o 0 si es vacío
  };

  const handleNombreOrganizadorChange = (e) => {
    setNombreOrganizador(e.target.value);
  };

  const handleTelefonoOrganizadorChange = (e) => {
    setTelefonoOrganizador(e.target.value);
  };

  const handleEmailOrganizadorChange = (e) => {
    setEmailOrganizador(e.target.value);
  };

  const handleChangeFechasFlexibles = (event) => {
    setFlexibilidadEvento(event.target.value == "si");
  };

  const handleRadioChange = (event) => {
    setMostrarSalones(event.target.value == "si");
  };
  const handleRadioChangeA = (event) => {
    setradioAlimBebida(event.target.value == "no");
  };

  const handleAudiovisualesChange = (event) => {
    setAudiovisuales(event.target.value == "si");
  };

  const handleTextAreaChange = (event) => {
    setItemsAudiovisuales(event.target.value);
  };

  const handleDecoracionChange = (event) => {
    setDecoracion(event.target.value == "si");
  };

  const handleDecoracionDescripcionChange = (event) => {
    setDecoracionDescripcion(event.target.value);
  };

  // console.log(dateRange.startDate.toISOString());
  // UseEffect para manejar el estado del dropdown de fecha
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target)
      ) {
        setShowDateRange(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  //UseEffect para guardar o extraer datos del localstorage

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("infohotel"));
    const datosdelusuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUserData(datosdelusuario);
    if (data) {
      setinfohotel(data);
    }
  }, []);

  // Definir salones según la ciudad y el hotel guardado en infohotel
  useEffect(() => {
    if (!infohotel) return;

    if (infohotel.ciudad === "Bogota") {
      if (infohotel.nombrehotel === "Hotel Windsor House") {
        setSalones([
          {
            nombre: "Bond Club",
            imagen: "https://via.placeholder.com/200",
            ancho: "94m²",
            largo: "94m²",
            altura: "230m",
            espacio: "200m²",
            piso: "2",
            capacidad: "100 personas",
          },
          {
            nombre: "Cambridge",
            imagen: "https://via.placeholder.com/200",
            ancho: "140m²",
            largo: "140m²",
            altura: "220m",
            espacio: "300m²",
            piso: "3",
            capacidad: "120 personas",
          },
          {
            nombre: "New Castle",
            imagen: "https://via.placeholder.com/200",
            ancho: "94m²",
            largo: "94m²",
            altura: "230m",
            espacio: "200m²",
            piso: "3",
            capacidad: "120 personas",
          },
          {
            nombre: "Manchester",
            imagen: "https://via.placeholder.com/200",
            ancho: "40m²",
            largo: "40m²",
            altura: "230m",
            espacio: "200m²",
            piso: "3",
            capacidad: "150 personas",
          },
          {
            nombre: "Kingstone",
            imagen: "https://via.placeholder.com/200",
            espacio: "300m²",
            piso: "3",
            capacidad: "150 personas",
          },
          {
            nombre: "Gales",
            imagen: "https://via.placeholder.com/200",
            ancho: "77m²",
            largo: "77m²",
            altura: "240m",
            espacio: "200m²",
            piso: "3",
            capacidad: "40 personas",
          },
          {
            nombre: "London",
            imagen: "https://via.placeholder.com/200",
            ancho: "100m²",
            largo: "100m²",
            altura: "240m",
            espacio: "300m²",
            piso: "3",
            capacidad: "100 personas",
          },
          {
            nombre: "Oxford",
            imagen: "https://via.placeholder.com/200",
            ancho: "56m²",
            largo: "56m²",
            altura: "230m",
            espacio: "300m²",
            piso: "3",
            capacidad: "150 personas",
          },
          {
            nombre: "Sala Windsor",
            imagen: "https://via.placeholder.com/200",
            ancho: "56m²",
            largo: "56m²",
            altura: "240m",
            espacio: "300m²",
            piso: "3",
            capacidad: "100 personas",
          },
        ]);
      } else if (infohotel.nombrehotel === "Hotel Madisson Inn") {
        setSalones([
          {
            nombre: "Salón Zen ",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/Bogota/Sal%C3%B3nZenMadisson.jpeg",
            espacio: "250m²",
            piso: "1",
            capacidad: "90 personas",
          },
          {
            nombre: "Salón Iraca",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/Bogota/Sal%C3%B3nIracaMadisson.jpeg",
            ancho:"5,98",
            largo:"13,80",
              espacio: "280m²",
            piso: "2",
            capacidad: "80 personas",
          },
          {
            nombre: "Salón Tagua",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/Bogota/SalonTagua2Madisson.jpeg",
            espacio: "280m²",
            piso: "2",
            capacidad: "40 personas",
          },
          {
            nombre: "Salón Macana",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/Bogota/Sal%C3%B3nMacanaMadisson.jpeg",
            espacio: "280m²",
            piso: "2",
            capacidad: "25 personas",
          },
          {
            nombre: "Sala de reuniones VIP 1",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/Bogota/SalaVIP1Madisson.JPG",
            espacio: "280m²",
            piso: "2",
            capacidad: "6 personas",
          },
          {
            nombre: "Sala de reuniones VIP 2",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/Bogota/SalonVIP2Madisson.JPG",
            espacio: "280m²",
            piso: "2",
            capacidad: "6 personas",
          },
        ]);
      }
    } else if (infohotel.ciudad === "SantaMarta") {
      if (infohotel.nombrehotel === "Hotel Axis") {
        setSalones([
          {
            nombre: "Salón Axis",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/SantaMarta/salonAxis.jpeg",
            ancho: "8.60m",
            largo: "16m",
            altura: "2.74m",
            piso: "1",
            capacidad: "100 personas",
          },
        ]);
      } else if (infohotel.nombrehotel === "Hotel Sansiraka") {
        setSalones([
          {
            nombre: "Salón Sansiraka",
            imagen:
              "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Imagenes-salones/SantaMarta/salonSansiraka.jpeg",
            ancho: "5.98m",
            largo: "13.80m",
            altura: "2.74m",
            piso: "1",
            capacidad: "120 personas",
          },
        ]);
      }
    }
  }, [infohotel]);

  console.log("Datos del hotel seleccionado", infohotel);

  const accommodation = [
    {
      id: 1,
      name: "Auditorio",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/auditorio-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/Auditorio-blanco.png",
    },
    {
      id: 2,
      name: "Aula o salon",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/salon-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/salon-blanco.png",
    },
    {
      id: 3,
      name: "Cuadrada",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/cudrada-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/cudrada-blanco.png",
    },
    {
      id: 4,
      name: "Mesa redonda",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/mesa-redonda-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/mesa-redonda-blanco.png",
    },
    {
      id: 5,
      name: "U",
      imagedefault:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/U-azul.png",
      imageActive:
        "https://space-img.sfo3.digitaloceanspaces.com/Agencias/eventos-agencias/U-blanco.png",
    },
  ];

  const enviarSolicitud = async () => {
    const tipoAcomodacionId =
      accommodation.find((type) => type.name === tipoAcomodacion)?.id || 1;

    const informacionE = JSON.stringify({
      nameEvento: nombreEvento,
      tipoEvento: tipoEvento,
      cantidadAsistentes: cantidadAsistentes,
      nombreOrganizador: nombreOrganizador,
      telefonoOrganizador: telefonoOrganizador,
      emailOrganizador: emailOrganizador,
      fechaInicioEvento: dateRange.startDate.toISOString(),
      fechaFinalEvento: dateRange.endDate.toISOString(),
      horarioEvento: horariosSeleccionados.map((horario) => ({
        fechaInicio: new Date(horario.fechaInicio).toISOString(),
        fechaFinal: new Date(horario.fechaFinal).toISOString(),
        cantidadAsistenteDia: cantidadAsistentes,
      })),
      flexibilidadEvento: flexibilidadEvento,
      tipoAcomodacion: tipoAcomodacionId,
      alimentacion: true,
      alimentosBebidas: {
        estacionCafe: true,
        cena: true,
      },
      audiovisuales: audiovisuales,
      itemsAudiovisuales: audiovisuales ? [itemsAudiovisuales] : [],
      decoracion: decoracion,
      decoracionDescripcion: decoracion ? decoracionDescripcion : "",
      alojamiento: false,
      observaciones: Observaciones,
    });

    try {
      setbotondesactivado(true);
      const url = `https://gehsuitesapps.com/agencias/v1/eventos/create`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: informacionE,
      });
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: "Tu solicitud de presupuesto ha sido enviada con éxito. Pronto recibirás una respuesta de nuestro equipo de ventas.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar la solicitud",
        text: "No se pudo realizar la cotizacion del evento. Porfavor verifique los datos ingresados e intente nuevamente mas tarde",
      });
      console.error(
        "Error al realizar la cotizacion/solicitud del evento:",
        error
      );
    } finally {
      setbotondesactivado(false);
    }
    console.log(informacionE)
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
          <h2>Hotel seleccionado: {infohotel?.nombrehotel}</h2>
          <div>
            <p>
              Numero de salones disponibles: <b>{infohotel?.saloneshotel}</b>
            </p>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="hotel"
                  value="si"
                  onChange={handleRadioChange}
                />{" "}
                Sí, quiero seleccionar los salones.
              </label>
              <label>
                <input
                  type="radio"
                  name="hotel"
                  value="no"
                  defaultChecked
                  onChange={handleRadioChange}
                />{" "}
                No, prefiero que el asesor elija el mejor salón para mi evento.
              </label>
            </div>
            {mostrarSalones && (
              <div className="salones-lista">
                <h3>Salones Disponibles:</h3>
                <div className="salones-container">
                  {salones.map((salon, index) => (
                    <div key={index} className="salon-card">
                      <div className="infosalon">
                        <div className="img">
                          <img src={salon.imagen} alt={salon.nombre} />
                        </div>
                        <div className="detallesSalon">
                          <h4>{salon.nombre}</h4>
                          <div className="ambiente">
                            <p>
                              <b>Ancho:</b> {salon.ancho}
                            </p>
                            <p>
                              <b>largo:</b> {salon.largo}
                            </p>
                            <p>
                              <b>Altura:</b> {salon.altura}
                            </p>
                            <p>
                              <b>Piso:</b> {salon.piso}
                            </p>
                            <p>
                              <b>Capacidad Máxima:</b> {salon.capacidad} (Con la
                              acomodacion en forma de auditorio)
                            </p>
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-primary">Seleccionar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                value={nombreEvento}
                onChange={handleNombreChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_evento">
                Tipo de evento <span style={{ color: "red" }}>*</span>
              </label>
              <select id="tipo_evento" placeholder="Selecciona una opción" 
              value={tipoEvento || ""}
                onChange={handleTipoEventoChange}>
                
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
                value={cantidadAsistentes}
                onChange={handleCantidadAsistentesChange}
                required
                //Validar numero minimo de asistentes
                min={5}
                max={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre_evento">
                Nombre del organizador <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="nombre_organizador"
                placeholder="Escribe el nombre"
                value={nombreOrganizador}
                onChange={handleNombreOrganizadorChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="Telefono_orgnizador">
                Teléfono del organizador <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                placeholder="Escribe el teléfono"
                value={telefonoOrganizador}
                onChange={handleTelefonoOrganizadorChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email_organizador">
                Email del organizador <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                id="emailOrganizador"
                placeholder="Escriba el email del organizador"
                value={emailOrganizador}
                onChange={handleEmailOrganizadorChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaDelEvento">
                Fechas del evento <span style={{ color: "red" }}>*</span>
              </label>
              <div className="datePicker" ref={dateRangeRef}>
                <input
                  type="text"
                  value={`${
                    dateRange.startDate.toISOString().split("T")[0]
                  } - ${dateRange.endDate.toISOString().split("T")[0]}`}
                  onFocus={() => setShowDateRange(true)}
                  readOnly
                />
                {showDateRange && (
                  <div className="dateRangePicker">
                    <DateRange
                      ranges={[
                        {
                          startDate: dateRange.startDate,
                          endDate: dateRange.endDate,
                          key: "selection",
                        },
                      ]}
                      onChange={handleDateRangeChange}
                      moveRangeOnFirstSelection={false}
                      minDate={new Date()}
                    />
                  </div>
                )}
                {/* Inputs dinámicos de fecha y hora */}
                <div>
                  {horariosSeleccionados.map((horario, index) => (
                    <div key={index} className="form-group">
                      <label>
                        <b>Seleccione solo la hora para el dia:{" "}
                        {format(
                          addDays(dateRange.startDate, index),
                          "dd/MM/yyyy"
                        )}</b>
                      </label>
                      <div>
                        <input
                          type="datetime-local"
                          value={horario.fechaInicio}
                          onChange={(e) =>
                            handleHorarioChange(
                              index,
                              "fechaInicio",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="datetime-local"
                          value={horario.fechaFinal}
                          onChange={(e) =>
                            handleHorarioChange(
                              index,
                              "fechaFinal",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <br />
          <label htmlFor="flexible">¿Tus fechas son flexibles?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="flexibles"
                value="si"
                onChange={handleChangeFechasFlexibles}
              />{" "}
              Sí
            </label>
            <label>
              <input
                type="radio"
                name="flexibles"
                value="no"
                defaultChecked
                onChange={handleChangeFechasFlexibles}
              />{" "}
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
                key={type.id}
                className={`accommodation-btn ${tipoAcomodacion === type.name ? "active" : ""
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
          {audiovisuales && (
            <div>
              <label htmlFor="detallesAudiovisuales">
                Escribe los detalles de los audiovisuales que necesitas:
              </label>
              <textarea
                className="observaciones-textarea"
                id="detallesAudiovisuales"
                placeholder="Describe qué audiovisuales necesitas..."
                rows="4"
                cols="50"
                style={{ width: "100%", marginTop: "10px" }}
                value={itemsAudiovisuales}
                onChange={handleTextAreaChange}
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

          {/* Mostrar textarea solo si selecciona "Sí" */}
          {decoracion && (
            <div>
              <label htmlFor="detallesDecoracion">
                Escribe los detalles de la decoración que necesitas:
              </label>
              <textarea
                className="observaciones-textarea"
                id="detallesDecoracion"
                placeholder="Describe qué tipo de decoración necesitas..."
                rows="4"
                cols="50"
                style={{ width: "100%", marginTop: "10px" }}
                value={decoracionDescripcion}
                onChange={handleDecoracionDescripcionChange}
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
            placeholder="Escribe las observaciones correpondientes"
            value={Observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          <div className="terms">
            <input type="checkbox" id="terms" className="termscheck" />
            <label htmlFor="terms">Acepta los términos y condiciones</label>
          </div>

          <div className="buttons-container">
            <a href="/eventos">
              {" "}
              <button className="btn btn-secondary">Salir</button>
            </a>
            <button
              className="btn btn-primary"
              
              type="submit"
              onClick={enviarSolicitud}
            >
              {botondesactivado ? "Enviar solicitud" : "Enviando solicitud..."}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SolicitudPresupuesto;

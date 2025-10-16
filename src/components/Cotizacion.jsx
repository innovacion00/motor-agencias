import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ChevronDown } from 'lucide-react';
import '/public/styles/Cotizacion.css';

// Función para obtener el nombre del hotel basado en el ID
const nombreHotelId = (hotelId) => {
  const hotelMap = {
    // Hoteles Cartagena
    1: "Hotel Azuan Suites", // Hotel Azuan Suites
    4: "Hotel Aixo Suites", // Hotel Aixo Suites
    5: "Hotel Abi Inn", // Hotel Abi Inn
    6: "Hotel Avexi Suites", // Hotel Avexi Suites
    7: "Hotel Bocagrande Suites", // Hotel Bocagrande Suites
    9: "Hotel Marina Suites", // Hotel Marina Suites
    56: "Hotel Boquilla Suites", // Hotel Boquilla Suites
    // Hoteles Santa Marta
    8: "Hotel Rodadero ", // Hotel Rodadero 
    2: "Hotel 1525", // Hotel 1525
    48: "Hotel Axis Inn", // Hotel Axis Inn
    44: "Hotel Sansiraka Inn", // Hotel Sansiraka Inn
    41: "Hotel Zulita Inn", // Hotel Zulita Inn
    56: "Hotel Boquilla Suites", // Hotel Boquilla Suites
    // Hoteles Bogota
    10: "Hotel Windsor", // Hotel Windsor
    3: "Hotel Madisson", // Hotel Madisson

  };

  return hotelMap[hotelId] || "Hotel no encontrado";
};

export default function ReservaHotelComponent() {
  const [markup, setMarkup] = useState('');
  const [showReservaIncluye, setShowReservaIncluye] = useState(false);
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [datosReserva, setDatosReserva] = useState()

  useEffect(() => {
    const datareserva = JSON.parse(localStorage.getItem('datosreserva'));
    setDatosReserva(datareserva);
  }, []);
  // Estados para el formulario de datos del huésped
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    nombreCompleto: '',
    apellidos: '',
    fechaNacimiento: '',
    email: '',
    celular: ''
  });

  const baseQuote = 3451000;
  const subtotal = 2900000;
  const iva = 551000;
  const total = 3451000;

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      nombreCompleto,
      apellidos,
      email,
      celular,
    } = formData;

    if (
      tipoDocumento.trim() === '' ||
      numeroDocumento.trim() === '' ||
      fechaNacimiento.trim() === '' ||
      nombreCompleto.trim() === '' ||
      apellidos.trim() === '' ||
      email.trim() === '' ||
      celular.trim() === ''
    ) {
      alert('Todos los campos son obligatorios');
      return;
    }

    console.log('Datos del formulario:', formData);
    // Aquí puedes agregar la lógica para procesar los datos
  };

  return (
    <div className="container">
      <div className="layout">
        {/* Columna Principal */}
        <div className="main-content">
          {/* Header */}
          <div className="header">
            <div className="logos">
              <img src="" alt="Logo Agencia" className="logo" />
              <img src="https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg"
                alt="GetSuites" className="logo" style={{ width: "100px", height: "100px" }} />
            </div>
          </div>

          {/* Formulario de Información del Huésped */}
          <div className="card">
            <div className="badge-container">
              <span className="badge">
                Pendiente por generar
              </span>
            </div>

            <h2 className="title">Información del huésped</h2>

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <fieldset style={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "15px",
                marginBottom: "20px",
              }}>
                <legend>Datos del titular</legend>

                {/* Tipo de documento */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="tipoDocumento" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
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
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="cedulaC">Cédula de ciudadanía</option>
                    <option value="cedulaE">Cédula de extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Número de documento */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="numeroDocumento" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Número de documento <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="numeroDocumento"
                    type="text"
                    placeholder="Ingrese el número de documento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Nombre del titular */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="nombreCompleto" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Nombre del titular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="nombreCompleto"
                    type="text"
                    placeholder="Ingrese el nombre"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Apellidos del titular */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="apellidos" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Apellidos del titular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="apellidos"
                    type="text"
                    placeholder="Ingrese los apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="fechaNacimiento" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
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
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Correo electrónico */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Correo electrónico <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ingrese el correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Celular */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="celular" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Celular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="celular"
                    type="tel"
                    placeholder="Ingrese el número de celular"
                    value={formData.celular}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                  <label
                    htmlFor="identificador"
                    style={{ color: "red", fontWeight: "light", fontSize: "12px", marginTop: "5px", display: "block" }}
                  >
                    Incluir código de área (+57,+55, etc.) eje:+573002215487
                  </label>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  style={{
                    fontWeight: "500",
                    backgroundColor: "#26547B",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Guardar Información
                </button>
              </fieldset>
            </form>
          </div>

          {/* Información de la Reserva */}
          {datosReserva?.map((data) => (
            <>
              <div key={data.roomId || index} >

              </div>

              <div className="card">
                <h2 className="title">Información de la reserva</h2>

                <h3 className="subtitle">{nombreHotelId(data.hotelidAutocore)}</h3>

                <div className="contact-info">
                  <div className="contact-item">
                    <MapPin className="icon" />
                    <span>Bocagrande Cra 3 N° 4-86. Cartagena de Indias, Bolívar</span>
                  </div>
                  <div className="contact-item">
                    <Phone className="icon" />
                    <span>+57 333 602 50 21</span>
                  </div>
                </div>

                {/* Fechas y Detalles */}
                <div className="dates-grid">
                  <div className="date-item">
                    <p className="label">Check-in</p>
                    <p className="value">{data.checkin}  →</p>
                  </div>
                  <div className="date-item">
                    <p className="label">Check-out</p>
                    <p className="value">{data.checkout}</p>
                  </div>
                  <div className="date-item">
                    <p className="label">Noches</p>
                    <p className="value">{data.nights}</p>
                  </div>
                  <div className="date-item">
                    <p className="label">Huéspedes</p>
                    <p className="value">{data.huespedes}</p>
                  </div>
                  <div className="date-item">
                    <p className="label">Habitaciones</p>
                    <p className="value">3</p>
                  </div>
                </div>

                {/* Tabla de Habitaciones */}
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr className="table-header">
                        <th className="th">Habitación</th>
                        <th className="th">Descripción</th>
                        <th className="th">Noches</th>
                        <th className="th">Valor C/U</th>
                        <th className="th">Valor total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="td">Doble estándar</td>
                        <td className="td">Incluye 1 cama tamaño king y desayuno</td>
                        <td className="td">4</td>
                        <td className="td">$300.000</td>
                        <td className="td">$1.200.000</td>
                      </tr>
                      <tr>
                        <td className="td">Doble estándar</td>
                        <td className="td">Incluye 1 cama tamaño king y desayuno</td>
                        <td className="td">4</td>
                        <td className="td">$300.000</td>
                        <td className="td">$1.200.000</td>
                      </tr>
                      <tr>
                        <td className="td">Cuádruple estándar</td>
                        <td className="td">Incluye 2 camas tamaño king y desayuno</td>
                        <td className="td">1</td>
                        <td className="td">$500.000</td>
                        <td className="td">$500.000</td>
                      </tr>
                      <tr className="table-subtotal">
                        <td colSpan="4" className="td-total">Subtotal</td>
                        <td className="td-amount">$2.900.000</td>
                      </tr>
                      <tr className="table-subtotal">
                        <td colSpan="4" className="td-total">IVA 19%</td>
                        <td className="td-amount">$551.000</td>
                      </tr>
                      <tr className="table-total">
                        <td colSpan="4" className="td-total-label">Total</td>
                        <td className="td-total-amount">$3.451.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Acordeones */}
                <div className="accordions">
                  <div className="accordion">
                    <button
                      onClick={() => setShowReservaIncluye(!showReservaIncluye)}
                      className="accordion-button"
                    >
                      <span className="accordion-title">La reserva incluye</span>
                      <ChevronDown className={`icon-chevron ${showReservaIncluye ? 'rotated' : ''}`} />
                    </button>
                    {showReservaIncluye && (
                      <div className="accordion-content">
                        <p className="text">Contenido de lo que incluye la reserva...</p>
                      </div>
                    )}
                  </div>

                  <div className="accordion">
                    <button
                      onClick={() => setShowPoliticas(!showPoliticas)}
                      className="accordion-button"
                    >
                      <span className="accordion-title">Políticas de la reserva</span>
                      <ChevronDown className={`icon-chevron ${showPoliticas ? 'rotated' : ''}`} />
                    </button>
                    {showPoliticas && (
                      <div className="accordion-content">
                        <p className="text">Políticas de cancelación y modificación...</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ))}
          {/* Políticas de la Agencia */}
          <div className="card">
            <h2 className="title">Políticas de la agencia</h2>

            <div className="editor">
              <div className="toolbar">
                <button className="tool-btn"><strong>B</strong></button>
                <button className="tool-btn"><em>I</em></button>
                <button className="tool-btn"><u>U</u></button>
                <div className="separator"></div>
                <button className="tool-btn">≡</button>
                <button className="tool-btn">≡</button>
                <button className="tool-btn">≡</button>
                <button className="tool-btn">≡</button>
                <div className="separator"></div>
                <button className="tool-btn">• •</button>
                <button className="tool-btn">1.</button>
              </div>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Escribe las observaciones"
                className="textarea"
              />
            </div>
          </div>
        </div>

        {/* Columna Lateral - Markup */}
        <div className="sidebar">
          <div className="card sidebar-card">
            <h3 className="title">Markup</h3>

            <div className="form-group">
              <label className="label">
                Selecciona el markup
              </label>
              <div className="select-wrapper">
                <select
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="select"
                >
                  <option value="">Selecciona el porcentaje</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>

            <div className="price-section">
              <div className="price-row">
                <span className="price-label">Base cotización</span>
                <span className="price-value">${baseQuote.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
import React, { useState } from 'react';
import { MapPin, Phone, ChevronDown } from 'lucide-react';
import '/public/styles/Cotizacion.css';

export default function ReservaHotelComponent() {
  const [markup, setMarkup] = useState('');
  const [showReservaIncluye, setShowReservaIncluye] = useState(false);
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  const baseQuote = 3451000;
  const subtotal = 2900000;
  const iva = 551000; 
  const total = 3451000;

  return (
    <div className="container">
      <div className="layout">
        {/* Columna Principal */}
        <div className="main-content">
          {/* Header */}
          <div className="header">
            <div className="logos">
              <img src="https://via.placeholder.com/120x40?text=TravelDestination" alt="Travel Destination" className="logo" />
              <img src="https://via.placeholder.com/120x40?text=GetSuites" alt="GetSuites" className="logo" />
            </div>
          </div>

          {/* Información del Huésped */}
          <div className="card">
            <div className="badge-container">
              <span className="badge">
                Pendiente por generar
              </span>
            </div>
            
            <h2 className="title">Información del huésped</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <p className="label">Nombre completo:</p>
                <p className="value">Maria Angelica Londoño Vargas</p>
              </div>
              <div className="info-item">
                <p className="label">Cédula de ciudadanía:</p>
                <p className="value">5898765432</p>
              </div>
              <div className="info-item">
                <p className="label">Correo electrónico:</p>
                <p className="value">angelica.londono@gmail.com</p>
              </div>
              <div className="info-item">
                <p className="label">Celular:</p>
                <p className="value">322 456 78 98</p>
              </div>
            </div>
          </div>

          {/* Información de la Reserva */}
          <div className="card">
            <h2 className="title">Información de la reserva</h2>
            
            <h3 className="subtitle">Hotel Avexi Suites</h3>
            
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
                <p className="value">10 sep →</p>
              </div>
              <div className="date-item">
                <p className="label">Check-out</p>
                <p className="value">12 sep</p>
              </div>
              <div className="date-item">
                <p className="label">Noches</p>
                <p className="value">4</p>
              </div>
              <div className="date-item">
                <p className="label">Huéspedes</p>
                <p className="value">8</p>
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
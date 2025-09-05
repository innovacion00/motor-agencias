import React, { useState, useEffect } from "react";
import styles from "../../public/styles/VuelosDisponibles.module.css";
import DropdownSearch from "./DropdownSearch";

const VuelosDisponibles = () => {
  const [selectedFlight, setSelectedFlight] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Datos de ejemplo para el diseño
  const flightData = {
    hotel: {
      name: "Hotel Avexi Suites",
      dates: "6 sep -> 10 sep (3 noches)",
      room: {
        type: "Doble estándar",
        meal: "Media pensión",
        payment: "Pago: Inmediato",
        dates: "6 sep - 10 sep | Cambiar",
        nights: "4 noches, 2 huéspedes"
      },
      price: "$1.000.000",
      includesTaxes: true
    },
    flights: [
      {
        id: 1,
        outbound: {
          date: "Mie 6 sep 2025",
          airline: "LATAM Airlines Group",
          logo: "https://via.placeholder.com/40x40/0066CC/FFFFFF?text=LATAM",
          origin: "BOG",
          originCity: "Bogotá",
          destination: "CTG",
          destinationCity: "Cartagena de Indias",
          departure: "07:50",
          arrival: "09:23",
          duration: "1h 33m",
          type: "Directo",
          baggage: {
            carryOn: true,
            checked: true
          }
        },
        return: {
          date: "Dom 10 sep 2025",
          airline: "LATAM Airlines Group",
          logo: "https://via.placeholder.com/40x40/0066CC/FFFFFF?text=LATAM",
          origin: "CTG",
          originCity: "Cartagena de Indias",
          destination: "BOG",
          destinationCity: "Bogotá",
          departure: "15:42",
          arrival: "17:10",
          duration: "1h 28m",
          type: "Directo",
          baggage: {
            carryOn: true,
            checked: true
          }
        },
        pricing: {
          perPerson: "$500.000",
          total: "$1.000.000",
          passengers: 2,
          includesTaxes: true
        }
      }
    ]
  };

  const handleFlightSelect = (flightId) => {
    setSelectedFlight(flightId);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <br />
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Sección de vuelos disponibles */}
        <div className={styles.flightsSection}>
          {flightData.flights.map((flight, index) => (
            <div key={flight.id} className={styles.flightOption}>
              {/* Ida */}
              <div className={styles.flightSegment}>
                <div className={styles.segmentHeader}>
                  <span className={styles.segmentLabel}>Ida</span>
                  <span className={styles.segmentDate}>{flight.outbound.date}</span>
                </div>
                <div className={styles.flightDetails}>
                  <div className={styles.airlineInfo}>
                    <img src={flight.outbound.logo} alt={flight.outbound.airline} className={styles.airlineLogo} />
                    <span className={styles.airlineName}>{flight.outbound.airline}</span>
                  </div>
                  <div className={styles.routeInfo}>
                    <div className={styles.origin}>
                      <span className={styles.cityCode}>{flight.outbound.origin}</span>
                      <span className={styles.cityName}>{flight.outbound.originCity}</span>
                    </div>
                    <div className={styles.flightTime}>
                      <span className={styles.departureTime}>{flight.outbound.departure}</span>
                      <span className={styles.flightType}>{flight.outbound.type}</span>
                      <span className={styles.arrivalTime}>{flight.outbound.arrival}</span>
                    </div>
                    <div className={styles.destination}>
                      <span className={styles.cityCode}>{flight.outbound.destination}</span>
                      <span className={styles.cityName}>{flight.outbound.destinationCity}</span>
                    </div>
                  </div>
                  <div className={styles.flightDuration}>
                    <span>{flight.outbound.duration}</span>
                  </div>
                  <div className={styles.baggageInfo}>
                    <i className="fas fa-suitcase-rolling"></i>
                    <i className="fas fa-suitcase"></i>
                    <i className="fas fa-info-circle"></i>
                  </div>
                </div>
              </div>

              {/* Regreso */}
              <div className={styles.flightSegment}>
                <div className={styles.segmentHeader}>
                  <span className={styles.segmentLabel}>Regreso</span>
                  <span className={styles.segmentDate}>{flight.return.date}</span>
                </div>
                <div className={styles.flightDetails}>
                  <div className={styles.airlineInfo}>
                    <img src={flight.return.logo} alt={flight.return.airline} className={styles.airlineLogo} />
                    <span className={styles.airlineName}>{flight.return.airline}</span>
                  </div>
                  <div className={styles.routeInfo}>
                    <div className={styles.origin}>
                      <span className={styles.cityCode}>{flight.return.origin}</span>
                      <span className={styles.cityName}>{flight.return.originCity}</span>
                    </div>
                    <div className={styles.flightTime}>
                      <span className={styles.departureTime}>{flight.return.departure}</span>
                      <span className={styles.flightType}>{flight.return.type}</span>
                      <span className={styles.arrivalTime}>{flight.return.arrival}</span>
                    </div>
                    <div className={styles.destination}>
                      <span className={styles.cityCode}>{flight.return.destination}</span>
                      <span className={styles.cityName}>{flight.return.destinationCity}</span>
                    </div>
                  </div>
                  <div className={styles.flightDuration}>
                    <span>{flight.return.duration}</span>
                  </div>
                  <div className={styles.baggageInfo}>
                    <i className="fas fa-suitcase-rolling"></i>
                    <i className="fas fa-suitcase"></i>
                    <i className="fas fa-info-circle"></i>
                  </div>
                </div>
              </div>

              {/* Opción de equipaje */}
              <div className={styles.baggageUpgrade}>
                <div className={styles.baggageUpgradeContent}>
                  <i className="fas fa-suitcase"></i>
                  <span>Lleva más equipaje con una mejor categoría</span>
                  <button className={styles.addBaggageBtn}>+ Agregar equipaje</button>
                </div>
              </div>

              {/* Precios */}
              <div className={styles.pricing}>
                <div className={styles.pricePerPerson}>
                  <span className={styles.priceLabel}>Valor por persona</span>
                  <span className={styles.priceValue}>{flight.pricing.perPerson}</span>
                </div>
                <div className={styles.totalPrice}>
                  <span className={styles.totalLabel}>Total {flight.pricing.passengers} personas</span>
                  <span className={styles.totalValue}>{flight.pricing.total}</span>
                </div>
                <div className={styles.taxesInfo}>
                  <span>Incluye impuestos</span>
                </div>
              </div>

              {/* Botón de selección */}
              <div className={styles.selectionButton}>
                <button 
                  className={`${styles.selectBtn} ${selectedFlight === flight.id ? styles.selected : ''}`}
                  onClick={() => handleFlightSelect(flight.id)}
                >
                  {selectedFlight === flight.id ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}

          {/* Separador */}
          <div className={styles.separator}>
            <h3>Puedes elegir otros vuelos</h3>
          </div>

          {/* Más opciones de vuelo (repetir la misma estructura) */}
          {[2, 3].map((flightId) => (
            <div key={flightId} className={styles.flightOption}>
              {/* Estructura similar a la primera opción */}
              <div className={styles.flightSegment}>
                <div className={styles.segmentHeader}>
                  <span className={styles.segmentLabel}>Ida</span>
                  <span className={styles.segmentDate}>Mie 6 sep 2025</span>
                </div>
                <div className={styles.flightDetails}>
                  <div className={styles.airlineInfo}>
                    <img src="https://via.placeholder.com/40x40/0066CC/FFFFFF?text=LATAM" alt="LATAM" className={styles.airlineLogo} />
                    <span className={styles.airlineName}>LATAM Airlines Group</span>
                  </div>
                  <div className={styles.routeInfo}>
                    <div className={styles.origin}>
                      <span className={styles.cityCode}>BOG</span>
                      <span className={styles.cityName}>Bogotá</span>
                    </div>
                    <div className={styles.flightTime}>
                      <span className={styles.departureTime}>07:50</span>
                      <span className={styles.flightType}>Directo</span>
                      <span className={styles.arrivalTime}>09:23</span>
                    </div>
                    <div className={styles.destination}>
                      <span className={styles.cityCode}>CTG</span>
                      <span className={styles.cityName}>Cartagena de Indias</span>
                    </div>
                  </div>
                  <div className={styles.flightDuration}>
                    <span>1h 33m</span>
                  </div>
                  <div className={styles.baggageInfo}>
                    <i className="fas fa-suitcase-rolling"></i>
                    <i className="fas fa-suitcase"></i>
                    <i className="fas fa-info-circle"></i>
                  </div>
                </div>
              </div>

              <div className={styles.flightSegment}>
                <div className={styles.segmentHeader}>
                  <span className={styles.segmentLabel}>Regreso</span>
                  <span className={styles.segmentDate}>Dom 10 sep 2025</span>
                </div>
                <div className={styles.flightDetails}>
                  <div className={styles.airlineInfo}>
                    <img src="https://via.placeholder.com/40x40/0066CC/FFFFFF?text=LATAM" alt="LATAM" className={styles.airlineLogo} />
                    <span className={styles.airlineName}>LATAM Airlines Group</span>
                  </div>
                  <div className={styles.routeInfo}>
                    <div className={styles.origin}>
                      <span className={styles.cityCode}>CTG</span>
                      <span className={styles.cityName}>Cartagena de Indias</span>
                    </div>
                    <div className={styles.flightTime}>
                      <span className={styles.departureTime}>15:42</span>
                      <span className={styles.flightType}>Directo</span>
                      <span className={styles.arrivalTime}>17:10</span>
                    </div>
                    <div className={styles.destination}>
                      <span className={styles.cityCode}>BOG</span>
                      <span className={styles.cityName}>Bogotá</span>
                    </div>
                  </div>
                  <div className={styles.flightDuration}>
                    <span>1h 28m</span>
                  </div>
                  <div className={styles.baggageInfo}>
                    <i className="fas fa-suitcase-rolling"></i>
                    <i className="fas fa-suitcase"></i>
                    <i className="fas fa-info-circle"></i>
                  </div>
                </div>
              </div>

              <div className={styles.baggageUpgrade}>
                <div className={styles.baggageUpgradeContent}>
                  <i className="fas fa-suitcase"></i>
                  <span>Lleva más equipaje con una mejor categoría</span>
                  <button className={styles.addBaggageBtn}>+ Agregar equipaje</button>
                </div>
              </div>

              <div className={styles.pricing}>
                <div className={styles.pricePerPerson}>
                  <span className={styles.priceLabel}>Valor por persona</span>
                  <span className={styles.priceValue}>$500.000</span>
                </div>
                <div className={styles.totalPrice}>
                  <span className={styles.totalLabel}>Total 2 personas</span>
                  <span className={styles.totalValue}>$1.000.000</span>
                </div>
                <div className={styles.taxesInfo}>
                  <span>Incluye impuestos</span>
                </div>
              </div>

              <div className={styles.selectionButton}>
                <button 
                  className={`${styles.selectBtn} ${selectedFlight === flightId ? styles.selected : ''}`}
                  onClick={() => handleFlightSelect(flightId)}
                >
                  {selectedFlight === flightId ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}

          {/* Navegación */}
          <div className={styles.navigation}>
            <button className={styles.exitBtn}>Salir</button>
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn} 
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                &lt; Anterior
              </button>
              <button 
                className={styles.pageBtn} 
                onClick={handleNext}
              >
                Siguiente &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar de reserva */}
      <div className={styles.sidebar}>
        <div className={styles.reservationSummary}>
          <h2 className={styles.reservationTitle}>Reserva</h2>
          
          {/* Información del hotel */}
          <div className={styles.hotelInfo}>
            <div className={styles.hotelHeader}>
              <i className="fas fa-hotel"></i>
              <span className={styles.hotelName}>{flightData.hotel.name}</span>
            </div>
            <div className={styles.hotelDates}>{flightData.hotel.dates}</div>
            
            <div className={styles.roomInfo}>
              <div className={styles.roomTitle}>Habitación 1</div>
              <div className={styles.roomDetails}>
                <div>{flightData.hotel.room.type}</div>
                <div>{flightData.hotel.room.meal}</div>
                <div>{flightData.hotel.room.payment}</div>
                <div>{flightData.hotel.room.dates}</div>
                <div>{flightData.hotel.room.nights}</div>
              </div>
            </div>
            
            <div className={styles.hotelPrice}>
              <span className={styles.priceValue}>{flightData.hotel.price}</span>
              {flightData.hotel.includesTaxes && <span className={styles.taxesLabel}>Incluye impuestos</span>}
            </div>
          </div>

          {/* Información del vuelo */}
          <div className={styles.flightInfo}>
            <div className={styles.flightHeader}>
              <i className="fas fa-plane"></i>
              <span className={styles.flightRoute}>Bogotá - Cartagena</span>
            </div>
            <div className={styles.flightPassengers}>Ida y vuelta, 2 adultos</div>
            
            {/* Vuelo de ida */}
            <div className={styles.flightSegmentSummary}>
              <div className={styles.segmentTitle}>Ida</div>
              <div className={styles.segmentDate}>Mie. 6 sep 2025</div>
              <div className={styles.segmentDetails}>
                <div className={styles.airlineName}>LATAM Airlines Group</div>
                <div className={styles.route}>BOG → CTG</div>
                <div className={styles.times}>07:50 Directo 09:23</div>
                <div className={styles.duration}>1h 33m</div>
                <div className={styles.baggageIcons}>
                  <i className="fas fa-suitcase-rolling"></i>
                  <i className="fas fa-suitcase"></i>
                </div>
              </div>
            </div>

            {/* Vuelo de regreso */}
            <div className={styles.flightSegmentSummary}>
              <div className={styles.segmentTitle}>Vuelta</div>
              <div className={styles.segmentDate}>Dom. 10 sep 2025</div>
              <div className={styles.segmentDetails}>
                <div className={styles.airlineName}>LATAM Airlines Group</div>
                <div className={styles.route}>BOG → CTG</div>
                <div className={styles.times}>15:42 Directo 17:10</div>
                <div className={styles.duration}>1h 28m</div>
                <div className={styles.baggageIcons}>
                  <i className="fas fa-suitcase-rolling"></i>
                  <i className="fas fa-suitcase"></i>
                </div>
              </div>
            </div>

            <div className={styles.flightPricing}>
              <div className={styles.pricePerPerson}>
                <span>Valor por persona: {flightData.flights[0].pricing.perPerson}</span>
              </div>
              <div className={styles.totalPrice}>
                <span>Total 2 personas: {flightData.flights[0].pricing.total}</span>
              </div>
              <div className={styles.taxesInfo}>
                <span>Incluye impuestos</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className={styles.totalSummary}>
            <div className={styles.totalLabel}>Total</div>
            <div className={styles.totalAmount}>$3.000.000</div>
            <div className={styles.totalTaxes}>Incluye impuestos</div>
          </div>

          {/* Botón de acción */}
          <button className={styles.actionButton}>Ver adicionales</button>
        </div>
      </div>
    </div>
    </>
  );
};

export default VuelosDisponibles;

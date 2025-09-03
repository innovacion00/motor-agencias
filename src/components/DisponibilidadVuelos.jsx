import React, { useState } from 'react';
import DropdownSearch from "./DropdownSearch";
import styles from '../../public/styles/DisponibilidadVuelos.module.css';


const DisponibilidadVuelos = () => {
  const [selectedFlightIda, setSelectedFlightIda] = useState(null);
  const [selectedFlightVuelta, setSelectedFlightVuelta] = useState(null);

  const flightsData = {
    ida: [
      {
        id: 1,
        fare_type:"passanger 0:cod",
        flightCode:"#flightcode",
        airline: '#airline',
        airlineLogo: '/airline-logos/latam.png',
        from: '#from',
        to: '#to',
       departure: '#departure',
        arrival: '#arrival',
        duration: '#duration',
        date: 'lun. 19 may 2025',
        direct: true,
        price: 4,
         baggage: "#baggage"
      }
    ],
    vuelta: [
      {
        id: 2,
        fare_type:"passanger 0:cod",
        flightCode:"#flightcode",
        airline: '#airline',
        airlineLogo: '/airline-logos/latam.png',
        from: '#from',
        to: '#to',
        departure: '#departure',
        arrival: '#arrival',
        duration: '#duration',
        date: 'lun. 19 may 2025',
        direct: true,
        price: 2,
        baggage: "#baggage"
      }
    ]
  };
      
      
  const renderFlight = (flight, type, selectedFlight, setSelectedFlight) => (
    
    <div className={styles.flightCard}>
      <div className={styles.flightHeader}>
        <div className={styles.tripType}>
          <h3>{type === 'ida' ? 'Ida' : 'Regreso'}</h3>
          <span>{flight.date}</span>
        </div>
      </div>
      
      <div className={styles.flightContent}>
        <div className={styles.airline}>
          <img src="https://images.squarespace-cdn.com/content/v1/61403de29a5a9503940796fd/3f091602-b1e0-43db-972a-c09c0a9de32d/LATAM+Logo.png" 
               alt={flight.airline} 
               className={styles.airlineLogo} />
          <span>{flight.airline}</span>
          <span>{flight.flightCode}</span>
        </div>

        <div className={styles.flightDetails}>
          <div className={styles.timeLocation}>
            <span className={styles.time}>{flight.departure}</span>
            <span className={styles.city}>{flight.from}</span>
          </div>

          <div className={styles.flightPath}>
            <div className={styles.duration}>{flight.duration}</div>
            <div className={styles.pathLine}>
              <span className={styles.direct}>#directo  ||  escalas</span>
            </div>
          </div>

          <div className={styles.timeLocation}>
            <span className={styles.time}>{flight.arrival}</span>
            <span className={styles.city}>{flight.to}</span>
          </div>
        </div>

        <div className={styles.priceSection}>
          {flight.baggage && (
            <div className={styles.baggage}>
              <span>Incluye equipaje</span>
            </div>
          )}
          <div className={styles.price}>
            <span className={styles.amount}>$ {flight.price.toLocaleString()}</span>
            <span className={styles.currency}>COP</span>
          </div>
          <button 
            className={`${styles.selectButton} ${selectedFlight === flight.id ? styles.selected : ''}`}
            onClick={() => setSelectedFlight(flight.id)}
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );

  const calculateTotal = () => {
    let total = 0;
    const idaFlight = flightsData.ida.find(f => f.id === selectedFlightIda);
    const vueltaFlight = flightsData.vuelta.find(f => f.id === selectedFlightVuelta);
    
    if (idaFlight) total += idaFlight.price;
    if (vueltaFlight) total += vueltaFlight.price;
    
    return total;
  };

  return (
    <div className={styles.container}>
      <div className={styles.flightsContainer}>
        <div className={styles.flights}>
          {flightsData.ida.map(flight => 
            renderFlight(flight, 'ida', selectedFlightIda, setSelectedFlightIda)
          )}
          {flightsData.vuelta.map(flight => 
            renderFlight(flight, 'vuelta', selectedFlightVuelta, setSelectedFlightVuelta)
          )}
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>Tu selección</h3>
          <div className={styles.route}>
            <span>#from - #to</span>
            <div className={styles.dates}>
              <div>Ida: Mié. 6 sep 2025</div>
              <div>Vuelta: Sáb. 10 sep 2025</div>
            </div>
          </div>

          <div className={styles.selectedFlights}>
            {selectedFlightIda && (
              <div className={styles.selectedFlight}>
                <h4>Vuelo de ida:</h4>
                <p>LATAM Airlines</p>
                <p>BOG → CTG</p>
                <p>Salida: 07:50</p>
              </div>
            )}

            {selectedFlightVuelta && (
              <div className={styles.selectedFlight}>
                <h4>Vuelo de regreso:</h4>
                <p>LATAM Airlines</p>
                <p>CTG → BOG</p>
                <p>Salida: 07:50</p>
              </div>
            )}
          </div>

          <div className={styles.totalPrice}>
            <h4>Total:</h4>
            <div className={styles.price}>
              <span className={styles.amount}>$ {calculateTotal().toLocaleString()}</span>
              <span className={styles.currency}>COP</span>
            </div>
          </div>

          <button 
            className={`${styles.continueButton} ${!(selectedFlightIda && selectedFlightVuelta) ? styles.disabled : ''}`}
            disabled={!(selectedFlightIda && selectedFlightVuelta)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisponibilidadVuelos;

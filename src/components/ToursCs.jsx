import React from 'react';
import '../../public/styles/ToursC.css';

const ToursCs = () => {
  return (
    <div className="tours-container">
      <div className="tours-header">
        <h1>Tour : Playa blanca Barú-Bus</h1>
        <button className="close-button">×</button>
      </div>
      
      <div className="tours-gallery">
        <div className="main-image">
          <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/c5/a3/03/img-20170630-151526512.jpg?w=900&h=-1&s=1" alt="Vista aérea de las Islas del Rosario" />
        </div>
        <div className="side-images">
          <img src="https://cdn5.travelconline.com/images/fit-in/0x450/filters:quality(75):strip_metadata():format(webp)/https%3A%2F%2Ftr2storage.blob.core.windows.net%2Fimagenes%2Fbaru1-36bb4308-e8a8-4b99-92bb-bcdea25a2202.jpg" alt="Cabaña sobre el agua" />
          <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Huevos%201.png" alt="Cabaña sobre el agua" />
          
        </div>
      </div>
      
      <h2 className="tour-title">Tour 5 Islas: Full Islas del Rosario y Barú</h2>
      
      <div className="tour-description">
        <p>
          Conviértete con Tour 5 Islas saliendo de Cartagena en un lobo marinero, donde tendrás increíbles vistas 
          <span className="highlight"> del mar Caribe </span> 
          durante la navegación. Primero realizarás una parada en la Isla de Barú/Cholón, luego conocerás el famoso San Fernando, para luego continuar el viaje a las 
          <span className="highlight"> Islas del Rosario</span>, 
          donde podrás disfrutar frente a la playa con arena blanca. 
          Podrás nadar y practicar esnórquel. Después del almuerzo (no incluido), continuarás la navegación hasta encontrar Playa Azul donde podrás descansar entre las playas y el 
          <span className="highlight"> Isla Cholón</span>. 
          Aquí podrás compartir con otros asistentes un momento de descanso con música. Por último llegarás a 
          <span className="highlight"> Playa Tranquila </span> 
          o Mambo Beach Club, donde tendrás el resto del tiempo para disfrutar frente al mar.
        </p>
      </div>
      
      <div className="tour-details">
        <div className="detail-item">
          <span className="icon">💰</span>
          <span className="detail-text">$ 200.000 por persona</span>
        </div>
        <div className="detail-item">
          <span className="icon">🕒</span>
          <span className="detail-text">Horario: 7:45 a.m a 5:00 p.m</span>
        </div>
        <div className="detail-item">
          <span className="icon">⏱️</span>
          <span className="detail-text">Duración: 10 horas</span>
        </div>
        <div className="detail-item">
          <span className="icon">📍</span>
          <span className="detail-text">Punto de encuentro: Muelle Todomar, San Martín 1-5, Cartagena</span>
        </div>
      </div>
      
      <div className="tour-includes">
        <h3>Incluye</h3>
        <div className="includes-grid">
          <div className="include-item">
            <span className="check-icon">✓</span>
            <span>Transporte recogida y regreso</span>
          </div>
          <div className="include-item">
            <span className="check-icon">✓</span>
            <span>Llegada a playa blanca barú</span>
          </div>
          <div className="include-item">
            <span className="check-icon">✓</span>
            <span>Almuerzo tipico</span>
          </div>
          <div className="include-item">
            <span className="check-icon">✓</span>
            <span>Estancia en bohio de paja con
            sillas y mesas a 2 metros de la playa totalmente gratis.</span>
          </div>
        </div>
      </div>
      
      <div className="tour-bring">
        <h3>Qué llevar</h3>
        <div className="bring-grid">
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>ropa cómoda</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>calzado cómodo</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>sandalias</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>traje de baño</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>toalla</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>gafas de sol</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>bloqueador solar</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>gorro para el sol</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>agua</span>
          </div>
          <div className="bring-item">
            <span className="check-icon">✓</span>
            <span>snack</span>
          </div>
        </div>
      </div>
      
      <div className="tour-not-includes">
        <h3>No incluye</h3>
        <div className="not-includes-grid">
          <div className="not-include-item">
            <span className="x-icon">✕</span>
            <span>No están incluido Sillas, Carpas,sombrillas o hamacas.</span>
          </div>
          <div className="not-include-item">
            <span className="x-icon">✕</span>
            <span>No están incluidas bebidas</span>
          </div>
          
        </div>
      </div>
      
      <div className="tour-restrictions">
        <h3>Restricciones:</h3>
        <p>edad mínima requerida de 18 años, no permitido para embarazadas, no permitido para personas mayores de 65 años, no permitido para personas con problemas a la columna y no recomendado para personas con vértigo</p>
      </div>
      
      <div className="tour-policy">
        <h3>Política de anulación y reprogramación</h3>
        <p>Si anula la reserva hasta 48 horas antes del inicio de la actividad, le devolveremos el 100% del pago realizado para reservar. Si anula con una anticipación menor a la indicada, no aplicará devolución.</p>
      </div>
    </div>
  );
};

export default ToursCs;
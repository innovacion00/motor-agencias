import React from "react";
import "../../public/styles/ToursC.css";
import Modal from "react-modal";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "100%",
    width: "800px",
    maxHeight: "95vh",
    overflow: "auto",
    padding: "15px",
    borderRadius: "8px"
  },
};

const ToursCs = ({isOpen, onRequest, infoToures}) => {
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequest}
      style={customStyles}
      contentLabel="Example Modal"
    >
      <div className="tours-container">
        <div className="tours-header">
          <h1>{infoToures.title}</h1>
          <button className="close-button" onClick={onRequest}>×</button>
        </div>

        <div className="tours-gallery">
          <div className="main-image">
            <img
              src={infoToures?.images?.main}
              alt={`Vista principal de ${infoToures?.title}`}
            />
          </div>
          <div className="side-images">
            <img
              src={infoToures?.images?.side1}
              alt={`Vista adicional de ${infoToures?.title}`}
            />
            <img
              src={infoToures?.images?.side2}
              alt={`Vista adicional de ${infoToures?.title}`}
            />
          </div>
        </div>

        <h2 className="tour-title">{infoToures.title}</h2>

        <div className="tour-description">
          <p>
            {infoToures.description}
          </p>
        </div>

        <div className="tour-details">
          <div className="detail-item">
            <img
              src="https://space-img.sfo3.digitaloceanspaces.com/Logos/dinero.png"
              alt="icon-value"
            />
            <span className="detail-text">{infoToures.price}</span>
          </div>
          <div className="detail-item">
            <img
              src="https://space-img.sfo3.digitaloceanspaces.com/Logos/Clock.png"
              alt="icon-clock"
            />
            <span className="detail-text">{infoToures.schedule}</span>
          </div>
          <div className="detail-item">
            <img
              src="https://space-img.sfo3.digitaloceanspaces.com/Logos/time.png"
              alt="icon-time"
            />
            <span className="detail-text">{infoToures.duration}</span>
          </div>
          <div className="detail-item">
            <img
              src="https://space-img.sfo3.digitaloceanspaces.com/Logos/gps.png"
              alt="icon-gps"
            />
            <span className="detail-text">
              {infoToures.meetingPoint}
            </span>
          </div>
        </div>

          
        <div className="tour-includes">
            <h3>Incluye</h3>
            <div className="includes-grid">
              {infoToures?.includes?.map((item, index) => (
                <div className="include-item" key={index}>
                  <img
                    src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Iconcheck.png"
                    alt="check icon"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        <div className="tour-bring">
            <h3>Qué llevar</h3>
            <div className="bring-grid">
              {infoToures?.toBring?.map((item, index) => (
                <div className="bring-item" key={index}>
                  <img
                    src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Iconcheck.png"
                    alt="check icon"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        <div className="tour-not-includes">
            <h3>No incluye</h3>
            <div className="not-includes-grid">
              {infoToures?.notIncludes?.map((item, index) => (
                <div className="not-include-item" key={index}>
                  <span className="x-icon">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        <div className="tour-restrictions">
          <h3>Restricciones:</h3>
          <p>
            {infoToures.restrictions}
          </p>
        </div>

        <div className="tour-policy">
          <h3>Política de anulación y reprogramación</h3>
          <p>
            Si anula la reserva hasta 48 horas antes del inicio de la actividad,
            le devolveremos el 100% del pago realizado para reservar. Si anula
            con una anticipación menor a la indicada, no aplicará devolución.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ToursCs;

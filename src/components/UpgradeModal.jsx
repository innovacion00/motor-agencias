import React from "react";
import styles from "./UpgradeModal.module.css";

const UpgradeModal = ({
  isOpen,
  onClose,
  upgrades = [],
  onSelectUpgrade,
  onContinue,
}) => {
  if (!isOpen || upgrades.length === 0) return null;

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>¡Eleva tu estadía con un hotel de mayor categoría!</h2>
        <div className={styles.upgradeOptions}>
          {upgrades.map((hotel) => (
            <div key={hotel.id} className={styles.hotelCard}>
              {hotel.image ? (
                <img src={hotel.image} alt={hotel.name} />
              ) : null}
              <h3>{hotel.name}</h3>
              <p
                className={styles.price}
                style={
                  hotel.hasAvailability ? undefined : { color: "#6c757d" }
                }
              >
                {hotel.priceLabel}
              </p>
              <button
                type="button"
                className={styles.selectButton}
                style={{
                  color: "white",
                  fontWeight: "lighter",
                  fontFamily: "roboto",
                }}
                onClick={() => onSelectUpgrade(hotel.id)}
                disabled={!hotel.hasAvailability}
              >
                {hotel.hasAvailability ? "Seleccionar" : "No disponible"}
              </button>
            </div>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            style={{
              color: "white",
              fontWeight: "lighter",
              fontFamily: "roboto",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            name="siguientevuelos"
            className={styles.continueButton}
            onClick={handleContinue}
            style={{
              color: "white",
              fontWeight: "lighter",
              fontFamily: "roboto",
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

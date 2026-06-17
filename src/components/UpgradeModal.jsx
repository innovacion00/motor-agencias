import React, { useEffect } from "react";
import styles from "./UpgradeModal.module.css";

const UpgradeModal = ({
  isOpen,
  onClose,
  upgrades = [],
  onSelectUpgrade,
  onContinue,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || upgrades.length === 0) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="upgrade-modal-title">
            ¡Eleva tu estadía con un hotel de mayor categoría!
          </h2>
          <button
            type="button"
            className={styles.closeIconButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
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

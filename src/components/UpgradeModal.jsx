import React from 'react';
import styles from './UpgradeModal.module.css';

const hotelUpgrades = {
  1: [ // Azuan
    {
      id: 6, // Avexi
      name: "Hotel Avexi Suites",
      image: "https://www.gehsuites.com/images/fachada_avexi.jpg",
      price: "+$100.000"
    },
    {
      id: 9, // Marina
      name: "Hotel Marina Suites",
      image: "https://www.gehsuites.com/images/portada_marian_suites.jpg", 
      price: "+$0"
    }
  ],
  6: [ // Avexi
    {
      id: 9, // Marina
      name: "Hotel Marina Suites",
      image: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
      price: "+$100.000"
    },
    {
      id: 7, // Bocagrande
      name: "Hotel Bocagrande Suites",
      image: "https://www.gehsuites.com/images/fachada_hotel_boagrande.jpg",
      price: "+$200.000"
    }
  ],
  9: [ // Marina
    {
      id: 7, // Bocagrande
      name: "Hotel Bocagrande Suites", 
      image: "https://www.gehsuites.com/images/fachada_hotel_boagrande.jpg",
      price: "+$200.000"
    },
    {
      id: 4, // Aixo
      name: "Hotel Aixo Suites",
      image: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_aixo.jpg",
      price: "+$200.000"  
    }
  ]
};

const UpgradeModal = ({ isOpen, onClose, currentHotelId, onSelectUpgrade, onContinue }) => {
  if (!isOpen) return null;

  const upgrades = hotelUpgrades[currentHotelId] || [];

  const handleContinue = async () => {
    // Solo ejecutar la función onContinue que ya maneja la búsqueda de vuelos
    onContinue();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>¡Eleva tu estadía con un hotel de mayor categoría!</h2>
        <div className={styles.upgradeOptions}>
          {upgrades.map((hotel) => (
            <div key={hotel.id} className={styles.hotelCard}>
              <img src={hotel.image} alt={hotel.name} />
              <h3>{hotel.name}</h3>
              <p className={styles.price}>Diferencia en precio: {hotel.price}</p>
              <button 
                className={styles.selectButton}
                style={{color:"white", fontWeight:"lighter", fontFamily:"roboto"}}
                onClick={() => onSelectUpgrade(hotel.id)}
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose} style={{color:"white", fontWeight:"lighter", fontFamily:"roboto"}}>
            Cancelar
          </button>
          <button 
          name='siguientevuelos'
            className={styles.continueButton}
            onClick={handleContinue}
            style={{color:"white", fontWeight:"lighter", fontFamily:"roboto"}}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

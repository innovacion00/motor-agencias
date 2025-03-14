import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import styles from "../../public/styles/DropdownSearch.module.css";

const DropdownSearch = () => {
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const dateRangeRef = useRef(null);

  const handleSearch = () => {
    if (!destination) {
      alert("Por favor, selecciona un destino.");
      return;
    }

    // Redirigir según el destino seleccionado
    if (destination === "BOGOTA") {
      window.location.href = "/eventosbogota";
    } else if (destination === "SANTA_MARTA") {
      window.location.href = "/eventosSantamarta";
    }
  };

  return (
    <div className={styles.dropdownSearchContainer}>
      <div className={styles.dateButtons}></div>
       <h4 style={{color:"white", fontWeight:"600", padding:"10px", fontSize:"15px" }}>Solicitud de eventos</h4>
      {/* Dropdown de destino */}
      <div className={styles.dropdown}>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">Selecciona un destino</option>
          <option value="BOGOTA">Bogotá</option>
          <option value="SANTA_MARTA">Santa Marta</option>
        </select>
      </div>

      {/* Botón de búsqueda */}
      <button
        className={styles.searchButton}
        onClick={handleSearch}
        disabled={!destination || isLoading} // Deshabilita si no hay destino
      >
        {isLoading ? "Cargando..." : "Consultar"}
      </button>

      {/* Modal de carga */}
      <Modal
        isOpen={isLoading}
        contentLabel="Cargando..."
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <div className={styles.modalContent}>
          <h2>Consultando disponibilidad</h2>
          <div className={styles.spinner}></div>
          <h3>Espere un momento por favor</h3>
        </div>
      </Modal>
    </div>
  );
};

export default DropdownSearch;
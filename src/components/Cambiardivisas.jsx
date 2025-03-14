import React, { useState, useEffect } from "react";
import { currency } from "../stores/divisas";
import "./CurrencySelector.css";  

const CurrencySelector = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("COP"); // Estado local para actualizar el botón

  // Cargar divisa desde localStorage al montar el componente
  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency");
    if (storedCurrency) {
      currency.set(storedCurrency);
      setSelectedCurrency(storedCurrency);
    }
  }, []);

  const handleCurrencySelect = (selectedCurrency) => {
    currency.set(selectedCurrency);  // Actualiza el estado global de Nano Stores
    localStorage.setItem("selectedCurrency", selectedCurrency); // Guarda en localStorage
    setSelectedCurrency(selectedCurrency); // Actualiza el estado local
    setShowModal(false);
  };

  return (
    <div className="currency-header" style={{ backgroundColor: "#26547B", padding: "7px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
      <button className="currency-button" onClick={() => setShowModal(true)}>
        Seleccionar Divisa ({selectedCurrency})
      </button>

      {showModal && (
        <div className="currency-modal">
          <p className="modal-title">Selecciona la moneda:</p>
          <button className="currency-option" onClick={() => handleCurrencySelect("COP")}>
            COP
          </button>
          <button className="currency-option" onClick={() => handleCurrencySelect("USD")}>
            USD
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
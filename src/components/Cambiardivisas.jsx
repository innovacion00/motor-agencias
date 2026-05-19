import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { currency } from "../stores/divisas";
import "./CurrencySelector.css";

const CurrencySelector = () => {
  const [showModal, setShowModal] = useState(false);
  const selectedCurrency = useStore(currency);

  useEffect(() => {
    const storedCurrency = localStorage.getItem("selectedCurrency");
    if (storedCurrency) {
      currency.set(storedCurrency);
    }
  }, []);

  const handleCurrencySelect = (value) => {
    currency.set(value);
    localStorage.setItem("selectedCurrency", value);
    setShowModal(false);
  };

  return (
    <div
      className="currency-header"
      style={{
        backgroundColor: "#26547B",
        padding: "7px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <button className="currency-button" onClick={() => setShowModal(true)}>
        Seleccionar Divisa ({selectedCurrency})
      </button>

      {showModal && (
        <div className="currency-modal">
          <p className="modal-title">Selecciona la moneda:</p>
          <button
            className="currency-option"
            onClick={() => handleCurrencySelect("COP")}
          >
            COP
          </button>
          <button
            className="currency-option"
            onClick={() => handleCurrencySelect("USD")}
          >
            USD
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;

import React, { useState } from "react";
import { currency } from "../stores/divisas";
import "./CurrencySelector.css";  // Importamos el CSS

const CurrencySelector = () => {
  const [showModal, setShowModal] = useState(false);

  const handleCurrencySelect = (selectedCurrency) => {
    currency.set(selectedCurrency);
    setShowModal(false);
  };

  return (
    <div className="currency-header" style={{backgroundColor:"#26547B", padding:"7px",display:"flex",justifyContent:"flex-end",alignItems:"center" }}>
      <button  className="currency-button" onClick={() => setShowModal(true)}>
        Seleccionar Divisa ({currency.get()})
      </button>
     {/* <button>Cambiar idioma</button>
     <button>tooltip</button> */}
      {showModal && (
        
        <div className="currency-modal">
          <p className="modal-title">Selecciona la moneda: </p>
          <button
            className="currency-option"
            onClick={() => handleCurrencySelect("COP")}
          >
           (COP)
          </button>
          <button
            className="currency-option"
            onClick={() => handleCurrencySelect("USD")}
          >
           (USD)

          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
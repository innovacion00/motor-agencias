import React from 'react';

const PaymentSection = ({ total }) => {
  return (
    <div className="payment-section">
      <h3>Pagar reserva</h3>
      <p>Total a pagar: {total}</p>
      <div className="payment-actions">
        <button>Compartir link de pago</button>
        <button>Pagar</button>
      </div>
      <label>
        <input type="checkbox" /> Acepto términos y condiciones
      </label>
    </div>
  );
};

export default PaymentSection;

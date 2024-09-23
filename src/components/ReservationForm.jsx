  import React, { useState } from 'react';
  import GuestInfo from './GuestInfo';
  import PaymentSection from './PaymentSection';
  import './ReservationForm.css'; // Estilos adicionales


  const ReservationForm = () => {
    const [guests, setGuests] = useState([
      { name: '', documentType: '', 
        documentNumber: '', 
        birthDate: '', 
        email: '', 
        phone: '' },
      
    ]);

    const handleGuestChange = (index, field, value) => {
      const updatedGuests = [...guests];
      updatedGuests[index][field] = value;
      setGuests(updatedGuests);
    };

    return (
      <div className="reservation-form">
        <h2>Datos de la reserva</h2>
        <div className="hotel-info">
          <img src="https://cdn.pixabay.com/photo/2016/03/21/20/05/image-1271454_640.png" alt="Hotel-imagen" />
          <div>
            <h3>Nombre del Hotel</h3>
            <p>Direccion del hotel </p>
            <p>Check-in: - Check-out: </p>
            <p>Noches: #, Huéspedes: #, Habitaciones: #</p>
            <p>Total a pagar: $$$</p>
          </div>
        </div>

        <GuestInfo guests={guests} onGuestChange={handleGuestChange} />
        <PaymentSection total="$$$" />
      </div>
    );
  };

  export default ReservationForm;

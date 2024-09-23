import React from 'react'; // Importa React para construir componentes
import { DatePicker } from 'rsuite';  // Importa el componente DatePicker de la librería rsuite
import 'rsuite/dist/rsuite.min.css';  // Importa los estilos CSS necesarios para los componentes de rsuite
import 'bootstrap/dist/css/bootstrap.min.css';

// Definición del componente funcional GuestInfo que recibe dos props: 
// 1. guests: un array de objetos con la información de cada huésped.
// 2. onGuestChange: una función que maneja el cambio de los valores de los campos.
const GuestInfo = ({ guests, onGuestChange }) => {
  
  return (
    <div className="guest-info">
      {/* Título de la sección de información de los huéspedes */}
      <h3>Información de los huéspedes</h3>

      {/* Mapea cada huésped (guest) en el array guests y genera un formulario para cada uno */}
      {guests.map((guest, index) => (
        <div key={index} className="guest-form"> {/* Se crea un div por cada huésped */}
          <h4>Huésped {index + 1}</h4> {/* Muestra el número del huésped (por ejemplo, Huésped 1, Huésped 2) */}
          <br />

          {/* Campo para seleccionar el tipo de documento del huésped */}
          <label>
            Tipo de documento:
            <select
              value={guest.documentType}  // El valor seleccionado es el tipo de documento del huésped actual
              onChange={(e) => onGuestChange(index, 'documentType', e.target.value)}  // Llama a la función onGuestChange cuando el valor cambia
            >
              <option value="">Selecciona un tipo</option>  {/* Opción por defecto */}
              <option value="CC">Cédula</option>  {/* Opción para Cédula */}
              <option value="PP">Pasaporte</option>  {/* Opción para Pasaporte */}
            </select>
          </label>
          
          {/* Campo de entrada para el número de documento */}
          <label>
            Número de documento:
            <input
              type="text"  // El tipo de entrada es texto
              value={guest.documentNumber}  // El valor es el número de documento del huésped actual
              onChange={(e) => onGuestChange(index, 'documentNumber', e.target.value)}  // Llama a la función onGuestChange cuando el valor cambia
            />
          </label>

          {/* Campo de entrada para el nombre completo del huésped */}
          <label>
            Nombre completo:
            <input
              type="text"  // El tipo de entrada es texto
              value={guest.name}  // El valor es el nombre del huésped actual
              onChange={(e) => onGuestChange(index, 'name', e.target.value)}  // Llama a la función onGuestChange cuando el valor cambia
            />
          </label>
          
          {/* Campo de entrada para la fecha de nacimiento usando el DatePicker de rsuite */}
          <label>
            Fecha de nacimiento:
            <DatePicker
              format="dd/MM/yyyy"  // Define el formato en el que se muestra la fecha
              value={new Date(guest.birthDate)}  // Convierte el valor (fecha de nacimiento) a un objeto Date
              onChange={(date) => onGuestChange(index, 'birthDate', date.toISOString().split('T')[0])}  // Cuando la fecha cambia, se convierte a formato ISO y se actualiza el estado
              placeholder="Selecciona la fecha"  // Texto que aparece cuando no se ha seleccionado una fecha
              block  // Hace que el DatePicker ocupe todo el ancho disponible
            />
          </label>
          
          {/* Campo de entrada para el correo electrónico del huésped */}
          <label>
            Correo electrónico:
            <input
              type="email"  // El tipo de entrada es correo electrónico
              value={guest.email}  // El valor es el correo del huésped actual
              onChange={(e) => onGuestChange(index, 'email', e.target.value)}  // Llama a la función onGuestChange cuando el valor cambia
            />
          </label>

          {/* Campo de entrada para el número de teléfono del huésped */}
          <label>
            Celular:
            <input
              type="text"  // El tipo de entrada es texto (puede ser ajustado a "tel" para mayor control sobre el formato)
              value={guest.phone}  // El valor es el número de teléfono del huésped actual
              onChange={(e) => onGuestChange(index, 'phone', e.target.value)}  // Llama a la función onGuestChange cuando el valor cambia
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default GuestInfo;  // Exporta el componente GuestInfo para que pueda ser utilizado en otras partes de la aplicación

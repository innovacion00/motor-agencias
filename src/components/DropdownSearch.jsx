import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import styles from './DropdownSearch.module.css'; // Archivo CSS para el estilo

const DropdownSearch = () => {
  const [destination, setDestination] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  const [showDropdown, setShowDropdown] = useState(false); 
  const [people, setPeople] = useState({
    adults: 1,
    children: 0,
    rooms: 1,
    childrenAges: []
  });

  const destinations = {
    'Cartagena de Indias': '/busquedacartagena',
    'Bogotá': '/busquedabogota',
    'Santa Marta': '/busquedasantamarta'
  }
    
  const handleSearch = () => {
    if (destination) {
      const selectedDestinationURL = destinations[destination];
      window.location.href = selectedDestinationURL;
    } else {
      alert('Por favor selecciona un destino');
    }
  };

  // Maneja los cambios en el número de niños
  const handleChildrenChange = (e) => {
    const newChildrenCount = parseInt(e.target.value);
    setPeople({
      ...people,
      children: newChildrenCount,
      childrenAges: Array(newChildrenCount).fill(0)
    });
  };

  // Maneja los cambios en la edad de los niños
  const handleChildAgeChange = (index, value) => {
    const updatedAges = [...people.childrenAges];
    updatedAges[index] = parseInt(value);
    setPeople({
      ...people,
      childrenAges: updatedAges
    });
  };

  return (
    <div className={styles.dropdownSearchContainer}>
      {/* Dropdown para seleccionar destino */}
      <div className={styles.dropdown}>
        <select 
        value={destination} // Estado para la ciudad seleccionada
        onChange={(e) => setDestination(e.target.value)}>

          <option value="">Selecciona un destino</option>
          {Object.keys (destinations).map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Date picker */}
      <div className={styles.datePicker}>
        <input
          type="text"
          value={`${dateRange[0].startDate.toISOString().split('T')[0]} - ${dateRange[0].endDate.toISOString().split('T')[0]}`}
          onFocus={() => setShowDateRange(!showDateRange)}
          readOnly
        />
        {showDateRange && (
          <div className={styles.dateRangePicker}>
            <DateRange
              ranges={dateRange}
              onChange={(ranges) => setDateRange([ranges.selection])}
            />
          </div>
        )}
      </div>

      {/* Dropdown para los contadores */}
      <div className={styles.dropdownPeople}>
        <div
          className={styles.dropdownToggle}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {people.adults} adulto{people.adults > 1 ? 's' : ''}, {people.children} niño{people.children !== 1 ? 's' : ''}, {people.rooms} habitación{people.rooms > 1 ? 'es' : ''}
        </div>

        {showDropdown && (
          <div className={styles.dropdownMenu}>
            <div className={styles.peopleCounter}>
              <label>Adultos</label>
              <input
                type="number"
                min="1"
                value={people.adults}
                onChange={(e) => setPeople({ ...people, adults: parseInt(e.target.value) })}
              />
              <label>Niños</label>
              <input
                type="number"
                min="0"
                value={people.children}
                onChange={handleChildrenChange}
              />
              {people.children > 0 && (
                <>
                  <p className={styles.childAgeWarning}>
                    Para mostrarte los precios correctos y asegurar espacio para todos, necesitamos saber la edad de los niños al momento del check-out.
                  </p>
                  {people.childrenAges.map((age, index) => (
                    <div key={index} className={styles.childAgeSelector}>
                      <label>Edad del niño {index + 1}</label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={age}
                        onChange={(e) => handleChildAgeChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                </>
              )}
              <label>Habitaciones</label>
              <input
                type="number"
                min="1"
                value={people.rooms}
                onChange={(e) => setPeople({ ...people, rooms: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>
{/* Botón de búsqueda que llama a la función handleSearch */}
<button onClick={handleSearch} className={styles.searchButton}>
        Consultar
      </button>
      
    </div>
  );
};

export default DropdownSearch;

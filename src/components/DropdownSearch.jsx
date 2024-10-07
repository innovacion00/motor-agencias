import React, { useState } from 'react';
import { useStore } from 'nanostores/react';  // Importa el hook para usar la store
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import styles from './DropdownSearch.module.css'; // Archivo CSS para el estilo

import {
  searchState,
  setDestination,
  setDateRange,
  setAdults,
  setChildren,
  setRooms,
  setChildrenAges
} from 'src/stores/searchStore';  // Importa la store y las funciones para modificarla

const DropdownSearch = () => {
  const searchData = useStore(searchState);  // Obtiene los valores globales de la store
  const [showDateRange, setShowDateRange] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const destinations = {
    'Cartagena de Indias': '/busquedacartagena',
    'Bogotá': '/busquedabogota',
    'Santa Marta': '/busquedasantamarta'
  };

  const handleSearch = () => {
    if (searchData.destination) {
      const selectedDestinationURL = destinations[searchData.destination];
      window.location.href = selectedDestinationURL;
    } else {
      alert('Por favor selecciona un destino');
    }
  };

  const handleChildrenChange = (e) => {
    const newChildrenCount = parseInt(e.target.value);
    setChildren(newChildrenCount, Array(newChildrenCount).fill(0));
  };

  const handleChildAgeChange = (index, value) => {
    const updatedAges = [...searchData.childrenAges];
    updatedAges[index] = parseInt(value);
    setChildrenAges(updatedAges);
  };

  return (
    <div className={styles.dropdownSearchContainer}>
      {/* Dropdown para seleccionar destino */}
      <div className={styles.dropdown}>
        <select
          value={searchData.destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">Selecciona un destino</option>
          {Object.keys(destinations).map((city, index) => (
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
          value={`${searchData.dateRange.startDate.toISOString().split('T')[0]} - ${searchData.dateRange.endDate.toISOString().split('T')[0]}`}
          onFocus={() => setShowDateRange(!showDateRange)}
          readOnly
        />
        {showDateRange && (
          <div className={styles.dateRangePicker}>
            <DateRange
              ranges={[searchData.dateRange]}
              onChange={(ranges) => setDateRange(ranges.selection.startDate, ranges.selection.endDate)}
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
          {searchData.adults} adulto{searchData.adults > 1 ? 's' : ''}, {searchData.children} niño{searchData.children !== 1 ? 's' : ''}, {searchData.rooms} habitación{searchData.rooms > 1 ? 'es' : ''}
        </div>

        {showDropdown && (
          <div className={styles.dropdownMenu}>
            <div className={styles.peopleCounter}>
              <label>Adultos</label>
              <input
                type="number"
                min="1"
                value={searchData.adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
              />
              <label>Niños</label>
              <input
                type="number"
                min="0"
                value={searchData.children}
                onChange={handleChildrenChange}
              />
              {searchData.children > 0 && (
                <>
                  <p className={styles.childAgeWarning}>
                    Para mostrarte los precios correctos y asegurar espacio para todos, necesitamos saber la edad de los niños al momento del check-out.
                  </p>
                  {searchData.childrenAges.map((age, index) => (
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
                value={searchData.rooms}
                onChange={(e) => setRooms(parseInt(e.target.value))}
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
  
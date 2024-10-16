import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import styles from './DropdownSearch.module.css';

// Importa la store global
import { searchStore, updateSearchStore } from '../stores/searchStores';
import { useStore } from '@nanostores/react';

const DropdownSearch = () => {
  const searchData = useStore(searchStore);

  // Define los estados locales para control de UI
  const [showDateRange, setShowDateRange] = useState(false); // Controla el selector de fechas
  const [showDropdown, setShowDropdown] = useState(false); // Controla el dropdown de personas
  const [destination, setDestination] = useState('');

  // Función para manejar el cambio de rango de fechas
  const handleDateRangeChange = (ranges) => {
    const startDate = ranges?.selection?.startDate || new Date(); // Valor predeterminado si está undefined
    const endDate = ranges?.selection?.endDate || new Date(); // Valor predeterminado si está undefined

    const newRange = {
      startDate: startDate,
      endDate: endDate,
    };

    console.log('Rango de fechas seleccionado:', newRange);

    // Actualiza el estado global de fechas
    updateSearchStore({ dateRange: newRange });
  };

  // Manejo de la redirección de la búsqueda
  const handleSearch = () => {
    if (destination) {
      const destinations = {
        'Cartagena de Indias': '/busquedacartagena',
        'Bogotá': '/busquedabogota',
        'Santa Marta': '/busquedasantamarta',
      };
      window.location.href = destinations[destination];
    } else {
      alert('Por favor selecciona un destino');
    }
  };

  return (
    <div className={styles.dropdownSearchContainer}>
      {/* Dropdown de destino */}
      <div className={styles.dropdown}>
        <select 
          value={destination}
          onChange={(e) => setDestination(e.target.value)}>
          <option value="">Selecciona un destino</option>
          <option value="Cartagena de Indias">Cartagena de Indias</option>
          <option value="Bogotá">Bogotá</option>
          <option value="Santa Marta">Santa Marta</option>
        </select>
      </div>

      {/* Date picker con el estado global */}
      <div className={styles.datePicker}>
        <input
          type="text"
          value={`${searchData?.dateRange?.startDate?.toISOString().split('T')[0] || ''} - ${searchData?.dateRange?.endDate?.toISOString().split('T')[0] || ''}`}
          onFocus={() => setShowDateRange(true)} // Abre el selector de fechas cuando el campo recibe foco
          readOnly
        />
        {showDateRange && (
          <div className={styles.dateRangePicker}>
            <DateRange
              ranges={[{
                startDate: searchData?.dateRange?.startDate || new Date(),
                endDate: searchData?.dateRange?.endDate || new Date(),
                key: 'selection'
              }]}
              onChange={(ranges) => handleDateRangeChange(ranges)}
              moveRangeOnFirstSelection={false} // Evita que el rango se mueva accidentalmente
            />
            {/* Botón para confirmar y cerrar el selector de fechas */}
            <button onClick={() => setShowDateRange(false)} className={styles.confirmDateButton}>
              Confirmar selección
            </button>
          </div>
        )}
      </div>

      {/* Dropdown para seleccionar adultos, niños y habitaciones */}
      <div className={styles.dropdownPeople}>
        <div
          className={styles.dropdownToggle}
          onClick={() => setShowDropdown(!showDropdown)} // Alterna la visualización del dropdown
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
                onChange={(e) => updateSearchStore({ adults: parseInt(e.target.value) })}
              />
              <label>Niños</label>
              <input
                type="number"
                min="0"
                value={searchData.children}
                onChange={(e) => updateSearchStore({ children: parseInt(e.target.value) })}
              />

              {/* Mensaje de advertencia si hay niños */}
              {searchData.children > 0 && (
                <>
                  <p className={styles.childAgeWarning}>
                    Para mostrarte los precios correctos y asegurar espacio para todos, necesitamos saber la edad de los niños al momento del check-out.
                  </p>
                </>
              )}

              <label>Habitaciones</label>
              <input
                type="number"
                min="1"
                value={searchData.rooms}
                onChange={(e) => updateSearchStore({ rooms: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botón de búsqueda */}
      <button onClick={handleSearch} className={`${styles.searchButton} search-button`}>
        Consultar
      </button>
    </div>
  );
};

export default DropdownSearch;

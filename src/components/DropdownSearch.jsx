import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import styles from "./DropdownSearch.module.css";
import Swal from "sweetalert2";
// Importa la store global
import { searchStore, updateSearchStore } from "../stores/searchStores";
import { useStore } from "@nanostores/react";

const DropdownSearch = () => {
  const searchData = useStore(searchStore);

  // Define los estados locales para control de UI
  const [showDateRange, setShowDateRange] = useState(false); // Controla el selector de fechas
  const [showDropdown, setShowDropdown] = useState(false); // Controla el dropdown de personas
  const [destination, setDestination] = useState("");
  const [rooms, setRooms] = useState([
    { adults: 1, children0to4: 0, children5to17: 0 },
  ]);

  // Función para manejar el cambio de rango de fechas
  const handleDateRangeChange = (ranges) => {
    const startDate = ranges?.selection?.startDate || new Date(); // Valor predeterminado si está undefined
    const endDate = ranges?.selection?.endDate || new Date(); // Valor predeterminado si está undefined

    const newRange = {
      startDate: startDate,
      endDate: endDate,
    };

    console.log("Rango de fechas seleccionado:", newRange);

    // Actualiza el estado global de fechas
    updateSearchStore({ dateRange: newRange });
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { adults: 1, children0to4: 0, children5to17: 0 }]);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  // Manejo de la redirección de la búsqueda
  const handleSearch = () => {
    if (destination) {
      const destinations = {
        "Cartagena de Indias": "/busquedacartagena",
        Bogotá: "/busquedabogota",
        "Santa Marta": "/busquedasantamarta",
      };
      window.location.href = destinations[destination];
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor selecciona una ciudad",
      });
    }
  };

  return (
    <div className={styles.dropdownSearchContainer}>
      {/* Dropdown de destino */}
      <div className={styles.dropdown}>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
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
          value={`${searchData?.dateRange?.startDate?.toISOString().split(
            "T"
          )[0] || ""} - ${
            searchData?.dateRange?.endDate?.toISOString().split("T")[0] || ""
          }`}
          onFocus={() => setShowDateRange(true)} // Abre el selector de fechas cuando el campo recibe foco
          readOnly
        />
        {showDateRange && (
          <div className={styles.dateRangePicker}>
            <DateRange
              ranges={[
                {
                  startDate: searchData?.dateRange?.startDate || new Date(),
                  endDate: searchData?.dateRange?.endDate || new Date(),
                  key: "selection",
                },
              ]}
              onChange={(ranges) => handleDateRangeChange(ranges)}
              moveRangeOnFirstSelection={false} // Evita que el rango se mueva accidentalmente
            />
            <button
              onClick={() => setShowDateRange(false)}
              className={styles.confirmDateButton}
            >
              Confirmar selección
            </button>
          </div>
        )}
      </div>

      {/* Dropdown para seleccionar habitaciones */}
      <div className={styles.dropdownPeople}>
        <div
          className={styles.dropdownToggle}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {rooms.length} habitación{rooms.length > 1 ? "es" : ""}
        </div>

        {showDropdown && (
          <div className={styles.dropdownMenu}>
            {rooms.map((room, index) => (
              <div key={index} className={styles.roomSection}>
                <h4>Habitación {index + 1}</h4>
                {/* Adultos */}
                <div className={styles.counterGroup}>
                  <label>Adultos</label>
                  <div className={styles.counter}>
                    <button
                      onClick={() => {
                        if (room.adults > 1) {
                          const updatedRooms = [...rooms];
                          updatedRooms[index].adults -= 1;
                          setRooms(updatedRooms);
                        }
                      }}
                    >
                      -
                    </button>
                    <span>{room.adults}</span>
                    <button
                      onClick={() => {
                        const updatedRooms = [...rooms];
                        updatedRooms[index].adults += 1;
                        setRooms(updatedRooms);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Niños 0-4 años */}
                <div className={styles.counterGroup}>
                  <label>Niños (0-4 años)</label>
                  <div className={styles.counter}>
                    <button
                      onClick={() => {
                        if (room.children0to4 > 0) {
                          const updatedRooms = [...rooms];
                          updatedRooms[index].children0to4 -= 1;
                          setRooms(updatedRooms);
                        }
                      }}
                    >
                      -
                    </button>
                    <span>{room.children0to4}</span>
                    <button
                      onClick={() => {
                        const updatedRooms = [...rooms];
                        updatedRooms[index].children0to4 += 1;
                        setRooms(updatedRooms);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Niños 5-17 años */}
                <div className={styles.counterGroup}>
                  <label>Niños (5-17 años)</label>
                  <div className={styles.counter}>
                    <button
                      onClick={() => {
                        if (room.children5to17 > 0) {
                          const updatedRooms = [...rooms];
                          updatedRooms[index].children5to17 -= 1;
                          setRooms(updatedRooms);
                        }
                      }}
                    >
                      -
                    </button>
                    <span>{room.children5to17}</span>
                    <button
                      onClick={() => {
                        const updatedRooms = [...rooms];
                        updatedRooms[index].children5to17 += 1;
                        setRooms(updatedRooms);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {rooms.length > 1 && (
                  <button
                    className={styles.removeRoomButton}
                    onClick={() => handleRemoveRoom(index)}
                  >
                    Eliminar habitación
                  </button>
                )}
              </div>
            ))}

            <button className={styles.addRoomButton} onClick={handleAddRoom}>
              + Añadir habitación
            </button>
          </div>
        )}
      </div>

      {/* Botón de búsqueda */}
      <button
        onClick={handleSearch}
        className={`${styles.searchButton} search-button`}
      >
        Consultar
      </button>
    </div>
  );
};

export default DropdownSearch;

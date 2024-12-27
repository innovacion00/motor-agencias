import React, { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import styles from "../../public/styles/DropdownSearch.module.css";
import Swal from "sweetalert2";
import { getdisponibility } from "../stores/disponibilidad";
import { useStore } from "@nanostores/react";

const DropdownSearch = () => {
  const [showDateRange, setShowDateRange] = useState(false); // Controla el selector de fechas
  const [showDropdown, setShowDropdown] = useState(false); // Controla el dropdown de personas
  const [destination, setDestination] = useState("");
  const [rooms, setRooms] = useState([
    { adults: 1, children0to4: 0, children5to17: 0 },
  ]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el botón

  const dropdownRef = useRef(null); // Referencia para el dropdown
  const dateRangeRef = useRef(null); // Referencia para el DateRange

  useEffect(() => {
    // Detecta clics fuera del dropdown
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false); // Cierra el dropdown si el clic ocurre fuera
      }
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target)
      ) {
        setShowDateRange(false); // Cierra el DateRange si el clic ocurre fuera
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const calculateNights = (startDate, endDate) => {
    const msInDay = 24 * 60 * 60 * 1000; // Milisegundos en un día
    const nights = Math.max(
      0, // Asegura que no haya valores negativos
      Math.round((endDate.getTime() - startDate.getTime()) / msInDay)
    );
    return nights;
  };

  const handleDateRangeChange = (ranges) => {
    const startDate = ranges.selection.startDate;
    const endDate = ranges.selection.endDate;

    setDateRange({
      startDate,
      endDate,
    });

    // Calcula las noches y actualiza el estado si es necesario
    const nights = calculateNights(startDate, endDate);

    console.log("Número de noches:", nights);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { adults: 1, children0to4: 0, children5to17: 0 }]);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleSearch = async () => {
    if (!destination) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor selecciona una ciudad",
      });
      return;
    }
    const nights = calculateNights(dateRange.startDate, dateRange.endDate);

    if (nights === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor selecciona un rango de fecha",
      });
      return;
    }

    const layout = rooms.map((room) => ({
      adults: room.adults,
      children_ages: [
        ...Array(room.children0to4).fill(1),
        ...Array(room.children5to17).fill(10),
      ],
    }));

    localStorage.setItem("selectedCity", destination);
    // Deshabilitar el botón mientras se realiza la consulta
    setIsLoading(true);

    const nochesyedades = {
      layout,
      nights,
      dateRange,
    };

    localStorage.setItem("nochesyedades", JSON.stringify(nochesyedades));

    try {
      const objetohotel = {
        checkin: dateRange.startDate.toISOString().split("T")[0],
        nights,
        city: destination.toUpperCase(),
        layout,
      };

      // Realiza la consulta a la API
      await getdisponibility(objetohotel);

      // Si todo es exitoso, redirige según la ciudad seleccionada
      const destinations = {
        CARTAGENA: "/busquedacartagena",
        BOGOTA: "/busquedabogota",
        SANTA_MARTA: "/busquedasantamarta",
      };

      window.location.href = destinations[destination];
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en la búsqueda",
        text: "No se pudo obtener la disponibilidad. Por favor, intenta nuevamente.",
      });
    } finally {
      // Rehabilitar el botón después de que la consulta termine
      setIsLoading(false);
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
          <option value="CARTAGENA">Cartagena de Indias</option>
          <option value="BOGOTA">Bogotá</option>
          <option value="SANTA_MARTA">Santa Marta</option>
        </select>
      </div>

      {/* Selector de rango de fechas */}
      <div className={styles.datePicker} ref={dateRangeRef}>
        <input
          type="text"
          value={`${dateRange.startDate.toISOString().split("T")[0]} - ${
            dateRange.endDate.toISOString().split("T")[0]
          }`}
          onFocus={() => setShowDateRange(true)}
          readOnly
        />
        {showDateRange && (
          <div className={styles.dateRangePicker}>
            <DateRange
              ranges={[
                {
                  startDate: dateRange.startDate,
                  endDate: dateRange.endDate,
                  key: "selection",
                },
              ]}
              onChange={handleDateRangeChange}
              moveRangeOnFirstSelection={false}
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

      {/* Dropdown para habitaciones */}
      <div className={styles.dropdownPeople} ref={dropdownRef}>
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
              Agregar habitación
            </button>
          </div>
        )}
      </div>

      {/* Botón de búsqueda */}
      <button
        onClick={handleSearch}
        className={styles.searchButton}
        disabled={
          isLoading
        } /*Deshabilitar boton cuando se presiona y realiza la consulta */
      >
        {isLoading ? "Cargando..." : "Consultar"} {/* Indicador de carga */}
      </button>
    </div>
  );
};

export default DropdownSearch;

import React, { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Modal from "react-modal";
import styles from "../../public/styles/DropdownSearch.module.css";
import Swal from "sweetalert2";
import { getdisponibility } from "../stores/disponibilidad";

const DropdownSearch = () => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [destination, setDestination] = useState("");
  const [botonactivado, setbotonactivado] = useState("single");
  const [tooltip, setTooltip] = useState(null);
  const [rooms, setRooms] = useState(
    Array.from({ length: 1 }, () => ({
      adults: 2,
      children0to4: 0,
      children5to17: 0,
    }))
  ); // Estado inicial con 10 habitaciones
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);

  const [limits, setLimits] = useState({
    MIN_ROOMS: 1,
    MAX_ROOMS: 9,
  });

  const [includesFlight, setIncludesFlight] = useState(false);
  const [origin, setOrigin] = useState("");

  // Función para mostrar tooltip con un mensaje y ocultarlo después de 2.5s
  const mostrarTooltip = (mensaje) => {
    setTooltip(mensaje);
    setTimeout(() => {
      setTooltip(null);
    }, 3800);
  };
  const dropdownRef = useRef(null);
  const dateRangeRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target)
      ) {
        setShowDateRange(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const calculateNights = (startDate, endDate) => {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.max(
      0,
      Math.round((endDate.getTime() - startDate.getTime()) / msInDay)
    );
  };

  const handleDateRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    setDateRange({ startDate, endDate });
    console.log("Número de noches:", calculateNights(startDate, endDate));
  };

  // // Límites para reservas grupales
  // const MIN_ROOMS = 10;

  //Limite general
  const MAX_ROOMS = 40;

  const handleAddRoom = () => {
    if (rooms.length < limits.MAX_ROOMS) {
      setRooms([...rooms, { adults: 1, children0to4: 0, children5to17: 0 }]);
    }
  };

  const handleRemoveRoom = (index) => {
    if (rooms.length > limits.MIN_ROOMS) {
      const updatedRooms = rooms.filter((_, i) => i !== index);
      setRooms(updatedRooms);
    }
  };

  const handleGroupReservation = () => {
    setRooms(
      Array.from({ length: 10 }, () => ({
        adults: 1,
        children0to4: 0,
        children5to17: 0,
      }))
    );
    setLimits({ MIN_ROOMS: 10, MAX_ROOMS: 40 });
    setbotonactivado("group");
    setIncludesFlight(false);
    setOrigin("");
    mostrarTooltip(
      "Reserva para grupos seleccionado. (Beneficio tourconductor)"
    );
  };

  const handleSingleReservation = () => {
    setRooms(
      Array.from({ length: 1 }, () => ({
        adults: 2,
        children0to4: 0,
        children5to17: 0,
      }))
    );
    setLimits({ MIN_ROOMS: 1, MAX_ROOMS: 9 });
    setbotonactivado("single");
    setIncludesFlight(false);
    setOrigin("");
    mostrarTooltip(
      "Reserva para única fecha seleccionado (Cap. maxima 9 habitaciones)"
    );
  };

  const handleFlightReservation = () => {
    setRooms(
      Array.from({ length: 1 }, () => ({
        adults: 2,
        children0to4: 0,
        children5to17: 0,
      }))
    );
    setLimits({ MIN_ROOMS: 1, MAX_ROOMS: 9 });
    setbotonactivado("flight");
    setIncludesFlight(true);
    mostrarTooltip(
      "Reserva para vuelo + hotel seleccionado"
    );
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

    if (includesFlight && !origin) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor ingresa la ciudad de origen del vuelo",
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
    setIsLoading(true);

    const nochesyedades = {
      layout,
      nights,
      dateRange,
      includesFlight,
      origin: includesFlight ? origin : null,
    };

    localStorage.setItem("nochesyedades", JSON.stringify(nochesyedades));

    try {
      const objetohotel = {
        checkin: dateRange.startDate.toISOString().split("T")[0],
        nights,
        city: destination.toUpperCase(),
        layout,
      };

      await getdisponibility(objetohotel);

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
        text: "No se pudo obtener la disponibilidad. Por favor, intenta nuevamente mas tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.dropdownSearchContainer}>
      <div className={styles.dateButtons}>
        <button
          className={`${styles.button} ${
            botonactivado == "single" ? styles.active : ""
          }`}
          onClick={handleSingleReservation}
        >
          Única fecha
        </button>
        <button
          className={`${styles.button} ${
            botonactivado == "group" ? styles.active : ""
          }`}
          onClick={handleGroupReservation}
        >
          Reserva para grupos
        </button>
        <button
          className={`${styles.button} ${
            botonactivado == "flight" ? styles.active : ""
          }`}
          onClick={handleFlightReservation}
        >
          Vuelo + Hotel
        </button>
      </div>
      <br />

      {tooltip && <div className={styles.tooltip}>{tooltip}</div>}

      {includesFlight && (
        <div className={styles.dropdown}>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          >
            <option value="">Selecciona ciudad de origen</option>
            <option value="BOGOTA">Bogotá</option>
            <option value="CARTAGENA">Cartagena de Indias</option>
            <option value="SANTA_MARTA">Santa Marta</option>
          </select>
        </div>
      )}

      {/*------------------------ Dropdown de destino ------------------------*/}

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

      {/*------------------------ Selector de rango de fechas------------------------ */}

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
              minDate={new Date()} //Limita la seleccion a partir de hoy
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

      {/*--------------- Dropdown para habitaciones ----------------*/}
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
                {/* <div className={styles.counterGroup}>
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
                </div> */}
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
            <div>
                  <p style={{ color:"#1C3D5A", justifyContent:"center"}}>Nota: niños de 0 a 4 años ingresan gratis en el alojamiento en las camas incluidas </p>
                </div>
            <button
              className={styles.addRoomButton} //-----------------------------------------------------------------
              onClick={handleAddRoom}
              disabled={rooms.length >= MAX_ROOMS} // Deshabilitar cuando se alcanza el máximo
            >
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
      
      {/* Modal de carga */}
      <Modal
        isOpen={isLoading}
        contentLabel="Cargando..."
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <div className={styles.modalContent}>
          <h2>Consultando disponibilidad </h2>
          <div className={styles.spinner}></div>
          <h3>Espere un momento porfavor</h3>
        </div>
      </Modal>
    </div>
  );
};

export default DropdownSearch;

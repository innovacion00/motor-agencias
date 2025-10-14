import React, { useEffect, useState, useRef } from "react";
import styles from "./styles/tabla.module.css";
import { getReservas, reservasNano } from "../../stores/disponibilidad";
import { format } from "@formkit/tempo";
import { Calendar, DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const Tabla = () => {
  const [reservas, setReservas] = useState([]);
  const [tokenUrl, setTokenUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReservas, setFilteredReservas] = useState([]); //Filtro por agencia, hotel, huésped o código
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(15); // Número de elementos por página
  const [selectedStatus, setselectedStatus] = useState("all"); //Filtro por estado
  const [isLoading, setIsLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const dateFilterRef = useRef(null);
  const dateRangeFilterRef = useRef(null);

  useEffect(() => {
    const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosUsuario.accessToken, datosUsuario.role[0]);
    setTokenUrl(datosUsuario.accessToken);
  }, []);

  // useEffect para manejar clicks fuera del selector de fechas
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target)
      ) {
        setShowDateFilter(false);
      }
      if (
        dateRangeFilterRef.current &&
        !dateRangeFilterRef.current.contains(event.target)
      ) {
        setShowDateRangeFilter(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const SkeletonRow = () => (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      {[...Array(12)].map((_, index) => (
        <td key={index} style={{ padding: "12px" }}>
          <div
            style={{
              height: "20px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              animation: "pulse 1.5s infinite",
              width: index === 11 ? "150px" : "100%", // Ancho especial para la columna de acciones
            }}
          ></div>
        </td>
      ))}
    </tr>
  );

  const ObtenerReservas = async (token, nombreAgencia) => {
    setIsLoading(true);
    try {
      await getReservas(nombreAgencia);
      const reservasObtenidas = reservasNano.get();
      setReservas(reservasObtenidas);
      setFilteredReservas(reservasObtenidas); // Inicializar reservas filtradas
    } finally {
      setIsLoading(false);
    }
  };
  console.log(filteredReservas);
  // Calcular la suma total de "Valor a pagar"
  const totalAmount = filteredReservas.reduce((acc, reserva) => {
    return reserva.status != "4" ? acc + (reserva.total || 0) : acc;
  }, 0);

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "$$$";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    applyFilters(searchValue, selectedStatus, dateFilter, dateRangeFilter[0]);
  };

  const applyFilters = (searchTerm = "", status = "all", selectedDate = null, dateRange = null) => {
    let filtered = reservas;

    // Filtro por texto de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (reserva) =>
          reserva.hotel.toLowerCase().includes(searchTerm) ||
          reserva.reservaChatbotId.toLowerCase().includes(searchTerm) ||
          reserva.reservation.firstName.toLowerCase().includes(searchTerm) ||
          reserva.reservation.lastName.toLowerCase().includes(searchTerm) ||
          (reserva.agenciaId?.fullName || "").toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por estado
    if (status !== "all") {
      filtered = filtered.filter((reserva) => reserva.status.toString() === status);
    }

    // Filtro por fecha de check-in específica (comparación segura por zona horaria)
    if (selectedDate) {
      const formatDateLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const selectedLocal = formatDateLocal(new Date(selectedDate));

      filtered = filtered.filter((reserva) => {
        const checkinStr = reserva?.reservation?.checkin; // ya viene como YYYY-MM-DD
        return checkinStr === selectedLocal;
      });
    }

    // Filtro por rango de fechas (check-in y check-out)
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const formatDateLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const startDate = formatDateLocal(new Date(dateRange.startDate));
      const endDate = formatDateLocal(new Date(dateRange.endDate));

      filtered = filtered.filter((reserva) => {
        const checkinStr = reserva?.reservation?.checkin; // ya viene como YYYY-MM-DD
        const checkoutStr = reserva?.reservation?.checkout; // ya viene como YYYY-MM-DD
        
        // Verificar si el check-in o check-out están dentro del rango seleccionado
        return (checkinStr >= startDate && checkinStr <= endDate) || 
               (checkoutStr >= startDate && checkoutStr <= endDate) ||
               (checkinStr <= startDate && checkoutStr >= endDate); // Reserva que abarca todo el rango
      });
    }

    setFilteredReservas(filtered);
    setCurrentPage(1);
  };

  //Filtro por estado

  const handleStatusFilter = (status) => {
    setselectedStatus(status);
    applyFilters(searchTerm, status, dateFilter, dateRangeFilter[0]);
  };

  const handleDateChange = (date) => {
    setDateFilter(date);
    applyFilters(searchTerm, selectedStatus, date, dateRangeFilter[0]);
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    applyFilters(searchTerm, selectedStatus, null, dateRangeFilter[0]);
  };

  // Cálculo de los índices de elementos para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Cambio de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generación de números de página
  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
  const pageNumbers = [...Array(totalPages).keys()].map((i) => i + 1);

  /*
  ? 0 Pendiente de pago
  ? 1 En proceso de pago
  ? 2 Pago Rechazado
  ? 3 Pago Aprobado
  ? 4 Cancelado
  ? 5 Pago abonado
  */
  // console.log(reservas)
  return (
    <div className={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
      <h1>Consultar mis reservas</h1>
      <br />
      <div className={styles.containerfilters}>
      {/* Filtro de búsqueda */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por agencia, hotel, huésped o código..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      {/* Filtro por fecha de check-in */}
      <div className={styles.dateFilterContainer} ref={dateFilterRef}>
        <div className={styles.dateFilterInput}>
          <input
            type="text"
            placeholder="Ingrese la fecha de check-in"
            value={dateFilter ? `${dateFilter.getFullYear()}-${String(dateFilter.getMonth()+1).padStart(2,"0")}-${String(dateFilter.getDate()).padStart(2,"0")}` : ""}
            onFocus={() => setShowDateFilter(true)}
            readOnly
            className={styles.dateFilterInputField}
          />
          <button
            onClick={clearDateFilter}
            className={styles.clearDateButton}
            title="Limpiar filtro de fecha"
            disabled={!dateFilter}
          >
            ✕
          </button>
        </div>

        {showDateFilter && (
          <div className={styles.dateRangePicker}>
            <Calendar
              date={dateFilter || new Date()}
              onChange={handleDateChange}
            />
            <button
              onClick={() => setShowDateFilter(false)}
              className={styles.confirmDateButton}
            >
              Confirmar selección
            </button>
          </div>
        )}
      </div>

      {/* Filtro por rango de fechas de check-in y check-out */}
      <div className={styles.dateFilterContainer} ref={dateRangeFilterRef}>
        <div className={styles.dateFilterInput}>
          <input
            type="text"
            placeholder="Ingrese un rango de fechas"
            value={dateRangeFilter[0].startDate && dateRangeFilter[0].endDate && 
                   (dateRangeFilter[0].startDate.getTime() !== dateRangeFilter[0].endDate.getTime() || 
                    dateRangeFilter[0].startDate.getTime() !== new Date().getTime()) ? 
              `${dateRangeFilter[0].startDate.getFullYear()}-${String(dateRangeFilter[0].startDate.getMonth()+1).padStart(2,"0")}-${String(dateRangeFilter[0].startDate.getDate()).padStart(2,"0")} a ${dateRangeFilter[0].endDate.getFullYear()}-${String(dateRangeFilter[0].endDate.getMonth()+1).padStart(2,"0")}-${String(dateRangeFilter[0].endDate.getDate()).padStart(2,"0")}` : ""}
            onFocus={() => setShowDateRangeFilter(true)}
            readOnly
            className={styles.dateFilterInputField}
          />
          <button
            onClick={() => {
              setDateRangeFilter([{
                startDate: null,
                endDate: null,
                key: 'selection'
              }]);
              applyFilters(searchTerm, selectedStatus, dateFilter, null);
            }}
            className={styles.clearDateButton}
            title="Limpiar filtro de rango de fechas"
            disabled={!dateRangeFilter[0].startDate || !dateRangeFilter[0].endDate || 
                     (dateRangeFilter[0].startDate && dateRangeFilter[0].endDate && 
                      dateRangeFilter[0].startDate.getTime() === dateRangeFilter[0].endDate.getTime())}
          >
            ✕
          </button>
        </div>

        {showDateRangeFilter && (
          <div className={styles.dateRangePicker}>
            <DateRange
              ranges={dateRangeFilter}
              onChange={(ranges) => {
                setDateRangeFilter([ranges.selection]);
                applyFilters(searchTerm, selectedStatus, dateFilter, ranges.selection);
              }}
              showSelectionPreview={true}
            />
            <button
              onClick={() => setShowDateRangeFilter(false)}
              className={styles.confirmDateButton}
            >
              Confirmar selección
            </button>
          </div>
        )}
      </div>
      </div>
      
      <div className={styles.statusFilter}>
        <button
          onClick={() => handleStatusFilter("all")}
          className={selectedStatus == "all" ? styles.activeFilter : ""}
        >
          Todos
        </button>
        <button
          onClick={() => handleStatusFilter("0")}
          className={selectedStatus == "0" ? styles.activeFilter : ""}
        >
          Pago pendiente
        </button>
        <button
          onClick={() => handleStatusFilter("1")}
          className={selectedStatus == "1" ? styles.activeFilter : ""}
        >
          Pago en proceso
        </button>
        <button
          onClick={() => handleStatusFilter("2")}
          className={selectedStatus == "2" ? styles.activeFilter : ""}
        >
          Pago rechazado
        </button>
        <button
          onClick={() => handleStatusFilter("5")}
          className={selectedStatus == "5" ? styles.activeFilter : ""}
        >
          Pago abonado primera mitad
        </button>
        <button
          onClick={() => handleStatusFilter("3")}
          className={selectedStatus == "3" ? styles.activeFilter : ""}
        >
          Pago completado
        </button>
        <button
          onClick={() => handleStatusFilter("4")}
          className={selectedStatus == "4" ? styles.activeFilter : ""}
        >
          Reserva cancelada
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Fecha de creacion</th>
            <th>Cod. reserva</th>
            <th>Hotel</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Agencia</th>
            <th>Agente</th>
            <th>Huésped</th>
            <th>Plazo para pagar</th>
            <th>Valor a pagar</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Mostrar 15 filas de skeleton loader
            [...Array(15)].map((_, index) => <SkeletonRow key={index} />)
          ) : (
            <>
              {currentItems.map((dato, index) => (
                <tr key={index}>
                  <td>
                    {format(dato.createdAt, "h:mm a DD/MM/YYYY ", "es")}
                  </td>{""}
                  {/*Fecha de creacion*/}
                  <td>{dato.reservaChatbotId}</td> {/*ID de la reserva*/}
                  <td>{dato.hotel}</td> {/*Nombre del hotel*/}
                  <td>
                    {format(dato.reservation.checkin, "DD/MM/YYYY", "es")}
                  </td>{" "}
                  {/*Fecha de check-in*/}
                  <td>
                    {format(dato.reservation.checkout, "DD/MM/YYYY", "es")}
                  </td>{" "}
                  {/*Fecha de check-out*/}
                  <td>{dato?.agenciaId?.fullName}</td> {/*Nombre de la agencia*/}
                  <td>{dato?.userId?.fullName}</td> {/*Nombre del agente*/}
                  <td>
                    {`${dato.reservation.firstName} ${dato.reservation.lastName}`}
                  </td>{" "}
                  {/*Nombre del huésped*/}

                  {/*Fechas limite de pago*/}
                  <td>
                    {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                      format(dato.fechaLimitePago, "DD/MM/YYYY", "es")
                    ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                      format(dato.fechaLimitePago, "DD/MM/YYYY", "es")
                    ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                      format(dato.fechaLimitePago, "DD/MM/YYYY", "es")
                    ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                      format(dato.fechaLimitePago2, "DD/MM/YYYY", "es")
                    ) : dato.status == "4" ? (
                      format(dato.fechaLimitePago, "DD/MM/YYYY", "es")
                    ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                      format(dato.fechaLimitePago2, "DD/MM/YYYY", "es")
                    ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                      format(dato.fechaLimitePago2, "DD/MM/YYYY", "es")
                    ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                      format(dato.fechaLimitePago2, "DD/MM/YYYY", "es")
                    ) : (
                      <p>En proceso</p>
                    )}
                  </td>

                  {/*Valor a pagar dolares*/}
                  {dato.reservation.currency == "USD" ? (
                    <td>
                      {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                        `${formatCurrency(dato.totalMitad)} USD`
                      ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                        `${formatCurrency(dato.totalMitad)} USD`
                      ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                        `${formatCurrency(dato.totalMitad)} USD`
                      ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.total)} USD`
                      ) : dato.status == "4" ? (
                        `${formatCurrency(dato.total)} USD`
                      ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.totalMitad)} USD`
                      ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.totalMitad)} USD`
                      ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.totalMitad)} USD`
                      ) : (
                        <p>En proceso </p>
                      )}
                    </td>
                  ) : (
                    //Valor a pagar pesos
                    <td>
                      {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                        `${formatCurrency(dato.totalMitad)} COP`
                      ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                        `${formatCurrency(dato.totalMitad)} COP`
                      ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                        `${formatCurrency(dato.totalMitad)} COP`
                      ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.total)} COP`
                      ) : dato.status == "4" ? (
                        `${formatCurrency(dato.total)} COP`
                      ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.totalMitad)} COP`
                      ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.totalMitad)} COP`
                      ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                        `${formatCurrency(dato.totalMitad)} COP`
                      ) : (
                        <p>En proceso </p>
                      )}
                    </td>
                  )}

                  {/*Estado de la reserva*/}
                  <td>
                    {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                      <span className={`${styles.status} ${styles.pending}`}>
                        Pago pendiente
                      </span>
                    ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                      <span className={`${styles.status} ${styles.proces}`}>
                        Pago en proceso
                      </span>
                    ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                      <span className={`${styles.status} ${styles.denied}`}>
                        Pago rechazado primer abono
                      </span>
                    ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                      <span className={`${styles.status} ${styles.clomplete}`}>
                        Pago aprobado
                      </span>
                    ) : dato.status == "4" ? (
                      <span className={`${styles.status} ${styles.cancel}`}>
                        Reserva cancelada
                      </span>
                    ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                      <span className={`${styles.status} ${styles.denied}`}>
                        Pago rechazado segundo abono
                      </span>
                    ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                      <span className={`${styles.status} ${styles.abonado}`}>
                        Abonado primera mitad
                      </span>
                    ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                      <span className={`${styles.status} ${styles.proces}`}>
                        Pago total en proceso
                      </span>
                    ) : (
                      <p>Estado en proceso</p>
                    )}
                  </td>
                  <td>
                    <a
                      href={`/gestionar/${dato.reservaChatbotId}`}
                      className={styles.link}
                    >
                      Consultar y gestionar
                    </a>
                  </td>
                </tr>
              ))}

              {/*----------------------- Fila para el total ---------------------------*/}

              <tr className={styles.totalRow}>
                <td colSpan="1" style={{ textAlign: "left", fontWeight: "bold" }}>
                  Total de reservas realizadas:
                </td>
                <td style={{ fontWeight: "bold" }}>{filteredReservas.length}</td>
                <td colSpan="7" style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total:
                </td>
                <td style={{ fontWeight: "bold" }}>
                  {formatCurrency(totalAmount)}
                </td>
                <td colSpan="2"></td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* Mostrar paginación solo cuando no está cargando */}
      {!isLoading && (
        <div className={styles.pagination}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageNav}
          >
            &laquo; {/* Símbolo para "anterior" */}
          </button>

          {pageNumbers
            .filter(
              (number) =>
                number === 1 || // Siempre muestra la primera página
                number === totalPages || // Siempre muestra la última página
                (number >= currentPage - 2 && number <= currentPage + 2) // Muestra un rango de 5 páginas alrededor de la actual
            )
            .map((number, index, filtered) => (
              <>
                {/* Agrega "..." para indicar páginas omitidas */}
                {index > 0 && filtered[index - 1] + 1 !== number && (
                  <span className={styles.ellipsis} key={`ellipsis-${number}`}>
                    ...
                  </span>
                )}
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`${styles.pageItem} ${
                    currentPage === number ? styles.active : ""
                  }`}
                >
                  {number}
                </button>
              </>
            ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageNav}
          >
            &raquo; {/* Símbolo para "siguiente" */}
          </button>
        </div>
      )}
    </div>
  );
};

export default Tabla;

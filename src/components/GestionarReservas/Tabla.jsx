import React, { useEffect, useState } from "react";
import styles from "./styles/tabla.module.css";
import { getReservas, reservasNano } from "../../stores/disponibilidad";
import { format } from "@formkit/tempo";

const Tabla = () => {
  const [reservas, setReservas] = useState([]);
  const [tokenUrl, setTokenUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReservas, setFilteredReservas] = useState([]); //Filtro por agencia, hotel, huésped o código
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(15); // Número de elementos por página
  const [selectedStatus, setselectedStatus] = useState("all"); //Filtro por estado

  useEffect(() => {
    const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosUsuario.token, datosUsuario.role[0]);
    setTokenUrl(datosUsuario.token);
  }, []);

  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(token, nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setReservas(reservasObtenidas);
    setFilteredReservas(reservasObtenidas); // Inicializar reservas filtradas
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

    const filtered = reservas.filter(
      (reserva) =>
        reserva.hotel.toLowerCase().includes(searchValue) || // Filtrar por hotel
        reserva.reservaChatbotId.toLowerCase().includes(searchValue) || // Filtrar por código de reserva
        reserva.reservation.firstName.toLowerCase().includes(searchValue) || // Filtrar por nombre del huésped
        reserva.reservation.lastName.toLowerCase().includes(searchValue) || // Filtrar por apellido del huésped
        (reserva.agenciaId?.fullName || "").toLowerCase().includes(searchValue)
    );
    setFilteredReservas(filtered);
    setCurrentPage(1); // Reiniciar a la primera página
  };

  //Filtro por estado

  const handleStatusFilter = (status) => {
    setselectedStatus(status);
    const filtered =
      status == "all"
        ? reservas
        : reservas.filter((reservas) => reservas.status == status);
    setFilteredReservas(filtered);
    setCurrentPage(1); //Reiniciar a la primera página
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
      <h1>Consultar mis reservas</h1>
      <br />
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
          {currentItems.map((dato, index) => (
            <tr key={index}>
              <td>{format(dato.createdAt, "h:mm a DD/MM/YYYY ", "es")}</td>
              <td>{dato.reservaChatbotId}</td>
              <td>{dato.hotel}</td>
              <td>{format(dato.reservation.checkin, "DD/MM/YYYY", "es")}</td>
              <td>{format(dato.reservation.checkout, "DD/MM/YYYY", "es")}</td>
              <td>{dato?.agenciaId?.fullName}</td>
              <td>{dato?.userId?.fullName}</td>
              <td>{`${dato.reservation.firstName} ${dato.reservation.lastName}`}</td>
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
        </tbody>
      </table>

      {/* Paginación */}
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
    </div>
  );
};

export default Tabla;

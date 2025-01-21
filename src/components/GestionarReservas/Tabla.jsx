import React, { useEffect, useState } from "react";
import styles from "./styles/tabla.module.css";
import { getReservas, reservasNano } from "../../stores/disponibilidad";

const Tabla = () => {
  const [reservas, setReservas] = useState([]);
  const [tokenUrl, setTokenUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReservas, setFilteredReservas] = useState([]); //Filtro por agencia, hotel, huésped o código
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(15); // Número de elementos por página
  const [selectedStatus, setselectedStatus] = useState("all"); //Filtro por estado
  const reservasTest = [
    {
      "_id": "678fbc6f749d61fe106c55c7",
      "userId": "676afea4182f6828bef5ff7b",
      "agenciaId": {
        "_id": "676afe767b623769038dcb32",
        "fullName": "geh suites"
      },
      "hotel": "Hotel Azuan",
      "cantidadHabitaciones": 1,
      "total": 100000,
      "totalMitad": 50000,
      "pagadoPrimeraMitad": true,
      "reteFuente": {
        "porcentaje": 15,
        "resultado": 2850,
        "_id": "678fbc6f749d61fe106c55c8"
      },
      "reteIva": {
        "porcentaje": 15,
        "resultado": 2850,
        "_id": "678fbc6f749d61fe106c55c9"
      },
      "reteIca": {
        "porcentaje": 15,
        "resultado": 2850,
        "_id": "678fbc6f749d61fe106c55ca"
      },
      "exentoIva": true,
      "status": 5,
      "titularInfo": {
        "firstName": "Sebastián",
        "lastName": "Kelcy",
        "tipoDocumento": "cedula",
        "documento": "300132321",
        "fechaNacimiento": "2024-12-12",
        "_id": "678fbc6f749d61fe106c55cb"
      },
      "reservation": {
        "source_of_bussiness": "Agencias travesia",
        "adults": "1",
        "checkin": "2025-02-22",
        "checkout": "2025-02-23",
        "children": "0",
        "children_ages": "",
        "city": "CARTAGENA",
        "country": "COL",
        "currency": "COP",
        "email": "sekelbi99@hotmail.com",
        "telephone": "+573116674983",
        "firstName": "Sebastián",
        "lastName": "Kelcy",
        "nights": "1",
        "notes": "Reserva de 2 noches ",
        "rooms": "1",
        "roomsData": [
          {
            "nombreHabitacion": "Habitacion Doble Standard",
            "adults": "1",
            "children": "",
            "checkin": "2025-01-22",
            "checkout": "2025-01-23",
            "currency": "COP",
            "id": "83534",
            "quantity": "1",
            "rateId": "99100",
            "unitaryPrice": 100000,
            "_id": "678fbc6f749d61fe106c55cd"
          }
        ],
        "_id": "678fbc6f749d61fe106c55cc"
      },
      "reservaChatbotId": "CSKJKLSJDKL",
      "fechaLimitePago": "2025-02-09",
      "fechaLimitePago2": "2025-02-21",
      "linkInfo": {
        "link": "",
        "expirationDate": "",
        "idLinkPago": "",
        "_id": "678fbc6f749d61fe106c55c6"
      },
      "asistentes": [],
      "createdAt": "2025-01-21T15:25:35.116Z",
      "updatedAt": "2025-01-21T15:25:35.116Z",
      "__v": 0
    }]

  console.log(reservasTest)
  useEffect(() => {
    const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosUsuario.token, datosUsuario.role[0]);
    setTokenUrl(datosUsuario.token);
  }, []);

  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(token, nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setReservas(reservasTest);
    setFilteredReservas(reservasTest); // Inicializar reservas filtradas
  };
  // Calcular la suma total de "Valor a pagar"
  const totalAmount = filteredReservas.reduce((acc, reserva) => {
    return reserva.status != "4" ? acc + (reserva.total || 0) : acc;
  }, 0);

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "$$$";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = reservas.filter((reserva) =>
      reserva.hotel.toLowerCase().includes(searchValue) ||  // Filtrar por hotel
      reserva.reservaChatbotId.toString().includes(searchValue) ||   // Filtrar por código de reserva
      reserva.reservation.firstName.toLowerCase().includes(searchValue) ||   // Filtrar por nombre del huésped
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
    setFilteredReservas(filtered)
    setCurrentPage(1); //Reiniciar a la primera página
  }

  // Cálculo de los índices de elementos para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservas.slice(indexOfFirstItem, indexOfLastItem);

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
          onClick={() => handleStatusFilter("3")}
          className={selectedStatus == "3" ? styles.activeFilter : ""}
        >
          Pago aprobado
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
            <th>Cod. reserva</th>
            <th>Hotel</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Agencia</th>
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
              <td>{dato.reservaChatbotId}</td>
              <td>{dato.hotel}</td>
              <td>{dato.reservation.checkin}</td>
              <td>{dato.reservation.checkout}</td>
              <td>{dato?.agenciaId?.fullName}</td>
              <td>{`${dato.reservation.firstName} ${dato.reservation.lastName}`}</td>
              <td>
                {
                  dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                    dato.fechaLimitePago
                  ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                    dato.fechaLimitePago
                  ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                    dato.fechaLimitePago
                  ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                    dato.fechaLimitePago2
                  ) : dato.status == "4" ? (
                    dato.fechaLimitePago2
                  ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                    dato.fechaLimitePago2
                  ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                    dato.fechaLimitePago2
                  ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                    dato.fechaLimitePago2
                  ) : (<p>Monto no valido</p>)
                }

              </td>
              <td>
                {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                  formatCurrency(dato.totalMitad)
                ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                  formatCurrency(dato.totalMitad)
                ) : dato.status == "2" && dato.pagadoPrimeraMitad == false ? (
                  formatCurrency(dato.totalMitad)
                ) : dato.status == "3" && dato.pagadoPrimeraMitad == true ? (
                  formatCurrency(dato.total)
                ) : dato.status == "4" ? (
                  formatCurrency(dato.total)
                ) : dato.status == "2" && dato.pagadoPrimeraMitad == true ? (
                  formatCurrency(dato.totalMitad)
                ) : dato.status == "5" && dato.pagadoPrimeraMitad == true ? (
                  formatCurrency(dato.totalMitad)
                ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ? (
                  formatCurrency(dato.totalMitad)
                ) : (<p>Monto no valido</p>)
                }

              </td>
              <td>
                {dato.status == "0" && dato.pagadoPrimeraMitad == false ? (
                  <span className={`${styles.status} ${styles.pending}`}>
                    Pago pendiente 50%
                  </span>
                ) : dato.status == "1" && dato.pagadoPrimeraMitad == false ? (
                  <span className={`${styles.status} ${styles.proces}`}>
                    Pago en proceso 50%
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
                ) : dato.status == "1" && dato.pagadoPrimeraMitad == true ?
                  (<span className={`${styles.status} ${styles.proces}`}>
                    Pago en proceso segundo abono
                  </span>) : (<p>Estado no valido</p>)
                }
              </td>
              <td>
                <a href={`/gestionar/${dato.reservaChatbotId}`} className={styles.link}>
                  Consultar y gestionar
                </a>
              </td>
            </tr>
          ))}

          {/* Fila para el total */}
          <tr className={styles.totalRow}>
            <td colSpan="7" style={{ textAlign: "right", fontWeight: "bold" }}>
              Total:
            </td>
            <td style={{ fontWeight: "bold" }}>{formatCurrency(totalAmount)}</td>
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
                className={`${styles.pageItem} ${currentPage === number ? styles.active : ""}`}
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

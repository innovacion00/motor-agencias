import React, { useEffect, useState } from "react";
import styles from "./styles/tabla.module.css";
import { getReservas, reservasNano } from "../../stores/disponibilidad";

const Tabla = () => {
  const [reservas, setreservas] = useState([]);
  const [tokenUrl, setTokenUrl] = useState("");
  const [nombreAgencia, setnombreAgencia] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Nuevo estado para el filtro
  const [filteredReservas, setFilteredReservas] = useState([]); // Estado para las reservas filtradas

  // console.log(role)
  useEffect(() => {
    const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));
    ObtenerReservas(datosUsuario.token, datosUsuario.role[0]);
    setTokenUrl(datosUsuario.token);
    setnombreAgencia(datosUsuario);
  }, []);

  const ObtenerReservas = async (token, nombreAgencia) => {
    await getReservas(token, nombreAgencia);
    const reservasObtenidas = reservasNano.get();
    setreservas(reservasObtenidas);
    setFilteredReservas(reservasObtenidas); // Inicializar reservas filtradas
  };
  console.log(reservas);
  //funcion para formatear el los valores de dinero
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };


  //funcion para filtrar
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = reservas.filter((reserva) =>
      reserva.hotel.toLowerCase().includes(searchValue) || // Filtrar por hotel
      reserva.reservaChatbotId.toString().includes(searchValue) || // Filtrar por código de reserva
      reserva.reservation.firstName.toLowerCase().includes(searchValue) || // Filtrar por nombre del huésped
      reserva.reservation.lastName.toLowerCase().includes(searchValue) || // Filtrar por apellido del huésped
      (reserva.agenciaId?.fullName || "").toLowerCase().includes(searchValue)
    );
    setFilteredReservas(filtered);
  };

  return (
    <div className={styles.container}>
      <br />
      <h1>Consultar mis reservas</h1>

      {/* Filtro de búsqueda */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por agencia,hotel, huésped o código ..."
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tabs}>
        <div className={styles.active}>
          Próximos pagos {/*<span className={styles.badge}>1</span>*/}
        </div>
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
          {filteredReservas.map((dato, index) => (
            <tr key={index}>
              <td>{dato.reservaChatbotId}</td>
              <td>{dato.hotel}</td>
              <td>{dato.reservation.checkin}</td>
              <td>{dato.reservation.checkout}</td>
              <td>{dato?.agenciaId?.fullName}</td>
              <td>{`${dato.reservation.firstName} ${dato.reservation.lastName}`}</td>
              <td>{dato.fechaLimitePago}</td>
              <td>{formatCurrency(dato.total)}</td>
              <td>
                {dato.status == "0" ? (
                  <span className={`${styles.status} ${styles.pending}`}>
                    Pago pendiente
                  </span>
                ) : dato.status == "1" ? (
                  <span className={`${styles.status} ${styles.proces}`}>
                    Pago en proceso
                  </span>
                ) : dato.status == "2" ? (
                  <span className={`${styles.status} ${styles.denied}`}>
                    Pago rechazado
                  </span>
                ) : dato.status == "3" ? (
                  <span className={`${styles.status} ${styles.clomplete}`}>
                    Pago aprobado
                  </span>
                ) : dato.status == "4" ? (
                  <span className={`${styles.status} ${styles.cancel}`}>
                    Reserva cancelada
                  </span>
                ) : (
                  <p>Estado no válido</p>
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
        </tbody>
      </table>

      <div className={styles.pagination}>
        <span>Anterior</span>
        <a href="#" className={styles.active}>
          1
        </a>
        <span>Siguiente</span>
      </div>
    </div>
  );
};

export default Tabla;

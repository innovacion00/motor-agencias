import React, { useEffect, useState } from "react";
import styles from "./styles/tabla.module.css";
import { reservasNano, buscarReservasCombinadas } from "../../stores/disponibilidad";
import { format } from "@formkit/tempo";

const estadosPago = [
  { value: "todos", label: "Todos los estados" },
  { value: "0", label: "Pago pendiente" },
  { value: "1", label: "Pago en proceso" },
  { value: "2", label: "Pago rechazado" },
  { value: "3", label: "Pago completado" },
  { value: "4", label: "Reserva cancelada" },
  { value: "5", label: "Pago segundo abono" },
  { value: "6", label: "Reserva abonada" },
];

const Tabla = () => {
  const [reservas, setReservas] = useState([]);
  const [tokenUrl, setTokenUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Página actual (servidor)
  const [itemsPerPage] = useState(15); // Máximo 15 reservas por página
  const [isLoading, setIsLoading] = useState(true);

  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 15,
    totalPages: 1,
  });
  const [userRole, setUserRole] = useState(null);

  // Borrador de filtros: solo se aplica al pulsar "Buscar"
  const [filtros, setFiltros] = useState({
    tipo: "codigo",
    texto: "",
    estado: "todos",
    desde: "",
    hasta: "",
  });

  // Instantánea de los filtros aplicados (la que usa cada carga de página)
  const [filtrosAplicados, setFiltrosAplicados] = useState({});

  const cargarReservas = async (page = 1, filtrosActuales = null) => {
    setIsLoading(true);
    try {
      const filtrosUsados = filtrosActuales ?? filtrosAplicados;
      const { data, meta } = await buscarReservasCombinadas(userRole, filtrosUsados, page);
      const reservasObtenidas = data ?? reservasNano.get();

      setReservas(Array.isArray(reservasObtenidas) ? reservasObtenidas : []);

      const finalMeta = meta || {
        total: reservasObtenidas?.length || 0,
        page,
        pageSize: itemsPerPage,
        totalPages: Math.max(
          1,
          Math.ceil((reservasObtenidas?.length || 0) / itemsPerPage)
        ),
      };

      setPaginationMeta(finalMeta);
      setCurrentPage(finalMeta.page || page);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));

    setUserRole(datosUsuario.role[0]);
    setTokenUrl(datosUsuario.accessToken);
  }, []);

  // Cargar página 1 al obtener el rol
  useEffect(() => {
    if (userRole) {
      cargarReservas(1, {});
    }
  }, [userRole]);

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
              width: index === 11 ? "150px" : "100%",
            }}
          ></div>
        </td>
      ))}
    </tr>
  );

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros = async () => {
    const texto = filtros.texto.trim();
    const filtrosNuevos = {
      tipo: filtros.tipo,
      texto: filtros.tipo === "codigo" ? texto.toUpperCase() : texto,
      estado: filtros.estado,
      desde: filtros.desde,
      hasta: filtros.hasta,
    };
    setFiltros(filtrosNuevos);
    setFiltrosAplicados(filtrosNuevos);
    setCurrentPage(1);
    await cargarReservas(1, filtrosNuevos);
  };

  const limpiarFiltros = async () => {
    const filtrosVacios = {
      tipo: "codigo",
      texto: "",
      estado: "todos",
      desde: "",
      hasta: "",
    };
    setFiltros(filtrosVacios);
    setFiltrosAplicados({});
    setCurrentPage(1);
    await cargarReservas(1, {});
  };

  // Calcular la suma total de "Valor a pagar"
  const totalAmount = Array.isArray(reservas)
    ? reservas.reduce((acc, reserva) => {
        return reserva.status != "4" ? acc + (reserva.total || 0) : acc;
      }, 0)
    : 0;

  const totalAmountToDisplay = Number(
    paginationMeta?.sumaTotalesNoCanceladas ?? totalAmount
  );

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "$$$";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const effectiveTotalPages = Math.max(
    1,
    Math.ceil((paginationMeta.total || 0) / (paginationMeta.pageSize || itemsPerPage))
  );

  // Filtrar solo reservas válidas con estructura completa antes de renderizar
  const paginatedReservas = Array.isArray(reservas)
    ? reservas.filter(
        (dato) =>
          dato &&
          dato.reservation &&
          dato.reservation.checkin &&
          dato.reservation.checkout
      )
    : [];

  // Si el servidor devuelve una página vacía fuera del rango, volver a la última válida
  useEffect(() => {
    if (
      paginatedReservas.length === 0 &&
      currentPage > 1 &&
      effectiveTotalPages > 0 &&
      currentPage > effectiveTotalPages &&
      userRole
    ) {
      setCurrentPage(effectiveTotalPages);
      cargarReservas(effectiveTotalPages);
    }
  }, [paginatedReservas, currentPage, effectiveTotalPages, userRole]);

  const pageNumbers = [...Array(effectiveTotalPages).keys()].map((i) => i + 1);

  const totalReservations = paginationMeta.total || 0;

  // Cambio de página (lazy loading, siempre con los filtros aplicados)
  const paginate = (pageNumber) => {
    if (!userRole) return;
    if (pageNumber < 1) return;
    if (pageNumber > effectiveTotalPages && pageNumber > 10) return;

    setCurrentPage(pageNumber);
    cargarReservas(pageNumber);
  };

  const placeholderPorTipo =
    filtros.tipo === "codigo"
      ? "Ingrese el código de reserva..."
      : filtros.tipo === "huesped"
      ? "Ingrese el nombre del huésped..."
      : filtros.tipo === "agente"
      ? "Ingrese el nombre del agente..."
      : filtros.tipo === "hotel"
      ? "Ingrese el nombre del hotel..."
      : filtros.tipo === "agencia"
      ? "Ingrese el nombre de la agencia..."
      : "Ingrese el término de búsqueda...";

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
      <h1 className={styles.pageTitle}>Consultar mis reservas</h1>
      <br />

      {/* Toolbar compacta de filtros combinables */}
      <div className={styles.toolbar}>
        <select
          value={filtros.tipo}
          onChange={(e) => handleFiltroChange("tipo", e.target.value)}
          className={styles.toolSelect}
          title="Tipo de búsqueda"
        >
          <option value="codigo">Código de reserva</option>
          <option value="huesped">Nombre de huésped</option>
          <option value="agente">Nombre de agente</option>
          <option value="hotel">Hotel</option>
          <option value="agencia">Agencia</option>
        </select>

        <input
          type="text"
          placeholder={placeholderPorTipo}
          value={filtros.texto}
          onChange={(e) => handleFiltroChange("texto", e.target.value)}
          className={styles.toolInput}
          maxLength={filtros.tipo === "codigo" ? 10 : undefined}
          style={filtros.tipo === "codigo" ? { textTransform: "uppercase" } : {}}
        />

        <input
          type="date"
          value={filtros.desde}
          onChange={(e) => handleFiltroChange("desde", e.target.value)}
          className={styles.toolDate}
          title="Desde (check-in)"
        />

        <input
          type="date"
          value={filtros.hasta}
          onChange={(e) => handleFiltroChange("hasta", e.target.value)}
          className={styles.toolDate}
          title="Hasta (check-in)"
        />

        <select
          value={filtros.estado}
          onChange={(e) => handleFiltroChange("estado", e.target.value)}
          className={styles.toolSelect}
          title="Estado de pago"
        >
          {estadosPago.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={aplicarFiltros}
          className={styles.toolBuscar}
          disabled={isLoading}
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>

        <button
          type="button"
          onClick={limpiarFiltros}
          className={styles.toolLimpiar}
          disabled={isLoading}
          title="Limpiar filtros"
        >
          Limpiar
        </button>
      </div>

      <div className={styles.tableScroll}>
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

            // Mostrar skeleton loader del tamaño de la página
            [...Array(paginationMeta.pageSize || itemsPerPage)].map((_, index) => (
              <SkeletonRow key={index} />
            ))
          ) : paginatedReservas.length === 0 ? (
            <tr>
              <td colSpan="12" style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ fontSize: "1.1rem", color: "#666" }}>
                  No se encontraron reservas con los criterios de búsqueda especificados.
                </p>
              </td>
            </tr>
          ) : (
            <>
              {paginatedReservas.map((dato, index) => (
                <tr key={dato._id || dato.reservaChatbotId || index}>
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
                    ) : dato.status == "6" ? (
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
                      ) : dato.status == "6" ? (
                        `${formatCurrency(dato.total)} USD`
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
                      ) : dato.status == "6" ? (
                        `${formatCurrency(dato.total)} COP`
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
                    ) : dato.status == "6" ? (
                      <span className={`${styles.status} ${styles.aboned}`}>
                        Reserva abonada
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
                  {dato?.vuelo &&
                    ((Array.isArray(dato.vuelo) && dato.vuelo.length > 0) ||
                      (typeof dato.vuelo === "object" &&
                        !Array.isArray(dato.vuelo) &&
                        Object.keys(dato.vuelo).length > 0)) && (
                          <span
                          title="Esta reserva tiene vuelos"
                      aria-label="Reserva con vuelos"
                      style={{ marginRight: "5px", display: "inline-flex", alignItems: "center",  }}
                    >
                      <img
                        src="https://images.icon-icons.com/2070/PNG/512/airplane_icon_126136.png"
                        alt="Reserva con vuelos"
                        style={{
                          width: "25px",
                          height: "25px",
                          objectFit: "cover",
                        }}
                      />
                    </span>
                  )}
                  </td>
                </tr>
              ))}

              {/*----------------------- Fila para el total ---------------------------*/}

              <tr className={styles.totalRow}>
                <td colSpan="1" style={{ textAlign: "left", fontWeight: "bold" }}>
                  Total de reservas realizadas:
                </td>

                <td style={{ fontWeight: "bold" }}>{totalReservations}</td>
                <td colSpan="7" style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total:
                </td>
                <td style={{ fontWeight: "bold" }}>
                  {formatCurrency(totalAmountToDisplay)}
                </td>
                <td colSpan="2"></td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      </div>

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

                number === effectiveTotalPages || // Siempre muestra la última página
                (number >= currentPage - 2 && number <= currentPage + 2) // Muestra un rango de 5 páginas alrededor de la actual
            )
            .map((number, index, filtered) => (
              <React.Fragment key={number}>
                {/* Agrega "..." para indicar páginas omitidas */}
                {index > 0 && filtered[index - 1] + 1 !== number && (
                  <span className={styles.ellipsis}>
                    ...
                  </span>
                )}
                <button
                  onClick={() => paginate(number)}
                  className={`${styles.pageItem} ${
                    currentPage === number ? styles.active : ""
                  }`}
                >
                  {number}
                </button>
              </React.Fragment>
            ))}

          <button
            onClick={() => paginate(currentPage + 1)}

            disabled={currentPage === effectiveTotalPages}
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
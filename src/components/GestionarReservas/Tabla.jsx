import React, { useEffect, useState, useCallback } from "react";
import styles from "./styles/tabla.module.css";
  import { getReservas, reservasNano, buscarReservaPorCodigo, buscarReservaPorHuesped, buscarReservaPorAgente, buscarReservaPorHotel } from "../../stores/disponibilidad";
import { format } from "@formkit/tempo";

const Tabla = () => {
  const [reservas, setReservas] = useState([]);
  const [tokenUrl, setTokenUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("codigo"); // Tipo de búsqueda: "codigo", "agente", "huesped", "hotel"
  const [filteredReservas, setFilteredReservas] = useState([]); //Filtro por agencia, hotel, huésped o código
  const [currentPage, setCurrentPage] = useState(1); // Página actual (servidor)
  const [itemsPerPage] = useState(15); // Máximo 15 reservas por página
  const [selectedStatus, setselectedStatus] = useState("all"); //Filtro por estado
  const [isLoading, setIsLoading] = useState(true);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 15,
    totalPages: 1,
  });
  const [userRole, setUserRole] = useState(null);
  const [hasActiveSearch, setHasActiveSearch] = useState(false); // Indica si hay una búsqueda activa
  const [searchCache, setSearchCache] = useState(new Map()); // Caché local: { page: [reservas] }
  const [currentSearchTerm, setCurrentSearchTerm] = useState(""); // Término de búsqueda actual
  const [currentSearchType, setCurrentSearchType] = useState(""); // Tipo de búsqueda actual

  useEffect(() => {
    const datosUsuario = JSON.parse(localStorage.getItem("datosUsuario"));
    setUserRole(datosUsuario.role[0]);
    setTokenUrl(datosUsuario.accessToken);
    
    // Intentar restaurar el estado de la página desde sessionStorage
    const savedPage = sessionStorage.getItem('reservasCurrentPage');
    const savedSearchTerm = sessionStorage.getItem('reservasSearchTerm');
    const savedSearchType = sessionStorage.getItem('reservasSearchType');
    const savedHasSearch = sessionStorage.getItem('reservasHasActiveSearch') === 'true';
    
    if (savedHasSearch && savedSearchTerm && savedSearchType) {
      // Si había una búsqueda activa, restaurarla y cargar la página guardada
      setSearchTerm(savedSearchTerm);
      setSearchType(savedSearchType);
      setCurrentSearchTerm(savedSearchTerm);
      setCurrentSearchType(savedSearchType);
      setHasActiveSearch(true);
      const pageToLoad = savedPage ? parseInt(savedPage) : 1;
      setCurrentPage(pageToLoad);
      
      // Cargar la página de búsqueda guardada
      setIsLoading(true);
      const loadSavedSearch = async () => {
        try {
          let result;
          if (savedSearchType === "codigo") {
            result = await buscarReservaPorCodigo(savedSearchTerm, pageToLoad);
          } else if (savedSearchType === "huesped") {
            result = await buscarReservaPorHuesped(savedSearchTerm, pageToLoad);
          } else if (savedSearchType === "agente") {
            result = await buscarReservaPorAgente(savedSearchTerm, pageToLoad);
          } else if (savedSearchType === "hotel") {
            result = await buscarReservaPorHotel(savedSearchTerm, pageToLoad);
          }
          
          if (result) {
            const reservasArray = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
            const newCache = new Map();
            newCache.set(pageToLoad, reservasArray);
            setSearchCache(newCache);
            setReservas(reservasArray);
            setFilteredReservas(reservasArray);
            if (result.meta) {
              setPaginationMeta(result.meta);
            }
          }
        } catch (error) {
          console.error("Error al restaurar búsqueda:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadSavedSearch();
    } else {
      // Si no hay búsqueda activa, cargar la página guardada o la página 1
      const pageToLoad = savedPage ? parseInt(savedPage) : 1;
      setCurrentPage(pageToLoad);
      ObtenerReservas(datosUsuario.role[0], pageToLoad);
    }
  }, []);
  
  // Guardar el estado de la página en sessionStorage cuando cambia
  useEffect(() => {
    if (currentPage && !hasActiveSearch) {
      sessionStorage.setItem('reservasCurrentPage', currentPage.toString());
    }
  }, [currentPage, hasActiveSearch]);
  
  // Guardar el estado de búsqueda en sessionStorage
  useEffect(() => {
    if (hasActiveSearch && currentSearchTerm) {
      sessionStorage.setItem('reservasSearchTerm', currentSearchTerm);
      sessionStorage.setItem('reservasSearchType', currentSearchType);
      sessionStorage.setItem('reservasHasActiveSearch', 'true');
      sessionStorage.setItem('reservasCurrentPage', currentPage.toString());
    } else {
      sessionStorage.removeItem('reservasSearchTerm');
      sessionStorage.removeItem('reservasSearchType');
      sessionStorage.removeItem('reservasHasActiveSearch');
    }
  }, [hasActiveSearch, currentSearchTerm, currentSearchType, currentPage]);

  // Función reutilizable para ejecutar la búsqueda (usando useCallback para evitar recreaciones)
  const ejecutarBusqueda = useCallback(async (termino, tipo) => {
    if (!termino.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Limpiar caché cuando se hace una nueva búsqueda
      setSearchCache(new Map());
      setCurrentSearchTerm(termino.trim());
      setCurrentSearchType(tipo);
      setCurrentPage(1);

      let result;
      if (tipo === "codigo") {
        // Búsqueda por código de reserva - Lazy loading (solo página 1)
        result = await buscarReservaPorCodigo(termino.trim(), 1);
      } else if (tipo === "huesped") {
        // Búsqueda por nombre de huésped - Lazy loading (solo página 1)
        result = await buscarReservaPorHuesped(termino.trim(), 1);
      } else if (tipo === "agente") {
        // Búsqueda por nombre de agente - Lazy loading (solo página 1)
        result = await buscarReservaPorAgente(termino.trim(), 1);
      } else if (tipo === "hotel") {
        // Búsqueda por nombre de hotel - Lazy loading (solo página 1)
        result = await buscarReservaPorHotel(termino.trim(), 1);
      } else {
        setIsLoading(false);
        return;
      }

      // Procesar resultado y filtrar solo objetos válidos con estructura completa
      let reservasArray = [];
      if (Array.isArray(result.data)) {
        reservasArray = result.data.filter(dato => dato && dato.reservation && dato.reservation.checkin && dato.reservation.checkout);
      } else if (result.data && result.data.reservation && result.data.reservation.checkin && result.data.reservation.checkout) {
        reservasArray = [result.data];
      }
      
      // Guardar en caché local
      const newCache = new Map();
      newCache.set(1, reservasArray);
      setSearchCache(newCache);
      
      setReservas(reservasArray);
      setFilteredReservas(reservasArray);
      setHasActiveSearch(true);
      
      // Actualizar metadata usando el total del servidor (no solo las reservas de la primera página)
      if (result.meta) {
        const totalFromServer = result.meta.total || 0;
        const pageSizeFromServer = result.meta.pageSize || 15;
        setPaginationMeta({
          ...result.meta,
          total: totalFromServer, // Usar el total del servidor, no solo las reservas de la página actual
          totalPages: Math.max(1, Math.ceil(totalFromServer / pageSizeFromServer))
        });
      } else {
        // Fallback: si no hay metadata, usar el número de reservas de la primera página
        setPaginationMeta({
          total: reservasArray.length,
          page: 1,
          pageSize: 15,
          totalPages: Math.max(1, Math.ceil(reservasArray.length / 15))
        });
      }
      setCurrentPage(1);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setReservas([]);
      setFilteredReservas([]);
      setHasActiveSearch(false);
      setPaginationMeta({
        total: 0,
        page: 1,
        pageSize: 15,
        totalPages: 1
      });
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, []); // Sin dependencias ya que usa funciones estables

  // useEffect para búsqueda automática con debounce (2.5 segundos)
  // NOTA: La búsqueda por hotel NO tiene debounce automático, solo se ejecuta al presionar el botón
  useEffect(() => {
    // Si no hay término de búsqueda, no hacer nada
    if (!searchTerm.trim()) {
      // Si se limpia el campo y había una búsqueda activa, recargar todas las reservas
      if (hasActiveSearch && userRole) {
        setHasActiveSearch(false);
        setCurrentSearchTerm("");
        setCurrentSearchType("");
        setSearchCache(new Map());
        setCurrentPage(1);
        ObtenerReservas(userRole, 1);
      }
      return;
    }

    // Si no hay tipo de búsqueda válido, no hacer nada
    if (!searchType || (searchType !== "codigo" && searchType !== "huesped" && searchType !== "agente" && searchType !== "hotel")) {
      return;
    }

    // Desactivar debounce automático para búsqueda por hotel
    // La búsqueda por hotel solo se ejecuta cuando el usuario presiona el botón "Buscar"
    if (searchType === "hotel") {
      return;
    }

    // Configurar el timeout de 2.5 segundos solo para otros tipos de búsqueda
    const debounceTimer = setTimeout(() => {
      ejecutarBusqueda(searchTerm, searchType);
    }, 2500); // 2.5 segundos de delay

    // Limpiar el timeout si el usuario sigue escribiendo o cambia el tipo
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, searchType, ejecutarBusqueda, hasActiveSearch, userRole]); // Dependencias del useEffect

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

  const ObtenerReservas = async (role, page = 1) => {
    setIsLoading(true);
    try {
      const { data, meta } = await getReservas(role, page, itemsPerPage);
      const reservasObtenidas = data ?? reservasNano.get();
      
      setReservas(reservasObtenidas);
      setFilteredReservas(reservasObtenidas); // Inicializar reservas filtradas
      
      // Si meta viene del servidor, usarla; si no, calcular fallback
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
      
      // Mostrar información de la página actual
      console.log(`Página ${finalMeta.page || page} de ${finalMeta.totalPages || 1} - ${reservasObtenidas?.length || 0} reservas`);
    } finally {
      setIsLoading(false);
    }
  };
  console.log("Reservas filtradas:", filteredReservas);
  // Calcular la suma total de "Valor a pagar"
  // Asegurarse de que filteredReservas sea un array antes de usar reduce
  const totalAmount = Array.isArray(filteredReservas) 
    ? filteredReservas.reduce((acc, reserva) => {
        return reserva.status != "4" ? acc + (reserva.total || 0) : acc;
      }, 0)
    : 0;

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "$$$";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
    // Limpiar búsqueda cuando cambia el tipo, pero NO hacer consulta automática
    setSearchTerm("");
    // Limpiar el estado de búsqueda activa
    setHasActiveSearch(false);
    setCurrentSearchTerm("");
    setCurrentSearchType("");
    setSearchCache(new Map());
    // NO hacer consulta al endpoint hasta que el usuario presione el botón de buscar
  };

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    // Si el tipo de búsqueda es "codigo", forzar mayúsculas
    if (searchType === "codigo") {
      setSearchTerm(value.toUpperCase());
    } else {
      setSearchTerm(value);
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, recargar todas las reservas
      if (userRole) {
        setHasActiveSearch(false);
        setCurrentSearchTerm("");
        setCurrentSearchType("");
        setSearchCache(new Map());
        setCurrentPage(1);
        ObtenerReservas(userRole, 1);
      }
      return;
    }

    // Si el usuario presiona el botón, ejecutar búsqueda inmediata (sin esperar el debounce)
    await ejecutarBusqueda(searchTerm, searchType);
  };

  // Función para cargar una página específica cuando el usuario navega (lazy loading)
  const cargarPaginaBusqueda = async (pageNumber) => {
    if (!currentSearchTerm || !currentSearchType) return;
    
    // Verificar si la página ya está en caché
    if (searchCache.has(pageNumber)) {
      const cachedReservas = searchCache.get(pageNumber);
      setFilteredReservas(cachedReservas);
      setCurrentPage(pageNumber);
      return;
    }
    
    // Si no está en caché, cargarla del servidor
    setIsLoading(true);
    try {
      let result;
      if (currentSearchType === "codigo") {
        result = await buscarReservaPorCodigo(currentSearchTerm, pageNumber);
      } else if (currentSearchType === "huesped") {
        result = await buscarReservaPorHuesped(currentSearchTerm, pageNumber);
      } else if (currentSearchType === "agente") {
        result = await buscarReservaPorAgente(currentSearchTerm, pageNumber);
      } else if (currentSearchType === "hotel") {
        result = await buscarReservaPorHotel(currentSearchTerm, pageNumber);
      } else {
        setIsLoading(false);
        return;
      }

      const reservasArray = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
      
      // Guardar en caché
      const newCache = new Map(searchCache);
      newCache.set(pageNumber, reservasArray);
      setSearchCache(newCache);
      
      setFilteredReservas(reservasArray);
      if (result.meta) {
        setPaginationMeta(result.meta);
      }
      setCurrentPage(pageNumber);
    } catch (error) {
      console.error("Error al cargar página:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setCurrentSearchTerm("");
    setCurrentSearchType("");
    setSearchCache(new Map());
    setHasActiveSearch(false);
    if (userRole) {
      setCurrentPage(1);
      ObtenerReservas(userRole, 1);
    }
  };

  const applyFilters = (searchTerm = "", status = "all") => {
    // Si no hay filtros activos, recargar desde el servidor
    const hasFilters = !!(searchTerm || status !== "all");
    
    if (!hasFilters && userRole) {
      // Limpiar filtros: volver a cargar página 1 del servidor
      setCurrentPage(1);
      ObtenerReservas(userRole, 1);
      return;
    }

    // Aplicar filtros del cliente sobre las reservas actuales
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

    setFilteredReservas(filtered);
    setCurrentPage(1);
  };

  //Filtro por estado

  const handleStatusFilter = (status) => {
    setselectedStatus(status);
    applyFilters(searchTerm, status);
  };

  const isUsingFilters = !!(
    searchTerm ||
    selectedStatus !== "all"
  );
  
  // Determinar si debemos usar paginación del cliente
  // NOTA: Con lazy loading, las búsquedas usan paginación del servidor, no del cliente
  const useClientPagination = !hasActiveSearch && isUsingFilters;
  
  // Cuando hay búsqueda activa, usar metadata del servidor
  // Cuando hay filtros locales (sin búsqueda), usar datos del cliente
  // Cuando no hay filtros, usar paginación del servidor
  const totalReservations = hasActiveSearch
    ? (paginationMeta.total || 0)
    : useClientPagination
    ? (Array.isArray(filteredReservas) ? filteredReservas.length : 0)
    : paginationMeta.total || 0;
  
  // Calcular totalPages basándose en el total del servidor o del cliente
  const calculateEffectiveTotalPages = () => {
    // Si hay búsqueda activa, usar metadata del servidor (lazy loading)
    if (hasActiveSearch) {
      const total = paginationMeta.total || 0;
      const pageSize = paginationMeta.pageSize || itemsPerPage;
      return Math.max(1, Math.ceil(total / pageSize));
    }
    
    // Si hay filtros locales (sin búsqueda), usar paginación del cliente
    if (useClientPagination) {
      const filteredLength = Array.isArray(filteredReservas) ? filteredReservas.length : 0;
      return Math.max(
        1,
        Math.ceil(
          filteredLength / itemsPerPage
        )
      );
    }
    
    // Sin filtros: recalcular totalPages basándose en el total que viene del servidor
    const total = paginationMeta.total || 0;
    const pageSize = paginationMeta.pageSize || itemsPerPage;
    const calculatedTotalPages = Math.max(1, Math.ceil(total / pageSize));
    
    return calculatedTotalPages;
  };
  
  const effectiveTotalPages = calculateEffectiveTotalPages();
  
  // Con lazy loading, filteredReservas ya contiene solo la página actual para búsquedas
  // Para filtros locales, necesitamos paginar del lado del cliente
  const getPaginatedReservas = () => {
    // Si hay búsqueda activa, filteredReservas ya está paginado por el servidor
    if (hasActiveSearch) {
      return filteredReservas;
    }
    
    // Si hay filtros locales, paginar del lado del cliente
    if (useClientPagination && Array.isArray(filteredReservas)) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredReservas.slice(startIndex, endIndex);
    }
    
    // Sin filtros ni búsqueda, usar directamente filteredReservas
    return filteredReservas;
  };
  
  const paginatedReservasRaw = getPaginatedReservas();
  
  // Filtrar solo reservas válidas con estructura completa antes de renderizar
  const paginatedReservas = Array.isArray(paginatedReservasRaw) 
    ? paginatedReservasRaw.filter(dato => 
        dato && 
        dato.reservation && 
        dato.reservation.checkin && 
        dato.reservation.checkout
      )
    : [];
  
  // Efecto para manejar cuando el servidor devuelve datos vacíos en una página inválida
  useEffect(() => {
    const filteredLength = Array.isArray(filteredReservas) ? filteredReservas.length : 0;
    if (!useClientPagination && filteredLength === 0 && currentPage > effectiveTotalPages && effectiveTotalPages > 0 && userRole) {
      setCurrentPage(effectiveTotalPages);
      ObtenerReservas(userRole, effectiveTotalPages);
    }
  }, [filteredReservas, currentPage, effectiveTotalPages, useClientPagination, userRole]);
  
  const pageNumbers = [...Array(effectiveTotalPages).keys()].map((i) => i + 1);

  // Cambio de página
  const paginate = (pageNumber) => {
    if (!userRole) return;
    
    // Si hay búsqueda activa, usar lazy loading (cargar página del servidor)
    if (hasActiveSearch && currentSearchTerm) {
      if (pageNumber < 1 || pageNumber > effectiveTotalPages) return;
      cargarPaginaBusqueda(pageNumber);
      return;
    }
    
    // Si hay filtros locales (pero no búsqueda), usar paginación del cliente
    if (useClientPagination) {
      if (pageNumber < 1 || pageNumber > effectiveTotalPages) return;
      setCurrentPage(pageNumber);
      // Con filtros locales, no necesitamos hacer petición al servidor
      return;
    }
    
    // Si no hay filtros ni búsqueda, usar paginación del servidor normal
    if (pageNumber < 1) return;
    
    // Si intentamos ir más allá de lo que el servidor dice, intentar de todas formas
    // pero solo hasta un límite razonable (por ejemplo, 10 páginas)
    if (pageNumber > effectiveTotalPages && pageNumber > 10) {
      return;
    }
    
    setCurrentPage(pageNumber);
    ObtenerReservas(userRole, pageNumber);
  };

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
      {/* Filtro de búsqueda con selector de tipo */}
      <form onSubmit={handleSearchSubmit} className={styles.filters}>
        <select
          value={searchType}
          onChange={handleSearchTypeChange}
          className={styles.searchTypeSelect}
        >
          <option value="codigo">Código de reserva</option>
          <option value="huesped">Nombre de huésped</option>
          <option value="agente">Nombre de agente</option>
          <option value="hotel">Hotel</option>
          {/* Se agregarán más opciones cuando se proporcionen los endpoints */}
        </select>
        <input
          type="text"
          placeholder={
            searchType === "codigo"
              ? "Ingrese el código de reserva..."
              : searchType === "huesped"
              ? "Ingrese el nombre del huésped..."
              : searchType === "agente"
              ? "Ingrese el nombre del agente..."
              : searchType === "hotel"
              ? "Ingrese el nombre del hotel..."
              : "Ingrese el término de búsqueda..."
          }
          value={searchTerm}
          onChange={handleSearchInputChange}
          className={styles.searchInput}
        />
        <button
          type="submit"
          className={styles.searchButton}
          disabled={isLoading}
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={handleSearchClear}
            className={styles.clearSearchButton}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </form>
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
                <td style={{ fontWeight: "bold" }}>{totalReservations}</td>
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
                number === effectiveTotalPages || // Siempre muestra la última página
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

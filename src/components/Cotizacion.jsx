import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, ChevronDown } from 'lucide-react';
import '/public/styles/Cotizacion.css';
import Swal from 'sweetalert2';
import { format } from '@formkit/tempo';
import Cookies from 'js-cookie';
import { refreshToken } from '../stores/authtoken';
import { Tooltip } from 'react-tooltip';
import FormularioRetenciones from './desglose/FormularioRetenciones';
import VueloCotizacionDetalle from './VueloCotizacionDetalle';
import {
  tieneVueloEnCotizacion,
  parsePrecioVueloPaquete,
  buildVueloArrayParaCotizacion,
  getOrigenIataCotizacion,
  generarHtmlVueloCotizacion,
} from '../utils/vueloCotizacion';
import { esModoBusquedaVueloHotel, limpiarDatosPaqueteVuelo } from '../utils/flightSearch';
import { getHotelImagesById } from '../utils/hotelesImagenes';

// Función para obtener el nombre del hotel basado en el ID
const nombreHotelId = (hotelId) => {
  const hotelMap = {
    // Hoteles Cartagena
    1: "Hotel Azuan", // Hotel Azuan Suites
    4: "Hotel Aixo", // Hotel Aixo Suites
    5: "Hotel Abi", // Hotel Abi Inn
    6: "Hotel Avexi", // Hotel Avexi Suites
    7: "Hotel Bocagrande", // Hotel Bocagrande Suites
    9: "Hotel Marina", // Hotel Marina Suites
    56: "Hotel Boquilla", // Hotel Boquilla Suites
    // Hoteles Santa Marta
    8: "Hotel Rodadero", // Hotel Rodadero 
    2: "Hotel 1525", // Hotel 1525
    48: "Hotel Axis", // Hotel Axis Inn
    44: "Hotel Sansiraka", // Hotel Sansiraka Inn
    123: "Playa Salguero Hotel", // Hotel Playa Salguero

    // Hoteles Bogota
    10: "Hotel Windsor", // Hotel Windsor
    3: "Hotel Madisson", // Hotel Madisson

  };

  return hotelMap[hotelId] || "Hotel no encontrado";
};

// Función para obtener la dirección del hotel basado en el ID
const direccionHotelId = (hotelId) => {
  const direccionMap = {
    // Hoteles Cartagena
    1: "Cra. 3 #8-156, Cartagena de Indias, Provincia de Cartagena, Bolívar", // Hotel Azuan
    4: "Cra. 1 #47-10, Marbella, Cartagena de Indias, Provincia de Cartagena, Bolívar", // Hotel Aixo
    5: "Cra. 1 #42-70, Barrio El Cabrero, Cartagena de Indias, Provincia de Cartagena, Bolívar ", // Hotel Abi
    6: "Cra. 3 #No 4 -86, Cartagena de Indias, Provincia de Cartagena, Bolívar", // Hotel Avexi
    7: "Cra. 2 #7-159, Cartagena de Indias, Provincia de Cartagena, Bolívar", // Hotel Bocagrande
    9: "Cra. 3 #4 - 32, Cartagena de Indias, Provincia de Cartagena, Bolívar", // Hotel Marina
    56: "Cra. 9 #38 - 76, La Boquilla, Provincia de Cartagena, Bolívar", // Hotel Boquilla
    // Hoteles Santa Marta
    8: "Cl. 20 #1B-64, Santa Marta, Gaira, Santa Marta, Magdalena", // Hotel Rodadero
    2: "Calle 11 # 2 - 29 Centro Histórico, Santa Marta, Magdalena", // Hotel 1525
    48: "Cra. 3 #10-14, El Rodadero, Gaira, Santa Marta, Magdalena", // Hotel Axis
    44: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena", // Hotel Sansiraka
    123: "CRA 4 N° 23F05 Gaira, 470002", // Playa Salguero Hotel
    // Hoteles Bogotá
    10: "Chapinero, Calle 95 #9-97, Bogotá, Colombia", // Hotel Windsor
    3: "Cra 18 #93 - 97, Barrio el Chico, Bogotá, Colombia", // Hotel Madisson
  };

  return direccionMap[hotelId] || "Dirección no disponible";
};

const HOTELES_EXENTOS_IVA = new Set([56, 123]);

const etiquetaTrasladoDesdeTipo = (tipo) => {
  if (tipo === "aeropuerto_hotel") return "Aeropuerto al hotel";
  if (tipo === "hotel_aeropuerto") return "Hotel al aeropuerto";
  if (tipo === "ambos") return "Aeropuerto al hotel | Hotel al aeropuerto";
  return tipo ? String(tipo) : "";
};

const textoTrasladoDesdeInfoTransporte = (info) => {
  if (!info) return null;
  if (info.tipo) {
    const porTipo = etiquetaTrasladoDesdeTipo(info.tipo);
    return porTipo || "Incluido";
  }
  const tr = info.tipoRecogida;
  if (tr === 0) return "Aeropuerto al hotel";
  if (tr === 1) return "Hotel al aeropuerto";
  if (tr === 2) return "Aeropuerto al hotel | Hotel al aeropuerto";
  return "Incluido";
};


export default function ReservaHotelComponent() {
  const [markup, setMarkup] = useState('');
  const [showReservaIncluye, setShowReservaIncluye] = useState(false);
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [datosReserva, setDatosReserva] = useState();
  const [agencia, setAgencia] = useState();
  const [fechasreserva, setFechasreserva] = useState();
  const [cantadultos, setCantadultos] = useState();
  const [cantninos, setCantninos] = useState();
  const [botondesactivado, setBotondesactivado] = useState(false);
  const [logoAgencia, setLogoAgencia] = useState();
  const [huespedExtranjero, setHuespedExtranjero] = useState(false);
  const [policiesText, setPoliciesText] = useState("");
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [RetencionesPorcentaje, setRetencionesPorcentaje] = useState(null);
  const [DatosRetenciones, setDatosRetenciones] = useState(null);
  const [divisaSelec, setdivisaSelec] = useState("COP");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!esModoBusquedaVueloHotel()) {
      limpiarDatosPaqueteVuelo();
    }

    const divisa = localStorage.getItem("selectedCurrency");
    setdivisaSelec(divisa);
    const datosDelUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
    const datareserva = JSON.parse(localStorage.getItem('datosreserva'));
    const adultos = JSON.parse(localStorage.getItem('cantAdultos'));
    const ninos = JSON.parse(localStorage.getItem('cantNinos'));
    const fechas = JSON.parse(localStorage.getItem('nochesyedades'));
    const token = JSON.parse(localStorage.getItem('datosUsuario'));
    setLogoAgencia(datosDelUsuario);
    setDatosReserva(datareserva);
    setCantadultos(adultos);
    setCantninos(ninos);
    setFechasreserva(fechas);
    setAgencia(token);
  }, []);

  // Estados para el formulario de datos del huésped
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    nombreCompleto: '',
    apellidos: '',
    fechaNacimiento: '',
    email: '',
    celular: ''
  });
  const tiposDocumentoMap = {
    cedulaC: 'CC',
    cedulaE: 'CE',
    pasaporte: 'PA',
    nit: 'NIT',
    otro: 'CC',
    CC: 'CC',
    CE: 'CE',
    PA: 'PA',
    NIT: 'NIT',
  };

  const normalizarTipoDocumento = (tipoDocumento = '') => {
    return tiposDocumentoMap[tipoDocumento] || tipoDocumento;
  };

  // Calcular totales basados en los datos de las habitaciones
  const subtotal = datosReserva ? datosReserva.reduce((sum, data) => sum + (data.precio || 0), 0) : 0;
  const hotelExentoIVA = HOTELES_EXENTOS_IVA.has(datosReserva?.[0]?.hotelidAutocore);
  const exentoIva = huespedExtranjero === true || hotelExentoIVA;
  const iva = exentoIva ? 0 : (Math.round(subtotal * 0.19) || 0);
  const total = subtotal + iva;
  const totalConIVA = total; // Para compatibilidad con TablaDesglose y FormularioRetenciones

  // Calcular retenciones
  const totalRetencionesF = () => {
    if (DatosRetenciones == null) {
      return totalConIVA;
    } else {
      return (
        totalConIVA -
        (DatosRetenciones.calculo_rtf_fte +
          DatosRetenciones.calculo_rtf_ica +
          DatosRetenciones.calculo_rtf_iva)
      );
    }
  };

  // Las retenciones (porcentajes) y el vuelo (conversión por TRM) generan decimales:
  // se redondean a peso entero en COP y a 2 decimales en USD.
  const redondearMoneda = (valor) =>
    divisaSelec === "USD" ? Math.round(valor * 100) / 100 : Math.round(valor);

  const totalRetenciones = redondearMoneda(totalRetencionesF());

  const incluyeVuelo = tieneVueloEnCotizacion();
  const precioVuelo = redondearMoneda(
    incluyeVuelo ? parsePrecioVueloPaquete(divisaSelec, datosReserva) : 0
  );
  const baseCombinada = totalRetenciones + precioVuelo;

  // Calcular markup (admite coma o punto como separador decimal)
  const markupPorcentaje = parseFloat(String(markup).replace(',', '.')) || 0;
  const markupAmount = Math.round(baseCombinada * (markupPorcentaje / 100));
  const totalConMarkup = baseCombinada + markupAmount;
  const totalParaPost = Math.round(baseCombinada);
  const markupParaPost = Math.round(totalConMarkup);

  // Función para manejar los datos de retenciones
  const manejarDatos = (datosHijo, rtePorcentajes) => {
    setDatosRetenciones(datosHijo);
    setRetencionesPorcentaje(rtePorcentajes);
  };

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Función para hacer clic en el input de archivo
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Función fetchWithToken para manejar llamadas con token
  const fetchWithToken = async (url, options = {}) => {
    let token = Cookies.get('accessToken');
    
    const isFormData = options.body instanceof FormData;
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        
        if (!isFormData) {
          retryHeaders['Content-Type'] = 'application/json';
        }
        
        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    }
    return response;
  };

  // Función para manejar la carga de imagen
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/files/user-profile`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const data = await response.json();

      if (data.url) {
        setLogoAgencia({ ...logoAgencia, imageUrl: data.url });
        const updatedUserData = { ...logoAgencia, imageUrl: data.url };
        localStorage.setItem("datosUsuario", JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar la imagen.",
        icon: "error",
        confirmButtonColor: "#26547B",
      });
    }
  };

  //#region Obtener políticas de la agencia
  const obtenerPoliticasAgencia = async () => {
    const datosDelUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
    if (!datosDelUsuario?.agencia?._id) {
      return;
    }

    try {
      setPoliciesLoading(true);
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/agencias/${datosDelUsuario.agencia._id}/politicas`
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "No se pudieron obtener las políticas");
      }

      const data = await response.json();
      setPoliciesText(data.politicasAgencia || "");
    } catch (error) {
      console.error("Error obteniendo políticas:", error);
      setPoliciesText("");
    } finally {
      setPoliciesLoading(false);
    }
  };

  // useEffect para cargar las políticas cuando se monta el componente
  useEffect(() => {
    obtenerPoliticasAgencia();
  }, []);

  //#region Actualizar políticas de la agencia
  const handleUpdatePolicies = async () => {
    try {
      const response = await fetchWithToken(
        `${import.meta.env.PUBLIC_API_URL}/agencias/v1/auth/politicas-agencia`,
        {
          method: "PATCH",
          body: JSON.stringify({ politicasAgencia: policiesText }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "No se pudo actualizar las políticas");
      }

      await response.json().catch(() => ({}));

      Swal.fire({
        title: "¡Éxito!",
        text: "Políticas actualizadas correctamente.",
        icon: "success",
        confirmButtonColor: "#26547B",
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Error al actualizar las políticas.",
        icon: "error",
        confirmButtonColor: "#26547B",
      });
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      nombreCompleto,
      apellidos,
      email,
      celular,
    } = formData;

    if (
      tipoDocumento.trim() === '' ||
      numeroDocumento.trim() === '' ||
      fechaNacimiento.trim() === '' ||
      nombreCompleto.trim() === '' ||
      apellidos.trim() === '' ||
      email.trim() === '' ||
      celular.trim() === ''
    ) {
      Swal.fire({
        icon: "error",
        title: "Complete la información",
        text: "Todos los campos del titular son obligatorios",
        showConfirmButton: false,
        timer: 3500,
      });
      return;
    }

    // Validar markup - si está vacío o es 0, preguntar al usuario
    const markupPorcentaje = parseFloat(String(markup).replace(',', '.')) || 0;
    if (markupPorcentaje === 0 || markup.trim() === '') {
      Swal.fire({
        title: '¿Continuar sin markup?',
        text: 'No se ha ingresado un valor de markup. ¿Deseas continuar con la cotización sin aplicar markup?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          enviarCotizacion();
        }
      });
      return;
    }

    enviarCotizacion();
  };

  // Función para generar la descripción según el tipo de pensión
  const generarDescripcionPension = (planAlimentacion) => {
    const plan = planAlimentacion?.toLowerCase() || "";
    
    if (plan.includes("solo desayuno") || plan === "solodesayuno") {
      return "Incluye desayuno y servicios básicos";
    } else if (plan.includes("media pension") || plan === "mediapension") {
      return "Incluye desayuno y almuerzo o cena además de los servicios básicos";
    } else if (plan.includes("pension completa") || plan === "pensioncompleta") {
      return "Incluye desayuno, almuerzo y cena además de los servicios básicos";
    } else {
      // Por defecto, solo desayuno
      return "Incluye desayuno y servicios básicos";
    }
  };

  // Función para generar HTML dinámico con datos de la reserva
  const generarLandingHtml = () => {
    const hotelName = nombreHotelId(datosReserva[0]?.hotelidAutocore);
    const checkin = format(fechasreserva?.dateRange?.startDate, "YYYY-MM-DD", "es");
    const checkout = format(fechasreserva?.dateRange?.endDate, "YYYY-MM-DD", "es");
    const noches = datosReserva[0]?.nights || 1;
    const vueloArray = buildVueloArrayParaCotizacion();
    const precioVueloPdf = incluyeVuelo ? precioVuelo : 0;
    const baseCombinadaPdf = totalRetenciones + precioVueloPdf;
    const markupAmountPdf = Math.round(baseCombinadaPdf * (markupPorcentaje / 100));
    const totalConMarkupPdf = baseCombinadaPdf + markupAmountPdf;
    const precioPorNocheCalc = totalConMarkupPdf && noches > 0 ? (totalConMarkupPdf / noches) : 0;
    const totalSinIvaConMarkup = exentoIva ? totalConMarkupPdf : Math.round(totalConMarkupPdf / 1.19);
    const totalHuespedes = cantadultos + cantninos;
    const habitaciones = datosReserva.length;
    const precioPorNoche = datosReserva[0]?.precioBase || 0;
    const subtotalFormateado = subtotal.toLocaleString();
    const ivaFormateado = iva.toLocaleString();
    const totalFormateado = totalRetenciones.toLocaleString();
    const totalConMarkupFormateado = totalConMarkupPdf.toLocaleString();
    const precioVueloFormateado = precioVueloPdf.toLocaleString();
    const totalFormateadoPaquete = totalConMarkupPdf.toLocaleString();
    const htmlVuelo = generarHtmlVueloCotizacion(vueloArray, divisaSelec || "COP", datosReserva);
    const nombreCompleto = `${formData.nombreCompleto} ${formData.apellidos}`;
    const planAlimentacion = datosReserva[0]?.plandealimentacion || "Solo desayuno";
    const mascotas = datosReserva[0]?.mascotas || 0;
    const logoAgenciaUrl = logoAgencia?.imageUrl || "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg";
    const nombreAgencia = agencia?.agencia?.fullName || "Agencia de Viajes";
    const telefonoAgencia = logoAgencia?.telefono || "+57 3336025669";
    const emailCliente = formData.email;
    const telefonoCliente = formData.celular;
    const r0 = datosReserva[0] || {};
    const trasladoIncluido =
      r0.incluirTraslado === true && r0.tipoTraslado != null;
    const textoTrasladoPdf = trasladoIncluido
      ? etiquetaTrasladoDesdeTipo(r0.tipoTraslado) || "Traslado incluido"
      : null;
    const toursPdf = Array.isArray(r0.tourSeleccionado)
      ? r0.tourSeleccionado
          .map(
            (tour) =>
              (tour && (tour.title || tour.nombre || tour.titulo || "")) || ""
          )
          .map((s) => String(s).trim())
          .filter(Boolean)
      : [];
    const toursPdfHtml =
      toursPdf.length > 0
        ? toursPdf.map((n) => `<li><strong>Tour:</strong> ${n}</li>`).join("")
        : "";

        return `<!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reserva - ${hotelName}</title>
      <style>
          :root {
              --primary-color: #C5A065; /* Color dorado del diseño PDF */
              --primary-dark: #886b43;  /* Variación más oscura para textos */
              --text-dark: #333333;
              --text-light: #666666;
              --bg-light: #f9f9f9;
              --bg-accent: #fffbf0;
              --white: #ffffff;
          }

          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: var(--text-dark);
              margin: 0;
              padding: 0;
              background-color: var(--bg-light);
          }

          .container {
              max-width: 900px;
              margin: 20px auto;
              background-color: var(--white);
              box-shadow: 0 0 20px rgba(0,0,0,0.05);
              overflow: hidden;
          }

          /* --- HEADER & LOGO --- */
          header {
              background-color: var(--white);
              padding: 30px 40px;
              text-align: center;
              border-bottom: 4px solid var(--primary-color);
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .header-logo img {
              max-height: 80px;
              width: auto;
              margin-bottom: 15px;
          }

          h1 {
              color: var(--primary-color);
              margin: 0;
              font-size: 1.8rem;
              text-transform: uppercase;
              letter-spacing: 1px;
          }

          .hotel-name-sub {
              color: var(--text-light);
              font-size: 1.2rem;
              margin-top: 5px;
              font-weight: 300;
          }

          /* --- HERO & GREETING --- */
          .hero {
              padding: 25px 40px;
              text-align: center;
              background-color: var(--bg-accent);
              border-bottom: 1px dashed #ddd;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .tagline {
              font-style: italic;
              color: var(--primary-dark);
              margin-bottom: 10px;
          }

          .greeting-text {
              font-size: 1.05rem;
          }

          /* --- SECTIONS GENERAL --- */
          .section {
              padding: 10px 40px;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          h2 {
              color: var(--primary-color);
              font-size: 1.4rem;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-top: 30px;
              margin-bottom: 20px;
          }

          h3 {
              color: var(--primary-dark);
              font-size: 1.1rem;
              margin-top: 20px;
              margin-bottom: 10px;
          }

          /* --- RESERVATION DETAILS GRID --- */
          .reservation-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              background-color: var(--bg-light);
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid var(--primary-color);
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .detail-item label {
              display: block;
              font-size: 0.85rem;
              color: var(--primary-dark);
              font-weight: bold;
              text-transform: uppercase;
          }

          .detail-item span {
              display: block;
              font-size: 1rem;
              color: var(--text-dark);
              font-weight: 500;
          }

          /* --- GALLERY (Custom layout for 1 main + 2 side) --- */
          .gallery-container {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 8px; /* antes 10px */
              margin-top: 10px; /* antes 20px */
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .main-gallery-image img, 
          .gallery-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              border-radius: 4px;
          }

          .main-gallery-image {
              height: 240px; /* antes 320px */
          }

          .secondary-gallery-images {
              display: flex;
              flex-direction: column;
              gap: 8px; /* antes 10px */
              height: 240px; /* antes 320px */
          }

          .gallery-image {
              height: calc(50% - 5px);
          }

          /* --- ROOM CARDS --- */
          .room-card {
              background-color: var(--white);
              border: 1px solid #eee;
              border-left: 4px solid var(--primary-dark);
              padding: 16px; /* antes 20px */
              margin-bottom: 10px; /* antes 15px */
              box-shadow: 0 2px 5px rgba(0,0,0,0.03);
              border-radius: 0 5px 5px 0;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .room-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px dashed #ddd;
              padding-bottom: 10px;
              margin-bottom: 10px;
          }

          .room-price {
              font-weight: bold;
              color: var(--primary-color);
              font-size: 1.1rem;
          }

          /* --- LISTS --- */
          ul {
              list-style: none;
              padding: 0;
          }

          ul li {
              position: relative;
              padding-left: 25px;
              margin-bottom: 8px;
              color: var(--text-light);
          }

          ul li::before {
              content: "✓";
              color: var(--primary-color);
              position: absolute;
              left: 0;
              font-weight: bold;
          }

          /* --- PRICING TABLE LOOK --- */
          .pricing-box {
              background-color: var(--bg-light);
              padding: 16px; /* antes 20px */
              border-radius: 8px;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .price-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0; /* antes 10px */
              border-bottom: 1px solid #ddd;
          }

          .price-row.total {
              border-bottom: none;
              border-top: 2px solid var(--primary-color);
              margin-top: 10px;
              padding-top: 15px;
              font-size: 1.3rem;
              color: var(--primary-dark);
              font-weight: bold;
          }

          /* --- INFO BOX (Warning/Important) --- */
          .info-box {
              background-color: #fff3cd;
              color: #856404;
              padding: 12px; /* antes 15px */
              border-radius: 5px;
              margin: 14px 0; /* antes 20px */
              font-size: 0.9rem;
              border-left: 4px solid #ffeeba;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          /* --- VUELO (PDF) --- */
          .flight-section {
              padding: 12px 40px 8px;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .flight-section h2 {
              margin-top: 0;
              margin-bottom: 10px;
              padding-bottom: 8px;
          }

          .flight-box {
              border: 1px solid #e8dcc8;
              border-left: 4px solid var(--primary-color);
              border-radius: 8px;
              background: var(--bg-accent);
              padding: 12px 14px;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .flight-package--sep {
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #ddd;
          }

          .flight-meta {
              font-size: 0.8rem;
              color: var(--text-light);
              margin-bottom: 8px;
          }

          .flight-leg {
              display: flex;
              gap: 10px;
              align-items: flex-start;
              padding: 6px 0;
          }

          .flight-leg + .flight-leg {
              border-top: 1px dashed #e8dcc8;
          }

          .flight-leg-badge {
              flex-shrink: 0;
              min-width: 52px;
              text-align: center;
              font-size: 0.65rem;
              font-weight: 700;
              letter-spacing: 0.4px;
              color: var(--white);
              background: var(--primary-dark);
              padding: 4px 6px;
              border-radius: 4px;
              line-height: 1.2;
          }

          .flight-leg-body {
              flex: 1;
              font-size: 0.88rem;
              line-height: 1.3;
              color: var(--text-dark);
          }

          .flight-leg-route {
              color: var(--text-light);
              font-size: 0.82rem;
              margin-top: 2px;
          }

          .flight-summary {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid var(--primary-color);
              font-size: 0.9rem;
          }

          .flight-summary strong {
              color: var(--primary-dark);
              font-size: 1rem;
          }

          /* --- FOOTER --- */
          footer {
              background-color: var(--text-dark);
              color: var(--white);
              text-align: center;
              padding: 30px 20px;
              margin-top: 30px;
              page-break-inside: avoid;
              break-inside: avoid;
          }

          .whatsapp-btn {
              display: inline-block;
              background-color: #25D366;
              color: white;
              padding: 12px 25px;
              border-radius: 50px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 15px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          }

          .whatsapp-btn:hover {
              background-color: #1ebc57;
          }

          /* --- RESPONSIVE --- */
          @media (max-width: 600px) {
              .gallery-container { grid-template-columns: 1fr; }
              .secondary-gallery-images { flex-direction: row; height: 150px; }
              .main-gallery-image { height: 200px; }
              .reservation-grid { grid-template-columns: 1fr; }
              .container { width: 100%; margin: 0; }
              header, .section { padding: 20px; }
          }
      </style>
  </head>
  <body>

  <div class="container">

      <header>
          <div class="header-logo">
              <img src="${logoAgenciaUrl}" alt="Logo Agencia" />
          </div>
          <h1>Cotización de Reserva</h1>
          <div class="hotel-name-sub">${hotelName}</div>
      </header>

      <div class="hero">
          <p class="tagline">"Disfrute una estadía confortable en nuestras instalaciones"</p>
          <div class="greeting-text">
              <p><strong>Estimado/a ${nombreCompleto},</strong></p>
              <p>Gracias por contactar a ${nombreAgencia} para gestionar su reserva.</p>
          </div>
      </div>

      <div class="section">
          <h2>Detalles de la Reserva</h2>
          <div class="reservation-grid">
              <div class="detail-item">
                  <label>Check-in</label>
                  <span>${checkin}</span>
              </div>
              <div class="detail-item">
                  <label>Check-out</label>
                  <span>${checkout}</span>
              </div>
              <div class="detail-item">
                  <label>Duración</label>
                  <span>${noches} Noche(s)</span>
              </div>
              <div class="detail-item">
                  <label>Huéspedes</label>
                  <span>${totalHuespedes} (${cantadultos} Adultos, ${cantninos} Niños)</span>
              </div>
              <div class="detail-item">
                  <label>Habitaciones</label>
                  <span>${habitaciones}</span>
              </div>
              <div class="detail-item">
                  <label>Alimentación</label>
                  <span>${planAlimentacion}</span>
              </div>
              ${mascotas > 0 ? `
              <div class="detail-item">
                  <label>Mascotas</label>
                  <span>${mascotas} permitida(s)</span>
              </div>
              ` : ''}
              <div class="detail-item">
                  <label>Traslados</label>
                  <span>${textoTrasladoPdf || "No incluidos"}</span>
              </div>
              <div class="detail-item">
                  <label>Tours</label>
                  <span>${toursPdf.length > 0 ? toursPdf.join(", ") : "No incluidos"}</span>
              </div>
              ${precioVueloPdf > 0 ? `
              <div class="detail-item">
                  <label>Vuelo</label>
                  <span>Paquete vuelo + hotel incluido</span>
              </div>
              ` : ''}
          </div>
      </div>

      ${htmlVuelo}

      <div class="section" style="padding-top: 8px;">
           <br>
          <h2>Galería del Hotel</h2>
          <div class="gallery-container">
              <div class="main-gallery-image">
                  <img src="${getHotelImagesById(datosReserva[0]?.hotelidAutocore).main}" alt="Vista principal" />
              </div>
              <div class="secondary-gallery-images">
                  <div class="gallery-image">
                      <img src="${getHotelImagesById(datosReserva[0]?.hotelidAutocore).secondary1}" alt="Vista secundaria 1" />
                  </div>
                  <div class="gallery-image">
                      <img src="${getHotelImagesById(datosReserva[0]?.hotelidAutocore).secondary2}" alt="Vista secundaria 2" />
                  </div>
              </div>
          </div>
      </div>

      <div class="section">
          <h2>Descripción General</h2>
          <p>De acuerdo a conversaciones, enviamos cotización detallada de la siguiente manera:</p>
          <ul>
              <li>Estancia de ${noches} noche(s) del ${checkin} al ${checkout}.</li>
              <li>Habitaciones confortables con Aire Acondicionado y TV moderno.</li>
              <li><strong>${planAlimentacion} incluido.</strong></li>
              <li>Wifi de cortesía en todas las áreas del hotel.</li>
              <li>Check-in 3:00 pm y Check-out 12:00 pm.</li>
              <li>Recepción 24 horas.</li>
              <li>Cajillas de seguridad.</li>
              <li>Baño privado con ducha y amenities.</li>
              <li>Servicio de guarda equipaje sin costo adicional.</li>
              ${
                textoTrasladoPdf
                  ? `<li><strong>Traslado aeropuerto:</strong> ${textoTrasladoPdf}.</li>`
                  : ""
              }
              ${toursPdfHtml}
              ${precioVueloPdf > 0 ? `<li><strong>Vuelo:</strong> Paquete aéreo incluido ($${precioVueloFormateado}).</li>` : ""}
          </ul>
      </div>

      <div class="section">
          <h2>Habitaciones Seleccionadas</h2>
          ${datosReserva.map((habitacion, index) => {
              const descripcionPension = generarDescripcionPension(planAlimentacion);
              return `
              <div class="room-card">
                  <div class="room-header">
                      <h3 style="margin:0;">Habitación ${index + 1}: ${habitacion.NombreH || 'Habitación estándar'}</h3>
                  </div>
                  <p style="color: #666; margin-bottom: 15px;">${habitacion.descripcion || descripcionPension}</p>
                  <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                      <span>Precio por noche: <strong>$${precioPorNocheCalc.toLocaleString()}</strong></span>
                      <span>Total Habitación: <strong>$${totalSinIvaConMarkup.toLocaleString()}</strong></span>
                  </div>
              </div>
              `;
          }).join('')}
          <br />
          <br />
          <br />
          <h2 style="margin-top: 30px;">Resumen de Tarifas</h2>
          <div class="pricing-box">
              <div class="price-row">
                  <span>${exentoIva ? 'IVA 0% (Exento extranjero)' : 'IVA 19%'}</span>
                  <span>$${ivaFormateado}</span>
              </div>
              ${precioVueloPdf > 0 ? `
              <div class="price-row">
                  <span>Vuelo (sin markup)</span>
                  <span>$${precioVueloFormateado}</span>
              </div>
              ` : ''}
              ${markupPorcentaje > 0 ? `
              ` : ''}
              <div class="price-row total">
                  <span>Total a Pagar</span>
                  <span>$${totalFormateadoPaquete}</span>
              </div>
          </div>

          <div class="info-box">
              <strong>Información importante:</strong><br>
              Los valores cotizados están vigentes durante 5 días. Para facturación a nombre de empresa, enviar RUT al check-in; de lo contrario se facturará al huésped titular sin cambios posteriores.
          </div>
      </div>

      <div class="section">
          <h2>Términos y Condiciones</h2>
          
          <h3>Cancelaciones y Modificaciones</h3>
          <ul>
              <li><strong>Individuales:</strong> Notificar con 72 horas de anticipación al check-in para evitar penalidad.</li>
             
          </ul>

          <h3>Comprobante de Pago</h3>
          <p style="font-size: 0.9rem;">El NO envío del comprobante de pago puede causar la pérdida de la disponibilidad. Es obligatorio enviar el soporte por este medio como garantía.</p>

          <h3>Menores de Edad (Ley 679 de 2001)</h3>
          <ul>
              <li>Protegemos a niños, niñas y adolescentes de la explotación sexual.</li>
              <li>Todo menor debe presentar Registro Civil o Tarjeta de Identidad.</li>
              <li>Si no viaja con sus padres, requiere permiso autenticado en notaría.</li>
          </ul>

          <h3>Turismo Sostenible</h3>
          <ul>
              <li>Prohibido el tráfico de flora y fauna (Ley 1333 de 2009).</li>
              <li>Prohibido el tráfico de bienes de interés cultural (Ley 1185 de 2008).</li>
          </ul>

          ${policiesText ? `
          <div style="margin-top: 30px; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
              <h3 style="margin-top:0;">Políticas de la Agencia</h3>
              <p style="white-space: pre-wrap; font-size: 0.9rem;">${policiesText}</p>
          </div>
          ` : ''}
          
          <div style="background-color: var(--text-dark); color: var(--white); text-align: center; padding: 30px 20px; margin-top: 30px; border-radius: 5px;">
              <h3 style="color: var(--white); margin-top: 0;">¿Tienes preguntas?</h3>
              <p>Contáctanos para finalizar tu reserva</p>
              <a href="tel:${telefonoAgencia}" class="whatsapp-btn">
                  Llamar o Whatsapp: ${telefonoAgencia}
              </a>
          </div>
      </div>

  </div>

  </body>
  </html>`;
  };

  // Función para enviar la cotización
  const enviarCotizacion = async () => {
    try {
      setBotondesactivado(true);

      // Calcular totales
      const totalHuespedes = cantadultos + cantninos;
      const adults = JSON.stringify(cantadultos);
      const ninos = JSON.stringify(cantninos);
      const noches = JSON.stringify(datosReserva[0]?.nights);
      const habitaciones = JSON.stringify(datosReserva.length);
      const primerDatoReserva = datosReserva[0] || {};

      // Formatear fechas
      const checkin = format(
        fechasreserva?.dateRange?.startDate,
        "YYYY-MM-DD",
        "es"
      );
      const checkout = format(
        fechasreserva?.dateRange?.endDate,
        "YYYY-MM-DD",
        "es"
      );

      // Convertir edades de niños
      const childrenAgesString =
        fechasreserva?.layout
          .flatMap((room) => room.children_ages || [])
          .join(",") || "";

      // Construir información de transporte (traslados) si aplica,
      // respetando el esquema que usa FormularioReserva.jsx
      const tipodetraslado = (() => {
        const tipoTraslado = primerDatoReserva.tipoTraslado;
        if (tipoTraslado === "aeropuerto_hotel") return 0;
        if (tipoTraslado === "hotel_aeropuerto") return 1;
        if (tipoTraslado === "ambos") return 2;
        return null;
      })();

      const infoTransporte =
        primerDatoReserva.incluirTraslado === true && tipodetraslado !== null
          ? {
              tipo: primerDatoReserva.tipoTraslado,
              // En cotización no pedimos aún número de vuelo ni aerolínea,
              // pero el backend exige strings con longitud mínima; usamos "ND"
              numeroVuelo: "ND",
              ...(primerDatoReserva.tipoTraslado === "hotel_aeropuerto" ||
              primerDatoReserva.tipoTraslado === "ambos"
                ? { numeroVueloSalida: "ND" }
                : {}),
              firstContactNumber: formData.celular || "",
              aerolinea: "ND",
              tipoRecogida: tipodetraslado,
              cantidadPersonas: totalHuespedes,
            }
          : null;

      // Construir información de toures si hay seleccionados
      // Debe ser un objeto (no array) igual que en FormularioReserva.jsx
      const infoToures =
        Array.isArray(primerDatoReserva.tourSeleccionado) &&
        primerDatoReserva.tourSeleccionado.length > 0
          ? {
              nombres: primerDatoReserva.tourSeleccionado.map(
                (tour) => tour.title || tour.nombre || tour.titulo || ""
              ),
              firstContactNumber: formData.celular || "",
              secondContacNumber: formData.celular || "",
            }
          : null;

      // Función para filtrar retenciones que no son 0
      const filtrarRetenciones = (retenciones) => {
        return Object.fromEntries(
          Object.entries(retenciones).filter(([_, value]) => {
            return value.resultado !== 0 || value.porcentaje !== 0;
          })
        );
      };

      const vueloPayload = buildVueloArrayParaCotizacion();
      const origenIata = getOrigenIataCotizacion();

      const tipoDocumentoNormalizado = normalizarTipoDocumento(formData.tipoDocumento);
      const informacionD = JSON.stringify({
        total: totalParaPost,
        markup: markupParaPost,
        porcentajemarkup: markupPorcentaje,
        ...(origenIata ? { origenIata } : {}),
        ...(vueloPayload.length > 0 ? { vuelo: vueloPayload } : {}),
        mascotasNumber: datosReserva[0]?.mascotas || null,
        adicionAlmuerzo: false,
        hotelInfo:{
          name: nombreHotelId(datosReserva[0]?.hotelidAutocore) || "",
        },
        adicionCena: false,
        titularInfo: {
          firstName: formData.nombreCompleto,
          lastName: formData.apellidos,
          tipoDocumento: tipoDocumentoNormalizado,
          documento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento,
        },
        infoTransporte,
        infoToures,
        ...filtrarRetenciones({
          reteFuente: {
            resultado: Math.round(DatosRetenciones?.calculo_rtf_fte) || 0,
            porcentaje: Number(RetencionesPorcentaje?.reteFuente) || 0,
          },
          reteIca: {
            resultado: Math.round(DatosRetenciones?.calculo_rtf_ica) || 0,
            porcentaje: Number(RetencionesPorcentaje?.reteIca) || 0,
          },
          reteIva: {
            resultado: Math.round(DatosRetenciones?.calculo_rtf_iva) || 0,
            porcentaje: Number(RetencionesPorcentaje?.reteIva) || 0,
          },
        }),
        planAlimentario: datosReserva[0]?.plandealimentacion || "Solo desayuno",
        exentoIva: exentoIva,
        landingHtml: generarLandingHtml(),
        reservaInfo: {
          agency: {
            is_agency: true,
            agency_type: agencia?.agencia?.category || 0,
            external_ref_id: "666222",
          },
          reservation: {
            adults: adults,
            checkin: checkin,
            checkout: checkout,
            children: ninos,
            children_ages: childrenAgesString,
            city: datosReserva[0]?.ciudad || "CARTAGENA",
            country: "COL",
            currency: divisaSelec || "COP",
            email: formData.email,
            firstName: formData.nombreCompleto,
            lastName: formData.apellidos,
            nights: noches,
            notes: `Creada por la agencia: ${agencia?.agencia?.fullName || 'Agencia'}. Reserva de ${noches} noches a nombre de ${formData.nombreCompleto} ${formData.apellidos}.`,
            rooms: habitaciones,
            roomsData: datosReserva.map((dato, index) => {
              const roomConfig = fechasreserva?.layout?.[index] || {};
              return {
                nombreHabitacion: dato.NombreH,
                adults: JSON.stringify(roomConfig.adults || 0),
                children_ages: roomConfig.children_ages?.join(",") || "",
                children: roomConfig.children_ages
                  ? JSON.stringify(roomConfig.children_ages.length)
                  : "",
                checkin: checkin,
                checkout: checkout,
                currency: divisaSelec || "COP",
                id: dato.roomId,
                quantity: "1",
                rateId: dato.rateId,
                unitaryPrice: dato.precio,
              };
            }),
            telephone: formData.celular,
          },
        },
      });

      const url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/cotizaciones/from-disponibilidad`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
        body: informacionD,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cotización enviada:', data);
        Swal.fire({
          icon: "success",
          title: "Cotización enviada",
          text: "Se ha enviado la cotización con éxito.",
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('modoCotizacion');
        }
        window.location.href = `/cotizaciones/${data._id}`;
      } else {
        throw new Error("o intente nuevamente mas tarde");
      }
    } catch (error) {
      console.error("Error al enviar cotización:", error);
      Swal.fire({
        icon: "error",
        title: "Error al enviar cotización",
        text: `Recargue la página y vuelva a intentarlo ${error.message}`,
      });
    } finally {
      setBotondesactivado(false);
    }
  };

  return (
    <div className="container">
      <div className="layout">
        {/* Columna Principal */}
        <div className="main-content">

          {/* Formulario de Información del Huésped */}
          <div className="card">
            <div className="logos logos-header">
              <img src={logoAgencia?.imageUrl || "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg"}
                alt="Logo Agencia" className="logo logo-cotizacion-agencia" />
              <div className="logos-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={handleClick}
                  data-tooltip-id="tooltip-logo-agencia"
                  data-tooltip-content="Carga el logotipo de tu agencia que se mostrará en la cotización enviada al cliente"
                  data-tooltip-place="left"
                  className="btn-cargar-logo"
                >
                  Cargar logotipo de la agencia
                </button>
              </div>
            </div>
            <div className="badge-container">
              <span className="badge">
                Estado: pendiente por generar
              </span>
            </div>

            <h2 className="title">Información del huésped</h2>

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <fieldset style={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "15px",
                marginBottom: "20px",
              }}>
                <legend>Datos del titular</legend>

                {/* Tipo de documento */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="tipoDocumento" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Tipo de documento <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    id="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>

                {/* Número de documento */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="numeroDocumento" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Número de documento <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="numeroDocumento"
                    type="text"
                    placeholder="Ingrese el número de documento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Nombre del titular */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="nombreCompleto" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Nombre del titular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="nombreCompleto"
                    type="text"
                    placeholder="Ingrese el nombre"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Apellidos del titular */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="apellidos" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Apellidos del titular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="apellidos"
                    type="text"
                    placeholder="Ingrese los apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="fechaNacimiento" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Fecha de nacimiento <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Correo electrónico */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Correo electrónico <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ingrese el correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Celular */}
                <div style={{ marginBottom: "15px" }}>
                  <label htmlFor="celular" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Celular <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="celular"
                    type="tel"
                    placeholder="Ingrese el número de celular"
                    value={formData.celular}
                    onChange={handleChange}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                  <label
                    htmlFor="identificador"
                    style={{ color: "red", fontWeight: "light", fontSize: "12px", marginTop: "5px", display: "block" }}
                  >
                    Incluir código de área (+57,+55, etc.) eje:+573002215487
                  </label>
                </div>
                <div className="form-group">
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={huespedExtranjero}
                  onChange={(e) => setHuespedExtranjero(e.target.checked)}
                />
                Huésped extranjero (exento de IVA)
              </label>
            </div>
              </fieldset>
            </form>
          {/* Formulario Retenciones */}
          {totalRetenciones >= 199000 && (
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <FormularioRetenciones
                precio={totalConIVA}
                adults={cantadultos}
                ninos={cantninos}
                fechasreserva={fechasreserva}
                manejarDatos={manejarDatos}
              />
            </div>
          )}
          </div>

          {/* Información de la Reserva */}
          {datosReserva && datosReserva.length > 0 && (
            <div className="card">
              <h2 className="title">Información de la reserva</h2>

              <h3 className="subtitle">{nombreHotelId(datosReserva[0].hotelidAutocore)}</h3>
              <div className="contact-item">
                <MapPin className="icon" />
                <span>{direccionHotelId(datosReserva[0].hotelidAutocore)}</span>
                <div className="contact-item">
                  <Phone className="icon" />
                  <span>+57 3336025669</span>
                </div>
              </div>

              {/* Contenedor de imágenes del hotel */}
              <div className="hotel-images-container">
                <div className="main-image">
                  <img
                    src={getHotelImagesById(datosReserva[0].hotelidAutocore).main}
                    alt={`Vista principal del ${nombreHotelId(datosReserva[0].hotelidAutocore)}`}
                    className="hotel-main-img"
                  />
                </div>
                <div className="secondary-images">
                  <div className="secondary-image">
                    <img
                      src={getHotelImagesById(datosReserva[0].hotelidAutocore).secondary1}
                      alt={`Vista secundaria 1 del ${nombreHotelId(datosReserva[0].hotelidAutocore)}`}
                      className="hotel-secondary-img"
                    />
                  </div>
                  <div className="secondary-image">
                    <img
                      src={getHotelImagesById(datosReserva[0].hotelidAutocore).secondary2}
                      alt={`Vista secundaria 2 del ${nombreHotelId(datosReserva[0].hotelidAutocore)}`}
                      className="hotel-secondary-img"
                    />
                  </div>
                </div>
              </div>

              <div className="contact-info">
              </div>

              {/* Fechas y Detalles */}
              <div className="dates-grid">
                <div className="date-item">
                  <p className="label">Check-in</p>
                  <p className="value">{datosReserva[0].checkin}  →</p>
                </div>
                <div className="date-item">
                  <p className="label">Check-out</p>
                  <p className="value">{datosReserva[0].checkout}</p>
                </div>
                <div className="date-item">
                  <p className="label">Noches</p>
                  <p className="value">{datosReserva[0].nights}</p>
                </div>
                <div className="date-item">
                  <p className="label">Huéspedes</p>
                  <p className="value">{datosReserva[0].huespedes}</p>
                </div>
                <div className="date-item">
                  <p className="label">Habitaciones</p>
                  <p className="value">{datosReserva.length}</p>
                </div>
              </div>

              {/* Tabla de Habitaciones */}
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr className="table-header">
                      <th className="th">Habitación</th>
                      <th className="th">Descripción</th>
                      <th className="th">Noches</th>
                      <th className="th">Valor C/U</th>
                      <th className="th">Valor total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosReserva.map((data, index) => {
                      const planAlimentacion = datosReserva[0]?.plandealimentacion || "Solo desayuno";
                      const descripcionPension = generarDescripcionPension(planAlimentacion);
                      return (
                      <tr key={data.roomId || index}>
                        <td className="td">{data.NombreH || 'Habitación estándar'}</td>
                        <td className="td">{data.descripcion || descripcionPension}</td>
                        <td className="td">{data.nights}</td>
                        <td className="td">${data.precioBase ? data.precioBase.toLocaleString() : '0'}</td>
                        <td className="td">${data.precio ? data.precio.toLocaleString() : '0'}</td>
                      </tr>
                    );
                    })}
                    <tr className="table-subtotal">
                      <td colSpan="4" className="td-total">Subtotal</td>
                      <td className="td-amount">${subtotal.toLocaleString()}</td>
                    </tr>
                    <tr className="table-subtotal">
                      <td colSpan="4" className="td-total">{exentoIva ? 'IVA 0% (Exento extranjero)' : 'IVA 19%'}</td>
                      <td className="td-amount">${iva.toLocaleString()}</td>
                    </tr>
                    {incluyeVuelo && precioVuelo > 0 && (
                      <tr className="table-subtotal">
                        <td colSpan="4" className="td-total">Vuelo (sin markup)</td>
                        <td className="td-amount">${precioVuelo.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="table-total">
                      <td colSpan="4" className="td-total-label">Precio total para la agencia
                        <img
                          src="https://space-img.sfo3.digitaloceanspaces.com/Logos/tooltip.png"
                          alt="Información"
                          data-tooltip-id="tooltip-precio-agencia"
                          data-tooltip-content="Incluye hospedaje y vuelo (sin markup). Este valor no se mostrará en la cotización"
                          data-tooltip-place="right"
                          style={{ width: "16px", height: "16px", cursor: "help", marginLeft: "6px" }}
                        />
                      </td>
                      <td className="td-total-amount">${baseCombinada.toLocaleString()}</td>
                    </tr>
                    {markupPorcentaje > 0 && (
                      <tr className="table-total" style={{ backgroundColor: "#f0f9ff", borderTop: "2px solid #059669" }}>
                        <td colSpan="4" className="td-total-label" style={{ color: "#059669", fontWeight: "600" }}>
                        Precio total para tu cliente ({markupPorcentaje}%)
                        </td>
                        <td className="td-total-amount" style={{ color: "#059669", fontWeight: "600" }}>
                          ${totalConMarkup.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              {/* Acordeones */}
              <div className="accordions">
                <div className="accordion">
                  <button
                    onClick={() => setShowReservaIncluye(!showReservaIncluye)}
                    className="accordion-button"
                  >
                    <span className="accordion-title">La reserva incluye</span>
                    <ChevronDown className={`icon-chevron ${showReservaIncluye ? 'rotated' : ''}`} />
                  </button>
                  {showReservaIncluye && (
                    <div className="accordion-content">
                      <div className="text">
                        <p><strong>Plan de alimentación:</strong> {datosReserva[0]?.plandealimentacion || 'No especificado'}</p>
                        
                        {datosReserva[0]?.mascotas > 0 && (
                          <p><strong>Mascotas permitidas:</strong> {datosReserva[0].mascotas} mascota(s)</p>
                        )}
                        
                        {datosReserva[0]?.incluirTraslado ? (
                          <div>
                            <p><strong>Traslado incluido:</strong> Sí</p>
                            {datosReserva[0]?.tipoTraslado && (
                              <p><strong>Tipo de traslado:</strong> {etiquetaTrasladoDesdeTipo(datosReserva[0].tipoTraslado)}</p>
                            )}
                          </div>
                        ) : (
                          <p><strong>Traslado incluido:</strong> No</p>
                        )}
                        
                        {datosReserva[0]?.tourSeleccionado && datosReserva[0].tourSeleccionado.length > 0 ? (
                          <div>
                            <p><strong>Tours incluidos:</strong></p>
                            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                              {datosReserva[0].tourSeleccionado.map((tour, index) => (
                                <li key={index}>{tour.title || tour.nombre || tour.titulo || `Tour ${index + 1}`}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p><strong>Tours incluidos:</strong> Ninguno</p>
                        )}
                        
                        <p><strong>Servicios básicos incluidos:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                          <li>WiFi gratuito</li>
                          <li>Servicio de habitación</li>
                          <li>Piscina y zona de recreación</li>
                          <li>Servicio de conserjería</li>
                          <li>Recepción 24 horas</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="accordion">
                  <button
                    onClick={() => setShowPoliticas(!showPoliticas)}
                    className="accordion-button"
                  >
                    <span className="accordion-title">Políticas de la reserva para tu agencia
                    </span>
                    <ChevronDown className={`icon-chevron ${showPoliticas ? 'rotated' : ''}`} />
                  </button>
                  {showPoliticas && (
                    <div className="accordion-content">
                      <p >Tener en cuenta:</p>
              <br />
              <p>
                * La cadena hotelera Geh Suites protege a los niños, niñas y
                adolescentes de la explotación sexual y comercial Ley 679 de
                2001.
              </p>
              <br />
              <p>
                {" "}
                * Recuerde: todo niño que viaje debe contar con su documento de
                identidad (Registro civil o tarjeta de identidad).
              </p>
              <br />
              <p>
                * Si los niños que viajan no son hijos de los adultos que los
                representan deben contar con un permiso de los padres,
                autenticado en una notaría.
              </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Políticas de la Agencia */}
          <div className="card">
            <h2 className="title">Políticas de tu agencia</h2>

            <div className="editor">
              <textarea
                value={policiesText}
                onChange={(e) => setPoliciesText(e.target.value)}
                placeholder={policiesLoading ? "Cargando políticas..." : "Ingresa aquí las políticas de tu agencia..."}
                disabled={policiesLoading}
                className="textarea"
                style={{
                  opacity: policiesLoading ? 0.6 : 1,
                  cursor: policiesLoading ? "wait" : "text",
                  fontFamily: "Roboto, sans-serif",
                }}
              />
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "12px",
            }}>
              <button
                onClick={handleUpdatePolicies}
                disabled={policiesLoading}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#26547B",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: policiesLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: policiesLoading ? 0.6 : 1,
                  transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!policiesLoading) {
                    e.target.style.backgroundColor = "#1e4666";
                    e.target.style.boxShadow = "0 2px 8px rgba(38, 84, 123, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!policiesLoading) {
                    e.target.style.backgroundColor = "#26547B";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {policiesLoading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </div>
        </div>

        {/* Columna Lateral - Markup */}
        <div className="sidebar">
          <div className="card sidebar-card">
            <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Calcular markup
              <img 
                src="https://space-img.sfo3.digitaloceanspaces.com/Logos/tooltip.png" 
                alt="Información sobre markup"
                data-tooltip-id="tooltip-markup"
                data-tooltip-content="El markup es un porcentaje de ganancia que se suma al valor base de la reserva. Permite a tu agencia obtener ingresos adicionales sobre el costo de la reserva."
                data-tooltip-place="right"
                style={{ width: '20px', height: '20px', cursor: 'help' }}
              />
            </h3>

            
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px", lineHeight: "1.5" }}>
              Ingresa el porcentaje de ganancia que se sumará al valor base de la reserva.
            </p>

           

            <div className="form-group">
              <label className="label">
                Ingresa el markup (%)
              </label>
              <div className="select-wrapper">
                <input
                  type="text"
                  inputMode="decimal"
                  value={markup}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Permite solo dígitos, coma y punto
                    const cleaned = raw.replace(/[^0-9.,]/g, '');
                    setMarkup(cleaned);
                  }}
                  placeholder="Ej: 30%"
                  className="select"
                />
              </div>
            </div>

            {incluyeVuelo && (
              <div className="card" style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "#1C3D5A" }}>Vuelo incluido en la cotización</h3>
                <VueloCotizacionDetalle
                  vueloArray={buildVueloArrayParaCotizacion()}
                  collapsible={false}
                />
              </div>
            )}

            <div className="price-section">
              <div className="price-row">
                <span className="price-label">Precio base (hotel)</span>
                <span className="price-value">${totalRetenciones.toLocaleString()}</span>
              </div>
              {incluyeVuelo && precioVuelo > 0 && (
                <div className="price-row">
                  <span className="price-label">Vuelo (sin markup)</span>
                  <span className="price-value">${precioVuelo.toLocaleString()}</span>
                </div>
              )}
              {markupPorcentaje > 0 && (
                <>
                  <div className="price-row">
                    <span className="price-label">Markup ({markupPorcentaje}%)</span>
                    <span className="price-value">+${markupAmount.toLocaleString()}</span>
                  </div>
                  <div className="price-row" style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px", marginTop: "8px" }}>
                    <span className="price-label" style={{ fontWeight: "600" }}>Total con markup</span>
                    <span className="price-value" style={{ fontWeight: "600", color: "#059669" }}>${totalConMarkup.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {/* Botón de cotizar */}

            <button
              onClick={handleSubmit}
              disabled={botondesactivado}
              style={{
                fontWeight: "500",
                backgroundColor: "#26547B",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "5px",
                cursor: botondesactivado ? "not-allowed" : "pointer",
                fontSize: "14px",
                width: "100%",
                marginTop: "20px",
                opacity: botondesactivado ? 0.6 : 1
              }}
            >
              {botondesactivado ? "Enviando..." : "Cotizar Ahora"}
            </button>

          </div>
        </div>
      </div>
      <Tooltip id="tooltip-markup" className="custom-tooltip" />
      <Tooltip id="tooltip-logo-agencia" className="custom-tooltip" />
      <Tooltip id="tooltip-precio-agencia" className="custom-tooltip" />

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, ChevronDown } from 'lucide-react';
import '/public/styles/Cotizacion.css';
import Swal from 'sweetalert2';
import { format } from '@formkit/tempo';
import Cookies from 'js-cookie';
import { refreshToken } from '../stores/authtoken';
import { Tooltip } from 'react-tooltip';

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
    8: "Hotel Rodadero ", // Hotel Rodadero 
    2: "Hotel 1525", // Hotel 1525
    48: "Hotel Axis", // Hotel Axis Inn
    44: "Hotel Sansiraka", // Hotel Sansiraka Inn


    // Hoteles Bogota
    10: "Hotel Windsor", // Hotel Windsor
    3: "Hotel Madisson", // Hotel Madisson

  };

  return hotelMap[hotelId] || "Hotel no encontrado";
};

// Función para obtener las imágenes del hotel basado en el ID
const getHotelImagesById = (hotelId) => {
  const hotelImagesMap = {
    // Hoteles Cartagena
    1: {
      main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
      secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244634659.jpg?k=becae71ed93bcf69535c2704fb02e0d97a3e078e017b9356a7a3fcc6d60ca4ee&o=&hp=1",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/1azuan360621.jpg"
    },
    4: {
      main: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
      secondary1: "https://www.gehsuites.com/multimedia/galerias/aixo9640.jpg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/aixo8287.jpg"
    },
    5: {
      main: "https://www.gehsuites.com/multimedia/galerias/galeriaabi17741.jpg",
      secondary1: "https://www.gehsuites.com/multimedia/galerias/galeriaabi16972.jpg",
      secondary2: "https://www.gehsuites.com/images/fachada_hotel_abi.jpg"
    },
    6: {
      main: "https://www.gehsuites.com/multimedia/galerias/avexi5917.jpg",
      secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/foodStanAvexi.jpg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/avexi7863.jpg"
    },
    7: {
      main: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena4469.jpg",
      secondary1: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena2953.jpg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/hotelbocagrandecartagena14676.jpg"
    },
    9: {
      main: "https://www.gehsuites.com/images/portada_marian_suites.jpg ",
      secondary1: "https://www.gehsuites.com/multimedia/galerias/marinasuites6710.jpg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/marinasuites3856.jpg"
    },
    56: {
      main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/fachada_boquilla.jpg",
      secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada2_boquilla.jpg",
      secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/desayuno_boquilla.jpg"
    },
    // Hoteles Santa Marta
    8: {
      main: "https://www.gehsuites.com/images/fachada_rodadero_1.jpg",
      secondary1: "https://www.gehsuites.com/multimedia/galerias/2rodadero23293.jpg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/galeriarodadero9278.jpg"
    },

    48: {
      main: "https://www.gehsuites.com/images/YULDAMA-2.jpg",
      secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Lobbyaxis.jpeg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/galeria2295.jpg"
    },
    44: {
      main: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
      secondary1: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/535990853.jpg?k=15f0dd4cc6a6e4d3eb35cae6b196c8bab43f3734514a24a24f5f29415e8575ce&o=&hp=1",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/galeria7908.jpg"
    },
    41: {
      main: "https://www.gehsuites.com/images/fachada-azuan.jpg", // Imagen por defecto para Zulita
      secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
      secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg"
    },
    // Hoteles Bogotá
    10: {
      main: "https://www.gehsuites.com/multimedia/galerias/5HotelWindsorHouse704.jpg",
      secondary1: "https://www.gehsuites.com/multimedia/galerias/16HotelWindsorHouse427.jpg",
      secondary2: "https://www.gehsuites.com/multimedia/galerias/20HotelWindsorHouse922.jpg"
    },
    3: {
      main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison10238.jpg",
      secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison8955.jpg",
      secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison6250.jpg"
    }
  };

  return hotelImagesMap[hotelId] || {
    main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
    secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
    secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg"
  };
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
  const fileInputRef = useRef(null);

  useEffect(() => {
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

  // Calcular totales basados en los datos de las habitaciones
  const subtotal = datosReserva ? datosReserva.reduce((sum, data) => sum + (data.precio || 0), 0) : 0;
  const exentoIva = huespedExtranjero === true;
  const iva = exentoIva ? 0 : (Math.round(subtotal * 0.19) || 0);
  const total = subtotal + iva;

  // Calcular markup (admite coma o punto como separador decimal)
  const markupPorcentaje = parseFloat(String(markup).replace(',', '.')) || 0;
  const markupAmount = Math.round(total * (markupPorcentaje / 100));
  const totalConMarkup = total + markupAmount;

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

  // Función para generar HTML dinámico con datos de la reserva
  const generarLandingHtml = () => {
    const hotelName = nombreHotelId(datosReserva[0]?.hotelidAutocore);
    const checkin = format(fechasreserva?.dateRange?.startDate, "YYYY-MM-DD", "es");
    const checkout = format(fechasreserva?.dateRange?.endDate, "YYYY-MM-DD", "es");
    const noches = datosReserva[0]?.nights || 1;
    const totalHuespedes = cantadultos + cantninos;
    const habitaciones = datosReserva.length;
    const precioPorNoche = datosReserva[0]?.precioBase || 0;
    const subtotalFormateado = subtotal.toLocaleString();
    const ivaFormateado = iva.toLocaleString();
    const totalFormateado = total.toLocaleString();
    const totalConMarkupFormateado = totalConMarkup.toLocaleString();
    const nombreCompleto = `${formData.nombreCompleto} ${formData.apellidos}`;
    const planAlimentacion = datosReserva[0]?.plandealimentacion || "Solo desayuno";
    const mascotas = datosReserva[0]?.mascotas || 0;
    const logoAgenciaUrl = logoAgencia?.imageUrl || "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg";
    const nombreAgencia = agencia?.agencia?.fullName || "Agencia de Viajes";
    const telefonoAgencia = "+57 333 602 50 21";
    const emailCliente = formData.email;
    const telefonoCliente = formData.celular;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - ${hotelName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: #fff;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .header-logo {
            text-align: center;
            margin-bottom: 20px;
        }

        .header-logo img {
            max-width: 200px;
            height: auto;
        }

        header {
            text-align: center;
            border-bottom: 3px solid #886b43;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        h1 {
            color: #886b43;
            font-size: 28px;
            margin-bottom: 10px;
        }

        h2 {
            color: #886b43;
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }

        h3 {
            color: #444;
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #666;
            font-size: 16px;
            font-style: italic;
        }

        .hotel-name {
            font-size: 24px;
            font-weight: bold;
            color: #886b43;
            margin-bottom: 5px;
        }

        .greeting {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #886b43;
            margin: 20px 0;
        }

        .greeting strong {
            color: #886b43;
        }

        ul {
            list-style-position: inside;
            margin: 15px 0;
            padding-left: 20px;
        }

        li {
            margin: 8px 0;
            line-height: 1.8;
        }

        .address {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .pricing-section {
            background-color: #f0f7ff;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .price-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }

        .price-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #886b43;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #886b43;
        }

        .info-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .info-box strong {
            color: #856404;
        }

        .payment-section {
            background-color: #e8f5e9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .bank-details {
            background-color: #fff;
            padding: 15px;
            border-left: 4px solid #4caf50;
            margin: 10px 0;
        }

        .link {
            color: #886b43;
            word-break: break-all;
            text-decoration: none;
        }

        .link:hover {
            text-decoration: underline;
        }

        .signature-section {
            background-color: #f8f9fa;
            padding: 20px;
            border: 2px dashed #886b43;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }

        .terms-section {
            margin-top: 30px;
        }

        .warning {
            color: #d32f2f;
            font-weight: bold;
        }

        .contact-section {
            background-color: #886b43;
            color: #fff;
            padding: 20px;
            border-radius: 5px;
            margin-top: 30px;
            text-align: center;
        }

        .contact-section h2 {
            color: #fff;
            border-bottom: 2px solid #fff;
        }

        .contact-section a {
            color: #fff;
            font-size: 18px;
            font-weight: bold;
            text-decoration: none;
        }

        .contact-section a:hover {
            text-decoration: underline;
        }

        .reservation-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr; /* una sola columna */
            gap: 8px;
            margin: 15px 0;
        }

        .detail-item {
            background-color: transparent; /* quitar tarjetas */
            padding: 0;
            border-radius: 0;
            border-left: none;
        }

        .detail-label {
            font-weight: bold;
            color: #886b43;
            font-size: 14px;
        }

        .detail-value {
            color: #333;
            margin-top: 5px;
        }

        .hotel-gallery {
            margin: 30px 0;
        }

        .gallery-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 10px;
            margin: 20px 0;
        }

        .main-gallery-image {
            width: 100%;
        }

        .main-gallery-image img {
            width: 100%;
            height: 320px;
            object-fit: cover;
            border-radius: 0;
            box-shadow: none;
        }

        .secondary-gallery-images {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .gallery-image {
            width: 100%;
        }

        .gallery-image img {
            width: 100%;
            height: 320px;
            object-fit: cover;
            border-radius: 0;
            box-shadow: none;
        }

        @media print {
            body {
                background-color: #fff;
                padding: 0;
            }

            .container {
                box-shadow: none;
                padding: 20px;
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 24px;
            }

            h2 {
                font-size: 20px;
            }

            .price-row {
                flex-direction: column;
                gap: 5px;
            }

            .detail-grid {
                grid-template-columns: 1fr;
            }

            .gallery-container {
                grid-template-columns: 1fr;
                gap: 5px;
            }

            .main-gallery-image img {
                height: 300px;
                object-fit: cover;
            }

            .gallery-image img {
                height: 300px;
                object-fit: cover;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-logo">
            <img src="${logoAgenciaUrl}" alt="Logo Agencia" />
        </div>

        <header>
            <h1>Cotización del ${checkin} al ${checkout}</h1>
            <p class="hotel-name">${hotelName}</p>
            <p class="subtitle">Disfrute una estadía confortable en nuestras instalaciones</p>
        </header>

        <div class="greeting">
            <p><strong>Estimado/a ${nombreCompleto}</strong></p>
            <p>Gracias por contactar a ${nombreAgencia} para gestionar su reserva.</p>
        </div>

        <div class="reservation-details">
            <h2>Detalles de la Reserva</h2>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Check-in</div>
                    <div class="detail-value">${checkin}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Check-out</div>
                    <div class="detail-value">${checkout}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Noches</div>
                    <div class="detail-value">${noches}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Huéspedes</div>
                    <div class="detail-value">${totalHuespedes} (${cantadultos} adultos, ${cantninos} niños)</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Habitaciones</div>
                    <div class="detail-value">${habitaciones}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Plan de Alimentación</div>
                    <div class="detail-value">${planAlimentacion}</div>
                </div>
                ${mascotas > 0 ? `
                <div class="detail-item">
                    <div class="detail-label">Mascotas</div>
                    <div class="detail-value">${mascotas} mascota(s) permitida(s)</div>
                </div>
                ` : ''}
            </div>
        </div>

        <section class="hotel-gallery">
            <h2>Galería del Hotel</h2>
            <div class="gallery-container">
                <div class="main-gallery-image">
                    <img src="${getHotelImagesById(datosReserva[0]?.hotelidAutocore).main}" alt="Vista principal del ${hotelName}" />
                </div>
                <div class="secondary-gallery-images">
                    <div class="gallery-image">
                        <img src="${getHotelImagesById(datosReserva[0]?.hotelidAutocore).secondary1}" alt="Vista del hotel ${hotelName}" />
                    </div>
                    <div class="gallery-image">
                        <img src="${getHotelImagesById(datosReserva[0]?.hotelidAutocore).secondary2}" alt="Vista del hotel ${hotelName}" />
                    </div>
                </div>
            </div>
        </section>
<br>
        <section>
            <h2>Descripción general</h2>
            <p>De acuerdo a conversaciones, enviamos cotización detallada de la siguiente manera:</p>
            <ul>
                <li>Estancia de ${noches} noche(s) del ${checkin} al ${checkout}</li>
                <li>Habitaciones confortables, dotadas con cajillas de seguridad, Tv moderno, duchas con agua caliente, wifi en todas las áreas del hotel.</li>
                <li>${planAlimentacion} incluido</li>
                <li>Check-in 3:00 pm y check-out 12:00 pm</li>
                <li>Servicio de guarda equipaje sin costo adicional</li>
                <li>Baño privado con ducha o bañera</li>
                <li>Amenities de baño</li>
                <li>Tv Smart</li>
                <li>Escritorio</li>
                <li>Silla</li>
                <li>Closet</li>
                <li>Sala de estar en las habitaciones</li>
                <li>Servicio de wifi de cortesía</li>
                <li>Cajillas de seguridad</li>
                <li>Servicio de recepción durante 24 horas</li>
            </ul>
        </section>

        <section>
            <h2>Habitaciones Reservadas</h2>
            ${datosReserva.map((habitacion, index) => `
            <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3>Habitación ${index + 1}: ${habitacion.NombreH || 'Habitación estándar'}</h3>
                <p><strong>Descripción:</strong> ${habitacion.descripcion || 'Incluye desayuno y servicios básicos'}</p>
                <p><strong>Precio por noche:</strong> $${habitacion.precioBase ? habitacion.precioBase.toLocaleString() : '0'}</p>
                <p><strong>Total habitación:</strong> $${habitacion.precio ? habitacion.precio.toLocaleString() : '0'}</p>
            </div>
            `).join('')}
        </section>
<br>
<br>
<br>
        <section>
            <h2>Tarifas</h2>
            <div class="pricing-section">
                <div class="price-row">
                
                    <span>$${totalConMarkupFormateado}</span>
                </div>
                <div class="price-row">
                    <span>${exentoIva ? 'IVA 0% (Exento extranjero):' : 'IVA 19%:'}</span>
                    <span>$${ivaFormateado}</span>
                </div>
                <div class="price-row">
                    <span>Total:</span>
                    <span>$${totalConMarkupFormateado}</span>
                </div>
            </div>
        </section>

        <div class="info-box">
            <p><strong>Información importante:</strong></p>
            <p>Los valores de las tarifas enviadas en la siguiente cotización estarán vigentes durante los próximos 5 días a partir de la fecha de envío.</p>
            <p><strong>Nota:</strong> En caso de solicitar factura a nombre de la empresa, debe enviar el RUT al momento de realizar el check-in y antes de realizar el check-out, de lo contrario, la reserva se facturará a nombre del huésped o titular de la reserva perdiendo el derecho a solicitar modificación o corrección del documento.</p>
        </div>

        

        <section class="terms-section">
            <h2>Términos y condiciones</h2>
            
            <h3>Cancelaciones</h3>
            <ul>
                <li>En caso de cancelar o modificar su reserva deberá notificar con 72 horas de anticipación a la fecha de entrada al hotel, para no recibir penalización.</li>
                <li>Si el hotel no recibe información de cancelación o modificación de su alojamiento, dentro de las 72 horas, el hotel podrá realizar la penalización parcial o total del monto de su reserva.</li>
            </ul>

            <h3>Tener en cuenta</h3>
            <p>El NO envío del comprobante en la fecha estipulada o anterior a esta, puede causar la apertura de disponibilidad o venta de la habitación sin previo aviso, por lo tanto, es de suma importancia hacer el envío de la foto o escáner del comprobante por el presente medio como prueba de garantía.</p>

            <h3>Grupos mínimo 30 personas</h3>
            <ul>
                <li>Deben notificar cualquier tipo de modificación antes de ingresar al hotel.</li>
                <li>En caso de cancelar una reserva de grupo deberá notificar 720 horas de anticipación a la fecha de entrada al hotel, para no recibir personalización.</li>
            </ul>

            <h3>Estadía con menores de edad:</h3>
            <ul>
                <li>${hotelName} protege a los niños, niñas y adolescentes de la explotación sexual y comercial Ley 679 de 2001.</li>
                <li>Recuerde; todo niño que viaje debe contar sus documentos de identidad (Registro civil o tarjeta de identidad)</li>
                <li>Si los niños que viajan no son hijos de los adultos que los representan deben contar con un permiso de los padres, autenticado en una notaría.</li>
            </ul>

            <h3>Turismo sostenible</h3>
            <ul>
                <li>El tráfico, comercio, consumo, colección y cualquier tipo de actividad que genere un impacto negativo en la flora y fauna está prohibida por la Ley 1333 de 2009. Quienes realicen estas actividades ilícitas incurrirán en prisión de 4 a 9 años y multas hasta de 35.000 SMLV de acuerdo a la Ley 1453 de 2011.</li>
                <li>Está prohibido el tráfico y comercialización ilegal de bienes de interés cultural de acuerdo a lo establecido en la Ley 1185 de 2008</li>
            </ul>
        </section>
        
                ${policiesText ? `
                <section class="terms-section" style="margin-top: 30px;">
                    <h2>Políticas de la agencia</h2>
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; border: 1px solid #d1d5db; margin: 20px 0;">
                        <p style="white-space: pre-wrap; line-height: 1.8; color: #333; margin: 0; font-family: 'Roboto', 'Arial', 'Helvetica', sans-serif;">${policiesText}</p>
                    </div>
                </section>
                ` : ''}

        <div class="contact-section">
            <h2>¿Preguntas?</h2>
            <p><strong>Contáctanos</strong></p>
            <p>Whatsapp y Llamadas: <a href="tel:${telefonoAgencia}">${telefonoAgencia}</a></p>
            
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

      const informacionD = JSON.stringify({
        total: Math.round(total),
        markup: Math.round(totalConMarkup),
        porcentajemarkup: markupPorcentaje,
        mascotasNumber: datosReserva[0]?.mascotas || null,
        adicionAlmuerzo: false,
        hotelInfo:{
          name: nombreHotelId(datosReserva[0]?.hotelidAutocore) || "",
        },
        adicionCena: false,
        titularInfo: {
          firstName: formData.nombreCompleto,
          lastName: formData.apellidos,
          tipoDocumento: formData.tipoDocumento,
          documento: formData.numeroDocumento,
          fechaNacimiento: formData.fechaNacimiento,
        },
        infoTransporte: null,
        infoToures: null,
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
            currency: "COP",
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
                currency: "COP",
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
          {/* Header */}
          <div className="header">
          </div>

          {/* Formulario de Información del Huésped */}
          <div className="card">
            <div className="logos" style={{ display: "flex", alignItems: "center", gap: "15px", justifyContent: "flex-start" }}>
              <img src={logoAgencia?.imageUrl || "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg"}
                alt="Logo Agencia" className="logo" style={{ width: "200px", height: "200px" }} />
              
              
              
              
              
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
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
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#26547B",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
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
                    <option value="cedulaC">Cédula de ciudadanía</option>
                    <option value="cedulaE">Cédula de extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="otro">Otro</option>
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
          </div>

          {/* Información de la Reserva */}
          {datosReserva && datosReserva.length > 0 && (
            <div className="card">
              <h2 className="title">Información de la reserva</h2>

              <h3 className="subtitle">{nombreHotelId(datosReserva[0].hotelidAutocore)}</h3>
              <div className="contact-item">
                <MapPin className="icon" />
                <span>Bocagrande Cra 3 N° 4-86. Cartagena de Indias, Bolívar</span>
                <div className="contact-item">
                  <Phone className="icon" />
                  <span>+57 333 602 50 21</span>
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
                    {datosReserva.map((data, index) => (
                      <tr key={data.roomId || index}>
                        <td className="td">{data.NombreH || 'Habitación estándar'}</td>
                        <td className="td">{data.descripcion || 'Incluye desayuno y servicios básicos'}</td>
                        <td className="td">{data.nights}</td>
                        <td className="td">${data.precioBase ? data.precioBase.toLocaleString() : '0'}</td>
                        <td className="td">${data.precio ? data.precio.toLocaleString() : '0'}</td>
                      </tr>
                    ))}
                    <tr className="table-subtotal">
                      <td colSpan="4" className="td-total">Subtotal</td>
                      <td className="td-amount">${subtotal.toLocaleString()}</td>
                    </tr>
                    <tr className="table-subtotal">
                      <td colSpan="4" className="td-total">{exentoIva ? 'IVA 0% (Exento extranjero)' : 'IVA 19%'}</td>
                      <td className="td-amount">${iva.toLocaleString()}</td>
                    </tr>
                    <tr className="table-total">
                      <td colSpan="4" className="td-total-label">Precio total para la agencia
                        <img
                          src="https://space-img.sfo3.digitaloceanspaces.com/Logos/tooltip.png"
                          alt="Información"
                          data-tooltip-id="tooltip-precio-agencia"
                          data-tooltip-content="Este valor no se mostrará en la cotización"
                          data-tooltip-place="right"
                          style={{ width: "16px", height: "16px", cursor: "help", marginLeft: "6px" }}
                        />
                      </td>
                      <td className="td-total-amount">${total.toLocaleString()}</td>
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
                              <p><strong>Tipo de traslado:</strong> {datosReserva[0].tipoTraslado}</p>
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
                                <li key={index}>{tour.nombre || tour.titulo || `Tour ${index + 1}`}</li>
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

            <div className="price-section">
              <div className="price-row">
                <span className="price-label">Precio base</span>
                <span className="price-value">${total.toLocaleString()}</span>
              </div>
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
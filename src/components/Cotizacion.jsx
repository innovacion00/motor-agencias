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
    1: "Hotel Azuan Suites", // Hotel Azuan Suites
    4: "Hotel Aixo Suites", // Hotel Aixo Suites
    5: "Hotel Abi Inn", // Hotel Abi Inn
    6: "Hotel Avexi Suites", // Hotel Avexi Suites
    7: "Hotel Bocagrande Suites", // Hotel Bocagrande Suites
    9: "Hotel Marina Suites", // Hotel Marina Suites
    56: "Hotel Boquilla Suites", // Hotel Boquilla Suites
    // Hoteles Santa Marta
    8: "Hotel Rodadero ", // Hotel Rodadero 
    2: "Hotel 1525", // Hotel 1525
    48: "Hotel Axis Inn", // Hotel Axis Inn
    44: "Hotel Sansiraka Inn", // Hotel Sansiraka Inn


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
  const iva = Math.round(subtotal * 0.19) || 0;
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
          name: "",
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
        exentoIva: false,
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
        throw new Error("Error al enviar la cotización");
      }
    } catch (error) {
      console.error("Error al enviar cotización:", error);
      Swal.fire({
        icon: "error",
        title: "Error al enviar cotización",
        text: `No se pudo enviar la cotización. ${error.message}`,
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
                      <td colSpan="4" className="td-total">IVA 19%</td>
                      <td className="td-amount">${iva.toLocaleString()}</td>
                    </tr>
                    <tr className="table-total">
                      <td colSpan="4" className="td-total-label">Total</td>
                      <td className="td-total-amount">${total.toLocaleString()}</td>
                    </tr>
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
                    <span className="accordion-title">Políticas de la reserva</span>
                    <ChevronDown className={`icon-chevron ${showPoliticas ? 'rotated' : ''}`} />
                  </button>
                  {showPoliticas && (
                    <div className="accordion-content">
                      <p className="text">Políticas de cancelación y modificación...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Políticas de la Agencia */}
          <div className="card">
            <h2 className="title">Políticas de la agencia</h2>

            <div className="editor">
              <div className="toolbar">
                <button className="tool-btn"><strong>B</strong></button>
                <button className="tool-btn"><em>I</em></button>
                <button className="tool-btn"><u>U</u></button>
                <div className="separator"></div>
                <button className="tool-btn">≡</button>
                <button className="tool-btn">≡</button>
                <button className="tool-btn">≡</button>
                <button className="tool-btn">≡</button>
                <div className="separator"></div>
                <button className="tool-btn">• •</button>
                <button className="tool-btn">1.</button>
              </div>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Escribe las observaciones"
                className="textarea"
              />
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
                  placeholder="Ej: 9,5"
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

    </div>
  );
}
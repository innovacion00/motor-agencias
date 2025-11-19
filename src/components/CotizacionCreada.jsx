import React, { useEffect, useState } from 'react';
import { MapPin, Phone, ChevronDown, User, Mail, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import '/public/styles/Cotizacion.css';
import { Tooltip } from 'react-tooltip';
import { cotizaciones, cotizacionData } from '../stores/cotizaciones';
import { useStore } from '@nanostores/react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { refreshToken } from '../stores/authtoken';

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
    123: "Playa Salguero Hotel", // Hotel Playa Salguero

    // Hoteles Bogota
    10: "Hotel Windsor", // Hotel Windsor
    3: "Hotel Madisson", // Hotel Madisson

  };
    return hotelMap[hotelId] || "Hotel no encontrado";
};

// Función para obtener las imágenes del hotel basado en el ID
const getHotelImagesById = (hotelId) => {
    const hotelImagesMap = {
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
        10: {
            main: "https://www.gehsuites.com/multimedia/galerias/5HotelWindsorHouse704.jpg",
            secondary1: "https://www.gehsuites.com/multimedia/galerias/16HotelWindsorHouse427.jpg",
            secondary2: "https://www.gehsuites.com/multimedia/galerias/20HotelWindsorHouse922.jpg"
        },
        3: {
            main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison10238.jpg",
            secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison8955.jpg",
            secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/madison6250.jpg"
        },
        123: {
            main: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/lobby_salguero.jpg",
            secondary1: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/cafeteria2_salguero.jpg",
            secondary2: "https://space-img.sfo3.digitaloceanspaces.com/Agencias/piscina_salguero.jpg"
        }
    };
    return hotelImagesMap[hotelId] || {
        main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
        secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
        secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg"
    };
};

// Mapa inverso: nombre -> id para resolver imágenes cuando solo hay nombre
const getHotelIdByName = (hotelName) => {
    if (!hotelName) return undefined;
    const normalized = String(hotelName).trim().toLowerCase();
    const nameToId = {
        // Hoteles Cartagena (nombres nuevos y anteriores)
        "hotel azuan": 1,
        "hotel azuan suites": 1,
        "hotel aixo": 4,
        "hotel aixo suites": 4,
        "hotel abi": 5,
        "hotel abi inn": 5,
        "hotel avexi": 6,
        "hotel avexi suites": 6,
        "hotel bocagrande": 7,
        "hotel bocagrande suites": 7,
        "hotel marina": 9,
        "hotel marina suites": 9,
        "hotel boquilla": 56,
        "hotel boquilla suites": 56,
        // Hoteles Santa Marta
        "hotel rodadero": 8,
        "hotel 1525": 2,
        "hotel axis": 48,
        "hotel axis inn": 48,
        "hotel sansiraka": 44,
        "hotel sansiraka inn": 44,
        // Hoteles Bogotá
        "hotel windsor": 10,
        "hotel madisson": 3,
    };
    return nameToId[normalized];
};

export const CotizacionCreada = ({ id }) => {
    const [showReservaIncluye, setShowReservaIncluye] = useState(false);
    const [showPoliticas, setShowPoliticas] = useState(false);
    const [decision, setDecision] = useState(null); // 'aceptar' | 'rechazar'
    const [loading, setLoading] = useState(true);
    const [logoAgencia, setLogoAgencia] = useState();
    const [policiesText, setPoliciesText] = useState("");
    const [policiesLoading, setPoliciesLoading] = useState(false);
    const cotizacion = useStore(cotizacionData);

    useEffect(() => {
        const fetchCotizacion = async () => {
            if (id) {
                setLoading(true);
                await cotizaciones({ id: id });
                setLoading(false);
            }
        };
        fetchCotizacion();
    }, [id]);

    // Cargar logo de la agencia desde localStorage (datosUsuario.imageUrl)
    useEffect(() => {
        try {
            const datosDelUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
            if (datosDelUsuario) {
                setLogoAgencia(datosDelUsuario);
            }
        } catch (_) {
            // Ignorar errores de parseo y continuar con fallback
        }
    }, []);

    // Función fetchWithToken para obtener políticas
    const fetchWithTokenForPolicies = async (url, options = {}) => {
        let token = Cookies.get('accessToken');
        let response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
          }
        }
        return response;
    };

    //#region Obtener políticas de la agencia
    const obtenerPoliticasAgencia = async () => {
        const datosDelUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
        if (!datosDelUsuario?.agencia?._id) {
            return;
        }

        try {
            setPoliciesLoading(true);
            const response = await fetchWithTokenForPolicies(
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

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h2>Cargando cotización...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (!cotizacion) {
        return (
            <div className="container">
                <div className="card">
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h2>No se pudo cargar la cotización</h2>
                        <p>Recargue la pagina o intente nuevamente mas tarde.</p>
                    </div>
                </div>
            </div>
        );      
    }

    const fetchWithToken = async (url, options = {}) => {
        let token = Cookies.get('accessToken');
        let response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
          }
        }
        return response;
      };

    const url = import.meta.env.PUBLIC_API_URL;

    const handleAceptar = () => {
        Swal.fire({
            title: '¿Aceptar cotización?',
            text: 'Al aceptar, se creará la reserva automáticamente. ¿Desea continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aceptar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (!cotizacion?.tokenAcceso) {
                        Swal.fire({
                            title: 'Acción no disponible',
                            text: 'Genere primero el link público de la cotización para habilitar la respuesta del cliente.',
                            icon: 'info',
                            confirmButtonColor: '#26547B'
                        });
                        return;
                    }
                    const response = await fetch(`${url}/agencias/v1/cotizaciones/public/responder/${cotizacion.tokenAcceso}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 1 })
                    });
                    if (response.ok) {
                        setDecision('aceptar');
                        Swal.fire({
                            title: '¡Cotización aceptada!',
                            text: 'La respuesta ha sido registrada y la reserva será creada automáticamente.',
                            icon: 'success',
                            confirmButtonColor: '#059669'
                        });
                    } else {
                        throw new Error('Error al enviar la respuesta');
                    }
                } catch (error) {
                    console.error('Error al aceptar cotización:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo procesar la respuesta. Intente nuevamente.',
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                }
            }
        });
    };

    const handleRechazar = () => {
        Swal.fire({
            title: '¿Rechazar cotización?',
            text: '¿Está seguro de que desea rechazar esta cotización?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (!cotizacion?.tokenAcceso) {
                        Swal.fire({
                            title: 'Acción no disponible',
                            text: 'Genere primero el link público de la cotización para habilitar la respuesta del cliente.',
                            icon: 'info',
                            confirmButtonColor: '#26547B'
                        });
                        return;
                    }
                    const response = await fetch(`${url}/agencias/v1/cotizaciones/public/responder/${cotizacion.tokenAcceso}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 2 })
                    });
                    if (response.ok) {
                        setDecision('rechazar');
                        Swal.fire({
                            title: 'Cotización rechazada',
                            text: 'La respuesta ha sido registrada.',
                            icon: 'info',
                            confirmButtonColor: '#6b7280'
                        });
                    } else {
                        throw new Error('Error al enviar la respuesta');
                    }
                } catch (error) {
                    console.error('Error al rechazar cotización:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo procesar la respuesta. Intente nuevamente.',
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                }
            }
        });
    };
    // Extraer datos de la cotización
    const reservaInfo = cotizacion.reservation || {};
    const titularInfo = cotizacion.titularInfo || {};
    const roomsData = reservaInfo.roomsData || [];
    const agency = reservaInfo.agency || {};

    // Determinar el nombre del hotel priorizando hotelInfo.name cuando esté disponible
    const hotelName =
        (cotizacion?.hotelInfo && cotizacion.hotelInfo.name) ||
        (reservaInfo?.hotelInfo && reservaInfo.hotelInfo.name) ||
        (roomsData[0]?.hotelInfo && roomsData[0].hotelInfo.name) ||
        cotizacion?.hotel ||
        nombreHotelId(roomsData[0]?.hotelidAutocore || roomsData[0]?.id || 1);

    // Resolver un ID de hotel confiable para la galería
    const candidateHotelId =
        roomsData[0]?.hotelidAutocore ||
        getHotelIdByName(hotelName) ||
        undefined;

    // Calcular totales (respetar exención de IVA)
    const subtotal = roomsData.reduce((sum, room) => sum + (room.unitaryPrice || 0), 0);
    const exentoIva = !!cotizacion?.exentoIva;
    const iva = exentoIva ? 0 : Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    
    // Calcular markup si existe
    const markupAmount = cotizacion.markup ? cotizacion.markup - total : 0;
    const markupPorcentaje = total > 0 ? Math.round((markupAmount / total) * 100) : 0;

    // Función para descargar PDF
    const handleDownloadPDF = async () => {
        try {
            const accessToken = Cookies.get('accessToken');
            
            Swal.fire({
                title: 'Generando PDF...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const url = `${import.meta.env.PUBLIC_API_URL}/agencias/v1/cotizaciones/pdf`;
            const response = await fetchWithToken(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    cotizacionId: cotizacion._id
                })
            });

            if (response.ok) {
                const pdfUrl = await response.text(); // El endpoint devuelve el link directamente como texto
                
                if (pdfUrl && pdfUrl.trim()) {
                    // Crear un enlace temporal para descargar desde Cloudinary
                    const link = document.createElement('a');
                    link.href = pdfUrl.trim();
                    link.download = `cotizacion-${cotizacion._id}.pdf`;
                    link.target = '_blank'; // Abrir en nueva pestaña como respaldo
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    Swal.fire({
                        icon: 'success',
                        title: 'PDF descargado',
                        text: 'La cotización se ha descargado exitosamente',
                        confirmButtonColor: '#059669'
                    });
                } else {
                    throw new Error('No se recibió el link del PDF');
                }
            } else {
                throw new Error('Error al generar el PDF');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el PDF. Intente nuevamente.',
                confirmButtonColor: '#d33'
            });
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

                    {/* Información del Huésped */}
                    <div className="card">
                        <div className="logos" style={{ justifyContent: "flex-end" }}>
                            <img
                                src={logoAgencia?.imageUrl || agency.imageUrl || "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg"}
                                alt="Logo Agencia"
                                className="logo"
                                style={{ width: "100px", height: "100px" }}
                            />
                        </div>
                        <div className="badge-container">
                            <span className="badge" style={{ 
                                backgroundColor: 
                                    cotizacion.status === 2 ? '#dc2626' : 
                                    cotizacion.status === 1 ? '#059669' : 
                                    cotizacion.status === 3 ? '#8b5cf6' : 
                                    '#3b82f6' 
                            }}>
                                {cotizacion.status === 2 ? 'Estado: cotización rechazada' : 
                                 cotizacion.status === 1 ? 'Estado: cotización aceptada' : 
                                 cotizacion.status === 3 ? 'Estado: cotización convertida en reserva' : 
                                 'Estado: cotización generada'}
                            </span>
                        </div>

                        <h2 className="title">Información del huésped</h2>

                        <div style={{ marginTop: "20px" }}>
                            <fieldset style={{
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                padding: "15px",
                                marginBottom: "20px",
                            }}>
                                <legend>Datos del titular</legend>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <label className="label">
                                            <User className="icon" style={{ marginRight: '8px' }} />
                                            Tipo de documento
                                        </label>
                                        <p className="value">{titularInfo.tipoDocumento || 'No especificado'}</p>
                                    </div>

                                    <div className="info-item">
                                        <label className="label">
                                            <CreditCard className="icon" style={{ marginRight: '8px' }} />
                                            Número de documento
                                        </label>
                                        <p className="value">{titularInfo.documento || 'No especificado'}</p>
                                    </div>

                                    <div className="info-item">
                                        <label className="label">
                                            <User className="icon" style={{ marginRight: '8px' }} />
                                            Nombre completo
                                        </label>
                                        <p className="value">{titularInfo.firstName || 'No especificado'}</p>
                                    </div>

                                    <div className="info-item">
                                        <label className="label">
                                            <User className="icon" style={{ marginRight: '8px' }} />
                                            Apellidos
                                        </label>
                                        <p className="value">{titularInfo.lastName || 'No especificado'}</p>
                                    </div>

                                    <div className="info-item">
                                        <label className="label">
                                            <Calendar className="icon" style={{ marginRight: '8px' }} />
                                            Fecha de nacimiento
                                        </label>
                                        <p className="value">{titularInfo.fechaNacimiento || 'No especificado'}</p>
                                    </div>

                                    <div className="info-item">
                                        <label className="label">
                                            <Mail className="icon" style={{ marginRight: '8px' }} />
                                            Correo electrónico
                                        </label>
                                        <p className="value">{reservaInfo.email || 'No especificado'}</p>
                                    </div>

                                    <div className="info-item">
                                        <label className="label">
                                            <Phone className="icon" style={{ marginRight: '8px' }} />
                                            Teléfono
                                        </label>
                                        <p className="value">{reservaInfo.telephone || 'No especificado'}</p>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>

                    {/* Información de la Reserva */}
                    {roomsData.length > 0 && (
                        <div className="card">
                            <h2 className="title">Información de la reserva</h2>

                            <h3 className="subtitle">{hotelName}</h3>
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
                                        src={getHotelImagesById(candidateHotelId || 1).main}
                                        alt={`Vista principal del ${hotelName || nombreHotelId(candidateHotelId || 1)}`}
                                        className="hotel-main-img"
                                    />
                                </div>
                                <div className="secondary-images">
                                    <div className="secondary-image">
                                        <img
                                            src={getHotelImagesById(candidateHotelId || 1).secondary1}
                                            alt={`Vista secundaria 1 del ${hotelName || nombreHotelId(candidateHotelId || 1)}`}
                                            className="hotel-secondary-img"
                                        />
                                    </div>
                                    <div className="secondary-image">
                                        <img
                                            src={getHotelImagesById(candidateHotelId || 1).secondary2}
                                            alt={`Vista secundaria 2 del ${hotelName || nombreHotelId(candidateHotelId || 1)}`}
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
                                    <p className="value">{reservaInfo.checkin || 'No especificado'}</p>
                                </div>
                                <div className="date-item">
                                    <p className="label">Check-out</p>
                                    <p className="value">{reservaInfo.checkout || 'No especificado'}</p>
                                </div>
                                <div className="date-item">
                                    <p className="label">Noches</p>
                                    <p className="value">{reservaInfo.nights || 'No especificado'}</p>
                                </div>
                                <div className="date-item">
                                    <p className="label">Huéspedes</p>
                                    <p className="value">{`${reservaInfo.adults || 0} adultos, ${reservaInfo.children || 0} niños`}</p>
                                </div>
                                <div className="date-item">
                                    <p className="label">Habitaciones</p>
                                    <p className="value">{roomsData.length}</p>
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
                                        {roomsData.map((room, index) => (
                                            <tr key={room.id || index}>
                                                <td className="td">{room.nombreHabitacion || 'Habitación estándar'}</td>
                                                <td className="td">Incluye desayuno y servicios básicos</td>
                                                <td className="td">{reservaInfo.nights || '1'}</td>
                                                <td className="td">${room.unitaryPrice ? room.unitaryPrice.toLocaleString() : '0'}</td>
                                                <td className="td">${room.unitaryPrice ? room.unitaryPrice.toLocaleString() : '0'}</td>
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
                                        {markupAmount > 0 && (
                                            <tr className="table-total" style={{ backgroundColor: "#f0f9ff", borderTop: "2px solid #059669" }}>
                                                <td colSpan="4" className="td-total-label" style={{ color: "#059669", fontWeight: "600" }}>
                                                    Precio total para tu cliente ({markupPorcentaje}%)
                                                </td>
                                                <td className="td-total-amount" style={{ color: "#059669", fontWeight: "600" }}>
                                                    ${cotizacion.markup.toLocaleString()}
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
                                                <p><strong>Plan de alimentación:</strong> {roomsData[0]?.planAlimentario || cotizacion?.planAlimentario || 'No especificado'}</p>

                                                {cotizacion?.mascotasNumber > 0 && (
                                                    <p><strong>Mascotas permitidas:</strong> {cotizacion.mascotasNumber} mascota(s)</p>
                                                )}

                                                {cotizacion?.infoTransporte ? (
                                                    <div>
                                                        <p><strong>Traslado incluido:</strong> Sí</p>
                                                        {cotizacion.infoTransporte.tipo && (
                                                            <p><strong>Tipo de traslado:</strong> {cotizacion.infoTransporte.tipo}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p><strong>Traslado incluido:</strong> No</p>
                                                )}

                                                {cotizacion?.infoToures && cotizacion.infoToures.length > 0 ? (
                                                    <div>
                                                        <p><strong>Tours incluidos:</strong></p>
                                                        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                                            {cotizacion.infoToures.map((tour, index) => (
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
                                            <p className="text">• Cancelación gratuita hasta 24 horas antes del check-in<br />
                                                • No reembolsable después del check-in<br />
                                                • Modificaciones sujetas a disponibilidad<br />
                                                • Check-in: 15:00 | Check-out: 12:00</p>
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
                            
                            <div className="textarea" style={{
                                padding: '16px',
                                minHeight: '160px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontFamily: 'Roboto, sans-serif',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}>
                                {policiesLoading ? (
                                    <p style={{ margin: 0, color: '#666' }}>Cargando políticas...</p>
                                ) : policiesText ? (
                                    <p style={{ margin: 0, color: '#1C3D5A' }}>{policiesText}</p>
                                ) : (
                                    <p style={{ margin: 0, color: '#666' }}>No hay políticas configuradas</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Lateral - Resumen */}
                <div className="sidebar">
                    <div className="card sidebar-card">
                        <h3 className="title">Resumen de la cotización</h3>

                        <div className="price-section">
                            <div className="price-row">
                                <span className="price-label">Precio base</span>
                                <span className="price-value">${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">{exentoIva ? 'IVA 0% (Exento extranjero)' : 'IVA 19%'}</span>
                                <span className="price-value">${iva.toLocaleString()}</span>
                            </div>
                            <div className="price-row" style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px", marginTop: "8px" }}>
                                <span className="price-label" style={{ fontWeight: "600" }}>Precio total para la agencia
                                    <img
                                        src="https://space-img.sfo3.digitaloceanspaces.com/Logos/tooltip.png"
                                        alt="Información"
                                        data-tooltip-id="tooltip-precio-agencia"
                                        data-tooltip-content="Este valor no se mostrará en la cotización"
                                        data-tooltip-place="right"
                                        style={{ width: "16px", height: "16px", cursor: "help", marginLeft: "6px" }}
                                    />
                                </span>
                                <span className="price-value" style={{ fontWeight: "600", color: "#059669" }}>${total.toLocaleString()}</span>
                            </div>
                            {markupAmount > 0 && (
                                <div className="price-row">
                                    <span className="price-label" style={{ fontWeight: "600" }}>Precio total para tu cliente ({markupPorcentaje}%)</span>
                                    <span className="price-value" style={{ fontWeight: "600", color: "#059669" }}>${cotizacion.markup.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={cotizacion?.status !== 0}
                                style={{
                                    fontWeight: '500',
                                    backgroundColor: '#26547B',
                                    color: 'white',
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: cotizacion?.status !== 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    width: '100%',
                                    opacity: cotizacion?.status !== 0 ? 0.5 : 1
                                }}
                            >
                                Descargar PDF
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const publicUrl = `${window.location.origin}/cotizacion-publica/${id}`;
                                        await navigator.clipboard.writeText(publicUrl);
                                        alert('Link público de cotización copiado al portapapeles');
                                    } catch (e) {
                                        alert('No se pudo copiar el link. Intente manualmente.');
                                    }
                                }}
                                disabled={cotizacion?.status !== 0}
                                style={{
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    color: '#26547B',
                                    padding: '12px 16px',
                                    border: '1px solid #26547B',
                                    borderRadius: '5px',
                                    cursor: cotizacion?.status !== 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    width: '100%',
                                    opacity: cotizacion?.status !== 0 ? 0.5 : 1
                                }}
                            >
                                Generar link de cotización
                            </button>
                        </div>
                    </div>

                    {/* Recuadro: Aceptar / Rechazar cotización */}
                    <div className="card sidebar-card" style={{ marginTop: '16px' }}>
                       

                        {/* Mensajes de estado si ya hay respuesta */}
                        {cotizacion?.status === 1 && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '8px',
                                border: '1px solid #22c55e',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle style={{ color: '#22c55e' }} />
                                    <span style={{ color: '#166534', fontWeight: 600 }}>Cotización aceptada</span>
                                </div>
                            </div>
                        )}
                        {cotizacion?.status === 2 && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fef2f2',
                                borderRadius: '8px',
                                border: '1px solid #ef4444',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <XCircle style={{ color: '#ef4444' }} />
                                    <span style={{ color: '#991b1b', fontWeight: 600 }}>Cotización rechazada</span>
                                </div>
                            </div>
                        )}

                        {/* Botones (visibles solo cuando status === 0) */}
                        {cotizacion?.status === 0 && (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <button
                                onClick={handleAceptar}
                                style={{
                                    fontWeight: '500',
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <CheckCircle size={18} />
                                Cotización aceptada
                            </button>
                            <button
                                onClick={handleRechazar}
                                style={{
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    color: '#ef4444',
                                    padding: '12px 16px',
                                    border: '1px solid #ef4444',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <XCircle size={18} />
                                Cotización rechazada
                            </button>
                        </div>
                        )}
                    </div>
                </div>
            </div>
            <Tooltip id="tooltip-precio-agencia" className="custom-tooltip" />
        </div>
    );
};


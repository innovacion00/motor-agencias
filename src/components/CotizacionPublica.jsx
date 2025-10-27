import React, { useEffect, useState } from 'react';
import { MapPin, Phone, ChevronDown, User, Mail, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import '/public/styles/Cotizacion.css';
import { useStore } from '@nanostores/react';
import Swal from 'sweetalert2';

// Función para obtener el nombre del hotel basado en el ID
const nombreHotelId = (hotelId) => {
    const hotelMap = {
        // Hoteles Cartagena
        1: "Hotel Azuan Suites",
        4: "Hotel Aixo Suites",
        5: "Hotel Abi Inn",
        6: "Hotel Avexi Suites",
        7: "Hotel Bocagrande Suites",
        9: "Hotel Marina Suites",
        56: "Hotel Boquilla Suites",
        // Hoteles Santa Marta
        8: "Hotel Rodadero",
        2: "Hotel 1525",
        48: "Hotel Axis Inn",
        44: "Hotel Sansiraka Inn",
        // Hoteles Bogotá
        10: "Hotel Windsor",
        3: "Hotel Madisson",
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
        }
    };
    return hotelImagesMap[hotelId] || {
        main: "https://www.gehsuites.com/images/fachada-azuan.jpg",
        secondary1: "https://www.gehsuites.com/images/galeria_11_aixo.jpg",
        secondary2: "https://www.gehsuites.com/images/portada_marian_suites.jpg"
    };
};

export const CotizacionPublica = ({ id }) => {
    const [showReservaIncluye, setShowReservaIncluye] = useState(false);
    const [showPoliticas, setShowPoliticas] = useState(false);
    const [loading, setLoading] = useState(true);
    const [decision, setDecision] = useState(null); // 'aceptar' o 'rechazar'
    const [cotizacion, setCotizacion] = useState(null);

    // Función para obtener cotización pública sin autenticación
    const fetchCotizacionPublica = async (cotizacionId) => {
        try {
            const response = await fetch(`http://localhost:3000/agencias/v1/cotizaciones/public/${cotizacionId}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Cotización pública:', data);
                setCotizacion(data);
                return data;
            } else {
                throw new Error("Error al consultar la API pública");
            }
        } catch (error) {
            console.error('Error al obtener la cotización pública:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadCotizacion = async () => {
            if (id) {
                setLoading(true);
                await fetchCotizacionPublica(id);
                setLoading(false);
            }
        };
        loadCotizacion();
    }, [id]);

    const handleAceptar = () => {
        Swal.fire({
            title: '¿Aceptar cotización?',
            text: '¿Está seguro de que desea aceptar esta cotización?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aceptar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Llamar al endpoint para aceptar la cotización
                    const response = await fetch(`http://localhost:3000/agencias/v1/cotizaciones/public/responder/${cotizacion.tokenAcceso}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            status: 1
                        })
                    });

                    if (response.ok) {
                        setDecision('aceptar');
                        Swal.fire({
                            title: '¡Cotización aceptada!',
                            text: 'Su respuesta ha sido registrada. Nos pondremos en contacto con usted pronto.',
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
                        text: 'No se pudo procesar su respuesta. Intente nuevamente.',
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
                    // Llamar al endpoint para rechazar la cotización
                    const response = await fetch(`http://localhost:3000/agencias/v1/cotizaciones/public/responder/${cotizacion.tokenAcceso}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            status: 2,
                        })
                    });

                    if (response.ok) {
                        setDecision('rechazar');
                        Swal.fire({
                            title: 'Cotización rechazada',
                            text: 'Su respuesta ha sido registrada. Gracias por su tiempo.',
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
                        text: 'No se pudo procesar su respuesta. Intente nuevamente.',
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                }
            }
        });
    };

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
                        <p>Verifique que el ID de la cotización sea correcto.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Extraer datos de la cotización
    const reservaInfo = cotizacion.reservation || {};
    const titularInfo = cotizacion.titularInfo || {};
    const roomsData = reservaInfo.roomsData || [];
    const agency = reservaInfo.agency || {};

    // Calcular totales
    const subtotal = roomsData.reduce((sum, room) => sum + (room.unitaryPrice || 0), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return (
        <div className="container">
            <div className="layout">
                {/* Columna Principal */}
                <div className="main-content">
                    {/* Header */}
                    <div className="header">
                    </div>

                    {/* Aviso de precios sujetos a cambio */}
                    <div className="card" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '24px' }}>⚠️</div>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Aviso importante</h3>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                                    Los precios mostrados están sujetos a cambio después de 24 horas. 
                                    Esta cotización es válida hasta el {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información del Huésped */}
                    <div className="card">
                        <div className="logos" style={{ justifyContent: "flex-end" }}>
                            <img
                                src={agency.imageUrl || "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg"}
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
                                    '#3b82f6' 
                            }}>
                                {cotizacion.status === 2 ? 'Cotización Rechazada' : 
                                 cotizacion.status === 1 ? 'Cotización Aceptada' : 
                                 'Cotización Generada'}
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

                            <h3 className="subtitle">{nombreHotelId(roomsData[0]?.hotelidAutocore || 1)}</h3>
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
                                        src={getHotelImagesById(roomsData[0]?.id || 1).main}
                                        alt={`Vista principal del ${nombreHotelId(roomsData[0]?.id || 1)}`}
                                        className="hotel-main-img"
                                    />
                                </div>
                                <div className="secondary-images">
                                    <div className="secondary-image">
                                        <img
                                            src={getHotelImagesById(roomsData[0]?.id || 1).secondary1}
                                            alt={`Vista secundaria 1 del ${nombreHotelId(roomsData[0]?.id || 1)}`}
                                            className="hotel-secondary-img"
                                        />
                                    </div>
                                    <div className="secondary-image">
                                        <img
                                            src={getHotelImagesById(roomsData[0]?.id || 1).secondary2}
                                            alt={`Vista secundaria 2 del ${nombreHotelId(roomsData[0]?.id || 1)}`}
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
                            <div className="textarea" style={{
                                padding: '16px',
                                minHeight: '160px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px'
                            }}>
                                <p style={{ margin: 0, color: '#1C3D5A' }}>
                                    Esta cotización ha sido generada por {agency.fullName || 'la agencia'} el {new Date().toLocaleDateString('es-ES')}.<br /><br />
                                    • Precios sujetos a disponibilidad<br />
                                    • Válida por 24 horas<br />
                                    • Pago requerido para confirmar la reserva<br />
                                    • Contacto: {reservaInfo.email || 'No especificado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Lateral - Resumen y Acciones */}
                <div className="sidebar">
                    <div className="card sidebar-card">
                        <h3 className="title">Resumen de la cotización</h3>

                        <div className="price-section">
                            <div className="price-row">
                                <span className="price-label">Precio base</span>
                                <span className="price-value">${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">IVA 19%</span>
                                <span className="price-value">${iva.toLocaleString()}</span>
                            </div>
                            <div className="price-row" style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px", marginTop: "8px" }}>
                                <span className="price-label" style={{ fontWeight: "600" }}>Total</span>
                                <span className="price-value" style={{ fontWeight: "600", color: "#059669" }}>${total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Estado de la decisión */}
                        {decision && (
                            <div style={{ 
                                marginTop: '20px', 
                                padding: '16px', 
                                backgroundColor: decision === 'aceptar' ? '#f0fdf4' : '#fef2f2', 
                                borderRadius: '8px', 
                                border: `1px solid ${decision === 'aceptar' ? '#22c55e' : '#ef4444'}` 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    {decision === 'aceptar' ? (
                                        <CheckCircle style={{ color: '#22c55e' }} />
                                    ) : (
                                        <XCircle style={{ color: '#ef4444' }} />
                                    )}
                                    <h4 style={{ margin: 0, color: decision === 'aceptar' ? '#166534' : '#991b1b' }}>
                                        {decision === 'aceptar' ? 'Cotización Aceptada' : 'Cotización Rechazada'}
                                    </h4>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: decision === 'aceptar' ? '#166534' : '#991b1b' }}>
                                    {decision === 'aceptar' 
                                        ? 'Su respuesta ha sido registrada. Nos pondremos en contacto con usted pronto.'
                                        : 'Su respuesta ha sido registrada. Gracias por su tiempo.'
                                    }
                                </p>
                            </div>
                        )}

                        {/* Botones de acción */}
                        {!decision && (
                            <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
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
                                    Aceptar Cotización
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
                                    Rechazar Cotización
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

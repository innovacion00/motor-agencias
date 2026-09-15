import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Phone, ChevronDown, User, Mail, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import '/public/styles/Cotizacion.css';
import { useStore } from '@nanostores/react';
import Swal from 'sweetalert2';
import VueloCotizacionDetalle from './VueloCotizacionDetalle';
import { getHotelImagesById, getHotelIdByName } from '../utils/hotelesImagenes';

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

// Función para obtener la dirección del hotel basado en el ID
const direccionHotelId = (hotelId) => {
    const direccionMap = {
        // Hoteles Cartagena
        1: "Bocagrande Cra 3 N° 8-156, Cartagena de Indias, Bolívar", // Hotel Azuan
        4: "Cra. 1 #47-10, Marbella, Cartagena de Indias, Provincia de Cartagena, Bolívar", // Hotel Aixo
        5: "Cartagena de indias, Barrio Marbella carrera 2 número 47- 10", // Hotel Abi
        6: "Bocagrande Cra 3 N° 4-86, Cartagena de Indias, Bolívar", // Hotel Avexi
        7: "Bocagrande Avenida San Martin Cra 2 N 7-159, Cartagena de Indias, Bolívar", // Hotel Bocagrande
        9: "Bocagrande Cra 3 N° 4 -32, Cartagena de Indias, Bolívar", // Hotel Marina
        56: "Cra. 9 #38 - 76, La Boquilla, Provincia de Cartagena, Bolívar", // Hotel Boquilla
        // Hoteles Santa Marta
        8: "Cl. 20 #1B-64, Santa Marta, Gaira, Santa Marta, Magdalena", // Hotel Rodadero
        2: "Calle 11 # 2 - 29 Centro Histórico, Santa Marta, Magdalena", // Hotel 1525
        48: "Carrera 3 No. 10 - 40, El Rodadero, 470001 Santa Marta", // Hotel Axis
        44: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena", // Hotel Sansiraka
        123: "CRA 4 N° 23F05 Gaira, 470002", // Playa Salguero Hotel
        // Hoteles Bogotá
        10: "Chapinero, Calle 95 #9-97, Bogotá, Colombia", // Hotel Windsor
        3: "Cra 18 #93 - 97, Barrio el Chico, Bogotá, Colombia", // Hotel Madisson
    };

    return direccionMap[hotelId] || "Dirección no disponible";
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

const textoTrasladoDesdeInfoTransporte = (info) => {
    if (!info) return null;
    if (info.tipo) {
        if (info.tipo === 'aeropuerto_hotel') return 'Aeropuerto al hotel';
        if (info.tipo === 'hotel_aeropuerto') return 'Hotel al aeropuerto';
        if (info.tipo === 'ambos') return 'Aeropuerto al hotel | Hotel al aeropuerto';
        return String(info.tipo);
    }
    const tr = info.tipoRecogida;
    if (tr === 0) return 'Aeropuerto al hotel';
    if (tr === 1) return 'Hotel al aeropuerto';
    if (tr === 2) return 'Aeropuerto al hotel | Hotel al aeropuerto';
    return 'Incluido';
};

const nombresToursValidos = (infoToures) => {
    if (!infoToures?.nombres || !Array.isArray(infoToures.nombres)) return [];
    return infoToures.nombres.map((n) => String(n || '').trim()).filter(Boolean);
};

export const CotizacionPublica = ({ id }) => {
    const [showReservaIncluye, setShowReservaIncluye] = useState(false);
    const [showPoliticas, setShowPoliticas] = useState(false);
    const [loading, setLoading] = useState(true);
    const [decision, setDecision] = useState(null); // 'aceptar' o 'rechazar'
    const [cotizacion, setCotizacion] = useState(null);
    const [logoAgencia, setLogoAgencia] = useState(); // 👈 Añadido
    const containerRef = useRef(null);

    useEffect(() => {
        try {
            const datosDelUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
            if (datosDelUsuario) {
                setLogoAgencia(datosDelUsuario);
            }
        } catch (_) {
            // ignorar errores
        }
    }, []);

    const url = import.meta.env.PUBLIC_API_URL;
    // Función para obtener cotización pública sin autenticación
    const fetchCotizacionPublica = async (cotizacionId) => {
        try {
            const response = await fetch(`${url}/agencias/v1/cotizaciones/public/${id}`, {
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
                    // Obtener el HTML del componente
                    const landingHTML = containerRef.current ? containerRef.current.innerHTML : '';
                    
                    // Llamar al endpoint para aceptar la cotización
                    const response = await fetch(`${url}/agencias/v1/cotizaciones/public/responder/${cotizacion.tokenAcceso}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            status: 1,
                            
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
                    // Obtener el HTML del componente
                    const landingHTML = containerRef.current ? containerRef.current.innerHTML : '';
                    
                    // Llamar al endpoint para rechazar la cotización
                    const response = await fetch(`${url}/agencias/v1/cotizaciones/public/responder/${cotizacion.tokenAcceso}`, {
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

    // Resolver logo de la agencia de forma robusta
    const agencyLogoUrl =
        logoAgencia?.imageUrl || // 👈 Prioridad al logo de localStorage
        agency?.imageUrl ||
        cotizacion?.agency?.imageUrl ||
        cotizacion?.agencyImageUrl ||
        cotizacion?.agencyInfo?.imageUrl ||
        "https://res.cloudinary.com/dxxwg5jus/image/upload/v1760559192/agencias/geh%20suites/wphrr94oifquqkikx9ca.jpg";

    // Resolver nombre e id del hotel de forma robusta
    const hotelNameFromPayload =
        (cotizacion?.hotelInfo && cotizacion.hotelInfo.name) ||
        (reservaInfo?.hotelInfo && reservaInfo.hotelInfo.name) ||
        (roomsData[0]?.hotelInfo && roomsData[0].hotelInfo.name) ||
        cotizacion?.hotel;

    const candidateHotelId =
        roomsData[0]?.hotelidAutocore ||
        getHotelIdByName(hotelNameFromPayload) ||
        undefined;

    // Utilidad: calcular noches si no viene explícito
    const calculateNights = (checkin, checkout) => {
        if (!checkin || !checkout) return 0;
        const inDate = new Date(checkin);
        const outDate = new Date(checkout);
        const diffMs = outDate.getTime() - inDate.getTime();
        if (Number.isNaN(diffMs) || diffMs <= 0) return 0;
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
    };

    const nights = Number(reservaInfo?.nights) || calculateNights(reservaInfo?.checkin, reservaInfo?.checkout) || 1;

    // Calcular totales (respetar exención de IVA) y mostrar precio con markup si existe
    // El hospedaje se suma por cada habitación; los extras se cobran una sola vez.
    const tieneDesglose = roomsData.some((r) => r.precioHabitacion != null);
    const subtotal = tieneDesglose
        ? roomsData.reduce((sum, room) => sum + (Number(room.precioHabitacion) || 0), 0)
        : roomsData.reduce((sum, room) => sum + (room.unitaryPrice || 0), 0);
    const primerosRoom = roomsData[0] || {};
    const extrasCotizacion = tieneDesglose
        ? (Number(primerosRoom.precioToursHabitacion) || 0) +
          (Number(primerosRoom.precioTrasladoHabitacion) || 0) +
          (Number(primerosRoom.precioMascotasHabitacion) || 0)
        : 0;
    const exentoIva = !!cotizacion?.exentoIva;
    const iva = exentoIva ? 0 : Math.round(subtotal * 0.19);
    const total = subtotal + extrasCotizacion + iva;

    // Total sin markup que asume la agencia: cotizacion.total ya incluye hospedaje + vuelo
    const retencionesTotal =
        (cotizacion?.reteFuente?.resultado || 0) +
        (cotizacion?.reteIca?.resultado || 0) +
        (cotizacion?.reteIva?.resultado || 0);
    const totalAgencia = Math.round(
        typeof cotizacion?.total === 'number' && cotizacion.total > 0
            ? cotizacion.total
            : total - retencionesTotal
    );

    const totalConMarkup = typeof cotizacion?.markup === 'number' && cotizacion.markup > 0 ? cotizacion.markup : totalAgencia;
    const totalSinIvaConMarkup = exentoIva ? totalConMarkup : Math.round(totalConMarkup / 1.19);
    const subtotalHospedajeCliente = Math.max(0, totalConMarkup - extrasCotizacion);
    const factorMarkupPublica = subtotal > 0 ? subtotalHospedajeCliente / subtotal : 1;
    const textoTrasladoResumen = textoTrasladoDesdeInfoTransporte(cotizacion?.infoTransporte);
    const toursNombresResumen = nombresToursValidos(cotizacion?.infoToures);
    const cotizacionIncluyeVuelo =
        Array.isArray(cotizacion?.vuelo) && cotizacion.vuelo.length > 0;

    return (
        <div className="container" ref={containerRef}>
            <div className="card" style={{ padding: '24px' }}>
                <style>{`
                    .stack-gallery img { height: 420px; width: 90%; object-fit: cover; border-radius: 0; box-shadow: none; margin: 0 auto; }
                    .header-responsive { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; }
                    @media (max-width: 768px) {
                        .stack-gallery img { height: 360px; width: 95%; }
                        .container { padding: 16px !important; }
                        .card { padding: 16px !important; }
                        header { margin-bottom: 20px !important; padding-bottom: 12px !important; }
                        header h1 { font-size: 22px !important; }
                        h2 { font-size: 18px !important; }
                        .greeting { padding: 12px !important; margin: 16px 0 !important; }
                        .reservation-details { padding: 16px !important; }
                        .pricing-section { padding: 16px !important; }
                        ul { margin: 10px 0 !important; }
                        .header-responsive { flex-direction: column; gap: 6px; }
                    }
                `}</style>
                {/* LOGO DE LA AGENCIA */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img
                        src={agencyLogoUrl}
                        alt="Logo Agencia"
                        style={{ maxWidth: '200px', height: 'auto' }}
                    />
                </div>

                {/* HEADER */}
                <header className="header-responsive" style={{ textAlign: 'center', borderBottom: '3px solid #886b43', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ color: '#886b43', fontSize: '28px', marginBottom: '10px' }}>
                        Reserva del {reservaInfo.checkin || '—'} al {reservaInfo.checkout || '—'}
                    </h1>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#886b43', marginBottom: '5px' }}>
                        {hotelNameFromPayload || nombreHotelId(candidateHotelId || 1)}
                    </p>
                    <p style={{ color: '#666', fontSize: '16px', fontStyle: 'italic' }}>
                        Disfrute una estadía confortable en nuestras instalaciones
                    </p>
                </header>

                {/* SALUDO */}
                <div className="greeting" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderLeft: '4px solid #886b43', margin: '20px 0' }}>
                    <p><strong style={{ color: '#886b43' }}>Estimado/a {`${titularInfo.firstName || ''} ${titularInfo.lastName || ''}`.trim() || 'Cliente'}</strong></p>
                    <p>Gracias por contactar a {agency.fullName || 'la agencia'} para gestionar su reserva.</p>
                </div>

                {/* DETALLES DE LA RESERVA */}
                <div className="reservation-details" style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                    <h2 style={{ color: '#886b43', fontSize: '22px', margin: 0, borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Detalles de la Reserva</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', margin: '15px 0' }}>
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Check-in</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>{reservaInfo.checkin || 'No especificado'}</div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Check-out</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>{reservaInfo.checkout || 'No especificado'}</div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Noches</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>{reservaInfo.nights || 'No especificado'}</div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Huéspedes</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>{`${reservaInfo.adults || 0} adultos, ${reservaInfo.children || 0} niños`}</div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Habitaciones</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>{roomsData.length}</div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Plan de Alimentación</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>{roomsData[0]?.planAlimentario || cotizacion?.planAlimentario || 'No especificado'}</div>
                        </div>
                        {cotizacion?.mascotasNumber > 0 && (
                            <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                                <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Mascotas</div>
                                <div style={{ color: '#333', marginTop: '5px' }}>{cotizacion.mascotasNumber} mascota(s) permitida(s)</div>
                            </div>
                        )}
                        {/* Traslados */}
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Traslados</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>
                                {textoTrasladoResumen || 'No incluidos'}
                            </div>
                        </div>
                        {/* Tours */}
                        <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                            <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Tours</div>
                            <div style={{ color: '#333', marginTop: '5px' }}>
                                {toursNombresResumen.length > 0
                                    ? toursNombresResumen.map((nombreTour, index) => (
                                        <span key={index}>
                                            {index > 0 && ', '}
                                            {nombreTour || `Tour ${index + 1}`}
                                        </span>
                                      ))
                                    : 'No incluidos'}
                            </div>
                        </div>
                        {Array.isArray(cotizacion?.vuelo) && cotizacion.vuelo.length > 0 && (
                            <div style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 0, borderLeft: 'none' }}>
                                <div style={{ fontWeight: 'bold', color: '#886b43', fontSize: '14px' }}>Vuelo</div>
                                <div style={{ color: '#333', marginTop: '5px' }}>Paquete vuelo + hotel incluido</div>
                            </div>
                        )}
                    </div>
                </div>

                {Array.isArray(cotizacion?.vuelo) && cotizacion.vuelo.length > 0 && (
                    <section style={{ margin: '24px 0' }}>
                        <VueloCotizacionDetalle vueloArray={cotizacion.vuelo} />
                    </section>
                )}

                {/* GALERÍA DEL HOTEL */}
                {roomsData.length > 0 && (
                    <section style={{ margin: '30px 0' }}>
                        <h2 style={{ color: '#886b43', fontSize: '22px', margin: 0, borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Galería del Hotel</h2>
                        <div className="stack-gallery" style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
                            <img
                                src={getHotelImagesById(candidateHotelId || 1).main}
                                alt={`Vista principal del ${hotelNameFromPayload || nombreHotelId(candidateHotelId || 1)}`}
                            />
                            <img
                                src={getHotelImagesById(candidateHotelId || 1).secondary1}
                                alt={`Vista del hotel ${hotelNameFromPayload || nombreHotelId(candidateHotelId || 1)}`}
                            />
                            <img
                                src={getHotelImagesById(candidateHotelId || 1).secondary2}
                                alt={`Vista del hotel ${hotelNameFromPayload || nombreHotelId(candidateHotelId || 1)}`}
                            />
                        </div>
                    </section>
                )}

                <br />

                {/* DESCRIPCIÓN GENERAL */}
                <section>
                    <h2 style={{ color: '#886b43', fontSize: '22px', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Descripción general</h2>
                    <p>De acuerdo a conversaciones, enviamos cotización detallada de la siguiente manera:</p>
                    <ul style={{ listStylePosition: 'inside', margin: '15px 0', paddingLeft: '20px' }}>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Estancia de {reservaInfo.nights || '1'} noche(s) del {reservaInfo.checkin || '—'} al {reservaInfo.checkout || '—'}</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Habitaciones confortables, dotadas con cajillas de seguridad, Tv moderno, duchas con agua caliente, wifi en todas las áreas del hotel.</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>{roomsData[0]?.planAlimentario || cotizacion?.planAlimentario || 'Plan de alimentación no especificado'} incluido</li>
                        {textoTrasladoResumen && (
                            <li style={{ margin: '8px 0', lineHeight: '1.8' }}><strong>Traslado:</strong> {textoTrasladoResumen}</li>
                        )}
                        {toursNombresResumen.length > 0 && (
                            <li style={{ margin: '8px 0', lineHeight: '1.8' }}><strong>Tours:</strong> {toursNombresResumen.join(', ')}</li>
                        )}
                        {Array.isArray(cotizacion?.vuelo) && cotizacion.vuelo.length > 0 && (
                            <li style={{ margin: '8px 0', lineHeight: '1.8' }}><strong>Vuelo:</strong> Paquete aéreo incluido (vuelo + hotel)</li>
                        )}
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Check-in 3:00 pm y check-out 12:00 pm</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Servicio de guarda equipaje sin costo adicional</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Baño privado con ducha o bañera</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Amenities de baño</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Tv Smart</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Escritorio</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Silla</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Closet</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Servicio de wifi de cortesía</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Cajillas de seguridad</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Servicio de recepción durante 24 horas</li>
                    </ul>
                </section>

                {/* HABITACIONES RESERVADAS */}
                <section>
                    <h2 style={{ color: '#886b43', fontSize: '22px', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Habitaciones Reservadas</h2>
                    {roomsData.map((room, index) => {
                        const planAlimentacion = roomsData[0]?.planAlimentario || cotizacion?.planAlimentario || 'Solo desayuno';
                        const descripcionPension = generarDescripcionPension(planAlimentacion);
                        const precioNocheHab = tieneDesglose ? (Number(room.precioNocheHabitacion) || 0) : (totalConMarkup && nights > 0 ? (totalConMarkup / nights) : 0);
                        const precioTotalHab = tieneDesglose ? (Number(room.precioHabitacion) || Number(room.unitaryPrice) || 0) : totalSinIvaConMarkup;
                        const precioNocheMostrar = tieneDesglose ? Math.round(precioNocheHab * factorMarkupPublica) : Math.round(precioNocheHab);
                        const precioTotalMostrar = tieneDesglose ? Math.round(precioTotalHab * factorMarkupPublica) : Math.round(precioTotalHab);
                        return (
                        <div key={room.id || index} style={{ backgroundColor: '#f8f9fa', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
                            <h3 style={{ color: '#444', fontSize: '18px', margin: '0 0 10px 0' }}>Habitación {index + 1}: {room.nombreHabitacion || 'Habitación estándar'}</h3>
                            <p><strong>Descripción:</strong> {descripcionPension}</p>
							<p><strong>Precio por noche:</strong> ${ precioNocheMostrar.toLocaleString() }</p>
							<p><strong>Total habitación:</strong> ${ precioTotalMostrar.toLocaleString() }</p>
                        </div>
                    );
                    })}
                </section>

          
                

                {/* TARIFAS */}
                <section>
                    <h2 style={{ color: '#886b43', fontSize: '22px', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Tarifas</h2>
                    <div className="pricing-section" style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                            
                           
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                            <span>Hospedaje (precio con impuestos incluidos):</span>
                            <span>${subtotalHospedajeCliente.toLocaleString()}</span>
                        </div>
                        {extrasCotizacion > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                                <span>Extras (tours, traslado, mascotas):</span>
                                <span>${extrasCotizacion.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: 'none', fontWeight: 'bold', fontSize: '18px', color: '#886b43', marginTop: '10px', paddingTop: '15px', borderTop: '2px solid #886b43' }}>
                            <span>Total:</span>
                            <span>${totalConMarkup.toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px', fontStyle: 'italic' }}>
                            Los precios incluyen el IVA.
                        </div>
                    </div>
                </section>

                {/* INFORMACIÓN IMPORTANTE */}
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
                    <p><strong style={{ color: '#856404' }}>Información importante:</strong></p>
                    <p>Los valores de las tarifas enviadas en la siguiente cotización estarán vigentes durante los próximos 5 días a partir de la fecha de envío.</p>
                    <p><strong>Nota:</strong> En caso de solicitar factura a nombre de la empresa, debe enviar el RUT al momento de realizar el check-in y antes de realizar el check-out, de lo contrario, la reserva se facturará a nombre del huésped o titular de la reserva perdiendo el derecho a solicitar modificación o corrección del documento.</p>
                </div>

                {/* TÉRMINOS Y CONDICIONES */}
                <section style={{ marginTop: '30px' }}>
                    <h2 style={{ color: '#886b43', fontSize: '22px', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Términos y condiciones</h2>

                    <h3 style={{ color: '#444', fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Cancelaciones</h3>
                    <ul style={{ listStylePosition: 'inside', margin: '15px 0', paddingLeft: '20px' }}>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>En caso de cancelar o modificar su reserva deberá notificar con 72 horas de anticipación a la fecha de entrada al hotel, para no recibir penalización.</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Si el hotel no recibe información de cancelación o modificación de su alojamiento, dentro de las 72 horas, el hotel podrá realizar la penalización parcial o total del monto de su reserva.</li>
                    </ul>

                    <h3 style={{ color: '#444', fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Tener en cuenta</h3>
                    <p>El NO envío del comprobante en la fecha estipulada o anterior a esta, puede causar la apertura de disponibilidad o venta de la habitación sin previo aviso, por lo tanto, es de suma importancia hacer el envío de la foto o escáner del comprobante por el presente medio como prueba de garantía.</p>

                    <h3 style={{ color: '#444', fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Grupos mínimo 30 personas</h3>
                    <ul style={{ listStylePosition: 'inside', margin: '15px 0', paddingLeft: '20px' }}>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Deben notificar cualquier tipo de modificación antes de ingresar al hotel.</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>En caso de cancelar una reserva de grupo deberá notificar 720 horas de anticipación a la fecha de entrada al hotel, para no recibir personalización.</li>
                    </ul>

                    <h3 style={{ color: '#444', fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Estadía con menores de edad:</h3>
                    <ul style={{ listStylePosition: 'inside', margin: '15px 0', paddingLeft: '20px' }}>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>{nombreHotelId(roomsData[0]?.hotelidAutocore || roomsData[0]?.id || 1)} protege a los niños, niñas y adolescentes de la explotación sexual y comercial Ley 679 de 2001.</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Recuerde; todo niño que viaje debe contar sus documentos de identidad (Registro civil o tarjeta de identidad)</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Si los niños que viajan no son hijos de los adultos que los representan deben contar con un permiso de los padres, autenticado en una notaría.</li>
                    </ul>

                    <h3 style={{ color: '#444', fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Turismo sostenible</h3>
                    <ul style={{ listStylePosition: 'inside', margin: '15px 0', paddingLeft: '20px' }}>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>El tráfico, comercio, consumo, colección y cualquier tipo de actividad que genere un impacto negativo en la flora y fauna está prohibida por la Ley 1333 de 2009. Quienes realicen estas actividades ilícitas incurrirán en prisión de 4 a 9 años y multas hasta de 35.000 SMLV de acuerdo a la Ley 1453 de 2011.</li>
                        <li style={{ margin: '8px 0', lineHeight: '1.8' }}>Está prohibido el tráfico y comercialización ilegal de bienes de interés cultural de acuerdo a lo establecido en la Ley 1185 de 2008</li>
                    </ul>
                </section>

                {/* ESTADO Y BOTONES: no aplica en cotizaciones con vuelo */}
                {!cotizacionIncluyeVuelo && (
                <div style={{ marginTop: '24px' }}>
                    {cotizacion.status === 1 && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #22c55e',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CheckCircle style={{ color: '#22c55e' }} />
                                <h4 style={{ margin: 0, color: '#166534' }}>
                                    Cotización Aceptada
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
                                Su respuesta ha sido registrada. Nos pondremos en contacto con usted pronto.
                            </p>
                        </div>
                    )}

                    {cotizacion.status === 2 && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
                            border: '1px solid #ef4444',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <XCircle style={{ color: '#ef4444' }} />
                                <h4 style={{ margin: 0, color: '#991b1b' }}>
                                    Cotización Rechazada
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>
                                Su respuesta ha sido registrada. Gracias por su tiempo.
                            </p>
                        </div>
                    )}

                    {/* Mostrar botones solo si no hay decisión previa */}
                    {!decision && cotizacion.status !== 1 && cotizacion.status !== 2 && (
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
                )}
                {/* CONTACTO */}
                <div style={{ backgroundColor: '#886b43', color: '#fff', padding: '20px', borderRadius: '5px', marginTop: '30px', textAlign: 'center' }}>
                    <h2 style={{ color: '#fff', borderBottom: '2px solid #fff', margin: 0, paddingBottom: '10px' }}>¿Preguntas?</h2>
                    <p><strong>Contáctanos</strong></p>
                    <p>Whatsapp y Llamadas: <a href="tel:+573336025669" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>+57 333 602 56 69</a></p>
                    <br />
                    
                    <p>Desarrollado por <a href="https://www.gehsuites.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>GEH Suites</a></p>
                </div>
            </div>
        </div>
    );
};

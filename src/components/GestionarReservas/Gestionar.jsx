import React, { useEffect, useState } from 'react'
import styles from './styles/gestionar.module.css'
import { format } from "@formkit/tempo"
import { hoteles, habitaciones } from './InfoHoteles'
import Cookies from 'js-cookie';
import { generarLinkPago, linkPago } from '../../stores/pagos'

const Gestionar = ({ reservas }) => {
    // console.log(reservas)
    const [link, setlink] = useState('')

    const checkin = format(reservas?.reservation.checkin, "D MMM", "es")

    const checkout = format(reservas?.reservation.checkout, "D MMM", "es")
    const sumaHuespe = Number(reservas?.reservation.children) + Number(reservas?.reservation.adults)

    let contador = 1
    // // console.log(sumaHuespe)
    const infoHoteles = hoteles(reservas?.hotel)
    // console.log(hoteles(reservas.hotel))

    const generarLink = async (id) => {
        const linkP = await generarLinkPago(id)
        setlink(linkP)
        console.log(linkP)
        if (linkP.link) {
            window.location.href = linkP.link
        }
    }
    const onClick = async (id) => {
        await generarLink(id)
    }

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

    return (
        <div className={styles.containerGestionar}>
            <p className={styles.title}>Consultar y gestionar reservas</p>

            {reservas?.status == '0' ? (<p className={`${styles.estadoPago} ${styles.pending}`}>Estado de la reserva: Pendiente de pago</p>) : (
                reservas?.status == '1' ? (<p className={`${styles.estadoPago} ${styles.proces}`}>Estado de la reserva: En proceso de pago</p>) : (
                    reservas?.status == '2' ? (<p className={`${styles.estadoPago} ${styles.cancel}`}>Estado de la reserva: Pago Rechazado</p>) : (
                        reservas?.status == '3' ? (<sppan className={`${styles.estadoPago} ${styles.clomplete}`}>Estado de la reserva: Pago Aprobado</sppan>) : (
                            reservas?.status == '4' ? (<span className={`${styles.estadoPago} ${styles.cancel}`}>Cancelado</span>) : (<p>Estado no vlido</p>)
                        )
                    )
                )
            )}

            <div className={styles.card}>
                <div className={styles.hotelInfo}>
                    <p>Datos de la reserva</p>
                    <div className={styles.img}>
                        <img src={infoHoteles?.imgHotel} alt='img' />
                    </div>
                </div>

                <div className={styles.infoHabitaciones}>
                    <p className={styles.idReserva}>Cod. Reserva: <span>{reservas?.reservaChatbotId}</span></p>
                    <div className={styles.infoHotelHabitaciones}>
                        <p className={styles.NombreHotel}>{reservas?.hotel}</p>
                        <p>ubi <span>{infoHoteles.ubicacion} |</span> <span>tel +57 3336025021</span></p>
                        <div className={styles.infoFechas}>
                            <div className={styles.flex}>
                                <div className={styles.flexCol}>
                                    <p>Check-in</p>
                                    <p>{checkin}</p>
                                </div>
                                <div className={styles.flexCol}>
                                    <p>Check-out</p>
                                    <p>{checkout}</p>
                                </div>
                            </div>
                            <hr />
                            <div className={styles.flex}>
                                <div className={styles.flexCol}>
                                    <p>Noches</p>
                                    <p>{reservas?.reservation.nights}</p>
                                </div>
                                <div className={styles.flexCol}>
                                    <p>Huéspedes</p>
                                    <p>{sumaHuespe}</p>
                                </div>
                                <div className={styles.flexCol}>
                                    <p>Habitaciones</p>
                                    <p>{reservas?.cantidadHabitaciones}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.habitaciones}>
                            {
                                reservas?.reservation.roomsData.map((dato, index) => (
                                    <div className={styles.cardHabi} key={index}>
                                        <div className={styles.contenHabi}>
                                            <div className={styles.imgHabi}>
                                                <img src={habitaciones[dato.id].url} alt='habita' />
                                            </div>
                                            <div className={styles.infoHabitaciones}>
                                                <p className={styles.titleHabi}>{habitaciones[dato.id].name}</p>
                                                <p>Check-in: {checkin} - Check-out: {checkout}</p>
                                                <p>{reservas.reservation.nights} noches, {sumaHuespe} huéspedes, 1 habitación</p>
                                            </div>
                                        </div>
                                        <p className={styles.totalCard}>${dato.unitaryPrice} COP</p>
                                    </div>
                                ))
                            }
                        </div>
                        <div className={styles.infoTotal}>
                            <div className={styles.titleTotal}>
                                <p>Valor a pagar + impuestos</p>
                                {/* <p className={styles.plazoPago}>Tienes plazo de pagar hasta el {limiteP}</p> */}
                            </div>
                            <p className={styles.total}>${reservas?.total} COP</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.contentHusped_pago}>
                <div className={styles.containerHuesped}>
                    <p className={styles.titleHuespe}>Información de los huéspedes</p>
                    <div className={styles.habitacionesForm}>
                        <p className={styles.titleForm}>Habitación 1: Doble estándar</p>
                        <p className={styles.checkin}>Check-in: {checkin}</p>
                        <div className={styles.cardHuesped}>
                            <p className={styles.titleTitular}>Huésped 1 (Titular)</p>
                            <div className={styles.flexHuespe}>
                                <p className={styles.infoH}>Cédula de ciudadanía:</p>
                                <p>{reservas?.titularInfo?.documento}</p>
                            </div>
                            <div className={styles.flexHuespe}>
                                <p className={styles.infoH}>Nombre completo:</p>
                                <p>{reservas?.reservation.firstName} {reservas?.reservation.lastName}</p>
                            </div>
                            <div className={styles.flexHuespe}>
                                <p className={styles.infoH}>Fecha de nacimiento:</p>
                                <p>{reservas?.titularInfo?.fechaNacimiento}</p>
                            </div>
                            <div className={styles.flexHuespe}>
                                <p className={styles.infoH}>Correo electrónico:</p>
                                <p>{reservas?.reservation.email}</p>
                            </div>
                            <div className={styles.flexHuespe}>
                                <p className={styles.infoH}>Celular:</p>
                                <p>{reservas?.reservation.telephone}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className={styles.pagar}>
                        <p className={`${styles.infoH} ${styles.titlePagar}`}>Pagar reserva</p>
                        <div className={styles.hotelR}>
                            <p className={styles.infoH}>{reservas?.hotel}</p>
                            <div className={styles.nochesR}>
                                <p>{checkin} - {checkout} ({reservas?.reservation.nights} noches)</p>
                            </div>
                        </div>
                        {
                            reservas?.reservation.roomsData.map((dato, index) => (
                                <div className={styles.cardHabitacionesPago} key={index}>
                                    <p>Habitación {contador++}:</p>
                                    <p>{habitaciones[dato.id].name}</p>
                                    {/* <p>Medía pensión</p> */}
                                    <p>{checkin} - {checkout}</p>
                                    <p>{reservas.reservation.nights} noches, {dato.adults} huéspedes</p>
                                    <p>${dato.unitaryPrice}</p>
                                </div>
                            ))
                        }
                        <div className={styles.pagos}>
                            <div className={styles.totalPago}>
                                <p>Total + impuestos</p>
                                <p className={styles.totalP}>${reservas?.total}</p>
                            </div>
                            <button onClick={() => onClick(reservas._id)}>Pagar ahora</button>
                        </div>
                    </div>

                    <div className={styles.gestionarReserv}>
                        <p>Gestionar reserva</p>
                        <div className={styles.acciones}>
                            {/* <a>Modificar reserva</a> */}
                            <a>Cancelar reserva</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Gestionar
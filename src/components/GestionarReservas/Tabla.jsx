import React, { useEffect, useState } from 'react'
import styles from './styles/tabla.module.css'
import { getReservas, reservasNano } from '../../stores/disponibilidad'
const Tabla = () => {
    const [reservas, setreservas] = useState([])
    const [tokenUrl, setTokenUrl] = useState('')

    useEffect(() => {
        const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'))
        console.log(datosUsuario)
        ObtenerReservas(datosUsuario.token)
        setTokenUrl(datosUsuario.token)
    }, [])
    const ObtenerReservas = async (token) => {
        await getReservas(token)
        setreservas(reservasNano.get())
    }
    console.log(reservas)

    // const reservas = reservasNano.get()
    return (
        <>
            <div className={styles.container}>
                <br />
                <h1>Consultar mis reservas</h1>
                <div className={styles.filters}>
                    <button><i className="fas fa-filter"></i> Filtros</button>
                </div>
                <div className={styles.tabs}>
                    <div className={styles.active}>Próximos pagos <span className={styles.badge}>1</span></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Cod. reserva</th>
                            <th>Hotel</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Huesped</th>
                            <th>Plazo para pagar</th>
                            <th>Valor a pagar</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reservas.map((dato, index) => (
                                <tr key={index}>
                                    <td>{dato.reservaChatbotId}</td>
                                    <td>{dato.hotel}</td>
                                    <td>{dato.reservation.checkin}</td>
                                    <td>{dato.reservation.checkout}</td>
                                    <td>{`${dato.reservation.firstName} ${dato.reservation.lastName}`}</td>
                                    <td>#PLAZO</td>
                                    <td>${dato.total}</td>
                                    <td>{dato.status == '0'? (<span className={`${styles.status} ${styles.pending}`}>Pendiente de pago</span>) : (
                                        dato.status == '1'? (<span className={`${styles.status} ${styles.proces}`}>En proceso de pago</span>) : (
                                            dato.status == '2'? (<span className={`${styles.status} ${styles.cancel}`}>Pago Rechazado</span>) : (
                                                dato.status == '3'? (<span className={`${styles.status} ${styles.clomplete}`}>Pago Aprobado</span>) : (
                                                    dato.status == '4'? (<span className={`${styles.status} ${styles.cancel}`}>Cancelado</span>) : (<p>Estado no vlido</p>)
                                                )
                                            )
                                        ) 
                                    )}</td>
                                    <td><a href={`/gestionar/${dato.reservaChatbotId}?token=${tokenUrl}`}>Consultar y gestionar</a></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <div className={styles.pagination}>
                    <span>Anterior</span>
                    <a href="#" className={styles.active}>1</a>
                    <span>Siguiente</span>
                </div>
            </div>
        </>
    )
}

export default Tabla
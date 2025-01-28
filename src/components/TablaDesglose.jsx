import React, { useEffect, useState } from 'react'

const TablaDesglose = ({ precio, adults, ninos, fechasreserva }) => {

    const [DatosPrecio, setDatosPrecio] = useState(0)
    const [DatosAdultos, setDatosAdultos] = useState('')
    const [DatosNinos, setDatosNinos] = useState('')
    const [Noches, setNoches] = useState('')
    const [ReteFuente, setReteFuente] = useState(0)
    const [ReteIca, setReteIca] = useState(0)
    const [ReteIva, setReteIva] = useState(0)
    const [DatosReserva, setDatosReserva] = useState('')

    useEffect(() => {
        setiarRetenciones()
        const reserva = JSON.parse(localStorage.getItem('datosreserva'))
        setDatosReserva(reserva)
    }, [precio])




    const setiarRetenciones = async () => {
        setDatosPrecio(precio)
        setDatosAdultos(adults)
        setDatosNinos(ninos)
        setNoches(fechasreserva?.nights)
    }

    const precioDesyunos = (hotel) => {
        switch (hotel) {
            // azuan
            case 1:
                return {
                    valor: 40000
                }
            // aixo
            case 4:
                return {
                    valor: 45000
                }
            // Marina
            case 9:
                return {
                    valor: 40000
                }
            // Abi
            case 5:
                return {
                    valor: 45000
                }
            // Avexi
            case 6:
                return {
                    valor: 40000
                }
            // Bocagrande
            case 7:
                return {
                    valor: 40000
                }
            // 1525
            case 2:
                return {
                    valor: 30000
                }
            // Sansiraka
            case 44:
                return {
                    valor: 45000
                }
            // Axis
            case 48:
                return {
                    valor: 30000
                }
            // Rodadero
            case 8:
                return {
                    valor: 30000
                }
            // Madisson
            case 3:
                return {
                    valor: 60000
                }
            // Windsor
            case 10:
                return {
                    valor: 60000
                }
            // Zulita
            case 41:
                return {
                    valor: 60000
                }
            default:
                return 'Hotel no valido'
        }
    }

    // console.log(DatosReserva[0]?.hotelidAutocore)
    const hotelId = DatosReserva[0]?.hotelidAutocore
    const valorDesayuno = precioDesyunos(hotelId)

    const desayunos = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor)
    const desayunoBase = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor) / 1.08
    const hospedajeBase = (DatosPrecio - desayunos) / 1.19
    const hospedaje = (DatosPrecio - desayunos)
    const ivaHospedaje = (hospedajeBase * 19) / 100
    const impoconsumo = (desayunoBase * 8) / 100

    const formatCurrency = (value) => {
        if (value === undefined || value === null || isNaN(value)) {
            return "Sin Disponibilidad";
        }
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(value);
    };



    const subTotal = (hospedajeBase + desayunoBase + ivaHospedaje + impoconsumo)
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Paquete</th>
                        <th>Base</th>
                        <th>Iva/Impoc</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Servicio hospedaje</strong></td>
                        <td>{formatCurrency(hospedaje.toFixed(0))}</td>
                        <td>{formatCurrency(hospedajeBase.toFixed(0))}</td>
                        <td>{formatCurrency(ivaHospedaje.toFixed(0))}</td>
                        <td>{formatCurrency(hospedaje.toFixed(0))}</td>
                    </tr>
                    <tr>
                        <td><strong>Desayunos</strong></td>
                        <td>{formatCurrency(desayunos.toFixed(0))}</td>
                        <td>{formatCurrency(desayunoBase.toFixed(0))}</td>
                        <td>{formatCurrency(impoconsumo.toFixed(0))}</td>
                        <td>{formatCurrency(desayunos.toFixed(0))}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><strong>{formatCurrency(subTotal.toFixed(0))}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default TablaDesglose
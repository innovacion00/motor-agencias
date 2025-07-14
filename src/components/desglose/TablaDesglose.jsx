import React, { useEffect, useState } from 'react'

const TablaDesglose = ({ precio }) => {


    const [DatosPrecio, setDatosPrecio] = useState(0)
    const [DatosReserva, setDatosReserva] = useState('')

    useEffect(() => {
        setiarRetenciones()
        const reserva = JSON.parse(localStorage.getItem('datosreserva'))
        setDatosReserva(reserva)
    }, [precio])

    const setiarRetenciones = async () => {
        setDatosPrecio(precio)
    }


    // console.log(DatosReserva[0]?.hotelidAutocore)
    console.log(DatosReserva[0]?.plandealimentacion)
    let desayunos = 0
    let desayunoBase = 0
    let hospedajeBase = 0
    let hospedaje = 0
    let ivaHospedaje = 0
    let impoconsumo = 0

    if (DatosReserva[0]?.plandealimentacion == 'Solo desayuno') {
        desayunos = DatosPrecio * 0.4
        // const desayunos = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor)
        desayunoBase = desayunos / 1.08
        hospedajeBase = (DatosPrecio - desayunos) / 1.19
        hospedaje = (DatosPrecio - desayunos)
        ivaHospedaje = (hospedajeBase * 19) / 100
        impoconsumo = (desayunoBase * 8) / 100
    } else if (DatosReserva[0]?.plandealimentacion == 'Media Pension') {
        desayunos = DatosPrecio * 0.5
        // const desayunos = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor)
        desayunoBase = desayunos / 1.08
        hospedajeBase = (DatosPrecio - desayunos) / 1.19
        hospedaje = (DatosPrecio - desayunos)
        ivaHospedaje = (hospedajeBase * 19) / 100
        impoconsumo = (desayunoBase * 8) / 100
    } else if (DatosReserva[0]?.plandealimentacion == 'Pension completa') {
        desayunos = DatosPrecio * 0.6
        // const desayunos = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor)
        desayunoBase = desayunos / 1.08
        hospedajeBase = (DatosPrecio - desayunos) / 1.19
        hospedaje = (DatosPrecio - desayunos)
        ivaHospedaje = (hospedajeBase * 19) / 100
        impoconsumo = (desayunoBase * 8) / 100
    }else{
        desayunos = DatosPrecio * 0.4
        // const desayunos = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor)
        desayunoBase = desayunos / 1.08
        hospedajeBase = (DatosPrecio - desayunos) / 1.19
        hospedaje = (DatosPrecio - desayunos)
        ivaHospedaje = (hospedajeBase * 19) / 100
        impoconsumo = (desayunoBase * 8) / 100
    }


    //console.log(DatosReserva)
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

    const desyunohospedbase = (hospedajeBase + desayunoBase)
    // console.log(desyunohospedbase)
    const subTotal = (hospedajeBase + desayunoBase + ivaHospedaje + impoconsumo)
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Paquete</th>
                        <th>Base</th>
                        <th>Impuestos - IVA/Impoconsumo</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Servicio hospedaje</strong></td>
                        <td>{formatCurrency(hospedaje.toFixed(0))}</td>
                        <td>{formatCurrency(hospedajeBase.toFixed(0))}</td>
                        <td>{formatCurrency(ivaHospedaje.toFixed(0))}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td><strong>A&B</strong></td>
                        <td>{formatCurrency(desayunos.toFixed(0))}</td>
                        <td>{formatCurrency(desayunoBase.toFixed(0))}</td>
                        <td>{formatCurrency(impoconsumo.toFixed(0))}</td>
                        <td><strong>{formatCurrency(subTotal.toFixed(0))}</strong></td>
                    </tr>

                </tbody>
            </table>
        </div>
    )
}

export default TablaDesglose
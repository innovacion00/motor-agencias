import React, { useEffect, useState } from 'react'
import './FormularioRetenciones.css'

const FormularioRetenciones = ({ precio, adults, ninos, fechasreserva, manejarDatos }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [formData, setFormData] = useState({
        reteFuente: "",
        reteIca: "",
        reteIva: "",
    });
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleCheckboxChange = (event) => {
        const checked = event.target.checked;
        setIsChecked(checked);


        if (!checked) { // Usa el valor actualizado en lugar de isChecked
            setReteFuente(0);
            setReteIca(0);
            setReteIva(0)
            manejarDatos(null);
            setFormData((prevData) => ({
                ...prevData,
                reteFuente: 0,
                reteIca: 0,
                reteIva: 0
            }));
            localStorage.removeItem('Retenciones%')
        }

    };

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
                    valor: 30000
                }
            // aixo
            case 4:
                return {
                    valor: 35000
                }
            // Marina
            case 9:
                return {
                    valor: 30000
                }
            // Abi
            case 5:
                return {
                    valor: 35000
                }
            // Avexi
            case 6:
                return {
                    valor: 30000
                }
            // Bocagrande
            case 7:
                return {
                    valor: 35000
                }
            // 1525
            case 2:
                return {
                    valor: 30000
                }
            // Sansiraka
            case 44:
                return {
                    valor: 35000
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
                    valor: 50000
                }
            // Windsor
            case 10:
                return {
                    valor: 50000
                }
            // Zulita
            case 41:
                return {
                    valor: 50000
                }
            // Boquilla
            case 56:
                return {
                    valor: 30000
                }
            default:
                return 'Hotel no valido'
        }
    }


    // console.log(DatosReserva[0]?.hotelidAutocore)
    const hotelId = DatosReserva[0]?.hotelidAutocore
    const valorDesayuno = precioDesyunos(hotelId)

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
    } else {
        desayunos = DatosPrecio * 0.4
        // const desayunos = (((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor)
        desayunoBase = desayunos / 1.08
        hospedajeBase = (DatosPrecio - desayunos) / 1.19
        hospedaje = (DatosPrecio - desayunos)
        ivaHospedaje = (hospedajeBase * 19) / 100
        impoconsumo = (desayunoBase * 8) / 100
    }


    const calcularRetenciones = (rteFte, rteIca, rteIva, hospedaje, desayunoBase, iva) => {
        const calculo_rtf_fte = ((hospedaje + desayunoBase) * rteFte) / 100
        const calculo_rtf_ica = ((hospedaje + desayunoBase) * rteIca) / 1000
        const calculo_rtf_iva = (iva * rteIva) / 100
        return { calculo_rtf_fte, calculo_rtf_ica, calculo_rtf_iva }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log("Datos del formulario:", formData);

        const retenciones = calcularRetenciones(formData.reteFuente, formData.reteIca, formData.reteIva, hospedajeBase, desayunoBase, ivaHospedaje)
        setReteFuente(retenciones.calculo_rtf_fte)
        setReteIca(retenciones.calculo_rtf_ica)
        setReteIva(retenciones.calculo_rtf_iva)
        manejarDatos(retenciones, formData)

        localStorage.setItem('Retenciones%', JSON.stringify(formData))
    };

    // console.log(isChecked)

    const subTotal = (hospedajeBase + desayunoBase + ivaHospedaje + impoconsumo)
    const total = subTotal - (ReteFuente + ReteIca + ReteIva)

    // console.log(ReteFuente)
    const formatCurrency = (value) => {
        if (value === undefined || value === null || isNaN(value)) {
            return "Sin Disponibilidad";
        }
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const ocultarRteFuente = DatosReserva?.[0]?.hotelId === 13633 || DatosReserva?.[0]?.hotelid === "13633";

    return (
        <>

            <h3>Retenciones</h3>
            <div className="contenRetenciones">
                <label>Marque la casilla si su agencia aplica retenciones </label>

                <input
                    style={{
                        width: "15px", // Tamaño más claro y consistente
                        height: "15px",
                        marginLeft: "40px",
                        cursor: "pointer", // Cambia el cursor al pasar sobre el checkbox
                        accentColor: "#007BFF", // Color del checkbox (moderno y llamativo)

                    }}
                    type="checkbox"
                    id="retenciones"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
            </div>
            {
                isChecked && (
                    <div className='container_principal'>
                        <div className='container_retenciones'>
                            <p><strong>IMPORTANTE:</strong> Los valores deben ingresarse en formato numérico, no como porcentajes. Por ejemplo: en lugar de "2%", solo escribe "2".</p>
                            <form onSubmit={(event) => handleSubmit(event)} className='formulario_retenciones'>
                                    {!ocultarRteFuente &&
                                <div>
                                    <label>Ingrese el porcentaje rete fuente</label>
                                    <input
                                        type='number'
                                        name="reteFuente"
                                        placeholder="Ingresar valor"
                                        value={formData.reteFuente}
                                        onChange={handleChange}
                                    />
                                </div>
                                }
                                <div>
                                    <label>Ingrese el porcentaje rete ica</label>
                                    <input
                                        type='number'
                                        name="reteIca"
                                        placeholder="Ingresar valor"
                                        value={formData.reteIca}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label>Ingrese el porcentaje rete iva</label>
                                    <input
                                        type='number'
                                        name="reteIva"
                                        placeholder="Ingresar valor"
                                        value={formData.reteIva}
                                        onChange={handleChange} />
                                </div>
                                <button type="submit">Calcular</button>
                            </form>
                        </div>
                        <div className='container_valor_retenciones'>
                            <div className="retenciones-table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Rte Fuente</th>
                                        <th>Rte Ica</th>
                                        <th>Rte Iva</th>
                                        <th>Total a Pagar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td></td>
                                        <td>{formatCurrency(ReteFuente.toFixed(0))}</td>
                                        <td>{formatCurrency(ReteIca.toFixed(0))}</td>
                                        <td>{formatCurrency(ReteIva.toFixed(0))}</td>
                                        <td>{formatCurrency(total.toFixed(0))}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td><strong></strong></td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default FormularioRetenciones
import React, { useEffect, useState } from 'react'

const FormularioRetenciones = ({ precio, adults, ninos, fechasreserva }) => {
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
        setIsChecked(event.target.checked);
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

    const desayunos = ((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * valorDesayuno.valor
    const hospedaje = DatosPrecio - desayunos
    const ivaHospedaje = (hospedaje * 19) / 100
    const impoconsumo = (desayunos * 8) / 100

    
    const calcularRetenciones = (rteFte, rteIca, rteIva, hospedaje, iva) => {
        const calculo_rtf_fte = (hospedaje * rteFte) / 100
        const calculo_rtf_ica = (hospedaje * rteIca) / 1000
        const calculo_rtf_iva = (iva * rteIva) / 100
        return { calculo_rtf_fte, calculo_rtf_ica, calculo_rtf_iva }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("preventDefault called");
        console.log("Datos del formulario:", formData);

        const retenciones = calcularRetenciones(formData.reteFuente, formData.reteIca, formData.reteIva, hospedaje, ivaHospedaje)
        setReteFuente(retenciones.calculo_rtf_fte)
        setReteIca(retenciones.calculo_rtf_ica)
        setReteIva(retenciones.calculo_rtf_iva)
    };

    const subTotal = (hospedaje + desayunos + ivaHospedaje + impoconsumo)
    
    console.log(ReteFuente)

    return (
        <>
            <h3>Retenciones</h3>
            <div className="contenRetenciones">
                <label>Marque la casilla si su agencia aplica retenciones</label>
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
                            <div className='info_precios'>
                                <p>Servicios hospedaje </p>
                                <p>Servicios desayunos </p>
                                <p>IVA hospedaje 19% </p>
                                <p>IMPOCONSUMO 8% </p>
                                <p>Valor rete fuente </p>
                                <p>Valor rete ICA </p>
                                <p>Valor rete IVA </p>
                                <p>SUBTOTAL A PAGAR </p>
                                <p>Total a pagar incluyendo impuestos y retenciones</p>
                            </div>
                            <div className='info_totales'>
                                <p>${hospedaje}</p>
                                <p>${desayunos}</p>
                                <p>${ivaHospedaje}</p>
                                <p>${impoconsumo}</p>
                                <p>${ReteFuente}</p>
                                <p>${ReteIca}</p>
                                <p>${ReteIva}</p>
                                <p>${subTotal}</p>
                                <p>$000</p>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default FormularioRetenciones
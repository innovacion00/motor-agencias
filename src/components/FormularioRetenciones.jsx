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

    useEffect(() => {
        setiarRetenciones()
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

    const desayunos = ((Number(DatosAdultos) + Number(DatosNinos)) * Noches) * 45000
    const hospedaje = DatosPrecio - desayunos
    const ivaHospedaje = (hospedaje * 19) / 100
    const impoconsumo = (desayunos * 8) / 100

    const calcularRetenciones =  (rteFte, hospedaje) => {
        const calculo_rtf_fte = (hospedaje * rteFte) / 100
        return calculo_rtf_fte
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("preventDefault called");
        console.log("Datos del formulario:", formData);

        const reteFte = calcularRetenciones(formData.reteFuente, hospedaje)
        setReteFuente(reteFte)
    };
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
                                <p>Subtotal hospedaje </p>
                                <p>Subtotal desayunos </p>
                                <p>IVA hospedaje 19% </p>
                                <p>IMPOCONSUMO 8% </p>
                                <p>Valor rete fuente </p>
                                <p>Valor rete ICA </p>
                                <p>Valor rete IVA </p>
                                <p>TOTAL A PAGAR </p>
                                <p>TOTAL A PAGAR INCLUIDO RETENCIONES</p>
                            </div>
                            <div className='info_totales'>
                                <p>${hospedaje}</p>
                                <p>${desayunos}</p>
                                <p>${ivaHospedaje}</p>
                                <p>${impoconsumo}</p>
                                <p>$000</p>
                                <p>$000</p>
                                <p>$000</p>
                                <p>$000</p>
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
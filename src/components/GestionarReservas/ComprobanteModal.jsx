import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import styles from "./styles/comprobanteModal.module.css";
import { cuentasBancarias, getGrupoCuentasPorHotel } from "./CuentasBancarias";
import {
  enviarComprobanteBitrix,
  registrarComprobanteEnReserva,
  TAMANO_MAXIMO_COMPROBANTE,
} from "../../utils/comprobanteBitrix";

const TIPOS_ACEPTADOS = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const MONTO_MAXIMO = 100000000;

/** Fecha local en formato YYYY-MM-DD (no usar toISOString: desplaza por zona horaria). */
const hoyIso = () => {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
};

const ComprobanteModal = ({ isOpen, onClose, reservas }) => {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [cuentaIndex, setCuentaIndex] = useState(0);
  const [monto, setMonto] = useState("");
  const [fechaConsignacion, setFechaConsignacion] = useState(hoyIso);
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActivo, setDragActivo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const inputFileRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Modal.setAppElement(document.body);
    }
  }, []);

  // Reinicia el formulario cada vez que se abre el modal, preseleccionando
  // el grupo de cuentas según el hotel de la reserva (si hay match).
  useEffect(() => {
    if (!isOpen) return;
    const grupoSugerido = getGrupoCuentasPorHotel(reservas?.hotel) || "";
    setGrupoSeleccionado(grupoSugerido);
    setCuentaIndex(0);
    setMonto("");
    setFechaConsignacion(hoyIso());
    setArchivo(null);
    setPreviewUrl(null);
    setDragActivo(false);
    setEnviando(false);
    setCopiado(false);
  }, [isOpen, reservas?.hotel]);

  // Libera la URL de previsualización al reemplazar el archivo o desmontar.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const grupoActual = grupoSeleccionado ? cuentasBancarias[grupoSeleccionado] : null;
  const cuentaActual = grupoActual?.accounts?.[cuentaIndex] || null;

  const handleMontoChange = (e) => {
    const valor = e.target.value;
    if (valor !== "" && Number(valor) > MONTO_MAXIMO) {
      setMonto(String(MONTO_MAXIMO));
      return;
    }
    setMonto(valor);
  };

  const handleGrupoChange = (e) => {
    setGrupoSeleccionado(e.target.value);
    setCuentaIndex(0);
  };

  const aplicarArchivo = (file) => {
    if (!file) return;
    if (!TIPOS_ACEPTADOS.includes(file.type)) {
      Swal.fire({
        title: "Archivo no válido",
        text: "Solo se aceptan imágenes (JPG, PNG, WEBP) o archivos PDF.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    if (file.size > TAMANO_MAXIMO_COMPROBANTE) {
      Swal.fire({
        title: "Archivo muy pesado",
        text: `El comprobante no puede superar ${Math.round(
          TAMANO_MAXIMO_COMPROBANTE / (1024 * 1024)
        )} MB. Intenta con una foto de menor resolución.`,
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(file);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const handleFileInputChange = (e) => {
    aplicarArchivo(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActivo(false);
    aplicarArchivo(e.dataTransfer.files?.[0]);
  };

  const quitarArchivo = (e) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(null);
    setPreviewUrl(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  const copiarNumeroCuenta = async (e) => {
    e.stopPropagation();
    if (!cuentaActual) return;
    try {
      await navigator.clipboard.writeText(cuentaActual.numero);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch (error) {
      console.error("Error al copiar el número de cuenta:", error);
    }
  };

  const handleEnviar = async () => {
    if (!grupoSeleccionado || !cuentaActual) {
      Swal.fire({
        title: "Falta la cuenta",
        text: "Selecciona la cuenta bancaria a la que se realizó la transferencia.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    if (!monto || Number(monto) <= 0) {
      Swal.fire({
        title: "Falta el monto",
        text: "Ingresa el monto del comprobante.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    if (Number(monto) > MONTO_MAXIMO) {
      Swal.fire({
        title: "Monto inválido",
        text: `El monto no puede superar ${MONTO_MAXIMO.toLocaleString("es-CO")}.`,
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    // La API exige un entero: validarlo aquí evita que el comprobante llegue a
    // Bitrix y luego falle el cambio de estado.
    if (!Number.isInteger(Number(monto))) {
      Swal.fire({
        title: "Monto inválido",
        text: "Ingresa el monto en pesos, sin decimales.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    if (!fechaConsignacion) {
      Swal.fire({
        title: "Falta la fecha",
        text: "Indica la fecha en que se hizo la consignación.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }
    if (!archivo) {
      Swal.fire({
        title: "Falta el comprobante",
        text: "Adjunta la imagen o el PDF del comprobante de pago.",
        icon: "warning",
        confirmButtonColor: "#26547B",
      });
      return;
    }

    setEnviando(true);
    Swal.fire({
      title: "Enviando comprobante...",
      text: "Por favor espere",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => Swal.showLoading(),
    });

    let bitrixDealId;
    try {
      bitrixDealId = await enviarComprobanteBitrix({
        reservas,
        grupoSeleccionado,
        cuentaIndex,
        monto,
        fechaConsignacion,
        archivo,
      });
    } catch (error) {
      console.error("Error al enviar el comprobante a Bitrix:", error);
      setEnviando(false);
      Swal.fire({
        title: "No se pudo enviar",
        text:
          error.message ||
          "Ocurrió un error al enviar el comprobante. Intenta nuevamente.",
        icon: "error",
        confirmButtonColor: "#26547B",
      });
      return;
    }

    // El comprobante ya está en Bitrix: si esto falla, el estado no cambia pero
    // el registro no se pierde, así que se avisa sin pedir reintentar el envío.
    try {
      await registrarComprobanteEnReserva({
        reservaId: reservas?._id,
        bitrixDealId,
        monto,
        fechaConsignacion,
        razonSocial: grupoActual?.label ?? "",
      });
    } catch (error) {
      console.error("Error al actualizar el estado de la reserva:", error);
      setEnviando(false);
      Swal.fire({
        title: "Comprobante recibido",
        text: `Tu comprobante quedó registrado, pero el estado de la reserva no se actualizó: ${error.message} Comunícate con nosotros indicando el código ${reservas?.reservaChatbotId ?? ""}.`,
        icon: "warning",
        confirmButtonColor: "#26547B",
      }).then(() => onClose());
      return;
    }

    setEnviando(false);
    Swal.fire({
      title: "Comprobante enviado",
      text: "Tu comprobante quedó registrado y será verificado en breve.",
      icon: "success",
      confirmButtonColor: "#26547B",
    }).then(() => {
      window.location.reload();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={250}
      className={{
        base: styles.modalContent,
        afterOpen: styles.modalContentAfterOpen,
        beforeClose: styles.modalContentBeforeClose,
      }}
      overlayClassName={{
        base: styles.modalOverlay,
        afterOpen: styles.modalOverlayAfterOpen,
        beforeClose: styles.modalOverlayBeforeClose,
      }}
      contentLabel="Subir comprobante de pago"
    >
      <div className={styles.modalHeader}>
        <h2>Subir comprobante de pago</h2>
        <button className={styles.closeIconButton} onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.campo}>
          <label htmlFor="grupoCuenta">Cuenta a la que transferiste</label>
          <select
            id="grupoCuenta"
            className={styles.select}
            value={grupoSeleccionado}
            onChange={handleGrupoChange}
          >
            <option value="" disabled>
              Selecciona la razón social
            </option>
            {Object.entries(cuentasBancarias).map(([key, grupo]) => (
              <option key={key} value={key}>
                {grupo.label}
              </option>
            ))}
          </select>
        </div>

        {grupoActual && grupoActual.accounts.length > 1 && (
          <div className={styles.campo}>
            <label htmlFor="cuentaBanco">Banco</label>
            <select
              id="cuentaBanco"
              className={styles.select}
              value={cuentaIndex}
              onChange={(e) => setCuentaIndex(Number(e.target.value))}
            >
              {grupoActual.accounts.map((cuenta, index) => (
                <option key={`${cuenta.banco}-${index}`} value={index}>
                  {cuenta.banco}
                </option>
              ))}
            </select>
          </div>
        )}

        {cuentaActual && (
          <div className={styles.cuentaDetalle}>
            {/* <div className={styles.cuentaDetalleFila}>
              <span>Banco</span>
              <span>{cuentaActual.banco}</span>
            </div> */}
            {/* <div className={styles.cuentaDetalleFila}>
              <span>Titular</span>
              <span>{cuentaActual.titular}</span>
            </div>
            <div className={styles.cuentaDetalleFila}>
              <span>Tipo</span>
              <span>{cuentaActual.tipo}</span>
            </div> */}
            <div className={styles.cuentaDetalleFila}>
              <span>Número</span>
              <span>{cuentaActual.numero}</span>
            </div>
            {cuentaActual.nit && (
              <div className={styles.cuentaDetalleFila}>
                <span>NIT</span>
                <span>{cuentaActual.nit}</span>
              </div>
            )}
            {/* <button className={styles.copiarBoton} onClick={copiarNumeroCuenta}>
              {copiado ? "¡Copiado!" : "Copiar número de cuenta"}
            </button> */}
          </div>
        )}

        <div className={styles.campo}>
          <label htmlFor="montoComprobante">Monto del comprobante</label>
          <input
            id="montoComprobante"
            type="number"
            min="0"
            max={MONTO_MAXIMO}
            step="1"
            placeholder="Ej. 350000"
            className={styles.inputMonto}
            value={monto}
            onChange={handleMontoChange}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="fechaConsignacion">Fecha de consignación</label>
          <input
            id="fechaConsignacion"
            type="date"
            max={hoyIso()}
            className={styles.inputMonto}
            value={fechaConsignacion}
            onChange={(e) => setFechaConsignacion(e.target.value)}
          />
        </div>

        <div className={styles.campo}>
          <label>Comprobante</label>
          <div
            className={`${styles.dropzone} ${dragActivo ? styles.dropzoneActivo : ""} ${
              archivo ? styles.dropzoneConArchivo : ""
            }`}
            onClick={() => !archivo && inputFileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActivo(true);
            }}
            onDragLeave={() => setDragActivo(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputFileRef}
              type="file"
              accept="image/*,.pdf"
              className={styles.dropzoneInput}
              onChange={handleFileInputChange}
            />
            {archivo ? (
              <div className={styles.previewArchivo}>
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className={styles.previewImagen} />
                ) : (
                  <div className={styles.previewIcono}>📄</div>
                )}
                <div className={styles.previewInfo}>
                  <span className={styles.previewNombre}>{archivo.name}</span>
                  <button className={styles.quitarArchivo} onClick={quitarArchivo}>
                    Quitar archivo
                  </button>
                </div>
              </div>
            ) : (
              <p>Arrastra tu comprobante aquí o haz clic para seleccionarlo (imagen o PDF)</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.cancelarBoton} onClick={onClose}>
          Cancelar
        </button>
        <button className={styles.enviarBoton} onClick={handleEnviar} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar comprobante"}
        </button>
      </div>
    </Modal>
  );
};

export default ComprobanteModal;

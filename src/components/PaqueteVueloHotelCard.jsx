import styles from "../../public/styles/paqueteVueloHotel.module.css";

const Tramo = ({ tramo }) => {
  if (!tramo) return null;

  return (
    <div className={styles.tramo}>
      <img
        src={tramo.logo}
        alt={tramo.airlineName}
        className={styles.tramo_logo}
      />
      <div className={styles.tramo_punto}>
        <div className={styles.tramo_iata}>{tramo.origin}</div>
        <div className={styles.tramo_hora}>{tramo.departure}</div>
      </div>
      <span className={styles.tramo_escalas}>{tramo.type}</span>
      <div className={styles.tramo_punto}>
        <div className={styles.tramo_iata}>{tramo.destination}</div>
        <div className={styles.tramo_hora}>{tramo.arrival}</div>
      </div>
    </div>
  );
};

const PaqueteVueloHotelCard = ({
  hotelId,
  hotelNombre,
  hotelImagen,
  nights,
  vuelo,
  precios,
  currency,
  personas,
  formatPrecio,
}) => {
  const urlHotel = `/hoteles/${hotelId}`;

  return (
    <>
      <h2 className={styles.paquete_titulo}>
        Arma tu viaje completo y ahorra comprando todo junto
      </h2>
    <div className={styles.paquete}>
      <div className={styles.columna}>
        <div className={styles.columna_header}>
          <span className={styles.columna_titulo}>Alojamiento</span>
          <a className={styles.columna_link} href="#resultados">
            Cambiar alojamiento
          </a>
        </div>
        <div className={styles.alojamiento_body}>
          <img
            src={hotelImagen}
            alt={hotelNombre}
            className={styles.alojamiento_img}
          />
          <div className={styles.alojamiento_datos}>
            <h3 className={styles.hotel_nombre}>{hotelNombre}</h3>
            <div className={styles.hotel_noches}>
              {nights} {nights === 1 ? "noche" : "noches"}
            </div>
            <a className={styles.hotel_detalle} href={urlHotel}>
              Ver detalle
            </a>
          </div>
        </div>
      </div>

      <div className={styles.columna}>
        <div className={styles.columna_header}>
          <span className={styles.columna_titulo}>Vuelo</span>
        </div>
        <Tramo tramo={vuelo.outbound} />
        <Tramo tramo={vuelo.inbound} />
      </div>

      <div className={styles.columna}>
        <div className={styles.columna_header}>
          <span className={styles.columna_titulo}>Adicionales</span>
          <a className={styles.columna_link} href={urlHotel}>
            Ver
          </a>
        </div>
        <a className={styles.adicional} href={urlHotel}>
          Actividad <span className={styles.adicional_mas}>+</span>
        </a>
        <a className={styles.adicional} href={urlHotel}>
          Traslado <span className={styles.adicional_mas}>+</span>
        </a>
      </div>

      <div className={`${styles.columna} ${styles.precio_columna}`}>
        {precios.total !== null ? (
          <>
            <span className={styles.precio_label}>Por persona</span>
            <div className={styles.precio_total}>
              {formatPrecio(precios.porPersona)} {currency}
            </div>
            <div className={styles.precio_detalle}>
              Total {personas} {personas === 1 ? "persona" : "personas"}:{" "}
              {formatPrecio(precios.total)} {currency}
            </div>
          </>
        ) : (
          <>
            <span className={styles.precio_label}>Desde</span>
            <div className={styles.precio_total}>
              {formatPrecio(precios.precioHotel)} {currency}
            </div>
            <div className={styles.precio_detalle}>
              Alojamiento. Consulta el valor del vuelo al continuar.
            </div>
          </>
        )}
        <div className={styles.precio_nota}>Incluye impuestos, tasas y cargos</div>
        <a href={urlHotel} className={styles.precio_boton_link}>
          <button className={styles.precio_boton}>Comprar</button>
        </a>
      </div>
    </div>
    </>
  );
};

export default PaqueteVueloHotelCard;

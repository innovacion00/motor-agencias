import React, { useEffect } from 'react'
import styles from '../../public/styles/id.module.css'
import DropdownSearch from './DropdownSearch'



export const id = ({id}) => {
  
  useEffect(() => {
    const disponibilidad = JSON.parse(localStorage.getItem("data"))
    console.log(disponibilidad)
    
    const habitaciones = disponibilidad.find((vaina)=>
      vaina.hotel.id == id
      )
      console.log(habitaciones)
  }, [])
  
  return (
    <>
     <div className={styles.search_form_wrapper}><DropdownSearch client:load /></div>

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <a href="/Bookingconnect">Inicio</a> / <a href="#">Resultados de búsqueda</a> / Hotel Avexi Suites
        </div>
        <div className={styles.hotel_title}>Hotel Avexi Suites</div>
        <div className={styles.hotel_info}>
          <img
            alt="Hotel Avexi Suites entrance with plants and a welcoming atmosphere"
            height={"300"}
            src={"https://www.gehsuites.com/images/fachada_avexi.jpg"}
            width={"300"}
          />
          <div className={styles.hotel_details}>
            <div className={styles.description}>
              <h2>Hotel Avexi Suites</h2>
              <p>
                <i className={"fas fa_map_marke_alt"}></i> Bocagrande Cra 3 N° 4-86, Cartagena de Indias, Bolívar |
                <a
                  href="https://www.google.com/maps/place/Hotel+Avexi+Suites+By+GEH+Suites/@10.4004511,-75.5602618,16.5z/data=!4m9!3m8!1s0x8ef62f3dacf7d4b7:0xf58b384d5cb2a6ee!5m2!4m1!1i2!8m2!3d10.3982696!4d-75.5587844!16s%2Fg%2F11h8967kdh?hl=es&entry=ttu&g_ep=EgoyMDI0MDkwOS4wIKXMDSoASAFQAw%3D%3D"
                >
                  Ver mapa
                </a>
              </p>
              <p>
                Ubicado entre el mar Caribe y la bahía de Cartagena de Indias, en el animado distrito comercial y turístico
                de Bocagrande, este hotel ofrece fácil acceso a todas las atracciones y opciones de entretenimiento que la
                ciudad moderna y amurallada tiene para ti.
                <a href="/infoavexi">Leer más</a>
              </p>
              <div className={styles.icons}>
                <img
                  src={"https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png"}
                  alt="Wi-Fi"
                  className={styles.icon_image}
                />
                <img
                  src={"https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png"}
                  alt="Piscina"
                  className={styles.icon_image}
                />
                <img
                  src={"https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png"}
                  alt="Conserjería"
                  className={styles.icon_image}
                />
                <img
                  src={"https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png"}
                  alt="Gimnasio"
                  className={styles.icon_image}
                />
              </div>
            </div>
            <div className={styles.more_info}>
              <a href="/infoavexi">
                <button>Ver más sobre el hotel</button>
              </a>
            </div>
          </div>
        </div>
        <div className={styles.available_rooms}>Habitaciones disponibles</div>
        <div className={styles.search_criteria}>
          <div>
            <p>Check-in</p>
            <strong>#fechacheckin</strong>
          </div>
          <div>
            <p>Check-out</p>
            <strong>#fechacheckout</strong>
          </div>
          <div>
            <p>Noches</p>
            <strong>#numeronoches</strong>
          </div>
          <div>
            <p>Húspedes</p>
            <strong>#numerohuespedes</strong>
          </div>
          <div>
            <p>Habitaciones</p>
            <strong>#numerohabitaciones</strong>
          </div>
          <button>Modificar búsqueda</button>
        </div>

        <div className={styles.room_section}>
          <div className={styles.cards}>{}</div>
          <div className={styles.reservation}>
            <h3>Reserva</h3>
            <p>Hotel Avexi Suites</p>
            <p>
              #fechacheckin <i className={"fas fa-arrow-right"}></i> #fechacheckout (#numeronoches)
            </p>
            <ul id="selected-rooms">Aquí se añadirán las habitaciones seleccionadas</ul>
            <p>Selecciona las habitaciones de la lista al costado para reservar</p>
            <a href="/reservas">
              <button>Reservar ahora</button>
            </a>
          </div>
        </div>
      </div>
    
  

    </>
  )
}

export default id



  
   
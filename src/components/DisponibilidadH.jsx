import React, { useEffect, useState } from "react";
import styles from "../../public/styles/DisponibilidadH.module.css";
import DropdownSearch from "./DropdownSearch";

const hotelesData = {
  9: {
    name: "Hotel Marina Suites",
    direction:
      "Cra. 3 #4 - 32, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Situado en el centro turístico y comercial de la ciudad de Cartagena de indias, el Hotel Marina Suites es una hermosa propiedad con 42 habitaciones diseñadas para el descanso y relax, con las comodidades necesarias para el disfrute de tus vacaciones en pareja, amigos, familia o para tus actividades de negocios o eventos en la ciudad.",
    image: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
  },
  6: {
    name: "Hotel Avexi Suites",
    direction:
      "Cra. 3 #No 4 -86, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Ubicado entre el mar Caribe y la bahía de Cartagena de Indias, en el animado distrito comercial y turístico de Bocagrande, este hotel ofrece fácil acceso a todas las atracciones y opciones de entretenimiento que la ciudad moderna y amurallada tiene para ti.",
    image: "https://www.gehsuites.com/images/fachada_avexi.jpg",
  },
  4: {
    name: "Hotel Aixo Suites",
    direction:
      "Cra. 1 #47-10, Marbella, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Ubicado en Cartagena de Indias – Colombia, y teniendo como vecino las hermosas playas del mar caribe, se abre paso en el moderno y reconocido barrio de Marbella nuestro Hotel Aixo Suites; a solo 5 minutos de la mágica e infranqueable Ciudad Amurallada; podrás revivir y encontrar las hazañas de nuestros héroes, lo colonial de sus calles, la belleza de sus cañones, su diversidad gastronómica y las más reconocidas tiendas y bares para tu diversión.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_aixo.jpg",
  },
  1: {
    name: "Hotel Azuan Suites",
    direction:
      "Cra. 3 #8-156, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Azuán Suites By GEH Suites, en Cartagena es un hermoso hotel ubicado en el sector moderno de Bocagrande, gozando de una ubicación estratégica a tan solo 15 minutos del aeropuerto Internacional Rafael Núñez.Nuestro hotel está situado a solo 5 minutos de las preciosas playas de Castillo, Bocagrande y Laguito. A 15 minutos de Azuán Suites, encontrarás el misterio que encierra la ciudad amurallada de Cartagena de Indias, sus monumentos y edificaciones históricas: Torre del Reloj, Castillo de San Felipe y sus mágicas calles coloniales.",
    image: "https://www.gehsuites.com/images/fachada-azuan.jpg",
  },
  5: {
    name: "Hotel Abi Inn",
    direction:
      "Cra. 1 #42-70, Barrio El Cabrero, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "¡Ven a disfrutar de unas vacaciones inolvidables en el Hotel Abi Inn! Estamos ubicados en la primera línea del mar, frente a las playas espectaculares de Marbella. Además, estamos a pocos pasos de la ciudad amurallada de Cartagena, una de las ciudades más hermosas de Colombia, con sus callejones empedrados, sus edificios coloniales y su increíble puerto.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_abi.jpg",
  },
  7: {
    name: "Hotel Bocagrande Suites",
    direction:
      "Cra. 2 #7-159, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Hotel Bocagrande Cartagena By GEH Suites, es un moderno hotel ubicado en el reconocido sector turístico de Bocagrande, gozando de una ubicación privilegiada sobre la avenida San Martín a tan solo un paso de las tradicionales playas de Bocagrande, 5 minutos de las playas de Castillo Grande y a 15 minutos del aeropuerto Internacional Rafael Núñez.",
    image: "https://www.gehsuites.com/images/fachada_hotel_boagrande.jpg",
  },
  8: {
    name: "Hotel Rodadero ",
    direction: "Cl. 20 #1B-64, Santa Marta, Gaira, Santa Marta, Magdalena",
    description:
      "El Hotel Rodadero Inn se encuentra ubicado en la ciudad de Santa Marta, uno de los destinos turísticos más hermosos de Colombia. A orillas del mar Caribe, esta ciudad cuenta con una gran variedad de playas, parques y monumentos históricos que cautivarán a todos nuestros visitantes.",
    image: "https://www.gehsuites.com/images/fachada_rodadero_1.jpg",
  },
  2: {
    name: "Hotel 1525",
    direction: "Cl. 11 #2-29, Comuna 2, Santa Marta, Magdalena",
    description:
      "Hotel 1525 By GEH Suites, está ubicado en el Centro Histórico de la Ciudad de Santa Marta, cuenta con 24 habitaciones confortables y modernas. Este hotel, ocupa un edificio con elementos decorativos de forja, se encuentra a 2 minutos caminando de las exposiciones de joyas del Museo del Oro Tairona Casa de la Aduana.",
    image: "https://www.gehsuites.com/images/fachada_1525.jpg",
  },
  100: {
    name: "Hotel Axis Inn",
    direction: "Cra. 3 #10-14, El Rodadero, Gaira, Santa Marta, Magdalena",
    description:
      "El Hotel Axis Inn by GEH Suites está ubicado estratégicamente a unos pasos de las hermosas playas de El Rodadero, en la ciudad de Santa Marta. Ofrecemos una experiencia inolvidable en un ambiente moderno y confortable, ideal para disfrutar en cualquier época del año.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg",
  },
  101: {
    name: "Hotel Sansiraka",
    direction: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena",
    description:
      "En el Hotel Sansiraka, ubicado en la turística zona de El Rodadero, a 13 km de Santa Marta, podrás disfrutar de alojamiento con balcón, Wi-Fi gratuito y una piscina al aire libre. Algunas de nuestras habitaciones cuentan con una acogedora área de estar con TV por cable y balcones privados.",
    image: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
  },
  3: {
    name: "Hotel Madisson ",
    direction: "Cra. 18 #93-97, Bogotá",
    description:
      "Madisson Inn Hotel Luxury By GEH Suites, nos encontramos ubicados en la Carrera 18 No. 93 – 97, barrio El Chicó, Bogotá, Colombia. Con una excelente ubicación en el norte de la Ciudad, a solo 5 minutos del parque de la 93, muy cerca de la zona T donde están localizados los más destacados restaurantes de la ciudad, cerca de las entidades financieras, centros de negocios, zonas de entretenimiento y casinos.",
    image: "https://www.gehsuites.com/images/fachada-madison.jpg",
  },
  10: {
    name: "Hotel Windsor House ",
    direction: "Cl. 95 #9-97, Chapinero, Bogotá, Cundinamarca",
    description:
      "Bienvenido al Hotel Windsor House Inn By GEH Suites, ubicado en la calle 95 #9-97, en el moderno barrio Chapinero de Bogotá. Nuestro hotel está estratégicamente situado cerca de los principales atractivos turísticos del norte de Bogotá, lo que lo convierte en el lugar ideal para disfrutar de una estancia inolvidable en la capital colombiana.",
    image:
      "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
  },
};

const hotelIcons ={
  9:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  1:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  6:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  7:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png" ],
  4:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  5:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  3:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  10:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png"],
  8:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",],
  2:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",],
  100:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",],
  101:["https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png","https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",]
}

export const Cid = ({ id }) => {
  const hotel = hotelesData[id];
  const [habitaciones, setHabitaciones] = useState({});
  const[rangosfechas,setfechas] = useState({})
  useEffect(() => {
    const disponibilidad = JSON.parse(localStorage.getItem("data"));
    const rangosdefechas = JSON.parse(localStorage.getItem("nochesyedades"));
    // console.log(disponibilidad)
    const resultado = disponibilidad.find((vaina) => vaina.hotel.id == id);

    setfechas(rangosdefechas);
    // console.log("Habitaciones encontradas:", resultado);
    setHabitaciones(resultado);
  }, [id]);
  console.log("este", habitaciones);

    const checkin = (new Date(rangosfechas?.dateRange?.startDate)).toLocaleDateString()
    const checkout = (new Date(rangosfechas?.dateRange?.endDate)).toLocaleDateString()
    
    const renderIcons = () => {
      const icons = hotelIcons[id] || []; // Obtiene los íconos del hotel actual o un arreglo vacío
      return icons.map((iconUrl, index) => (
        <img
          key={index}
          src={iconUrl}
          alt={`Ícono ${index + 1}`}
          className={styles.icon}
        />
      ));
    };
    // console.log(checkout) 
  return (
    <>
      <div className={styles.search_form_wrapper}>
        <DropdownSearch client:load />
      </div>

      <div className={styles.container}>
        {/* Detalles del hotel */}
        <div className={styles.breadcrumb}>
          <a href="/Bookingconnect">Inicio</a> /{" "}
          <a href="#">Resultados de búsqueda</a> / {habitaciones?.hotel?.name}
        </div>
        <div className={styles.hotel_title}>
          {habitaciones?.hotel?.name || "Hotel no encontrado"}
        </div>
        <div className={styles.hotel_info}>
          <img
            alt={hotel.name}
            height={"300"}
            src={hotel.image}
            width={"300"}
          />
          <div className={styles.hotel_details}>
            <div className={styles.description}>
              <h2>{habitaciones?.hotel?.name}</h2>
              <p>
                <i className={"fas fa_map_marke_alt"}></i> {hotel.direction} ||
                <a href="https://www.google.com/maps/place/Hotel+Avexi+Suites+By+GEH+Suites/@10.4004511,-75.5602618,16.5z/data=!4m9!3m8!1s0x8ef62f3dacf7d4b7:0xf58b384d5cb2a6ee!5m2!4m1!1i2!8m2!3d10.3982696!4d-75.5587844!16s%2Fg%2F11h8967kdh?hl=es&entry=ttu&g_ep=EgoyMDI0MDkwOS4wIKXMDSoASAFQAw%3D%3D">
                  Ver mapa
                </a>
              </p>
              <p>
                {hotel.description}
                <a href="/infoavexi">Leer más</a>
              </p>
              <div className={styles.icons}>
              {renderIcons()}
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
            <strong>{checkin}</strong>
          </div>
          <div>
            <p>Check-out</p>
            <strong>{checkout}</strong>
          </div>
          <div>
            <p>Noches</p>
            <strong>{rangosfechas.nights}</strong>
          </div>
          <div>
            <p>Húspedes</p>
            <strong>1</strong>
          </div>
          <div>
            <p>Habitaciones</p>
            <strong>{habitaciones?.availability?.map((tipo)=>
            tipo.available_rooms?.length
            )}</strong>
          </div>
          <button>Modificar búsqueda</button>
        </div>

        <div className={styles.room_section}>
          <div className={styles.cards}>
            {habitaciones?.availability?.map((tipo) =>
              tipo.available_rooms?.map((dato) => (
                <div className={styles.room_card} key={dato.roomId}>
                  <img
                    alt="Standard double room with a double bed, TV, and modern decor"
                    height="200"
                    src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/243552213.jpg?k=6ae2287058f976690f09ec48b1ea9f1b44deb127fc846bc6e9c976e80c3cdece&o=&hp=1"
                    width="250"
                  />
                  <div className={styles.room_details}>
                    <h3>
                      {dato.roomName}
                     
                    </h3>
                    <a href="">Ver habitación</a>
                    <p>
                      <i className="fas fa-check-circle"></i>
                      Pago de inmediato
                    </p>
                    <p>
                      <i className="fas fa-bed"></i> {dato.beds} cama doble
                    </p>
                    {/* <p className="price">
                 {dato.availability[0]?.available_rooms?.map((roomData)=>{
                return roomData?.products?.map((product)=>(<p>{product?.baseRate?.amountAfterTax}</p>))
                })} 
              </p> */}
                  <br />  
                    
                    <button
                      className={styles.select_room}
                      data-room="Doble Estándar"
                      data-price="#Valor"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.reservation}>
            <h3>Reserva</h3>
            <p>Hotel Avexi Suites</p>
            <p>
              #fechacheckin <i className={"fas fa-arrow-right"}></i>{" "}
              #fechacheckout (#numeronoches)
            </p>
            <ul id="selected-rooms">
              Aquí se añadirán las habitaciones seleccionadas
            </ul>
            <p>
              Selecciona las habitaciones de la lista al costado para reservar
            </p>
            <a href="/reservas">
              <button>Reservar ahora</button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cid;

import React, { useEffect, useState } from "react";
import styles from "../../public/styles/DisponibilidadH.module.css";
import DropdownSearch from "./DropdownSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { disponibilidad } from "../stores/disponibilidad";
import { currency } from "../stores/divisas"; //  store de divisa
import { useStore } from "@nanostores/react";
import { toursData } from "../stores/InfoTours";
import ToursCs from "./ToursCs";
import UpgradeModal from './UpgradeModal';

const hotelesData = {
  9: {
    name: "Hotel Marina Suites",
    direction:
      "Cra. 3 #4 - 32, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Situado en el centro turístico y comercial de la ciudad de Cartagena de indias, el Hotel Marina Suites es una hermosa propiedad con 42 habitaciones diseñadas para el descanso y relax, con las comodidades necesarias para el disfrute de tus vacaciones en pareja, amigos, familia o para tus actividades de negocios o eventos en la ciudad.",
    image: "https://www.gehsuites.com/images/portada_marian_suites.jpg",
    habitaciones: [
      {
        nombre: "Doble Estándar",
        imagen:
          "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244687850.jpg?k=9778545d180eb45a8c1efc9be1dcc6096307cbc29f54c3d085a91c5d5ac25509&o=&hp=1",
      },
      {
        nombre: "Cuadruple Estándar",
        imagen:
          "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244687880.jpg?k=372da40f421cb18e3158e3cee258a55df68da3916f5ca7b345f4e62b84cd943d&o=&hp=1",
      },
    ],
    leermas: "/infomarina",
    mapa: "https://www.google.com/maps/place/Hotel+Marina+Suites+By+GEH+Suites/@10.3980472,-75.5594753,20z/data=!4m9!3m8!1s0x8ef62f3dacaa4b37:0xa3c318672161c840!5m2!4m1!1i2!8m2!3d10.3980472!4d-75.5592452!16s%2Fg%2F1yh4g_t8v?hl=es&entry=ttu&g_ep=EgoyMDI0MDkwOS4wIKXMDSoASAFQAw%3D%3D",
  },
  6: {
    name: "Hotel Avexi Suites",
    direction:
      "Cra. 3 #No 4 -86, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Ubicado entre el mar Caribe y la bahía de Cartagena de Indias, en el animado distrito comercial y turístico de Bocagrande, este hotel ofrece fácil acceso a todas las atracciones y opciones de entretenimiento que la ciudad moderna y amurallada tiene para ti.",
    image: "https://www.gehsuites.com/images/fachada_avexi.jpg",
    leermas: "/infoavexi",
    mapa: "https://www.google.com/maps/place/Hotel+Avexi+Suites+By+GEH+Suites/@10.3982749,-75.5613593,17z/data=!4m10!3m9!1s0x8ef62f3dacf7d4b7:0xf58b384d5cb2a6ee!5m3!1s2025-01-17!4m1!1i2!8m2!3d10.3982696!4d-75.5587844!16s%2Fg%2F11h8967kdh?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  4: {
    name: "Hotel Aixo Suites",
    direction:
      "Cra. 1 #47-10, Marbella, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Ubicado en Cartagena de Indias – Colombia, y teniendo como vecino las hermosas playas del mar caribe, se abre paso en el moderno y reconocido barrio de Marbella nuestro Hotel Aixo Suites; a solo 5 minutos de la mágica e infranqueable Ciudad Amurallada; podrás revivir y encontrar las hazañas de nuestros héroes, lo colonial de sus calles, la belleza de sus cañones, su diversidad gastronómica y las más reconocidas tiendas y bares para tu diversión.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_aixo.jpg",
    leermas: "/infoaixo",
    mapa: "https://www.google.com/maps/place/Hotel+Aixo+Suites+By+GEH/@10.4306705,-75.5330912,15.92z/data=!4m9!3m8!1s0x8ef62f9966357c8d:0x3377f5a11170d0ac!5m2!4m1!1i2!8m2!3d10.436384!4d-75.5363788!16s%2Fg%2F11sv6wc7r6?hl=es&entry=ttu&g_ep=EgoyMDI0MDkwOS4wIKXMDSoASAFQAw%3D%3D",
  },
  1: {
    name: "Hotel Azuan Suites",
    direction:
      "Cra. 3 #8-156, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Azuán Suites By GEH Suites, en Cartagena es un hermoso hotel ubicado en el sector moderno de Bocagrande, gozando de una ubicación estratégica a tan solo 15 minutos del aeropuerto Internacional Rafael Núñez.Nuestro hotel está situado a solo 5 minutos de las preciosas playas de Castillo, Bocagrande y Laguito. A 15 minutos de Azuán Suites, encontrarás el misterio que encierra la ciudad amurallada de Cartagena de Indias, sus monumentos y edificaciones históricas: Torre del Reloj, Castillo de San Felipe y sus mágicas calles coloniales.",
    image: "https://www.gehsuites.com/images/fachada-azuan.jpg",
    leermas: "/infoazuan",
    mapa: "https://www.google.com/maps/place/Hotel+Azu%C3%A1n+Suites+GEH+Suites/@10.4038589,-75.5531886,17z/data=!3m1!4b1!4m9!3m8!1s0x8ef62f3de5e1d95f:0xba9cfea6defdcf9e!5m2!4m1!1i2!8m2!3d10.4038589!4d-75.5531886!16s%2Fg%2F11b6d6nxfv?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  5: {
    name: "Hotel Abi Inn",
    direction:
      "Cra. 1 #42-70, Barrio El Cabrero, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "¡Ven a disfrutar de unas vacaciones inolvidables en el Hotel Abi Inn! Estamos ubicados en la primera línea del mar, frente a las playas espectaculares de Marbella. Además, estamos a pocos pasos de la ciudad amurallada de Cartagena, una de las ciudades más hermosas de Colombia, con sus callejones empedrados, sus edificios coloniales y su increíble puerto.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachada_abi.jpg",
    leermas: "/infoabi",
    mapa: "https://www.google.com/maps/place/Hotel+Abi+Inn+By+GEH+Suites/@10.4325263,-75.543057,20z/data=!4m10!3m9!1s0x8ef62f906e9b6101:0x7ab9906842cc5727!5m3!1s2025-01-17!4m1!1i2!8m2!3d10.4328251!4d-75.5425129!16s%2Fg%2F1vv2t939?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  7: {
    name: "Hotel Bocagrande Suites",
    direction:
      "Cra. 2 #7-159, Cartagena de Indias, Provincia de Cartagena, Bolívar",
    description:
      "Hotel Bocagrande Cartagena By GEH Suites, es un moderno hotel ubicado en el reconocido sector turístico de Bocagrande, gozando de una ubicación privilegiada sobre la avenida San Martín a tan solo un paso de las tradicionales playas de Bocagrande, 5 minutos de las playas de Castillo Grande y a 15 minutos del aeropuerto Internacional Rafael Núñez.",
    image: "https://www.gehsuites.com/images/fachada_hotel_boagrande.jpg",
    leermas: "/infobocagrande",
    maps: "https://www.google.com/maps/place/Hotel+Bocagrande+By+GEH+Suites/@10.4032675,-75.5580278,17z/data=!4m10!3m9!1s0x8ef62f732fdd8f39:0xfea73be8f2bccc2!5m3!1s2025-01-17!4m1!1i2!8m2!3d10.4032622!4d-75.5554529!16s%2Fg%2F1v76_qp6?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  8: {
    name: "Hotel Rodadero ",
    direction: "Cl. 20 #1B-64, Santa Marta, Gaira, Santa Marta, Magdalena",
    description:
      "El Hotel Rodadero Inn se encuentra ubicado en la ciudad de Santa Marta, uno de los destinos turísticos más hermosos de Colombia. A orillas del mar Caribe, esta ciudad cuenta con una gran variedad de playas, parques y monumentos históricos que cautivarán a todos nuestros visitantes.",
    image: "https://www.gehsuites.com/images/fachada_rodadero_1.jpg",
    leermas: "/inforodadero",
  },
  2: {
    name: "Hotel 1525",
    direction: "Cl. 11 #2-29, Comuna 2, Santa Marta, Magdalena",
    description:
      "Hotel 1525 By GEH Suites, está ubicado en el Centro Histórico de la Ciudad de Santa Marta, cuenta con 24 habitaciones confortables y modernas. Este hotel, ocupa un edificio con elementos decorativos de forja, se encuentra a 2 minutos caminando de las exposiciones de joyas del Museo del Oro Tairona Casa de la Aduana.",
    image: "https://www.gehsuites.com/images/fachada_1525.jpg",
    leermas: "/info1525",
    mapa: "https://www.google.com/maps/place/Hotel+1525+By+GEH+Suites./@11.2466275,-74.2152749,17z/data=!4m10!3m9!1s0x8ef4f563780ed7d5:0x4f9709537618b675!5m3!1s2025-01-17!4m1!1i2!8m2!3d11.2466222!4d-74.2127!16s%2Fg%2F11c72r3603?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  48: {
    name: "Hotel Axis Inn",
    direction: "Cra. 3 #10-14, El Rodadero, Gaira, Santa Marta, Magdalena",
    description:
      "El Hotel Axis Inn by GEH Suites está ubicado estratégicamente a unos pasos de las hermosas playas de El Rodadero, en la ciudad de Santa Marta. Ofrecemos una experiencia inolvidable en un ambiente moderno y confortable, ideal para disfrutar en cualquier época del año.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Hotel-axis.jpg",
    leermas: "/infoaxis",
    mapa: "https://www.google.com/maps/place/Hotel+Axis+Rodadero+(Antes+Yuldama+Rodadero+Inn)/@11.2021456,-74.2307486,17z/data=!4m10!3m9!1s0x8ef45f5a5cc60ae5:0xf686bc21855778fd!5m3!1s2025-01-17!4m1!1i2!8m2!3d11.2021404!4d-74.2258777!16s%2Fg%2F1wbryvj8?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  44: {
    name: "Hotel Sansiraka",
    direction: "Cra. 4 #15-65, Gaira, Santa Marta, Magdalena",
    description:
      "En el Hotel Sansiraka, ubicado en la turística zona de El Rodadero, a 13 km de Santa Marta, podrás disfrutar de alojamiento con balcón, Wi-Fi gratuito y una piscina al aire libre. Algunas de nuestras habitaciones cuentan con una acogedora área de estar con TV por cable y balcones privados.",
    image: "https://www.gehsuites.com/images/SANSIRAKA-portada.jpg",
    leermas: "/infosansiraka",
    mapa: "https://www.google.com/maps/place/Hotel+Sansiraka+By+GEH+Suites./@11.1968691,-74.2284548,17z/data=!4m10!3m9!1s0x8ef4f5613a63c691:0x50eabd7eb9ea10ac!5m3!1s2025-01-17!4m1!1i2!8m2!3d11.1968638!4d-74.2258799!16s%2Fg%2F1tkf20ns?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  3: {
    name: "Hotel Madisson ",
    direction: "Cra. 18 #93-97, Bogotá",
    description:
      "Madisson Inn Hotel Luxury By GEH Suites, nos encontramos ubicados en la Carrera 18 No. 93 – 97, barrio El Chicó, Bogotá, Colombia. Con una excelente ubicación en el norte de la Ciudad, a solo 5 minutos del parque de la 93, muy cerca de la zona T donde están localizados los más destacados restaurantes de la ciudad, cerca de las entidades financieras, centros de negocios, zonas de entretenimiento y casinos.",
    image: "https://www.gehsuites.com/images/fachada-madison.jpg",
    leermas: "/infomadisson",
    mapa: "https://www.google.com/maps/place/Madisson+Inn+Hotel+%26+Luxury+Suites/@4.6790103,-74.0566063,17z/data=!4m10!3m9!1s0x8e3f98db9c7c66cb:0x6890aeeef651eb89!5m3!1s2025-01-17!4m1!1i2!8m2!3d4.679005!4d-74.0540314!16s%2Fg%2F11b6j76yfq?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  10: {
    name: "Hotel Windsor House ",
    direction: "Cl. 95 #9-97, Chapinero, Bogotá, Cundinamarca",
    description:
      "Bienvenido al Hotel Windsor House Inn By GEH Suites, ubicado en la calle 95 #9-97, en el moderno barrio Chapinero de Bogotá. Nuestro hotel está estratégicamente situado cerca de los principales atractivos turísticos del norte de Bogotá, lo que lo convierte en el lugar ideal para disfrutar de una estancia inolvidable en la capital colombiana.",
    image:
      "https://images.trvl-media.com/lodging/95000000/94320000/94314400/94314363/7ba08d14.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
    leermas: "/infowindsor",
    maps: "https://www.google.com/maps/place/Windsor+House+By+GEH+Suites/@4.6777866,-74.0467485,17z/data=!4m10!3m9!1s0x8e3f9aeb34e59325:0xfc23b6652dbfa1f3!5m3!1s2025-01-17!4m1!1i2!8m2!3d4.6777813!4d-74.0441736!16s%2Fg%2F11c67x1q_q?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  41: {
    name: "Hotel Zulita",
    direction: "Cl. 48 #13-22, Bogotá,",
    description:
      "Bienvenido al Hotel Zulita Inn , ubicado en la Cl. 48 #13-22, Bogotá, en el moderno barrio el Campin de Bogotá. dispone de alojamiento con salón de uso común, parking privado gratis y terraza. Este hotel de 3 estrellas ofrece servicio de conserjería y mostrador de información turística. El alojamiento ofrece recepción 24 horas, traslado para ir o volver del aeropuerto, servicio de habitaciones y wifi gratis en todo el alojamiento.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Fachadazulita.jpg",
    leermas: "/infozulita",
    maps: "https://www.google.com/maps/place/Hotel+Zulita+Inn/@4.6879147,-74.0899281,13z/data=!4m17!1m5!2m4!1szulita!5m2!5m1!1s2025-01-17!3m10!1s0x8e3f9a2f9334f003:0x655c701d3cd16a0f!5m3!1s2025-01-17!4m1!1i2!8m2!3d4.635357!4d-74.0662546!15sCgZ6dWxpdGGSAQVob3RlbOABAA!16s%2Fg%2F1ptx2ctdm?hl=es&entry=ttu&g_ep=EgoyMDI1MDExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  56: {
    name: "Hotel Boquilla Suites",
    direction: "Cra. 9 #38 - 76, La Boquilla, Provincia de Cartagena, Bolívar",
    description:
      "Hotel Boquilla Suites By Gh Suites, es un acogedor hotel, ubicado en la zona norte y turística de Cartagena a pocos pasos de las reconocidas playas de la Boquilla, las cuales representa la cultura y gastronomía típica de la región por la gran variedad de restaurantes típicos en la zona balnearia.",
    image:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/fachada_boquilla.jpg",
    leermas: "/infoboquilla",
    mapa: "google.com/maps/place/Hotel+Boquilla+Suites/@10.4704047,-75.501179,17z/data=!3m1!4b1!4m9!3m8!1s0x8ef63ac94ada9efd:0xf15682aa17f6c6b6!5m2!4m1!1i2!8m2!3d10.4703994!4d-75.4986041!16s%2Fg%2F1yh9tpqwj?hl=es&entry=ttu&g_ep=EgoyMDI1MDEyMS4wIKXMDSoASAFQAw%3D%3D",
  },
};

const hotelIcons = {
  //Marina
  9: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  //Azuan
  1: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  //Avexi
  6: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  7: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  4: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  5: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  3: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  10: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/icongym.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  8: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  2: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
  ],
  48: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  44: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
  41: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],

  56: [
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconbuffet.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconwind.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconpool.png",
    "https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png",
  ],
};

const idRooms = {
  //Marina
  9: {
    83528:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244687909.jpg?k=588a0945ee3388cd5a731509f2159507ddc6909d57cf82705c8459bda40af93e&o=&hp=1",
    83527:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244687926.jpg?k=145b19423036fee51796d9fc3cf6faeb5d6781a48d68172524d4860e74cce1e7&o=&hp=1",
  },
  //Azuan
  1: {
    83534:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/244639436.jpg?k=6053b3890a7824a3f1a2e30cf862520be80de97644162b30a3e0097d920efafd&o=&hp=1",
    83533:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/100688038.jpg?k=54490e2560d63e691c5d1cf6b009af33d7931f19ef58f69cfbadcc1d7d7b9e2e&o=&hp=1",
  },
  // Avexi
  6: {
    83532:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/243552213.jpg?k=6ae2287058f976690f09ec48b1ea9f1b44deb127fc846bc6e9c976e80c3cdece&o=&hp=1", //
    83529:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/243543715.jpg?k=7a47cd6af5f8971556ec91581b60c011e0544430470ef73311dd1663eb7dae96&o=&hp=1", //
  },
  //Aixo
  4: {
    83422:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/243606366.jpg?k=56a1826f8a1cc73a276daa1fca9939e8ded4bd93d437ce8b5cdf108f5182ee9d&o=&hp=1", //Doble vista al mar
    83421:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/243822181.jpg?k=4fe61a142fd7b7db782f34e6ea7840c69a1410144320158a8735ff12fc130149&o=&hp=1", // Cuadruple vista a la ciudad
    83420:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/243604358.jpg?k=204560397c2a8805509a69aa6b658e302d5ac75e6bf0796006feac48e1cb1287&o=&hp=1", //Doble vista a la ciudad
    83419:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/243822212.jpg?k=a952a8491f9d7ef59dde500bb8f4a3848ff65bf59947885a8c865ab120cb99c8&o=&hp=1", //Cuadruple vista al mar
  },
  //Abi
  5: {
    125839:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103679.jpg?k=3f562015f90b32aef1908717d3d9c829ca84205b75c2dea10f23a24086cb6c33&o=", //quintuple
    125838:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103653.jpg?k=5d5ac95d4cfffcbb34279c6bfceff8f9e83d7ff91667ef35e8b18a2e66b3b810&o=&hp=1", //Cuadruple
    125837:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103563.jpg?k=c576cf614094adb97aac6fb5efaf9824d0e82cc4475335da439307f9b988c998&o=&hp=1", //Triple
    125836:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465103716.jpg?k=72751312367e83c523a272fa6b3a003b39e4fddec303f9b4ccf90d4fe617f0e6&o=&hp=1", //Doble
  },
  //Bocagrande
  7: {
    90130:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/278270762.jpg?k=cfe9e10545681c6490650e349d45ab6c7dea125d24801658e92055501b28e1e1&o=&hp=1", //Doble
    90132:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/278271044.jpg?k=a355c5879bfeb9e27598302ed92b706d247b75751f5b6913e3646dba034a4c89&o=&hp=1", //Triple
    90131:
      "https://bocagrande-cartagena-de-indias-hotel.hotelmix.es/data/Photos/1920x1080/7442/744293/744293593/Hotel-Bocagrande-By-Geh-Suites-Cartagena-Exterior.JPEG", //Cuadruple
    90133:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/278270629.webp?k=5ff367659e2bf52e7d12d2be46a8097d2f841da5412af77427e4b2871298668e&o=", //Quintuple
  },
  //Madisson
  3: {
    109452:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334226.webp?k=a004d558a7caac5707bdc849283abfeb2ecd6d58cf26240134d7f05eb8dec747&o=", //Doble estandar
    109509:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334155.jpg?k=ba1ec414837795ab1103b686854e44de7bed29be732ebe15e4939f48caed974b&o=&hp=1", //Familiar
    109508:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334230.webp?k=d17106ce148a62065276e27a754e9dc18114ffcb5216053d27fbd729bb3de33d&o=", //Ejecutiva twin
    109507:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334103.webp?k=2ab38772d7efc02a82af9ecdbb30fe80e426884ba1921673816001a052fcef5f&o=", //Suite business
    116068:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334236.webp?k=45c0d1d467b2948766f9498bd96ad31c23d6d07bd4bc56c868c1c350867191d2&o=", //Familiar 3pax
    109505:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/383334105.webp?k=a47582ec901b5eb62ceb7f54c35513f4be2dcb643c1afb614de836d9d4e13d58&o=", //Superior con terraza
  },
  //Windsor
  10: {
    129037:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/471544106.webp?k=3e08d57aed1444ddddc842f3f448788f730887c0ef56c4457b118413a8269ec1&o=", //Suite matrimonial
    129036:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/471543564.webp?k=2ea2ba03ec7ff46492ce5998c37f4fd3b6e20b6ae787057ed6b947374833516c&o=", //Doble junior twin
    129034:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/471545508.webp?k=e3a2a7fa0b4b33817d0cb70798664e99632dfbafa1eb14082e8b175e36dc399d&o=", //Triple estandar altillo con escaleras
    129033:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/471544109.webp?k=cfe9b729c64f0c0daf9a4e12b2e73a37969464218d18c8aefe75ac8372a69184&o=", //Doble estandar twin
    128299:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/16238061.webp?k=2577bcb3f4193b4541dc7622f2c8fa6575719bc10d81b33a0346d4fba1be476e&o=", //Doble Superior
    129035:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/471544107.webp?k=becf339774cf1f30d6cf0b0deaf4968c14e1f7ef81a860a96ea54ebf2f66fd5d&o=", // Doble Junior Suite
  },
  //Rodadero
  8: {
    125833:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439311.webp?k=54a110e3e17479e02e7a68081ef190742c897c7880a2d1ac5adfdb7c651395fc&o=", //Cuadruple estandar
    121966:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439332.webp?k=be9946ab62f0398843255b2a33a1145d955860e341f24ab15e3ce246d3ebbc40&o=", //Doble estandar
    125832:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/465439311.webp?k=54a110e3e17479e02e7a68081ef190742c897c7880a2d1ac5adfdb7c651395fc&o=", //Triple estandar
  },

  //1525
  2: {
    104423:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/277587915.webp?k=be35499f5579b4a7e3023c6f36ea998be04c2e9c436744d6668a29b4ac779e24&o=", // Cuadruple
    104422:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/276804078.webp?k=c39084688f6346321275d1563e107f25fb3ff606b136083830a9f1fcd869d0fc&o=", //Triple
    104145:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/276804089.webp?k=e98318f7fe089ef70520a3b984f5c08bcf5507fb0d92a1ab56c243473912d928&o=", //Doble
  },

  //Axis

  48: {
    145577:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Familiar-axis.jpeg", //quintuple
    145576:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/109098049.jpg?k=d28963d3d5f71aa4e6fcc2e3864341d453c8d5bd2aeb8875caaf92d9e9b6c63a&o=", //cuadurple
    145573:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-triple-axis2.jpeg", //triple
    145571:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-Doble-axis.jpeg", //doble
  },

  //Sansiraka
  44: {
    104184:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-quintuple-sansiraka.jpeg", //Quintuple
    104183:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-cuadruple-sansiraka.jpeg", //Cuadruple
    104182:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-triple-sansiraka1.jpeg", //Triple
    104181:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-junior-sansiraka.jpeg", //Junior
    104179:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-doble-sansiraka1.jpeg", //Doble
    104979:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/Habitacion-twin-sansiraka1.jpeg", //Twin
  },
  //Zulita
  41: {},

  //Boquilla
  56: {
    83803:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/doble1_boquilla.jpg", //Doble
    83802:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/familiar_boquilla.jpg", //Familiar
    83801:
      "https://space-img.sfo3.digitaloceanspaces.com/Agencias/cuadruple1_boquilla.jpg", //
  },
};

const quintuple = {
  9: false, //marina
  1: false, //azuan
  6: false, //avexi
  7: true, //bocagrande
  4: false, //aixo
  5: true, //abi
  3: false, //madison
  10: false, //windsor
  8: false, //rodadero
  2: false, //1525
  48: true, //axis
  44: true, //sansiraka
  41: false, //Zulita
  56: true, // Boquilla,
};

const trasladosCartagenaPesos = {
  0: "33500",
  1: "67000",
};

const trasladosCartagenaDolares = {
  0: "15",
  1: "30",
};

const trasladosSantamartaPesos = {
  0: "17200",
  1: "34400",
};

const trasladosSantamartaDolares = {
  0: "5",
  1: "10",
};

const plan_alimentacion = {
  9: false, //marina
  1: false, //azuan
  6: false, //avexi
  7: false, //bocagrande (proximamente)
  4: true, //aixo
  5: true, //abi
  3: true, //madison
  10: true, //windsor
  8: false, //rodadero
  2: false, //1525
  48: true, //axis
  44: true, //sansiraka
  41: false, //Zulita
  56: true, // Boquilla,
};
// UseState

export const Cid = ({ id }) => {
  const [tooltipActivo, setTooltipActivo] = useState(null);
  const currentCurrency = useStore(currency); // COP o USD
  const [divisaSelec, setdivisaSelec] = useState("COP");

  const hotel = hotelesData[id];
  const [habitaciones, setHabitaciones] = useState({});
  const [rangosfechas, setfechas] = useState({});
  const [ninos, setninos] = useState(0);
  const [adultos, setadultos] = useState(0);
  const [datohabitacion, setDatohabitacion] = useState([]);
  const [categoria, setcategoria] = useState();
  const [mostrarseccion, setocultarseccion] = useState(plan_alimentacion[id]);
  const [mostrarToures, setmostrarToures] = useState(false);
  const [mostrarTraslados, setmostrarTraslados] = useState(false);
  const [planDeAlimentacion, setplanDeAlimentacion] = useState("solodesayuno");
  const [contadorHabitaciones, setcontadorHabitaciones] = useState(0);
  const [infoToures, setinfoToures] = useState({});
  const [selectedTours, setSelectedTours] = useState([]);
  const [tipoTraslado, setTipoTraslado] = useState(null);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [filteredTours, setFilteredTours] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleReservarClick = () => {
    // Solo mostrar el modal para hoteles específicos en Cartagena
    if ([1, 6, 9].includes(Number(id)) && habitaciones?.hotel?.city === "CARTAGENA") {
      setShowUpgradeModal(true);
    } else {
      enviardatos();
      window.location.href = "/reservas";
    }
  };

  const handleUpgradeSelect = (newHotelId) => {
    // Redirigir a la página del nuevo hotel
    window.location.href = `/hoteles/${newHotelId}`;
  };

  function openModal(tour) {
    setIsOpen(true);
    setinfoToures(tour);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const [planDeAlimentacionFormateado, setPlanDeAlimentacionFormateado] =
    useState("");

  // console.log(selectedTours);

  const habitacionesRestringidas = [
    "Familiar quintuple",
    "Quintuple",
    "QUINTUPLE",
    "Habitacion Sextuple",
    "Quíntuple",
  ];

  //console.log("numero de camas:"camas)
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Sin Disponibilidad";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateTransferPrice = (
    city,
    currency,
    transferType,
    totalGuests
  ) => {
    if (!transferType) return 0;

    const precios = {
      CARTAGENA:
        currency === "USD"
          ? trasladosCartagenaDolares
          : trasladosCartagenaPesos,
      SANTA_MARTA:
        currency === "USD"
          ? trasladosSantamartaDolares
          : trasladosSantamartaPesos,
    };

    // Determinar el índice basado en el tipo de traslado
    const priceIndex = transferType === "ambos" ? 1 : 0;

    const precioBase = precios[city]?.[priceIndex];
    if (!precioBase) return 0;

    // Calcular número de vehículos necesarios (cada vehículo lleva 4 personas)
    const vehiculosNecesarios = Math.ceil(totalGuests / 4);
    return parseFloat(precioBase) * vehiculosNecesarios;
  };

  const calculateTotalPrice = (
    basePrice,
    tours,
    currency,
    totalGuests,
    city,
    tipoTraslado
  ) => {
    const toursPrice = tours.reduce((total, tour) => {
      const tourPrice =
        currency === "USD"
          ? parseFloat(tour.preciousd)
          : parseFloat(tour.preciocol);
      return total + tourPrice * totalGuests;
    }, 0);

    const transferPrice = calculateTransferPrice(
      city,
      currency,
      tipoTraslado,
      totalGuests
    );

    return parseFloat(basePrice) + toursPrice + transferPrice;
  };

  //Enviar datos de reserva
  const enviardatos = () => {
    localStorage.setItem("datosreserva", JSON.stringify(datohabitacion));
  };

  //Use effect selectedCity
  useEffect(() => {
    const city = localStorage.getItem("selectedCity");
    if (city) {
      setSelectedCity(city);
    }
  }, []);

  // Filtrar tours cada vez que cambie la ciudad seleccionada
  useEffect(() => {
    if (selectedCity) {
      // Filtra los tours que coincidan con la ciudad seleccionada (ignorando mayúsculas/minúsculas)
      const tours = toursData.filter(
        (tour) => tour.city.toUpperCase() === selectedCity.toUpperCase()
      );
      setFilteredTours(tours);
    } else {
      setFilteredTours([]);
    }
  }, [selectedCity]);

  // Función para abrir el modal con la información del tour seleccionado
  const openTourDetails = (tour) => {
    setSelectedTours(tour);
    setIsOpen(true);
  };

  // UseEffect
  useEffect(() => {
    const formatearPlan = (plan) => {
      switch (plan) {
        case "solodesayuno":
          return "Solo desayuno";
        case "mediapension":
          return "Media Pension";
        case "pensioncompleta":
          return "Pension completa";
        default:
          return plan;
      }
    };

    setPlanDeAlimentacionFormateado(formatearPlan(planDeAlimentacion));

    const category = JSON.parse(localStorage.getItem("datosUsuario"));
    const disponibilidad = JSON.parse(localStorage.getItem("data"));
    const rangosdefechas = JSON.parse(localStorage.getItem("nochesyedades"));
    //console.log("Datos de disponibilidad" , disponibilidad)
    const resultado = disponibilidad.find((vaina) => vaina.hotel.id == id);
    const adultos = Number(localStorage.getItem("cantNinos"));
    const ninos = Number(localStorage.getItem("cantAdultos"));
    setcategoria(category);
    setninos(ninos);
    setadultos(adultos);
    setfechas(rangosdefechas);
    setHabitaciones(resultado);
    setocultarseccion(plan_alimentacion[id]);
    //limpiar los datos de habitaciones
    setDatohabitacion([]);
  }, [id, planDeAlimentacion]);

  console.log("Disponibilidad total", habitaciones);

  // const regex =categoria?.agencia?.category == 0? /\[Booking connect Neto\]/i : /\[Booking connect Mayorista\]/i; // Expresión regular para validar el roomName

  const valorDelRadioTraslados = (event) => {
    setmostrarTraslados(event.target.value === "si");
  };

  const valorDelRadio = (event) => {
    setplanDeAlimentacion(event.target.value); //valor del radiobutton
  };

  const valorDelRadioToures = (event) => {
    setmostrarToures(event.target.value === "si"); //valor del radiobutton
  };

  const handleSeleccionTraslado = (opcion) => {
    setTipoTraslado(opcion);
  };

  const handleTourSelection = (event, tour) => {
    if (event.target.checked) {
      // Si el checkbox está marcado, agregar el tour al array de seleccionados
      setSelectedTours([...selectedTours, tour]);
    } else {
      // Si se desmarca, quitarlo del array de seleccionados
      setSelectedTours(selectedTours.filter((item) => item.id !== tour.id));
    }
  };

  console.log("Plan de alimentación:", planDeAlimentacionFormateado);
  // console.log(planDeAlimentacion)

  const categoriagencia = categoria?.agencia?.category; //categoria de la agencia
  console.log("categoria de la agencia:", categoriagencia);

  const regexMayorista = {
    solodesayuno: /\[Booking connect Mayorista\]/i,
    pensioncompleta: /\[Booking connect Mayorista PA\]/i,
    mediapension: /\[Booking connect Mayorista PAM\]/i,
  };

  const regexminoristas = {
    solodesayuno: /\[Booking connect Neto\]/i,
    pensioncompleta: /\[Booking connect Neto PA\]/i,
    mediapension: /\[Booking connect Neto PAM\]/i,
  };

  const regexSeleccionado =
    categoriagencia == 0
      ? regexminoristas[planDeAlimentacion]
      : regexMayorista[planDeAlimentacion];

  const checkin = new Date(
    rangosfechas?.dateRange?.startDate
  ).toLocaleDateString();
  const checkout = new Date(
    rangosfechas?.dateRange?.endDate
  ).toLocaleDateString();

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

  const handleDelete = (index) => {
    setDatohabitacion((prevHabitaciones) => {
      const nuevasHabitaciones = [...prevHabitaciones];
      nuevasHabitaciones.splice(index, 1); //Elimina el elemento en el índice dado
      return nuevasHabitaciones;
    });
  };
  console.log(mostrarTraslados);

  return (
    <>
      <div className={styles.search_form_wrapper}>
        <DropdownSearch client:load />
      </div>

      <div className={styles.container}>
        {/* Detalles del hotel */}
        <div className={styles.breadcrumb}>
          <a href="/">Inicio</a> / <a href="#">Resultados de búsqueda</a> /{" "}
          {habitaciones?.hotel?.name}
        </div>
        <div className={styles.stepper}>
          <div className={styles.step}>
            <div className={styles.stepnumberActive}>1</div>
            <div className={styles.steptitleActive}>Alojamiento</div>
            <div className={styles.stepcontentActive}>
              Seleccione el alojamiento <br />
              {rangosfechas.nights} noches,{" "}
              {/*{hotelesDisponibles[0]?.availability[0]?.adults || 0} adultos, {cantNinos(hotelesDisponibles[0]?.availability || [])} niños */}
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepnumber}>2</div>
            <div className={styles.steptitle}>Vuelo</div>
            <div className={styles.stepcontent}>
              Origen ⇆ Destino final
              <br />
              {/* {nochesyedades1?.dateRange ? 
        `${formatDate(nochesyedades1.dateRange.startDate)} - ${formatDate(nochesyedades1.dateRange.endDate)}` : 
        'Fechas no seleccionadas'} */}
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepnumber}>3</div>
            <div className={styles.steptitle}>Adicionales</div>
            <div className={styles.stepcontent}>
              ¡Disfruta al máximo tu viaje! Incluye opciones de traslado, tours,
              y planes de alimentación entre otros adicionales
            </div>
          </div>
        </div>
        <br />
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
                <a href={hotel.mapa} target="_blank" rel="noopener noreferrer">
                  Ver mapa
                </a>
              </p>
              <p>
                {hotel.description}
                <a
                  href={hotel.leermas}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leer más
                </a>
              </p>
              <div className={styles.icons}>{renderIcons()}</div>
            </div>
            <div className={styles.more_info}>
              <a href={hotel.leermas} target="_blank" rel="noopener noreferrer">
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
            <p>Húespedes</p>
            <strong>{ninos + adultos}</strong>
          </div>
          {/* <div>
            <p>Habitaciones disponibles</p>
            <strong>
              {habitaciones?.availability?.map(
                (tipo) => tipo.available_rooms?.length
              )}
            </strong>
          </div> */}
          {/* <button>Modificar búsqueda</button> */}
        </div>
        {/* Sección de Plan de Alimentación */}
        {mostrarseccion && (
          <div className={styles.plan_alimentacion}>
            <div className={styles.planes}>
              <h3>Selecciona el plan de alimentación para tu grupo</h3>
              <p>
                Todas las habitaciones de la reserva tendrán el mismo plan de
                alimentación.
              </p>
              <div>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value="solodesayuno"
                    defaultChecked
                    className={styles.radioInput}
                    onChange={valorDelRadio}
                  />
                  <span>
                    <strong>Solo desayuno</strong> (Incluye desayuno)
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value="mediapension"
                    className={styles.radioInput}
                    onChange={valorDelRadio}
                  />
                  <span>
                    <strong>Media pensión</strong> (Incluye desayuno + almuerzo
                    o cena)
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value="pensioncompleta"
                    className={styles.radioInput}
                    onChange={valorDelRadio}
                  />
                  <span>
                    <strong>Pensión completa</strong> (Incluye desayuno +
                    almuerzo + cena)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className={styles.plan_alimentacion}>
          <div className={styles.planes}>
            {/* Mostrar traslados y tours solo para CARTAGENA o SANTA_MARTA */}
            {(selectedCity === "CARTAGENA" ||
              selectedCity === "SANTA_MARTA") && (
              <>
                {/* --------------------------- TRASLADOS --------------------------- */}
                <h3>¿Desea añadir traslados a su reserva?</h3>
                <input
                  type="radio"
                  name="traslados"
                  value="si"
                  className={styles.radioInput}
                  onChange={() => setmostrarTraslados(true)}
                />{" "}
                <span style={{ paddingRight: "10px" }}> Si</span>
                <input
                  type="radio"
                  name="traslados"
                  value="no"
                  defaultChecked
                  onChange={() => {
                    setmostrarTraslados(false);
                    setTipoTraslado(null);
                  }}
                  className={styles.radioInput}
                />{" "}
                <span style={{ paddingRight: "10px" }}> No</span>
                {mostrarTraslados && (
                  <div className={styles.touresSection}>
                    <h4 style={{ color: "#1f3b64" }}>
                      Selecciona la opcion de traslado deseada:
                    </h4>
                    <div className={styles.tour_item}>
                      <input
                        type="radio"
                        name="tipoTraslado"
                        value="aeropuerto_hotel"
                        onChange={() =>
                          handleSeleccionTraslado("aeropuerto_hotel")
                        }
                      />
                      <label htmlFor="A a H"> Aereopuerto al hotel</label>
                    </div>
                    <div className={styles.tour_item}>
                      <input
                        type="radio"
                        name="tipoTraslado"
                        value="hotel_aeropuerto"
                        onChange={() =>
                          handleSeleccionTraslado("hotel_aeropuerto")
                        }
                      />
                      <label htmlFor="H a A"> Hotel al Aereopuerto</label>
                    </div>
                    <div className={styles.tour_item}>
                      <input
                        type="radio"
                        name="tipoTraslado"
                        value="ambos"
                        onChange={() => handleSeleccionTraslado("ambos")}
                      />
                      <label htmlFor="A a H Y H a A">
                        {" "}
                        Aereopuerto al hotel | Hotel al aereopuerto{" "}
                      </label>
                    </div>
                  </div>
                )}
                <br />
                {/* ----------------------TOURES------------------- */}
                <h3>¿Desea añadir tours a su reserva?</h3>
                <input
                  type="radio"
                  name="tours"
                  value="si"
                  onChange={valorDelRadioToures}
                  className={styles.radioInput}
                />{" "}
                <span style={{ paddingRight: "10px" }}> Si</span>
                <input
                  type="radio"
                  name="tours"
                  value="no"
                  defaultChecked
                  className={styles.radioInput}
                  onChange={valorDelRadioToures}
                />{" "}
                <span style={{ paddingRight: "10px" }}> No</span>
                {mostrarToures && (
                  <div className={styles.touresSection}>
                    <br />
                    <h4 style={{ color: "#1f3b64" }}>
                      Opciones de toures disponibles
                      {selectedCity ? ` en ${selectedCity}` : ""}:
                    </h4>
                    <ToursCs
                      isOpen={modalIsOpen}
                      onRequest={closeModal}
                      infoToures={infoToures}
                    />
                    {selectedCity ? (
                      <>
                        {filteredTours.length > 0 ? (
                          filteredTours.map((tour, index) => (
                            <div
                              className={styles.tour_item}
                              key={tour.id || index}
                            >
                              <input
                                type="checkbox"
                                id={`tour-${tour.id || index}`}
                                name={`tour-${tour.id || index}`}
                                onChange={(e) => handleTourSelection(e, tour)}
                              />
                              <label htmlFor={`tour-${tour.id || index}`}>
                                {tour.title}
                              </label>
                              <button
                                className="detail_btn"
                                onClick={() => openModal(tour)}
                              >
                                Ver detalle
                              </button>
                            </div>
                          ))
                        ) : (
                          <p>No hay tours disponibles para {selectedCity}.</p>
                        )}
                      </>
                    ) : (
                      <p>
                        Por favor, seleccione una ciudad para ver los tours
                        disponibles.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* habitaciones?.availability?.map((cam)=>
  cam.available_rooms?.map((camas)=>(dato.beds))) */}
        <div className={styles.room_section}>
          <div className={styles.cards}>
            {habitaciones?.availability?.map((tipo) =>
              tipo.available_rooms?.map((dato) => (
                <div className={styles.room_card} key={dato.roomId}>
                  <img
                    alt="Standard double room with a double bed, TV, and modern decor"
                    height="200"
                    src={idRooms[habitaciones.hotel.id][dato.roomId]}
                    width="250"
                  />
                  <div className={styles.room_details}>
                    <h2>{dato.roomName}</h2>
                    <a
                      href={hotel.leermas}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver habitación
                    </a>
                    <p>
                      <i className="fas fa-check-circle"></i>
                      Para pagos antes del check-in
                    </p>
                    <p>
                      <i className="fas fa-bed"></i> {dato.beds} personas
                    </p>
                    <p className="price"></p>
                    <p className="price">
                      {dato.products?.map((product, idx) => {
                        if (regexSeleccionado?.test(product.roomName)) {
                          const price =
                            currentCurrency === "USD"
                              ? product?.baseRate?.amountBeforeTaxUSD
                              : product?.baseRate?.amountBeforeTax;

                          return (
                            <span key={idx}>
                              {currency == "USD"
                                ? null
                                : formatCurrency(
                                    price || "Sin precio disponible"
                                  )}

                              <span> {currentCurrency}</span>
                            </span>
                          );
                        }
                        return null; // No renderiza nada si no cumple la condición
                      })}
                    </p>

                    {/* Mostrar "Habitaciones disponibles" solo si la habitación está en la lista restringida */}
                    {habitacionesRestringidas.includes(dato.roomName) && (
                      <b style={{ marginTop: "100px", color: "red" }}>
                        Habitaciones disponibles: {dato.count}
                      </b>
                    )}
                    <br />

                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <button
                        className={styles.select_room}
                        data-room="Doble Estándar"
                        data-price="#Valor"
                        onClick={() => {
                          if (
                            !(
                              quintuple[habitaciones?.hotel?.id] &&
                              habitacionesRestringidas.includes(dato.roomName)
                            ) ||
                            contadorHabitaciones < (dato.count || Infinity) // Verifica el límite de habitaciones
                          ) {
                            setDatohabitacion((prevState) => [
                              ...prevState,
                              {
                                incluirTraslado: mostrarTraslados, // Booleano que indica si se seleccionó traslado
                                tipoTraslado: mostrarTraslados
                                  ? tipoTraslado
                                  : null, // El tipo específico de traslado
                                tourSeleccionado: selectedTours,
                                plandealimentacion:
                                  planDeAlimentacionFormateado,
                                roomId: dato.roomId,
                                checkin: checkin,
                                checkout: checkout,
                                nights: rangosfechas.nights,
                                imgH: idRooms[habitaciones.hotel.id][
                                  dato.roomId
                                ],
                                huespedes: adultos + ninos,
                                precio: calculateTotalPrice(
                                  dato.products?.find((product) =>
                                    regexSeleccionado.test(product.roomName)
                                  )?.baseRate?.[
                                    currentCurrency == "USD"
                                      ? "amountBeforeTaxUSD"
                                      : "amountBeforeTax"
                                  ] || "Sin precio disponible",
                                  selectedTours,
                                  currentCurrency,
                                  ninos + adultos,
                                  habitaciones?.hotel?.city,
                                  tipoTraslado
                                ),
                                precioBase:
                                  dato.products?.find((product) =>
                                    regexSeleccionado.test(product.roomName)
                                  )?.baseRate?.[
                                    currentCurrency == "USD"
                                      ? "amountBeforeTaxUSD"
                                      : "amountBeforeTax"
                                  ] || "Sin precio disponible",
                                NombreH: dato.roomName,
                                beds: dato.beds,
                                hotelid: habitaciones?.hotel?.roomcloud_id,
                                ciudad: habitaciones?.hotel?.city,
                                hotelidAutocore: habitaciones?.hotel?.id,
                                rateId: dato.products?.find((product) =>
                                  regexSeleccionado.test(product.roomName)
                                )?.rateId,
                              },
                            ]);
                            setcontadorHabitaciones(
                              (prevCount) => prevCount + 1
                            );
                          }
                        }}
                        disabled={
                          quintuple[habitaciones?.hotel?.id] &&
                          habitacionesRestringidas.includes(dato.roomName) &&
                          contadorHabitaciones >= dato.count
                        }
                        onMouseOver={() => {
                          if (
                            quintuple[habitaciones?.hotel?.id] &&
                            habitacionesRestringidas.includes(dato.roomName) &&
                            contadorHabitaciones >= dato.count
                          ) {
                            setTooltipActivo(dato.roomId); // Activa el tooltip solo para este botón
                          }
                        }}
                        onMouseOut={() => setTooltipActivo(null)} // Desactiva el tooltip al salir
                      >
                        Seleccionar
                      </button>

                      {/* Tooltip SOLO para este botón */}
                      {tooltipActivo === dato.roomId && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "120%", // Posiciona el tooltip arriba del botón
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "black",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            fontSize: "12px",
                            whiteSpace: "nowrap",
                            zIndex: 1000,
                          }}
                        >
                          Límite de habitaciones alcanzado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.reservation}>
            <h3>Reserva</h3>
            <hr />
            <br />
            <h3>{habitaciones?.hotel?.name}</h3>
            <h3>Habitaciones a reservar: {contadorHabitaciones}</h3>
            <p>
              {checkin} <i className={"fas fa-arrow-right"}></i> {checkout}
            </p>
            <h4> ({rangosfechas.nights} noches )</h4>
            <br />
            <hr />

            {datohabitacion.map((dato, index) => (
              <div key={index} style={{ position: "relative" }}>
                {" "}
                {/* Contenedor relativo para posicionar el botón */}
                <ul id="selected-rooms">
                  <br />
                  <p>{dato.NombreH}</p>

                  <h5>
                    {checkin} - {checkout}
                  </h5>
                  <h5>
                    {rangosfechas.nights} noches, {ninos + adultos} huespedes
                  </h5>

                  <h5>Tipo de plan: {planDeAlimentacionFormateado}</h5>
                  <h5>
                    {selectedTours.length > 0 && ""}
                    {selectedTours.map((tour, i) => (
                      <span key={i}>
                        {i > 0 && ", "}
                        {tour.title}
                      </span>
                    ))}
                  </h5>
                  <h2>
                    {formatCurrency(
                      calculateTotalPrice(
                        dato.precioBase,
                        selectedTours,
                        currentCurrency,
                        ninos + adultos,
                        habitaciones?.hotel?.city,
                        tipoTraslado
                      )
                    )}{" "}
                    {currentCurrency == "USD" ? "USD" : "COP"}
                  </h2>
                  <button
                    style={{
                      position: "absolute",
                      bottom: "80px", // Ajusta la posición vertical
                      left: "145px", // Ajusta la posición horizontal
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={(index) => {
                      handleDelete(index);
                      setcontadorHabitaciones((prevCount) =>
                        prevCount > 0 ? prevCount - 1 : 0
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ color: "#26547B" }}
                    />{" "}
                    {/* Icono de la caneca */}
                  </button>

                  <hr />
                </ul>
              </div>
            ))}

            {/* Reemplazar el anchor tag y modificar el botón */}
            <button
              
              onClick={handleReservarClick}
              disabled={datohabitacion.length === 0}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: datohabitacion.length === 0 ? "#d3d3d3" : "#26547B",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: datohabitacion.length === 0 ? "not-allowed" : "pointer",
                transition: "background-color 0.3s ease",
                marginTop: "20px",
                marginBottom: "20px"
              }}
            >
              Reservar ahora
            </button>
            <UpgradeModal 
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              currentHotelId={Number(id)}
              onSelectUpgrade={handleUpgradeSelect}
              onContinue={() => {
                enviardatos();
                window.location.href = "/reservas";
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Cid;

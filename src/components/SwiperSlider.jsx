// src/components/SwiperSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'; // Importar módulos desde 'swiper/modules'
import 'swiper/swiper-bundle.css'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const SwiperSlider = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, EffectFade]} // Habilitar módulos
      spaceBetween={30}
      slidesPerView= {1}
      effect="fade"
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: true }} // Configuración de autoplay
      loop={true} // Habilitar bucle
      
    >
      {/* Banner servicio temporalmente inactivo */}
      {/* <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/ChatGPT%20Image%2024%20nov%202025,%2009_48_26%20a.m..png" alt="Banner servicio temporalmente inactivo" />
      </SwiperSlide> */}
      <SwiperSlide>
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/banner%20geh%20ia.jpg" alt="Banner LucIA" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Banner%20playa%20salguero.jpg" alt="Banner playa salguero" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/banner%20cotizador.jpg" alt="Banner cotizar 2" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/banner%20cotizador%202.jpg" alt="Banner cotizar" />
      </SwiperSlide>
      <SwiperSlide >
        <a href="/tablerousuario">
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Banner-cashback.jpeg" alt="Banner cashback" /></a>
      </SwiperSlide>
      <SwiperSlide>
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Banner-planA.jpeg" alt="Banner plan de alimentacion" />
      </SwiperSlide>
      
      <SwiperSlide>
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/slide2.jpeg" alt="Banner principal" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

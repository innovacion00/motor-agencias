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
      <SwiperSlide >
        
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/geh%20booking2,2.jpg" alt="Banner toures y traslados" />
      </SwiperSlide>
      <SwiperSlide >
        <a href="/tablerousuario">
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Banner-prepagados.jpeg" alt="Banner saldos prepagados" /></a>
      </SwiperSlide>
      <SwiperSlide >
        <a href="/tablerousuario">
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Banner-cashback.jpeg" alt="Banner cashback" /></a>
      </SwiperSlide>
      <SwiperSlide>
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Banner-grupos.jpeg" alt="Banner Grupos" />
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

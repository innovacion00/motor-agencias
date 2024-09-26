// src/components/SwiperSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; // Importar módulos desde 'swiper/modules'
import 'swiper/swiper-bundle.css'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const SwiperSlider = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]} // Habilitar módulos
      spaceBetween={30}
      slidesPerView= {1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 2000, disableOnInteraction: true }} // Configuración de autoplay
      loop={true} // Habilitar bucle
      
    >
      
      <SwiperSlide>
        <img src="/public/images/slide1.jpeg" alt="Banner 1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/public/images/slide2.jpeg" alt="Banner 2" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

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
       spaceBetween={3}
      slidesPerView= {1}
      effect="fade"
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 1500, disableOnInteraction: true }} // Configuración de autoplay
      loop={true} // Habilitar bucle
      
    >
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/13HotelWindsorHouse140.jpg" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/16HotelWindsorHouse427.jpg" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/18HotelWindsorHouse745.jpg" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/20HotelWindsorHouse922.jpg" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/10HotelWindsorHouse601.jpg" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/14HotelWindsorHouse541.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/4HotelWindsorHouse664.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/7HotelWindsorHouse397.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/9HotelWindsorHouse219.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

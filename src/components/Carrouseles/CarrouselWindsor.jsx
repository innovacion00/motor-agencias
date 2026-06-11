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
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/471546822.jpg?k=4e33c4312a9040302b72006b98ef183325e3e10afb15f60c842f89fe1f8cb802&o=" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/18HotelWindsorHouse745.jpg" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/660491565.jpg?k=62868506b0ed36eed3746e554d19f223bc952c0b6bacbb948ca444d58be917d9&o=" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/16238085.jpg?k=06a06c7743d80aaf15faeec73bff1276191de84cc145d21dfc65c779b921d47c&o=" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/14HotelWindsorHouse541.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

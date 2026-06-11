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
        <img src="https://media.staticontent.com/media/pictures/bfa3a92f-1dc3-4750-9487-c2d1028df243/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Avexi-living.jpg" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/foodStanAvexi.jpg" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/fullBreakfastAvexi.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/a9fde440-2709-446e-96a0-510caeeffece/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

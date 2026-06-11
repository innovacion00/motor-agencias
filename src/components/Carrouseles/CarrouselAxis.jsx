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
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Lobbyaxis.jpeg" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/ed89cf7f-3a04-4b31-b1e9-589bff8e78d6/1120x700?op=fit" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/4c6b3384-8301-4feb-9f8c-704daeca7e95/1120x700?op=fit" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/99935878-83d2-47d4-8655-7abcafb62319/1120x700?op=fit" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/Buffet.jpeg" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/77480723-aaf9-4edc-9ba1-3b4cf6177605/1120x700?op=fit" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/ab665892-ebc9-4ffe-bacf-4eef2181d1a2/1120x700?op=fit" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

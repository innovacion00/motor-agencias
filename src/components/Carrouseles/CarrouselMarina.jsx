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
        <img src="https://media.staticontent.com/media/pictures/8ec9a39c-8af0-4aef-9832-b8fe38e6793f/1120x700?op=fit" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/b1958594-9b9c-4897-9bcc-b77540b22022/1120x700?op=fit" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/75489e46-d229-4612-bb4e-3d61064a063f/1120x700?op=fit" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/c8356922-9841-4db7-bb6e-9628ad6863f0/1120x700?op=fit" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      
    </Swiper>
  );
};

export default SwiperSlider;

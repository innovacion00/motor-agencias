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
        <img src="https://media.staticontent.com/media/pictures/324ab199-ba77-4d2e-b0c3-1a5be4fe0c9c/1120x700?op=fit" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/2ee38ea1-8e9c-4d8e-91a0-42b441f99887/1120x700?op=fit" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/8e7ed4f5-5c4a-4f6f-a795-05a87cbecf33/1120x700?op=fit" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/d2917cdb-d89a-4c4e-829c-7ec6567aba2a/1120x700?op=fit" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/80fc021d-b8ee-454a-afdd-0e7c17394131/1120x700?op=fit" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      
    </Swiper>
  );
};

export default SwiperSlider;

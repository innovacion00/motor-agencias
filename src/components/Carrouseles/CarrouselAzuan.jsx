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
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/244634659.jpg?k=becae71ed93bcf69535c2704fb02e0d97a3e078e017b9356a7a3fcc6d60ca4ee&o=&hp=1" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/a623702c-3190-4110-9d27-79b099e71011/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/a36166a6-1d7a-4c79-aa28-7f2d3bb507e0/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/8b632510-08bb-4cc8-8334-ace742140cc5/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/5c3a6ca0-8a99-4233-b61c-168cf477f194/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

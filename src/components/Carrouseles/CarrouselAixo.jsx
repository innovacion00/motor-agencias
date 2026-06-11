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
        <img src="https://media.staticontent.com/media/pictures/223a5234-1faa-42b5-917d-ff767cb45395/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/78704123-88d2-449f-9f84-e1e0a7a2f083/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/a1205ed7-10ea-4143-8c7b-c8519cec2be0/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/ca2408d7-7084-4187-b7ad-5caafb84c7f2/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/e51fa841-77b8-4485-bb28-24820d002c37/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

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
        <img src="https://media.staticontent.com/media/pictures/57649af0-f7fb-41ea-bf13-b46428d7f48c/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="letrero abi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/74839094-092a-471c-9089-bbe30c0a51f1/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/bd238c58-1846-44f6-98ab-5d3b92388402/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/de4aee27-8396-43da-a94b-bc06e5f23064/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://media.staticontent.com/media/pictures/6eb56bec-d67f-4bd6-9385-ab18ab2b9cc6/1120x594?op=TRUNCATE&enlarge=false&gravity=ce_0_0&quality=80&dpr=1" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/CuartoAbi.jpg" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

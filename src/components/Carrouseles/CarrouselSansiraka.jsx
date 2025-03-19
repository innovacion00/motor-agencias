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
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/535987954.jpg?k=5cac863ce239869c6b33c36ccba105882fbeba21a5f8f068aecbec7e73b80695&o=&hp=1" height={400} width={800} alt="mainAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/galeria20695.jpg" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/galeria5694.jpg" height={400} width={800}alt="Full Break fast" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/galeria7908.jpg" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/galeria19758.jpg" height={400} width={800}alt="livin Avexi" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/galeria17681.jpg" height={400} width={800}alt="Stand de comida" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/535990853.jpg?k=15f0dd4cc6a6e4d3eb35cae6b196c8bab43f3734514a24a24f5f29415e8575ce&o=&hp=1" height={400} width={800}alt="EstacionDeCafe" />
      </SwiperSlide>
      <SwiperSlide >
        <img src="https://www.gehsuites.com/multimedia/galerias/galeria4649.jpg" height={400} width={800}alt="desayunoAvexi" />
      </SwiperSlide>
    </Swiper>
  );
};

export default SwiperSlider;

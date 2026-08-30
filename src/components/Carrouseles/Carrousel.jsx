// Carrusel genérico: recibe las imágenes del hotel desde el data module
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Carrousel = ({ images }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, EffectFade]}
      spaceBetween={3}
      slidesPerView={1}
      effect="fade"
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 1500, disableOnInteraction: true }}
      loop={true}
    >
      {images.map((src, i) => (
        <SwiperSlide key={i}>
          <img src={src} height={400} width={800} alt={`Slide ${i + 1}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carrousel;
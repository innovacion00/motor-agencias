// Carrusel genérico: recibe las imágenes del hotel desde el data module
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/swiper-bundle.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Carrousel.css";

const Carrousel = ({ images, title, kicker, ctaHref }) => {
  return (
    <div className="ih-carr">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        speed={900}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <img src={src} alt={`${title ?? "Hotel"} - foto ${i + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
      {title && (
        <div className="ih-carr-overlay">
          {kicker && <span className="ih-hero-kicker">{kicker}</span>}
          <h1 className="ih-hero-title">{title}</h1>
          {ctaHref && (
            <a className="ih-carr-cta" href={ctaHref}>
              Ver disponibilidad
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Carrousel;
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ImageSlider.css"; // Import styles

const ImageSlider = ({ images }) => {
  if (!images || images.length === 0) {
    return <p>No images available</p>;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      className="product-slider"
    >
      {images.map((img, index) => (
        <SwiperSlide key={index}>
          <img src={img} alt={`Product ${index}`} className="slider-image" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageSlider;

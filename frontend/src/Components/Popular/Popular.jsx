import React, { useState, useEffect } from "react";
import "./Popular.css";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from 'react-router-dom'; 
import chatIcon from "../Assets/chatIcon.png";
import ankletlogo from "../Assets/ankletlogo.png";
import braceletlogo from "../Assets/braceletlogo.png";
import necklacelogo from "../Assets/necklacelogo.png";
import data_product from "../Assets/data_product";
import Item from "./Item";

export const Popular = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/newcollections")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNewCollection(data);
        console.log(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="popular"><h1>Loading...</h1></div>;
  }

  if (error) {
    return <div className="popular"><h1>Error</h1><p>{error}</p></div>;
  }

  return (
    <div className="popular-container">
      {/* PRODUCT CATEGORY SECTION */}
      <section className="product-category-section">
        <h2>PRODUCT CATEGORY</h2>
        <div className="product-category-container">
          <div className="product-category" onClick={() => navigate("/anklets")}>
            <img src={ankletlogo} alt="Anklets" />
            <button>Explore Anklets</button>
          </div>
          <div className="product-category" onClick={() => navigate("/neckpieces")}>
            <img src={necklacelogo} alt="Neckpieces" />
            <button>Explore Neckpieces</button>
          </div>
          <div className="product-category" onClick={() => navigate("/bracelets")}>
            <img src={braceletlogo} alt="Bracelets" />
            <button>Explore Bracelets</button>
          </div>
        </div>
      </section>

      {/* LATEST COLLECTION */}
      <div className="popular">
        <h1>LATEST COLLECTION</h1>
        <hr />

        <div className="swiper-container">
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            modules={[Navigation, Pagination, Autoplay]}
            className="popular-slider"
          >
            {(newCollection.length > 0 ? newCollection : data_product)
              .filter((item) => item && item.images && item.images[0])
              .map((item, i) => (
                <SwiperSlide key={i}>
                  <Link to={`/product/${item.productid}`}>
                  <Item
                    id={item.id}
                    name={item.productName}
                    image={item.images[0]}
                    new_price={item.new_price}
                    old_price={item.old_price}
                  /></Link>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

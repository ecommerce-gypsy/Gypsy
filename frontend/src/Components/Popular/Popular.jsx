import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Popular.css";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I assist you today?" }]);
  const [input, setInput] = useState("");

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
        console.log("Fetched data:", data);
        setNewCollection(data);
      })
      .catch((err) => {
        console.error("Error fetching collections:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input }],
      }, {
        headers: { "Authorization": `Bearer YOUR_OPENAI_API_KEY` }
      });

      const botReply = response.data.choices[0].message.content;
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "Sorry, I couldn't process your request." }]);
    }
  };

  if (loading) {
    return <div className="popular"><h1>Loading...</h1></div>;
  }

  if (error) {
    return <div className="popular"><h1>Error</h1><p>{error}</p></div>;
  }

  return (
    <div className="popular-container">
      <section className="product-category-section">
        <h2>PRODUCT CATEGORY</h2>
        <div className="product-category-container">
          <div className="product-category">
            <img src={ankletlogo} alt="Anklets" />
            <button onClick={() => navigate("/anklets")}>More</button>
          </div>
          <div className="product-category">
            <img src={necklacelogo} alt="Neckpieces" />
            <button onClick={() => navigate("/neckpieces")}>More</button>
          </div>
          <div className="product-category">
            <img src={braceletlogo} alt="Bracelets" />
            <button onClick={() => navigate("/bracelets")}>More</button>
          </div>
        </div>
      </section>

      <div className="popular">
        <h1>LATEST COLLECTION</h1>
        <hr />

        {/* Fixed Swiper */}
        <div className="swiper-container">
          <Swiper
            spaceBetween={20}
            slidesPerView={1} // Default to 1 on small screens
            breakpoints={{
              640: { slidesPerView: 2 }, // Medium screens: 2 items
              1024: { slidesPerView: 3 }, // Large screens: 3 items
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
                  <Item
                    id={item.id}
                    name={item.name}
                    image={item.images[0]}
                    new_price={item.new_price}
                    old_price={item.old_price}
                  />
                </SwiperSlide>
              ))}
          </Swiper>
        </div>

      </div>
    </div>
  );
};

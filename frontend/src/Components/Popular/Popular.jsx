import React, { useState, useEffect } from 'react';
import './Popular.css';
import { useNavigate } from 'react-router-dom';
import ankletlogo from '../Assets/ankletlogo.png';
import braceletlogo from '../Assets/braceletlogo.png';
import necklacelogo from '../Assets/necklacelogo.png';
import data_product from '../Assets/data_product';
import Item from './Item';

export const Popular = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/newcollections')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setNewCollection(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching collections:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="popular">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Product Category Section */}
      <section className="product-category-section">
        <h2>PRODUCT CATEGORY</h2>
        <div className="product-category-container">
          <div className="product-category">
            <img src={ankletlogo} alt="Anklets" />
            <button onClick={() => navigate('/anklets')}>More</button>
          </div>
          <div className="product-category">
            <img src={necklacelogo} alt="Neckpieces" />
            <button onClick={() => navigate('/neckpieces')}>More</button>
          </div>
          <div className="product-category">
            <img src={braceletlogo} alt="Bracelets" />
            <button onClick={() => navigate('/bracelets')}>More</button>
          </div>
        </div>
      </section>

      {/* Latest Collection Section */}
      <div className="popular">
  <h1>LATEST COLLECTION</h1>
  <hr />
  <div className="popular-item">
    {(newCollection.length > 0 ? newCollection : data_product)
      .filter(item => item && item.images && item.images[0])
      .map((item, i) => (
        <Item
          key={i}
          id={item.id}
          name={item.name}
          image={item.images && item.images[0]}
          new_price={item.new_price}
          old_price={item.old_price}
        />
      ))}
  </div>
</div>

    </div>
  );
};

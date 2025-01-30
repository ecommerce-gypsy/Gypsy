import React, { useState, useEffect } from 'react';
import './Popular.css';

import data_product from '../Assets/data_product'; // Correct path
import Item from './Item'; // Adjust the path to where your Item component is located
import { useNavigate } from 'react-router-dom'; // Import useNavigate if using React Router
import ankletlogo from '../Assets/ankletlogo.png'; // Update with the correct logo paths
import braceletlogo from '../Assets/braceletlogo.png';
import necklacelogo from '../Assets/necklacelogo.png';

export const Popular = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate for navigation

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
      {/* Team Section */}
      <section className="team-section">
        <h2>PRODUCT CATEGORY</h2>
        <div className="team-members">
          <div className="team-member">
            <img src={ankletlogo} alt="Team Member 1" />
            
            <button onClick={() => navigate('/anklets')}>More</button>
          </div>
          <div className="team-member">
            <img src={necklacelogo} alt="Team Member 2" />
         
            <button onClick={() => navigate('/neckpieces')}>More</button>
          </div>
          <div className="team-member">
            <img src={braceletlogo} alt="Team Member 3" />
           
            <button onClick={() => navigate('/bracelets')}>More</button>
          </div>
        </div>
      </section>
      <div className="popular">
  <h1>LATEST COLLECTION</h1>
  <hr />
  <div className="popular-item">
    {(newCollection.length > 0 ? newCollection : data_product)
      .filter(item => item && item.images && item.images[0]) // Ensure items have images[0] defined
      .map((item, i) => (
        <Item
          key={i}
          id={item.id}
          name={item.name}
          image={item.images && item.images[0]}  // Safe access for image
          new_price={item.new_price}
          old_price={item.old_price}
        />
      ))}
  </div>
</div>

    </div>
  );
};

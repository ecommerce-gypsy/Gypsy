import React from "react";
import "./Gallery.css";

// Import images
import historyImage from "../Components/Assets/image1.png"; // Update with actual image paths
import challengesImage from "../Components/Assets/image5.png"; // Update with actual image paths
import initiativesImage from "../Components/Assets/image3.png"; // Update with actual image paths



export const Gallery = () => {
  return (
    <div className="gallery">
      {/* Header */}
      <header
  className="gypsy-header">
  

  <div className="header-overlay">

    <h1>About the Narikuravar Community</h1>
  </div>
</header>

     

      <p>
        The Narikuravar community is a semi-nomadic tribe primarily found in Tamil Nadu, India.
        Known for their rich culture and traditions, they are skilled artisans creating exquisite
        beadwork and handicrafts. Despite their artistic talents, the community has faced social
        and economic challenges, making initiatives to preserve their culture and heritage crucial
        for their upliftment. Their way of life is deeply rooted in history, and they continue to be
        an integral part of India's cultural fabric.
      </p>

      {/* History Section */}
      <div className="gallery-section">
        <h2>History</h2>
        <p>
          Historically, the Narikuravar community has faced many challenges, including limited access
          to education and resources. Despite these challenges, they continue to preserve their unique
          crafts and traditions. The community has a long-standing tradition of bead-making, which is
          passed down through generations. Their craft not only reflects their artistic skills but also
          their connection to their cultural heritage.
        </p>
        <img src={historyImage} alt="History of Narikuravar Community" className="gallery-image" />
      </div>

      {/* Challenges Section */}
      <div className="gallery-section">
        <h2>Challenges Faced</h2>
        <p>
          The community faces significant socio-economic challenges, including marginalization and
          limited job opportunities. Due to their semi-nomadic lifestyle, many members of the community
          struggle with access to basic necessities such as healthcare, education, and proper housing. 
          Their social status has often led to them being overlooked in terms of development and government
          support. Efforts are being made to uplift them by creating awareness about their crafts and 
          supporting local initiatives that focus on education, healthcare, and employment.
        </p>
        <img src={challengesImage} alt="Challenges Faced by Narikuravar Community" className="gallery-image" />
      </div>

      {/* Initiatives Section */}
      <div className="gallery-section">
        <h2>Our Initiatives</h2>
        <p>
          We support the Narikuravar community by promoting fair trade and creating awareness about their
          exceptional beadwork. The goal is to empower their youth through education and sustainable practices. 
          Through partnerships with local and international organizations, we aim to provide the community with 
          better access to education, healthcare, and economic opportunities. We also help promote their traditional 
          crafts, ensuring that the younger generation is trained in these skills to carry their heritage forward.
        </p>
        <img src={initiativesImage} alt="Narikuravar Initiatives" className="gallery-image" />
      </div>

      {/* Additional Information Section */}
      <div className="gallery-section">
        <h2>Preserving Cultural Heritage</h2>
        <p>
          Efforts are underway to ensure that the Narikuravar community’s rich cultural traditions are preserved for future generations. 
          This includes documenting their oral history, promoting their traditional crafts, and encouraging the younger generations to stay 
          connected with their roots. Cultural festivals and exhibitions are being organized to celebrate their unique customs, ensuring their 
          traditions are shared with a broader audience. By preserving their culture, we can help the community thrive while keeping their 
          heritage alive.
        </p>
      </div>

      <div className="gallery-section">
        <h2>Future Outlook</h2>
        <p>
          Looking ahead, the Narikuravar community is hopeful for greater integration into mainstream society without losing their 
          unique identity. With continued support and initiatives, there is potential for them to overcome many of the challenges they face 
          and build a brighter, more sustainable future. Collaboration with the government and NGOs will play a crucial role in securing 
          their social and economic well-being, while empowering them to maintain their cultural identity in a rapidly changing world.
        </p>
      </div>
      
    </div>
    
  );
};

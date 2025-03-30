import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import './CustomDesignPage.css';
import 'font-awesome/css/font-awesome.min.css';

const CustomDesignPage = () => {
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]); // { obj, designId, cost }
  const [customDesigns, setCustomDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEraser, setIsEraser] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceMap, setPriceMap] = useState({});

  useEffect(() => {
    // Fetch price details for all materials
    const fetchPricingDetails = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/custom-designs/price-details');
        if (!response.ok) throw new Error('Failed to fetch pricing details');
        const data = await response.json();
        setPriceMap(data);
      } catch (error) {
        setError('Error fetching pricing details: ' + error.message);
      }
    };

    // Fetch custom designs
    const fetchCustomDesigns = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/custom-designs');
        if (!response.ok) throw new Error('Failed to fetch custom designs');
        const data = await response.json();
        const categorizedDesigns = data.reduce((acc, design) => {
          const category = design.category[0] || 'Uncategorized';
          if (!acc[category]) acc[category] = [];
          acc[category].push(design);
          return acc;
        }, {});
        setCustomDesigns(categorizedDesigns);
      } catch (error) {
        setError('Error fetching custom designs: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingDetails();
    fetchCustomDesigns();

    // Initialize canvas
    if (fabric && fabric.Canvas && !canvasRef.current) {
      const canvas = new fabric.Canvas('designCanvas', {
        width: 1000,
        height: 800,
        backgroundColor: '#f0f0f0',
      });
      canvasRef.current = canvas;
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  const addCustomDesign = (imageUrl, left, top, designId) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pricing = priceMap[designId] || { price: 0, priceMultiplier: 1 };
    const itemCost = pricing.price * pricing.priceMultiplier;

    const imgElement = new Image();
    imgElement.crossOrigin = 'Anonymous';

    imgElement.onload = function () {
      const img = new fabric.Image(imgElement, {
        left,
        top,
        width: 150,
        height: 150,
        opacity: 1,
      });

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      if (img.width > canvasWidth || img.height > canvasHeight) {
        img.scaleToWidth(canvasWidth * 0.8);
        img.scaleToHeight(canvasHeight * 0.8);
      }

      canvas.add(img);
      canvas.renderAll();

      const historyItem = { obj: img, designId, cost: itemCost };
      setHistory((prev) => [...prev, historyItem]);
      setTotalPrice((prev) => prev + itemCost);
    };

    imgElement.onerror = function (error) {
      console.error('Error loading image:', error);
      setError('Error loading image for design ID: ' + designId);
    };

    imgElement.src = imageUrl;
  };

  const handleSaveAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'custom-design.png';
    link.click();
  };

  const handleDragStart = (e, imageUrl, designId) => {
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.setData('designId', designId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const boundingRect = canvas.getElement().getBoundingClientRect();
    let left = e.clientX - boundingRect.left;
    let top = e.clientY - boundingRect.top;

    const imageWidth = 150;
    const imageHeight = 150;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    if (left + imageWidth > canvasWidth) left = canvasWidth - imageWidth;
    if (left < 0) left = 0;
    if (top + imageHeight > canvasHeight) top = canvasHeight - imageHeight;
    if (top < 0) top = 0;

    const imageUrl = e.dataTransfer.getData('text/plain');
    const designId = e.dataTransfer.getData('designId');
    addCustomDesign(imageUrl, left, top, designId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const startErasing = () => {
    const canvas = canvasRef.current;
    setIsEraser(true);
    canvas.isDrawingMode = false;

    canvas.on('mouse:down', (e) => {
      const obj = canvas.getActiveObject();
      if (obj) {
        const historyItem = history.find((item) => item.obj === obj);
        if (historyItem) {
          canvas.remove(obj);
          setHistory((prev) => prev.filter((item) => item.obj !== obj));
          setTotalPrice((prev) => prev - historyItem.cost);
        }
      }
    });
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const lastItem = history[history.length - 1];
    if (lastItem) {
      canvas.remove(lastItem.obj);
      setHistory((prev) => prev.slice(0, -1));
      setTotalPrice((prev) => prev - lastItem.cost);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.clear();
    setHistory([]);
    setTotalPrice(0);
  };

  const changeColor = (color) => {
    const canvas = canvasRef.current;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ fill: color });
      canvas.renderAll();
    }
  };

  return (
    <div className="container">
      <div className="design-tools">
        <h3>Design Tools</h3>
        <div className="tools-icons">
          {loading ? (
            <p>Loading designs...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : Object.keys(customDesigns).length === 0 ? (
            <p>No designs found</p>
          ) : (
            Object.keys(customDesigns).map((category) => (
              <div key={category}>
                <h4>{category}</h4>
                <div className="design-category">
                  {customDesigns[category].map((design) => {
                    const pricing = priceMap[design._id] || { price: 0, priceMultiplier: 1 };
                    const itemCost = (pricing.price * pricing.priceMultiplier).toFixed(2);
                    return (
                      <img
                        key={design._id}
                        src={design.image}
                        alt={design.name}
                        className="design-icon"
                        title={`${design.name} - ₹${itemCost}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, design.image, design._id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <h4>--------</h4>
          <i className="fa fa-eraser fa-2x" title="Eraser Tool" onClick={startErasing}></i>
          <i className="fa fa-undo fa-2x" title="Undo" onClick={undo}></i>
          <i className="fa fa-trash fa-2x" title="Clear Canvas" onClick={clearCanvas}></i>
          <input type="color" title="Change Color" onChange={(e) => changeColor(e.target.value)} />
        </div>
      </div>

      <div className="canvas-container" onDrop={handleDrop} onDragOver={handleDragOver}>
        <canvas id="designCanvas"></canvas>
      </div>

      <button onClick={handleSaveAsImage} className="save-btn">Save as Image</button>

      <div className="price-info">
        <p>Items Used: {history.length}</p>
        <p>Total Price: ₹{totalPrice.toFixed(2)}</p>
      
      </div>
    </div>
  );
};

export default CustomDesignPage;
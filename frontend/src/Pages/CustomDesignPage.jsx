import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import './CustomDesignPage.css';
import 'font-awesome/css/font-awesome.min.css';

const CustomDesignPage = () => {
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [customDesigns, setCustomDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEraser, setIsEraser] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceMap, setPriceMap] = useState({});
  const [activeTool, setActiveTool] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch price details
        const priceResponse = await fetch('http://localhost:4000/api/custom-designs/price-details');
        if (!priceResponse.ok) throw new Error('Failed to fetch pricing details');
        const priceData = await priceResponse.json();
        setPriceMap(priceData);

        // Fetch custom designs
        const designsResponse = await fetch('http://localhost:4000/api/custom-designs');
        if (!designsResponse.ok) throw new Error('Failed to fetch custom designs');
        const designsData = await designsResponse.json();
        
        const categorizedDesigns = designsData.reduce((acc, design) => {
          const category = design.category[0] || 'Uncategorized';
          if (!acc[category]) acc[category] = [];
          acc[category].push(design);
          return acc;
        }, {});
        
        setCustomDesigns(categorizedDesigns);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Initialize canvas
    if (fabric && fabric.Canvas && !canvasRef.current) {
      const canvas = new fabric.Canvas('designCanvas', {
        width: 1000,
        height: 800,
        backgroundColor: '#f8f9fa',
        selectionColor: 'rgba(0, 123, 255, 0.3)',
        selectionBorderColor: '#007bff',
        selectionLineWidth: 2,
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
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.2)',
          blur: 5,
          offsetX: 3,
          offsetY: 3
        }),
        cornerStyle: 'circle',
        cornerColor: '#007bff',
        cornerSize: 12,
        transparentCorners: false
      });

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      if (img.width > canvasWidth || img.height > canvasHeight) {
        img.scaleToWidth(canvasWidth * 0.8);
        img.scaleToHeight(canvasHeight * 0.8);
      }

      canvas.add(img);
      canvas.setActiveObject(img);
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
    link.download = `custom-design-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    setActiveTool('eraser');
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
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      canvas.clear();
      setHistory([]);
      setTotalPrice(0);
    }
  };

  const changeColor = (color) => {
    const canvas = canvasRef.current;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ fill: color });
      canvas.renderAll();
    }
    setShowColorPicker(false);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
    setActiveTool(showColorPicker ? null : 'color');
  };

  return (
    <div className="design-studio-container">
      <header className="design-header">
        <h1>Custom Design Studio</h1>
        <div className="design-summary">
          <div className="summary-item">
            <span className="summary-label">Items:</span>
            <span className="summary-value">{history.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total:</span>
            <span className="summary-value">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="design-workspace">
        <aside className="design-toolbar">
          <section className="tool-section">
            <h3 className="section-title">Design Elements</h3>
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading designs...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fa fa-exclamation-triangle"></i>
                <p>{error}</p>
              </div>
            ) : Object.keys(customDesigns).length === 0 ? (
              <div className="empty-state">
                <p>No designs available</p>
              </div>
            ) : (
              <div className="design-categories">
                {Object.keys(customDesigns).map((category) => (
                  <div key={category} className="design-category">
                    <h4 className="category-title">{category}</h4>
                    <div className="design-items-grid">
                      {customDesigns[category].map((design) => {
                        const pricing = priceMap[design._id] || { price: 0, priceMultiplier: 1 };
                        const itemCost = (pricing.price * pricing.priceMultiplier).toFixed(2);
                        return (
                          <div 
                            key={design._id} 
                            className="design-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, design.image, design._id)}
                          >
                            <img
                              src={design.image}
                              alt={design.name}
                              className="design-thumbnail"
                            />
                            <div className="design-meta">
                              <span className="design-name">{design.name}</span>
                              <span className="design-price">₹{itemCost}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="tool-section">
            <h3 className="section-title">Design Tools</h3>
            <div className="tool-grid">
              <button 
                className={`tool-button ${activeTool === 'eraser' ? 'active' : ''}`}
                onClick={startErasing}
                title="Eraser Tool"
              >
                <i className="fa fa-eraser"></i>
                <span>Eraser</span>
              </button>
              
              <button 
                className="tool-button" 
                onClick={undo}
                title="Undo Last Action"
                disabled={history.length === 0}
              >
                <i className="fa fa-undo"></i>
                <span>Undo</span>
              </button>
              
              <button 
                className="tool-button" 
                onClick={clearCanvas}
                title="Clear Canvas"
                disabled={history.length === 0}
              >
                <i className="fa fa-trash"></i>
                <span>Clear</span>
              </button>
              
              <div className="tool-button-wrapper">
                <button 
                  className={`tool-button ${activeTool === 'color' ? 'active' : ''}`}
                  onClick={toggleColorPicker}
                  title="Change Color"
                >
                  <i className="fa fa-tint"></i>
                  <span>Color</span>
                </button>
                {showColorPicker && (
                  <div className="color-picker-dropdown">
                    <input 
                      type="color" 
                      onChange={(e) => changeColor(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </aside>

        <section 
          className="canvas-area"
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
        >
          <canvas id="designCanvas"></canvas>
          <div className="canvas-controls">
            <button 
              className="save-button primary-button"
              onClick={handleSaveAsImage}
              disabled={history.length === 0}
            >
              <i className="fa fa-download"></i> Export Design
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomDesignPage;
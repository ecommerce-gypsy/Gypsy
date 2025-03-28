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
  const [activeTool, setActiveTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const canvasContainerRef = useRef(null);

  useEffect(() => {
    // Initialize the canvas with proper settings
    const initCanvas = () => {
      const canvas = new fabric.Canvas('designCanvas', {
        width: 1000,
        height: 800,
        backgroundColor: '#f8f9fa',
        selection: true,
        preserveObjectStacking: true,
      });
      
      // Enable object movement and selection
      canvas.selection = true;
      canvas.on('selection:created', () => canvas.renderAll());
      canvas.on('selection:updated', () => canvas.renderAll());
      canvas.on('selection:cleared', () => canvas.renderAll());
      
      canvasRef.current = canvas;
    };

    if (fabric && fabric.Canvas && !canvasRef.current) {
      initCanvas();
    }

    // Mock data for custom designs (replace with your actual API call)
    const fetchCustomDesigns = () => {
      // Simulate API call
      setTimeout(() => {
        setCustomDesigns([
          { name: "Design 1", image: "https://via.placeholder.com/150" },
          { name: "Design 2", image: "https://via.placeholder.com/150/0000FF" },
          { name: "Design 3", image: "https://via.placeholder.com/150/00FF00" },
          { name: "Design 4", image: "https://via.placeholder.com/150/FF0000" },
        ]);
        setLoading(false);
      }, 500);
      
      // Or use your actual API call:
      /*
      fetch('http://localhost:4000/api/custom-designs')
        .then(response => response.json())
        .then(data => setCustomDesigns(data))
        .catch(error => setError('Error fetching designs'))
        .finally(() => setLoading(false));
      */
    };

    fetchCustomDesigns();

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  // Improved add custom design function
  const addCustomDesign = (imageUrl, left, top) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      // Set image properties with proper scaling
      const scale = 150 / Math.max(img.width, img.height);
      img.set({
        left: left || 100,
        top: top || 100,
        scaleX: scale,
        scaleY: scale,
        opacity: 1,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        originX: 'center',
        originY: 'center',
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      
      // Update history
      setHistory((prev) => [...prev, img]);
    }, {
      crossOrigin: 'anonymous'
    });
  };

  // Save canvas as image
  const handleSaveAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'custom-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Drag Start Event
  const handleDragStart = (e, imageUrl) => {
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Fixed Drop Event with proper coordinate calculation
  const handleDrop = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !canvasContainerRef.current) return;

    // Get canvas element and its position
    const canvasEl = canvas.lowerCanvasEl || canvas.getElement();
    const rect = canvasEl.getBoundingClientRect();
    
    // Calculate position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Adjust for canvas scaling if any
    const scaleX = canvasEl.width / rect.width;
    const scaleY = canvasEl.height / rect.height;
    
    const imageUrl = e.dataTransfer.getData('text/plain');
    addCustomDesign(imageUrl, x * scaleX, y * scaleY);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Eraser functionality
  const startErasing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsEraser(true);
    setActiveTool('eraser');
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'pointer';

    // Remove previous event listeners
    canvas.off('mouse:down');
    
    canvas.on('mouse:down', (e) => {
      if (e.target) {
        canvas.remove(e.target);
        setHistory((prev) => prev.filter((item) => item !== e.target));
      }
    });
  };

  // Reset to selection mode
  const resetToSelect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsEraser(false);
    setActiveTool(null);
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.off('mouse:down');
  };

  // Undo the last action
  const undo = () => {
    const canvas = canvasRef.current;
    const lastObject = history[history.length - 1];
    if (lastObject) {
      canvas.remove(lastObject);
      setHistory(history.slice(0, -1));
    }
  };

  // Clear the entire canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.clear();
      setHistory([]);
    }
  };

  // Change the color of the selected object
  const changeColor = (color) => {
    const canvas = canvasRef.current;
    const activeObject = canvas.getActiveObject();
    setSelectedColor(color);

    if (activeObject) {
      if (activeObject.type === 'text' || activeObject.type === 'i-text') {
        activeObject.set({ fill: color });
      } else if (activeObject.type === 'path') {
        activeObject.set({ stroke: color });
      } else {
        activeObject.set({ fill: color });
      }
      canvas.renderAll();
    }
  };

  return (
    <div className="custom-design-container">
      <header className="design-header">
        <h1>Custom Design Studio</h1>
        <p>Create your unique designs by dragging elements onto the canvas</p>
      </header>

      <div className="design-app-container">
        <div className="design-tools-panel">
          <div className="tools-section">
            <h3>Design Elements</h3>
            <div className="design-elements">
              {loading ? (
                <div className="loading-spinner">
                  <i className="fa fa-spinner fa-spin"></i> Loading designs...
                </div>
              ) : error ? (
                <div className="error-message">
                  <i className="fa fa-exclamation-triangle"></i> {error}
                </div>
              ) : customDesigns.length === 0 ? (
                <div className="empty-message">
                  <i className="fa fa-image"></i> No designs found
                </div>
              ) : (
                <div className="design-icons-grid">
                  {customDesigns.map((design, index) => (
                    <div 
                      key={index}
                      className="design-icon-container"
                      draggable
                      onDragStart={(e) => handleDragStart(e, design.image)}
                      title={design.name}
                    >
                      <img
                        src={design.image}
                        alt={design.name}
                        className="design-icon"
                        crossOrigin="anonymous"
                      />
                      <span className="design-name">{design.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="tools-section">
            <h3>Tools</h3>
            <div className="tool-buttons">
              <button 
                className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
                onClick={activeTool === 'eraser' ? resetToSelect : startErasing}
                title="Eraser Tool"
              >
                <i className="fa fa-eraser"></i>
                <span>Eraser</span>
              </button>
              
              <button 
                className="tool-btn"
                onClick={undo}
                title="Undo"
              >
                <i className="fa fa-undo"></i>
                <span>Undo</span>
              </button>
              
              <button 
                className="tool-btn"
                onClick={clearCanvas}
                title="Clear Canvas"
              >
                <i className="fa fa-trash"></i>
                <span>Clear</span>
              </button>
              
              <div className="color-picker-container">
                <label htmlFor="color-picker">Color:</label>
                <input 
                  id="color-picker"
                  type="color" 
                  value={selectedColor}
                  onChange={(e) => changeColor(e.target.value)}
                  title="Change Color"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="canvas-wrapper">
          <div
            className="canvas-container"
            ref={canvasContainerRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <canvas id="designCanvas"></canvas>
          </div>
          <div className="canvas-controls">
            <button 
              onClick={handleSaveAsImage} 
              className="save-btn"
            >
              <i className="fa fa-download"></i> Save Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDesignPage;
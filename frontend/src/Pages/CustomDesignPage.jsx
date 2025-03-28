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
  const [drawing, setDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    // Initialize the canvas
    if (fabric && fabric.Canvas && !canvasRef.current) {
      const canvas = new fabric.Canvas('designCanvas', {
        width: 1000,
        height: 800,
        backgroundColor: '#f0f0f0',
      });
      canvasRef.current = canvas;
    }

    // Fetch custom designs
    const fetchCustomDesigns = () => {
      fetch('http://localhost:4000/api/custom-designs')
        .then(response => response.json())
        .then(data => {
          setCustomDesigns(data);
        })
        .catch(error => {
          setError('Error fetching custom designs');
        })
        .finally(() => setLoading(false));
    };

    fetchCustomDesigns();

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  // Add custom design (image) to canvas
  const addCustomDesign = (imageUrl, left, top) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imgElement = new Image();
    imgElement.crossOrigin = "Anonymous";

    imgElement.onload = function() {
      const img = new fabric.Image(imgElement, {
        left: left,
        top: top,
        width: 150,
        height: 150,
        opacity: 1,
      });
      canvas.add(img);
      canvas.renderAll();
      setHistory((prevHistory) => [...prevHistory, img]);
    };

    imgElement.onerror = function(error) {
      console.error("Error loading image:", error);
    };

    imgElement.src = imageUrl;
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
    link.click();
  };

  // Handle Drag Start Event
  const handleDragStart = (e, imageUrl) => {
    e.dataTransfer.setData('text/plain', imageUrl);
  };

  // Handle Drop Event
  const handleDrop = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const boundingRect = canvas.getElement().getBoundingClientRect();
    const left = e.clientX - boundingRect.left;
    const top = e.clientY - boundingRect.top;

    const imageUrl = e.dataTransfer.getData('text/plain');
    addCustomDesign(imageUrl, left, top);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Start eraser functionality
  const startErasing = () => {
    const canvas = canvasRef.current;
    setIsEraser(true);
    canvas.isDrawingMode = false;
    setDrawing(false); // Disable drawing mode when eraser is active

    // Listen to the mouse down event for erasing
    canvas.on('mouse:down', (e) => {
      const obj = canvas.getActiveObject();
      if (obj) {
        canvas.remove(obj);
        setHistory((prev) => prev.filter((item) => item !== obj));
      }
    });
  };

  // Undo the last action
  const undo = () => {
    const canvas = canvasRef.current;
    const lastObject = history[history.length - 1];
    if (lastObject) {
      canvas.remove(lastObject);
      setHistory(history.slice(0, -1)); // Remove from history
    }
  };

  // Clear the entire canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.clear();
    setHistory([]); // Reset history
  };

  // Change the color of the selected object
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
          ) : customDesigns.length === 0 ? (
            <p>No designs found</p>
          ) : (
            customDesigns.map((design, index) => (
              <img
                key={index}
                src={design.image}
                alt={design.name}
                className="design-icon"
                title={design.name}
                draggable
                onDragStart={(e) => handleDragStart(e, design.image)}
              />
            ))
          )}
<h4>--------</h4>
          <i className="fa fa-eraser fa-2x" title="Eraser Tool" onClick={startErasing}></i>
          <i className="fa fa-undo fa-2x" title="Undo" onClick={undo}></i>
          <i className="fa fa-trash fa-2x" title="Clear Canvas" onClick={clearCanvas}></i>
          <input type="color" title="Change Color" onChange={(e) => changeColor(e.target.value)} />
        </div>
      </div>

      <div
        className="canvas-container"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <canvas id="designCanvas"></canvas>
      </div>

      <button onClick={handleSaveAsImage} className="save-btn">
        Save as Image
      </button>
    </div>
  );
};

export default CustomDesignPage;


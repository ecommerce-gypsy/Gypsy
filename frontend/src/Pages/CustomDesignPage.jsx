import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

import 'font-awesome/css/font-awesome.min.css';
import './CustomDesignPage.css';

const CustomDesignPage = () => {
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]); // For undo functionality
  const [drawing, setDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas('designCanvas', {
      width: 600,
      height: 800,
      backgroundColor: '#f0f0f0',
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose(); // Cleanup on unmount
    };
  }, []);

  // Toggle drawing mode (Pencil Tool)
  const startDrawing = () => {
    const canvas = canvasRef.current;
    if (drawing) {
      canvas.isDrawingMode = false;
      setDrawing(false);
    } else {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = 'black';
      canvas.freeDrawingBrush.width = 2;
      setDrawing(true);
      setIsEraser(false);
    }
  };

  // Eraser Tool: Removes clicked object
  const startErasing = () => {
    const canvas = canvasRef.current;
    setIsEraser(true);
    setDrawing(false);
    canvas.isDrawingMode = false;

    canvas.on('mouse:down', (e) => {
      const obj = canvas.getActiveObject();
      if (obj) {
        canvas.remove(obj);
        setHistory((prev) => prev.filter((item) => item !== obj));
      }
    });
  };

  // Add different shapes
  const addShape = (shape) => {
    const canvas = canvasRef.current;
    let addedObject = null;

    if (shape === 'rectangle') {
      addedObject = new fabric.Rect({
        left: 50,
        top: 50,
        fill: 'blue',
        width: 100,
        height: 100,
      });
    } else if (shape === 'circle') {
      addedObject = new fabric.Circle({
        left: 150,
        top: 50,
        fill: 'red',
        radius: 50,
      });
    } else if (shape === 'triangle') {
      addedObject = new fabric.Triangle({
        left: 250,
        top: 50,
        width: 100,
        height: 100,
        fill: 'green',
      });
    }

    if (addedObject) {
      canvas.add(addedObject);
      canvas.renderAll();
      setHistory((prevHistory) => [...prevHistory, addedObject]);
    }
  };

  // Add text to canvas
  const addText = () => {
    const canvas = canvasRef.current;
    const text = new fabric.Textbox('Your Text Here', {
      left: 50,
      top: 200,
      width: 200,
      fontSize: 20,
    });
    canvas.add(text);
    canvas.renderAll();
    setHistory((prevHistory) => [...prevHistory, text]);
  };

  // Undo function
  const undo = () => {
    const canvas = canvasRef.current;
    const lastObject = history[history.length - 1];
    if (lastObject) {
      canvas.remove(lastObject);
      setHistory(history.slice(0, -1));
    }
  };

  // Clear entire canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.clear();
    setHistory([]);
  };

  // Change color of selected object
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
          <i className="fa fa-square fa-2x" title="Rectangle" onClick={() => addShape('rectangle')}></i>
          <i className="fa fa-circle fa-2x" title="Circle" onClick={() => addShape('circle')}></i>
          <i className="fa fa-caret-up fa-2x" title="Triangle" onClick={() => addShape('triangle')}></i>
          <i className="fa fa-font fa-2x" title="Add Text" onClick={addText}></i>

          <i className="fa fa-pencil fa-2x" title="Pencil Tool" onClick={startDrawing}></i>
          <i className="fa fa-eraser fa-2x" title="Eraser Tool" onClick={startErasing}></i>
          <i className="fa fa-undo fa-2x" title="Undo" onClick={undo}></i>
          <i className="fa fa-trash fa-2x" title="Clear Canvas" onClick={clearCanvas}></i>

          <input type="color" title="Change Color" onChange={(e) => changeColor(e.target.value)} />
        </div>
      </div>
      <div className="canvas-container">
        <canvas id="designCanvas"></canvas>
      </div>
    </div>
  );
};

export default CustomDesignPage;

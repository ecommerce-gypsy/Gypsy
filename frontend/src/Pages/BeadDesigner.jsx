import React, { useState } from "react";
import html2canvas from "html2canvas";
import "./BeadDesigner.css";

// Import images from Assets folder
import bead1 from "./Assets/bead1.png"; // Correct path
import bead2 from "./Assets/bead2.png";
import bead3 from "./Assets/bead3.png";

const BeadDesigner = () => {
  const [beads, setBeads] = useState([
    { id: 1, src: bead1, x: 50, y: 50 },
    { id: 2, src: bead2, x: 150, y: 150 },
    { id: 3, src: bead3, x: 250, y: 250 },
  ]);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBeads((prevBeads) =>
      prevBeads.map((bead) =>
        bead.id === Number(id) ? { ...bead, x, y } : bead
      )
    );
  };

  const saveDesign = () => {
    const canvasElement = document.querySelector(".bead-canvas");
    html2canvas(canvasElement).then((canvas) => {
      const link = document.createElement("a");
      link.download = "bead-design.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="bead-designer">
      <h1>Bead Designer</h1>
      <div
        className="bead-canvas"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {beads.map((bead) => (
          <img
            key={bead.id}
            src={bead.src}
            alt={`bead-${bead.id}`}
            className="bead"
            draggable
            onDragStart={(e) => handleDragStart(e, bead.id)}
            style={{ left: bead.x, top: bead.y }}
          />
        ))}
      </div>
      <button className="save-button" onClick={saveDesign}>
        Save Design
      </button>
    </div>
  );
};

export default BeadDesigner;
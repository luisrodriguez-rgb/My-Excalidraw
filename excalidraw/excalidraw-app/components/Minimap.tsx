import React, { useRef, useEffect, useState } from "react";

import "./Minimap.scss";

interface MinimapProps {
  elements: readonly any[];
  appState: any;
  excalidrawAPI: any;
  tick?: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  elements,
  appState,
  excalidrawAPI,
  tick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);
  const isDragging = useRef(false);

  // Filter out deleted elements
  const activeElements = elements.filter((el) => !el.isDeleted);

  const getSceneBounds = () => {
    if (activeElements.length === 0) {
      return { minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    activeElements.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 0));
      maxY = Math.max(maxY, el.y + (el.height || 0));
    });

    // Add some padding
    const padding = 200;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    };
  };

  const drawMinimap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !appState) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const bounds = getSceneBounds();
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    // Calculate scale to fit all elements in the minimap
    const scaleX = width / boundsWidth;
    const scaleY = height / boundsHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 10% padding

    // Center offset
    const offsetX = (width - boundsWidth * scale) / 2 - bounds.minX * scale;
    const offsetY = (height - boundsHeight * scale) / 2 - bounds.minY * scale;

    // 1. Draw elements
    ctx.fillStyle =
      appState.theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
    activeElements.forEach((el) => {
      const elX = el.x * scale + offsetX;
      const elY = el.y * scale + offsetY;
      const elW = (el.width || 0) * scale;
      const elH = (el.height || 0) * scale;

      ctx.fillRect(elX, elY, Math.max(elW, 2), Math.max(elH, 2));
    });

    // 2. Calculate and Draw viewport bounds
    const zoom = appState.zoom.value;
    const viewWidth = window.innerWidth / zoom;
    const viewHeight = window.innerHeight / zoom;
    const viewX = -appState.scrollX;
    const viewY = -appState.scrollY;

    const vpX = viewX * scale + offsetX;
    const vpY = viewY * scale + offsetY;
    const vpW = viewWidth * scale;
    const vpH = viewHeight * scale;

    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    // Draw viewport transparent fill
    ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
    ctx.fillRect(vpX, vpY, vpW, vpH);
  };

  useEffect(() => {
    drawMinimap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, appState, tick]);

  const handlePointerEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !excalidrawAPI || !appState) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bounds = getSceneBounds();
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const scaleX = canvas.width / boundsWidth;
    const scaleY = canvas.height / boundsHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    const offsetX =
      (canvas.width - boundsWidth * scale) / 2 - bounds.minX * scale;
    const offsetY =
      (canvas.height - boundsHeight * scale) / 2 - bounds.minY * scale;

    // Convert minimap click coordinates back to scene coordinates
    const sceneX = (clickX - offsetX) / scale;
    const sceneY = (clickY - offsetY) / scale;

    // Center viewport at this coordinate
    const zoom = appState.zoom.value;
    const scrollX = -sceneX + window.innerWidth / zoom / 2;
    const scrollY = -sceneY + window.innerHeight / zoom / 2;

    excalidrawAPI.updateScene({
      appState: { scrollX, scrollY },
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    handlePointerEvent(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      handlePointerEvent(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  if (!visible) {
    return (
      <button
        className="minimap-toggle-btn collapsed"
        onClick={() => setVisible(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      </button>
    );
  }

  return (
    <div className="minimap-panel">
      <div className="minimap-header">
        <span>Vista del Canvas</span>
        <button className="minimap-close" onClick={() => setVisible(false)}>
          ✕
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={180}
        height={120}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: "crosshair" }}
      />
    </div>
  );
};

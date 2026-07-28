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
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  // Dragging state
  const isDraggingViewport = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartScroll = useRef({ scrollX: 0, scrollY: 0 });

  // Cache bounds, scale and offsets to avoid recalculations during scroll
  const boundsRef = useRef({ minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 });
  const scaleRef = useRef(1);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const viewportBoundsRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const activeElements = elements.filter((el) => !el.isDeleted);

  // Recalculate bounds and update the cached reference
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

    const padding = 200;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    };
  };

  // 1. Static drawing cycle: renders elements onto the offscreen canvas
  // This ONLY runs when the active elements list or tick changes, NOT during scrolls.
  useEffect(() => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreen = offscreenCanvasRef.current;
    offscreen.width = mainCanvas.width;
    offscreen.height = mainCanvas.height;

    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);

    const bounds = getSceneBounds();
    boundsRef.current = bounds;

    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const scaleX = offscreen.width / boundsWidth;
    const scaleY = offscreen.height / boundsHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    scaleRef.current = scale;

    const offsetX = (offscreen.width - boundsWidth * scale) / 2 - bounds.minX * scale;
    const offsetY = (offscreen.height - boundsHeight * scale) / 2 - bounds.minY * scale;
    offsetXRef.current = offsetX;
    offsetYRef.current = offsetY;

    if (activeElements.length === 0) return;

    // High fidelity shape rendering
    activeElements.forEach((el) => {
      const elX = el.x * scale + offsetX;
      const elY = el.y * scale + offsetY;
      const elW = (el.width || 0) * scale;
      const elH = (el.height || 0) * scale;

      const isSelected = appState?.selectedElementIds?.[el.id];

      // Styling based on selection and element type
      if (isSelected) {
        ctx.fillStyle = "rgba(168, 85, 247, 0.7)"; // Selected glowing purple
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.5;
      } else {
        ctx.fillStyle = appState.theme === "dark" 
          ? (el.strokeColor === "#000000" || el.strokeColor === "#1e1e1e" ? "rgba(255,255,255,0.25)" : el.strokeColor || "rgba(255,255,255,0.2)")
          : (el.strokeColor === "#ffffff" ? "rgba(0,0,0,0.15)" : el.strokeColor || "rgba(0,0,0,0.15)");
        ctx.strokeStyle = "transparent";
      }

      if (showDetails) {
        ctx.beginPath();
        if (el.type === "ellipse") {
          const radiusX = Math.max(elW / 2, 1);
          const radiusY = Math.max(elH / 2, 1);
          ctx.ellipse(elX + radiusX, elY + radiusY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.fill();
          if (isSelected) ctx.stroke();
        } else if (el.type === "arrow" || el.type === "line" || el.type === "freedraw") {
          // Draw simplified connection line
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = Math.max(1, scale * 3);
          ctx.moveTo(elX, elY);
          ctx.lineTo(elX + elW, elY + elH);
          ctx.stroke();
        } else if (el.type === "text") {
          // Text boxes styled as blueprint text composition lines
          ctx.fillRect(elX, elY, Math.max(elW, 2), Math.max(scale * 3, 1));
          ctx.fillRect(elX, elY + elH * 0.5, Math.max(elW * 0.7, 2), Math.max(scale * 2, 1));
        } else {
          // Rectangles, images, and other cards
          ctx.fillRect(elX, elY, Math.max(elW, 2), Math.max(elH, 2));
          if (isSelected) ctx.strokeRect(elX, elY, Math.max(elW, 2), Math.max(elH, 2));
        }
      } else {
        // Draw simplified generic shapes
        ctx.fillRect(elX, elY, Math.max(elW, 2), Math.max(elH, 2));
        if (isSelected) ctx.strokeRect(elX, elY, Math.max(elW, 2), Math.max(elH, 2));
      }
    });

    // Refresh viewport overlay drawing on main canvas
    drawViewportOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, tick, showDetails, appState.theme]);

  // 2. High-performance scroll drawing cycle (120 FPS)
  // Copies the offscreen canvas onto the visible canvas and overlays the viewport
  const drawViewportOnly = () => {
    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;
    if (!canvas || !offscreen || !appState) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Fast Blit: Copy offscreen elements cached image
    ctx.drawImage(offscreen, 0, 0);

    // Viewport layout calculation
    const scale = scaleRef.current;
    const offsetX = offsetXRef.current;
    const offsetY = offsetYRef.current;

    const zoom = appState.zoom.value;
    const viewWidth = window.innerWidth / zoom;
    const viewHeight = window.innerHeight / zoom;
    const viewX = -appState.scrollX;
    const viewY = -appState.scrollY;

    const vpX = viewX * scale + offsetX;
    const vpY = viewY * scale + offsetY;
    const vpW = viewWidth * scale;
    const vpH = viewHeight * scale;

    viewportBoundsRef.current = { x: vpX, y: vpY, w: vpW, h: vpH };

    // Viewport overlay styling
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    ctx.fillStyle = "rgba(168, 85, 247, 0.06)";
    ctx.fillRect(vpX, vpY, vpW, vpH);
  };

  useEffect(() => {
    drawViewportOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.scrollX, appState.scrollY, appState.zoom.value]);

  // recents / zoom controls
  const handleZoom = (factor: number) => {
    if (!excalidrawAPI) return;
    const currentZoom = appState.zoom.value;
    const newZoom = Math.min(Math.max(0.1, currentZoom * factor), 3.0);
    excalidrawAPI.updateScene({
      appState: { zoom: { value: newZoom } },
    });
  };

  const handleRecenter = () => {
    if (!excalidrawAPI) return;
    const sceneElements = excalidrawAPI.getSceneElements?.() || activeElements;
    const nonDeleted = sceneElements.filter((el: any) => !el.isDeleted);
    if (nonDeleted.length > 0) {
      excalidrawAPI.scrollToContent(nonDeleted, {
        fitToViewport: true,
        viewportZoomFactor: 0.85,
        animate: true,
      });
    } else {
      excalidrawAPI.updateScene({
        appState: { scrollX: 0, scrollY: 0, zoom: { value: 1 } },
      });
    }
  };

  // Dragging interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !appState || !excalidrawAPI) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const vp = viewportBoundsRef.current;

    // Check if the click lies inside the viewport rectangle
    const isInsideViewport =
      clickX >= vp.x &&
      clickX <= vp.x + vp.w &&
      clickY >= vp.y &&
      clickY <= vp.y + vp.h;

    if (isInsideViewport) {
      isDraggingViewport.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragStartScroll.current = {
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
      };
      canvas.setPointerCapture(e.pointerId);
    } else {
      // Direct jump recenter on click outside
      recenterAtClick(clickX, clickY);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingViewport.current || !appState || !excalidrawAPI) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    const scale = scaleRef.current;
    const zoom = appState.zoom.value;

    // Convert minimap offset delta back to scene viewport scroll delta
    const sceneDeltaX = deltaX / scale;
    const sceneDeltaY = deltaY / scale;

    excalidrawAPI.updateScene({
      appState: {
        scrollX: dragStartScroll.current.scrollX - sceneDeltaX,
        scrollY: dragStartScroll.current.scrollY - sceneDeltaY,
      },
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingViewport.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const recenterAtClick = (clickX: number, clickY: number) => {
    const bounds = boundsRef.current;
    const scale = scaleRef.current;
    const offsetX = offsetXRef.current;
    const offsetY = offsetYRef.current;

    // Convert coordinates
    const sceneX = (clickX - offsetX) / scale;
    const sceneY = (clickY - offsetY) / scale;

    const zoom = appState.zoom.value;
    const scrollX = -sceneX + window.innerWidth / zoom / 2;
    const scrollY = -sceneY + window.innerHeight / zoom / 2;

    excalidrawAPI.updateScene({
      appState: { scrollX, scrollY },
    });
  };

  if (!visible) {
    return (
      <button
        className="minimap-toggle-btn collapsed"
        onClick={() => setVisible(true)}
        title="Abrir mapa del canvas"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
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

  const cursorStyle = isDraggingViewport.current 
    ? "grabbing" 
    : "grab";

  return (
    <div className="minimap-panel">
      <div className="minimap-header">
        <span>Mapa del Canvas</span>
        <div className="minimap-actions-left">
          <button 
            className={`action-toggle-details ${showDetails ? "active" : ""}`}
            onClick={() => setShowDetails(!showDetails)}
            title="Alternar detalle de figuras"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </button>
          <button className="minimap-close" onClick={() => setVisible(false)} title="Cerrar">
            ✕
          </button>
        </div>
      </div>

      <div className="minimap-body">
        <canvas
          ref={canvasRef}
          width={180}
          height={120}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ cursor: cursorStyle }}
        />
        
        {/* HUD control toolbar */}
        <div className="minimap-controls">
          <button onClick={() => handleZoom(1.1)} title="Zoom In">+</button>
          <button onClick={() => handleZoom(0.9)} title="Zoom Out">-</button>
          <button onClick={handleRecenter} title="Ajustar a Pantalla" className="btn-fit">
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "./PresentationMode.scss";

interface PresentationModeProps {
  excalidrawAPI: ExcalidrawImperativeAPI;
  onClose: () => void;
  notesSidebarOpen?: boolean;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  excalidrawAPI,
  onClose,
  notesSidebarOpen = false,
}) => {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Center & fit a slide element in the current viewport
  const zoomToSlide = useCallback(
    (slide: any) => {
      if (!slide || !excalidrawAPI || typeof excalidrawAPI.updateScene !== "function") return;

      try {
        const sidebarWidth = notesSidebarOpen ? 340 : 0;
        // 0 padding for exact full screen slide rendering
        const availableWidth = window.innerWidth - sidebarWidth;
        const availableHeight = window.innerHeight;

        const slideWidth = Math.max(slide.width || 100, 100);
        const slideHeight = Math.max(slide.height || 100, 100);

        // Zoom to fit the slide exactly within available dimensions
        const zoomValue = Math.min(
          Math.max(
            Math.min(availableWidth / slideWidth, availableHeight / slideHeight),
            0.1,
          ),
          5.0,
        );

        const centerX = (slide.x ?? 0) + slideWidth / 2;
        const centerY = (slide.y ?? 0) + slideHeight / 2;

        const visibleCenterX = (window.innerWidth - sidebarWidth) / 2;
        const visibleCenterY = window.innerHeight / 2;

        // Coordinates to center the slide exactly
        const scrollX = visibleCenterX / zoomValue - centerX;
        const scrollY = visibleCenterY / zoomValue - centerY;

        excalidrawAPI.updateScene({
          appState: {
            scrollX,
            scrollY,
            zoom: { value: zoomValue as any },
          },
        });
      } catch (err) {
        console.error("Error zooming to presentation slide:", err);
      }
    },
    [excalidrawAPI, notesSidebarOpen],
  );

  // Discover all slides (Frames or large container shapes)
  useEffect(() => {
    if (!excalidrawAPI || typeof excalidrawAPI.getSceneElements !== "function") return;

    try {
      const elements = excalidrawAPI.getSceneElements() || [];
      const validElements = elements.filter((el) => el && !el.isDeleted);

      // 1. First priority: explicit Frame elements
      let frameSlides = validElements.filter(
        (el: any) => el.type === "frame" || el.type === "magicframe",
      );

      // 2. Fallback: if no frames, find large rectangle containers (width > 250, height > 180)
      if (frameSlides.length === 0) {
        frameSlides = validElements.filter(
          (el: any) =>
            el.type === "rectangle" &&
            el.width > 250 &&
            el.height > 180 &&
            !el.frameId, // top-level containers only
        );
      }

      // Sort slides: top to bottom, then left to right safely
      frameSlides.sort((a: any, b: any) => {
        const yDiff = (a.y ?? 0) - (b.y ?? 0);
        if (Math.abs(yDiff) > 100) {
          return yDiff;
        }
        return (a.x ?? 0) - (b.x ?? 0);
      });

      setSlides(frameSlides);

      // Initial zoom to first slide if available
      if (frameSlides.length > 0 && frameSlides[0]) {
        zoomToSlide(frameSlides[0]);
      }
    } catch (err) {
      console.error("Error discovering presentation slides:", err);
    }
  }, [excalidrawAPI, zoomToSlide]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;
      setCurrentIndex(index);
      const targetSlide = slides[index];
      if (targetSlide) {
        zoomToSlide(targetSlide);
      }
    },
    [slides, zoomToSlide],
  );

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [goToSlide, currentIndex]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [goToSlide, currentIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === " " ||
        e.key === "PageDown"
      ) {
        e.preventDefault();
        handleNext();
      } else if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "PageUp"
      ) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // If no slides found, render helpful guidance modal
  if (slides.length === 0) {
    return (
      <div className="presentation-no-slides-overlay">
        <div className="presentation-no-slides-card">
          <div className="no-slides-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#6366f1", marginBottom: "8px" }}>
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h3>Modo Presentación</h3>
          <p>
            No se encontraron <strong>Marcos (Frames)</strong> ni secciones en
            este lienzo.
          </p>
          <p className="no-slides-tip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308", marginRight: "6px", verticalAlign: "middle" }}>
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="10" y1="22" x2="14" y2="22"></line>
            </svg>
            <em>Consejo:</em> Selecciona la herramienta <strong>Frame (Marco)</strong> en la barra de herramientas para agrupar tu contenido en diapositivas.
          </p>
          <button className="btn-close-presentation" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Keep track of scroll & zoom to render the framing mask in real time
  const [viewport, setViewport] = useState(() => {
    if (excalidrawAPI && typeof excalidrawAPI.getAppState === "function") {
      try {
        const state = excalidrawAPI.getAppState();
        return {
          scrollX: state?.scrollX ?? 0,
          scrollY: state?.scrollY ?? 0,
          zoom: state?.zoom?.value ?? state?.zoom ?? 1,
          theme: state?.theme ?? "light",
        };
      } catch (err) {
        console.error("Error getting initial presentation appState:", err);
      }
    }
    return { scrollX: 0, scrollY: 0, zoom: 1, theme: "light" };
  });

  const updateViewport = useCallback(() => {
    if (!excalidrawAPI || typeof excalidrawAPI.getAppState !== "function") return;
    try {
      const state = excalidrawAPI.getAppState();
      if (!state) return;
      setViewport({
        scrollX: state.scrollX ?? 0,
        scrollY: state.scrollY ?? 0,
        zoom: state.zoom?.value ?? state.zoom ?? 1,
        theme: state.theme ?? "light",
      });
    } catch (err) {
      console.error("Error updating presentation viewport:", err);
    }
  }, [excalidrawAPI]);

  useEffect(() => {
    updateViewport();
    const interval = setInterval(updateViewport, 100);
    return () => clearInterval(interval);
  }, [updateViewport, currentIndex]);

  if (!currentSlide) {
    return (
      <div className="presentation-no-slides-overlay">
        <div className="presentation-no-slides-card">
          <div className="no-slides-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#6366f1", marginBottom: "8px" }}>
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h3>Modo Presentación</h3>
          <p>
            No se encontraron <strong>Marcos (Frames)</strong> ni secciones en
            este lienzo o la diapositiva seleccionada no es válida.
          </p>
          <p className="no-slides-tip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#eab308", marginRight: "6px", verticalAlign: "middle" }}>
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="10" y1="22" x2="14" y2="22"></line>
            </svg>
            <em>Consejo:</em> Selecciona la herramienta <strong>Frame (Marco)</strong> en la barra de herramientas para agrupar tu contenido en diapositivas.
          </p>
          <button className="btn-close-presentation" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const slideTitle =
    currentSlide.name ||
    currentSlide.label?.text ||
    `Diapositiva ${currentIndex + 1}`;

  // Mask dimensions
  const left = ((currentSlide.x ?? 0) + viewport.scrollX) * viewport.zoom;
  const top = ((currentSlide.y ?? 0) + viewport.scrollY) * viewport.zoom;
  const width = (currentSlide.width ?? 100) * viewport.zoom;
  const height = (currentSlide.height ?? 100) * viewport.zoom;
  const maskColor = viewport.theme === "dark" ? "#121212" : "#ffffff";

  return (
    <>
      {/* Dimmed cutout overlay to hide everything outside the active frame */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            boxShadow: `0 0 0 9999px ${maskColor}`,
            border: "2px solid #6366f1",
            borderRadius: "8px",
            boxSizing: "border-box",
            transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      <div className="presentation-mode-controls">
        <div className="presentation-bar">
          <button
            className="presentation-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            title="Diapositiva anterior (Flecha Izquierda)"
            style={{ display: "flex", alignItems: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Anterior
          </button>

          <div className="presentation-info">
            <span className="slide-counter">
              {currentIndex + 1} / {slides.length}
            </span>
            <span className="slide-name" title={slideTitle}>
              {slideTitle}
            </span>
          </div>

          <button
            className="presentation-btn"
            onClick={handleNext}
            disabled={currentIndex === slides.length - 1}
            title="Siguiente diapositiva (Flecha Derecha / Espacio)"
            style={{ display: "flex", alignItems: "center" }}
          >
            Siguiente
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div className="presentation-divider" />

          <button
            className="presentation-btn presentation-btn--icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="10" y1="14" x2="3" y2="21"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            )}
          </button>

          <button
            className="presentation-btn presentation-btn--exit"
            onClick={onClose}
            title="Salir de la presentación (Escape)"
            style={{ display: "flex", alignItems: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Salir
          </button>
        </div>
      </div>
    </>
  );
};

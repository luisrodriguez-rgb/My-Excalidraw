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
      if (!slide || !excalidrawAPI) return;

      try {
        const padding = 60;
        const sidebarWidth = notesSidebarOpen ? 340 : 0;
        const availableWidth = window.innerWidth - padding - sidebarWidth;
        const availableHeight = window.innerHeight - padding - 60;

        const slideWidth = Math.max(slide.width || 100, 100);
        const slideHeight = Math.max(slide.height || 100, 100);

        const zoomValue = Math.min(
          Math.max(
            Math.min(availableWidth / slideWidth, availableHeight / slideHeight),
            0.15,
          ),
          2.0,
        );

        const centerX = slide.x + slideWidth / 2;
        const centerY = slide.y + slideHeight / 2;

        const visibleCenterX = (window.innerWidth - sidebarWidth) / 2;
        const visibleCenterY = window.innerHeight / 2;

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
    const elements = excalidrawAPI.getSceneElements();
    const validElements = elements.filter((el) => !el.isDeleted);

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

    // Sort slides: top to bottom, then left to right
    frameSlides.sort((a: any, b: any) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 100) {
        return yDiff;
      }
      return a.x - b.x;
    });

    setSlides(frameSlides);

    // Initial zoom to first slide if available
    if (frameSlides.length > 0) {
      zoomToSlide(frameSlides[0]);
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
          <div className="no-slides-icon">🖼️</div>
          <h3>Modo Presentación</h3>
          <p>
            No se encontraron <strong>Marcos (Frames)</strong> ni secciones en
            este lienzo.
          </p>
          <p className="no-slides-tip">
            💡 <em>Consejo:</em> Selecciona la herramienta <strong>Frame (Marco)</strong> en la barra de herramientas para agrupar tu contenido en diapositivas.
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
    if (excalidrawAPI) {
      const state = excalidrawAPI.getAppState();
      return {
        scrollX: state.scrollX,
        scrollY: state.scrollY,
        zoom: state.zoom.value,
        theme: state.theme,
      };
    }
    return { scrollX: 0, scrollY: 0, zoom: 1, theme: "light" };
  });

  const updateViewport = useCallback(() => {
    if (!excalidrawAPI) return;
    const state = excalidrawAPI.getAppState();
    setViewport({
      scrollX: state.scrollX,
      scrollY: state.scrollY,
      zoom: state.zoom.value,
      theme: state.theme,
    });
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
          <div className="no-slides-icon">🖼️</div>
          <h3>Modo Presentación</h3>
          <p>
            No se encontraron <strong>Marcos (Frames)</strong> ni secciones en
            este lienzo o la diapositiva seleccionada no es válida.
          </p>
          <p className="no-slides-tip">
            💡 <em>Consejo:</em> Selecciona la herramienta <strong>Frame (Marco)</strong> en la barra de herramientas para agrupar tu contenido en diapositivas.
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
  const left = (currentSlide.x + viewport.scrollX) * viewport.zoom;
  const top = (currentSlide.y + viewport.scrollY) * viewport.zoom;
  const width = currentSlide.width * viewport.zoom;
  const height = currentSlide.height * viewport.zoom;
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
        >
          ◀ Anterior
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
        >
          Siguiente ▶
        </button>

        <div className="presentation-divider" />

        <button
          className="presentation-btn presentation-btn--icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? "↙ ↗" : "⛶"}
        </button>

        <button
          className="presentation-btn presentation-btn--exit"
          onClick={onClose}
          title="Salir de la presentación (Escape)"
        >
          ✕ Salir
        </button>
      </div>
    </div>
    </>
  );
};

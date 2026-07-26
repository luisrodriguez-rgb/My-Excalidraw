import React, { useEffect, useState, useCallback } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "./PresentationMode.scss";

interface PresentationModeProps {
  excalidrawAPI: ExcalidrawImperativeAPI;
  onClose: () => void;
  notesSidebarOpen?: boolean;
}

const getZoomValue = (zoom: any): number => {
  if (!zoom) return 1;
  if (typeof zoom === "number") return zoom;
  if (typeof zoom === "object" && typeof zoom.value === "number") return zoom.value;
  return 1;
};

export const PresentationMode: React.FC<PresentationModeProps> = ({
  excalidrawAPI,
  onClose,
  notesSidebarOpen = false,
}) => {
  // Initialize slides synchronously during mount to avoid flash of warning dialog
  const [slides, setSlides] = useState<any[]>(() => {
    if (excalidrawAPI && typeof excalidrawAPI.getSceneElements === "function") {
      try {
        const elements = excalidrawAPI.getSceneElements() || [];
        const validElements = elements.filter((el) => el && !el.isDeleted);

        let frameSlides = validElements.filter(
          (el: any) => el.type === "frame" || el.type === "magicframe",
        );

        if (frameSlides.length === 0) {
          frameSlides = validElements.filter(
            (el: any) =>
              el.type === "rectangle" &&
              el.width > 250 &&
              el.height > 180 &&
              !el.frameId,
          );
        }

        frameSlides.sort((a: any, b: any) => {
          const yDiff = (a.y ?? 0) - (b.y ?? 0);
          if (Math.abs(yDiff) > 100) {
            return yDiff;
          }
          return (a.x ?? 0) - (b.x ?? 0);
        });

        return frameSlides;
      } catch (err) {
        console.error("Error initializing slides list:", err);
      }
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Center & fit a slide element in the current viewport
  const zoomToSlide = useCallback(
    (slide: any) => {
      if (!slide || !excalidrawAPI || typeof excalidrawAPI.updateScene !== "function") return;

      try {
        const rect = document.querySelector(".excalidraw")?.getBoundingClientRect();
        const sidebarWidth = notesSidebarOpen ? 340 : 0;
        const availableWidth = rect ? rect.width - sidebarWidth : window.innerWidth - sidebarWidth;
        const availableHeight = rect ? rect.height : window.innerHeight;

        const slideWidth = Math.max(Number.isFinite(slide.width) ? slide.width : 100, 100);
        const slideHeight = Math.max(Number.isFinite(slide.height) ? slide.height : 100, 100);

        // Zoom to fit the slide exactly with 0 padding
        const zoomValue = Math.min(
          Math.max(
            Math.min(availableWidth / slideWidth, availableHeight / slideHeight),
            0.1,
          ),
          5.0,
        );

        const centerX = (Number.isFinite(slide.x) ? slide.x : 0) + slideWidth / 2;
        const centerY = (Number.isFinite(slide.y) ? slide.y : 0) + slideHeight / 2;

        const visibleCenterX = availableWidth / 2;
        const visibleCenterY = availableHeight / 2;

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

  // Keep slides list synced if elements update
  useEffect(() => {
    if (!excalidrawAPI || typeof excalidrawAPI.getSceneElements !== "function") return;

    try {
      const elements = excalidrawAPI.getSceneElements() || [];
      const validElements = elements.filter((el) => el && !el.isDeleted);

      let frameSlides = validElements.filter(
        (el: any) => el.type === "frame" || el.type === "magicframe",
      );

      if (frameSlides.length === 0) {
        frameSlides = validElements.filter(
          (el: any) =>
            el.type === "rectangle" &&
            el.width > 250 &&
            el.height > 180 &&
            !el.frameId,
        );
      }

      frameSlides.sort((a: any, b: any) => {
        const yDiff = (a.y ?? 0) - (b.y ?? 0);
        if (Math.abs(yDiff) > 100) {
          return yDiff;
        }
        return (a.x ?? 0) - (b.x ?? 0);
      });

      setSlides(frameSlides);
    } catch (err) {
      console.error("Error syncing presentation slides:", err);
    }
  }, [excalidrawAPI]);

  // Initial zoom to first slide on mount
  useEffect(() => {
    if (slides.length > 0 && slides[0]) {
      // Small timeout to let UI settle before zooming
      const timer = setTimeout(() => {
        zoomToSlide(slides[0]);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [zoomToSlide, slides.length]);

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

  // Viewport tracking (for alignment mask positioning)
  const [viewport, setViewport] = useState(() => {
    try {
      if (excalidrawAPI && typeof excalidrawAPI.getAppState === "function") {
        const state = excalidrawAPI.getAppState();
        if (state) {
          return {
            scrollX: Number.isFinite(state.scrollX) ? state.scrollX : 0,
            scrollY: Number.isFinite(state.scrollY) ? state.scrollY : 0,
            zoom: getZoomValue(state.zoom),
            theme: state.theme ?? "light",
          };
        }
      }
    } catch (err) {
      console.error("Error getting initial presentation appState:", err);
    }
    return { scrollX: 0, scrollY: 0, zoom: 1, theme: "light" };
  });

  const updateViewport = useCallback(() => {
    if (!excalidrawAPI || typeof excalidrawAPI.getAppState !== "function") return;
    try {
      const state = excalidrawAPI.getAppState();
      if (!state) return;
      setViewport({
        scrollX: Number.isFinite(state.scrollX) ? state.scrollX : 0,
        scrollY: Number.isFinite(state.scrollY) ? state.scrollY : 0,
        zoom: getZoomValue(state.zoom),
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

  // If no slides, render guidance modal
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
            No se encontraron <strong>Marcos (Frames)</strong> ni secciones en este lienzo.
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
          <p>La diapositiva seleccionada no es válida.</p>
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

  // Get current parent editor element position to compute absolute offset positioning
  const rect = document.querySelector(".excalidraw")?.getBoundingClientRect();
  const canvasLeft = rect ? rect.left : 0;
  const canvasTop = rect ? rect.top : 0;

  const zoomFactor = Number.isFinite(viewport.zoom) && viewport.zoom > 0 ? viewport.zoom : 1;
  const slideX = Number.isFinite(currentSlide.x) ? currentSlide.x : 0;
  const slideY = Number.isFinite(currentSlide.y) ? currentSlide.y : 0;
  const slideW = Math.max(Number.isFinite(currentSlide.width) ? currentSlide.width : 100, 100);
  const slideH = Math.max(Number.isFinite(currentSlide.height) ? currentSlide.height : 100, 100);

  // Mask dimensions relative to document viewport
  const finalLeft = canvasLeft + (slideX + viewport.scrollX) * zoomFactor;
  const finalTop = canvasTop + (slideY + viewport.scrollY) * zoomFactor;
  const finalWidth = slideW * zoomFactor;
  const finalHeight = slideH * zoomFactor;

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
            left: `${Number.isFinite(finalLeft) ? finalLeft : 0}px`,
            top: `${Number.isFinite(finalTop) ? finalTop : 0}px`,
            width: `${Number.isFinite(finalWidth) ? finalWidth : 100}px`,
            height: `${Number.isFinite(finalHeight) ? finalHeight : 100}px`,
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

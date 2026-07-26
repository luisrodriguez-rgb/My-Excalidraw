import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "./PresentationMode.scss";

interface PresentationModeProps {
  excalidrawAPI: ExcalidrawImperativeAPI;
  onClose: () => void;
  notesSidebarOpen?: boolean;
  activeBoardId?: string | null;
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
  activeBoardId = null,
}) => {
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
        return frameSlides;
      } catch (err) {
        console.error("Error initializing slides list:", err);
      }
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSlideList, setShowSlideList] = useState(false);

  // Load/save custom slide order from localStorage for persistence!
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    if (activeBoardId) {
      try {
        const stored = localStorage.getItem(`presentation-order-${activeBoardId}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error loading custom slide order:", e);
      }
    }
    return [];
  });

  // Manage presentation active body class to hide UI elements
  useEffect(() => {
    document.body.classList.add("presentation-active");
    return () => {
      document.body.classList.remove("presentation-active");
    };
  }, []);

  // Sort slides according to manual customOrder, number prefixes, or coordinates
  const sortedSlides = useMemo(() => {
    const sorted = [...slides];
    sorted.sort((a, b) => {
      const indexA = customOrder.indexOf(a.id);
      const indexB = customOrder.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Extract slide number prefix (e.g. "1. Intro", "02 Slide")
      const nameA = a.name || a.label?.text || "";
      const nameB = b.name || b.label?.text || "";
      const numMatchA = nameA.trim().match(/^(\d+)/);
      const numMatchB = nameB.trim().match(/^(\d+)/);

      if (numMatchA && numMatchB) {
        return parseInt(numMatchA[1], 10) - parseInt(numMatchB[1], 10);
      }
      if (numMatchA) return -1;
      if (numMatchB) return 1;

      // Fallback to geometric sort
      const yDiff = (a.y ?? 0) - (b.y ?? 0);
      if (Math.abs(yDiff) > 100) {
        return yDiff;
      }
      return (a.x ?? 0) - (b.x ?? 0);
    });
    return sorted;
  }, [slides, customOrder]);

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
      setSlides(frameSlides);
    } catch (err) {
      console.error("Error syncing presentation slides:", err);
    }
  }, [excalidrawAPI]);

  // Initial zoom to first slide on mount
  useEffect(() => {
    if (sortedSlides.length > 0 && sortedSlides[0]) {
      const timer = setTimeout(() => {
        zoomToSlide(sortedSlides[0]);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [zoomToSlide, sortedSlides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= sortedSlides.length) return;
      setCurrentIndex(index);
      const targetSlide = sortedSlides[index];
      if (targetSlide) {
        zoomToSlide(targetSlide);
      }
    },
    [sortedSlides, zoomToSlide],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < sortedSlides.length - 1) {
      goToSlide(currentIndex + 1);
    }
  }, [goToSlide, currentIndex, sortedSlides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
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

  // Reorder slide helper
  const moveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedSlides.length) return;

    const currentOrder = sortedSlides.map((s) => s.id);
    const [moved] = currentOrder.splice(index, 1);
    currentOrder.splice(newIndex, 0, moved);

    setCustomOrder(currentOrder);
    if (activeBoardId) {
      localStorage.setItem(`presentation-order-${activeBoardId}`, JSON.stringify(currentOrder));
    }

    if (currentIndex === index) {
      setCurrentIndex(newIndex);
    } else if (currentIndex === newIndex) {
      setCurrentIndex(index);
    }
  };

  // If no slides, render guidance modal
  if (sortedSlides.length === 0) {
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

  const currentSlide = sortedSlides[currentIndex];
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

  const rect = document.querySelector(".excalidraw")?.getBoundingClientRect();
  const canvasLeft = rect ? rect.left : 0;
  const canvasTop = rect ? rect.top : 0;

  const zoomFactor = Number.isFinite(viewport.zoom) && viewport.zoom > 0 ? viewport.zoom : 1;
  const slideX = Number.isFinite(currentSlide.x) ? currentSlide.x : 0;
  const slideY = Number.isFinite(currentSlide.y) ? currentSlide.y : 0;
  const slideW = Math.max(Number.isFinite(currentSlide.width) ? currentSlide.width : 100, 100);
  const slideH = Math.max(Number.isFinite(currentSlide.height) ? currentSlide.height : 100, 100);

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

      {/* Slide Order Panel */}
      {showSlideList && (
        <div
          style={{
            position: "fixed",
            bottom: "85px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "320px",
            maxHeight: "300px",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            color: "white",
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "sans-serif",
          }}
          className="presentation-slide-list"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", color: "#f8fafc" }}>Orden de Diapositivas</span>
            <button
              onClick={() => setShowSlideList(false)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {sortedSlides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              const title = slide.name || slide.label?.text || `Diapositiva ${idx + 1}`;
              return (
                <div
                  key={slide.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    backgroundColor: isActive ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    transition: "background 0.15s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => goToSlide(idx)}
                >
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isActive ? "#818cf8" : "#64748b",
                    marginRight: "10px",
                    width: "20px"
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{
                    fontSize: "12.5px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#fff" : "#cbd5e1",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginRight: "8px"
                  }}>
                    {title}
                  </span>
                  
                  <div style={{ display: "flex", gap: "2px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled={idx === 0}
                      onClick={() => moveSlide(idx, "up")}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "none",
                        color: idx === 0 ? "#475569" : "#fff",
                        borderRadius: "4px",
                        width: "24px",
                        height: "24px",
                        cursor: idx === 0 ? "not-allowed" : "pointer",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Subir en orden"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === sortedSlides.length - 1}
                      onClick={() => moveSlide(idx, "down")}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "none",
                        color: idx === sortedSlides.length - 1 ? "#475569" : "#fff",
                        borderRadius: "4px",
                        width: "24px",
                        height: "24px",
                        cursor: idx === sortedSlides.length - 1 ? "not-allowed" : "pointer",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Bajar en orden"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              {currentIndex + 1} / {sortedSlides.length}
            </span>
            <span className="slide-name" title={slideTitle}>
              {slideTitle}
            </span>
          </div>

          <button
            className="presentation-btn"
            onClick={handleNext}
            disabled={currentIndex === sortedSlides.length - 1}
            title="Siguiente diapositiva (Flecha Derecha / Espacio)"
            style={{ display: "flex", alignItems: "center" }}
          >
            Siguiente
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div className="presentation-divider" />

          {/* Reorder Toggle Button */}
          <button
            className={`presentation-btn ${showSlideList ? "presentation-btn--active" : ""}`}
            onClick={() => setShowSlideList(!showSlideList)}
            title="Ver orden y reordenar diapositivas"
            style={{ display: "flex", alignItems: "center", backgroundColor: showSlideList ? "rgba(99, 102, 241, 0.4)" : "" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Orden
          </button>

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

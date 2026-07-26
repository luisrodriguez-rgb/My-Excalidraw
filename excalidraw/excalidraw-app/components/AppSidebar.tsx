import React, { useState } from "react";
import { DefaultSidebar, Sidebar } from "@excalidraw/excalidraw";
import {
  messageCircleIcon,
  presentationIcon,
} from "@excalidraw/excalidraw/components/icons";

interface AppSidebarProps {
  comments: any[];
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  activeBoardId: string | null;
  excalidrawAPI: any;
  onResolveComment: (id: string) => void;
}

export const AppSidebar = ({
  comments,
  setComments,
  activeBoardId,
  excalidrawAPI,
  onResolveComment,
}: AppSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "replies">("date");
  const [showResolved, setShowResolved] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredComments = comments
    .filter((c) => {
      const matchText =
        c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.author.toLowerCase().includes(searchTerm.toLowerCase());
      if (showResolved) {
        return matchText;
      }
      return matchText && !c.resolved;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.createdAt - a.createdAt;
      }
      const aReplies = a.replies?.length || 0;
      const bReplies = b.replies?.length || 0;
      return bReplies - aReplies;
    });

  const handleCommentClick = (comment: any) => {
    if (!excalidrawAPI) {
      return;
    }
    const zoom = excalidrawAPI.getAppState().zoom.value;
    const width = excalidrawAPI.getAppState().width;
    const height = excalidrawAPI.getAppState().height;
    excalidrawAPI.updateScene({
      appState: {
        scrollX: -comment.x + width / 2 / zoom,
        scrollY: -comment.y + height / 2 / zoom,
      },
    });
  };

  const importCollection = async (type: "flowchart" | "ui" | "kanban") => {
    if (!excalidrawAPI) return;

    let items: any[] = [];
    if (type === "flowchart") {
      items = [
        {
          id: "flow_process",
          status: "published",
          created: Date.now(),
          name: "Proceso",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 140,
              height: 60,
              strokeColor: "#3b82f6",
              backgroundColor: "#dbeafe",
              fillStyle: "solid",
              strokeWidth: 2,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
        {
          id: "flow_decision",
          status: "published",
          created: Date.now(),
          name: "Decisión",
          elements: [
            {
              type: "diamond",
              x: 0,
              y: 0,
              width: 80,
              height: 80,
              strokeColor: "#f59e0b",
              backgroundColor: "#fef3c7",
              fillStyle: "solid",
              strokeWidth: 2,
              roughness: 0,
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
        {
          id: "flow_term",
          status: "published",
          created: Date.now(),
          name: "Inicio/Fin",
          elements: [
            {
              type: "ellipse",
              x: 0,
              y: 0,
              width: 140,
              height: 60,
              strokeColor: "#10b981",
              backgroundColor: "#d1fae5",
              fillStyle: "solid",
              strokeWidth: 2,
              roughness: 0,
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
      ];
    } else if (type === "ui") {
      items = [
        {
          id: "ui_button",
          status: "published",
          created: Date.now(),
          name: "Botón Primario",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 140,
              height: 40,
              strokeColor: "#6366f1",
              backgroundColor: "#6366f1",
              fillStyle: "solid",
              strokeWidth: 1,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
        {
          id: "ui_input",
          status: "published",
          created: Date.now(),
          name: "Campo de Texto",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 200,
              height: 40,
              strokeColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
              fillStyle: "solid",
              strokeWidth: 1,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
        {
          id: "ui_card",
          status: "published",
          created: Date.now(),
          name: "Contenedor Tarjeta",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 280,
              height: 160,
              strokeColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              fillStyle: "solid",
              strokeWidth: 1,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
      ];
    } else if (type === "kanban") {
      items = [
        {
          id: "kanban_todo",
          status: "published",
          created: Date.now(),
          name: "Kanban Pendiente",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 180,
              height: 80,
              strokeColor: "#f87171",
              backgroundColor: "#fef2f2",
              fillStyle: "solid",
              strokeWidth: 1.5,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
        {
          id: "kanban_progress",
          status: "published",
          created: Date.now(),
          name: "Kanban En Progreso",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 180,
              height: 80,
              strokeColor: "#fbbf24",
              backgroundColor: "#fffbeb",
              fillStyle: "solid",
              strokeWidth: 1.5,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
        {
          id: "kanban_done",
          status: "published",
          created: Date.now(),
          name: "Kanban Completado",
          elements: [
            {
              type: "rectangle",
              x: 0,
              y: 0,
              width: 180,
              height: 80,
              strokeColor: "#34d399",
              backgroundColor: "#ecfdf5",
              fillStyle: "solid",
              strokeWidth: 1.5,
              roughness: 0,
              roundness: { type: 3 },
              opacity: 100,
              isDeleted: false,
            },
          ],
        },
      ];
    }

    try {
      const sanitized = items.map((item) => {
        const sanitizedElements = (item.elements || []).map((el: any) => ({
          id: el.id || `${el.type}_${Math.random().toString(36).substring(2, 9)}`,
          seed: el.seed || Math.floor(Math.random() * 100000),
          version: el.version || 1,
          versionNonce: el.versionNonce || Math.floor(Math.random() * 100000),
          isDeleted: el.isDeleted ?? false,
          updated: el.updated || Date.now(),
          link: el.link ?? null,
          locked: el.locked ?? false,
          fillStyle: el.fillStyle || "hachure",
          strokeWidth: el.strokeWidth ?? 2,
          strokeStyle: el.strokeStyle || "solid",
          roughness: el.roughness ?? 1,
          opacity: el.opacity ?? 100,
          strokeColor: el.strokeColor || "#1e1e1e",
          backgroundColor: el.backgroundColor || "transparent",
          ...el,
        }));
        return {
          ...item,
          elements: sanitizedElements,
        };
      });

      await excalidrawAPI.updateLibrary({
        libraryItems: sanitized,
        merge: true,
        openLibraryMenu: true,
      });
    } catch (err) {
      console.error("Error importing pre-built library:", err);
    }
  };

  return (
    <DefaultSidebar docked={true}>
      <DefaultSidebar.TabTriggers>
        <Sidebar.TabTrigger tab="comments">
          {messageCircleIcon}
        </Sidebar.TabTrigger>
        <Sidebar.TabTrigger tab="premium-libraries" title="Librerías Premium">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </Sidebar.TabTrigger>
      </DefaultSidebar.TabTriggers>

      <Sidebar.Tab tab="comments">
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontWeight: "700", fontSize: "16px" }}>
              Comentarios
            </span>
            <button
              onClick={() => {
                const updated = comments.map((c) => ({
                  ...c,
                  resolved: true,
                }));
                setComments(updated);
                if (activeBoardId) {
                  import("../data/boardsDb").then((db) =>
                    db.saveBoardComments(activeBoardId, updated),
                  );
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "#a855f7",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Marcar todo como resuelto
            </button>
          </div>

          {/* Search Box */}
          <div
            style={{
              position: "relative",
              marginBottom: "12px",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Buscar comentarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "13px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                outline: "none",
                backgroundColor: "var(--input-bg-color)",
                color: "var(--text-primary-color)",
              }}
            />

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--button-bg-color)",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              ⚙️
            </button>

            {showFilterDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "12px",
                  zIndex: 100,
                  width: "200px",
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "4px",
                  }}
                >
                  Ordenar por
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === "date"}
                    onChange={() => setSortBy("date")}
                  />
                  Fecha de creación
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === "replies"}
                    onChange={() => setSortBy("replies")}
                  />
                  Número de respuestas
                </label>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "4px",
                    marginTop: "8px",
                  }}
                >
                  Filtros
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showResolved}
                    onChange={(e) => setShowResolved(e.target.checked)}
                  />
                  Mostrar resueltos
                </label>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {filteredComments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: "13px",
                  marginTop: "24px",
                }}
              >
                No se encontraron comentarios
              </div>
            ) : (
              filteredComments.map((comment) => {
                const replyCount = comment.replies?.length || 0;
                return (
                  <div
                    key={comment.id}
                    onClick={() => handleCommentClick(comment)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--card-bg-color)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      transition: "transform 0.1s ease",
                      borderLeft: comment.resolved
                        ? "4px solid #10b981"
                        : "4px solid #a855f7",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateX(2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "none")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: "700", fontSize: "13px" }}>
                        {comment.author}
                      </span>
                      <span style={{ fontSize: "10px", color: "#888" }}>
                        {new Date(comment.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary-color)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {comment.text}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <span style={{ color: "#a855f7", fontWeight: "600" }}>
                        {replyCount > 0
                          ? `💬 ${replyCount} ${
                              replyCount === 1 ? "respuesta" : "respuestas"
                            }`
                          : "Responder"}
                      </span>
                      {!comment.resolved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveComment(comment.id);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#10b981",
                            fontWeight: "600",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Sidebar.Tab>

      <Sidebar.Tab tab="premium-libraries">
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <span
            style={{
              fontWeight: "700",
              fontSize: "16px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Librerías Premium
          </span>
          <p
            style={{
              fontSize: "12.5px",
              color: "#64748b",
              lineHeight: "1.4",
              margin: "0 0 16px 0",
            }}
          >
            Colecciones de formas y bloques optimizados y prediseñados listos para usar en tus pizarras.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Card 1: Flowcharts */}
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "12px",
                backgroundColor: "var(--card-bg-color, #ffffff)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  DIAGRAMA
                </span>
                <span style={{ fontWeight: "600", fontSize: "13px" }}>
                  Diagramas de Flujo
                </span>
              </div>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
                Procesos, decisiones y terminadores estándar para modelar tus flujos de trabajo.
              </p>
              <button
                onClick={() => importCollection("flowchart")}
                style={{
                  backgroundColor: "#a855f7",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Añadir a mi Biblioteca
              </button>
            </div>

            {/* Card 2: Web UI Components */}
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "12px",
                backgroundColor: "var(--card-bg-color, #ffffff)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    color: "#6366f1",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  INTERFAZ
                </span>
                <span style={{ fontWeight: "600", fontSize: "13px" }}>
                  Componentes UI Web
                </span>
              </div>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
                Botones primarios, entradas de texto y tarjetas contenedoras listas para prototipar.
              </p>
              <button
                onClick={() => importCollection("ui")}
                style={{
                  backgroundColor: "#a855f7",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Añadir a mi Biblioteca
              </button>
            </div>

            {/* Card 3: Kanban Cards */}
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "12px",
                backgroundColor: "var(--card-bg-color, #ffffff)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  KANBAN
                </span>
                <span style={{ fontWeight: "600", fontSize: "13px" }}>
                  Tarjetas de Organización
                </span>
              </div>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
                Bloques de colores (Pendiente, En Progreso, Completado) para organizar tareas.
              </p>
              <button
                onClick={() => importCollection("kanban")}
                style={{
                  backgroundColor: "#a855f7",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Añadir a mi Biblioteca
              </button>
            </div>
          </div>
        </div>
      </Sidebar.Tab>
    </DefaultSidebar>
  );
};

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

  return (
    <DefaultSidebar>
      <DefaultSidebar.TabTriggers>
        <Sidebar.TabTrigger tab="comments">
          {messageCircleIcon}
        </Sidebar.TabTrigger>
        <Sidebar.TabTrigger tab="presentation">
          {presentationIcon}
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

      <Sidebar.Tab tab="presentation">
        <div style={{ padding: "16px" }}>
          <span
            style={{
              fontWeight: "700",
              fontSize: "16px",
              display: "block",
              marginBottom: "12px",
            }}
          >
            Diapositivas
          </span>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.4" }}>
            Crea marcos ("Frames") en el canvas para organizar tus dibujos en
            diapositivas individuales. Luego podrás exportarlas todas juntas a
            PowerPoint utilizando la opción en el menú de exportación.
          </p>
        </div>
      </Sidebar.Tab>
    </DefaultSidebar>
  );
};

import React, { useState, useEffect } from "react";

import {
  getBoardsMetadata,
  saveBoard,
  deleteBoard,
  duplicateBoard,
} from "../data/boardsDb";

import "./Dashboard.scss";

import type { BoardMetadata } from "../data/boardsDb";

interface DashboardProps {
  onSelectBoard: (boardId: string) => void;
  onJoinRoom: (roomUrl: string) => void;
}

// Icons
const OpenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const PencilIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
  </svg>
);

const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ExportIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectBoard,
  onJoinRoom,
}) => {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("excalidraw-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  // Modal states
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomUrlInput, setRoomUrlInput] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardIdToDelete, setBoardIdToDelete] = useState<string | null>(null);
  const [boardNameToDelete, setBoardNameToDelete] = useState("");

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const list = await getBoardsMetadata();
    setBoards(list);
  };

  const handleCreateBoard = async () => {
    const id = `board_${Math.random().toString(36).substr(2, 9)}`;
    const name = `Workspace ${boards.length + 1}`;
    await saveBoard(id, { name }, [], {}, {});
    onSelectBoard(id);
  };

  const handleDelete = (id: string, name: string) => {
    setBoardIdToDelete(id);
    setBoardNameToDelete(name);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (boardIdToDelete) {
      await deleteBoard(boardIdToDelete);
      setShowDeleteModal(false);
      setBoardIdToDelete(null);
      loadBoards();
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    await duplicateBoard(id, `${name} (Copia)`);
    loadBoards();
  };

  const openRenameModal = (id: string, currentName: string) => {
    setSelectedBoardId(id);
    setNewBoardName(currentName);
    setShowRenameModal(true);
  };

  const handleRenameConfirm = async () => {
    if (selectedBoardId && newBoardName.trim()) {
      await saveBoard(selectedBoardId, { name: newBoardName.trim() });
      setShowRenameModal(false);
      setSelectedBoardId(null);
      loadBoards();
    }
  };

  const handleExport = async (id: string, name: string) => {
    // Get full board contents
    const fullBoard = await get(`board_content_${id}`);
    if (fullBoard) {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(fullBoard),
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${name}.excalidraw`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      alert("No se pudo exportar el tablero");
    }
  };

  // Safe get helper for exports
  const get = async (key: string): Promise<any> => {
    const { get: idbGet, createStore } = await import("idb-keyval");
    const boardsStore = createStore("excalidraw-boards-db", "boards-store");
    return idbGet(key, boardsStore);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        // Standard excalidraw file format parsing
        const name =
          file.name.replace(/\.excalidraw$|\.json$/, "") || "Tablero Importado";
        const id = `board_${Math.random().toString(36).substr(2, 9)}`;

        const elements = importedData.elements || [];
        const appState = importedData.appState || {};
        const files = importedData.files || {};

        await saveBoard(id, { name }, elements, appState, files);
        loadBoards();
      } catch (error) {
        console.error("Error al importar el archivo:", error);
        alert("El archivo no es válido o está corrupto.");
      }
    };
    reader.readAsText(file);
  };

  const handleJoinRoomConfirm = () => {
    if (roomUrlInput.trim()) {
      onJoinRoom(roomUrlInput.trim());
      setShowJoinModal(false);
      setRoomUrlInput("");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("excalidraw-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={`workspace-dashboard theme-${theme}`}>
      <header className="dashboard-header">
        <div className="logo-section">
          <svg viewBox="0 0 512 512" width="32" height="32">
            <path d="M424 64H88C50.5 64 20 94.5 20 132v248c0 37.5 30.5 68 68 68h336c37.5 0 68-30.5 68-68V132c0-37.5-30.5-68-68-68zm-54 132c0 16.6-13.4 30-30 30s-30-13.4-30-30 13.4-30 30-30 30 13.4 30 30zm-114 0c0 16.6-13.4 30-30 30s-30-13.4-30-30 13.4-30 30-30 30 13.4 30 30zm-114 0c0 16.6-13.4 30-30 30s-30-13.4-30-30 13.4-30 30-30 30 13.4 30 30zm288 174H126c-10 0-18-8-18-18s8-18 18-18h218c10 0 18 8 18 18s-8 18-18 18z" />
          </svg>
          <h1>Excalidraw Workspace</h1>
        </div>
        <div className="header-actions">
          <button
            className="join-room-btn"
            onClick={() => setShowJoinModal(true)}
          >
            Unirse a Sala Colaborativa
          </button>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h2>¡Hola! Gestiona tus espacios de trabajo ilimitados</h2>
          <p>
            Crea tantos tableros como quieras de forma 100% gratuita. Los datos
            se guardan de forma segura en tu navegador. Colabora en tiempo real
            sin límites.
          </p>
        </div>

        <div className="search-and-filter">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar tableros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="action-buttons">
            <input
              type="file"
              id="import-excalidraw-file"
              accept=".excalidraw,.json"
              style={{ display: "none" }}
              onChange={handleImport}
            />
            <button
              className="btn-import-board"
              onClick={() =>
                document.getElementById("import-excalidraw-file")?.click()
              }
            >
              Importar Tablero (.excalidraw)
            </button>
            <button className="btn-new-board" onClick={handleCreateBoard}>
              + Crear Nuevo Tablero
            </button>
          </div>
        </div>

        {filteredBoards.length > 0 ? (
          <div className="boards-grid">
            {filteredBoards.map((board) => (
              <div key={board.id} className="board-card">
                <div
                  className="board-info"
                  onClick={() => onSelectBoard(board.id)}
                  title="Haz clic para abrir este tablero"
                >
                  <h3 className="board-title">{board.name}</h3>
                  <div className="board-dates">
                    Actualizado: {new Date(board.updatedAt).toLocaleString()}
                  </div>
                  <div className="board-tags">
                    {board.isCollaboration && (
                      <span className="tag-collab">
                        Sala activa (Colaboración)
                      </span>
                    )}
                  </div>
                </div>

                <div className="board-actions">
                  <button
                    className="btn-action btn-open"
                    title="Abrir el tablero en pantalla completa"
                    onClick={() => onSelectBoard(board.id)}
                  >
                    <OpenIcon />
                    <span>Abrir</span>
                  </button>
                  <button
                    className="btn-action"
                    title="Cambiar el nombre del tablero"
                    onClick={() => openRenameModal(board.id, board.name)}
                  >
                    <PencilIcon />
                    <span>Renombrar</span>
                  </button>
                  <button
                    className="btn-action"
                    title="Crear una copia exacta de este tablero"
                    onClick={() => handleDuplicate(board.id, board.name)}
                  >
                    <CopyIcon />
                    <span>Duplicar</span>
                  </button>
                  <button
                    className="btn-action"
                    title="Descargar este tablero como archivo .excalidraw"
                    onClick={() => handleExport(board.id, board.name)}
                  >
                    <ExportIcon />
                    <span>Exportar</span>
                  </button>
                  <button
                    className="btn-action btn-delete"
                    title="Eliminar este tablero permanentemente"
                    onClick={() => handleDelete(board.id, board.name)}
                  >
                    <TrashIcon />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No tienes tableros que coincidan</h3>
            <p>Comienza creando un tablero nuevo o importando uno existente.</p>
            <button onClick={handleCreateBoard}>Crear Primer Tablero</button>
          </div>
        )}
      </main>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Renombrar Tablero</h3>
            <div className="form-group">
              <label>Nuevo Nombre:</label>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowRenameModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleRenameConfirm}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Unirse a Sala Colaborativa</h3>
            <div className="form-group">
              <label>Enlace o Hash de la Sala:</label>
              <input
                type="text"
                placeholder="Pega el enlace de colaboración aquí..."
                value={roomUrlInput}
                onChange={(e) => setRoomUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoomConfirm()}
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowJoinModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleJoinRoomConfirm}>
                Unirse
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Eliminar Tablero</h3>
            <p
              style={{
                margin: "1rem 0",
                lineHeight: "1.5",
                color: "var(--text-secondary)",
              }}
            >
              ¿Estás seguro de que quieres eliminar permanentemente el tablero{" "}
              <strong>{boardNameToDelete}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                style={{ backgroundColor: "var(--danger-color)" }}
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";

import {
  getBoardsMetadata,
  saveBoard,
  deleteBoard,
  duplicateBoard,
  getFolders,
  createFolder,
  deleteFolder,
  getBoardVersions,
  restoreBoardVersion,
} from "../data/boardsDb";
import { TEMPLATES } from "../data/templates";

import "./Dashboard.scss";

import type { BoardMetadata, BoardVersion, Folder } from "../data/boardsDb";

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

const TagIcon = () => (
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
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const FolderIcon = () => (
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
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const HistoryIcon = () => (
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
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const PREDEFINED_TAGS = [
  { label: "Diseño", color: "#6366f1" },
  { label: "Reunión", color: "#f59e0b" },
  { label: "Arquitectura", color: "#10b981" },
  { label: "Brainstorming", color: "#ef4444" },
  { label: "Cliente", color: "#3b82f6" },
];

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

  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedFolderForMove, setSelectedFolderForMove] = useState<
    string | null
  >(null);

  const [showPasswordPromptModal, setShowPasswordPromptModal] = useState(false);
  const [passwordPromptInput, setPasswordPromptInput] = useState("");
  const [passwordPromptError, setPasswordPromptError] = useState("");
  const [boardIdToPrompt, setBoardIdToPrompt] = useState<string | null>(null);
  const [correctPassword, setCorrectPassword] = useState("");

  const [showPasswordSetModal, setShowPasswordSetModal] = useState(false);
  const [passwordSetInput, setPasswordSetInput] = useState("");

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [boardVersions, setBoardVersions] = useState<BoardVersion[]>([]);
  const [boardIdForHistory, setBoardIdForHistory] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const list = await getBoardsMetadata();
    setBoards(list);
    const folderList = await getFolders();
    setFolders(folderList);
  };

  const handleCreateBoard = async (templateId: string | null = null) => {
    const id = `board_${Math.random().toString(36).substr(2, 9)}`;
    let name = `Workspace ${boards.length + 1}`;
    let elements: any[] = [];

    if (templateId) {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        name = template.name;
        elements = template.getElements();
      }
    }

    await saveBoard(id, { name }, elements, {}, {});
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

  const openTagsModal = (id: string, currentTags: string[]) => {
    setSelectedBoardId(id);
    setSelectedTags(currentTags || []);
    setShowTagsModal(true);
  };

  const handleTagsConfirm = async () => {
    if (selectedBoardId) {
      await saveBoard(selectedBoardId, { tags: selectedTags });
      setShowTagsModal(false);
      setSelectedBoardId(null);
      loadBoards();
    }
  };

  const toggleTagSelection = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((t) => t !== tagLabel)
        : [...prev, tagLabel],
    );
  };

  const handleCreateFolderConfirm = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setShowCreateFolderModal(false);
      setNewFolderName("");
      loadBoards();
    }
  };

  const handleMoveBoardConfirm = async () => {
    if (selectedBoardId) {
      await saveBoard(selectedBoardId, {
        folderId: selectedFolderForMove || undefined,
      });
      setShowMoveModal(false);
      setSelectedBoardId(null);
      loadBoards();
    }
  };

  const handleOpenBoard = (board: BoardMetadata) => {
    if (board.password) {
      setBoardIdToPrompt(board.id);
      setCorrectPassword(board.password);
      setPasswordPromptInput("");
      setPasswordPromptError("");
      setShowPasswordPromptModal(true);
    } else {
      onSelectBoard(board.id);
    }
  };

  const handlePasswordPromptConfirm = () => {
    if (passwordPromptInput === correctPassword) {
      setShowPasswordPromptModal(false);
      if (boardIdToPrompt) {
        onSelectBoard(boardIdToPrompt);
      }
    } else {
      setPasswordPromptError("Contraseña incorrecta. Inténtalo de nuevo.");
    }
  };

  const openHistoryModal = async (id: string) => {
    setBoardIdForHistory(id);
    const list = await getBoardVersions(id);
    const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);
    setBoardVersions(sorted);
    setShowHistoryModal(true);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (
      boardIdForHistory &&
      window.confirm(
        "¿Seguro que quieres restaurar esta versión? Se sobreescribirá el lienzo actual.",
      )
    ) {
      await restoreBoardVersion(boardIdForHistory, versionId);
      setShowHistoryModal(false);
      setBoardIdForHistory(null);
      loadBoards();
    }
  };

  const handlePasswordSetConfirm = async () => {
    if (selectedBoardId) {
      await saveBoard(selectedBoardId, {
        password: passwordSetInput.trim() || undefined,
      });
      setShowPasswordSetModal(false);
      setSelectedBoardId(null);
      loadBoards();
    }
  };

  const filteredBoards = boards.filter((b) => {
    const matchesSearch = b.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTag = activeTagFilter
      ? b.tags && b.tags.includes(activeTagFilter)
      : true;
    const matchesFolder = b.folderId === (activeFolderId || undefined);
    return matchesSearch && matchesTag && matchesFolder;
  });

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
        <aside className="dashboard-sidebar">
          <button
            className={`sidebar-nav-item ${
              activeFolderId === null ? "active" : ""
            }`}
            onClick={() => setActiveFolderId(null)}
          >
            📂 Todos los Tableros
          </button>

          <div className="sidebar-section-title">
            <span>Carpetas</span>
            <button
              className="btn-add-folder"
              onClick={() => setShowCreateFolderModal(true)}
              title="Nueva carpeta"
            >
              +
            </button>
          </div>

          <div className="folders-list">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`folder-item ${
                  activeFolderId === folder.id ? "active" : ""
                }`}
              >
                <span
                  className="folder-name"
                  onClick={() => setActiveFolderId(folder.id)}
                >
                  📁 {folder.name}
                </span>
                <button
                  className="btn-delete-folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `¿Estás seguro de que quieres eliminar la carpeta "${folder.name}"? Los tableros no se eliminarán.`,
                      )
                    ) {
                      deleteFolder(folder.id).then(() => {
                        if (activeFolderId === folder.id) {
                          setActiveFolderId(null);
                        }
                        loadBoards();
                      });
                    }
                  }}
                  title="Eliminar carpeta"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="dashboard-main-area">
          <div className="welcome-banner">
            <h2>¡Hola! Gestiona tus espacios de trabajo ilimitados</h2>
            <p>
              Crea tantos tableros como quieras de forma 100% gratuita. Los
              datos se guardan de forma segura en tu navegador. Colabora en
              tiempo real sin límites.
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
          </div>

          <div className="tags-filter-bar">
            <span className="filter-label">Filtrar por etiqueta:</span>
            <button
              className={`filter-tag-btn ${
                activeTagFilter === null ? "active" : ""
              }`}
              onClick={() => setActiveTagFilter(null)}
            >
              Todos
            </button>
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag.label}
                className={`filter-tag-btn ${
                  activeTagFilter === tag.label ? "active" : ""
                }`}
                onClick={() => setActiveTagFilter(tag.label)}
                style={{
                  borderColor:
                    activeTagFilter === tag.label ? tag.color : "transparent",
                  backgroundColor:
                    activeTagFilter === tag.label ? tag.color : undefined,
                  color: activeTagFilter === tag.label ? "white" : undefined,
                }}
              >
                <span
                  className="tag-dot"
                  style={{ backgroundColor: tag.color }}
                ></span>
                {tag.label}
              </button>
            ))}

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
              <button
                className="btn-new-board"
                onClick={() => setShowTemplatesModal(true)}
              >
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
                    onClick={() => handleOpenBoard(board)}
                    title="Haz clic para abrir este tablero"
                  >
                    <h3 className="board-title">
                      {board.password && (
                        <span style={{ marginRight: "6px" }}>🔒</span>
                      )}
                      {board.name}
                    </h3>
                    <div className="board-dates">
                      Actualizado: {new Date(board.updatedAt).toLocaleString()}
                    </div>
                    <div className="board-tags">
                      {board.isCollaboration && (
                        <span className="tag-collab">
                          Sala activa (Colaboración)
                        </span>
                      )}
                      {board.tags &&
                        board.tags.map((tagLabel) => {
                          const tagInfo = PREDEFINED_TAGS.find(
                            (t) => t.label === tagLabel,
                          );
                          return (
                            <span
                              key={tagLabel}
                              className="board-tag-pill"
                              style={{
                                backgroundColor: tagInfo?.color || "#6b7280",
                              }}
                            >
                              {tagLabel}
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  <div className="board-actions">
                    <button
                      className="btn-action btn-open"
                      title="Abrir el tablero en pantalla completa"
                      onClick={() => handleOpenBoard(board)}
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
                      title="Editar etiquetas del tablero"
                      onClick={() => openTagsModal(board.id, board.tags || [])}
                    >
                      <TagIcon />
                      <span>Etiquetas</span>
                    </button>
                    <button
                      className="btn-action"
                      title="Configurar contraseña"
                      onClick={() => {
                        setSelectedBoardId(board.id);
                        setPasswordSetInput(board.password || "");
                        setShowPasswordSetModal(true);
                      }}
                    >
                      <span>🔑 Proteger</span>
                    </button>
                    <button
                      className="btn-action"
                      title="Mover tablero a una carpeta"
                      onClick={() => {
                        setSelectedBoardId(board.id);
                        setSelectedFolderForMove(board.folderId || null);
                        setShowMoveModal(true);
                      }}
                    >
                      <FolderIcon />
                      <span>Mover</span>
                    </button>
                    <button
                      className="btn-action"
                      title="Ver historial de versiones"
                      onClick={() => openHistoryModal(board.id)}
                    >
                      <HistoryIcon />
                      <span>Historial</span>
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
              <p>
                Comienza creando un tablero nuevo o importando uno existente.
              </p>
              <button onClick={() => setShowTemplatesModal(true)}>
                Crear Primer Tablero
              </button>
            </div>
          )}
        </div>
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

      {/* Tags Selection Modal */}
      {showTagsModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Editar Etiquetas</h3>
            <p
              style={{
                margin: "0.5rem 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Selecciona las etiquetas para organizar este tablero:
            </p>
            <div className="tags-selection-list">
              {PREDEFINED_TAGS.map((tag) => {
                const isChecked = selectedTags.includes(tag.label);
                return (
                  <label key={tag.label} className="tag-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTagSelection(tag.label)}
                    />
                    <span
                      className="tag-pill"
                      style={{
                        backgroundColor: tag.color,
                      }}
                    >
                      {tag.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowTagsModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleTagsConfirm}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="dialog-overlay">
          <div
            className="dialog-box templates-dialog"
            style={{ maxWidth: "600px" }}
          >
            <h3>Crear Nuevo Tablero</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                marginBottom: "1.5rem",
              }}
            >
              Selecciona un punto de partida para tu tablero:
            </p>
            <div
              className="templates-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                margin: "1rem 0",
              }}
            >
              <div
                className="template-card blank"
                onClick={() => {
                  handleCreateBoard(null);
                  setShowTemplatesModal(false);
                }}
                style={{
                  border: "1px dashed var(--border-color)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "24px" }}>📄</span>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                  Lienzo Vacío
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Comienza desde cero con un lienzo limpio.
                </p>
              </div>
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="template-card"
                  onClick={() => {
                    handleCreateBoard(tmpl.id);
                    setShowTemplatesModal(false);
                  }}
                  style={{
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                    padding: "1.25rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{tmpl.icon}</span>
                  <h4
                    style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}
                  >
                    {tmpl.name}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {tmpl.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowTemplatesModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Board Modal */}
      {showMoveModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Mover Tablero</h3>
            <p
              style={{
                margin: "0.5rem 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Selecciona la carpeta de destino para este tablero:
            </p>
            <div className="form-group">
              <label>Carpeta:</label>
              <select
                value={selectedFolderForMove || ""}
                onChange={(e) =>
                  setSelectedFolderForMove(e.target.value || null)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">(Sin carpeta / Raíz)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowMoveModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleMoveBoardConfirm}>
                Mover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Nueva Carpeta</h3>
            <div className="form-group">
              <label>Nombre de la Carpeta:</label>
              <input
                type="text"
                placeholder="Escribe el nombre aquí..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCreateFolderConfirm()
                }
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateFolderModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreateFolderConfirm}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPromptModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Tablero Protegido</h3>
            <p
              style={{
                margin: "0.5rem 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Este tablero está protegido con contraseña. Por favor, introdúcela
              para abrirlo:
            </p>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                placeholder="Contraseña..."
                value={passwordPromptInput}
                onChange={(e) => setPasswordPromptInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handlePasswordPromptConfirm()
                }
                autoFocus
              />
              {passwordPromptError && (
                <div
                  style={{
                    color: "var(--danger-color)",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {passwordPromptError}
                </div>
              )}
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowPasswordPromptModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={handlePasswordPromptConfirm}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Set Modal */}
      {showPasswordSetModal && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Proteger Tablero</h3>
            <p
              style={{
                margin: "0.5rem 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Introduce una contraseña para proteger este tablero. Déjalo en
              blanco para quitar la protección:
            </p>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                placeholder="Escribe la contraseña aquí..."
                value={passwordSetInput}
                onChange={(e) => setPasswordSetInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handlePasswordSetConfirm()
                }
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowPasswordSetModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={handlePasswordSetConfirm}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ maxWidth: "500px" }}>
            <h3>Historial de Versiones</h3>
            <p
              style={{
                margin: "0.5rem 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Restaura este tablero a una versión anterior. Se guardará la
              versión actual como un punto nuevo en el historial.
            </p>
            <div className="versions-list">
              {boardVersions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    padding: "20px",
                  }}
                >
                  No hay versiones guardadas para este tablero todavía.
                </div>
              ) : (
                boardVersions.map((version, index) => (
                  <div
                    key={version.id}
                    className="version-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 15px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                        }}
                      >
                        Versión {boardVersions.length - index}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          marginTop: "2px",
                        }}
                      >
                        {new Date(version.timestamp).toLocaleString()} (
                        {version.elementsCount} elementos)
                      </div>
                    </div>
                    <button
                      className="btn-confirm"
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        width: "auto",
                      }}
                      onClick={() => handleRestoreVersion(version.id)}
                    >
                      Restaurar
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowHistoryModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

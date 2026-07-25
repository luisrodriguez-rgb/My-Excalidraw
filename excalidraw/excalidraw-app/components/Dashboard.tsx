import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  getBoardsMetadata,
  saveBoard,
  deleteBoard,
  deleteBoardPermanently,
  restoreBoard,
  duplicateBoard,
  getFolders,
  createFolder,
  deleteFolder,
  getBoardVersions,
  restoreBoardVersion,
  syncBoardsWithSupabase,
} from "../data/boardsDb";
import { TEMPLATES } from "../data/templates";
import { supabase } from "../data/supabaseClient";

import { AuthModal } from "./AuthModal";

import "./Dashboard.scss";

import type { BoardMetadata, BoardVersion, Folder } from "../data/boardsDb";

interface DashboardProps {
  onSelectBoard: (boardId: string) => void;
  onJoinRoom: (roomUrl: string) => void;
}

// Vector SVG Icons replacing all emojis for professional workspace UI
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TemplateIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SyncIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ImportIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const LaptopIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="20" x2="22" y2="20" />
    <line x1="12" y1="17" x2="12" y2="20" />
  </svg>
);

const NotesIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CanvasIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

const PenIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectBoard,
  onJoinRoom,
}) => {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("excalidraw-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  // Navigation and Tab States
  const [activeTab, setActiveTab] = useState<"recientes" | "favoritos" | "compartidos" | "papelera">("recientes");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showOnlyTemplates, setShowOnlyTemplates] = useState(false);
  const [sortOption, setSortOption] = useState<"updated" | "created" | "name">("updated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dropdown States
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Modal States
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomUrlInput, setRoomUrlInput] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardIdToDelete, setBoardIdToDelete] = useState<string | null>(null);
  const [boardNameToDelete, setBoardNameToDelete] = useState("");

  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const [session, setSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedFolderForMove, setSelectedFolderForMove] = useState<string | null>(null);

  const [showPasswordPromptModal, setShowPasswordPromptModal] = useState(false);
  const [passwordPromptInput, setPasswordPromptInput] = useState("");
  const [passwordPromptError, setPasswordPromptError] = useState("");
  const [boardIdToPrompt, setBoardIdToPrompt] = useState<string | null>(null);
  const [correctPassword, setCorrectPassword] = useState("");

  const [showPasswordSetModal, setShowPasswordSetModal] = useState(false);
  const [passwordSetInput, setPasswordSetInput] = useState("");

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [boardVersions, setBoardVersions] = useState<BoardVersion[]>([]);
  const [boardIdForHistory, setBoardIdForHistory] = useState<string | null>(null);

  // Folders list length management
  const [showAllFolders, setShowAllFolders] = useState(false);

  // Refs for clicking outside menus
  const quickAddRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  const handleTriggerSync = useCallback(async () => {
    setSyncing(true);
    await syncBoardsWithSupabase();
    await loadBoards();
    setSyncing(false);
  }, []);

  useEffect(() => {
    loadBoards();

    // Initialize Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        handleTriggerSync();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        handleTriggerSync();
      } else {
        loadBoards();
      }
    });

    return () => subscription.unsubscribe();
  }, [handleTriggerSync]);

  // Click outside menus to close them
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setShowQuickAddMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (cardMenuRef.current && !cardMenuRef.current.contains(e.target as Node)) {
        setActiveCardMenuId(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Supabase Realtime: auto-refresh board list when any board changes remotely
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-boards-realtime")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "boards" },
        () => {
          syncBoardsWithSupabase().then(() => loadBoards());
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBoards = async () => {
    const list = await getBoardsMetadata();
    setBoards(list);
    const folderList = await getFolders();
    setFolders(folderList);
  };

  const handleCreateBoard = async (templateId: string | null = null) => {
    const id = `board_${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;
    let name = `Workspace ${boards.filter(b => !b.isDeleted).length + 1}`;
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
      if (activeTab === "papelera") {
        await deleteBoardPermanently(boardIdToDelete);
      } else {
        await deleteBoard(boardIdToDelete);
      }
      setShowDeleteModal(false);
      setBoardIdToDelete(null);
      loadBoards();
    }
  };

  const handleRestore = async (id: string) => {
    await restoreBoard(id);
    loadBoards();
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

  const get = async (key: string): Promise<any> => {
    const { get: idbGet, createStore } = await import("idb-keyval");
    const boardsStore = createStore("excalidraw-boards-db", "boards-store");
    return idbGet(key, boardsStore);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        const name = file.name.replace(/\.excalidraw$|\.json$/, "") || "Tablero Importado";
        const id = `board_${crypto.randomUUID().replace(/-/g, "").substring(0, 12)}`;

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

  const toggleFavorite = async (boardId: string, currentVal?: boolean) => {
    await saveBoard(boardId, { isFavorite: !currentVal });
    loadBoards();
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

  const handleToggleTemplate = async (id: string, isTemplate: boolean) => {
    await saveBoard(id, { isTemplate });
    loadBoards();
  };

  const handleCreateFromTemplate = async (id: string, name: string) => {
    const newId = await duplicateBoard(id, `${name}`);
    await saveBoard(newId, { isTemplate: false });
    onSelectBoard(newId);
  };

  const handleOpenBoard = async (board: BoardMetadata) => {
    if (board.isDeleted) return;

    if (board.isTemplate) {
      const useTemplate = window.confirm(
        `¿Deseas crear un nuevo tablero basado en la plantilla "${board.name}"?\n\n(Haz clic en "Cancelar" si prefieres editar el diseño original de la plantilla directamente).`
      );
      if (useTemplate) {
        await handleCreateFromTemplate(board.id, board.name);
        return;
      }
    }

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

  // Filtering & Sorting logic
  const filteredBoards = boards.filter((b) => {
    // 1. Search Query Match
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Folder Match (when not showing templates/trash/favorites)
    if (showOnlyTemplates) {
      return matchesSearch && !!b.isTemplate && !b.isDeleted;
    }

    if (activeTab === "papelera") {
      return matchesSearch && !!b.isDeleted;
    }

    // Boards in active workspace
    const isDeleted = !!b.isDeleted;
    if (isDeleted) return false;

    // Tab checks
    if (activeTab === "favoritos" && !b.isFavorite) return false;
    if (activeTab === "compartidos" && !b.isCollaboration) return false;

    // Folder check
    const matchesFolder = activeFolderId ? b.folderId === activeFolderId : true;
    return matchesSearch && matchesFolder && !b.isTemplate;
  });

  // Sorting
  const sortedBoards = [...filteredBoards].sort((a, b) => {
    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === "created") {
      return b.createdAt - a.createdAt;
    }
    return b.updatedAt - a.updatedAt;
  });

  // Dynamic statistics
  const countBoards = boards.filter((b) => !b.isDeleted && !b.isTemplate).length;
  const countFolders = folders.length;
  const countNotes = boards.reduce((acc, b) => acc + (b.notesCount || 0), 0);
  const countCollabs = Math.max(3, boards.filter((b) => b.isCollaboration).length * 2 + 1);

  // User avatar display
  const userDisplayName = session?.user?.email
    ? session.user.email.split("@")[0].charAt(0).toUpperCase() + session.user.email.split("@")[0].slice(1)
    : "Luis";
  const userInitials = userDisplayName.charAt(0).toUpperCase();

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const visibleFolders = showAllFolders ? folders : folders.slice(0, 4);

  return (
    <div className={`workspace-dashboard theme-${theme}`}>
      {/* 1. Sidebar Notion-Style */}
      <aside className="dashboard-sidebar">
        <div className="logo-section">
          <img src="/logo-custom-small.png" alt="Logo" className="logo-img" />
          <div className="logo-text">
            <h2>Excalidraw</h2>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activeTab === "recientes" && activeFolderId === null && !showOnlyTemplates ? "active" : ""}`}
            onClick={() => {
              setActiveTab("recientes");
              setActiveFolderId(null);
              setShowOnlyTemplates(false);
            }}
          >
            <span className="nav-icon"><HomeIcon /></span>
            <span className="nav-text">Inicio</span>
          </button>

          <button
            className={`nav-link ${showOnlyTemplates ? "active" : ""}`}
            onClick={() => {
              setShowOnlyTemplates(true);
              setActiveFolderId(null);
            }}
          >
            <span className="nav-icon"><TemplateIcon /></span>
            <span className="nav-text">Plantillas</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <div className="section-header">
            <span>MI ESPACIO</span>
            <button
              className="btn-add-section"
              onClick={() => setShowCreateFolderModal(true)}
              title="Crear carpeta"
            >
              +
            </button>
          </div>

          <div className="folders-list">
            {visibleFolders.map((folder) => (
              <button
                key={folder.id}
                className={`folder-link ${activeFolderId === folder.id ? "active" : ""}`}
                onClick={() => {
                  setActiveFolderId(folder.id);
                  setShowOnlyTemplates(false);
                  setActiveTab("recientes");
                }}
              >
                <span className="folder-icon"><FolderIcon /></span>
                <span className="folder-name-text">{folder.name}</span>
                <span
                  className="folder-delete-action"
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
                  ✕
                </span>
              </button>
            ))}

            {folders.length > 4 && (
              <button
                className="show-more-link"
                onClick={() => setShowAllFolders(!showAllFolders)}
              >
                {showAllFolders ? "Mostrar menos" : "Mostrar más"}
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-bottom-nav">
          <button
            className={`nav-link ${activeTab === "favoritos" && activeFolderId === null && !showOnlyTemplates ? "active" : ""}`}
            onClick={() => {
              setActiveTab("favoritos");
              setActiveFolderId(null);
              setShowOnlyTemplates(false);
            }}
          >
            <span className="nav-icon"><StarIcon /></span>
            <span className="nav-text">Favoritos</span>
          </button>

          <button
            className={`nav-link ${activeTab === "compartidos" && activeFolderId === null && !showOnlyTemplates ? "active" : ""}`}
            onClick={() => {
              setActiveTab("compartidos");
              setActiveFolderId(null);
              setShowOnlyTemplates(false);
            }}
          >
            <span className="nav-icon"><GroupIcon /></span>
            <span className="nav-text">Compartidos conmigo</span>
          </button>

          <button
            className={`nav-link ${activeTab === "papelera" && activeFolderId === null && !showOnlyTemplates ? "active" : ""}`}
            onClick={() => {
              setActiveTab("papelera");
              setActiveFolderId(null);
              setShowOnlyTemplates(false);
            }}
          >
            <span className="nav-icon"><TrashIcon /></span>
            <span className="nav-text">Papelera</span>
          </button>
        </div>

        {/* Storage status widget */}
        <div className="storage-widget">
          <span className="storage-title">Almacenamiento</span>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: "24%" }} />
          </div>
          <span className="storage-text">2.4 GB de 10 GB utilizados</span>
          <button className="storage-link">Gestionar plan →</button>
        </div>
      </aside>

      {/* 2. Main Area Panel */}
      <div className="dashboard-main-area">
        {/* Top Header widgets & User Profile */}
        <div className="top-widgets-bar">
          <div className="top-search-field">
            <span className="search-field-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Buscar en todo el espacio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="widget-icon-btn" title="Ayuda y atajos"><HelpIcon /></button>
            <button className="widget-icon-btn notifications-btn" title="Notificaciones">
              <span><BellIcon /></span>
              <span className="notification-badge">3</span>
            </button>
            <button className="widget-icon-btn" onClick={toggleTheme} title="Cambiar tema">
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>

            {session && (
              <button
                className="widget-icon-btn sync-boards-btn"
                onClick={handleTriggerSync}
                disabled={syncing}
                title="Sincronizar con la nube"
              >
                <span className={syncing ? "spin-animation" : ""}><SyncIcon /></span>
              </button>
            )}

            {/* User Profile menu */}
            <div className="user-profile-menu-container" ref={userMenuRef}>
              <div className="user-profile-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar-circle">{userInitials}</div>
                <div className="user-details">
                  <span className="username">{userDisplayName}</span>
                  <span className="user-email">{session?.user?.email || "Invitado"}</span>
                </div>
              </div>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  {session ? (
                    <>
                      <div className="dropdown-info">Conectado a la Nube <CloudIcon /></div>
                      <button className="dropdown-item" onClick={() => supabase.auth.signOut()}>
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropdown-info">Modo Local (Invitado)</div>
                      <button className="dropdown-item primary" onClick={() => setShowAuthModal(true)}>
                        Iniciar Sesión / Registrarse
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Create Actions */}
            <div className="create-actions-group" ref={quickAddRef}>
              <button className="btn-create-board" onClick={() => handleCreateBoard()}>
                + Nuevo tablero
              </button>
              <button
                className="btn-create-dropdown-trigger"
                onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              >
                +
              </button>

              {showQuickAddMenu && (
                <div className="quick-add-dropdown-menu">
                  <button
                    className="quick-item"
                    onClick={() => {
                      handleCreateBoard();
                      setShowQuickAddMenu(false);
                    }}
                  >
                    <span><DocumentIcon /></span> Nuevo tablero
                  </button>
                  <button
                    className="quick-item"
                    onClick={() => {
                      document.getElementById("quick-import-file")?.click();
                      setShowQuickAddMenu(false);
                    }}
                  >
                    <span><ImportIcon /></span> Importar .excalidraw
                  </button>
                  <input
                    type="file"
                    id="quick-import-file"
                    accept=".excalidraw,.json"
                    style={{ display: "none" }}
                    onChange={handleImport}
                  />
                  <button
                    className="quick-item"
                    onClick={() => {
                      setShowCreateFolderModal(true);
                      setShowQuickAddMenu(false);
                    }}
                  >
                    <span><FolderIcon /></span> Crear carpeta
                  </button>
                  <button
                    className="quick-item"
                    onClick={() => {
                      setShowTemplatesModal(true);
                      setShowQuickAddMenu(false);
                    }}
                  >
                    <span><TemplateIcon /></span> Crear desde plantilla
                  </button>
                  <button
                    className="quick-item"
                    onClick={() => {
                      setShowJoinModal(true);
                      setShowQuickAddMenu(false);
                    }}
                  >
                    <span><GroupIcon /></span> Unirse a sala colaborativa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-banner-premium">
          <h2>Buenos días, {userDisplayName}</h2>
          <p>Aquí tienes un resumen de tu espacio de trabajo.</p>
        </div>

        {/* Stats Grid Widget */}
        <div className="stats-dashboard-grid">
          <div className="stat-card board-count-card">
            <div className="stat-icon"><CanvasIcon /></div>
            <div className="stat-details">
              <h3>{countBoards}</h3>
              <span>Tableros</span>
            </div>
          </div>

          <div className="stat-card folder-count-card">
            <div className="stat-icon"><FolderIcon /></div>
            <div className="stat-details">
              <h3>{countFolders}</h3>
              <span>Carpetas</span>
            </div>
          </div>

          <div className="stat-card notes-count-card">
            <div className="stat-icon"><NotesIcon /></div>
            <div className="stat-details">
              <h3>{countNotes}</h3>
              <span>Notas</span>
            </div>
          </div>

          <div className="stat-card collabs-count-card">
            <div className="stat-icon"><GroupIcon /></div>
            <div className="stat-details">
              <h3>{countCollabs}</h3>
              <span>Colaboradores</span>
            </div>
          </div>
        </div>

        {/* Subnavigation Tabs */}
        <div className="subnav-tabs-bar">
          <div className="tab-items">
            <button
              className={`tab-btn ${activeTab === "recientes" && activeFolderId === null && !showOnlyTemplates ? "active" : ""}`}
              onClick={() => {
                setActiveTab("recientes");
                setActiveFolderId(null);
                setShowOnlyTemplates(false);
              }}
            >
              Recientes
            </button>
            <button
              className={`tab-btn ${activeTab === "favoritos" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("favoritos");
                setActiveFolderId(null);
                setShowOnlyTemplates(false);
              }}
            >
              Favoritos
            </button>
            <button
              className={`tab-btn ${activeTab === "compartidos" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("compartidos");
                setActiveFolderId(null);
                setShowOnlyTemplates(false);
              }}
            >
              Compartidos conmigo
            </button>
            <button
              className={`tab-btn ${activeTab === "papelera" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("papelera");
                setActiveFolderId(null);
                setShowOnlyTemplates(false);
              }}
            >
              Papelera
            </button>
          </div>
        </div>

        {/* Search, Sort and Grid Toggles */}
        <div className="filters-controls-row">
          <div className="search-box-input">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Buscar tableros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="controls-right-side">
            <div className="filter-dropdown-select">
              <select
                value={activeFolderId || ""}
                onChange={(e) => {
                  setActiveFolderId(e.target.value || null);
                  setShowOnlyTemplates(false);
                }}
              >
                <option value="">Todos los tableros</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-dropdown-select">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
              >
                <option value="updated">Última modificación</option>
                <option value="created">Fecha de creación</option>
                <option value="name">Alfabético</option>
              </select>
            </div>

            <div className="view-mode-toggles">
              <button
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Vista Cuadrícula"
              >
                <GridIcon />
              </button>
              <button
                className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="Vista Lista"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Boards Grid or List View */}
        {sortedBoards.length > 0 ? (
          <div className={`boards-${viewMode}-layout`}>
            {sortedBoards.map((board) => {
              const dateText = `Actualizado ${
                Date.now() - board.updatedAt < 60000
                  ? "hace un momento"
                  : Date.now() - board.updatedAt < 3600000
                  ? `hace ${Math.floor((Date.now() - board.updatedAt) / 60000)} min`
                  : `hace ${Math.floor((Date.now() - board.updatedAt) / 3600000)} horas`
              }`;

              const boardFolder = folders.find((f) => f.id === board.folderId);

              // Render active collaborator bubbles
              const collabInitials = ["A", "J", "M", "L", "S"];
              const boardCollabBubbles = collabInitials.slice(
                0,
                Math.max(1, board.id.charCodeAt(0) % 4)
              );

              return (
                <div key={board.id} className="board-card-premium">
                  {/* Card Header (Preview Area) */}
                  <div
                    className="card-preview-container"
                    onClick={() => handleOpenBoard(board)}
                  >
                    {board.preview ? (
                      <img src={board.preview} alt={board.name} className="board-preview-img" />
                    ) : (
                      <div className="board-preview-placeholder">
                        <div className="grid-bg" />
                        <span>Pizarra</span>
                      </div>
                    )}

                    {/* Star toggle action overlay */}
                    <button
                      className={`floating-star-overlay-btn ${board.isFavorite ? "favorite" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(board.id, board.isFavorite);
                      }}
                      title={board.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                      <StarIcon />
                    </button>

                    {/* Quick hover action bar */}
                    {!board.isDeleted && (
                      <div className="card-quick-actions-bar">
                        <span className="action-tag" onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBoard(board);
                        }}><EyeIcon /> Abrir</span>
                        <span className="action-tag" onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(board.id, board.isFavorite);
                        }}><StarIcon /> Favorito</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body Info */}
                  <div className="card-info-container">
                    <div className="title-row" onClick={() => handleOpenBoard(board)}>
                      <h4 className="board-card-title">
                        {board.password && <span className="lock-icon"><LockIcon /></span>}
                        {board.name}
                      </h4>

                      {/* Dropdown Options Trigger */}
                      <div className="card-menu-trigger-wrapper" ref={activeCardMenuId === board.id ? cardMenuRef : null}>
                        <button
                          className="card-menu-dots-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardMenuId(activeCardMenuId === board.id ? null : board.id);
                          }}
                        >
                          ⋮
                        </button>

                        {activeCardMenuId === board.id && (
                          <div className="board-context-dropdown-menu">
                            {board.isDeleted ? (
                              <>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    handleRestore(board.id);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Restaurar tablero
                                </button>
                                <button
                                  className="menu-item danger"
                                  onClick={() => {
                                    handleDelete(board.id, board.name);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Eliminar permanentemente
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    openRenameModal(board.id, board.name);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Renombrar
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    setSelectedBoardId(board.id);
                                    setSelectedFolderForMove(board.folderId || null);
                                    setShowMoveModal(true);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Mover a carpeta
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    openTagsModal(board.id, board.tags || []);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Etiquetas
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    handleDuplicate(board.id, board.name);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Duplicar
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    openHistoryModal(board.id);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Historial de versiones
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    handleExport(board.id, board.name);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Exportar .excalidraw
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    setSelectedBoardId(board.id);
                                    setPasswordSetInput(board.password || "");
                                    setShowPasswordSetModal(true);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  <LockIcon /> {board.password ? "Cambiar contraseña" : "Proteger con contraseña"}
                                </button>
                                <button
                                  className="menu-item"
                                  onClick={() => {
                                    handleToggleTemplate(board.id, !board.isTemplate);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  {board.isTemplate ? "Quitar de plantillas" : "Convertir en plantilla"}
                                </button>
                                <button
                                  className="menu-item danger"
                                  onClick={() => {
                                    handleDelete(board.id, board.name);
                                    setActiveCardMenuId(null);
                                  }}
                                >
                                  Mover a la Papelera
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="card-updated-date">{dateText}</span>

                    <div className="card-badges-row">
                      {session ? (
                        <span className="badge-cloud"><CloudIcon /> En la nube</span>
                      ) : (
                        <span className="badge-local"><LaptopIcon /> Local</span>
                      )}
                      {boardFolder && (
                        <span className="badge-folder"><FolderIcon /> {boardFolder.name}</span>
                      )}
                      {board.isTemplate && (
                        <span className="badge-template"><TemplateIcon /> Plantilla</span>
                      )}
                    </div>

                    {/* Metadata Counts Row */}
                    <div className="card-metadata-counts-footer">
                      <div className="counts-list">
                        <span className="count-item" title="Notas en Markdown">
                          <NotesIcon /> {board.notesCount || 0}
                        </span>
                        <span className="count-item" title="Comentarios">
                          <ChatIcon /> {board.commentsCount || 0}
                        </span>
                        <span className="count-item" title="Colaboradores">
                          <GroupIcon /> {board.isCollaboration ? countCollabs - 2 : 1}
                        </span>
                      </div>

                      {/* Overlapping collaborator circles */}
                      {board.isCollaboration && (
                        <div className="overlapping-avatars-group">
                          {boardCollabBubbles.map((init, i) => (
                            <div
                              key={i}
                              className="collab-mini-bubble"
                              style={{
                                zIndex: 10 - i,
                                backgroundColor:
                                  i === 0
                                    ? "#6366f1"
                                    : i === 1
                                    ? "#f59e0b"
                                    : i === 2
                                    ? "#10b981"
                                    : "#ef4444",
                              }}
                            >
                              {init}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Dotted create dashboard placeholder card */}
            {activeTab !== "papelera" && !showOnlyTemplates && (
              <div
                className="board-card-premium dashed-placeholder"
                onClick={() => handleCreateBoard()}
              >
                <div className="placeholder-content">
                  <div className="plus-dashed-icon">+</div>
                  <span>Crear nuevo tablero</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state-premium">
            <span className="empty-icon"><CanvasIcon /></span>
            <h3>No se encontraron tableros</h3>
            <p>Comienza creando un tablero limpio o importa uno existente.</p>
            <button className="btn-primary" onClick={() => handleCreateBoard()}>
              Crear tablero
            </button>
          </div>
        )}

        {/* 3. Bottom Educational/Marketing Banner */}
        <div className="premium-bottom-education-banner">
          <div className="left-pink-hero-section">
            <div className="pink-icon-box"><PenIcon /></div>
            <div className="pink-hero-content">
              <h4>Escribe, planifica, crea</h4>
              <p>Usa notas en Markdown, comenta ideas y colabora en tiempo real.</p>
              <button className="pink-link-btn" onClick={() => setShowTemplatesModal(true)}>
                Descubre todas las funcionalidades →
              </button>
            </div>
          </div>

          <div className="right-details-columns">
            <div className="education-column">
              <span className="col-icon"><NotesIcon /></span>
              <h5>Notas en Markdown</h5>
              <p>Documenta tus ideas y especificaciones sin salir del tablero.</p>
            </div>

            <div className="education-column">
              <span className="col-icon"><ChatIcon /></span>
              <h5>Comentarios</h5>
              <p>Comunícate y da feedback directamente sobre el lienzo.</p>
            </div>

            <div className="education-column">
              <span className="col-icon"><GroupIcon /></span>
              <h5>Colaboración en tiempo real</h5>
              <p>Trabajen juntos de manera simultánea desde cualquier lugar.</p>
            </div>
          </div>
        </div>
      </div>

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
              <button className="btn-cancel" onClick={() => setShowRenameModal(false)}>
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
              <button className="btn-cancel" onClick={() => setShowJoinModal(false)}>
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
            <h3>{activeTab === "papelera" ? "Eliminar Permanentemente" : "Mover a la Papelera"}</h3>
            <p className="dialog-warning-text">
              {activeTab === "papelera"
                ? `¿Estás completamente seguro de que deseas eliminar de forma permanente "${boardNameToDelete}"? Esta acción no se puede deshacer y se borrará de IndexedDB y Supabase.`
                : `¿Estás seguro de que deseas mover "${boardNameToDelete}" a la Papelera? Podrás recuperarlo en cualquier momento desde la sección correspondiente.`}
            </p>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-confirm"
                style={{ backgroundColor: "var(--danger-color, #ef4444)" }}
                onClick={handleDeleteConfirm}
              >
                {activeTab === "papelera" ? "Eliminar Permanentemente" : "Mover a la Papelera"}
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
            <p className="dialog-desc">Selecciona las etiquetas para organizar este tablero:</p>
            <div className="tags-selection-list">
              {TEMPLATES.map((tmpl) => (
                <label key={tmpl.id} className="tag-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tmpl.name)}
                    onChange={() => toggleTagSelection(tmpl.name)}
                  />
                  <span className="tag-pill">{tmpl.name}</span>
                </label>
              ))}
            </div>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowTagsModal(false)}>
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
          <div className="dialog-box templates-dialog" style={{ maxWidth: "600px" }}>
            <h3>Crear Nuevo Tablero</h3>
            <p className="dialog-desc">Selecciona un punto de partida para tu tablero:</p>
            <div className="templates-grid">
              <div
                className="template-card blank"
                onClick={() => {
                  handleCreateBoard(null);
                  setShowTemplatesModal(false);
                }}
              >
                <span className="tmpl-icon"><DocumentIcon /></span>
                <h4>Lienzo Vacío</h4>
                <p>Comienza desde cero con un lienzo limpio.</p>
              </div>
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="template-card"
                  onClick={() => {
                    handleCreateBoard(tmpl.id);
                    setShowTemplatesModal(false);
                  }}
                >
                  <span className="tmpl-icon">{tmpl.icon}</span>
                  <h4>{tmpl.name}</h4>
                  <p>{tmpl.description}</p>
                </div>
              ))}
            </div>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowTemplatesModal(false)}>
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
            <p className="dialog-desc">Selecciona la carpeta de destino para este tablero:</p>
            <div className="form-group">
              <label>Carpeta de Destino:</label>
              <select
                value={selectedFolderForMove || ""}
                onChange={(e) => setSelectedFolderForMove(e.target.value || null)}
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
              <button className="btn-cancel" onClick={() => setShowMoveModal(false)}>
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
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolderConfirm()}
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowCreateFolderModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleCreateFolderConfirm}>
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
            <p className="dialog-desc">Por favor, introduce la contraseña para abrirlo:</p>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                placeholder="Contraseña..."
                value={passwordPromptInput}
                onChange={(e) => setPasswordPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordPromptConfirm()}
                autoFocus
              />
              {passwordPromptError && <div className="error-text">{passwordPromptError}</div>}
            </div>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowPasswordPromptModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handlePasswordPromptConfirm}>
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
            <p className="dialog-desc">Introduce una contraseña para proteger este tablero. Déjalo vacío para quitar la protección:</p>
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                placeholder="Escribe la contraseña aquí..."
                value={passwordSetInput}
                onChange={(e) => setPasswordSetInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSetConfirm()}
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowPasswordSetModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handlePasswordSetConfirm}>
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
            <p className="dialog-desc">Restaura este tablero a una versión anterior. Se guardará la versión actual como un punto nuevo en el historial.</p>
            <div className="versions-list">
              {boardVersions.length === 0 ? (
                <div className="no-versions-msg">No hay versiones guardadas para este tablero todavía.</div>
              ) : (
                boardVersions.map((version, index) => (
                  <div key={version.id} className="version-item">
                    <div>
                      <div className="version-name">Versión {boardVersions.length - index}</div>
                      <div className="version-time">
                        {new Date(version.timestamp).toLocaleString()} ({version.elementsCount} elementos)
                      </div>
                    </div>
                    <button className="btn-confirm version-restore-btn" onClick={() => handleRestoreVersion(version.id)}>
                      Restaurar
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={() => setShowHistoryModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleTriggerSync}
        />
      )}
    </div>
  );
};

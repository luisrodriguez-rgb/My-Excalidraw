import React, { useState, useEffect, useRef } from "react";
import "./WorkspaceCommandPalette.scss";

export interface WorkspaceCommandPaletteProps {
  activeBoardId: string | null;
  boards: Array<{ id: string; name: string; isDeleted?: boolean; isTemplate?: boolean }>;
  onSelectBoard: (boardId: string) => void;
  onNavigateTab: (tab: "recientes" | "favoritos" | "compartidos" | "papelera" | "plantillas") => void;
  onCreateBoard: (templateId: string | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onPresent?: () => void;
  onExportPNG?: () => void;
  onExportSVG?: () => void;
}

interface CommandItem {
  id: string;
  category: string;
  name: string;
  shortcut?: string;
  action: () => void;
}

export const WorkspaceCommandPalette: React.FC<WorkspaceCommandPaletteProps> = ({
  activeBoardId,
  boards,
  onSelectBoard,
  onNavigateTab,
  onCreateBoard,
  theme,
  setTheme,
  onPresent,
  onExportPNG,
  onExportSVG,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  // Global listener for CMD/CTRL + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle outside click to close
  const overlayRef = useRef<HTMLDivElement>(null);
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
    }
  };

  // Compile list of available commands
  const commands: CommandItem[] = [];

  // 1. General commands
  commands.push({
    id: "new-board",
    category: "General",
    name: "Crear Nuevo Lienzo Vacío",
    shortcut: "N",
    action: () => {
      onCreateBoard(null);
      setIsOpen(false);
    },
  });

  commands.push({
    id: "toggle-theme",
    category: "General",
    name: `Cambiar a Modo ${theme === "light" ? "Oscuro" : "Claro"}`,
    shortcut: "T",
    action: () => {
      setTheme(theme === "light" ? "dark" : "light");
      setIsOpen(false);
    },
  });

  // Navigation commands (mostly useful when on Dashboard or generally)
  commands.push({
    id: "go-recientes",
    category: "Navegación",
    name: "Ir a Tableros Recientes",
    action: () => {
      onNavigateTab("recientes");
      setIsOpen(false);
    },
  });

  commands.push({
    id: "go-favoritos",
    category: "Navegación",
    name: "Ir a Favoritos",
    action: () => {
      onNavigateTab("favoritos");
      setIsOpen(false);
    },
  });

  commands.push({
    id: "go-plantillas",
    category: "Navegación",
    name: "Ver Galería de Plantillas",
    action: () => {
      onNavigateTab("plantillas");
      setIsOpen(false);
    },
  });

  commands.push({
    id: "go-papelera",
    category: "Navegación",
    name: "Ver Papelera de Reciclaje",
    action: () => {
      onNavigateTab("papelera");
      setIsOpen(false);
    },
  });

  // Editor-specific commands
  if (activeBoardId) {
    if (onPresent) {
      commands.push({
        id: "editor-present",
        category: "Presentación & Exportación",
        name: "Iniciar Modo Presentación",
        shortcut: "P",
        action: () => {
          onPresent();
          setIsOpen(false);
        },
      });
    }

    if (onExportPNG) {
      commands.push({
        id: "export-png",
        category: "Presentación & Exportación",
        name: "Exportar como Imagen PNG",
        action: () => {
          onExportPNG();
          setIsOpen(false);
        },
      });
    }

    if (onExportSVG) {
      commands.push({
        id: "export-svg",
        category: "Presentación & Exportación",
        name: "Exportar como Vectorial SVG",
        action: () => {
          onExportSVG();
          setIsOpen(false);
        },
      });
    }

    // Insert templates directly
    commands.push({
      id: "insert-kanban",
      category: "Insertar Plantilla Rápida",
      name: "Insertar Tablero Kanban",
      action: () => {
        onCreateBoard("kanban");
        setIsOpen(false);
      },
    });

    commands.push({
      id: "insert-swot",
      category: "Insertar Plantilla Rápida",
      name: "Insertar FODA / SWOT",
      action: () => {
        onCreateBoard("swot");
        setIsOpen(false);
      },
    });

    commands.push({
      id: "insert-roadmap",
      category: "Insertar Plantilla Rápida",
      name: "Insertar Roadmap de Producto",
      action: () => {
        onCreateBoard("roadmap");
        setIsOpen(false);
      },
    });
  }

  // 2. Search boards (dynamically listed under category "Tableros")
  const activeBoards = boards.filter((b) => !b.isDeleted && !b.isTemplate);
  activeBoards.forEach((board) => {
    commands.push({
      id: `open-board-${board.id}`,
      category: "Abrir Tablero",
      name: board.name || "Sin título",
      action: () => {
        onSelectBoard(board.id);
        setIsOpen(false);
      },
    });
  });

  // Filter commands by search term
  const filteredCommands = commands.filter((cmd) => {
    const term = search.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(term) ||
      cmd.category.toLowerCase().includes(term)
    );
  });

  // Handle arrow keys and enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (itemsContainerRef.current) {
      const selectedElement = itemsContainerRef.current.querySelector(".command-item.selected");
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group commands by category for display
  const grouped: { [key: string]: CommandItem[] } = {};
  filteredCommands.forEach((cmd) => {
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push(cmd);
  });

  // Flattened order list to match selectedIndex
  let flatIndex = 0;

  return (
    <div className="command-palette-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="command-palette-container" onKeyDown={handleKeyDown}>
        <div className="command-palette-search">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe un comando o busca un tablero..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="esc-badge">ESC</span>
        </div>

        <div className="command-palette-body" ref={itemsContainerRef}>
          {filteredCommands.length === 0 ? (
            <div className="no-commands-found">
              No se encontraron comandos ni tableros coincidentes.
            </div>
          ) : (
            Object.keys(grouped).map((category) => (
              <div key={category} className="command-group">
                <div className="command-group-title">{category}</div>
                <div className="command-group-list">
                  {grouped[category].map((cmd) => {
                    const currentFlatIndex = flatIndex++;
                    const isSelected = currentFlatIndex === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        className={`command-item ${isSelected ? "selected" : ""}`}
                        onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                        onClick={cmd.action}
                      >
                        <span className="command-name">{cmd.name}</span>
                        {cmd.shortcut && (
                          <span className="command-shortcut">{cmd.shortcut}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <span>↑↓ Navegar</span>
          <span>↵ Seleccionar</span>
          <span>CMD + K Cerrar</span>
        </div>
      </div>
    </div>
  );
};

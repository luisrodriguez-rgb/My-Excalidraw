/**
 * libParser.ts — Parser y Adaptador de Librerías Vectoriales (.excalidrawlib)
 * Procesa componentes vectoriales oficiales y los adapta a los 9 Motores Visuales Canónicos (DSL).
 */

export interface ExcalidrawLibraryItem {
  id: string;
  status: "published" | "unpublished";
  elements: any[];
  created: number;
  name?: string;
}

export interface LibraryParseResult {
  libraryItems: ExcalidrawLibraryItem[];
  elementsCount: number;
  engineMapping?: string;
}

/**
 * Parsea el contenido raw (JSON) de un archivo .excalidrawlib
 */
export const parseExcalidrawLibJSON = (
  jsonContent: string,
  targetEngine?: string,
): LibraryParseResult => {
  try {
    const data = JSON.parse(jsonContent);
    const rawItems = data.libraryItems || data.library || data || [];

    const libraryItems: ExcalidrawLibraryItem[] = [];
    let totalElements = 0;

    if (Array.isArray(rawItems)) {
      rawItems.forEach((item, index) => {
        // Soporta formatos donde item es un array de elementos o un objeto ExcalidrawLibraryItem
        const elements = Array.isArray(item) ? item : item.elements || [item];
        if (elements.length > 0) {
          totalElements += elements.length;
          libraryItems.push({
            id: item.id || `lib_item_${index}_${Date.now()}`,
            status: item.status || "published",
            elements: elements.map((el: any) => ({
              ...el,
              id: `${el.type}_${Math.random().toString(36).substring(2, 9)}`,
              seed: Math.floor(Math.random() * 100000),
              version: (el.version || 1) + 1,
            })),
            created: item.created || Date.now(),
            name: item.name || `Componente ${index + 1}`,
          });
        }
      });
    }

    return {
      libraryItems,
      elementsCount: totalElements,
      engineMapping: targetEngine,
    };
  } catch (error) {
    console.error("Error al parsear el archivo .excalidrawlib:", error);
    return {
      libraryItems: [],
      elementsCount: 0,
      engineMapping: targetEngine,
    };
  }
};

/**
 * Clona e instancia los elementos vectoriales de una librería en una posición de coordenadas (x, y) específica
 */
export const instantiateLibraryItemAt = (
  item: ExcalidrawLibraryItem,
  originX: number,
  originY: number,
  scale = 1.0,
): any[] => {
  if (!item.elements || item.elements.length === 0) return [];

  // Calcular el bounding box del grupo de elementos
  const minX = Math.min(...item.elements.map((el) => el.x || 0));
  const minY = Math.min(...item.elements.map((el) => el.y || 0));

  const baseTimestamp = Date.now();
  const groupId = `group_inst_${baseTimestamp}_${Math.random().toString(36).substring(2, 7)}`;

  return item.elements.map((el) => {
    const offsetX = (el.x - minX) * scale;
    const offsetY = (el.y - minY) * scale;

    const newElement = {
      ...el,
      id: `${el.type}_${baseTimestamp}_${Math.random().toString(36).substring(2, 9)}`,
      x: originX + offsetX,
      y: originY + offsetY,
      width: (el.width || 100) * scale,
      height: (el.height || 100) * scale,
      groupIds: [...(el.groupIds || []), groupId],
      updated: baseTimestamp,
    };

    return newElement;
  });
};

/**
 * Tabla de vinculación directa entre archivos de la carpeta Librerias_my-excalidraw y los 9 Motores Canónicos
 */
export const ENGINE_LIBRARY_MAP: Record<string, string> = {
  "canvases.excalidrawlib": "matriz",
  "customer-journey-map.excalidrawlib": "flujo",
  "basic-system-design.excalidrawlib": "red",
  "cloud-design-patterns.excalidrawlib": "red",
  "hexagonal-architecture.excalidrawlib": "red",
  "tomorrowx-composable-agentic-platform-cap.excalidrawlib": "red",
  "deep-learning.excalidrawlib": "red",
  "scrum-board.excalidrawlib": "board",
  "2022-gantt.excalidrawlib": "timeline",
  "make-your-calendar.excalidrawlib": "timeline",
  "wardley-mapping-canvas.excalidrawlib": "matriz",
  "presentation-bundle.excalidrawlib": "storyboard",
  "awesome-slides.excalidrawlib": "storyboard",
  "presentation-templates.excalidrawlib": "storyboard",
  "lo-fi-wireframing-kit.excalidrawlib": "board",
  "web-kit.excalidrawlib": "dashboard",
  "android.excalidrawlib": "dashboard",
  "3d-coordinate-systems-graphs.excalidrawlib": "dashboard",
  "math-teacher-library.excalidrawlib": "arbol",
  "mathematical-symbols.excalidrawlib": "arbol",
};

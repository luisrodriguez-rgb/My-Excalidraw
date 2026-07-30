/**
 * visualEngines.ts — Generador Paramétrico de los 9 Motores Visuales Canónicos (DSL)
 * Convierte Schemas JSON universales en elementos vectoriales nativos para My-Excalidraw.
 */

export type CanonicalEngineSlug =
  | "cerebro"
  | "flujo"
  | "red"
  | "matriz"
  | "arbol"
  | "timeline"
  | "board"
  | "dashboard"
  | "storyboard";

export interface UniversalFrameworkSchema {
  template: string;
  engine: CanonicalEngineSlug;
  title: string;
  industry?: string;
  difficulty?: "basic" | "intermediate" | "advanced";
  data?: any;
}

const createBaseRect = (x: number, y: number, w: number, h: number, custom = {}) => ({
  id: `rect_${Math.random().toString(36).substring(2, 9)}`,
  type: "rectangle",
  x,
  y,
  width: w,
  height: h,
  strokeColor: "#ef4444",
  backgroundColor: "#ffffff",
  fillStyle: "solid",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 0,
  opacity: 100,
  seed: Math.floor(Math.random() * 100000),
  version: 1,
  isDeleted: false,
  updated: Date.now(),
  ...custom,
});

const createBaseText = (x: number, y: number, text: string, fontSize = 14, custom = {}) => ({
  id: `text_${Math.random().toString(36).substring(2, 9)}`,
  type: "text",
  x,
  y,
  width: 180,
  height: 24,
  text,
  fontSize,
  fontFamily: 1,
  strokeColor: "#0f172a",
  textAlign: "center",
  verticalAlign: "middle",
  isDeleted: false,
  updated: Date.now(),
  ...custom,
});

const createBaseArrow = (x: number, y: number, points: [number, number][], custom = {}) => ({
  id: `arrow_${Math.random().toString(36).substring(2, 9)}`,
  type: "arrow",
  x,
  y,
  width: 100,
  height: 100,
  points,
  strokeColor: "#ef4444",
  strokeWidth: 2,
  isDeleted: false,
  updated: Date.now(),
  ...custom,
});

/**
 * 1. Motor MATRIZ (G) — Cuadrículas NxM y Canvas Asimétricos (SWOT, Lean Canvas, RICE)
 */
export const buildMatrixEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const cells = schema.data?.cells || [
    { title: "Cuadrante 1", row: 1, col: 1 },
    { title: "Cuadrante 2", row: 1, col: 2 },
    { title: "Cuadrante 3", row: 2, col: 1 },
    { title: "Cuadrante 4", row: 2, col: 2 },
  ];

  const cellWidth = 220;
  const cellHeight = 140;

  cells.forEach((cell: any) => {
    const x = startX + (cell.col - 1) * cellWidth;
    const y = startY + (cell.row - 1) * cellHeight;
    const w = (cell.colSpan || 1) * cellWidth;
    const h = (cell.rowSpan || 1) * cellHeight;

    const rectId = `cell_rect_${Date.now()}_${cell.row}_${cell.col}`;
    const textId = `cell_text_${Date.now()}_${cell.row}_${cell.col}`;

    elements.push(
      createBaseRect(x, y, w, h, {
        id: rectId,
        strokeColor: "#cbd5e1",
        backgroundColor: cell.bg || "#ffffff",
        boundElements: [{ id: textId, type: "text" }],
      }),
    );

    elements.push(
      createBaseText(x + 10, y + 10, cell.title, 15, {
        id: textId,
        width: w - 20,
        strokeColor: "#991b1b",
        containerId: rectId,
      }),
    );
  });

  return elements;
};

/**
 * 2. Motor BOARD (K) — Carriles Verticales y Pipelines (Kanban, Scrum, Pipelines)
 */
export const buildBoardEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const columns = schema.data?.columns || [
    { title: "Por Hacer", color: "#fee2e2" },
    { title: "En Proceso", color: "#fef3c7" },
    { title: "Completado", color: "#dcfce7" },
  ];

  const colWidth = 240;
  const colHeight = 440;

  columns.forEach((col: any, index: number) => {
    const x = startX + index * (colWidth + 30);
    elements.push(
      createBaseRect(x, startY, colWidth, 44, {
        backgroundColor: col.color || "#f8fafc",
        strokeColor: "#ef4444",
      }),
    );
    elements.push(
      createBaseText(x + 10, startY + 10, col.title, 15, {
        width: colWidth - 20,
      }),
    );
    elements.push(
      createBaseRect(x, startY + 54, colWidth, colHeight, {
        strokeColor: "#cbd5e1",
        strokeStyle: "dashed",
        backgroundColor: "#ffffff",
      }),
    );
  });

  return elements;
};

/**
 * 3. Motor FLUJO (C) — Pasos Secuenciales en Serpiente o Línea (User Journey, SOP, Process)
 */
export const buildFlujoEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const steps = schema.data?.steps || ["Inicio", "Procesar", "Verificar", "Finalizar"];

  const stepWidth = 160;
  const stepHeight = 70;

  steps.forEach((stepTitle: string, index: number) => {
    const x = startX + index * (stepWidth + 60);
    elements.push(
      createBaseRect(x, startY, stepWidth, stepHeight, {
        strokeColor: "#ef4444",
        backgroundColor: "#fef2f2",
        roundness: { type: 3 },
      }),
    );
    elements.push(
      createBaseText(x + 10, startY + 20, `${index + 1}. ${stepTitle}`, 14, {
        width: stepWidth - 20,
      }),
    );

    if (index < steps.length - 1) {
      elements.push(
        createBaseArrow(x + stepWidth, startY + stepHeight / 2, [
          [0, 0],
          [60, 0],
        ]),
      );
    }
  });

  return elements;
};

/**
 * 4. Motor TIMELINE (J) — Ejes Temporales e Hitos (Gantt, Roadmaps, Calendarios)
 */
export const buildTimelineEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const milestones = schema.data?.milestones || ["Q1: Planeación", "Q2: MVP", "Q3: Beta", "Q4: Lanzamiento"];

  const totalWidth = milestones.length * 200;

  // Eje temporal principal
  elements.push(
    createBaseArrow(startX, startY + 60, [
      [0, 0],
      [totalWidth, 0],
    ]),
  );

  milestones.forEach((m: string, idx: number) => {
    const x = startX + idx * 200;
    // Nodo del hito
    elements.push({
      id: `milestone_ellipse_${idx}`,
      type: "ellipse",
      x: x + 80,
      y: startY + 50,
      width: 20,
      height: 20,
      strokeColor: "#ef4444",
      backgroundColor: "#ef4444",
      fillStyle: "solid",
      updated: Date.now(),
    });
    // Etiqueta del hito
    elements.push(
      createBaseText(x + 10, startY, m, 14, {
        width: 160,
      }),
    );
  });

  return elements;
};

/**
 * 5. Motor RED (F) — Nodos Interconectados (System Design, Microservicios, AI RAG)
 */
export const buildRedEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const nodes = schema.data?.nodes || [
    { id: "n1", label: "API Gateway", x: startX, y: startY + 80 },
    { id: "n2", label: "Auth Service", x: startX + 220, y: startY },
    { id: "n3", label: "LLM Service", x: startX + 220, y: startY + 160 },
    { id: "n4", label: "Vector DB", x: startX + 440, y: startY + 160 },
  ];

  nodes.forEach((n: any) => {
    elements.push(
      createBaseRect(n.x, n.y, 160, 60, {
        strokeColor: "#ef4444",
        backgroundColor: "#ffffff",
        roundness: { type: 3 },
      }),
    );
    elements.push(
      createBaseText(n.x + 10, n.y + 18, n.label, 13, {
        width: 140,
      }),
    );
  });

  // Conexiones de la red
  elements.push(
    createBaseArrow(startX + 160, startY + 100, [
      [0, 0],
      [60, -60],
    ]),
  );
  elements.push(
    createBaseArrow(startX + 160, startY + 120, [
      [0, 0],
      [60, 60],
    ]),
  );
  elements.push(
    createBaseArrow(startX + 380, startY + 190, [
      [0, 0],
      [60, 0],
    ]),
  );

  return elements;
};

/**
 * 6. Motor DASHBOARD (L) — Grilla de Widgets y KPIs (KPIs, Operaciones, Finanzas)
 */
export const buildDashboardEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const widgets = schema.data?.widgets || [
    { title: "Ingresos Totales", value: "$45,200", col: 1, row: 1 },
    { title: "Usuarios Activos", value: "1,280", col: 2, row: 1 },
    { title: "Tasa de Conversión", value: "4.8%", col: 1, row: 2 },
    { title: "Satisfacción NPS", value: "92/100", col: 2, row: 2 },
  ];

  const wWidth = 220;
  const wHeight = 110;

  widgets.forEach((w: any) => {
    const x = startX + (w.col - 1) * (wWidth + 20);
    const y = startY + (w.row - 1) * (wHeight + 20);

    elements.push(
      createBaseRect(x, y, wWidth, wHeight, {
        strokeColor: "#e2e8f0",
        backgroundColor: "#f8fafc",
      }),
    );
    elements.push(
      createBaseText(x + 10, y + 15, w.title, 12, {
        width: wWidth - 20,
        strokeColor: "#64748b",
      }),
    );
    elements.push(
      createBaseText(x + 10, y + 45, w.value, 22, {
        width: wWidth - 20,
        strokeColor: "#ef4444",
      }),
    );
  });

  return elements;
};

/**
 * 7. Motor CEREBRO (A) — Hub Central con Ramificaciones Radiales (Mind Map, Vision)
 */
export const buildCerebroEngine = (schema: UniversalFrameworkSchema, startX = 250, startY = 200): any[] => {
  const elements: any[] = [];
  const coreTitle = schema.title || "Visión Central";
  const branches = schema.data?.branches || ["Objetivo A", "Objetivo B", "Objetivo C", "Objetivo D"];

  // Hub Central
  elements.push({
    id: `cerebro_hub`,
    type: "ellipse",
    x: startX,
    y: startY,
    width: 180,
    height: 90,
    strokeColor: "#ef4444",
    backgroundColor: "#fef2f2",
    fillStyle: "solid",
    strokeWidth: 2.5,
    updated: Date.now(),
  });
  elements.push(
    createBaseText(startX + 10, startY + 30, coreTitle, 16, {
      width: 160,
      strokeColor: "#991b1b",
    }),
  );

  // Ramificaciones radiales
  const radius = 220;
  branches.forEach((b: string, idx: number) => {
    const angle = (idx * 2 * Math.PI) / branches.length;
    const bx = startX + radius * Math.cos(angle);
    const by = startY + radius * Math.sin(angle);

    elements.push(
      createBaseRect(bx, by, 150, 60, {
        strokeColor: "#cbd5e1",
        backgroundColor: "#ffffff",
        roundness: { type: 3 },
      }),
    );
    elements.push(
      createBaseText(bx + 10, by + 18, b, 13, {
        width: 130,
      }),
    );
    elements.push(
      createBaseArrow(startX + 90, startY + 45, [
        [0, 0],
        [bx - startX + 20, by - startY + 20],
      ]),
    );
  });

  return elements;
};

/**
 * 8. Motor ÁRBOL (I) — Jerarquía Descendente Multicapa (Org Chart, Trees)
 */
export const buildArbolEngine = (schema: UniversalFrameworkSchema, startX = 200, startY = 100): any[] => {
  const elements: any[] = [];
  const rootTitle = schema.title || "Líder / Raíz";
  const children = schema.data?.children || ["Rama 1", "Rama 2", "Rama 3"];

  // Raíz
  elements.push(
    createBaseRect(startX + 120, startY, 180, 60, {
      backgroundColor: "#fef2f2",
      strokeColor: "#ef4444",
    }),
  );
  elements.push(
    createBaseText(startX + 130, startY + 18, rootTitle, 15, {
      width: 160,
    }),
  );

  // Nivel 2
  children.forEach((cTitle: string, idx: number) => {
    const cx = startX + idx * 200;
    const cy = startY + 140;

    elements.push(
      createBaseRect(cx, cy, 160, 50, {
        strokeColor: "#cbd5e1",
      }),
    );
    elements.push(
      createBaseText(cx + 10, cy + 14, cTitle, 13, {
        width: 140,
      }),
    );
    elements.push(
      createBaseArrow(startX + 210, startY + 60, [
        [0, 0],
        [cx - startX - 130, 80],
      ]),
    );
  });

  return elements;
};

/**
 * 9. Motor STORYBOARD (M) — Secuencia de Frames de Diapositiva (Pitch Deck, Slides)
 */
export const buildStoryboardEngine = (schema: UniversalFrameworkSchema, startX = 100, startY = 100): any[] => {
  const elements: any[] = [];
  const slides = schema.data?.slides || ["1. Portada", "2. Problema", "3. Solución", "4. Cierre"];

  const slideW = 320;
  const slideH = 200;

  slides.forEach((sTitle: string, idx: number) => {
    const x = startX + (idx % 2) * (slideW + 40);
    const y = startY + Math.floor(idx / 2) * (slideH + 40);

    // Frame exterior estilo diapositiva
    elements.push(
      createBaseRect(x, y, slideW, slideH, {
        strokeColor: "#ef4444",
        backgroundColor: "#ffffff",
        strokeWidth: 2,
      }),
    );
    // Encabezado del Slide
    elements.push(
      createBaseText(x + 20, y + 15, sTitle, 16, {
        width: slideW - 40,
        strokeColor: "#991b1b",
      }),
    );
    // Marcador interior
    elements.push(
      createBaseRect(x + 20, y + 50, slideW - 40, slideH - 70, {
        strokeColor: "#e2e8f0",
        strokeStyle: "dashed",
        backgroundColor: "#f8fafc",
      }),
    );
  });

  return elements;
};

/**
 * Función Despachadora Universal para los 9 Motores Canónicos
 */
export const renderCanonicalEngine = (
  schema: UniversalFrameworkSchema,
  startX = 100,
  startY = 100,
): any[] => {
  switch (schema.engine) {
    case "matriz":
      return buildMatrixEngine(schema, startX, startY);
    case "board":
      return buildBoardEngine(schema, startX, startY);
    case "flujo":
      return buildFlujoEngine(schema, startX, startY);
    case "timeline":
      return buildTimelineEngine(schema, startX, startY);
    case "red":
      return buildRedEngine(schema, startX, startY);
    case "dashboard":
      return buildDashboardEngine(schema, startX, startY);
    case "cerebro":
      return buildCerebroEngine(schema, startX, startY);
    case "arbol":
      return buildArbolEngine(schema, startX, startY);
    case "storyboard":
      return buildStoryboardEngine(schema, startX, startY);
    default:
      return buildMatrixEngine(schema, startX, startY);
  }
};

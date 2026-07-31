/**
 * mermaidConverter.ts — Conversor de Código Mermaid a Diagramas Vectoriales
 * Parsea código Mermaid.js y genera elementos vectoriales dinámicos nativos en Excalidraw.
 */

export interface MermaidParseResult {
  diagramType: "flowchart" | "sequence" | "unknown";
  nodes: { id: string; label: string }[];
  connections: { from: string; to: string }[];
  elements: any[];
}

/**
 * Parsea un bloque de código Mermaid y lo convierte en elementos vectoriales interactivos del canvas
 */
export const convertMermaidToCanvas = (
  mermaidCode: string,
  startX = 150,
  startY = 150,
): MermaidParseResult => {
  const lines = mermaidCode.trim().split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const nodesMap = new Map<string, string>();
  const connections: { from: string; to: string }[] = [];

  let diagramType: "flowchart" | "sequence" | "unknown" = "unknown";

  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes("graph") || firstLine.includes("flowchart")) {
      diagramType = "flowchart";
    } else if (firstLine.includes("sequencediagram")) {
      diagramType = "sequence";
    }
  }

  // Parsear nodos y conexiones
  lines.forEach((line) => {
    // Detectar conexiones: A --> B o A[Texto] --> B[Texto] o A -->|Texto| B
    if (line.includes("-->") || line.includes("->")) {
      const parts = line.split(/-->|->/);
      if (parts.length >= 2) {
        const fromRaw = parts[0].trim();
        const toRaw = parts[1].trim();

        const parseNode = (raw: string) => {
          // Remover flechas intermedias o textos de aristas tipo |texto|
          let cleaned = raw;
          if (raw.startsWith("|")) {
            const endIdx = raw.indexOf("|", 1);
            if (endIdx !== -1) {
              cleaned = raw.substring(endIdx + 1).trim();
            }
          }
          const match = cleaned.match(/([A-Za-z0-9_]+)(\[([^\]]+)\])?/);
          if (match) {
            const id = match[1];
            const label = match[3] || match[1];
            nodesMap.set(id, label);
            return id;
          }
          return cleaned;
        };

        const fromId = parseNode(fromRaw);
        const toId = parseNode(toRaw);
        connections.push({ from: fromId, to: toId });
      }
    } else {
      // Declaraciones de nodos independientes: A[Texto]
      const match = line.match(/([A-Za-z0-9_]+)\[([^\]]+)\]/);
      if (match) {
        nodesMap.set(match[1], match[2]);
      }
    }
  });

  const nodes = Array.from(nodesMap.entries()).map(([id, label]) => ({ id, label }));

  const width = 160;
  const height = 60;
  const elements: any[] = [];
  const positions = new Map<string, { x: number; y: number }>();

  // 1. Dibujar rectángulos y textos para cada nodo
  nodes.forEach((node, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = startX + col * 280;
    const y = startY + row * 160;
    positions.set(node.id, { x, y });

    const rectId = `rect-${node.id}-${Date.now()}`;
    const textId = `text-${node.id}-${Date.now()}`;

    // Rectángulo nativo
    elements.push({
      type: "rectangle" as any,
      id: rectId,
      x,
      y,
      width,
      height,
      strokeColor: "#ef4444",
      backgroundColor: "#fef2f2",
      fillStyle: "solid" as any,
      strokeWidth: 2,
      strokeStyle: "solid" as any,
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 } as any,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      isDeleted: false,
      updated: Date.now(),
      boundElements: [{ id: textId, type: "text" as any }],
    });

    // Texto descriptivo centrado
    elements.push({
      type: "text" as any,
      id: textId,
      x: x + 10,
      y: y + 18,
      width: width - 20,
      height: 24,
      text: node.label,
      fontSize: 14,
      fontFamily: 1,
      textAlign: "center" as any,
      verticalAlign: "middle" as any,
      containerId: rectId,
      strokeColor: "#1e293b",
      backgroundColor: "transparent",
      fillStyle: "solid" as any,
      strokeWidth: 1,
      strokeStyle: "solid" as any,
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      isDeleted: false,
      updated: Date.now(),
      lineHeight: 1.25 as any,
      autoResize: true,
    });
  });

  // 2. Dibujar flechas de conexión borde-a-borde reales
  connections.forEach((conn, index) => {
    const fromPos = positions.get(conn.from);
    const toPos = positions.get(conn.to);
    if (!fromPos || !toPos) return;

    const cx1 = fromPos.x + width / 2;
    const cy1 = fromPos.y + height / 2;
    const cx2 = toPos.x + width / 2;
    const cy2 = toPos.y + height / 2;

    let startX_arrow = cx1;
    let startY_arrow = cy1;
    let endX_arrow = cx2;
    let endY_arrow = cy2;

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Dirección horizontal
      if (dx > 0) {
        startX_arrow = fromPos.x + width;
        endX_arrow = toPos.x;
      } else {
        startX_arrow = fromPos.x;
        endX_arrow = toPos.x + width;
      }
    } else {
      // Dirección vertical
      if (dy > 0) {
        startY_arrow = fromPos.y + height;
        endY_arrow = toPos.y;
      } else {
        startY_arrow = fromPos.y;
        endY_arrow = toPos.y + height;
      }
    }

    elements.push({
      type: "arrow" as any,
      id: `arrow-${conn.from}-${conn.to}-${index}-${Date.now()}`,
      x: startX_arrow,
      y: startY_arrow,
      width: Math.abs(endX_arrow - startX_arrow),
      height: Math.abs(endY_arrow - startY_arrow),
      strokeColor: "#475569",
      strokeWidth: 2,
      strokeStyle: "solid" as any,
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 2 } as any,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      isDeleted: false,
      updated: Date.now(),
      points: [
        [0, 0],
        [endX_arrow - startX_arrow, endY_arrow - startY_arrow],
      ],
      endArrowhead: "arrow" as any,
    });
  });

  return {
    diagramType,
    nodes,
    connections,
    elements,
  };
};


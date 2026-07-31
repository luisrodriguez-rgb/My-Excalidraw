/**
 * mermaidConverter.ts — Conversor de Código Mermaid a Diagramas Vectoriales (Tier S - Módulo 4)
 * Parsea código Mermaid.js y genera elementos nativos para los 9 Motores Canónicos de My-Excalidraw.
 */

import { renderCanonicalEngine, UniversalFrameworkSchema } from "./visualEngines";

export interface MermaidParseResult {
  diagramType: "flowchart" | "sequence" | "unknown";
  nodes: { id: string; label: string }[];
  connections: { from: string; to: string }[];
  elements: any[];
}

/**
 * Parsea un bloque de código Mermaid y lo convierte en elementos vectoriales del canvas
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
    // Detectar conexiones: A --> B o A[Texto] --> B[Texto]
    if (line.includes("-->") || line.includes("->")) {
      const parts = line.split(/-->|->/);
      if (parts.length >= 2) {
        const fromRaw = parts[0].trim();
        const toRaw = parts[1].trim();

        const parseNode = (raw: string) => {
          const match = raw.match(/([A-Za-z0-9_]+)(\[([^\]]+)\])?/);
          if (match) {
            const id = match[1];
            const label = match[3] || match[1];
            nodesMap.set(id, label);
            return id;
          }
          return raw;
        };

        const fromId = parseNode(fromRaw);
        const toId = parseNode(toRaw);
        connections.push({ from: fromId, to: toId });
      }
    }
  });

  const nodes = Array.from(nodesMap.entries()).map(([id, label]) => ({ id, label }));

  // Si se detecta un diagrama de secuencia o flujo, enviarlo al Motor FLUJO o RED
  const schema: UniversalFrameworkSchema = {
    template: "mermaid_diagram",
    title: "Diagrama Mermaid",
    engine: diagramType === "sequence" ? "flujo" : "red",
    data: {
      steps: nodes.map((n) => n.label),
      nodes: nodes.map((n, idx) => ({
        id: n.id,
        label: n.label,
        x: startX + (idx % 3) * 220,
        y: startY + Math.floor(idx / 3) * 140,
      })),
    },
  };

  const elements = renderCanonicalEngine(schema, startX, startY);

  return {
    diagramType,
    nodes,
    connections,
    elements,
  };
};

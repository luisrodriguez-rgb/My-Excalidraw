const createBaseElement = (
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  custom = {},
) => {
  return {
    id: `${type}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    x,
    y,
    width,
    height,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    updated: Date.now(),
    link: null,
    locked: false,
    ...custom,
  };
};

const createRectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  custom = {},
) => {
  return createBaseElement("rectangle", x, y, width, height, custom);
};

const createText = (
  x: number,
  y: number,
  text: string,
  fontSize = 20,
  custom = {},
) => {
  return createBaseElement("text", x, y, 200, 40, {
    text,
    fontSize,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    ...custom,
  });
};

const createArrow = (
  x: number,
  y: number,
  points: [number, number][],
  custom = {},
) => {
  return createBaseElement("arrow", x, y, 100, 100, {
    points,
    ...custom,
  });
};

const wrapText = (text: string, maxLen = 25): string => {
  if (!text) return "";
  const words = text.split(" ");
  let currentLine = "";
  const lines: string[] = [];

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length > maxLen) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.join("\n");
};

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "Business & Strategy" | "Product & Engineering" | "Design & UI";
  getElements: (content?: Record<string, any>) => any[];
}

export const TEMPLATES: Template[] = [
  {
    id: "kanban",
    name: "Tablero Kanban",
    description: "Organiza tus tareas en columnas de Por Hacer, En Proceso y Listo.",
    icon: "📋",
    category: "Product & Engineering",
    getElements: (content?: Record<string, any>) => {
      const colWidth = 280;
      const colHeight = 500;
      const startX = 100;
      const startY = 150;
      const elements: any[] = [];

      const columns = [
        { title: "Por Hacer 📌", color: "#fee2e2", key: "todo" },
        { title: "En Proceso ⚡", color: "#fef3c7", key: "progress" },
        { title: "Listo 🎉", color: "#dcfce7", key: "done" },
      ];

      columns.forEach((col, index) => {
        const x = startX + index * (colWidth + 40);
        elements.push(
          createRectangle(x, startY, colWidth, 50, {
            backgroundColor: col.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(x, startY + 5, col.title, 18, {
            width: colWidth,
            height: 40,
          }),
        );
        elements.push(
          createRectangle(x, startY + 60, colWidth, colHeight, {
            strokeColor: "#ccc",
            strokeWidth: 1.5,
            strokeStyle: "dashed",
          }),
        );

        const cards = content?.[col.key] || (index === 0 ? ["Tarea de ejemplo\n(Doble clic para editar)"] : []);
        cards.forEach((cardText: string, cardIdx: number) => {
          const cardY = startY + 80 + cardIdx * 100;
          if (cardY + 80 < startY + 60 + colHeight) {
            elements.push(
              createRectangle(x + 15, cardY, colWidth - 30, 80, {
                backgroundColor: "#ffffff",
                fillStyle: "solid",
                strokeWidth: 1.5,
                roughness: 0.5,
              }),
            );
            elements.push(
              createText(x + 20, cardY + 15, wrapText(cardText, 25), 14, {
                width: colWidth - 40,
                height: 50,
                textAlign: "left",
              }),
            );
          }
        });
      });

      return elements;
    },
  },
  {
    id: "retro",
    name: "Retrospectiva del Equipo",
    description: "Analiza qué salió bien, qué se puede mejorar y nuevas ideas en equipo.",
    icon: "🔄",
    category: "Product & Engineering",
    getElements: (content?: Record<string, any>) => {
      const cardWidth = 320;
      const cardHeight = 400;
      const startX = 100;
      const startY = 150;
      const elements: any[] = [];

      const categories = [
        { title: "Qué Salió Bien 👍", color: "#dcfce7", key: "well" },
        { title: "Qué Mejorar 👎", color: "#fee2e2", key: "improve" },
        { title: "Ideas y Sugerencias 💡", color: "#e0f2fe", key: "ideas" },
      ];

      categories.forEach((cat, index) => {
        const x = startX + index * (cardWidth + 40);
        elements.push(
          createRectangle(x, startY, cardWidth, 50, {
            backgroundColor: cat.color,
            fillStyle: "solid",
            strokeWidth: 2,
          }),
        );
        elements.push(
          createText(x, startY + 5, cat.title, 18, {
            width: cardWidth,
            height: 40,
          }),
        );
        elements.push(
          createRectangle(x, startY + 60, cardWidth, cardHeight, {
            strokeColor: "#999",
            strokeWidth: 1.5,
          }),
        );

        const items = content?.[cat.key] || (index === 0 ? ["Logramos entregar el sprint a tiempo"] : []);
        items.forEach((itemText: string, itemIdx: number) => {
          const itemY = startY + 80 + itemIdx * 90;
          if (itemY + 70 < startY + 60 + cardHeight) {
            elements.push(
              createRectangle(x + 15, itemY, cardWidth - 30, 70, {
                backgroundColor: "#ffffff",
                fillStyle: "solid",
                strokeWidth: 1.5,
                roughness: 0.5,
              }),
            );
            elements.push(
              createText(x + 20, itemY + 15, wrapText(itemText, 30), 14, {
                width: cardWidth - 40,
                height: 40,
                textAlign: "left",
              }),
            );
          }
        });
      });

      return elements;
    },
  },
  {
    id: "matrix",
    name: "Matriz de Priorización 2x2",
    description: "Clasifica tareas o ideas según su nivel de Impacto y Esfuerzo.",
    icon: "📊",
    category: "Business & Strategy",
    getElements: (content?: Record<string, any>) => {
      const size = 500;
      const startX = 200;
      const startY = 150;
      const elements: any[] = [];

      elements.push(
        createRectangle(startX, startY, size, size, {
          strokeWidth: 1.5,
          strokeColor: "#bbb",
          strokeStyle: "dashed",
        }),
      );

      elements.push(
        createArrow(startX + size / 2, startY + size, [[0, -size]], {
          strokeWidth: 2.5,
          strokeColor: "#1e1e1e",
        }),
      );

      elements.push(
        createArrow(startX, startY + size / 2, [[size, 0]], {
          strokeWidth: 2.5,
          strokeColor: "#1e1e1e",
        }),
      );

      elements.push(
        createText(startX + size / 2 - 100, startY - 45, "▲ Mayor Impacto", 16, {
          width: 200,
          height: 30,
        }),
      );
      elements.push(
        createText(startX + size / 2 - 100, startY + size + 15, "▼ Menor Impacto", 16, {
          width: 200,
          height: 30,
        }),
      );
      elements.push(
        createText(startX - 180, startY + size / 2 - 15, "◄ Mayor Esfuerzo", 16, {
          width: 170,
          height: 30,
          textAlign: "right",
        }),
      );
      elements.push(
        createText(startX + size + 10, startY + size / 2 - 15, "Menor Esfuerzo ►", 16, {
          width: 170,
          height: 30,
          textAlign: "left",
        }),
      );

      const quadrants = [
        { label: "🚀 Prioridad Alta (Ganancias rápidas)", x: startX + 20, y: startY + 20, key: "high_impact_low_effort" },
        { label: "📈 Proyectos Clave (Planificar)", x: startX + size / 2 + 20, y: startY + 20, key: "high_impact_high_effort" },
        { label: "💤 Relleno (Hacer luego)", x: startX + 20, y: startY + size / 2 + 20, key: "low_impact_low_effort" },
        { label: "❌ Descartar (Sin valor)", x: startX + size / 2 + 20, y: startY + size / 2 + 20, key: "low_impact_high_effort" },
      ];

      quadrants.forEach((quad) => {
        elements.push(
          createText(quad.x, quad.y, quad.label, 14, {
            width: 200,
            height: 40,
            textAlign: "left",
          }),
        );

        const items = content?.[quad.key] || [];
        items.forEach((itemText: string, itemIdx: number) => {
          const itemY = quad.y + 60 + itemIdx * 50;
          if (itemY + 40 < quad.y + size / 2) {
            elements.push(
              createRectangle(quad.x, itemY, 200, 40, {
                backgroundColor: "#ffffff",
                fillStyle: "solid",
                strokeWidth: 1,
                roughness: 0,
                roundness: { type: 3 },
              }),
            );
            elements.push(
              createText(quad.x + 5, itemY + 10, wrapText(itemText, 22), 12, {
                width: 190,
                height: 25,
              }),
            );
          }
        });
      });

      return elements;
    },
  },
  {
    id: "sipoc",
    name: "Diagrama SIPOC",
    description: "Mapea procesos identificando Proveedores, Entradas, Proceso, Salidas y Clientes.",
    icon: "⛓️",
    category: "Business & Strategy",
    getElements: (content?: Record<string, any>) => {
      const colWidth = 220;
      const colHeight = 460;
      const startX = 100;
      const startY = 150;
      const elements: any[] = [];
      const columns = [
        { title: "S - Proveedores (Suppliers)", color: "#fee2e2", key: "suppliers" },
        { title: "I - Entradas (Inputs)", color: "#fef3c7", key: "inputs" },
        { title: "P - Proceso (Process)", color: "#e0f2fe", key: "process" },
        { title: "O - Salidas (Outputs)", color: "#dcfce7", key: "outputs" },
        { title: "C - Clientes (Customers)", color: "#f3e8ff", key: "customers" },
      ];
      columns.forEach((col, index) => {
        const x = startX + index * (colWidth + 24);
        elements.push(
          createRectangle(x, startY, colWidth, 50, {
            backgroundColor: col.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(x, startY + 5, col.title, 14, {
            width: colWidth,
            height: 40,
          }),
        );
        elements.push(
          createRectangle(x, startY + 60, colWidth, colHeight, {
            strokeColor: "#ccc",
            strokeWidth: 1.5,
            strokeStyle: "dashed",
          }),
        );

        const items = content?.[col.key] || [];
        items.forEach((itemText: string, itemIdx: number) => {
          const itemY = startY + 80 + itemIdx * 65;
          if (itemY + 55 < startY + 60 + colHeight) {
            elements.push(
              createRectangle(x + 10, itemY, colWidth - 20, 55, {
                backgroundColor: "#ffffff",
                fillStyle: "solid",
                strokeWidth: 1.2,
                roughness: 0,
                roundness: { type: 3 },
              }),
            );
            elements.push(
              createText(x + 15, itemY + 10, wrapText(itemText, 22), 12, {
                width: colWidth - 30,
                height: 35,
                textAlign: "left",
              }),
            );
          }
        });
      });
      return elements;
    },
  },
  {
    id: "lean_canvas",
    name: "Lean Canvas",
    description: "Plasma tu modelo de negocio rápido en un lienzo de 9 bloques clave.",
    icon: "🎯",
    category: "Business & Strategy",
    getElements: (content?: Record<string, any>) => {
      const startX = 100;
      const startY = 150;
      const blockWidth = 200;
      const blockHeight = 400;
      const elements: any[] = [];
      const blocks = [
        { title: "Problema", x: startX, y: startY, w: blockWidth, h: blockHeight, color: "#fee2e2", key: "problema" },
        { title: "Solución", x: startX + blockWidth + 20, y: startY, w: blockWidth, h: blockHeight / 2 - 10, color: "#fef3c7", key: "solucion" },
        { title: "Métricas Clave", x: startX + blockWidth + 20, y: startY + blockHeight / 2 + 10, w: blockWidth, h: blockHeight / 2 - 10, color: "#e0f2fe", key: "metricas" },
        { title: "Propuesta de Valor", x: startX + (blockWidth + 20) * 2, y: startY, w: blockWidth, h: blockHeight, color: "#dcfce7", key: "propuesta" },
        { title: "Ventaja Injusta", x: startX + (blockWidth + 20) * 3, y: startY, w: blockWidth, h: blockHeight / 2 - 10, color: "#f3e8ff", key: "ventaja" },
        { title: "Canales", x: startX + (blockWidth + 20) * 3, y: startY + blockHeight / 2 + 10, w: blockWidth, h: blockHeight / 2 - 10, color: "#ffe4e6", key: "canales" },
        { title: "Segmentos de Cliente", x: startX + (blockWidth + 20) * 4, y: startY, w: blockWidth, h: blockHeight, color: "#f0fdf4", key: "segmentos" },
        { title: "Estructura de Costes", x: startX, y: startY + blockHeight + 20, w: (blockWidth * 5 + 80) / 2 - 10, h: 140, color: "#f8fafc", key: "costes" },
        { title: "Flujos de Ingreso", x: startX + (blockWidth * 5 + 80) / 2 + 10, y: startY + blockHeight + 20, w: (blockWidth * 5 + 80) / 2 - 10, h: 140, color: "#f8fafc", key: "ingresos" },
      ];
      blocks.forEach((b) => {
        elements.push(
          createRectangle(b.x, b.y, b.w, 40, {
            backgroundColor: b.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(b.x, b.y + 5, b.title, 14, {
            width: b.w,
            height: 30,
          }),
        );
        elements.push(
          createRectangle(b.x, b.y + 45, b.w, b.h - 45, {
            strokeColor: "#ccc",
            strokeWidth: 1.5,
            strokeStyle: "dashed",
          }),
        );

        const blockText = content?.[b.key] || "";
        if (blockText) {
          const wrapped = blockText.split("\n").map(line => wrapText(line, 20)).join("\n");
          elements.push(
            createText(b.x + 10, b.y + 55, wrapped, 12, {
              width: b.w - 20,
              height: b.h - 65,
              textAlign: "left",
              verticalAlign: "top",
            }),
          );
        }
      });
      return elements;
    },
  },
  {
    id: "customer_journey",
    name: "Customer Journey Map",
    description: "Mapea las fases de experiencia del cliente y sus puntos de dolor.",
    icon: "🗺️",
    category: "Design & UI",
    getElements: (content?: Record<string, any>) => {
      const colWidth = 240;
      const rowHeight = 100;
      const startX = 200;
      const startY = 200;
      const elements: any[] = [];
      const stages = ["Descubrimiento", "Consideración", "Compra", "Uso", "Soporte"];
      const rows = [
        { label: "Acciones del Cliente", color: "#f8fafc", key: "acciones" },
        { label: "Puntos de Contacto", color: "#f1f5f9", key: "contactos" },
        { label: "Puntos de Dolor", color: "#fef2f2", key: "dolores" },
        { label: "Oportunidades", color: "#ecfdf5", key: "oportunidades" },
      ];

      stages.forEach((stage, idx) => {
        const x = startX + idx * (colWidth + 16);
        elements.push(
          createRectangle(x, startY - 50, colWidth, 40, {
            backgroundColor: "#e0f2fe",
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(x, startY - 45, stage, 14, {
            width: colWidth,
            height: 30,
          }),
        );
      });

      rows.forEach((row, rowIdx) => {
        const y = startY + rowIdx * (rowHeight + 16);
        elements.push(
          createRectangle(startX - 180, y, 160, rowHeight, {
            backgroundColor: row.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(startX - 175, y + rowHeight / 2 - 15, row.label, 13, {
            width: 150,
            height: 30,
          }),
        );

        stages.forEach((stage, stageIdx) => {
          const x = startX + stageIdx * (colWidth + 16);
          elements.push(
            createRectangle(x, y, colWidth, rowHeight, {
              strokeColor: "#ddd",
              strokeWidth: 1,
              strokeStyle: "dashed",
            }),
          );

          const cellText = content?.[row.key]?.[stageIdx] || "";
          if (cellText) {
            elements.push(
              createText(x + 10, y + 10, wrapText(cellText, 22), 11, {
                width: colWidth - 20,
                height: rowHeight - 20,
                textAlign: "left",
                verticalAlign: "top",
              }),
            );
          }
        });
      });
      return elements;
    },
  },
  {
    id: "swot",
    name: "Análisis FODA (SWOT)",
    description: "Evalúa Fortalezas, Oportunidades, Debilidades y Amenazas.",
    icon: "🛡️",
    category: "Business & Strategy",
    getElements: (content?: Record<string, any>) => {
      const startX = 150;
      const startY = 150;
      const size = 240;
      const elements: any[] = [];

      const quadrants = [
        { title: "Fortalezas (S) 💪", color: "#dcfce7", key: "strengths", x: startX, y: startY },
        { title: "Debilidades (W) ⚠️", color: "#fef3c7", key: "weaknesses", x: startX + size + 20, y: startY },
        { title: "Oportunidades (O) 🚀", color: "#e0f2fe", key: "opportunities", x: startX, y: startY + size + 20 },
        { title: "Amenazas (T) ❌", color: "#fee2e2", key: "threats", x: startX + size + 20, y: startY + size + 20 },
      ];

      quadrants.forEach((q) => {
        elements.push(
          createRectangle(q.x, q.y, size, 40, {
            backgroundColor: q.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(q.x, q.y + 5, q.title, 14, {
            width: size,
            height: 30,
          }),
        );
        elements.push(
          createRectangle(q.x, q.y + 45, size, size - 45, {
            strokeColor: "#ccc",
            strokeWidth: 1.5,
            strokeStyle: "dashed",
          }),
        );

        const items = content?.[q.key] || [];
        items.forEach((itemText: string, itemIdx: number) => {
          const itemY = q.y + 55 + itemIdx * 50;
          if (itemY + 40 < q.y + size) {
            elements.push(
              createRectangle(q.x + 10, itemY, size - 20, 40, {
                backgroundColor: "#ffffff",
                fillStyle: "solid",
                strokeWidth: 1,
              }),
            );
            elements.push(
              createText(q.x + 15, itemY + 8, wrapText(itemText, 22), 12, {
                width: size - 30,
                height: 25,
                textAlign: "left",
              }),
            );
          }
        });
      });

      return elements;
    },
  },
  {
    id: "roadmap",
    name: "Product Roadmap",
    description: "Planifica tus lanzamientos y características clave por trimestres.",
    icon: "🗺️",
    category: "Product & Engineering",
    getElements: (content?: Record<string, any>) => {
      const colWidth = 200;
      const rowHeight = 120;
      const startX = 200;
      const startY = 200;
      const elements: any[] = [];
      const columns = ["Q1", "Q2", "Q3", "Q4"];
      const rows = [
        { label: "Frontend", color: "#fee2e2", key: "frontend" },
        { label: "Backend", color: "#e0f2fe", key: "backend" },
        { label: "Growth / Mktg", color: "#f3e8ff", key: "marketing" },
      ];

      columns.forEach((col, idx) => {
        const x = startX + idx * (colWidth + 16);
        elements.push(
          createRectangle(x, startY - 50, colWidth, 40, {
            backgroundColor: "#f1f5f9",
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(x, startY - 45, col, 14, {
            width: colWidth,
            height: 30,
          }),
        );
      });

      rows.forEach((row, rowIdx) => {
        const y = startY + rowIdx * (rowHeight + 16);
        elements.push(
          createRectangle(startX - 180, y, 160, rowHeight, {
            backgroundColor: row.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        elements.push(
          createText(startX - 170, y + rowHeight / 2 - 15, row.label, 14, {
            width: 140,
            height: 30,
          }),
        );

        columns.forEach((col, colIdx) => {
          const x = startX + colIdx * (colWidth + 16);
          elements.push(
            createRectangle(x, y, colWidth, rowHeight, {
              strokeColor: "#ccc",
              strokeWidth: 1,
              strokeStyle: "dashed",
            }),
          );

          const items = content?.[row.key]?.[colIdx] || [];
          items.forEach((itemText: string, itemIdx: number) => {
            const itemY = y + 10 + itemIdx * 45;
            if (itemY + 35 < y + rowHeight) {
              elements.push(
                createRectangle(x + 10, itemY, colWidth - 20, 35, {
                  backgroundColor: "#ffffff",
                  fillStyle: "solid",
                  strokeWidth: 1,
                  roundness: { type: 3 },
                }),
              );
              elements.push(
                createText(x + 15, itemY + 6, wrapText(itemText, 20), 11, {
                  width: colWidth - 30,
                  height: 20,
                  textAlign: "left",
                }),
              );
            }
          });
        });
      });

      return elements;
    },
  },
];

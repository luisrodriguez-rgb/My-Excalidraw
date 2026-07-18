const createBaseElement = (
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  custom = {},
) => {
  return {
    id: `${type}_${Math.random().toString(36).substr(2, 9)}`,
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

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  getElements: () => any[];
}

export const TEMPLATES: Template[] = [
  {
    id: "kanban",
    name: "Tablero Kanban",
    description:
      "Organiza tus tareas en columnas de Por Hacer, En Proceso y Listo.",
    icon: "📋",
    getElements: () => {
      const colWidth = 280;
      const colHeight = 500;
      const startX = 100;
      const startY = 150;

      const elements: any[] = [];

      // Columns Title and Frame
      const columns = [
        { title: "Por Hacer 📌", color: "#fee2e2" },
        { title: "En Proceso ⚡", color: "#fef3c7" },
        { title: "Listo 🎉", color: "#dcfce7" },
      ];

      columns.forEach((col, index) => {
        const x = startX + index * (colWidth + 40);
        // Column Header background
        elements.push(
          createRectangle(x, startY, colWidth, 50, {
            backgroundColor: col.color,
            fillStyle: "solid",
            strokeWidth: 1.5,
          }),
        );
        // Column Title
        elements.push(
          createText(x, startY + 5, col.title, 18, {
            width: colWidth,
            height: 40,
          }),
        );
        // Column Container frame
        elements.push(
          createRectangle(x, startY + 60, colWidth, colHeight, {
            strokeColor: "#ccc",
            strokeWidth: 1.5,
            strokeStyle: "dashed",
          }),
        );
      });

      // Add a sample card
      elements.push(
        createRectangle(startX + 15, startY + 80, colWidth - 30, 80, {
          backgroundColor: "#ffffff",
          fillStyle: "solid",
          strokeWidth: 1.5,
          roughness: 0.5,
        }),
      );
      elements.push(
        createText(
          startX + 20,
          startY + 95,
          "Tarea de ejemplo\n(Doble clic para editar)",
          14,
          {
            width: colWidth - 40,
            height: 50,
            textAlign: "left",
          },
        ),
      );

      return elements;
    },
  },
  {
    id: "retro",
    name: "Retrospectiva del Equipo",
    description:
      "Identifica qué salió bien, qué se puede mejorar y los planes de acción.",
    icon: "🔄",
    getElements: () => {
      const cardWidth = 320;
      const cardHeight = 400;
      const startX = 100;
      const startY = 150;
      const elements: any[] = [];

      const categories = [
        { title: "Qué Salió Bien 👍", color: "#dcfce7" },
        { title: "Qué Mejorar 👎", color: "#fee2e2" },
        { title: "Ideas y Sugerencias 💡", color: "#e0f2fe" },
      ];

      categories.forEach((cat, index) => {
        const x = startX + index * (cardWidth + 40);
        // Header
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
        // Container
        elements.push(
          createRectangle(x, startY + 60, cardWidth, cardHeight, {
            strokeColor: "#999",
            strokeWidth: 1.5,
          }),
        );
      });

      return elements;
    },
  },
  {
    id: "matrix",
    name: "Matriz de Priorización 2x2",
    description:
      "Prioriza tareas y proyectos cruzando el Impacto y el Esfuerzo necesario.",
    icon: "📈",
    getElements: () => {
      const size = 500;
      const startX = 200;
      const startY = 150;
      const elements: any[] = [];

      // Grid Container
      elements.push(
        createRectangle(startX, startY, size, size, {
          strokeWidth: 1.5,
          strokeColor: "#bbb",
          strokeStyle: "dashed",
        }),
      );

      // Y-Axis Arrow (Vertical)
      elements.push(
        createArrow(startX + size / 2, startY + size, [[0, -size]], {
          strokeWidth: 2.5,
          strokeColor: "#1e1e1e",
        }),
      );

      // X-Axis Arrow (Horizontal)
      elements.push(
        createArrow(startX, startY + size / 2, [[size, 0]], {
          strokeWidth: 2.5,
          strokeColor: "#1e1e1e",
        }),
      );

      // Axis Labels
      elements.push(
        createText(
          startX + size / 2 - 100,
          startY - 45,
          "▲ Mayor Impacto",
          16,
          {
            width: 200,
            height: 30,
          },
        ),
      );
      elements.push(
        createText(
          startX + size / 2 - 100,
          startY + size + 15,
          "▼ Menor Impacto",
          16,
          {
            width: 200,
            height: 30,
          },
        ),
      );
      elements.push(
        createText(
          startX - 180,
          startY + size / 2 - 15,
          "◄ Mayor Esfuerzo",
          16,
          {
            width: 170,
            height: 30,
            textAlign: "right",
          },
        ),
      );
      elements.push(
        createText(
          startX + size + 10,
          startY + size / 2 - 15,
          "Menor Esfuerzo ►",
          16,
          {
            width: 170,
            height: 30,
            textAlign: "left",
          },
        ),
      );

      // Quadrants labeling
      elements.push(
        createText(
          startX + 20,
          startY + 20,
          "🚀 Prioridad Alta\n(Ganancias rápidas)",
          14,
          {
            width: 200,
            height: 40,
            textAlign: "left",
          },
        ),
      );
      elements.push(
        createText(
          startX + size / 2 + 20,
          startY + 20,
          "📈 Proyectos Clave\n(Planificar)",
          14,
          {
            width: 200,
            height: 40,
            textAlign: "left",
          },
        ),
      );
      elements.push(
        createText(
          startX + 20,
          startY + size / 2 + 20,
          "💤 Relleno\n(Hacer luego)",
          14,
          {
            width: 200,
            height: 40,
            textAlign: "left",
          },
        ),
      );
      elements.push(
        createText(
          startX + size / 2 + 20,
          startY + size / 2 + 20,
          "❌ Descartar\n(Sin valor)",
          14,
          {
            width: 200,
            height: 40,
            textAlign: "left",
          },
        ),
      );

      return elements;
    },
  },
];

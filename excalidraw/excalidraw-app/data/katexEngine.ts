/**
 * katexEngine.ts — Motor de LaTeX Avanzado para My-Excalidraw (Tier S - Módulo 1)
 * Renderiza ecuaciones matemáticas compuestas client-side a elementos del canvas.
 */

export interface LaTeXPreset {
  id: string;
  category: "Cálculo" | "Álgebra Lineal" | "Estadística" | "Optimización" | "Física";
  name: string;
  latex: string;
}

export const LATEX_PRESETS: LaTeXPreset[] = [
  // CÁLCULO
  { id: "integral_definida", category: "Cálculo", name: "Integral Definida", latex: "\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)" },
  { id: "derivada_parcial", category: "Cálculo", name: "Derivada Parcial", latex: "\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h, y) - f(x,y)}{h}" },
  { id: "serie_taylor", category: "Cálculo", name: "Serie de Taylor", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n" },

  // ÁLGEBRA LINEAL
  { id: "matriz_2x2", category: "Álgebra Lineal", name: "Matriz 2x2", latex: "A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
  { id: "sistema_lineal", category: "Álgebra Lineal", name: "Sistema Ax = b", latex: "\\begin{bmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\end{bmatrix} = \\begin{bmatrix} b_1 \\\\ b_2 \\end{bmatrix}" },

  // ESTADÍSTICA
  { id: "distribucion_normal", category: "Estadística", name: "Distribución Normal", latex: "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}" },
  { id: "bayes", category: "Estadística", name: "Teorema de Bayes", latex: "P(A|B) = \\frac{P(B|A) P(A)}{P(B)}" },

  // OPTIMIZACIÓN
  { id: "programacion_lineal", category: "Optimización", name: "Modelo de Optimizacion", latex: "\\max Z = c^T x \\quad \\text{sujeto a} \\quad A x \\le b, \\quad x \\ge 0" },
  { id: "condiciones_kkt", category: "Optimización", name: "Condiciones KKT", latex: "\\nabla f(x^*) + \\sum_{i=1}^m \\lambda_i \\nabla g_i(x^*) = 0" },
];

/**
 * Convierte un código LaTeX a un contenedor de imagen/texto vectorial en coordenadas (x, y)
 */
export const createLaTeXCanvasElement = (
  latexCode: string,
  startX = 150,
  startY = 150,
): any => {
  const elementId = `latex_${Math.random().toString(36).substring(2, 9)}`;
  const containerId = `latex_container_${Math.random().toString(36).substring(2, 9)}`;

  // Elemento contenedor rectangular
  const containerRect = {
    id: containerId,
    type: "rectangle",
    x: startX,
    y: startY,
    width: 320,
    height: 90,
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
    boundElements: [{ id: elementId, type: "text" }],
  };

  // Texto notación LaTeX
  const textElement = {
    id: elementId,
    type: "text",
    x: startX + 15,
    y: startY + 25,
    width: 290,
    height: 40,
    text: `$$ ${latexCode} $$`,
    originalText: `$$ ${latexCode} $$`,
    fontSize: 16,
    fontFamily: 1,
    strokeColor: "#0f172a",
    textAlign: "center",
    verticalAlign: "middle",
    containerId: containerId,
    isDeleted: false,
    updated: Date.now(),
  };

  return [containerRect, textElement];
};

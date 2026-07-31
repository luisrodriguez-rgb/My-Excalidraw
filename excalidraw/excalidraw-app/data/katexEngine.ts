/**
 * katexEngine.ts — Motor de LaTeX Avanzado para My-Excalidraw
 * Renderiza ecuaciones matemáticas compuestas client-side a elementos SVG nativos del canvas.
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
 * Helper to dynamically load MathJax from CDN
 */
const loadMathJax = async (): Promise<any> => {
  if ((window as any).MathJax) {
    return (window as any).MathJax;
  }
  return new Promise((resolve, reject) => {
    (window as any).MathJax = {
      tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
      svg: { fontCache: 'global' },
      startup: {
        ready: () => {
          resolve((window as any).MathJax);
        }
      }
    };
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async = true;
    script.onerror = () => reject(new Error("No se pudo cargar MathJax"));
    document.head.appendChild(script);
  });
};

/**
 * Renderiza una ecuación LaTeX a un string SVG con dimensiones estimadas
 */
export const renderLaTeXToSVG = async (
  latex: string,
): Promise<{ svgString: string; width: number; height: number }> => {
  const mathjax = await loadMathJax();
  const container = mathjax.tex2svg(latex);
  const svgElement = container.querySelector("svg");
  if (!svgElement) {
    throw new Error("No se pudo compilar la ecuación a SVG");
  }

  const widthAttr = svgElement.getAttribute("width");
  const heightAttr = svgElement.getAttribute("height");
  
  const widthEx = parseFloat(widthAttr || "10");
  const heightEx = parseFloat(heightAttr || "2");
  
  // Escalar proporcionalmente ex a px
  const width = Math.max(120, Math.round(widthEx * 9.5));
  const height = Math.max(36, Math.round(heightEx * 9.5));

  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  return { svgString, width, height };
};

/**
 * Compila LaTeX a SVG vectorial, lo sube a Excalidraw files e inserta el elemento de imagen
 */
export const insertLaTeXSVGToCanvas = async (
  latex: string,
  api: any,
  x: number,
  y: number,
): Promise<void> => {
  try {
    const { svgString, width, height } = await renderLaTeXToSVG(latex);
    const dataURL = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    const fileId = `latex_svg_${Date.now()}`;

    const imageElement = {
      type: "image" as any,
      id: `latex_el_${Date.now()}`,
      fileId,
      status: "saved" as any,
      x,
      y,
      width,
      height,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "solid" as any,
      strokeWidth: 1,
      strokeStyle: "solid" as any,
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,
      customData: {
        latexCode: latex,
      },
    };

    api.addFiles([
      {
        id: fileId,
        dataURL,
        mimeType: "image/svg+xml",
        created: Date.now(),
      },
    ]);

    const currentFiles = { ...(api.getFiles() || {}) };
    currentFiles[fileId] = {
      id: fileId,
      dataURL,
      mimeType: "image/svg+xml",
      created: Date.now(),
    };

    api.updateScene({
      elements: [...(api.getSceneElements() || []), imageElement],
      files: currentFiles,
    });

    api.scrollToContent([imageElement], { fitToViewport: true, viewportZoomFactor: 1.2 });
  } catch (err) {
    console.error("LaTeX SVG integration error:", err);
    throw err;
  }
};


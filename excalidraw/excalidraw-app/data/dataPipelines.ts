/**
 * dataPipelines.ts — Data Pipelines para My-Excalidraw (Tier S - Módulo 3)
 * Convierte archivos CSV, TSV o datos de Google Sheets en gráficos y dashboards vectoriales.
 */

export interface ParsedDataSet {
  headers: string[];
  rows: (string | number)[][];
  numericSeries: { label: string; values: number[] }[];
}

/**
 * Parsea una cadena de texto en formato CSV o TSV
 */
export const parseCSVData = (csvContent: string): ParsedDataSet => {
  const lines = csvContent.trim().split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [], numericSeries: [] };

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));

  const rows: (string | number)[][] = [];
  const numericSeries: { label: string; values: number[] }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map((c) => {
      const clean = c.trim().replace(/^"|"$/g, "");
      const num = parseFloat(clean);
      return !isNaN(num) ? num : clean;
    });
    rows.push(cells);
  }

  // Extraer columnas numéricas
  headers.forEach((h, colIdx) => {
    const isNumCol = rows.every((r) => typeof r[colIdx] === "number");
    if (isNumCol && rows.length > 0) {
      numericSeries.push({
        label: h,
        values: rows.map((r) => r[colIdx] as number),
      });
    }
  });

  return { headers, rows, numericSeries };
};

/**
 * Genera un Gráfico de Barras Vectorial en el lienzo a partir de un conjunto de datos
 */
export const renderBarChart = (
  dataSet: ParsedDataSet,
  startX = 150,
  startY = 150,
): any[] => {
  const elements: any[] = [];
  const { rows, numericSeries } = dataSet;
  if (rows.length === 0 || numericSeries.length === 0) return elements;

  const labels = rows.map((r) => String(r[0] || ""));
  const series = numericSeries[0];
  const maxVal = Math.max(...series.values, 1);

  const chartWidth = 450;
  const chartHeight = 250;
  const barWidth = Math.max(20, Math.floor((chartWidth - 60) / labels.length - 10));

  // Marco exterior del gráfico
  elements.push({
    id: `chart_bg_${Date.now()}`,
    type: "rectangle",
    x: startX,
    y: startY,
    width: chartWidth,
    height: chartHeight + 60,
    strokeColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 1.5,
    roughness: 0,
    updated: Date.now(),
  });

  // Título del Gráfico
  elements.push({
    id: `chart_title_${Date.now()}`,
    type: "text",
    x: startX + 15,
    y: startY + 15,
    width: chartWidth - 30,
    height: 24,
    text: `📊 Gráfico de Barras: ${series.label}`,
    fontSize: 16,
    fontFamily: 1,
    strokeColor: "#ef4444",
    textAlign: "left",
    updated: Date.now(),
  });

  // Dibujar barras vectoriales
  labels.forEach((label, idx) => {
    const val = series.values[idx] || 0;
    const barHeight = Math.floor((val / maxVal) * (chartHeight - 40));
    const bx = startX + 40 + idx * (barWidth + 12);
    const by = startY + chartHeight + 20 - barHeight;

    // Barra
    elements.push({
      id: `bar_${idx}_${Date.now()}`,
      type: "rectangle",
      x: bx,
      y: by,
      width: barWidth,
      height: barHeight,
      strokeColor: "#ef4444",
      backgroundColor: "#fee2e2",
      fillStyle: "solid",
      strokeWidth: 1.5,
      roughness: 0,
      updated: Date.now(),
    });

    // Etiqueta del eje X
    elements.push({
      id: `bar_label_${idx}_${Date.now()}`,
      type: "text",
      x: bx - 5,
      y: startY + chartHeight + 25,
      width: barWidth + 10,
      height: 20,
      text: label.substring(0, 8),
      fontSize: 11,
      fontFamily: 1,
      strokeColor: "#64748b",
      textAlign: "center",
      updated: Date.now(),
    });
  });

  return elements;
};

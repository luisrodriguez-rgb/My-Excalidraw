/**
 * Google Sheets / CSV Importer Utility for My-Excalidraw
 * Parses CSV/TSV data and generates clean, styled Excalidraw Table Grid elements.
 */

export interface SheetTableResult {
  elements: any[];
  width: number;
  height: number;
}

export const parseSheetDataToExcalidraw = (
  rawText: string,
  startX = 100,
  startY = 100,
): SheetTableResult => {
  const lines = rawText.trim().split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return { elements: [], width: 0, height: 0 };

  // Detect delimiter (Tab for Google Sheets/Excel copy-paste, Comma or Semicolon for CSV)
  const firstLine = lines[0];
  let delimiter = "\t";
  if (firstLine.includes("\t")) {
    delimiter = "\t";
  } else if (firstLine.includes(";")) {
    delimiter = ";";
  } else if (firstLine.includes(",")) {
    delimiter = ",";
  }

  const grid: string[][] = lines.map((line) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^["']|["']$/g, "")),
  );

  const numRows = grid.length;
  const numCols = Math.max(...grid.map((row) => row.length));

  const CELL_WIDTH = 160;
  const CELL_HEIGHT = 44;
  const elements: any[] = [];
  const baseTime = Date.now();

  for (let r = 0; r < numRows; r++) {
    const isHeader = r === 0;
    for (let c = 0; c < numCols; c++) {
      const cellText = grid[r][c] || "";
      const cellX = startX + c * CELL_WIDTH;
      const cellY = startY + r * CELL_HEIGHT;
      const rectId = `sheet_rect_${baseTime}_${r}_${c}`;
      const textId = `sheet_text_${baseTime}_${r}_${c}`;

      const rectElement = {
        id: rectId,
        type: "rectangle",
        x: cellX,
        y: cellY,
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        strokeColor: isHeader ? "#ef4444" : "#cbd5e1",
        backgroundColor: isHeader ? "#fef2f2" : "#ffffff",
        fillStyle: "solid",
        strokeWidth: isHeader ? 2 : 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [`sheet_group_${baseTime}`],
        frameId: null,
        roundness: { type: 3 },
        isDeleted: false,
        boundElements: [{ id: textId, type: "text" }],
        updated: baseTime,
        link: null,
        locked: false,
      };

      const textElement = {
        id: textId,
        type: "text",
        x: cellX + 8,
        y: cellY + (CELL_HEIGHT - 20) / 2,
        width: CELL_WIDTH - 16,
        height: 20,
        angle: 0,
        strokeColor: isHeader ? "#991b1b" : "#1e293b",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [`sheet_group_${baseTime}`],
        frameId: null,
        roundness: null,
        isDeleted: false,
        boundElements: [],
        updated: baseTime,
        link: null,
        locked: false,
        fontSize: isHeader ? 15 : 13,
        fontFamily: 1,
        text: cellText,
        originalText: cellText,
        textAlign: "center",
        verticalAlign: "middle",
        containerId: rectId,
        lineHeight: 1.2,
        baseline: 14,
      };

      elements.push(rectElement, textElement);
    }
  }

  return {
    elements,
    width: numCols * CELL_WIDTH,
    height: numRows * CELL_HEIGHT,
  };
};

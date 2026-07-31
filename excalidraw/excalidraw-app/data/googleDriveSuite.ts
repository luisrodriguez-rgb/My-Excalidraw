/**
 * googleDriveSuite.ts — Integración de Google Drive Suite (Tier S - Módulo 2)
 * Procesa enlaces de Google PDFs, Docs, Sheets y Slides creando tarjetas enriquecidas e importaciones.
 */

export type GoogleDriveResourceType = "pdf" | "docs" | "sheets" | "slides" | "unknown";

export interface GoogleDriveResourceInfo {
  type: GoogleDriveResourceType;
  fileId: string;
  originalUrl: string;
  embedUrl: string;
  title: string;
}

/**
 * Analiza una URL de Google Drive y extrae su ID y tipo de documento
 */
export const parseGoogleDriveUrl = (url: string): GoogleDriveResourceInfo | null => {
  if (!url || !url.includes("google.com")) return null;

  let type: GoogleDriveResourceType = "unknown";
  let fileId = "";

  if (url.includes("/document/d/")) {
    type = "docs";
    fileId = url.split("/document/d/")[1]?.split("/")[0] || "";
  } else if (url.includes("/spreadsheets/d/")) {
    type = "sheets";
    fileId = url.split("/spreadsheets/d/")[1]?.split("/")[0] || "";
  } else if (url.includes("/presentation/d/")) {
    type = "slides";
    fileId = url.split("/presentation/d/")[1]?.split("/")[0] || "";
  } else if (url.includes("/file/d/")) {
    type = "pdf";
    fileId = url.split("/file/d/")[1]?.split("/")[0] || "";
  }

  if (!fileId) return null;

  let embedUrl = url;
  if (type === "docs") {
    embedUrl = `https://docs.google.com/document/d/${fileId}/pub?embedded=true`;
  } else if (type === "sheets") {
    embedUrl = `https://docs.google.com/spreadsheets/d/${fileId}/pubhtml?widget=true&headers=false`;
  } else if (type === "slides") {
    embedUrl = `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`;
  } else if (type === "pdf") {
    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  }

  const titleNames: Record<GoogleDriveResourceType, string> = {
    pdf: "Documento PDF (Google Drive)",
    docs: "Documento Google Docs",
    sheets: "Hoja de Cálculo Google Sheets",
    slides: "Presentación Google Slides",
    unknown: "Archivo Google Drive",
  };

  return {
    type,
    fileId,
    originalUrl: url,
    embedUrl,
    title: titleNames[type],
  };
};

/**
 * Crea una tarjeta enriquecida de Google Drive en el canvas de My-Excalidraw
 */
export const createGoogleDriveCard = (
  info: GoogleDriveResourceInfo,
  startX = 150,
  startY = 150,
): any[] => {
  const containerId = `gdrive_card_${Math.random().toString(36).substring(2, 9)}`;
  const titleId = `gdrive_title_${Math.random().toString(36).substring(2, 9)}`;

  const badgeColors: Record<GoogleDriveResourceType, { bg: string; stroke: string }> = {
    pdf: { bg: "#fef2f2", stroke: "#ef4444" },
    docs: { bg: "#eff6ff", stroke: "#2563eb" },
    sheets: { bg: "#f0fdf4", stroke: "#16a34a" },
    slides: { bg: "#fffbeb", stroke: "#d97706" },
    unknown: { bg: "#f8fafc", stroke: "#64748b" },
  };

  const style = badgeColors[info.type];

  // Tarjeta contenedora de la suite de Google Drive
  const rectElement = {
    id: containerId,
    type: "rectangle",
    x: startX,
    y: startY,
    width: 340,
    height: 120,
    strokeColor: style.stroke,
    backgroundColor: style.bg,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    isDeleted: false,
    updated: Date.now(),
    link: info.originalUrl,
    boundElements: [{ id: titleId, type: "text" }],
  };

  // Texto amigable con el tipo de documento y botón
  const textElement = {
    id: titleId,
    type: "text",
    x: startX + 15,
    y: startY + 20,
    width: 310,
    height: 80,
    text: `📁 ${info.title}\nID: ${info.fileId.substring(0, 12)}...\n\n[ Haz clic para abrir en Google Drive ]`,
    originalText: `📁 ${info.title}\nID: ${info.fileId.substring(0, 12)}...\n\n[ Haz clic para abrir en Google Drive ]`,
    fontSize: 14,
    fontFamily: 1,
    strokeColor: "#0f172a",
    textAlign: "left",
    verticalAlign: "top",
    containerId: containerId,
    isDeleted: false,
    updated: Date.now(),
  };

  return [rectElement, textElement];
};

/**
 * PDF Importer Utility for My-Excalidraw
 * Client-side PDF rendering & page conversion to Excalidraw Image elements
 */

import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

export interface PDFImportProgress {
  currentPage: number;
  totalPages: number;
}

/**
 * Loads a PDF file and converts its pages into images on the canvas
 */
export const importPDFToCanvas = async (
  file: File,
  onProgress?: (progress: PDFImportProgress) => void,
): Promise<{
  images: { id: string; dataURL: string; mimeType: string; width: number; height: number }[];
  elements: any[];
}> => {
  // Dynamically load pdfjs from CDN
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  const images: { id: string; dataURL: string; mimeType: string; width: number; height: number }[] = [];
  const elements: any[] = [];

  let currentY = 100;
  const PAGE_SPACING = 40;

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) {
      onProgress({ currentPage: i, totalPages });
    }

    const page = await pdf.getPage(i);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    // Calculate adaptive scale to cap width at 1200px for crystal-clear HD & ultra-light memory footprint
    const MAX_WIDTH = 1200;
    const targetScale = unscaledViewport.width > MAX_WIDTH ? MAX_WIDTH / unscaledViewport.width : 1.5;
    const viewport = page.getViewport({ scale: targetScale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Use page rendering with promise
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const dataURL = canvas.toDataURL("image/jpeg", 0.75);
    const fileId = `pdf_page_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 9)}`;

    images.push({
      id: fileId,
      dataURL,
      mimeType: "image/jpeg",
      width: viewport.width,
      height: viewport.height,
    });

    // Create an Excalidraw Image Element for this page
    const imageElement = {
      type: "image",
      fileId,
      status: "saved",
      x: 100,
      y: currentY,
      width: viewport.width,
      height: viewport.height,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
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
    };

    elements.push(imageElement);
    currentY += viewport.height + PAGE_SPACING;

    // Yield control to the browser main thread to avoid freezing/lagging the UI
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return { images, elements };
};

/**
 * Helper to dynamically load pdfjs library if not present
 */
const loadPdfJs = async (): Promise<any> => {
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(pdfjs);
    };
    script.onerror = () => reject(new Error("No se pudo cargar la librería PDF.js"));
    document.head.appendChild(script);
  });
};

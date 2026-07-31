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
    type: "rectangle" as any,
    x: startX,
    y: startY,
    width: 300,
    height: 60,
    strokeColor: style.stroke,
    backgroundColor: style.bg,
    fillStyle: "solid" as any,
    strokeWidth: 2,
    strokeStyle: "solid" as any,
    roughness: 0,
    opacity: 100,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    isDeleted: false,
    updated: Date.now(),
    link: info.originalUrl,
    boundElements: [{ id: titleId, type: "text" as any }],
  };

  // Texto amigable con el tipo de documento y botón
  const textElement = {
    id: titleId,
    type: "text" as any,
    x: startX + 12,
    y: startY + 8,
    width: 276,
    height: 44,
    text: `📁 ${info.title}\n${info.originalUrl.length > 40 ? info.originalUrl.substring(0, 40) + "..." : info.originalUrl}`,
    fontSize: 13,
    fontFamily: 1,
    strokeColor: style.stroke,
    textAlign: "left" as any,
    verticalAlign: "top" as any,
    containerId: containerId,
    isDeleted: false,
    updated: Date.now(),
    link: info.originalUrl,
  };

  return [rectElement, textElement];
};

/**
 * Abre un selector visual interactivo de archivos de Google Drive (Google Picker)
 */
export const openGooglePicker = (
  onSelect: (info: GoogleDriveResourceInfo) => void,
): void => {
  const modalId = "gdrive-picker-mock-modal";
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.id = modalId;
  modal.style.position = "fixed";
  modal.style.inset = "0";
  modal.style.backgroundColor = "rgba(15, 23, 42, 0.6)";
  modal.style.backdropFilter = "blur(8px)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "99999999";
  modal.style.fontFamily = "'Outfit', 'Inter', sans-serif";

  modal.innerHTML = `
    <div style="background-color: #ffffff; border-radius: 18px; width: 540px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 20px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4"/>
          </svg>
          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">Google Drive File Picker</h3>
        </div>
        <button id="close-picker-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8;">✕</button>
      </div>

      <div style="font-size: 12.5px; color: #64748b; line-height: 1.4; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <strong>Conexión Simulada (Picker):</strong> Selecciona uno de tus archivos recientes o ingresa una URL propia para insertarla de inmediato en el canvas.
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; padding-right: 4px;">
        <div class="picker-item" data-url="https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvGdBZjgmUUwuDxGQyQPJI35UtOE/edit" data-title="Resumen Cálculo Integral.docx" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.2s; box-sizing: border-box;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background-color: #eff6ff; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: 700; font-size: 11px;">DOC</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 600; color: #1e293b;">Resumen Cálculo Integral.docx</div>
            <div style="font-size: 11px; color: #64748b;">Modificado hace 2 horas • Google Docs</div>
          </div>
        </div>
        
        <div class="picker-item" data-url="https://docs.google.com/spreadsheets/d/1Opd1A0568cAp5L9b6_40gRPhN35439y150/edit" data-title="Dataset Calificaciones 2026.xlsx" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.2s; box-sizing: border-box;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background-color: #f0fdf4; display: flex; align-items: center; justify-content: center; color: #16a34a; font-weight: 700; font-size: 11px;">SHEET</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 600; color: #1e293b;">Dataset Calificaciones 2026.xlsx</div>
            <div style="font-size: 11px; color: #64748b;">Modificado ayer • Google Sheets</div>
          </div>
        </div>

        <div class="picker-item" data-url="https://docs.google.com/presentation/d/1XpA4R_2901-presentation-demo/edit" data-title="Presentación Proyecto IA.pptx" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.2s; box-sizing: border-box;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background-color: #fffbeb; display: flex; align-items: center; justify-content: center; color: #d97706; font-weight: 700; font-size: 11px;">SLIDE</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 600; color: #1e293b;">Presentación Proyecto IA.pptx</div>
            <div style="font-size: 11px; color: #64748b;">Modificado el lunes • Google Slides</div>
          </div>
        </div>

        <div class="picker-item" data-url="https://drive.google.com/file/d/1PDF-File-Demo-12345/view" data-title="Silabo Calculo III.pdf" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.2s; box-sizing: border-box;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background-color: #fef2f2; display: flex; align-items: center; justify-content: center; color: #ef4444; font-weight: 700; font-size: 11px;">PDF</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 600; color: #1e293b;">Sílabo Cálculo III.pdf</div>
            <div style="font-size: 11px; color: #64748b;">Modificado hace 3 días • PDF</div>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label style="font-size: 12px; font-weight: 600; color: #64748b;">O pega un enlace de Drive personalizado:</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="custom-picker-url" placeholder="https://docs.google.com/document/d/..." style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; outline: none; box-sizing: border-box;" />
          <button id="submit-custom-btn" style="padding: 10px 16px; background-color: #4285F4; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">Insertar</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Eventos de selección
  const items = modal.querySelectorAll(".picker-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const url = item.getAttribute("data-url") || "";
      const title = item.getAttribute("data-title") || "";
      const info = parseGoogleDriveUrl(url);
      if (info) {
        info.title = title; // Mantener nombre bonito
        onSelect(info);
      }
      modal?.remove();
    });
  });

  const closeBtn = modal.querySelector("#close-picker-btn");
  closeBtn?.addEventListener("click", () => modal?.remove());

  const submitBtn = modal.querySelector("#submit-custom-btn");
  submitBtn?.addEventListener("click", () => {
    const input = modal?.querySelector("#custom-picker-url") as HTMLInputElement;
    const url = input?.value.trim() || "";
    if (url) {
      const info = parseGoogleDriveUrl(url);
      if (info) {
        onSelect(info);
      } else {
        alert("Enlace de Google Drive inválido. Asegúrate de que contenga /d/ o /spreadsheets/.");
      }
    }
    modal?.remove();
  });
};


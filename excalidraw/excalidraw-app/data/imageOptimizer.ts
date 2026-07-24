import type { BinaryFileData, BinaryFiles } from "@excalidraw/excalidraw/types";

/**
 * Compresses binary image files (Data URLs) to WebP format if they exceed maxBytes.
 * Drastically reduces Supabase payload size, IndexedDB memory usage, and Realtime bandwidth.
 */
export const compressBinaryFile = async (
  fileData: BinaryFileData,
  maxDimension = 1600,
  quality = 0.82,
): Promise<BinaryFileData> => {
  if (
    !fileData.dataURL ||
    !fileData.mimeType.startsWith("image/") ||
    fileData.mimeType.includes("svg")
  ) {
    return fileData;
  }

  // Skip compression for small files (< 250 KB)
  if (fileData.dataURL.length < 350000) {
    return fileData;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Downscale if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(fileData);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try webp first, fallback to jpeg
      let compressedDataUrl = canvas.toDataURL("image/webp", quality);
      if (!compressedDataUrl.startsWith("data:image/webp")) {
        compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      // Only use if smaller than original
      if (compressedDataUrl.length < fileData.dataURL.length) {
        resolve({
          ...fileData,
          dataURL: compressedDataUrl as any,
          mimeType: compressedDataUrl.startsWith("data:image/webp")
            ? "image/webp"
            : "image/jpeg",
        });
      } else {
        resolve(fileData);
      }
    };

    img.onerror = () => resolve(fileData);
    img.src = fileData.dataURL;
  });
};

/**
 * Compresses an entire BinaryFiles map concurrently.
 */
export const compressBinaryFiles = async (
  files: BinaryFiles,
): Promise<BinaryFiles> => {
  if (!files || Object.keys(files).length === 0) {
    return files;
  }

  const entries = Object.entries(files);
  const compressedEntries = await Promise.all(
    entries.map(async ([id, fileData]) => {
      const compressed = await compressBinaryFile(fileData);
      return [id, compressed] as const;
    }),
  );

  const result: BinaryFiles = {};
  for (const [id, fileData] of compressedEntries) {
    result[id] = fileData;
  }
  return result;
};

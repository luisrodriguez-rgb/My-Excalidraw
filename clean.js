const fs = require('fs');
const path = require('path');

const targets = [
  'excalidraw/examples',
  'excalidraw/dev-docs',
  'excalidraw/firebase-project',
  'excalidraw/.codesandbox',
  'excalidraw/excalidraw-app/components/ExcalidrawPlusPromoBanner.tsx',
  'excalidraw/excalidraw-app/components/ExportToExcalidrawPlus.tsx',
  'excalidraw/excalidraw-app/components/DebugCanvas.tsx'
];

const baseDir = __dirname;

targets.forEach(target => {
  const fullPath = path.join(baseDir, target);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Deleted: ${target}`);
  } else {
    console.log(`Not found (already deleted): ${target}`);
  }
});

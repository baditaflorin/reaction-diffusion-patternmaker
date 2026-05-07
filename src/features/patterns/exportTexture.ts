import type { StateSnapshot } from "./types";
import { stateToHeightmap, stateToImageData } from "./palette";
import type { PaletteId } from "./types";

export function makeExportImage(
  snapshot: StateSnapshot,
  palette: PaletteId,
  kind: "color" | "heightmap",
) {
  return kind === "color"
    ? stateToImageData(snapshot, palette)
    : stateToHeightmap(snapshot);
}

export async function downloadImageData(
  imageData: ImageData,
  filename: string,
  scale = 2,
) {
  const canvas = document.createElement("canvas");
  const source = document.createElement("canvas");
  source.width = imageData.width;
  source.height = imageData.height;
  source.getContext("2d")?.putImageData(imageData, 0, 0);

  canvas.width = imageData.width * scale;
  canvas.height = imageData.height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas export context unavailable");
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error("PNG export failed")),
      "image/png",
    );
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

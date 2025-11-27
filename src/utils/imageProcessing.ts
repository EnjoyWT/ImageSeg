import JSZip from "jszip";
import FileSaver from "file-saver";
import type { GridSettings, ImageInfo } from "../types";

/**
 * loads an image from a source string into an HTMLImageElement
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Calculates the dimensions of the "Viewport" (The final output area)
 */
export const getViewportDimensions = (
  imgWidth: number,
  imgHeight: number,
  cropMode: string
) => {
  if (cropMode === "square") {
    const minDim = Math.min(imgWidth, imgHeight);
    return { width: minDim, height: minDim };
  }
  return { width: imgWidth, height: imgHeight };
};

/**
 * 计算分割线模式下的区域
 */
export const calculateLineRegions = (
  width: number,
  height: number,
  horizontalLines: { position: number }[],
  verticalLines: { position: number }[]
) => {
  const hPositions = [0, ...horizontalLines.map(l => l.position).sort((a, b) => a - b), height];
  const vPositions = [0, ...verticalLines.map(l => l.position).sort((a, b) => a - b), width];

  const regions: { x: number; y: number; width: number; height: number; row: number; col: number }[] = [];

  for (let row = 0; row < hPositions.length - 1; row++) {
    for (let col = 0; col < vPositions.length - 1; col++) {
      const x = vPositions[col] ?? 0;
      const y = hPositions[row] ?? 0;
      const nextX = vPositions[col + 1] ?? width;
      const nextY = hPositions[row + 1] ?? height;
      regions.push({
        x,
        y,
        width: nextX - x,
        height: nextY - y,
        row,
        col,
      });
    }
  }

  return regions;
};

export const processAndDownload = async (
  imageInfo: ImageInfo,
  settings: GridSettings,
  selectedIndices: Set<number>,
  onProgress: (percent: number) => void
) => {
  const { src, originalName } = imageInfo;
  const {
    rows,
    cols,
    format,
    cropMode,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    filePrefix,
    splitMode,
    horizontalLines,
    verticalLines,
  } = settings;

  try {
    const img = await loadImage(src);
    const zip = new JSZip();

    // 分割线模式处理
    if (splitMode === 'lines') {
      // 1. 先应用缩放和裁剪，创建变换后的画布
      const viewport = getViewportDimensions(img.width, img.height, cropMode);
      const transformedCanvas = document.createElement("canvas");
      const transformedCtx = transformedCanvas.getContext("2d");
      if (!transformedCtx) throw new Error("Could not create canvas context");

      transformedCanvas.width = viewport.width;
      transformedCanvas.height = viewport.height;

      // 应用缩放和偏移
      const drawWidth = img.width * scaleX;
      const drawHeight = img.height * scaleY;
      const baseX = (viewport.width - drawWidth) / 2;
      const baseY = (viewport.height - drawHeight) / 2;
      const finalX = baseX + offsetX * viewport.width;
      const finalY = baseY + offsetY * viewport.height;

      transformedCtx.drawImage(img, finalX, finalY, drawWidth, drawHeight);

      // 2. 基于变换后的画布计算分割区域
      const regions = calculateLineRegions(viewport.width, viewport.height, horizontalLines, verticalLines);
      const slicesToExport = selectedIndices.size > 0
        ? Array.from(selectedIndices)
        : Array.from({ length: regions.length }, (_, i) => i);

      let processedCount = 0;
      const sliceCanvas = document.createElement("canvas");
      const sliceCtx = sliceCanvas.getContext("2d");
      if (!sliceCtx) throw new Error("Ctx error");

      for (const index of slicesToExport) {
        const region = regions[index];
        if (!region) continue;

        // 应用边距
        const outputWidth = Math.max(1, Math.round(region.width - paddingLeft - paddingRight));
        const outputHeight = Math.max(1, Math.round(region.height - paddingTop - paddingBottom));

        sliceCanvas.width = outputWidth;
        sliceCanvas.height = outputHeight;
        sliceCtx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        // 从变换后的画布裁剪，应用边距
        const srcX = region.x + paddingLeft;
        const srcY = region.y + paddingTop;
        const srcWidth = region.width - paddingLeft - paddingRight;
        const srcHeight = region.height - paddingTop - paddingBottom;

        sliceCtx.drawImage(
          transformedCanvas,
          srcX, srcY, srcWidth, srcHeight,
          0, 0, outputWidth, outputHeight
        );

        const blob = await new Promise<Blob | null>((resolve) => {
          const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
          sliceCanvas.toBlob(resolve, mimeType, 0.92);
        });

        if (blob) {
          const ext = format === "jpg" ? "jpg" : format;
          const baseName = filePrefix || originalName.substring(0, originalName.lastIndexOf(".")) || "sliced";
          const filename = `${baseName}_${region.row + 1}_${region.col + 1}.${ext}`;
          zip.file(filename, blob);
        }

        processedCount++;
        onProgress(Math.round((processedCount / slicesToExport.length) * 50));
      }

      onProgress(60);
      const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
        onProgress(60 + Math.round(metadata.percent * 0.4));
      });

      onProgress(100);
      const baseNameForZip = filePrefix || originalName.substring(0, originalName.lastIndexOf(".")) || "sliced";
      const zipName = `${baseNameForZip}_lines.zip`;

      const saveAs = (FileSaver as any).saveAs || FileSaver;
      saveAs(content, zipName);
      return;
    }

    // 网格模式处理 (原有逻辑)
    // 1. Determine Viewport Dimensions (The total size of the grid)
    const viewport = getViewportDimensions(img.width, img.height, cropMode);

    // 2. Create a canvas representing the Viewport
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 3. Draw the image onto the viewport with transformations
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    const drawWidth = img.width * scaleX;
    const drawHeight = img.height * scaleY;

    const baseX = (viewport.width - drawWidth) / 2;
    const baseY = (viewport.height - drawHeight) / 2;

    const finalX = baseX + offsetX * viewport.width;
    const finalY = baseY + offsetY * viewport.height;

    ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);

    // 4. Slice Generation with Padding
    const sliceWidth = viewport.width / cols;
    const sliceHeight = viewport.height / rows;

    const totalSlices = rows * cols;
    const slicesToExport =
      selectedIndices.size > 0
        ? Array.from(selectedIndices)
        : Array.from({ length: totalSlices }, (_, i) => i);

    let processedCount = 0;

    const sliceCanvas = document.createElement("canvas");
    const sliceCtx = sliceCanvas.getContext("2d");
    if (!sliceCtx) throw new Error("Ctx error");

    const outputWidth = Math.max(1, Math.floor(sliceWidth - paddingLeft - paddingRight));
    const outputHeight = Math.max(1, Math.floor(sliceHeight - paddingTop - paddingBottom));

    sliceCanvas.width = outputWidth;
    sliceCanvas.height = outputHeight;

    for (const index of slicesToExport) {
      const row = Math.floor(index / cols);
      const col = index % cols;

      sliceCtx.clearRect(0, 0, outputWidth, outputHeight);

      const srcX = col * sliceWidth + paddingLeft;
      const srcY = row * sliceHeight + paddingTop;
      const srcWidth = sliceWidth - paddingLeft - paddingRight;
      const srcHeight = sliceHeight - paddingTop - paddingBottom;

      sliceCtx.drawImage(
        canvas,
        srcX, srcY, srcWidth, srcHeight,
        0, 0, outputWidth, outputHeight
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
        sliceCanvas.toBlob(resolve, mimeType, 0.92);
      });

      if (blob) {
        const ext = format === "jpg" ? "jpg" : format;
        const baseName = filePrefix || originalName.substring(0, originalName.lastIndexOf(".")) || "sliced";
        const filename = `${baseName}_${row + 1}_${col + 1}.${ext}`;
        zip.file(filename, blob);
      }

      processedCount++;
      onProgress(Math.round((processedCount / slicesToExport.length) * 50));
    }

    onProgress(60);
    const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
      onProgress(60 + Math.round(metadata.percent * 0.4));
    });

    onProgress(100);
    const baseNameForZip = filePrefix || originalName.substring(0, originalName.lastIndexOf(".")) || "sliced";
    const zipName = `${baseNameForZip}_grid.zip`;

    const saveAs = (FileSaver as any).saveAs || FileSaver;
    saveAs(content, zipName);
  } catch (error) {
    console.error("Slice generation failed", error);
    throw error;
  }
};

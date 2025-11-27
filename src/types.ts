export type ExportFormat = 'png' | 'jpg' | 'webp';
export type CropMode = 'original' | 'square';
export type SquareFit = 'center' | 'stretch';
export type SplitMode = 'grid' | 'lines';

export interface ImageInfo {
  src: string;
  file: File;
  width: number;
  height: number;
  originalName: string;
}

// 分割线定义 (位置为像素值)
export interface SplitLine {
  id: string;
  position: number; // 像素位置
}

export interface GridSettings {
  rows: number;
  cols: number;
  format: ExportFormat;
  cropMode: CropMode;
  squareFit: SquareFit;
  // Transformed properties
  // scaleX/Y: Multiplier (1 = 100%)
  scaleX: number;
  scaleY: number;
  // offsetX/Y: Percentage of viewport width/height (-0.5 to 0.5 usually)
  offsetX: number;
  offsetY: number;
  // Padding (margin) settings in pixels
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // File naming
  filePrefix: string;
  // 分割模式
  splitMode: SplitMode;
  // 分割线 (仅在 lines 模式下使用)
  horizontalLines: SplitLine[];
  verticalLines: SplitLine[];
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0-100
  error: string | null;
}
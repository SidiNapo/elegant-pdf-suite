// PPTX Types for parsing and rendering

export interface SlideSize {
  width: number;  // in EMU
  height: number; // in EMU
}

export interface Transform {
  x: number;      // in EMU
  y: number;      // in EMU
  width: number;  // in EMU
  height: number; // in EMU
}

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;    // in points
  color?: string;       // hex color
}

export interface TextParagraph {
  runs: TextRun[];
  alignment?: 'left' | 'center' | 'right' | 'justify';
  bulletChar?: string;
  bulletLevel?: number;
  isNumbered?: boolean;
}

export interface ImageData {
  data: string;         // base64 data URL
  format: 'PNG' | 'JPEG' | 'GIF';
  width?: number;
  height?: number;
}

export interface ShapeElement {
  type: 'text' | 'image' | 'shape';
  transform: Transform;
  zIndex: number;       // preserve order
  
  // For text shapes
  paragraphs?: TextParagraph[];
  placeholderType?: 'title' | 'ctrTitle' | 'subTitle' | 'body' | 'other';
  
  // For image shapes
  imageData?: ImageData;
  imageRef?: string;    // r:embed reference
  
  // For basic shapes
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface SlideBackground {
  type: 'solid' | 'image' | 'gradient' | 'none';
  color?: string;       // hex color for solid
  imageData?: ImageData;
  imageRef?: string;
}

export interface ParsedSlide {
  slideNumber: number;
  background: SlideBackground;
  elements: ShapeElement[];
}

export interface ParsedPresentation {
  slideSize: SlideSize;
  slides: ParsedSlide[];
  mediaFiles: Map<string, ImageData>;
  warnings: string[];
}

export interface RenderOptions {
  pageWidth: number;    // in mm
  pageHeight: number;   // in mm
  mode: 'vector' | 'raster';
}

// EMU (English Metric Units) conversion constants
export const EMU_PER_POINT = 12700;
export const EMU_PER_INCH = 914400;
export const EMU_PER_CM = 360000;
export const EMU_PER_MM = 36000;

export function emuToPoints(emu: number): number {
  return emu / EMU_PER_POINT;
}

export function emuToMm(emu: number): number {
  return emu / EMU_PER_MM;
}

export function emuToInches(emu: number): number {
  return emu / EMU_PER_INCH;
}

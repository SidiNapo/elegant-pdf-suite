import jsPDF from 'jspdf';
import {
  ParsedPresentation,
  ParsedSlide,
  ShapeElement,
  SlideBackground,
  TextParagraph,
  RenderOptions,
} from './pptxTypes';

// ============================================================================
// CONSTANTS
// ============================================================================

const EMU_PER_POINT = 12700;

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

function emuToPdf(emu: number, slideEmu: number, pdfSize: number): number {
  return (emu / slideEmu) * pdfSize;
}

function emuToPoints(emu: number): number {
  return emu / EMU_PER_POINT;
}

// ============================================================================
// BACKGROUND RENDERING
// ============================================================================

function renderBackground(
  pdf: jsPDF,
  bg: SlideBackground,
  pageWidth: number,
  pageHeight: number
): void {
  if (bg.type === 'solid' && bg.color) {
    const hex = bg.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  } else if (bg.type === 'image' && bg.imageData) {
    try {
      pdf.addImage(bg.imageData.data, bg.imageData.format, 0, 0, pageWidth, pageHeight);
    } catch (e) {
      console.warn('Background image failed:', e);
    }
  } else {
    // Default white background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  }
}

// ============================================================================
// IMAGE RENDERING
// ============================================================================

function renderImage(
  pdf: jsPDF,
  element: ShapeElement,
  slideWidth: number,
  slideHeight: number,
  pageWidth: number,
  pageHeight: number
): void {
  if (!element.imageData) return;
  
  const x = emuToPdf(element.transform.x, slideWidth, pageWidth);
  const y = emuToPdf(element.transform.y, slideHeight, pageHeight);
  const w = emuToPdf(element.transform.width, slideWidth, pageWidth);
  const h = emuToPdf(element.transform.height, slideHeight, pageHeight);
  
  try {
    pdf.addImage(element.imageData.data, element.imageData.format, x, y, w, h);
  } catch (e) {
    console.warn('Image render failed:', e);
  }
}

// ============================================================================
// TEXT RENDERING
// ============================================================================

function calculateFontSize(
  element: ShapeElement,
  boxHeightMm: number,
  paragraphs: TextParagraph[]
): number {
  // Check for explicit font size
  for (const para of paragraphs) {
    for (const run of para.runs) {
      if (run.fontSize && run.fontSize > 0) {
        // Scale font size appropriately (convert from points to mm-scale)
        const scaledSize = run.fontSize * 0.4;
        return Math.min(Math.max(scaledSize, 6), 32);
      }
    }
  }
  
  // Default sizes based on placeholder type
  switch (element.placeholderType) {
    case 'title':
    case 'ctrTitle':
      return Math.min(24, boxHeightMm * 0.5);
    case 'subTitle':
      return Math.min(16, boxHeightMm * 0.4);
    case 'body':
      return Math.min(12, boxHeightMm * 0.25);
    default:
      return Math.min(10, boxHeightMm * 0.2);
  }
}

function renderTextParagraph(
  pdf: jsPDF,
  para: TextParagraph,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  bulletNum: number
): number {
  // Build full text with bullet/number prefix
  let text = '';
  
  const indent = para.bulletLevel ? para.bulletLevel * 4 : 0;
  const indentMm = indent * 0.5;
  
  if (para.bulletChar) {
    text = para.bulletChar + ' ';
  } else if (para.isNumbered) {
    text = bulletNum + '. ';
  }
  
  para.runs.forEach((run) => {
    text += run.text;
  });
  
  text = text.trim();
  if (!text) return 0;
  
  // Get styling from first run
  const firstRun = para.runs[0];
  let fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal';
  
  if (firstRun?.bold && firstRun?.italic) {
    fontStyle = 'bolditalic';
  } else if (firstRun?.bold) {
    fontStyle = 'bold';
  } else if (firstRun?.italic) {
    fontStyle = 'italic';
  }
  
  // Set color
  if (firstRun?.color) {
    const hex = firstRun.color.replace('#', '');
    pdf.setTextColor(
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    );
  } else {
    pdf.setTextColor(0, 0, 0);
  }
  
  pdf.setFont('helvetica', fontStyle);
  pdf.setFontSize(fontSize);
  
  const effectiveWidth = maxWidth - indentMm;
  const lines: string[] = pdf.splitTextToSize(text, effectiveWidth);
  const lineHeight = fontSize * 0.45;
  
  // Render each line with alignment
  const startX = x + indentMm;
  
  lines.forEach((line: string, i: number) => {
    let lineX = startX;
    
    if (para.alignment === 'center') {
      const lineWidth = pdf.getTextWidth(line);
      lineX = x + (maxWidth - lineWidth) / 2;
    } else if (para.alignment === 'right') {
      const lineWidth = pdf.getTextWidth(line);
      lineX = x + maxWidth - lineWidth;
    }
    
    pdf.text(line, lineX, y + i * lineHeight);
  });
  
  return lines.length * lineHeight;
}

function renderText(
  pdf: jsPDF,
  element: ShapeElement,
  slideWidth: number,
  slideHeight: number,
  pageWidth: number,
  pageHeight: number
): void {
  if (!element.paragraphs || element.paragraphs.length === 0) return;
  
  const x = emuToPdf(element.transform.x, slideWidth, pageWidth);
  const y = emuToPdf(element.transform.y, slideHeight, pageHeight);
  const w = emuToPdf(element.transform.width, slideWidth, pageWidth);
  const h = emuToPdf(element.transform.height, slideHeight, pageHeight);
  
  // Draw fill color if present
  if (element.fillColor) {
    const hex = element.fillColor.replace('#', '');
    pdf.setFillColor(
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    );
    pdf.rect(x, y, w, h, 'F');
  }
  
  const fontSize = calculateFontSize(element, h, element.paragraphs);
  const padding = 2;
  
  let currentY = y + fontSize * 0.5 + padding;
  let bulletNum = 1;
  
  for (const para of element.paragraphs) {
    // Don't render past the box
    if (currentY > y + h) break;
    
    const usedHeight = renderTextParagraph(
      pdf,
      para,
      x + padding,
      currentY,
      w - padding * 2,
      fontSize,
      bulletNum
    );
    
    currentY += usedHeight + fontSize * 0.3;
    
    if (para.isNumbered) bulletNum++;
  }
}

// ============================================================================
// SLIDE RENDERING
// ============================================================================

function renderSlide(
  pdf: jsPDF,
  slide: ParsedSlide,
  slideWidth: number,
  slideHeight: number,
  pageWidth: number,
  pageHeight: number
): void {
  // Background
  renderBackground(pdf, slide.background, pageWidth, pageHeight);
  
  // Sort by z-index
  const sortedElements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
  
  // Render elements
  for (const element of sortedElements) {
    try {
      if (element.type === 'image') {
        renderImage(pdf, element, slideWidth, slideHeight, pageWidth, pageHeight);
      } else if (element.type === 'text') {
        renderText(pdf, element, slideWidth, slideHeight, pageWidth, pageHeight);
      }
    } catch (e) {
      console.warn('Element render failed:', e);
    }
  }
  
  // Slide number
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(slide.slideNumber), pageWidth - 8, pageHeight - 4);
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

export function renderPresentationToPDF(
  presentation: ParsedPresentation,
  options?: Partial<RenderOptions>
): jsPDF {
  if (!presentation?.slides?.length) {
    throw new Error('Présentation vide ou invalide');
  }
  
  const slideWidth = presentation.slideSize?.width || 9144000;
  const slideHeight = presentation.slideSize?.height || 6858000;
  const aspectRatio = slideWidth / slideHeight;
  
  // Calculate page dimensions
  let pageWidth: number;
  let pageHeight: number;
  
  if (aspectRatio > 1) {
    // Landscape
    pageWidth = 297;
    pageHeight = pageWidth / aspectRatio;
    if (pageHeight > 210) {
      pageHeight = 210;
      pageWidth = pageHeight * aspectRatio;
    }
  } else {
    // Portrait
    pageHeight = 297;
    pageWidth = pageHeight * aspectRatio;
    if (pageWidth > 210) {
      pageWidth = 210;
      pageHeight = pageWidth / aspectRatio;
    }
  }
  
  if (options?.pageWidth) pageWidth = options.pageWidth;
  if (options?.pageHeight) pageHeight = options.pageHeight;
  
  const pdf = new jsPDF({
    orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageWidth, pageHeight],
  });
  
  presentation.slides.forEach((slide, index) => {
    try {
      if (index > 0) {
        pdf.addPage([pageWidth, pageHeight]);
      }
      renderSlide(pdf, slide, slideWidth, slideHeight, pageWidth, pageHeight);
    } catch (e) {
      console.warn(`Slide ${index + 1} failed:`, e);
    }
  });
  
  return pdf;
}

export function renderPresentationToBytes(
  presentation: ParsedPresentation,
  options?: Partial<RenderOptions>
): Uint8Array {
  const pdf = renderPresentationToPDF(presentation, options);
  const arrayBuffer = pdf.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

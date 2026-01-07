import jsPDF from 'jspdf';
import {
  ParsedPresentation,
  ParsedSlide,
  ShapeElement,
  SlideBackground,
  TextParagraph,
  RenderOptions,
  emuToMm,
} from './pptxTypes';

// Convert EMU to PDF coordinates
function emuToPdf(
  emu: number,
  slideEmu: number,
  pdfMm: number
): number {
  return (emu / slideEmu) * pdfMm;
}

// Render background
function renderBackground(
  pdf: jsPDF,
  background: SlideBackground,
  pageWidth: number,
  pageHeight: number
): void {
  if (background.type === 'solid' && background.color) {
    // Parse hex color
    const hex = background.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    pdf.setFillColor(r, g, b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  } else if (background.type === 'image' && background.imageData) {
    try {
      pdf.addImage(
        background.imageData.data,
        background.imageData.format,
        0,
        0,
        pageWidth,
        pageHeight
      );
    } catch (e) {
      console.warn('Failed to render background image:', e);
    }
  }
}

// Render image element
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
    pdf.addImage(
      element.imageData.data,
      element.imageData.format,
      x,
      y,
      w,
      h
    );
  } catch (e) {
    console.warn('Failed to render image:', e);
  }
}

// Get font size based on placeholder type and box size
function getFontSize(
  element: ShapeElement,
  boxHeightMm: number
): number {
  // Check if we have explicit font size in paragraphs
  if (element.paragraphs && element.paragraphs.length > 0) {
    const firstRun = element.paragraphs[0].runs[0];
    if (firstRun?.fontSize && firstRun.fontSize > 0) {
      // Convert points to appropriate size for PDF
      // Scale down if too large for box
      let size = firstRun.fontSize * 0.35; // Convert pt to mm-ish scale
      const maxSize = boxHeightMm * 0.8;
      return Math.min(size, maxSize, 28);
    }
  }
  
  // Default sizes based on placeholder type
  switch (element.placeholderType) {
    case 'title':
      return Math.min(24, boxHeightMm * 0.6);
    case 'ctrTitle':
      return Math.min(28, boxHeightMm * 0.6);
    case 'subTitle':
      return Math.min(16, boxHeightMm * 0.5);
    case 'body':
      return Math.min(12, boxHeightMm * 0.3);
    default:
      return Math.min(11, boxHeightMm * 0.3);
  }
}

// Render text paragraph
function renderParagraph(
  pdf: jsPDF,
  para: TextParagraph,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  bulletNumber?: number
): number {
  // Build full text
  let text = '';
  
  // Add bullet/number prefix
  if (para.bulletChar) {
    const indent = '  '.repeat(para.bulletLevel || 0);
    text = indent + para.bulletChar + ' ';
  } else if (para.isNumbered && bulletNumber !== undefined) {
    const indent = '  '.repeat(para.bulletLevel || 0);
    text = indent + bulletNumber + '. ';
  }
  
  // Concatenate all runs
  para.runs.forEach((run) => {
    text += run.text;
  });
  
  if (!text.trim()) return 0;
  
  // Set font style based on first run
  const firstRun = para.runs[0];
  let fontStyle = 'normal';
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
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    pdf.setTextColor(r, g, b);
  } else {
    pdf.setTextColor(0, 0, 0);
  }
  
  pdf.setFont('helvetica', fontStyle);
  pdf.setFontSize(fontSize);
  
  // Wrap text to fit width
  const lines = pdf.splitTextToSize(text, maxWidth);
  const lineHeight = fontSize * 0.4; // mm per line
  
  // Handle alignment
  let textX = x;
  if (para.alignment === 'center') {
    // Center each line
    lines.forEach((line: string, i: number) => {
      const lineWidth = pdf.getTextWidth(line);
      const centeredX = x + (maxWidth - lineWidth) / 2;
      pdf.text(line, centeredX, y + i * lineHeight);
    });
  } else if (para.alignment === 'right') {
    lines.forEach((line: string, i: number) => {
      const lineWidth = pdf.getTextWidth(line);
      const rightX = x + maxWidth - lineWidth;
      pdf.text(line, rightX, y + i * lineHeight);
    });
  } else {
    pdf.text(lines, textX, y);
  }
  
  return lines.length * lineHeight;
}

// Render text element
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
  
  const fontSize = getFontSize(element, h);
  const padding = 2; // mm
  
  let currentY = y + fontSize * 0.4 + padding;
  let bulletNumber = 1;
  
  element.paragraphs.forEach((para) => {
    const heightUsed = renderParagraph(
      pdf,
      para,
      x + padding,
      currentY,
      w - padding * 2,
      fontSize,
      bulletNumber
    );
    
    currentY += heightUsed + fontSize * 0.2; // Add spacing between paragraphs
    
    if (para.isNumbered) {
      bulletNumber++;
    }
  });
}

// Render a single slide
function renderSlide(
  pdf: jsPDF,
  slide: ParsedSlide,
  slideWidth: number,
  slideHeight: number,
  pageWidth: number,
  pageHeight: number
): void {
  // Render background first
  renderBackground(pdf, slide.background, pageWidth, pageHeight);
  
  // Sort elements by z-index to maintain layering
  const sortedElements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
  
  // Render each element
  sortedElements.forEach((element) => {
    if (element.type === 'image') {
      renderImage(pdf, element, slideWidth, slideHeight, pageWidth, pageHeight);
    } else if (element.type === 'text') {
      renderText(pdf, element, slideWidth, slideHeight, pageWidth, pageHeight);
    }
  });
  
  // Add slide number
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`${slide.slideNumber}`, pageWidth - 10, pageHeight - 5);
}

// Main render function
export function renderPresentationToPDF(
  presentation: ParsedPresentation,
  options?: Partial<RenderOptions>
): jsPDF {
  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    throw new Error('Présentation invalide ou vide');
  }

  // Calculate aspect ratio from slide size
  const slideWidth = presentation.slideSize?.width || 9144000;
  const slideHeight = presentation.slideSize?.height || 6858000;
  const aspectRatio = slideWidth / slideHeight;
  
  // Default to A4 landscape if wider than tall, portrait otherwise
  let pageWidth: number;
  let pageHeight: number;
  
  if (aspectRatio > 1) {
    // Landscape
    pageWidth = 297; // A4 landscape width
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
  
  // Override with options if provided
  if (options?.pageWidth) pageWidth = options.pageWidth;
  if (options?.pageHeight) pageHeight = options.pageHeight;
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageWidth, pageHeight],
  });
  
  // Render each slide
  presentation.slides.forEach((slide, index) => {
    try {
      if (index > 0) {
        pdf.addPage([pageWidth, pageHeight]);
      }
      
      renderSlide(
        pdf,
        slide,
        slideWidth,
        slideHeight,
        pageWidth,
        pageHeight
      );
    } catch (error) {
      console.warn(`Failed to render slide ${index + 1}:`, error);
      // Continue with next slide
    }
  });
  
  return pdf;
}

// Export as Uint8Array
export function renderPresentationToBytes(
  presentation: ParsedPresentation,
  options?: Partial<RenderOptions>
): Uint8Array {
  try {
    const pdf = renderPresentationToPDF(presentation, options);
    const arrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Failed to render presentation to bytes:', error);
    throw new Error('Échec de la génération du PDF. Veuillez réessayer.');
  }
}

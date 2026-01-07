import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import * as pdfjs from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// CRITICAL: Point pdf.js to a bundled local worker (prevents CDN 404 / "No workerSrc specified")
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

// Singleton to track initialization
let pdfjsInitialized = false;

export const initPdfJs = async () => {
  if (!pdfjsInitialized) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    pdfjsInitialized = true;
  }
  return pdfjs;
};

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Merge multiple PDFs
export const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return mergedPdf.save();
};

// Split PDF into individual pages
export const splitPDF = async (file: File): Promise<Uint8Array[]> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages: Uint8Array[] = [];
  
  for (let i = 0; i < pdf.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);
    pages.push(await newPdf.save());
  }
  
  return pages;
};

// Delete specific pages from PDF
export const deletePages = async (file: File, pagesToDelete: number[]): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const allPages = pdf.getPageIndices();
  const pagesToKeep = allPages.filter(i => !pagesToDelete.includes(i));
  
  const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));
  
  return newPdf.save();
};

// Extract specific pages from PDF
export const extractPages = async (file: File, pagesToExtract: number[]): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));
  
  return newPdf.save();
};

// Rotate PDF pages
export const rotatePDF = async (file: File, rotation: number): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const pages = pdf.getPages();
  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  });
  
  return pdf.save();
};

// Add page numbers to PDF
export const addPageNumbers = async (
  file: File, 
  position: 'top' | 'bottom' = 'bottom',
  format: string = 'Page {n} of {total}'
): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  const pages = pdf.getPages();
  const total = pages.length;
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = format.replace('{n}', String(index + 1)).replace('{total}', String(total));
    const textWidth = font.widthOfTextAtSize(text, 12);
    
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: position === 'bottom' ? 30 : height - 30,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  
  return pdf.save();
};

// Add watermark to PDF
export const addWatermark = async (
  file: File, 
  text: string,
  opacity: number = 0.3
): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  const pages = pdf.getPages();
  
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity,
      rotate: degrees(-45),
    });
  });
  
  return pdf.save();
};

// Compress PDF (basic - removes unused objects)
export const compressPDF = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  
  return pdf.save({
    useObjectStreams: true,
  });
};

// Convert JPG/PNG images to PDF
export const imagesToPDF = async (files: File[]): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdf.embedJpg(uint8Array);
    } else if (file.type === 'image/png') {
      image = await pdf.embedPng(uint8Array);
    } else {
      continue;
    }
    
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  return pdf.save();
};

// Convert PDF to images
export const pdfToImages = async (file: File): Promise<string[]> => {
  try {
    // Ensure pdf.js worker is configured (can be reset during HMR)
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Load PDF with worker completely disabled
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      disableAutoFetch: true,
      disableStream: true,
    });
    
    const pdf = await loadingTask.promise;
    const images: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      } as any).promise;
      
      images.push(canvas.toDataURL('image/jpeg', 0.9));
    }
    
    return images;
  } catch (error) {
    console.error('PDF to images error:', error);
    throw new Error('Impossible de convertir le PDF. Le fichier est peut-être corrompu.');
  }
};

// Get PDF page count
export const getPDFPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
};

// Download helper
export const downloadPDF = (data: Uint8Array, filename: string) => {
  const blob = new Blob([data.slice().buffer], { type: 'application/pdf' });
  saveAs(blob, filename);
};

// Download multiple PDFs as ZIP
export const downloadPDFsAsZip = async (pdfs: { data: Uint8Array; name: string }[], zipName: string) => {
  const zip = new JSZip();
  
  pdfs.forEach(({ data, name }) => {
    zip.file(name, data);
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
};

// Download images as ZIP
export const downloadImagesAsZip = async (images: string[], baseName: string) => {
  const zip = new JSZip();
  
  images.forEach((dataUrl, index) => {
    const base64 = dataUrl.split(',')[1];
    zip.file(`${baseName}_page_${index + 1}.jpg`, base64, { base64: true });
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseName}.zip`);
};

// ==================== CONVERSION UTILITIES ====================

// Convert Word (DOCX) to PDF using mammoth and jspdf - improved text rendering
export const wordToPDF = async (file: File): Promise<Uint8Array> => {
  const mammoth = await import('mammoth');
  const { jsPDF } = await import('jspdf');
  
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  // Extract as plain text with better structure preservation
  const textResult = await mammoth.extractRawText({ arrayBuffer });
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 7;
  
  // Parse HTML for basic formatting
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlResult.value;
  
  let yPos = margin;
  
  // Process each element
  const processElement = (element: Element) => {
    const tagName = element.tagName?.toLowerCase() || '';
    const text = element.textContent?.trim() || '';
    
    if (!text) return;
    
    // Set font based on element type
    if (tagName === 'h1') {
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
    } else if (tagName === 'h2') {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
    } else if (tagName === 'h3') {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
    } else if (tagName === 'strong' || tagName === 'b') {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
    }
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      if (yPos + lineHeight > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += lineHeight;
    }
    
    // Add extra space after headings
    if (tagName.startsWith('h')) {
      yPos += lineHeight / 2;
    }
  };
  
  // Get all text-containing elements
  const elements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, span, div');
  
  if (elements.length > 0) {
    elements.forEach(processElement);
  } else {
    // Fallback to raw text if no structured elements
    const text = textResult.value;
    const paragraphs = text.split(/\n\n+/);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    for (const para of paragraphs) {
      if (!para.trim()) continue;
      
      const lines = pdf.splitTextToSize(para.trim(), maxWidth);
      
      for (const line of lines) {
        if (yPos + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin, yPos);
        yPos += lineHeight;
      }
      yPos += lineHeight / 2; // Paragraph spacing
    }
  }
  
  return new Uint8Array(pdf.output('arraybuffer'));
};

// Convert Excel to PDF
export const excelToPDF = async (file: File): Promise<Uint8Array> => {
  const XLSX = await import('xlsx');
  const { jsPDF } = await import('jspdf');
  
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const pdf = new jsPDF('l', 'mm', 'a4'); // landscape for tables
  let isFirstPage = true;
  
  for (const sheetName of workbook.SheetNames) {
    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;
    
    const sheet = workbook.Sheets[sheetName];
    const htmlString = XLSX.utils.sheet_to_html(sheet);
    
    // Create container
    const container = document.createElement('div');
    container.innerHTML = htmlString;
    container.style.cssText = 'position: absolute; left: -9999px; width: 800px; padding: 20px; font-family: Arial, sans-serif; font-size: 10px;';
    
    // Style the table
    const table = container.querySelector('table');
    if (table) {
      table.style.cssText = 'border-collapse: collapse; width: 100%;';
      table.querySelectorAll('td, th').forEach((cell: Element) => {
        (cell as HTMLElement).style.cssText = 'border: 1px solid #ddd; padding: 6px 8px; text-align: left;';
      });
      table.querySelectorAll('th').forEach((th: Element) => {
        (th as HTMLElement).style.cssText += 'background-color: #f5f5f5; font-weight: bold;';
      });
    }
    
    document.body.appendChild(container);
    
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(container, {} as any);
    
    document.body.removeChild(container);
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
    
    pdf.setFontSize(14);
    pdf.text(sheetName, 10, 15);
    pdf.addImage(imgData, 'JPEG', 10, 20, imgWidth * ratio, imgHeight * ratio);
  }
  
  return new Uint8Array(pdf.output('arraybuffer'));
};

// ==================== PPTX TO PDF - COMPLETE REWRITE ====================

// Helper: decode XML entities
const decodeXmlEntities = (text: string): string => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
};

// Helper: extract paragraphs from a text frame (a:txBody)
const extractParagraphsFromTextBody = (txBody: Element): { text: string; isTitle: boolean; isBullet: boolean }[] => {
  const paragraphs: { text: string; isTitle: boolean; isBullet: boolean }[] = [];
  const pNodes = txBody.querySelectorAll('a\\:p, p');
  
  pNodes.forEach((pNode) => {
    // Get all text runs (a:t) and join them
    const textNodes = pNode.querySelectorAll('a\\:t, t');
    let paragraphText = '';
    textNodes.forEach((tNode) => {
      paragraphText += tNode.textContent || '';
    });
    
    // Handle line breaks
    const brNodes = pNode.querySelectorAll('a\\:br, br');
    if (brNodes.length > 0) {
      paragraphText = paragraphText.replace(/\s+/g, ' ');
    }
    
    paragraphText = decodeXmlEntities(paragraphText.trim());
    
    if (!paragraphText) return;
    
    // Check for bullets
    const pPr = pNode.querySelector('a\\:pPr, pPr');
    let isBullet = false;
    if (pPr) {
      const hasBuChar = pPr.querySelector('a\\:buChar, buChar');
      const hasBuAutoNum = pPr.querySelector('a\\:buAutoNum, buAutoNum');
      const hasBuNone = pPr.querySelector('a\\:buNone, buNone');
      isBullet = (hasBuChar !== null || hasBuAutoNum !== null) && hasBuNone === null;
    }
    
    paragraphs.push({ text: paragraphText, isTitle: false, isBullet });
  });
  
  return paragraphs;
};

// Helper: parse shape properties (position, size)
interface ShapeTransform {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

const parseShapeTransform = (spPr: Element | null): ShapeTransform | null => {
  if (!spPr) return null;
  
  const xfrm = spPr.querySelector('a\\:xfrm, xfrm');
  if (!xfrm) return null;
  
  const off = xfrm.querySelector('a\\:off, off');
  const ext = xfrm.querySelector('a\\:ext, ext');
  
  if (!off || !ext) return null;
  
  return {
    x: parseInt(off.getAttribute('x') || '0'),
    y: parseInt(off.getAttribute('y') || '0'),
    cx: parseInt(ext.getAttribute('cx') || '0'),
    cy: parseInt(ext.getAttribute('cy') || '0'),
  };
};

// Helper: detect placeholder type
const getPlaceholderType = (nvSpPr: Element | null): string | null => {
  if (!nvSpPr) return null;
  const ph = nvSpPr.querySelector('p\\:ph, ph');
  if (!ph) return null;
  return ph.getAttribute('type') || 'body';
};

// Convert PowerPoint to PDF - COMPLETELY REBUILT
export const pptToPDF = async (file: File): Promise<Uint8Array> => {
  const { jsPDF } = await import('jspdf');
  
  // Check if it's a .ppt (binary) file
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.ppt') && !fileName.endsWith('.pptx')) {
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Format non supporté', 20, 40);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Les fichiers .ppt (ancienne version) ne sont pas supportés.', 20, 55);
    pdf.text('Veuillez convertir votre fichier en .pptx (PowerPoint 2007+).', 20, 65);
    return new Uint8Array(pdf.output('arraybuffer'));
  }
  
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Get slide size from presentation.xml
  let slideCx = 9144000; // default 10 inches in EMU
  let slideCy = 6858000; // default 7.5 inches in EMU
  
  const presentationXml = await zip.file('ppt/presentation.xml')?.async('string');
  if (presentationXml) {
    const parser = new DOMParser();
    const presDoc = parser.parseFromString(presentationXml, 'application/xml');
    const sldSz = presDoc.querySelector('p\\:sldSz, sldSz');
    if (sldSz) {
      slideCx = parseInt(sldSz.getAttribute('cx') || '9144000');
      slideCy = parseInt(sldSz.getAttribute('cy') || '6858000');
    }
  }
  
  const pdf = new jsPDF('l', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  
  // EMU to PDF mm conversion
  const emuToMmX = (emu: number) => (emu / slideCx) * (pdfWidth - margin * 2);
  const emuToMmY = (emu: number) => (emu / slideCy) * (pdfHeight - margin * 2);
  
  // Collect slide files
  const slideFiles: string[] = [];
  zip.forEach((relativePath) => {
    if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
      slideFiles.push(relativePath);
    }
  });
  
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
    const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
    return numA - numB;
  });
  
  // Load all media images
  const mediaImages: Map<string, string> = new Map();
  const imageFiles: string[] = [];
  zip.forEach((path) => {
    if (path.startsWith('ppt/media/') && /\.(png|jpg|jpeg|gif|bmp)$/i.test(path)) {
      imageFiles.push(path);
    }
  });
  
  for (const imgPath of imageFiles) {
    try {
      const imgData = await zip.file(imgPath)?.async('base64');
      if (imgData) {
        const ext = imgPath.split('.').pop()?.toLowerCase() || 'png';
        const imgName = imgPath.split('/').pop() || '';
        mediaImages.set(imgName, `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${imgData}`);
      }
    } catch (e) {
      console.warn('Failed to load image:', imgPath);
    }
  }
  
  const parser = new DOMParser();
  let isFirstPage = true;
  
  for (const slideFile of slideFiles) {
    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;
    
    const slideXmlStr = await zip.file(slideFile)?.async('string');
    if (!slideXmlStr) continue;
    
    const slideDoc = parser.parseFromString(slideXmlStr, 'application/xml');
    
    // Draw slide background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    pdf.setDrawColor(230, 230, 235);
    pdf.setLineWidth(0.3);
    pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);
    
    // Load relationships for this slide (for images)
    const slideNum = slideFile.match(/slide(\d+)\.xml/)?.[1] || '1';
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsXmlStr = await zip.file(relsPath)?.async('string');
    const imageRelMap: Map<string, string> = new Map();
    
    if (relsXmlStr) {
      const relsDoc = parser.parseFromString(relsXmlStr, 'application/xml');
      const relationships = relsDoc.querySelectorAll('Relationship');
      relationships.forEach((rel) => {
        const rId = rel.getAttribute('Id') || '';
        const target = rel.getAttribute('Target') || '';
        if (target.includes('/media/') || target.includes('../media/')) {
          const imgName = target.split('/').pop() || '';
          imageRelMap.set(rId, imgName);
        }
      });
    }
    
    // Collect all shapes with their positions
    interface TextShape {
      type: 'text';
      transform: ShapeTransform;
      placeholderType: string | null;
      paragraphs: { text: string; isTitle: boolean; isBullet: boolean }[];
    }
    
    interface ImageShape {
      type: 'image';
      transform: ShapeTransform;
      rId: string;
    }
    
    type SlideShape = TextShape | ImageShape;
    const shapes: SlideShape[] = [];
    
    // Parse text shapes (p:sp)
    const spNodes = slideDoc.querySelectorAll('p\\:sp, sp');
    spNodes.forEach((sp) => {
      const nvSpPr = sp.querySelector('p\\:nvSpPr, nvSpPr');
      const spPr = sp.querySelector('p\\:spPr, spPr');
      const txBody = sp.querySelector('p\\:txBody, txBody');
      
      const transform = parseShapeTransform(spPr);
      const placeholderType = getPlaceholderType(nvSpPr);
      
      if (txBody) {
        const paragraphs = extractParagraphsFromTextBody(txBody);
        if (paragraphs.length > 0 && transform) {
          // Mark title paragraphs
          if (placeholderType === 'title' || placeholderType === 'ctrTitle') {
            paragraphs.forEach(p => p.isTitle = true);
          }
          shapes.push({
            type: 'text',
            transform,
            placeholderType,
            paragraphs,
          });
        }
      }
    });
    
    // Parse image shapes (p:pic)
    const picNodes = slideDoc.querySelectorAll('p\\:pic, pic');
    picNodes.forEach((pic) => {
      const spPr = pic.querySelector('p\\:spPr, spPr');
      const blip = pic.querySelector('a\\:blip, blip');
      
      const transform = parseShapeTransform(spPr);
      const rEmbed = blip?.getAttribute('r:embed') || blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
      
      if (transform && rEmbed) {
        shapes.push({
          type: 'image',
          transform,
          rId: rEmbed,
        });
      }
    });
    
    // Sort shapes by Y position (top to bottom), then X (left to right)
    shapes.sort((a, b) => {
      if (Math.abs(a.transform.y - b.transform.y) < 100000) {
        return a.transform.x - b.transform.x;
      }
      return a.transform.y - b.transform.y;
    });
    
    // Render shapes
    for (const shape of shapes) {
      if (shape.type === 'text') {
        const x = margin + emuToMmX(shape.transform.x);
        const y = margin + emuToMmY(shape.transform.y);
        const boxWidth = emuToMmX(shape.transform.cx);
        
        let yPos = y;
        
        for (const para of shape.paragraphs) {
          if (para.isTitle) {
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 30, 40);
          } else {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(50, 50, 60);
          }
          
          const textToRender = para.isBullet ? `• ${para.text}` : para.text;
          const effectiveWidth = Math.max(boxWidth, 50);
          const lines = pdf.splitTextToSize(textToRender, effectiveWidth);
          
          for (const line of lines) {
            if (yPos < pdfHeight - margin) {
              pdf.text(line, x, yPos);
              yPos += para.isTitle ? 10 : 6;
            }
          }
          
          yPos += para.isTitle ? 4 : 2;
        }
      } else if (shape.type === 'image') {
        const imgName = imageRelMap.get(shape.rId);
        if (imgName && mediaImages.has(imgName)) {
          try {
            const imgData = mediaImages.get(imgName)!;
            const x = margin + emuToMmX(shape.transform.x);
            const y = margin + emuToMmY(shape.transform.y);
            const w = emuToMmX(shape.transform.cx);
            const h = emuToMmY(shape.transform.cy);
            
            // Clamp dimensions
            const maxW = pdfWidth - margin * 2;
            const maxH = pdfHeight - margin * 2;
            const finalW = Math.min(w, maxW);
            const finalH = Math.min(h, maxH);
            
            pdf.addImage(imgData, 'JPEG', x, y, finalW, finalH);
          } catch (e) {
            console.warn('Failed to add image:', imgName);
          }
        }
      }
    }
    
    // Add slide number
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 155);
    pdf.text(slideNum, pdfWidth - 12, pdfHeight - 8);
  }
  
  // Handle empty presentation
  if (slideFiles.length === 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Aucune diapositive trouvée', 20, 40);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Le fichier PowerPoint ne contient pas de diapositives lisibles.', 20, 55);
  }
  
  return new Uint8Array(pdf.output('arraybuffer'));
};

// Convert HTML string to PDF
export const htmlToPDF = async (htmlContent: string): Promise<Uint8Array> => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.cssText = 'position: absolute; left: -9999px; width: 595px; padding: 40px; font-family: Arial, sans-serif; background: white;';
  document.body.appendChild(container);
  
  const canvas = await html2canvas(container, { useCORS: true } as any);
  document.body.removeChild(container);
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  
  const pageHeightPx = pdfHeight / ratio;
  let heightLeft = imgHeight;
  let position = 0;
  
  while (heightLeft > 0) {
    if (position > 0) {
      pdf.addPage();
    }
    
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      -position * ratio,
      imgWidth * ratio,
      imgHeight * ratio
    );
    
    heightLeft -= pageHeightPx;
    position += pageHeightPx;
  }
  
  return new Uint8Array(pdf.output('arraybuffer'));
};

// Extract text from PDF (for PDF to Word/Excel/PPT)
export const extractTextFromPDF = async (file: File): Promise<string[]> => {
  try {
    const pdfjs = await initPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    const pages: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: unknown) => item && typeof item === 'object' && 'str' in item)
        .map((item: unknown) => (item as { str: string }).str || '')
        .join(' ');
      pages.push(pageText);
    }
    
    return pages;
  } catch (error) {
    console.error('Extract text error:', error);
    throw new Error('Impossible d\'extraire le texte du PDF.');
  }
};

// Create Word document from text
export const createWordDocument = (pages: string[], filename: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 2cm; }
        .page { margin-bottom: 2em; padding-bottom: 2em; border-bottom: 1px solid #eee; }
        .page:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      ${pages.map((text, i) => `<div class="page"><p>${text.replace(/\n/g, '</p><p>')}</p></div>`).join('')}
    </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  saveAs(blob, filename);
};

// Create Excel document from text
export const createExcelDocument = async (pages: string[], filename: string) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  
  pages.forEach((pageText, index) => {
    const lines = pageText.split(/\s{2,}|\n/).filter(line => line.trim());
    const data = lines.map(line => [line]);
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, `Page ${index + 1}`);
  });
  
  const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
};

// Create PowerPoint from PDF images
export const createPowerPointFromImages = async (images: string[], filename: string) => {
  const zip = new JSZip();
  
  // Basic PPTX structure
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${images.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n  ')}
</Types>`;
  
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;
  
  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    ${images.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`).join('\n    ')}
  </p:sldIdLst>
</p:presentation>`;
  
  const presentationRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${images.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join('\n  ')}
</Relationships>`;
  
  zip.file('[Content_Types].xml', contentTypes);
  zip.file('_rels/.rels', rels);
  zip.file('ppt/presentation.xml', presentation);
  zip.file('ppt/_rels/presentation.xml.rels', presentationRels);
  
  // Add slides and images
  for (let i = 0; i < images.length; i++) {
    const slide = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:pic>
        <p:nvPicPr><p:cNvPr id="2" name="Image"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"/></p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`;
    
    const slideRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i + 1}.jpeg"/>
</Relationships>`;
    
    zip.file(`ppt/slides/slide${i + 1}.xml`, slide);
    zip.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, slideRels);
    
    // Add image
    const base64 = images[i].split(',')[1];
    zip.file(`ppt/media/image${i + 1}.jpeg`, base64, { base64: true });
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, filename);
};

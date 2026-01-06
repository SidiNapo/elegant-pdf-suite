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

// Convert PowerPoint to PDF (improved with image extraction)
export const pptToPDF = async (file: File): Promise<Uint8Array> => {
  const { jsPDF } = await import('jspdf');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const pdf = new jsPDF('l', 'mm', 'a4'); // landscape for slides
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Collect all slide files
  const slideFiles: string[] = [];
  zip.forEach((relativePath) => {
    if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
      slideFiles.push(relativePath);
    }
  });
  
  // Sort slides by number
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
    const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
    return numA - numB;
  });
  
  // Extract images from media folder
  const mediaImages: Map<string, string> = new Map();
  const mediaFolder = zip.folder('ppt/media');
  if (mediaFolder) {
    const imageFiles: string[] = [];
    zip.forEach((path) => {
      if (path.startsWith('ppt/media/') && /\.(png|jpg|jpeg|gif)$/i.test(path)) {
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
  }
  
  let isFirstPage = true;
  
  for (const slideFile of slideFiles) {
    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;
    
    const slideXml = await zip.file(slideFile)?.async('string');
    if (!slideXml) continue;
    
    // Draw slide background
    pdf.setFillColor(250, 250, 252);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    
    // Draw slide border with rounded effect
    pdf.setDrawColor(220, 220, 225);
    pdf.setLineWidth(0.5);
    pdf.rect(8, 8, pdfWidth - 16, pdfHeight - 16);
    
    // Extract all text blocks
    const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    const texts = textMatches.map(match => 
      match.replace(/<\/?a:t>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
    ).filter(t => t.trim());
    
    // Add slide number
    const slideNum = slideFile.match(/slide(\d+)\.xml/)?.[1] || '?';
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 155);
    pdf.text(`${slideNum}`, pdfWidth - 15, pdfHeight - 8);
    
    // Render text content with better layout
    pdf.setTextColor(30, 30, 35);
    let yPos = 25;
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i].trim();
      if (!text) continue;
      
      // First text is usually title
      if (i === 0) {
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        const lines = pdf.splitTextToSize(text, pdfWidth - 50);
        for (const line of lines) {
          if (yPos < pdfHeight - 20) {
            pdf.text(line, 25, yPos);
            yPos += 12;
          }
        }
        yPos += 8;
      } else {
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(text, pdfWidth - 50);
        for (const line of lines) {
          if (yPos < pdfHeight - 20) {
            pdf.text('• ' + line, 25, yPos);
            yPos += 8;
          }
        }
      }
    }
    
    // Try to add images from relationships
    const slideNum2 = slideFile.match(/slide(\d+)\.xml/)?.[1];
    const relsPath = `ppt/slides/_rels/slide${slideNum2}.xml.rels`;
    const relsXml = await zip.file(relsPath)?.async('string');
    
    if (relsXml && mediaImages.size > 0) {
      const imageRefs = relsXml.match(/Target="\.\.\/media\/([^"]+)"/g) || [];
      let imgX = pdfWidth - 90;
      let imgY = 30;
      
      for (const ref of imageRefs.slice(0, 2)) { // Max 2 images per slide
        const imgName = ref.match(/media\/([^"]+)/)?.[1];
        if (imgName && mediaImages.has(imgName)) {
          try {
            const imgData = mediaImages.get(imgName)!;
            pdf.addImage(imgData, 'JPEG', imgX, imgY, 60, 45);
            imgY += 50;
          } catch (e) {
            console.warn('Failed to add image to PDF');
          }
        }
      }
    }
  }
  
  if (slideFiles.length === 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Impossible d\'extraire le contenu de ce fichier PowerPoint.', 20, 40);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Le fichier est peut-être dans un format non supporté.', 20, 55);
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

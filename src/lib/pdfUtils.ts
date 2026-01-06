import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Initialize PDF.js worker
export const initPdfJs = async () => {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
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
  const pdfjs = await initPdfJs();
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 2;
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Use type assertion to handle pdfjs-dist typing issues
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    } as Parameters<typeof page.render>[0];
    
    await page.render(renderContext).promise;
    
    images.push(canvas.toDataURL('image/jpeg', 0.9));
  }
  
  return images;
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

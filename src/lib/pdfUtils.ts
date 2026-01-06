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

// ==================== CONVERSION UTILITIES ====================

// Convert Word (DOCX) to PDF using mammoth and jspdf
export const wordToPDF = async (file: File): Promise<Uint8Array> => {
  const mammoth = await import('mammoth');
  const { jsPDF } = await import('jspdf');
  
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  
  // Create a temporary container for rendering
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.cssText = 'position: absolute; left: -9999px; width: 595px; padding: 40px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6;';
  document.body.appendChild(container);
  
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(container, { 
    useCORS: true,
  } as any);
  
  document.body.removeChild(container);
  
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  
  // Handle multi-page content
  const pageHeight = pdfHeight * (imgWidth / pdfWidth);
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'JPEG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
  heightLeft -= pageHeight;
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', imgX, position * ratio, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pageHeight;
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

// Convert PowerPoint to PDF (extracts text and images)
export const pptToPDF = async (file: File): Promise<Uint8Array> => {
  const { jsPDF } = await import('jspdf');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const pdf = new jsPDF('l', 'mm', 'a4'); // landscape for slides
  const slideFiles: string[] = [];
  
  // Find all slide XML files
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
  
  let isFirstPage = true;
  
  for (const slideFile of slideFiles) {
    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;
    
    const slideXml = await zip.file(slideFile)?.async('string');
    if (!slideXml) continue;
    
    // Extract text from XML
    const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    const texts = textMatches.map(match => match.replace(/<\/?a:t>/g, ''));
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Draw slide background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    
    // Draw slide border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
    
    // Add slide number
    const slideNum = slideFile.match(/slide(\d+)\.xml/)?.[1] || '?';
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Slide ${slideNum}`, pdfWidth - 30, pdfHeight - 5);
    
    // Add text content
    pdf.setTextColor(0, 0, 0);
    let yPos = 30;
    let isTitle = true;
    
    for (const text of texts) {
      if (text.trim()) {
        if (isTitle) {
          pdf.setFontSize(24);
          isTitle = false;
        } else {
          pdf.setFontSize(14);
        }
        
        const lines = pdf.splitTextToSize(text, pdfWidth - 40);
        for (const line of lines) {
          if (yPos > pdfHeight - 20) {
            pdf.addPage();
            yPos = 30;
          }
          pdf.text(line, 20, yPos);
          yPos += isTitle ? 15 : 10;
        }
        yPos += 5;
      }
    }
  }
  
  if (slideFiles.length === 0) {
    pdf.setFontSize(16);
    pdf.text('Unable to extract content from this PowerPoint file.', 20, 40);
    pdf.setFontSize(12);
    pdf.text('The file may be in an unsupported format.', 20, 55);
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
  const pdfjs = await initPdfJs();
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str || '')
      .join(' ');
    pages.push(pageText);
  }
  
  return pages;
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

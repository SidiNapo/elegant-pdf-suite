import JSZip from 'jszip';
import {
  SlideSize,
  Transform,
  TextRun,
  TextParagraph,
  ImageData,
  ShapeElement,
  SlideBackground,
  ParsedSlide,
  ParsedPresentation,
} from './pptxTypes';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function decodeXmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function getImageFormat(filename: string, data?: ArrayBuffer): 'PNG' | 'JPEG' | 'GIF' {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'png') return 'PNG';
  if (ext === 'gif') return 'GIF';
  if (ext === 'jpg' || ext === 'jpeg') return 'JPEG';
  
  if (data && data.byteLength >= 4) {
    const arr = new Uint8Array(data);
    if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) return 'PNG';
    if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) return 'JPEG';
    if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) return 'GIF';
  }
  
  return 'JPEG';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ============================================================================
// TRANSFORM PARSING
// ============================================================================

function parseTransform(el: Element): Transform | null {
  // Try different locations for xfrm
  let xfrm = el.querySelector('xfrm');
  if (!xfrm) {
    const spPr = el.querySelector('spPr');
    if (spPr) xfrm = spPr.querySelector('xfrm');
  }
  if (!xfrm) {
    const grpSpPr = el.querySelector('grpSpPr');
    if (grpSpPr) xfrm = grpSpPr.querySelector('xfrm');
  }
  
  if (!xfrm) return null;
  
  const off = xfrm.querySelector('off');
  const ext = xfrm.querySelector('ext');
  
  if (!off || !ext) return null;
  
  return {
    x: parseInt(off.getAttribute('x') || '0', 10),
    y: parseInt(off.getAttribute('y') || '0', 10),
    width: parseInt(ext.getAttribute('cx') || '0', 10),
    height: parseInt(ext.getAttribute('cy') || '0', 10),
  };
}

function parseGroupTransformOffset(grpSpPr: Element): { x: number; y: number } {
  const xfrm = grpSpPr.querySelector('xfrm');
  if (!xfrm) return { x: 0, y: 0 };
  
  const chOff = xfrm.querySelector('chOff');
  if (!chOff) return { x: 0, y: 0 };
  
  return {
    x: parseInt(chOff.getAttribute('x') || '0', 10),
    y: parseInt(chOff.getAttribute('y') || '0', 10),
  };
}

// ============================================================================
// TEXT PARSING
// ============================================================================

function parseTextRuns(pEl: Element): TextRun[] {
  const runs: TextRun[] = [];
  
  // Process all 'r' elements
  const rElements = pEl.querySelectorAll('r');
  rElements.forEach((r) => {
    const tEl = r.querySelector('t');
    if (!tEl?.textContent) return;
    
    const text = decodeXmlEntities(tEl.textContent);
    if (!text) return;
    
    const run: TextRun = { text };
    
    const rPr = r.querySelector('rPr');
    if (rPr) {
      run.bold = rPr.getAttribute('b') === '1' || rPr.querySelector('b') !== null;
      run.italic = rPr.getAttribute('i') === '1' || rPr.querySelector('i') !== null;
      
      const sz = rPr.getAttribute('sz');
      if (sz) run.fontSize = parseInt(sz, 10) / 100;
      
      // Color from solidFill
      const solidFill = rPr.querySelector('solidFill');
      if (solidFill) {
        const srgbClr = solidFill.querySelector('srgbClr');
        if (srgbClr) {
          run.color = '#' + (srgbClr.getAttribute('val') || '000000');
        }
        const schemeClr = solidFill.querySelector('schemeClr');
        if (schemeClr && !run.color) {
          // Default scheme colors mapping
          const schemeVal = schemeClr.getAttribute('val');
          const schemeColors: Record<string, string> = {
            'tx1': '#000000',
            'tx2': '#44546A',
            'bg1': '#FFFFFF',
            'bg2': '#E7E6E6',
            'accent1': '#4472C4',
            'accent2': '#ED7D31',
            'dk1': '#000000',
            'lt1': '#FFFFFF',
          };
          run.color = schemeColors[schemeVal || ''] || '#000000';
        }
      }
    }
    
    runs.push(run);
  });
  
  // Fallback: collect all text if no runs found
  if (runs.length === 0) {
    const textNodes = pEl.querySelectorAll('t');
    const allText: string[] = [];
    textNodes.forEach((t) => {
      if (t.textContent) allText.push(decodeXmlEntities(t.textContent));
    });
    if (allText.length > 0) {
      runs.push({ text: allText.join('') });
    }
  }
  
  return runs;
}

function parseParagraphs(txBody: Element): TextParagraph[] {
  const paragraphs: TextParagraph[] = [];
  const pElements = txBody.querySelectorAll('p');
  
  pElements.forEach((pEl) => {
    const runs = parseTextRuns(pEl);
    if (runs.length === 0) return;
    
    const para: TextParagraph = { runs };
    
    const pPr = pEl.querySelector('pPr');
    if (pPr) {
      const algn = pPr.getAttribute('algn');
      if (algn === 'ctr') para.alignment = 'center';
      else if (algn === 'r') para.alignment = 'right';
      else if (algn === 'just') para.alignment = 'justify';
      else para.alignment = 'left';
      
      const lvl = pPr.getAttribute('lvl');
      if (lvl) para.bulletLevel = parseInt(lvl, 10);
      
      const buChar = pPr.querySelector('buChar');
      if (buChar) para.bulletChar = buChar.getAttribute('char') || '•';
      
      const buAutoNum = pPr.querySelector('buAutoNum');
      if (buAutoNum) para.isNumbered = true;
      
      // If has level but no explicit bullet, add default
      if (!pPr.querySelector('buNone') && para.bulletLevel !== undefined && !para.bulletChar && !para.isNumbered) {
        para.bulletChar = '•';
      }
    }
    
    paragraphs.push(para);
  });
  
  return paragraphs;
}

function getPlaceholderType(spEl: Element): ShapeElement['placeholderType'] {
  const nvSpPr = spEl.querySelector('nvSpPr');
  if (!nvSpPr) return undefined;
  
  const nvPr = nvSpPr.querySelector('nvPr');
  if (!nvPr) return undefined;
  
  const ph = nvPr.querySelector('ph');
  if (!ph) return undefined;
  
  const type = ph.getAttribute('type');
  if (type === 'title' || type === 'ctrTitle') return 'title';
  if (type === 'subTitle') return 'subTitle';
  if (type === 'body') return 'body';
  
  return 'other';
}

// ============================================================================
// RELATIONSHIPS & MEDIA
// ============================================================================

async function parseRelationships(zip: JSZip, relsPath: string): Promise<Map<string, string>> {
  const rels = new Map<string, string>();
  
  const relsFile = zip.file(relsPath);
  if (!relsFile) return rels;
  
  const content = await relsFile.async('text');
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  
  doc.querySelectorAll('Relationship').forEach((rel) => {
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    if (id && target) rels.set(id, target);
  });
  
  return rels;
}

async function loadMediaFiles(zip: JSZip): Promise<Map<string, ImageData>> {
  const mediaFiles = new Map<string, ImageData>();
  
  const mediaPaths: string[] = [];
  zip.forEach((path, file) => {
    if (path.startsWith('ppt/media/') && !file.dir) {
      mediaPaths.push(path);
    }
  });
  
  await Promise.all(
    mediaPaths.map(async (path) => {
      const file = zip.file(path);
      if (!file) return;
      
      try {
        const filename = path.split('/').pop() || '';
        const ext = filename.toLowerCase().split('.').pop() || '';
        
        // Skip vector formats
        if (['emf', 'wmf', 'svg'].includes(ext)) return;
        
        const data = await file.async('arraybuffer');
        const format = getImageFormat(filename, data);
        const base64 = arrayBufferToBase64(data);
        const mimeType = format === 'PNG' ? 'image/png' : format === 'GIF' ? 'image/gif' : 'image/jpeg';
        
        const imageData: ImageData = {
          data: `data:${mimeType};base64,${base64}`,
          format,
        };
        
        // Store with multiple key variations
        mediaFiles.set(path, imageData);
        mediaFiles.set('../media/' + filename, imageData);
        mediaFiles.set(filename, imageData);
      } catch (e) {
        console.warn('Failed to load media:', path, e);
      }
    })
  );
  
  return mediaFiles;
}

function resolveImageRef(
  ref: string,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): ImageData | null {
  const target = rels.get(ref);
  if (!target) return null;
  
  const filename = target.split('/').pop() || '';
  const variations = [
    target,
    'ppt/media/' + filename,
    '../media/' + filename,
    filename,
  ];
  
  for (const path of variations) {
    const img = mediaFiles.get(path);
    if (img) return img;
  }
  
  return null;
}

function getBlipEmbed(el: Element): string | null {
  const blip = el.querySelector('blip');
  if (!blip) return null;
  return blip.getAttribute('r:embed') || blip.getAttribute('embed') || null;
}

// ============================================================================
// SHAPE PARSING
// ============================================================================

function parseTextShape(
  spEl: Element,
  zIndex: number,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): ShapeElement | null {
  const transform = parseTransform(spEl);
  if (!transform) return null;
  
  const element: ShapeElement = {
    type: 'text',
    transform,
    zIndex,
    placeholderType: getPlaceholderType(spEl),
  };
  
  // Check for picture fill in shape
  const spPr = spEl.querySelector('spPr');
  if (spPr) {
    const blipFill = spPr.querySelector('blipFill');
    if (blipFill) {
      const ref = getBlipEmbed(blipFill);
      if (ref) {
        const imgData = resolveImageRef(ref, rels, mediaFiles);
        if (imgData) {
          element.type = 'image';
          element.imageData = imgData;
          element.imageRef = ref;
        }
      }
    }
    
    // Check for solid fill (shape background)
    const solidFill = spPr.querySelector('solidFill');
    if (solidFill) {
      const srgbClr = solidFill.querySelector('srgbClr');
      if (srgbClr) {
        element.fillColor = '#' + (srgbClr.getAttribute('val') || 'FFFFFF');
      }
    }
  }
  
  // Parse text body
  const txBody = spEl.querySelector('txBody');
  if (txBody) {
    element.paragraphs = parseParagraphs(txBody);
  }
  
  // Skip if no content
  if (element.type === 'text' && (!element.paragraphs || element.paragraphs.length === 0) && !element.fillColor) {
    return null;
  }
  
  return element;
}

function parsePictureShape(
  picEl: Element,
  zIndex: number,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): ShapeElement | null {
  const transform = parseTransform(picEl);
  if (!transform) return null;
  
  const blipFill = picEl.querySelector('blipFill');
  if (!blipFill) return null;
  
  const ref = getBlipEmbed(blipFill);
  if (!ref) return null;
  
  const imgData = resolveImageRef(ref, rels, mediaFiles);
  if (!imgData) return null;
  
  return {
    type: 'image',
    transform,
    zIndex,
    imageData: imgData,
    imageRef: ref,
  };
}

function parseGroupShape(
  grpSpEl: Element,
  baseZIndex: number,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): ShapeElement[] {
  const elements: ShapeElement[] = [];
  
  // Get group transform
  const grpSpPr = grpSpEl.querySelector(':scope > grpSpPr');
  let groupTransform: Transform | null = null;
  let childOffset = { x: 0, y: 0 };
  
  if (grpSpPr) {
    groupTransform = parseTransform(grpSpPr);
    childOffset = parseGroupTransformOffset(grpSpPr);
  }
  
  let zIndex = baseZIndex;
  const children = grpSpEl.children;
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const tagName = child.tagName.split(':').pop();
    
    if (tagName === 'sp') {
      const el = parseTextShape(child, zIndex++, rels, mediaFiles);
      if (el) {
        if (groupTransform) {
          el.transform.x = el.transform.x - childOffset.x + groupTransform.x;
          el.transform.y = el.transform.y - childOffset.y + groupTransform.y;
        }
        elements.push(el);
      }
    } else if (tagName === 'pic') {
      const el = parsePictureShape(child, zIndex++, rels, mediaFiles);
      if (el) {
        if (groupTransform) {
          el.transform.x = el.transform.x - childOffset.x + groupTransform.x;
          el.transform.y = el.transform.y - childOffset.y + groupTransform.y;
        }
        elements.push(el);
      }
    } else if (tagName === 'grpSp') {
      const nested = parseGroupShape(child, zIndex, rels, mediaFiles);
      nested.forEach((el) => {
        if (groupTransform) {
          el.transform.x = el.transform.x - childOffset.x + groupTransform.x;
          el.transform.y = el.transform.y - childOffset.y + groupTransform.y;
        }
        elements.push(el);
      });
      zIndex += nested.length;
    }
  }
  
  return elements;
}

// ============================================================================
// BACKGROUND PARSING
// ============================================================================

function parseSlideBackground(
  slideDoc: Document,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): SlideBackground {
  const bg = slideDoc.querySelector('cSld > bg');
  if (!bg) return { type: 'none' };
  
  const bgPr = bg.querySelector('bgPr');
  if (bgPr) {
    // Image fill
    const blipFill = bgPr.querySelector('blipFill');
    if (blipFill) {
      const ref = getBlipEmbed(blipFill);
      if (ref) {
        const imgData = resolveImageRef(ref, rels, mediaFiles);
        if (imgData) {
          return { type: 'image', imageData: imgData, imageRef: ref };
        }
      }
    }
    
    // Solid fill
    const solidFill = bgPr.querySelector('solidFill');
    if (solidFill) {
      const srgbClr = solidFill.querySelector('srgbClr');
      if (srgbClr) {
        return { type: 'solid', color: '#' + (srgbClr.getAttribute('val') || 'FFFFFF') };
      }
    }
    
    // Gradient fill
    const gradFill = bgPr.querySelector('gradFill');
    if (gradFill) {
      const gsLst = gradFill.querySelector('gsLst');
      if (gsLst) {
        const firstGs = gsLst.querySelector('gs');
        if (firstGs) {
          const srgbClr = firstGs.querySelector('srgbClr');
          if (srgbClr) {
            return { type: 'solid', color: '#' + (srgbClr.getAttribute('val') || 'FFFFFF') };
          }
        }
      }
      return { type: 'solid', color: '#FFFFFF' };
    }
  }
  
  // Background reference (theme)
  const bgRef = bg.querySelector('bgRef');
  if (bgRef) {
    return { type: 'solid', color: '#FFFFFF' };
  }
  
  return { type: 'none' };
}

// ============================================================================
// SLIDE PARSING
// ============================================================================

async function parseSlide(
  zip: JSZip,
  slideNumber: number,
  mediaFiles: Map<string, ImageData>,
  warnings: string[]
): Promise<ParsedSlide> {
  const slidePath = `ppt/slides/slide${slideNumber}.xml`;
  const relsPath = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
  
  const elements: ShapeElement[] = [];
  let background: SlideBackground = { type: 'none' };
  
  const rels = await parseRelationships(zip, relsPath);
  
  const slideFile = zip.file(slidePath);
  if (!slideFile) {
    warnings.push(`Slide ${slideNumber} not found`);
    return { slideNumber, background, elements };
  }
  
  const content = await slideFile.async('text');
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  
  background = parseSlideBackground(doc, rels, mediaFiles);
  
  const spTree = doc.querySelector('cSld > spTree');
  if (!spTree) {
    warnings.push(`Slide ${slideNumber}: No shape tree`);
    return { slideNumber, background, elements };
  }
  
  let zIndex = 0;
  const children = spTree.children;
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const tagName = child.tagName.split(':').pop();
    
    if (tagName === 'sp') {
      const el = parseTextShape(child, zIndex++, rels, mediaFiles);
      if (el) elements.push(el);
    } else if (tagName === 'pic') {
      const el = parsePictureShape(child, zIndex++, rels, mediaFiles);
      if (el) elements.push(el);
    } else if (tagName === 'grpSp') {
      const groupEls = parseGroupShape(child, zIndex, rels, mediaFiles);
      groupEls.forEach((el) => elements.push(el));
      zIndex += groupEls.length;
    }
  }
  
  return { slideNumber, background, elements };
}

// ============================================================================
// MAIN PARSER
// ============================================================================

export async function parsePPTX(file: File): Promise<ParsedPresentation> {
  const warnings: string[] = [];
  
  // Validate file type
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.ppt') && !fileName.endsWith('.pptx')) {
    throw new Error('Le format .ppt n\'est pas supporté. Veuillez utiliser un fichier .pptx.');
  }
  
  // Read file
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('Impossible de lire le fichier.');
  }
  
  // Load as ZIP
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch {
    throw new Error('Fichier PPTX invalide.');
  }
  
  // Get slide size
  let slideSize: SlideSize = { width: 9144000, height: 6858000 };
  
  const presentationFile = zip.file('ppt/presentation.xml');
  if (presentationFile) {
    try {
      const content = await presentationFile.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      
      const sldSz = doc.querySelector('sldSz');
      if (sldSz) {
        slideSize = {
          width: parseInt(sldSz.getAttribute('cx') || '9144000', 10),
          height: parseInt(sldSz.getAttribute('cy') || '6858000', 10),
        };
      }
    } catch {
      warnings.push('Could not parse presentation.xml');
    }
  }
  
  // Load media
  const mediaFiles = await loadMediaFiles(zip);
  
  // Find slides
  const slideNumbers: number[] = [];
  zip.forEach((path) => {
    const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) slideNumbers.push(parseInt(match[1], 10));
  });
  slideNumbers.sort((a, b) => a - b);
  
  if (slideNumbers.length === 0) {
    throw new Error('Aucune diapositive trouvée.');
  }
  
  // Parse all slides
  const slides: ParsedSlide[] = [];
  for (const num of slideNumbers) {
    const slide = await parseSlide(zip, num, mediaFiles, warnings);
    slides.push(slide);
  }
  
  return { slideSize, slides, mediaFiles, warnings };
}

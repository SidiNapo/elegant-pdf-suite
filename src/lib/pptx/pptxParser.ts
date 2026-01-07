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
  EMU_PER_POINT,
} from './pptxTypes';

// Decode XML entities
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

// Get image format from filename or content type
function getImageFormat(filename: string, data?: ArrayBuffer): 'PNG' | 'JPEG' | 'GIF' {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'png') return 'PNG';
  if (ext === 'gif') return 'GIF';
  if (ext === 'jpg' || ext === 'jpeg') return 'JPEG';
  
  // Check magic bytes if we have data
  if (data && data.byteLength >= 4) {
    const arr = new Uint8Array(data);
    // PNG: 89 50 4E 47
    if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
      return 'PNG';
    }
    // JPEG: FF D8 FF
    if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
      return 'JPEG';
    }
    // GIF: 47 49 46
    if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) {
      return 'GIF';
    }
  }
  
  return 'JPEG'; // Default
}

// Parse transform from shape
function parseTransform(shapeEl: Element): Transform | null {
  // Check direct xfrm
  let xfrm = shapeEl.querySelector('xfrm');
  
  // Also check in spPr
  if (!xfrm) {
    const spPr = shapeEl.querySelector('spPr');
    if (spPr) {
      xfrm = spPr.querySelector('xfrm');
    }
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

// Parse text runs from a paragraph
function parseTextRuns(pEl: Element): TextRun[] {
  const runs: TextRun[] = [];
  
  // Get all 'r' (run) elements
  const rElements = pEl.querySelectorAll('r');
  
  rElements.forEach((r) => {
    const tEl = r.querySelector('t');
    if (!tEl || !tEl.textContent) return;
    
    const text = decodeXmlEntities(tEl.textContent);
    if (!text) return;
    
    const run: TextRun = { text };
    
    // Check run properties
    const rPr = r.querySelector('rPr');
    if (rPr) {
      run.bold = rPr.getAttribute('b') === '1';
      run.italic = rPr.getAttribute('i') === '1';
      
      const sz = rPr.getAttribute('sz');
      if (sz) {
        run.fontSize = parseInt(sz, 10) / 100; // Convert from hundredths of pt
      }
      
      // Get color
      const solidFill = rPr.querySelector('solidFill');
      if (solidFill) {
        const srgbClr = solidFill.querySelector('srgbClr');
        if (srgbClr) {
          run.color = '#' + (srgbClr.getAttribute('val') || '000000');
        }
      }
    }
    
    runs.push(run);
  });
  
  // Also check for direct text (field elements, etc.)
  if (runs.length === 0) {
    const allText: string[] = [];
    const textNodes = pEl.querySelectorAll('t');
    textNodes.forEach((t) => {
      if (t.textContent) {
        allText.push(decodeXmlEntities(t.textContent));
      }
    });
    if (allText.length > 0) {
      runs.push({ text: allText.join('') });
    }
  }
  
  return runs;
}

// Parse paragraphs from text body
function parseParagraphs(txBody: Element): TextParagraph[] {
  const paragraphs: TextParagraph[] = [];
  
  const pElements = txBody.querySelectorAll('p');
  
  pElements.forEach((pEl) => {
    const runs = parseTextRuns(pEl);
    if (runs.length === 0) return;
    
    const para: TextParagraph = { runs };
    
    // Check paragraph properties
    const pPr = pEl.querySelector('pPr');
    if (pPr) {
      const algn = pPr.getAttribute('algn');
      if (algn === 'ctr') para.alignment = 'center';
      else if (algn === 'r') para.alignment = 'right';
      else if (algn === 'just') para.alignment = 'justify';
      else para.alignment = 'left';
      
      const lvl = pPr.getAttribute('lvl');
      if (lvl) {
        para.bulletLevel = parseInt(lvl, 10);
      }
      
      // Check for bullet
      const buChar = pPr.querySelector('buChar');
      if (buChar) {
        para.bulletChar = buChar.getAttribute('char') || '•';
      }
      
      const buAutoNum = pPr.querySelector('buAutoNum');
      if (buAutoNum) {
        para.isNumbered = true;
      }
      
      const buNone = pPr.querySelector('buNone');
      if (!buNone && (para.bulletLevel !== undefined || buChar || buAutoNum)) {
        if (!para.bulletChar && !para.isNumbered) {
          para.bulletChar = '•';
        }
      }
    }
    
    paragraphs.push(para);
  });
  
  return paragraphs;
}

// Get placeholder type
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

// Parse image reference from blip
function getBlipEmbed(el: Element): string | null {
  const blip = el.querySelector('blip');
  if (!blip) return null;
  
  // Check both r:embed and embed
  return blip.getAttribute('r:embed') || blip.getAttribute('embed') || null;
}

// Parse relationships file
async function parseRelationships(zip: JSZip, relsPath: string): Promise<Map<string, string>> {
  const rels = new Map<string, string>();
  
  const relsFile = zip.file(relsPath);
  if (!relsFile) return rels;
  
  const content = await relsFile.async('text');
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  
  const relationships = doc.querySelectorAll('Relationship');
  relationships.forEach((rel) => {
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    if (id && target) {
      rels.set(id, target);
    }
  });
  
  return rels;
}

// Load all media files from the archive
async function loadMediaFiles(zip: JSZip): Promise<Map<string, ImageData>> {
  const mediaFiles = new Map<string, ImageData>();
  
  const mediaFolder = zip.folder('ppt/media');
  if (!mediaFolder) return mediaFiles;
  
  const mediaEntries: string[] = [];
  zip.forEach((path, file) => {
    if (path.startsWith('ppt/media/') && !file.dir) {
      mediaEntries.push(path);
    }
  });
  
  await Promise.all(
    mediaEntries.map(async (path) => {
      const file = zip.file(path);
      if (!file) return;
      
      try {
        const data = await file.async('arraybuffer');
        const filename = path.split('/').pop() || '';
        const format = getImageFormat(filename, data);
        
        // Skip unsupported formats
        if (filename.toLowerCase().endsWith('.emf') || 
            filename.toLowerCase().endsWith('.wmf') ||
            filename.toLowerCase().endsWith('.svg')) {
          return;
        }
        
        const base64 = btoa(
          new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const mimeType = format === 'PNG' ? 'image/png' : format === 'GIF' ? 'image/gif' : 'image/jpeg';
        
        mediaFiles.set(path, {
          data: `data:${mimeType};base64,${base64}`,
          format,
        });
        
        // Also store by relative path
        const relativePath = '../media/' + filename;
        mediaFiles.set(relativePath, {
          data: `data:${mimeType};base64,${base64}`,
          format,
        });
        
        // Store by just filename too
        mediaFiles.set(filename, {
          data: `data:${mimeType};base64,${base64}`,
          format,
        });
      } catch (e) {
        console.warn('Failed to load media file:', path, e);
      }
    })
  );
  
  return mediaFiles;
}

// Resolve image reference to actual image data
function resolveImageRef(
  ref: string,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): ImageData | null {
  const target = rels.get(ref);
  if (!target) return null;
  
  // Try different path variations
  const variations = [
    target,
    'ppt/media/' + target.split('/').pop(),
    '../media/' + target.split('/').pop(),
    target.split('/').pop() || '',
  ];
  
  for (const path of variations) {
    const img = mediaFiles.get(path);
    if (img) return img;
  }
  
  return null;
}

// Parse text shape
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
  }
  
  // Parse text body
  const txBody = spEl.querySelector('txBody');
  if (txBody) {
    element.paragraphs = parseParagraphs(txBody);
  }
  
  // If no text and not an image, skip
  if (element.type === 'text' && (!element.paragraphs || element.paragraphs.length === 0)) {
    return null;
  }
  
  return element;
}

// Parse picture shape
function parsePictureShape(
  picEl: Element,
  zIndex: number,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): ShapeElement | null {
  const transform = parseTransform(picEl);
  if (!transform) return null;
  
  // Get blip reference
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

// Parse group shape recursively
function parseGroupShape(
  grpSpEl: Element,
  baseZIndex: number,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>,
  parentTransform?: Transform
): ShapeElement[] {
  const elements: ShapeElement[] = [];
  
  // Get group transform
  const grpSpPr = grpSpEl.querySelector(':scope > grpSpPr');
  let groupTransform: Transform | null = null;
  let childOffset = { x: 0, y: 0 };
  
  if (grpSpPr) {
    const xfrm = grpSpPr.querySelector('xfrm');
    if (xfrm) {
      const off = xfrm.querySelector('off');
      const ext = xfrm.querySelector('ext');
      const chOff = xfrm.querySelector('chOff');
      const chExt = xfrm.querySelector('chExt');
      
      if (off && ext) {
        groupTransform = {
          x: parseInt(off.getAttribute('x') || '0', 10),
          y: parseInt(off.getAttribute('y') || '0', 10),
          width: parseInt(ext.getAttribute('cx') || '0', 10),
          height: parseInt(ext.getAttribute('cy') || '0', 10),
        };
      }
      
      if (chOff) {
        childOffset = {
          x: parseInt(chOff.getAttribute('x') || '0', 10),
          y: parseInt(chOff.getAttribute('y') || '0', 10),
        };
      }
    }
  }
  
  let zIndex = baseZIndex;
  
  // Process children in order
  const children = grpSpEl.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const tagName = child.tagName.split(':').pop();
    
    if (tagName === 'sp') {
      const el = parseTextShape(child, zIndex++, rels, mediaFiles);
      if (el) {
        // Apply group offset
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
      const groupElements = parseGroupShape(child, zIndex, rels, mediaFiles, groupTransform || undefined);
      groupElements.forEach((el) => {
        if (groupTransform) {
          el.transform.x = el.transform.x - childOffset.x + groupTransform.x;
          el.transform.y = el.transform.y - childOffset.y + groupTransform.y;
        }
        elements.push(el);
      });
      zIndex += groupElements.length;
    }
  }
  
  return elements;
}

// Parse slide background
function parseSlideBackground(
  slideDoc: Document,
  rels: Map<string, string>,
  mediaFiles: Map<string, ImageData>
): SlideBackground {
  // Check for background in cSld/bg
  const bg = slideDoc.querySelector('cSld > bg');
  if (!bg) {
    return { type: 'none' };
  }
  
  // Check for background properties
  const bgPr = bg.querySelector('bgPr');
  if (bgPr) {
    // Check for image fill
    const blipFill = bgPr.querySelector('blipFill');
    if (blipFill) {
      const ref = getBlipEmbed(blipFill);
      if (ref) {
        const imgData = resolveImageRef(ref, rels, mediaFiles);
        if (imgData) {
          return {
            type: 'image',
            imageData: imgData,
            imageRef: ref,
          };
        }
      }
    }
    
    // Check for solid fill
    const solidFill = bgPr.querySelector('solidFill');
    if (solidFill) {
      const srgbClr = solidFill.querySelector('srgbClr');
      if (srgbClr) {
        return {
          type: 'solid',
          color: '#' + (srgbClr.getAttribute('val') || 'FFFFFF'),
        };
      }
    }
  }
  
  // Check for background reference (bgRef) pointing to theme
  const bgRef = bg.querySelector('bgRef');
  if (bgRef) {
    // For now, just return solid white for theme references
    return { type: 'solid', color: '#FFFFFF' };
  }
  
  return { type: 'none' };
}

// Parse a single slide
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
  
  // Load relationships
  const rels = await parseRelationships(zip, relsPath);
  
  // Load slide XML
  const slideFile = zip.file(slidePath);
  if (!slideFile) {
    warnings.push(`Slide ${slideNumber} not found`);
    return { slideNumber, background, elements };
  }
  
  const content = await slideFile.async('text');
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  
  // Parse background
  background = parseSlideBackground(doc, rels, mediaFiles);
  
  // Find spTree (shape tree)
  const spTree = doc.querySelector('cSld > spTree');
  if (!spTree) {
    warnings.push(`Slide ${slideNumber}: No shape tree found`);
    return { slideNumber, background, elements };
  }
  
  // Process children in document order (preserves z-order)
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
      const groupElements = parseGroupShape(child, zIndex, rels, mediaFiles);
      groupElements.forEach((el) => elements.push(el));
      zIndex += groupElements.length;
    }
  }
  
  return { slideNumber, background, elements };
}

// Main parser function
export async function parsePPTX(file: File): Promise<ParsedPresentation> {
  const warnings: string[] = [];
  
  // Check file type
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.ppt') && !fileName.endsWith('.pptx')) {
    throw new Error('Le format .ppt (PowerPoint 97-2003) n\'est pas supporté. Veuillez utiliser un fichier .pptx.');
  }
  
  // Load ZIP
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Get presentation size
  let slideSize: SlideSize = { width: 9144000, height: 6858000 }; // Default 16:9
  
  const presentationFile = zip.file('ppt/presentation.xml');
  if (presentationFile) {
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
  }
  
  // Load all media files first
  const mediaFiles = await loadMediaFiles(zip);
  
  // Find all slides
  const slideNumbers: number[] = [];
  zip.forEach((path) => {
    const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideNumbers.push(parseInt(match[1], 10));
    }
  });
  slideNumbers.sort((a, b) => a - b);
  
  if (slideNumbers.length === 0) {
    throw new Error('Aucune diapositive trouvée dans le fichier PPTX.');
  }
  
  // Parse all slides
  const slides: ParsedSlide[] = [];
  for (const num of slideNumbers) {
    const slide = await parseSlide(zip, num, mediaFiles, warnings);
    slides.push(slide);
  }
  
  return {
    slideSize,
    slides,
    mediaFiles,
    warnings,
  };
}

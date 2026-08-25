import { pdfjs } from 'react-pdf';
import Tesseract from 'tesseract.js';
import { preprocessForOcr } from './imagePreprocess';

// Ensure worker is configured
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type OcrProgressCallback = (progress: {
  stage: 'rendering' | 'preprocessing' | 'recognizing';
  currentPage: number;
  totalPages: number;
  percent: number; // 0-100 overall
}) => void;

/**
 * Renders a single PDF page to an off-screen canvas.
 * Uses a high scale factor (3x) for sharp text at OCR resolution.
 */
async function renderPageToCanvas(
  pdfDoc: pdfjs.PDFDocumentProxy,
  pageNum: number,
  scaleFactor: number = 3.0
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: scaleFactor });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d')!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

  return canvas;
}

/**
 * Extracts text from a PDF file using OCR (Tesseract.js) with full image preprocessing.
 * 
 * Pipeline:
 * 1. Load the PDF with pdfjs-dist
 * 2. Render each page to canvas at 3x scale (high resolution for accuracy)
 * 3. Preprocess: grayscale → contrast → sharpen → denoise → binarize
 * 4. Run Tesseract.js with optimized settings
 * 5. Return extracted text per page
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: OcrProgressCallback,
  pagesToProcess?: number[]
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdfDoc.numPages;

  const pages = pagesToProcess || Array.from({ length: totalPages }, (_, i) => i + 1);
  const results: string[] = [];

  // Create Tesseract worker with optimized settings
  const worker = await Tesseract.createWorker('eng', Tesseract.OEM.LSTM_ONLY);

  // Configure Tesseract for table/structured content
  await worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    // Preserve whitespace structure for table parsing
    preserve_interword_spaces: '1',
  });

  try {
    for (let i = 0; i < pages.length; i++) {
      const pageNum = pages[i];
      const progressBase = (i / pages.length) * 100;
      const progressStep = 100 / pages.length;

      // Stage 1: Render
      onProgress?.({
        stage: 'rendering',
        currentPage: pageNum,
        totalPages: pages.length,
        percent: Math.round(progressBase),
      });

      const canvas = await renderPageToCanvas(pdfDoc, pageNum);

      // Stage 2: Preprocess
      onProgress?.({
        stage: 'preprocessing',
        currentPage: pageNum,
        totalPages: pages.length,
        percent: Math.round(progressBase + progressStep * 0.3),
      });

      preprocessForOcr(canvas);

      // Stage 3: OCR
      onProgress?.({
        stage: 'recognizing',
        currentPage: pageNum,
        totalPages: pages.length,
        percent: Math.round(progressBase + progressStep * 0.5),
      });

      const { data } = await worker.recognize(canvas);
      results.push(data.text);

      // Clean up canvas memory
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await worker.terminate();
  }

  onProgress?.({
    stage: 'recognizing',
    currentPage: pages.length,
    totalPages: pages.length,
    percent: 100,
  });

  return results;
}

/**
 * Smart text extraction: tries embedded text first (instant for digital PDFs),
 * falls back to full OCR pipeline only for scanned/image PDFs.
 */
export async function extractTextSmart(
  file: File,
  onProgress?: OcrProgressCallback
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdfDoc.numPages;

  const results: string[] = [];

  // First pass: try extracting embedded text (fast path for digital PDFs)
  let totalExtractedLength = 0;
  for (let i = 1; i <= totalPages; i++) {
    onProgress?.({
      stage: 'rendering',
      currentPage: i,
      totalPages,
      percent: Math.round((i / totalPages) * 30),
    });

    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Create an array of text items with their spatial coordinates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = textContent.items.map((item: any) => ({
      str: item.str ?? '',
      x: item.transform ? item.transform[4] : 0,
      y: item.transform ? item.transform[5] : 0,
    }));

    // Group items by Y coordinate (with a small tolerance for misalignment)
    const yTolerance = 5;
    const linesMap = new Map<number, typeof items>();

    items.forEach(item => {
      if (!item.str.trim()) return; // Skip empty spaces
      
      // Find an existing line that is close enough in Y
      let foundY = -1;
      for (const y of linesMap.keys()) {
        if (Math.abs(y - item.y) <= yTolerance) {
          foundY = y;
          break;
        }
      }

      if (foundY !== -1) {
        linesMap.get(foundY)!.push(item);
      } else {
        linesMap.set(item.y, [item]);
      }
    });

    // Sort lines by Y descending (PDF coordinates are usually bottom-up)
    const sortedYKeys = Array.from(linesMap.keys()).sort((a, b) => b - a);

    let pageText = '';
    
    for (const y of sortedYKeys) {
      const lineItems = linesMap.get(y)!;
      // Sort items within the line by X coordinate (left-to-right)
      lineItems.sort((a, b) => a.x - b.x);
      
      const lineStr = lineItems.map(item => item.str.trim()).filter(Boolean).join(' ');
      if (lineStr) {
        pageText += lineStr + '\n';
      }
    }

    totalExtractedLength += pageText.trim().length;
    results.push(pageText);
  }

  // Only bypass OCR if we found a substantial amount of text 
  // (ignores tiny watermarks on scanned PDFs)
  if (totalExtractedLength > 200) {
    onProgress?.({
      stage: 'recognizing',
      currentPage: totalPages,
      totalPages,
      percent: 100,
    });
    return results;
  }

  // Fallback: scanned PDF — run full OCR with preprocessing
  return extractTextFromPdf(file, onProgress);
}

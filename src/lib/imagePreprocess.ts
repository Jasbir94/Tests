/**
 * Image preprocessing utilities for improving OCR accuracy.
 * All operations work on HTML Canvas elements — 100% browser-based.
 */

/**
 * Converts a canvas to grayscale for better OCR recognition.
 */
export function toGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula (weighted average matching human perception)
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;       // R
    data[i + 1] = gray;   // G
    data[i + 2] = gray;   // B
    // Alpha stays the same
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Increases contrast using a simple linear stretch.
 * factor > 1 = more contrast, factor < 1 = less contrast.
 */
export function adjustContrast(canvas: HTMLCanvasElement, factor: number = 1.8): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const intercept = 128 * (1 - factor);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * data[i] + intercept));
    data[i + 1] = Math.max(0, Math.min(255, factor * data[i + 1] + intercept));
    data[i + 2] = Math.max(0, Math.min(255, factor * data[i + 2] + intercept));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Applies Otsu's binarization — automatically finds the optimal threshold
 * to split pixels into black and white. This dramatically improves OCR
 * on low-contrast or uneven-lighting scans.
 */
export function binarize(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Build histogram of grayscale values
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }

  const totalPixels = data.length / 4;

  // Otsu's method: find the threshold that minimizes intra-class variance
  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * histogram[i];

  let sumBg = 0;
  let weightBg = 0;
  let maxVariance = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t++) {
    weightBg += histogram[t];
    if (weightBg === 0) continue;

    const weightFg = totalPixels - weightBg;
    if (weightFg === 0) break;

    sumBg += t * histogram[t];
    const meanBg = sumBg / weightBg;
    const meanFg = (sumAll - sumBg) / weightFg;

    const variance = weightBg * weightFg * (meanBg - meanFg) * (meanBg - meanFg);
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }

  // Apply threshold
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = gray >= threshold ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Applies a 3x3 sharpening kernel to make text edges crisper.
 */
export function sharpen(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Copy original data
  const original = new Uint8ClampedArray(data);

  // Sharpening kernel
  const kernel = [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += original[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        data[idx] = Math.max(0, Math.min(255, sum));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Removes small noise dots using a simple median filter (3x3).
 */
export function denoise(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  const original = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const neighbors: number[] = [];
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            neighbors.push(original[idx]);
          }
        }
        neighbors.sort((a, b) => a - b);
        const idx = (y * width + x) * 4 + c;
        data[idx] = neighbors[4]; // Median of 9 values
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Full preprocessing pipeline optimized for printed text (GATE answer keys).
 * Applies operations in the optimal order for OCR accuracy.
 */
export function preprocessForOcr(canvas: HTMLCanvasElement): HTMLCanvasElement {
  toGrayscale(canvas);
  adjustContrast(canvas, 1.6);
  sharpen(canvas);
  denoise(canvas);
  binarize(canvas);
  return canvas;
}

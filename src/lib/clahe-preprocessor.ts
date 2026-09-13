/**
 * NETRA RAKSHAK — Rayleigh CLAHE Preprocessing Engine
 *
 * Replicates the exact MATLAB preprocessing pipeline used during training:
 *   step2_quality_check.m → Green-channel Rayleigh CLAHE → Median filter → Resize 224×224
 *
 * This fixes the training-serving skew that causes the ONNX model to misclassify
 * fundus images. The model was trained on CLAHE-enhanced images, so inference input
 * must match.
 */

/* ─── Canvas Utilities ──────────────────────────────────── */

/**
 * Loads an image File/Blob into an HTMLImageElement.
 */
function loadImage(source: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode the uploaded image."));
    img.src = URL.createObjectURL(source);
  });
}

/**
 * Draws an image onto a canvas at the target dimensions and returns the pixel data.
 */
function imageToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; data: ImageData } {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height);
  return { canvas, ctx, data };
}

/* ─── CLAHE Core ────────────────────────────────────────── */

/**
 * Computes the histogram of a single-channel image region.
 */
function computeHistogram(
  channel: Uint8Array,
  width: number,
  startX: number,
  startY: number,
  tileW: number,
  tileH: number,
): Float64Array {
  const hist = new Float64Array(256);
  for (let y = startY; y < startY + tileH; y++) {
    for (let x = startX; x < startX + tileW; x++) {
      hist[channel[y * width + x]]++;
    }
  }
  return hist;
}

/**
 * Clips the histogram at the given clip limit and redistributes the excess
 * counts uniformly across all bins. This is iterated until convergence.
 */
function clipHistogram(hist: Float64Array, clipLimit: number): Float64Array {
  const clipped = new Float64Array(hist);
  const numBins = 256;

  // Iterative clipping with redistribution (matches MATLAB's adapthisteq behavior)
  for (let iter = 0; iter < 10; iter++) {
    let excess = 0;
    for (let i = 0; i < numBins; i++) {
      if (clipped[i] > clipLimit) {
        excess += clipped[i] - clipLimit;
        clipped[i] = clipLimit;
      }
    }
    if (excess <= 0) break;

    const perBin = excess / numBins;
    let residual = 0;
    for (let i = 0; i < numBins; i++) {
      const add = perBin + residual;
      const newVal = clipped[i] + add;
      if (newVal > clipLimit) {
        residual = newVal - clipLimit;
        clipped[i] = clipLimit;
      } else {
        clipped[i] = newVal;
        residual = 0;
      }
    }
  }
  return clipped;
}

/**
 * Computes a CDF-based mapping from a clipped histogram, using a Rayleigh
 * distribution as the target (matching MATLAB's 'Distribution', 'rayleigh').
 *
 * The Rayleigh CDF is: F(x) = 1 − exp(−x²/(2σ²))
 * MATLAB uses α = 0.4 (alpha parameter) as default for adapthisteq Rayleigh.
 */
function computeRayleighMapping(hist: Float64Array, numPixels: number): Uint8Array {
  const mapping = new Uint8Array(256);
  const numBins = 256;

  // Compute the CDF from the clipped histogram
  const cdf = new Float64Array(numBins);
  cdf[0] = hist[0];
  for (let i = 1; i < numBins; i++) {
    cdf[i] = cdf[i - 1] + hist[i];
  }

  // Normalize CDF to [0, 1]
  const total = cdf[numBins - 1];
  if (total === 0) {
    for (let i = 0; i < numBins; i++) mapping[i] = i;
    return mapping;
  }

  for (let i = 0; i < numBins; i++) {
    cdf[i] /= total;
  }

  // Rayleigh inverse CDF: F⁻¹(p) = σ * √(−2 * ln(1 − p))
  // MATLAB's default alpha for Rayleigh in adapthisteq is 0.4
  const alpha = 0.4;
  for (let i = 0; i < numBins; i++) {
    const p = Math.min(cdf[i], 0.9999); // Clamp to avoid log(0)
    const rayleighVal = alpha * Math.sqrt(-2 * Math.log(1 - p));
    // Scale to [0, 255]
    mapping[i] = Math.min(255, Math.max(0, Math.round(rayleighVal * 255)));
  }

  return mapping;
}

/**
 * Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) with
 * Rayleigh distribution mapping to a single-channel image.
 *
 * Parameters match MATLAB's adapthisteq defaults:
 *   - NumTiles: [8, 8]
 *   - ClipLimit: 0.02
 *   - Distribution: 'rayleigh'
 */
function applyCLAHE(
  channel: Uint8Array,
  width: number,
  height: number,
  clipLimitNorm: number = 0.02,
  numTilesX: number = 8,
  numTilesY: number = 8,
): Uint8Array {
  const result = new Uint8Array(channel.length);

  // Tile dimensions (integer, with remainder handled by clamping)
  const tileW = Math.floor(width / numTilesX);
  const tileH = Math.floor(height / numTilesY);
  const numPixelsPerTile = tileW * tileH;

  // Actual clip limit in histogram counts
  const clipLimit = Math.max(1, Math.round(clipLimitNorm * numPixelsPerTile));

  // Compute per-tile mappings
  const mappings: Uint8Array[][] = [];
  for (let ty = 0; ty < numTilesY; ty++) {
    mappings[ty] = [];
    for (let tx = 0; tx < numTilesX; tx++) {
      const startX = tx * tileW;
      const startY = ty * tileH;
      const actualTileW = Math.min(tileW, width - startX);
      const actualTileH = Math.min(tileH, height - startY);

      const hist = computeHistogram(channel, width, startX, startY, actualTileW, actualTileH);
      const clippedHist = clipHistogram(hist, clipLimit);
      mappings[ty][tx] = computeRayleighMapping(clippedHist, actualTileW * actualTileH);
    }
  }

  // Apply bilinear interpolation between tile centers
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = channel[y * width + x];

      // Determine which tile centers we're between
      const txf = (x / tileW) - 0.5;
      const tyf = (y / tileH) - 0.5;

      const tx1 = Math.max(0, Math.floor(txf));
      const tx2 = Math.min(numTilesX - 1, tx1 + 1);
      const ty1 = Math.max(0, Math.floor(tyf));
      const ty2 = Math.min(numTilesY - 1, ty1 + 1);

      // Interpolation weights
      const fx = Math.max(0, Math.min(1, txf - tx1));
      const fy = Math.max(0, Math.min(1, tyf - ty1));

      // Bilinear interpolation of the 4 surrounding tile mappings
      const v11 = mappings[ty1][tx1][pixel];
      const v12 = mappings[ty1][tx2][pixel];
      const v21 = mappings[ty2][tx1][pixel];
      const v22 = mappings[ty2][tx2][pixel];

      const top = v11 * (1 - fx) + v12 * fx;
      const bottom = v21 * (1 - fx) + v22 * fx;
      const interpolated = top * (1 - fy) + bottom * fy;

      result[y * width + x] = Math.min(255, Math.max(0, Math.round(interpolated)));
    }
  }

  return result;
}

/**
 * Applies a 3×3 median filter to a single-channel image.
 * Matches MATLAB's medfilt2(channel, [3 3]).
 */
function medianFilter3x3(channel: Uint8Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(channel.length);
  const window: number[] = new Array(9);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          window[k++] = channel[ny * width + nx];
        }
      }
      // Sort the 9 values and take the median (index 4)
      window.sort((a, b) => a - b);
      result[y * width + x] = window[4];
    }
  }
  return result;
}

/* ─── Public API ────────────────────────────────────────── */

export interface PreprocessedResult {
  /** Preprocessed image as a Blob (PNG), ready for API upload */
  processedBlob: Blob;
  /** Object URL for the preprocessed image (for display in CLAHE view) */
  processedUrl: string;
  /** Object URL for the original image */
  originalUrl: string;
}

/**
 * Preprocesses a retinal fundus image to match the MATLAB training pipeline:
 *   1. Resize to 224×224
 *   2. Extract green channel
 *   3. Apply Rayleigh CLAHE (clipLimit=0.02)
 *   4. Apply 3×3 median filter
 *   5. Replace green channel, output as PNG
 *
 * @param input — The raw image file from the user
 * @param targetSize — Target dimension (default 224, matching ResNet-50)
 * @returns PreprocessedResult with the processed Blob and display URLs
 */
export async function preprocessForModel(
  input: File | Blob,
  targetSize: number = 224,
): Promise<PreprocessedResult> {
  const img = await loadImage(input);
  const originalUrl = URL.createObjectURL(input);

  // Step 1: Resize to target dimensions
  const { canvas, ctx, data } = imageToCanvas(img, targetSize, targetSize);
  const pixels = data.data; // RGBA flat array

  // Step 2: Extract green channel
  const numPixels = targetSize * targetSize;
  const greenChannel = new Uint8Array(numPixels);
  for (let i = 0; i < numPixels; i++) {
    greenChannel[i] = pixels[i * 4 + 1]; // G component
  }

  // Step 3: Apply Rayleigh CLAHE
  const claheGreen = applyCLAHE(greenChannel, targetSize, targetSize, 0.02);

  // Step 4: Apply 3×3 median filter (denoising)
  const denoisedGreen = medianFilter3x3(claheGreen, targetSize, targetSize);

  // Step 5: Replace green channel back into the image
  for (let i = 0; i < numPixels; i++) {
    pixels[i * 4 + 1] = denoisedGreen[i]; // Replace G
  }

  ctx.putImageData(data, 0, 0);

  // Convert canvas to PNG Blob
  const processedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export preprocessed image as PNG."));
      },
      "image/png",
      1.0,
    );
  });

  const processedUrl = URL.createObjectURL(processedBlob);

  // Clean up the loaded image's object URL
  URL.revokeObjectURL(img.src);

  return { processedBlob, processedUrl, originalUrl };
}

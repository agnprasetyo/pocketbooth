// Zero-dependency pure JavaScript GIF89a encoder for slide loops
// Supports 256-color adaptive median-cut quantization & LZW compression

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generatePhotoboothGif(
  photoDataUrls,
  filterCss = 'none',
  { title = 'POCKETBOOTH', dateStr = '' } = {}
) {
  const width = 600;
  const height = 450;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const validUrls = photoDataUrls.filter(Boolean);
  if (validUrls.length === 0) return null;

  const frames = [];

  for (let i = 0; i < validUrls.length; i++) {
    const dataUrl = validUrls[i];
    const img = await loadImage(dataUrl);

    ctx.clearRect(0, 0, width, height);

    // Apply Filter to photo
    if (filterCss && filterCss !== 'none') {
      ctx.filter = filterCss;
    } else {
      ctx.filter = 'none';
    }
    ctx.drawImage(img, 0, 0, width, height);

    // Reset filter for UI overlay
    ctx.filter = 'none';

    // Bottom Stamp Gradient Overlay
    const grad = ctx.createLinearGradient(0, height - 55, 0, height);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height - 55, width, 55);

    // Stamp Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
    const label = dateStr ? `${title} • ${dateStr}` : title;
    ctx.fillText(label, 16, height - 16);

    // Slot badge
    const slotBadge = `${String(i + 1).padStart(2, '0')} / ${String(validUrls.length).padStart(2, '0')}`;
    ctx.font = 'bold 11px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
    const badgeWidth = ctx.measureText(slotBadge).width;
    ctx.fillText(slotBadge, width - badgeWidth - 16, height - 16);

    frames.push(ctx.getImageData(0, 0, width, height));
  }

  return createGif(frames, { width, height, delay: 550 });
}

export function createGif(frames, { width, height, delay = 500 }) {
  const delayHundredths = Math.round(delay / 10);
  const chunks = [];

  const writeByte = (b) => chunks.push(b & 0xff);
  const writeWord = (w) => {
    chunks.push(w & 0xff);
    chunks.push((w >> 8) & 0xff);
  };
  const writeBytes = (arr) => {
    for (let i = 0; i < arr.length; i++) chunks.push(arr[i] & 0xff);
  };

  // 1. Header & Logical Screen Descriptor
  writeBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // 'GIF89a'
  writeWord(width);
  writeWord(height);
  writeByte(0x70); // No global color table, 8-bit color resolution
  writeByte(0x00); // Background color index
  writeByte(0x00); // Pixel aspect ratio

  // 2. Netscape 2.0 Loop Extension (Infinite Loop)
  writeBytes([
    0x21, 0xff, 0x0b, // Extension & block size 11
    0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, // 'NETSCAPE2.0'
    0x03, 0x01, // Sub-block size & ID
    0x00, 0x00, // Loop count: 0 = infinite
    0x00 // Terminator
  ]);

  // 3. Encode Each Frame
  for (let f = 0; f < frames.length; f++) {
    const frame = frames[f];
    const pixelData = frame.data || frame;
    const frameDelay = typeof frame.delay === 'number' ? frame.delay : delay;
    const frameDelayHundredths = Math.max(2, Math.round(frameDelay / 10));
    const { palette, indexedPixels } = quantizeFrame(pixelData, width * height);

    // Graphic Control Extension
    writeBytes([
      0x21, 0xf9, 0x04,
      0x04, // Disposal method: 1 (Do not dispose / overwrite), no transparency
      frameDelayHundredths & 0xff,
      (frameDelayHundredths >> 8) & 0xff,
      0x00, // Transparent color index
      0x00 // Terminator
    ]);

    // Image Descriptor
    writeByte(0x2c); // ','
    writeWord(0); // Left
    writeWord(0); // Top
    writeWord(width);
    writeWord(height);
    writeByte(0x87); // Local color table flag, 256 colors (2^(7+1))

    // Local Color Table (256 * 3 = 768 bytes)
    for (let i = 0; i < 256; i++) {
      const color = palette[i] || [0, 0, 0];
      writeByte(color[0]);
      writeByte(color[1]);
      writeByte(color[2]);
    }

    // Image Data (LZW Encoded)
    encodeLZW(indexedPixels, 8, writeByte);
  }

  // 4. Trailer
  writeByte(0x3b); // ';'

  return new Blob([new Uint8Array(chunks)], { type: 'image/gif' });
}

// Adaptive Median-Cut 256-Color Quantizer
function quantizeFrame(rgba, pixelCount) {
  // 1. Build histogram of 15-bit colors (5 bits per channel)
  const hist = new Map();

  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    hist.set(key, (hist.get(key) || 0) + 1);
  }

  const distinctColors = [];
  hist.forEach((count, key) => {
    distinctColors.push({
      r: ((key >> 10) & 0x1f) << 3,
      g: ((key >> 5) & 0x1f) << 3,
      b: (key & 0x1f) << 3,
      count
    });
  });

  // 2. Median Cut into 256 buckets
  let boxes = [distinctColors];
  while (boxes.length < 256) {
    let bestBoxIdx = -1;
    let maxRange = -1;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.length <= 1) continue;

      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (let j = 0; j < box.length; j++) {
        const c = box[j];
        if (c.r < minR) minR = c.r;
        if (c.r > maxR) maxR = c.r;
        if (c.g < minG) minG = c.g;
        if (c.g > maxG) maxG = c.g;
        if (c.b < minB) minB = c.b;
        if (c.b > maxB) maxB = c.b;
      }

      const range = Math.max(maxR - minR, maxG - minG, maxB - minB);
      if (range > maxRange) {
        maxRange = range;
        bestBoxIdx = i;
      }
    }

    if (bestBoxIdx === -1 || maxRange <= 0) break;

    const boxToSplit = boxes[bestBoxIdx];
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (let j = 0; j < boxToSplit.length; j++) {
      const c = boxToSplit[j];
      if (c.r < minR) minR = c.r;
      if (c.r > maxR) maxR = c.r;
      if (c.g < minG) minG = c.g;
      if (c.g > maxG) maxG = c.g;
      if (c.b < minB) minB = c.b;
      if (c.b > maxB) maxB = c.b;
    }

    const rRange = maxR - minR;
    const gRange = maxG - minG;
    const bRange = maxB - minB;

    let sortKey = 'r';
    if (gRange >= rRange && gRange >= bRange) sortKey = 'g';
    else if (bRange >= rRange && bRange >= gRange) sortKey = 'b';

    boxToSplit.sort((a, b) => a[sortKey] - b[sortKey]);
    const mid = Math.floor(boxToSplit.length / 2);
    boxes.splice(bestBoxIdx, 1, boxToSplit.slice(0, mid), boxToSplit.slice(mid));
  }

  // 3. Compute palette averages
  const palette = [];
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;
    for (let j = 0; j < box.length; j++) {
      const c = box[j];
      totalR += c.r * c.count;
      totalG += c.g * c.count;
      totalB += c.b * c.count;
      totalWeight += c.count;
    }
    if (totalWeight > 0) {
      palette.push([
        Math.round(totalR / totalWeight),
        Math.round(totalG / totalWeight),
        Math.round(totalB / totalWeight)
      ]);
    } else {
      palette.push([0, 0, 0]);
    }
  }

  while (palette.length < 256) {
    palette.push([0, 0, 0]);
  }

  // 4. Map each 15-bit color to closest palette entry (LUT)
  const lut = new Uint8Array(32768);
  const colorCount = palette.length;

  hist.forEach((_, key) => {
    const r = ((key >> 10) & 0x1f) << 3;
    const g = ((key >> 5) & 0x1f) << 3;
    const b = (key & 0x1f) << 3;

    let bestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < colorCount; i++) {
      const p = palette[i];
      const dr = r - p[0];
      const dg = g - p[1];
      const db = b - p[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        bestIdx = i;
        if (dist === 0) break;
      }
    }
    lut[key] = bestIdx;
  });

  // 5. Build indexed pixels
  const indexedPixels = new Uint8Array(pixelCount);
  let pIdx = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    indexedPixels[pIdx++] = lut[key];
  }

  return { palette, indexedPixels };
}

// LZW Compressor for GIF89a
function encodeLZW(pixels, minCodeSize, writeByte) {
  writeByte(minCodeSize);

  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = clearCode + 2;

  let curBits = 0;
  let curBitLength = 0;

  const blockBuffer = [];
  const flushBlock = () => {
    if (blockBuffer.length > 0) {
      writeByte(blockBuffer.length);
      for (let i = 0; i < blockBuffer.length; i++) {
        writeByte(blockBuffer[i]);
      }
      blockBuffer.length = 0;
    }
  };

  const writeCode = (code) => {
    curBits |= (code & 0xfff) << curBitLength;
    curBitLength += codeSize;

    while (curBitLength >= 8) {
      blockBuffer.push(curBits & 0xff);
      if (blockBuffer.length === 255) flushBlock();
      curBits >>>= 8;
      curBitLength -= 8;
    }
  };

  const table = new Map();
  const resetTable = () => {
    table.clear();
    codeSize = minCodeSize + 1;
    nextCode = clearCode + 2;
  };

  writeCode(clearCode);

  let prefix = pixels[0];
  for (let i = 1; i < pixels.length; i++) {
    const k = pixels[i];
    const key = (prefix << 8) | k;

    if (table.has(key)) {
      prefix = table.get(key);
    } else {
      writeCode(prefix);

      if (nextCode < 4095) {
        table.set(key, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeCode(clearCode);
        resetTable();
      }

      prefix = k;
    }
  }

  writeCode(prefix);
  writeCode(eoiCode);

  while (curBitLength > 0) {
    blockBuffer.push(curBits & 0xff);
    curBits >>>= 8;
    curBitLength -= 8;
    if (blockBuffer.length === 255) flushBlock();
  }
  flushBlock();
  writeByte(0x00); // Block terminator
}

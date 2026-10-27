const fs = require('fs');
const zlib = require('zlib');

// PNG file format:
// 8 bytes signature
// Chunks: 4 bytes length, 4 bytes type, data, 4 bytes CRC
function makeTransparentPng(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  let pos = 8;
  let ihdr, idatChunks = [];
  
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12]
      };
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
    pos += 12 + len;
  }
  
  console.log('IHDR:', ihdr);
  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);
  
  // Each scanline: 1 byte filter + width * 4 (if RGBA)
  const w = ihdr.width;
  const h = ihdr.height;
  const stride = 1 + w * 4;
  
  for (let y = 0; y < h; y++) {
    const lineStart = y * stride;
    // scanline filter type is decompressed[lineStart]
    for (let x = 0; x < w; x++) {
      const px = lineStart + 1 + x * 4;
      const r = decompressed[px];
      const g = decompressed[px + 1];
      const b = decompressed[px + 2];
      
      // If near white, make transparent
      if (r > 240 && g > 240 && b > 240) {
        decompressed[px + 3] = 0; // Alpha = 0
      } else {
        // Smooth anti-aliasing edges:
        // If brightness is high, adjust alpha
        const brightness = (r + g + b) / 3;
        if (brightness > 200) {
          const factor = (255 - brightness) / 55;
          decompressed[px + 3] = Math.round(255 * Math.min(1, Math.max(0, factor)));
        }
      }
    }
  }
  
  // Recompress
  // Note: changing scanline data with original filter may have slight filter difference if filter != 0,
  // but if filter is 0 (None) it is exact. Let's check filter types:
  let hasNonZeroFilter = false;
  for (let y = 0; y < h; y++) {
    if (decompressed[y * stride] !== 0) hasNonZeroFilter = true;
  }
  console.log('Has non-zero filter:', hasNonZeroFilter);
}

makeTransparentPng('assets/jim_logo_script.png', 'assets/jim_logo_script_transparent.png');


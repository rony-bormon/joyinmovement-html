const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0);
}

function removeWhiteBg(inputPath, outputPath) {
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
      };
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
    pos += 12 + len;
  }

  const w = ihdr.width;
  const h = ihdr.height;
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  
  // Unfilter to standard RGBA array
  const uncompressedStride = 1 + w * 4;
  const rgba = Buffer.alloc(w * h * 4);
  
  for (let y = 0; y < h; y++) {
    const filter = raw[y * uncompressedStride];
    const srcLine = y * uncompressedStride + 1;
    const dstLine = y * w * 4;
    const prevDstLine = (y - 1) * w * 4;
    
    for (let x = 0; x < w * 4; x++) {
      let val = raw[srcLine + x];
      let a = (x >= 4) ? rgba[dstLine + x - 4] : 0;
      let b = (y > 0) ? rgba[prevDstLine + x] : 0;
      let c = (x >= 4 && y > 0) ? rgba[prevDstLine + x - 4] : 0;
      
      if (filter === 1) val = (val + a) & 0xFF;
      else if (filter === 2) val = (val + b) & 0xFF;
      else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xFF;
      else if (filter === 4) {
        let p = a + b - c;
        let pa = Math.abs(p - a);
        let pb = Math.abs(p - b);
        let pc = Math.abs(p - c);
        let pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (val + pr) & 0xFF;
      }
      rgba[dstLine + x] = val;
    }
  }

  // Remove white background and crop bounding box
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = rgba[idx];
      const g = rgba[idx + 1];
      const b = rgba[idx + 2];
      
      // If pixel is near white
      if (r > 230 && g > 230 && b > 230) {
        rgba[idx + 3] = 0;
      } else {
        // Red color preservation:
        // Calculate transparency for smooth antialiasing
        const maxCh = Math.max(r, g, b);
        const minCh = Math.min(r, g, b);
        // Logo is vibrant red: r ~ 240, g ~ 78, b ~ 55
        // Edge pixels blend towards white
        if (g > 100 || b > 80) {
          const redness = r - Math.max(g, b);
          if (redness < 15) {
            rgba[idx + 3] = 0;
          } else {
            const alpha = Math.min(255, Math.max(0, redness * 2));
            rgba[idx + 3] = Math.round(alpha);
            rgba[idx] = 240;
            rgba[idx + 1] = 78;
            rgba[idx + 2] = 55;
          }
        }
        if (rgba[idx + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  console.log(`Bounding box: x=${minX}..${maxX}, y=${minY}..${maxY}`);
  // Add 10px padding around bbox
  minX = Math.max(0, minX - 10);
  maxX = Math.min(w - 1, maxX + 10);
  minY = Math.max(0, minY - 10);
  maxY = Math.min(h - 1, maxY + 10);
  
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`Cropped size: ${cropW} x ${cropH}`);

  // Create filtered buffer with filter 0 (None)
  const outStride = 1 + cropW * 4;
  const outBuf = Buffer.alloc(cropH * outStride);
  
  for (let cy = 0; cy < cropH; cy++) {
    const outLine = cy * outStride;
    outBuf[outLine] = 0; // Filter None
    const inLine = (minY + cy) * w * 4 + minX * 4;
    rgba.copy(outBuf, outLine + 1, inLine, inLine + cropW * 4);
  }

  const deflated = zlib.deflateSync(outBuf);

  // Write PNG
  const chunks = [];
  // PNG signature
  chunks.push(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));

  // IHDR
  const ihdrChunk = Buffer.alloc(13);
  ihdrChunk.writeUInt32BE(cropW, 0);
  ihdrChunk.writeUInt32BE(cropH, 4);
  ihdrChunk[8] = 8; // bit depth
  ihdrChunk[9] = 6; // RGBA
  ihdrChunk[10] = 0; // compression
  ihdrChunk[11] = 0; // filter
  ihdrChunk[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const b = Buffer.alloc(8 + len + 4);
    b.writeUInt32BE(len, 0);
    b.write(type, 4, 4, 'ascii');
    data.copy(b, 8);
    const crcVal = crc32(b.slice(4, 8 + len));
    b.writeUInt32BE(crcVal, 8 + len);
    return b;
  }

  chunks.push(makeChunk('IHDR', ihdrChunk));
  chunks.push(makeChunk('IDAT', deflated));
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  fs.writeFileSync(outputPath, Buffer.concat(chunks));
  console.log(`Saved transparent PNG: ${outputPath} (${cropW}x${cropH})`);
}

removeWhiteBg('assets/jim_logo_script.png', 'assets/jim_logo_script.png');

